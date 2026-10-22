import assert from 'node:assert/strict';
import {Client} from 'pg';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {applyIntegrationProfile,assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applyServiceProfile,provisionServiceAccess,adoptOAuthClients,type ServicePrincipal} from '../../packages/db/src/serviceAccess';
import {assertExactRegistryParity} from '../../packages/db/src/registryParity';
import {rehearseRollbackRuntime} from './rollbackRuntime';
const source=new URL(process.env.DATABASE_URL!);
assert(['localhost','127.0.0.1'].includes(source.hostname)&&/^\/sam_core_test/.test(source.pathname));
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
async function main(){
 const admin=new Client({connectionString:source.href});await admin.connect();
 const operator='render_operator_'+process.pid,db='sam_core_test_operator_'+process.pid,roles=['op_runtime_','op_mcp_'].map(x=>x+process.pid);
 let c:Client|undefined;const services:Client[]=[];let created=false;
 try{
  // Bootstrap administrator only creates the synthetic operator/database; it
  // does not migrate, provision, query application data or bypass FORCE RLS.
  await admin.query(`CREATE ROLE ${operator} LOGIN PASSWORD 'synthetic-operator-only' NOSUPERUSER NOBYPASSRLS CREATEDB CREATEROLE INHERIT`);
  await admin.query(`CREATE DATABASE ${db} OWNER ${operator}`);created=true;
  const u=new URL(source);u.pathname='/'+db;u.username=operator;u.password='synthetic-operator-only';u.search='';
  c=new Client({connectionString:u.href});await c.connect();
  const flags=(await c.query('SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolinherit FROM pg_roles WHERE rolname=current_user')).rows[0];
  assert.deepEqual(flags,{rolsuper:false,rolbypassrls:false,rolcreatedb:true,rolcreaterole:true,rolinherit:true});
  assert.deepEqual((await c.query("SELECT rolname FROM pg_roles WHERE rolname<>current_user AND pg_has_role(current_user,oid,'MEMBER') ORDER BY rolname")).rows.map(r=>r.rolname),['pg_database_owner']);
  const moved=['00011_mcp_internal_oauth.sql','00099_sam_google_oauth.sql','00100_sam_google_oauth_runtime.sql','00101_goal_read_reviews.sql'];
  await c.query('CREATE TABLE sam_schema_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
  for(const filename of [...readdirSync('packages/db/migrations').filter(f=>Number(f.slice(0,5))<=10),...moved].sort()){
   const sql=readFileSync('packages/db/'+(moved.includes(filename)?'integration-migrations/':'migrations/')+filename,'utf8');await c.query(sql);await c.query('INSERT INTO sam_schema_migrations(filename,sha256) VALUES($1,$2)',[filename,hash(sql)]);
  }
  const org=randomUUID(),entity=randomUUID(),foreignOrg=randomUUID(),foreignEntity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'operator A'),($2,'operator B')",[org,foreignOrg]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'A'),($3,$4,'B')",[entity,org,foreignEntity,foreignOrg]);
  await c.query("INSERT INTO mcp_oauth_clients(client_id,redirect_uris) VALUES('operator-retained',ARRAY['https://fixture.invalid/cb'])");
  const migrate=()=>{const r=spawnSync(process.execPath,['packages/db/src/migrate.js','--apply'],{env:{PATH:process.env.PATH,DATABASE_URL:u.href},encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);};
  migrate();await applyIntegrationProfile(c as any);await applyServiceProfile(c as any);
  assert.equal((await c.query("SELECT count(*)::int n FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r' AND relowner<>(SELECT oid FROM pg_roles WHERE rolname=current_user)")).rows[0].n,0);
  for(const role of roles)await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'synthetic-service-only' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE`);
  const p=(i:number):ServicePrincipal=>({schema:'public',role:roles[i],kind:i?'mcp':'runtime',orgId:org,legalEntityId:entity,googleOwner:'operator-fixture',googleClient:'https://fixture.invalid/google/client.json',oauthResource:'https://fixture.invalid/mcp'});
  const context=async(o=org,e=entity)=>c!.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[o,e]);
  await c.query('BEGIN');await assert.rejects(provisionServiceAccess(c as any,p(0)),/SERVICE_OPERATOR_TENANT_CONTEXT_REQUIRED/);await c.query('ROLLBACK');
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_service_bindings')).rows[0].n,0);
  await c.query('BEGIN');await context(foreignOrg,foreignEntity);await assert.rejects(provisionServiceAccess(c as any,p(0)),/SERVICE_OPERATOR_TENANT_CONTEXT_REQUIRED/);await c.query('ROLLBACK');
  await c.query('BEGIN');await context();await adoptOAuthClients(c as any,{clientIds:['operator-retained'],orgId:org,legalEntityId:entity});await c.query('COMMIT');
  for(let i=0;i<2;i++){
   await c.query('BEGIN');try{await context();await provisionServiceAccess(c as any,p(i));await c.query('COMMIT');console.log('PROVISIONED',i?'MCP':'runtime');}catch(e){await c.query('ROLLBACK');throw e;}
  }
  // Local context cannot leak between operator transactions.
  assert.equal((await c.query('SELECT current_org_id() org')).rows[0].org,null);
  assert.equal((await c.query('SELECT count(*)::int n FROM legal_entities')).rows[0].n,0);
  await c.query('BEGIN');await context();
  assert.deepEqual((await c.query('SELECT id FROM legal_entities ORDER BY id')).rows.map(r=>r.id),[entity]);
  await assert.rejects(provisionServiceAccess(c as any,p(1)),/SERVICE_ROLE_ALREADY_BOUND/);
  await c.query('ROLLBACK');
  // Read exact registry through existing SELECT policies; no owner bypass.
  await c.query('BEGIN');await context();
  const rows=(await c.query('SELECT * FROM verification_contracts ORDER BY capability_id')).rows;
  assert(rows.length>0);
  const contracts=rows.map(r=>({capabilityId:r.capability_id,description:r.description,verificationMethod:r.verification_method,requiredEvidenceFields:r.required_evidence_fields,independentQueryTemplate:r.independent_query_template}));
  await assertExactRegistryParity(c as any,{models:[],contracts});await c.query('COMMIT');
  await assert.rejects(assertExactRegistryParity(c as any,{models:[],contracts}),/REGISTRY_EXACT/);
  // Database-owner is not a backup bypass: pg_dump's default row_security=off
  // semantics must fail rather than silently returning an incomplete backup.
  await c.query('BEGIN');await context();await c.query('SET LOCAL row_security=off');
  await assert.rejects(c.query('SELECT * FROM legal_entities'),/row-level security policy/);await c.query('ROLLBACK');
  migrate();await applyIntegrationProfile(c as any);await applyServiceProfile(c as any);
  const forced=(await c.query("SELECT relname FROM pg_class WHERE relnamespace='public'::regnamespace AND relforcerowsecurity ORDER BY relname")).rows;
  assert(forced.length>=27);assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,16);
  const urls:string[]=[];
  for(let i=0;i<2;i++){
   const serviceUrl=new URL(u);serviceUrl.username=roles[i];serviceUrl.password='synthetic-service-only';serviceUrl.searchParams.set('options',`-c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);urls.push(serviceUrl.href);
   const service=new Client({connectionString:serviceUrl.href});await service.connect();services.push(service);await assertIntegrationAccess(service as any);
   await service.query('BEGIN');await service.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[foreignOrg,foreignEntity]);
   assert.equal((await service.query('SELECT count(*)::int n FROM legal_entities')).rows[0].n,0);await assert.rejects(assertIntegrationAccess(service as any),/FIXED_TENANT_POLICY/);await service.query('ROLLBACK');
  }
  await rehearseRollbackRuntime(urls);
  assert.deepEqual((await c.query("SELECT relname FROM pg_class WHERE relnamespace='public'::regnamespace AND relforcerowsecurity ORDER BY relname")).rows,forced);
  assert.deepEqual((await c.query('SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolinherit FROM pg_roles WHERE rolname=current_user')).rows[0],flags);
  assert.deepEqual((await c.query("SELECT rolname FROM pg_roles WHERE rolname<>current_user AND pg_has_role(current_user,oid,'MEMBER') ORDER BY rolname")).rows.map(r=>r.rolname),['pg_database_owner']);
  console.log('OPERATOR_PROVISIONING PASS: constrained owning operator; 14→16/8/1; sequential runtime/MCP; explicit local tenant; missing/wrong tenant denied; repeat inspection/restart; registry parity; unchanged PR50 recovery; FORCE RLS retained; default full backup fails closed');
 }finally{
  for(const s of services)await s.end();if(c)await c.end();
  if(created)await admin.query(`DROP DATABASE ${db} WITH (FORCE)`);
  for(const role of roles)await admin.query(`DROP ROLE IF EXISTS ${role}`);await admin.query(`DROP ROLE IF EXISTS ${operator}`);await admin.end();
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
