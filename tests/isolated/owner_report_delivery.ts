/** Actual notification migration and worker SQL in disposable PGlite; injected providers only. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {withOwnerReportEmailFromEnv} from '../../apps/production/src/ownerReportEmailBundle';
import {evaluatePlanAuthority} from '../../apps/brain/src/authorityGuard';
import {consumeApproval} from '../../packages/db/src/approvals';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {runOwnerReportEmailTick,ownerReportEmailParams,type OwnerReportEmailBinding} from '../../apps/notifications/src/delivery';
import type {ReconciliableToolAdapter} from '../../packages/tool-gateway/src/types';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',
 O='33333333-3333-4333-8333-333333333333',G='44444444-4444-4444-8444-444444444444',
 N='55555555-5555-4555-8555-555555555555',R='66666666-6666-4666-8666-666666666666',X='77777777-7777-4777-8777-777777777777';
const binding:OwnerReportEmailBinding={legalEntityId:A,recipient:'ceo@suroohholdings.com',activatedAt:'2026-01-01T00:00:00.000Z',activationAuditId:X,dataClassification:'INTERNAL'};
async function fixture(){
 const sql=new PGlite();
 await sql.exec(`CREATE FUNCTION current_org_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_org_id')::uuid $$;
 CREATE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_legal_entity_id')::uuid $$;
 CREATE TABLE legal_entities(id UUID PRIMARY KEY,org_id UUID);
 CREATE TABLE goals(id UUID PRIMARY KEY,company_scope UUID,authority_ceiling TEXT);
 CREATE TABLE outbox_events(id UUID PRIMARY KEY);
 CREATE TABLE goal_read_reviews(id UUID PRIMARY KEY,goal_id UUID,report_hash TEXT,decision JSONB,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE audit_log(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),actor TEXT,source TEXT,action TEXT,entity_type TEXT,entity_id UUID,authority_class TEXT,result TEXT,after_ref JSONB,timestamp TIMESTAMPTZ DEFAULT now());
 CREATE TABLE approvals(id UUID DEFAULT gen_random_uuid(),capability_id TEXT,params_hash TEXT,legal_entity_id UUID,authority_class TEXT,goal_id UUID,status TEXT,expiry_at TIMESTAMPTZ,used_count INT DEFAULT 0,max_uses INT DEFAULT 1,used_at TIMESTAMPTZ,created_at TIMESTAMPTZ DEFAULT now());`);
 await sql.exec(readFileSync(new URL('../../packages/db/integration-migrations/00105_owner_notifications.sql',import.meta.url),'utf8'));
 await sql.query('INSERT INTO legal_entities VALUES($1,$3),($2,$3)',[A,B,O]);
 await sql.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[O,A]);
 await sql.query("INSERT INTO audit_log(id,action,entity_type,entity_id,authority_class,result,after_ref,timestamp) VALUES($1,'OWNER_REPORT_EMAIL_ENABLED','legal_entity',$2,'YELLOW','ENABLED',$3,now())",[X,A,{schema:'sam.owner_report_email.v1',recipient:binding.recipient,activatedAt:binding.activatedAt,dataClassification:'INTERNAL'}]);
 await sql.query("INSERT INTO goals VALUES($1,$2,'GREEN')",[G,A]);
 await sql.query('INSERT INTO goal_read_reviews(id,goal_id,report_hash,decision) VALUES($1,$2,$3,$4)',[R,G,'a'.repeat(64),{status:'complete',summary:'Synthetic bounded report'}]);
 await sql.query("INSERT INTO owner_notifications(id,legal_entity_id,goal_id,dedup_key,kind,severity,title,body) VALUES($1,$2,$3,'synthetic:one','COMPLETED','INFO','Synthetic',$4)",[N,A,G,{report:{id:R,hash:'a'.repeat(64)}}]);
 const params=ownerReportEmailParams({id:N,goal_id:G,report_id:R,report_hash:'a'.repeat(64),decision:{summary:'Synthetic bounded report'}},binding.recipient);

 // Serialize this single PGlite connection's transactions, as a real pool does per connection.
 let tail=Promise.resolve();
 const db={connect:async()=>{const prior=tail;let release!:()=>void;tail=new Promise(resolve=>release=resolve);await prior;return {release,query:async(text:string,args?:any[])=>{const r=await sql.query(text,args);return {...r,rowCount:r.rows.length||r.affectedRows}}}}};
 let sends=0,reconciles=0;
 const adapter:ReconciliableToolAdapter={capabilityId:'gmail_send',async execute(request){sends++;assert.equal(request.idempotencyKey,'owner-report-email:'+N);assert.deepEqual(request.params,params);return {providerReference:'synthetic-receipt',result:{},evidence:{}}},async reconcile(request){reconciles++;assert.equal(request.idempotencyKey,'owner-report-email:'+N);return {result:'NOT_FOUND',evidence:{}}}};
 return {sql,db,adapter,params,sends:()=>sends,reconciles:()=>reconciles,row:async()=>(await sql.query<any>('SELECT * FROM owner_notifications WHERE id=$1',[N])).rows[0]};
}
const tick=(f:Awaited<ReturnType<typeof fixture>>,b:OwnerReportEmailBinding=binding)=>runOwnerReportEmailTick(b,f.adapter,f.db);

test('off/default and missing binding/transport do not even connect',async()=>{
 const old=process.env.SAM_OWNER_REPORT_EMAIL_ENABLED;
 try{
  delete process.env.SAM_OWNER_REPORT_EMAIL_ENABLED;
  const db={connect(){throw Error('must not connect')}};
  assert.deepEqual(await runOwnerReportEmailTick(binding,{} as any,db),{enabled:false,reason:'DISABLED'});
  process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';
  assert.equal((await runOwnerReportEmailTick(undefined,undefined,db)).reason,'TRANSPORT_OR_BINDING_UNAVAILABLE');
 }finally{if(old===undefined)delete process.env.SAM_OWNER_REPORT_EMAIL_ENABLED;else process.env.SAM_OWNER_REPORT_EMAIL_ENABLED=old}
});

test('standing owner consent sends a GREEN goal report without generic approval; repeated/concurrent ticks send once',async()=>{
 process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';const f=await fixture();try{
  let release!:(value:any)=>void,admitted!:()=>void;const ready=new Promise<void>(r=>admitted=r),original=f.adapter.execute;
  f.adapter.execute=async request=>{const result=await original(request);admitted();await new Promise(resolve=>release=resolve);return result};
  const first=tick(f);await Promise.race([ready,first.then(result=>{throw Error('sender did not admit: '+JSON.stringify(result))})]);
  assert.equal((await tick(f)).processed,false);release(null);
  assert.equal((await first).outcome,'ACCEPTED');assert.equal((await tick(f)).processed,false);
  assert.equal(f.sends(),1);assert.equal((await f.row()).receipt_id,'synthetic-receipt');
  const attempts=(await f.sql.query<any>('SELECT * FROM notification_delivery_attempts')).rows;assert.equal(attempts.length,1);assert.equal(attempts[0].outcome,'ACCEPTED');
  assert.equal((await f.sql.query('SELECT * FROM approvals')).rows.length,0);
  assert.equal((await f.sql.query<any>('SELECT authority_ceiling FROM goals')).rows[0].authority_ceiling,'GREEN');
  const admission=(await f.sql.query<any>("SELECT after_ref FROM audit_log WHERE action='OWNER_REPORT_EMAIL_ADMITTED'")).rows[0].after_ref;
  assert.equal(admission.activationAuditId,X);assert.equal(admission.paramsHash,sha256Hex(f.params));assert.deepEqual(admission.params,f.params);
  assert.equal((await f.row()).confirmed_at,null);assert.equal((await f.row()).read_at,null);
 }finally{await f.sql.close()}
});

for(const scenario of ['wrong recipient','foreign binding','foreign notification','foreign goal','old notification','old report','missing activation','wrong report','wrong org','wrong routed recipient','wrong classification','no attempt privilege'] as const)test('delivery fails closed: '+scenario,async()=>{
 process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';const f=await fixture();try{
  let config={...binding};
  if(scenario==='wrong recipient')config.recipient='other@example.invalid' as any;
  if(scenario==='foreign binding')config.legalEntityId=B;
  if(scenario==='foreign notification')await f.sql.query('UPDATE owner_notifications SET legal_entity_id=$1',[B]);
  if(scenario==='foreign goal')await f.sql.query('UPDATE goals SET company_scope=$1',[B]);
  if(scenario==='old notification')await f.sql.exec("UPDATE owner_notifications SET created_at='2025-12-31'");
  if(scenario==='old report')await f.sql.exec("UPDATE goal_read_reviews SET created_at='2025-12-31'");
  if(scenario==='missing activation')await f.sql.exec('DELETE FROM audit_log');
  if(scenario==='wrong report')await f.sql.exec("UPDATE goal_read_reviews SET report_hash='foreign-hash'");
  if(scenario==='wrong org')await f.sql.query("SELECT set_config('app.current_org_id',$1,false)",[B]);
  if(scenario==='wrong routed recipient')await f.sql.exec("UPDATE owner_notifications SET status='RETRY',channel='gmail',recipient_ref='foreign@example.invalid'");
  if(scenario==='wrong classification')config.dataClassification='CONFIDENTIAL';
  if(scenario==='no attempt privilege')await f.sql.exec('DROP TABLE notification_delivery_attempts');
  await tick(f,config);assert.equal(f.sends(),0);assert.equal((await f.row()).status,['wrong routed recipient'].includes(scenario)?'RETRY':'UNROUTED');
 }finally{await f.sql.close()}
});

test('definite pre-send authority failure retries finitely, never invokes transport, and retains attempt history',async()=>{
 process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';const f=await fixture();try{
  await f.sql.exec("CREATE FUNCTION deny_admission() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='OWNER_REPORT_EMAIL_ADMITTED' THEN RAISE EXCEPTION 'synthetic admission unavailable'; END IF; RETURN NEW; END $$; CREATE TRIGGER deny_admission BEFORE INSERT ON audit_log FOR EACH ROW EXECUTE FUNCTION deny_admission();");
  for(let i=1;i<=3;i++){
   assert.equal((await tick(f)).outcome,i===3?'FAILED':'RETRY');
   await f.sql.exec("UPDATE owner_notifications SET next_attempt_at=now()-interval '1 second'");
  }
  await tick(f);assert.equal(f.sends(),0);assert.equal((await f.row()).attempt,3);
  assert.equal((await f.sql.query('SELECT * FROM notification_delivery_attempts')).rows.length,3);
  assert.equal((await f.sql.query('SELECT * FROM approvals')).rows.length,0);
 }finally{await f.sql.close()}
});

for(const found of [true,false])test('ambiguous provider send reconciles stable key without resending: '+found,async()=>{
 process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';const f=await fixture();try{
  const original=f.adapter.execute;f.adapter.execute=async request=>{await original(request);throw Error('synthetic timeout, sensitive upstream body')};
  if(found)f.adapter.reconcile=async()=>({result:'CONFIRMED',evidence:{provider_message_id:'synthetic-found'}});
  const result=await tick(f);assert.equal(result.outcome,found?'CONFIRMED':'UNKNOWN');assert.equal(result.inboxDeliveryProven,false);
  await tick(f);assert.equal(f.sends(),1);assert.equal((await f.row()).status,found?'CONFIRMED':'UNKNOWN');
  assert.ok(!JSON.stringify(await f.row()).includes('sensitive upstream'));
 }finally{await f.sql.close()}
});

test('expired SENDING reconciles only, fences the paused sender, and keeps UNKNOWN when inconclusive',async()=>{
 process.env.SAM_OWNER_REPORT_EMAIL_ENABLED='true';const f=await fixture();try{
  let release!:(value:any)=>void,admitted!:()=>void;const ready=new Promise<void>(r=>admitted=r),original=f.adapter.execute;
  f.adapter.execute=async request=>{const result=await original(request);admitted();await new Promise(resolve=>release=resolve);return result};
  const first=tick(f);await Promise.race([ready,first.then(result=>{throw Error('sender did not admit: '+JSON.stringify(result))})]);
  await f.sql.exec("UPDATE owner_notifications SET lease_until=now()-interval '1 second'");
  assert.equal((await tick(f)).outcome,'UNKNOWN');release(null);assert.equal((await first).outcome,'FENCE_LOST');
  await tick(f);assert.equal(f.sends(),1);assert.equal(f.reconciles(),1);assert.equal((await f.row()).status,'UNKNOWN');
 }finally{await f.sql.close()}
});

test('dedicated server factory is inert by default and never exposes generic gmail_send',()=>{
 const bundle={capabilities:[],toolDefinitions:[],toolAdapters:[]};
 assert.equal(withOwnerReportEmailFromEnv(bundle,{}),bundle);
 const env={SAM_OWNER_REPORT_EMAIL_ENABLED:'true',SAM_DEFAULT_LEGAL_ENTITY_ID:A,
  SAM_OWNER_REPORT_EMAIL_ACTIVATION_AUDIT_ID:X,SAM_OWNER_REPORT_EMAIL_ACTIVATED_AT:binding.activatedAt,
  SAM_OWNER_REPORT_EMAIL_DATA_CLASSIFICATION:'INTERNAL',GOOGLE_OAUTH_CLIENT_ID:'synthetic-client',
  GOOGLE_OAUTH_CLIENT_SECRET:'synthetic-test-fixture-only',GOOGLE_OAUTH_REFRESH_TOKEN:'synthetic-test-fixture-only'};
 const configured=withOwnerReportEmailFromEnv(bundle,env);
 assert.equal(configured.ownerReportEmail?.recipient,'ceo@suroohholdings.com');assert.ok(configured.ownerReportEmailAdapter);
 assert.equal(configured.toolAdapters,bundle.toolAdapters);assert.equal(configured.toolDefinitions,bundle.toolDefinitions);
 assert.equal(configured.capabilities,bundle.capabilities);
 for(const patch of [{SAM_DEFAULT_LEGAL_ENTITY_ID:'invalid'},{SAM_OWNER_REPORT_EMAIL_ACTIVATION_AUDIT_ID:'invalid'},
  {SAM_OWNER_REPORT_EMAIL_ACTIVATED_AT:'2026-02-31T00:00:00.000Z'},
  {SAM_OWNER_REPORT_EMAIL_DATA_CLASSIFICATION:'RESTRICTED'},{SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:B},
  {GOOGLE_OAUTH_REFRESH_TOKEN:''}])assert.throws(()=>withOwnerReportEmailFromEnv(bundle,{...env,...patch}));
 assert.throws(()=>withOwnerReportEmailFromEnv(bundle,{...env,GOOGLE_OAUTH_CLIENT_ID:'',GOOGLE_OAUTH_CLIENT_SECRET:'',GOOGLE_OAUTH_REFRESH_TOKEN:''}),/SEND_TRANSPORT_REQUIRED/);
});

test('actual default bundle with all owner flags OFF retains no sender or generic Gmail capability',()=>{
 const run=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',`
  import assert from 'node:assert/strict';
  import build from './apps/production/src/defaultBundleModule.ts';
  const bundle=await (build.default??build)();
  assert.equal(bundle.ownerReportEmail,undefined);assert.equal(bundle.ownerReportEmailAdapter,undefined);
  assert.equal(bundle.toolDefinitions.some(d=>d.capabilityId==='gmail_send'),false);
 `],{cwd:new URL('../../',import.meta.url),env:{PATH:process.env.PATH,DATABASE_URL:'postgresql://synthetic.invalid/unused',SAM_GOOGLE_READ_ONLY:'true'},encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
});

test('standing notification consent does not authorize generic Gmail or mutate goal ceilings/exact approvals',async()=>{
 const f=await fixture();try{
  const client=await f.db.connect();try{
   const request={goalId:G,legalEntityId:A,steps:[{capabilityId:'gmail_send',params:f.params}],capabilityPolicies:{gmail_send:'YELLOW' as const}};
   assert.equal((await evaluatePlanAuthority(client,request)).authorized,false,'GREEN execution ceiling is unchanged');
   await assert.rejects(consumeApproval(client,{goalId:G,legalEntityId:A,capabilityId:'gmail_send',params:f.params,authorityClass:'YELLOW'}),/matching live approval/);
   await f.sql.exec("UPDATE goals SET authority_ceiling='YELLOW'");
   assert.equal((await evaluatePlanAuthority(client,request)).authorized,false,'standing route is not generic approval');
   await f.sql.query("INSERT INTO approvals(capability_id,params_hash,legal_entity_id,authority_class,goal_id,status,expiry_at) VALUES('gmail_send',$1,$2,'YELLOW',$3,'APPROVED',now()+interval '1 day')",[sha256Hex(f.params),A,G]);
   assert.equal((await evaluatePlanAuthority(client,request)).authorized,true);
   await assert.rejects(consumeApproval(client,{goalId:G,legalEntityId:A,capabilityId:'gmail_send',params:{...f.params,to:['foreign@example.invalid']},authorityClass:'YELLOW'}),/matching live approval/);
   await consumeApproval(client,{goalId:G,legalEntityId:A,capabilityId:'gmail_send',params:f.params,authorityClass:'YELLOW'});
   assert.equal((await evaluatePlanAuthority(client,request)).authorized,false,'one exact generic approval consumed');
  }finally{client.release()}
 }finally{await f.sql.close()}
});
