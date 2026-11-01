/** Actual migration/provisioner/column privileges and forced RLS under SET ROLE. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {preflightOwnerNotificationDeliveryAccess,provisionOwnerNotificationDeliveryAccess} from '../../packages/db/src/ownerNotificationDeliveryAccess';
import {integrationManifest} from '../../packages/db/src/integrationProfile';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',
 O='33333333-3333-4333-8333-333333333333',OTHER='99999999-9999-4999-8999-999999999999',
 G='44444444-4444-4444-8444-444444444444',H='77777777-7777-4777-8777-777777777777',
 N='55555555-5555-4555-8555-555555555555',F='88888888-8888-4888-8888-888888888888';
const principal={schema:'public',role:'sam_runtime_app' as const,orgId:O,legalEntityId:A};
const migration=(name:string)=>readFileSync(new URL('../../packages/db/integration-migrations/'+name,import.meta.url),'utf8');
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE SQL AS $$SELECT nullif(current_setting('app.current_org_id',true),'')::uuid$$;
 CREATE FUNCTION current_legal_entity_id() RETURNS uuid LANGUAGE SQL AS $$SELECT nullif(current_setting('app.current_legal_entity_id',true),'')::uuid$$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY,org_id uuid);
 CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid);
 CREATE TABLE outbox_events(id uuid PRIMARY KEY);
 CREATE ROLE sam_runtime_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
 CREATE ROLE sam_mcp_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
 CREATE ROLE sam_eval_runtime_20261024 LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;`);
 await db.exec(migration('00105_owner_notifications.sql'));
 await db.query('INSERT INTO legal_entities VALUES($1,$3),($2,$3)',[A,B,O]);
 await db.query('INSERT INTO goals VALUES($1,$3),($2,$4)',[G,H,A,B]);
 await db.query(`INSERT INTO owner_notifications(id,legal_entity_id,goal_id,dedup_key,kind,severity,title,body)
  VALUES($1,$2,$3,'own','COMPLETED','INFO','Synthetic','{}'),($4,$5,$6,'foreign','COMPLETED','INFO','Synthetic','{}')`,[N,A,G,F,B,H]);
 await db.query("INSERT INTO notification_delivery_attempts VALUES($1,1,'SENDING',NULL,NULL,now(),NULL)",[F]);
 await db.exec(`ALTER TABLE goals ENABLE ROW LEVEL SECURITY;ALTER TABLE goals FORCE ROW LEVEL SECURITY;
 CREATE POLICY goals_runtime ON goals TO sam_runtime_app USING(company_scope='${A}'::uuid AND current_org_id()='${O}'::uuid AND current_legal_entity_id()='${A}'::uuid);
 ALTER TABLE owner_notifications FORCE ROW LEVEL SECURITY;
 CREATE POLICY integration_base_sam_runtime_app ON owner_notifications TO sam_runtime_app
  USING(legal_entity_id='${A}'::uuid) WITH CHECK(legal_entity_id='${A}'::uuid);
 CREATE POLICY integration_fence_sam_runtime_app ON owner_notifications AS RESTRICTIVE TO sam_runtime_app
  USING(legal_entity_id='${A}'::uuid AND EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope='${A}'::uuid)
   AND current_org_id()='${O}'::uuid AND current_legal_entity_id()='${A}'::uuid)
  WITH CHECK(legal_entity_id='${A}'::uuid AND EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope='${A}'::uuid)
   AND current_org_id()='${O}'::uuid AND current_legal_entity_id()='${A}'::uuid);
 GRANT USAGE ON SCHEMA public TO sam_runtime_app,sam_mcp_app,sam_eval_runtime_20261024;
 GRANT SELECT ON goals,owner_notifications TO sam_runtime_app;
 GRANT UPDATE(status,last_error_code,updated_at) ON owner_notifications TO sam_runtime_app;`);
 const c={query:async(sql:string,args?:any[])=>{const result=await db.query<any>(sql,args);return {...result,rowCount:result.affectedRows??result.rows.length};}} as any;
 const context=async(entity=A,org=O)=>db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[org,entity]);
 const role=async(name='sam_runtime_app')=>{await db.exec('RESET ROLE');await db.exec('SET ROLE '+name);};
 const denied=async(sql:string,args?:any[])=>assert.rejects(()=>db.query(sql,args),(e:any)=>e.code==='42501');
 return {db,c,context,role,denied,async migrate(){await db.exec(migration('00107_owner_notification_delivery_access.sql'));},async close(){await db.close();}};
}

test('00107 is a reviewed manifest addition, inert without explicit runtime provisioning',async()=>{
 const f=await fixture();try{
  assert.equal(integrationManifest().length,10);
  assert.equal(integrationManifest().at(-1)?.filename,'00107_owner_notification_delivery_access.sql');
  await assert.rejects(()=>preflightOwnerNotificationDeliveryAccess(f.c,principal),/00107_REQUIRED/);
  await f.migrate();await f.context();await f.role();
  assert.equal((await f.db.query<any>('SELECT current_user')).rows[0].current_user,'sam_runtime_app');
  await f.denied("UPDATE owner_notifications SET channel='gmail' WHERE id=$1",[N]);
  await f.denied("INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,1,'SENDING')",[N]);
 }finally{await f.close();}
});

test('explicit runtime grants permit actual worker columns and keep attempt identity/history immutable',async()=>{
 const f=await fixture();try{
  await f.migrate();const receipt=await provisionOwnerNotificationDeliveryAccess(f.c,principal);
  assert.equal(receipt.deliveryActivated,false);assert.equal(receipt.providerInvoked,false);assert.equal(receipt.otherRolesChanged,false);
  assert.equal(receipt.attemptSelectColumns.length,2);assert.equal(receipt.attemptInsertColumns.length,3);assert.equal(receipt.attemptUpdateColumns.length,4);
  // Repeat provisioning remains scoped and does not accumulate policies/grants.
  assert.equal((await provisionOwnerNotificationDeliveryAccess(f.c,principal)).sha256,receipt.sha256);
  await f.context();await f.role();
  const flags=(await f.db.query<any>('SELECT current_user,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];
  assert.deepEqual(flags,{current_user:'sam_runtime_app',rolsuper:false,rolbypassrls:false});
  const claimed=await f.db.query(`UPDATE owner_notifications SET status='SENDING',channel='gmail',recipient_ref='ceo@suroohholdings.com',
   attempt=1,lease_until=now()+interval '60 seconds',updated_at=now() WHERE id=$1 RETURNING lease_until`,[N]);
  assert.equal(claimed.rows.length,1);
  await f.db.query(`INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome)
   SELECT id,1,'SENDING' FROM owner_notifications WHERE id=$1 AND legal_entity_id=$2`,[N,A]);
  await f.db.query(`UPDATE notification_delivery_attempts a SET outcome='ACCEPTED',receipt_id='synthetic',error_code=NULL,finished_at=now()
   FROM owner_notifications n WHERE a.notification_id=n.id AND n.id=$1 AND n.legal_entity_id=$2 AND a.attempt=1`,[N,A]);
  await f.db.query(`UPDATE owner_notifications SET status='ACCEPTED',receipt_id='synthetic',last_error_code=NULL,
   lease_until=NULL,updated_at=now(),next_attempt_at=now()+interval '60 seconds',accepted_at=now(),confirmed_at=NULL WHERE id=$1`,[N]);
  assert.deepEqual((await f.db.query('SELECT notification_id,attempt FROM notification_delivery_attempts')).rows,[{notification_id:N,attempt:1}]);
  for(const sql of ["UPDATE owner_notifications SET body='{}' WHERE id=$1","UPDATE owner_notifications SET read_at=now() WHERE id=$1",
   "UPDATE owner_notifications SET legal_entity_id='22222222-2222-4222-8222-222222222222' WHERE id=$1",
   "UPDATE owner_notifications SET goal_id='77777777-7777-4777-8777-777777777777' WHERE id=$1",
   "UPDATE notification_delivery_attempts SET notification_id='88888888-8888-4888-8888-888888888888' WHERE notification_id=$1",
   'UPDATE notification_delivery_attempts SET attempt=2 WHERE notification_id=$1',
   'UPDATE notification_delivery_attempts SET started_at=now() WHERE notification_id=$1',
   'DELETE FROM notification_delivery_attempts WHERE notification_id=$1'])await f.denied(sql,[N]);
  await f.denied('SELECT outcome FROM notification_delivery_attempts');await f.denied('TRUNCATE notification_delivery_attempts');
  await f.db.exec('RESET ROLE');
  const attempt=(await f.db.query<any>('SELECT * FROM notification_delivery_attempts WHERE notification_id=$1',[N])).rows[0];
  assert.equal(attempt.outcome,'ACCEPTED');assert.equal(attempt.receipt_id,'synthetic');assert.ok(attempt.finished_at);
 }finally{await f.close();}
});

test('forced parent scope rejects foreign attempts, foreign updates and tenant-GUC spoofing',async()=>{
 const f=await fixture();try{
  await f.migrate();await provisionOwnerNotificationDeliveryAccess(f.c,principal);await f.context();await f.role();
  await f.denied("INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,2,'SENDING')",[F]);
  assert.equal((await f.db.query("UPDATE notification_delivery_attempts SET outcome='FAILED' WHERE notification_id=$1",[F])).affectedRows,0);
  assert.equal((await f.db.query("UPDATE owner_notifications SET channel='gmail' WHERE id=$1",[F])).affectedRows,0);
  for(const [entity,org] of [[B,O],[A,OTHER]]){
   await f.context(entity,org);
   assert.equal((await f.db.query('SELECT notification_id,attempt FROM notification_delivery_attempts')).rows.length,0);
   await f.denied("INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,1,'SENDING')",[N]);
  }
  await f.context();await f.role('sam_mcp_app');
  await f.denied('SELECT notification_id FROM notification_delivery_attempts');
  await f.denied("UPDATE owner_notifications SET channel='gmail' WHERE id=$1",[N]);
  await f.role('sam_eval_runtime_20261024');await f.denied('SELECT notification_id FROM notification_delivery_attempts');
  await f.db.exec('RESET ROLE');assert.equal((await f.db.query<any>('SELECT outcome FROM notification_delivery_attempts WHERE notification_id=$1',[F])).rows[0].outcome,'SENDING');
 }finally{await f.close();}
});

test('operator preflight refuses wrong roles, unsafe principals and broad preexisting attempt grants',async()=>{
 const f=await fixture();try{
  await f.migrate();
  await assert.rejects(()=>provisionOwnerNotificationDeliveryAccess(f.c,{...principal,role:'sam_mcp_app' as any}),/PRINCIPAL_INVALID/);
  await assert.rejects(()=>preflightOwnerNotificationDeliveryAccess(f.c,{...principal,legalEntityId:'invalid'}),/PRINCIPAL_INVALID/);
  await f.db.exec('ALTER ROLE sam_runtime_app CREATEROLE');
  await assert.rejects(()=>preflightOwnerNotificationDeliveryAccess(f.c,principal),/RESTRICTED_RUNTIME_REQUIRED/);
  await f.db.exec('ALTER ROLE sam_runtime_app NOCREATEROLE;GRANT UPDATE ON notification_delivery_attempts TO sam_runtime_app');
  await assert.rejects(()=>provisionOwnerNotificationDeliveryAccess(f.c,principal),/BROAD_EXISTING_GRANTS_REFUSED/);
  assert.equal((await f.db.query<any>("SELECT count(*)::int n FROM pg_policy WHERE polname LIKE 'owner_delivery_%'")).rows[0].n,0);
 }finally{await f.close();}
});

test('operator catalog-only search path resolves qualified tenant functions and both policy renderings',async()=>{
 const f=await fixture();try{
  await f.migrate();
  await f.db.exec('SET search_path=pg_catalog');
  assert.equal((await preflightOwnerNotificationDeliveryAccess(f.c,principal)).role,'sam_runtime_app');
  const first=await provisionOwnerNotificationDeliveryAccess(f.c,principal);
  assert.equal((await provisionOwnerNotificationDeliveryAccess(f.c,principal)).sha256,first.sha256);
  await f.context();await f.role();
  await f.db.query("INSERT INTO public.notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,1,'SENDING')",[N]);
  await f.denied("INSERT INTO public.notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,2,'SENDING')",[F]);
  await f.context(B,O);
  assert.equal((await f.db.query('SELECT notification_id,attempt FROM public.notification_delivery_attempts')).rows.length,0);
  await f.db.exec('RESET ROLE;SET search_path=public');
  assert.equal((await preflightOwnerNotificationDeliveryAccess(f.c,principal)).role,'sam_runtime_app');
 }finally{await f.close();}
});
