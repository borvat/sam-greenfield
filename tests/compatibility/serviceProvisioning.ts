import assert from 'node:assert/strict';
import {Pool,Client} from 'pg';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync,readdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {rehearseRollbackRuntime} from './rollbackRuntime';
import {consumeApproval} from '../../packages/db/src/approvals';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {applyIntegrationProfile,assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applyServiceProfile,provisionServiceAccess,adoptOAuthClients,type ServicePrincipal} from '../../packages/db/src/serviceAccess';
import {assertExactRegistryParity} from '../../packages/db/src/registryParity';
import {postgresOAuthStore} from '../../apps/mcp/src/internalOAuth';
import {PostgresSamGoogleOauthStore} from '../../apps/production/src/samGoogleOauthPostgres';
import {sealSamGoogleToken} from '../../apps/production/src/samGoogleTokenCrypto';
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
const url=new URL(process.env.DATABASE_URL!);
assert(['127.0.0.1','localhost'].includes(url.hostname)&&/^\/sam_core_test/.test(url.pathname));
const moved=['00011_mcp_internal_oauth.sql','00099_sam_google_oauth.sql','00100_sam_google_oauth_runtime.sql','00101_goal_read_reviews.sql'];
async function main(){
 const admin=new Client({connectionString:url.href});await admin.connect();
 const schema='service_'+randomUUID().replaceAll('-',''),roles=['worker','mcp','foreign'].map(x=>'svc_'+x+'_'+process.pid);
 const clients:Pool[]=[];const dir=mkdtempSync(join(tmpdir(),'sam-service-rehearsal-'));let c:Client|undefined;
 try{
  await admin.query('CREATE SCHEMA '+schema);
  const scoped=new URL(url);scoped.searchParams.set('options','-c search_path='+schema+',public');c=new Client({connectionString:scoped.href});await c.connect();
  await c.query('CREATE TABLE sam_schema_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
  for(const filename of [...readdirSync('packages/db/migrations').filter(f=>Number(f.slice(0,5))<=10),...moved].sort()){
   const sql=readFileSync('packages/db/'+(moved.includes(filename)?'integration-migrations/':'migrations/')+filename,'utf8');await c.query(sql);await c.query('INSERT INTO sam_schema_migrations(filename,sha256) VALUES($1,$2)',[filename,hash(sql)]);
  }
  const org=randomUUID(),entity=randomUUID(),orgB=randomUUID(),entityB=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic A'),($2,'Synthetic B')",[org,orgB]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'A'),($3,$4,'B')",[entity,org,entityB,orgB]);
  await c.query("INSERT INTO mcp_oauth_clients(client_id,redirect_uris) VALUES('retained-client',ARRAY['https://fixture.invalid/cb']),('unmapped-client',ARRAY['https://fixture.invalid/cb'])");
  const oldStamp=(await c.query('SELECT filename,sha256,applied_at FROM sam_schema_migrations ORDER BY filename')).rows;
  // Transactional rehearsal of the reviewed legacy mapping, before FORCE RLS.
  const migrate=()=>{const r=spawnSync(process.execPath,['packages/db/src/migrate.js','--apply'],{env:{PATH:process.env.PATH,DATABASE_URL:scoped.href},encoding:'utf8',timeout:30000});assert.equal(r.status,0,r.stdout+r.stderr);return r.stdout;};
  migrate();await applyIntegrationProfile(c as any);await applyServiceProfile(c as any);
  assert(!/^APPLY /m.test(migrate()));await applyIntegrationProfile(c as any);await applyServiceProfile(c as any);
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,16);
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_integration_migrations')).rows[0].n,8);
  assert.deepEqual((await c.query('SELECT filename,sha256,applied_at FROM sam_schema_migrations WHERE filename=ANY($1::text[]) ORDER BY filename',[oldStamp.map(x=>x.filename)])).rows,oldStamp);
  assert.equal((await c.query("SELECT count(*)::int n FROM mcp_oauth_clients WHERE client_id='retained-client'")).rows[0].n,1);
  for(const role of roles)await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'synthetic-provisioning-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);
  const principal=(i:number):ServicePrincipal=>({schema,role:roles[i],kind:i===0?'runtime':'mcp',orgId:i===2?orgB:org,legalEntityId:i===2?entityB:entity,googleOwner:i===2?'owner-b':'owner-a',googleClient:`https://fixture-${i===2?'b':'a'}.invalid/google/oauth/client.json`,oauthResource:`https://fixture-${i===2?'b':'a'}.invalid/mcp`});
  await c.query('BEGIN');await adoptOAuthClients(c as any,{clientIds:['retained-client'],orgId:org,legalEntityId:entity});await c.query('COMMIT');
  for(let i=0;i<3;i++){await c.query('BEGIN');try{await provisionServiceAccess(c as any,principal(i));await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}}
  for(let i=0;i<3;i++){
   const p=principal(i),u=new URL(scoped);u.username=p.role;u.password='synthetic-provisioning-only';u.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${p.orgId} -c app.current_legal_entity_id=${p.legalEntityId}`);
   const db=new Pool({connectionString:u.href,max:2});clients.push(db);const client=await db.connect();try{await assertIntegrationAccess(client);}finally{client.release();}
   for(const sql of ['SELECT * FROM sam_service_bindings','SELECT * FROM sam_schema_migrations','UPDATE model_providers SET health=health','DELETE FROM goals','TRUNCATE goals','CREATE TABLE forbidden(id int)'])await assert.rejects(db.query(sql),/permission denied/);
   const acl=(await db.query(`SELECT bool_or(has_table_privilege(oid,'TRUNCATE') OR has_table_privilege(oid,'TRIGGER')) bad FROM pg_class WHERE relnamespace=to_regnamespace(current_schema()) AND relkind='r'`)).rows[0];assert.equal(acl.bad,false);
  }
  const [worker,mcp,foreign]=clients,pa=principal(1),pb=principal(2);
  const pending=(await mcp.query("INSERT INTO approvals(capability_id,params_hash,legal_entity_id,expiry_at,authority_class,status) VALUES('fixture.write',$1,$2,now()+interval '1 hour','YELLOW','PENDING') RETURNING id",[sha256Hex({fixture:true}),entity])).rows[0].id;
  assert.equal((await mcp.query("UPDATE approvals SET status='APPROVED' WHERE id=$1",[pending])).rowCount,0);
  await assert.rejects(mcp.query("INSERT INTO approvals(capability_id,params_hash,legal_entity_id,expiry_at,authority_class,status) VALUES('self.approve','x',$1,now()+interval '1 hour','YELLOW','APPROVED')",[entity]),/row-level security/);
  await c.query("UPDATE approvals SET status='APPROVED',approved_by='synthetic-owner' WHERE id=$1",[pending]);
  await assert.rejects(worker.query('UPDATE approvals SET used_count=0 WHERE id=$1',[pending]),/SERVICE_APPROVAL_CONSUMPTION_INVALID/);
  const approvalClient=await worker.connect();try{
   await approvalClient.query('BEGIN');await consumeApproval(approvalClient,{capabilityId:'fixture.write',params:{fixture:true},legalEntityId:entity,authorityClass:'YELLOW'});await approvalClient.query('COMMIT');
   await assert.rejects(consumeApproval(approvalClient,{capabilityId:'fixture.write',params:{fixture:true},legalEntityId:entity,authorityClass:'YELLOW'}),/No matching live approval/);
  }finally{approvalClient.release();}
  assert.equal((await worker.query('SELECT status FROM approvals WHERE id=$1',[pending])).rows[0].status,'USED');

  const oauth=postgresOAuthStore(mcp),other=postgresOAuthStore(foreign);
  assert(await oauth.getClient('retained-client'));assert.equal(await oauth.getClient('unmapped-client'),undefined);assert.equal(await other.getClient('retained-client'),undefined);
  await oauth.addClient('registered-a',['https://fixture.invalid/cb']);await other.addClient('registered-b',['https://fixture.invalid/cb']);
  await assert.rejects(worker.query('SELECT * FROM mcp_oauth_clients'),/permission denied/);
  const expires=new Date(Date.now()+60000);
  await oauth.saveCode({code_hash:'synthetic-code',client_id:'registered-a',redirect_uri:'https://fixture.invalid/cb',challenge:'synthetic-challenge',scope:'sam:read',resource:pa.oauthResource,expires_at:expires});
  assert.equal(await other.consumeCode('synthetic-code','registered-a','https://fixture.invalid/cb','synthetic-challenge'),undefined);
  assert(await oauth.consumeCode('synthetic-code','registered-a','https://fixture.invalid/cb','synthetic-challenge'));
  assert.equal(await oauth.consumeCode('synthetic-code','registered-a','https://fixture.invalid/cb','synthetic-challenge'),undefined);
  await assert.rejects(oauth.saveCode({code_hash:'foreign-attempt',client_id:'registered-b',redirect_uri:'https://fixture.invalid/cb',challenge:'x',scope:'sam:read',resource:pa.oauthResource,expires_at:expires}),/row-level security/);
  await oauth.saveRefresh({token_hash:'old-fixture',client_id:'registered-a',scope:'sam:read',resource:pa.oauthResource,expires_at:expires});
  assert.equal(await oauth.rotateRefresh('old-fixture',{token_hash:'new-fixture',client_id:'registered-a',resource:pa.oauthResource,expires_at:expires}),'sam:read');
  assert.equal(await oauth.rotateRefresh('old-fixture',{token_hash:'replay-fixture',client_id:'registered-a',resource:pa.oauthResource,expires_at:expires}),undefined);
  const key=Buffer.alloc(32,7),store=new PostgresSamGoogleOauthStore(mcp,key),reader=new PostgresSamGoogleOauthStore(worker,key),foreignStore=new PostgresSamGoogleOauthStore(foreign,key);
  await store.saveRefresh({ownerId:pa.googleOwner,clientId:pa.googleClient,refreshToken:'synthetic-only-refresh'});
  await store.saveTools(pa.googleOwner,pa.googleClient,[{name:'search_drive_files',inputSchema:{type:'object'},annotations:{readOnlyHint:true}}]);
  assert.equal((await reader.tools(pa.googleOwner,pa.googleClient)).length,1);
  assert.equal(await reader.loadRefresh(pa.googleOwner,pa.googleClient),'synthetic-only-refresh');
  assert.equal(await foreignStore.loadRefresh(pa.googleOwner,pa.googleClient),undefined);
  await assert.rejects(reader.saveRefresh({ownerId:pa.googleOwner,clientId:pa.googleClient,refreshToken:'denied'}),/permission denied/);
  await assert.rejects(reader.saveTools(pa.googleOwner,pa.googleClient,[]),/permission denied/);
  await assert.rejects(worker.query('DELETE FROM sam_google_oauth_tokens'),/permission denied/);
  await assert.rejects(mcp.query('UPDATE sam_google_oauth_tokens SET owner_id=$1',['other']),/permission denied/);
  // Exercise the real cached-token path; no external OAuth network request.
  const sealed=sealSamGoogleToken('synthetic-only-access',key,'access:sam-google:'+pa.googleOwner+':'+pa.googleClient);
  await worker.query("UPDATE sam_google_oauth_tokens SET access_sealed=$1,access_expires_at=now()+interval '1 hour'",[sealed]);
  assert.equal(await reader.accessToken(pa.googleOwner,pa.googleClient),'synthetic-only-access');
  const stateHash='a'.repeat(64);await store.put(stateHash,{stateHash,verifier:'synthetic-verifier',redirectUri:'https://fixture-a.invalid/google/oauth/callback',createdAt:Date.now(),ownerId:pa.googleOwner,clientId:pa.googleClient});
  assert.equal(await foreignStore.take(stateHash),undefined);assert(await store.take(stateHash));assert.equal(await store.take(stateHash),undefined);
  await assert.rejects(reader.put('b'.repeat(64),{stateHash:'b'.repeat(64),verifier:'fixture',redirectUri:'https://fixture.invalid',createdAt:Date.now(),ownerId:pa.googleOwner,clientId:pa.googleClient}),/permission denied/);
  const sc=await mcp.connect();try{
   await sc.query('BEGIN');await sc.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[orgB,entityB]);
   assert.equal((await sc.query('SELECT * FROM sam_google_oauth_tokens')).rowCount,0);assert.equal((await sc.query('SELECT * FROM mcp_oauth_clients')).rowCount,0);
   await assert.rejects(assertIntegrationAccess(sc),/FIXED_TENANT_POLICY/);await sc.query('ROLLBACK');
  }finally{sc.release();}
  // This disposable fixture replaces seeded contracts with its explicit manifest.
  await c.query("DELETE FROM verification_contracts");
  await assertExactRegistryParity(worker,{models:[],contracts:[]});
  await c.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result) VALUES('fixture.read','Fixture','api_readback','{\"hash\":\"string\"}','{\"read\":true}',true)");
  const contracts=[{capabilityId:'fixture.read',description:'Fixture',verificationMethod:'api_readback' as const,requiredEvidenceFields:{hash:'string'},independentQueryTemplate:{read:true}}];
  await assertExactRegistryParity(worker,{models:[],contracts});
  await c.query("UPDATE verification_contracts SET must_not_trust_execution_result=false");await assert.rejects(assertExactRegistryParity(worker,{models:[],contracts}),/REGISTRY_EXACT/);
  await c.query("UPDATE verification_contracts SET must_not_trust_execution_result=true,independent_query_template='{}'");await assert.rejects(assertExactRegistryParity(worker,{models:[],contracts}),/REGISTRY_EXACT/);
  await c.query("UPDATE verification_contracts SET independent_query_template='{\"read\":true}'");
  await assertExactRegistryParity(worker,{models:[],contracts});
  const models=[{providerId:'fixture',models:['frozen'],capabilities:['read'],privacyClasses:['PUBLIC' as const],health:'HEALTHY' as const,costPer1kInput:0.1,costPer1kOutput:0.2}];
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,cost_per_1k_input,cost_per_1k_output,health) VALUES('fixture','["frozen"]','["read"]','["PUBLIC"]',0.1,0.2,'DOWN')`);
  await assertExactRegistryParity(worker,{models,contracts});
  assert.equal((await c.query("SELECT health FROM model_providers WHERE provider_id='fixture'")).rows[0].health,'DOWN');
  await assert.rejects(assertExactRegistryParity(worker,{models:[{...models[0],costPer1kOutput:0.3}],contracts}),/REGISTRY_EXACT/);
  await assert.rejects(assertExactRegistryParity(worker,{models:[],contracts}),/REGISTRY_EXACT/);
  await assert.rejects(assertExactRegistryParity(worker,{models:[...models,...models],contracts}),/REGISTRY_MANIFEST_DUPLICATE/);
  // Admission and stores survive a new process/session; no DDL on login.
  await rehearseRollbackRuntime(clients.map(db=>(db.options as any).connectionString));
  const fresh=await worker.connect();try{await assertIntegrationAccess(fresh);}finally{fresh.release();}
  assert.equal((await mcp.query("SELECT count(*)::int n FROM mcp_oauth_clients WHERE client_id='retained-client'")).rows[0].n,1);
  console.log('SERVICE_PROVISIONING PASS: deployed 14→16, integration adoption, preserved ledger timestamps/client, restart, restricted runtime/MCP, exact registry, scoped OAuth/Google stores, wrong tenant and denied writes; synthetic only');
 }finally{
  for(const db of clients)await db.end();if(c)await c.end();await admin.query('DROP SCHEMA IF EXISTS '+schema+' CASCADE');
  for(const role of roles)await admin.query('DROP ROLE IF EXISTS '+role);await admin.end();rmSync(dir,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
