import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile,mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { projectOwnerNotifications,runOwnerNotificationTick,transaction } from '../../apps/notifications/src/center';
import { deliverNextOwnerNotification,routeOwnerNotification,NotificationNotSentError } from '../../apps/notifications/src/delivery';
import { createChatGPTToolSurface } from '../../apps/chatgpt-tools/src/surface';

const A=randomUUID(),B=randomUUID();
async function fixture(path?:string){
 const db=new PGlite(path);
 await db.exec(`CREATE TABLE legal_entities(id UUID PRIMARY KEY);
 CREATE TABLE goals(id UUID PRIMARY KEY,business_id TEXT,company_scope UUID,state TEXT,current_plan_id UUID,replan_attempts INT DEFAULT 0,
   created_at TIMESTAMPTZ DEFAULT now(),updated_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE outbox_events(id UUID PRIMARY KEY,aggregate_type TEXT,aggregate_id UUID,event_type TEXT,payload JSONB,
   status TEXT DEFAULT 'PUBLISHED',created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE goal_read_reviews(id UUID PRIMARY KEY,goal_id UUID,plan_id UUID,round INT,decision JSONB,report_hash TEXT,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE work_queue(id UUID PRIMARY KEY,goal_id UUID,capability_id TEXT,wake_reason TEXT,attempt INT,status TEXT,queued_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE executions(id UUID PRIMARY KEY,goal_id UUID,started_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE verifications(id UUID PRIMARY KEY,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE approvals(id UUID PRIMARY KEY,goal_id UUID,legal_entity_id UUID,capability_id TEXT,status TEXT,expiry_at TIMESTAMPTZ,created_at TIMESTAMPTZ DEFAULT now());`);
 await db.exec(await readFile('packages/db/migrations/00103_owner_notifications.sql','utf8'));
 await db.query('INSERT INTO legal_entities VALUES($1),($2)',[A,B]);
 await db.query("INSERT INTO notification_settings(id,enabled_at) VALUES('owner',now()-interval '1 hour')");
 return db;
}
function pool(db:any){return {connect:async()=>({query:async(q:string,p?:any[])=>q.includes('pg_try_advisory_xact_lock')?{rows:[{locked:true}]}:db.query(q,p),release(){}})}}
async function event(db:any,state:string,options:any={}){
 const goal=options.goal??randomUUID(),id=randomUUID(),plan=options.plan??randomUUID();
 if(!options.goal)await db.query('INSERT INTO goals(id,business_id,company_scope,state,current_plan_id,replan_attempts) VALUES($1,$2,$3,$4,$5,$6)',[goal,'G-FIXTURE',options.entity??A,state,plan,options.replans??0]);
 await db.query('INSERT INTO outbox_events VALUES($1,\'goal\',$2,\'GOAL_STATE_CHANGED\',$3,$4,now())',[id,goal,{to:state,reason:options.reason??'test_transition',...(options.hash?{report_hash:options.hash}:{})},options.outboxStatus??'PUBLISHED']);
 return {goal,id,plan};
}
async function routed(db:any,state='COMPLETED'){
 const e=await event(db,state);await projectOwnerNotifications(pool(db));
 const n:any=(await db.query('SELECT * FROM owner_notifications WHERE goal_id=$1',[e.goal])).rows[0];
 await routeOwnerNotification(db,n.id,'fixture-channel','fixture-owner');return n;
}
const transport=(send:any)=>({channel:'fixture-channel',recipientRef:'fixture-owner',send});
function enable(){process.env.SAM_NOTIFICATIONS_ENABLED='true';process.env.SAM_NOTIFICATION_DELIVERY_ENABLED='true'}
function disable(){delete process.env.SAM_NOTIFICATIONS_ENABLED;delete process.env.SAM_NOTIFICATION_DELIVERY_ENABLED}

test('projects published and pending events once, correlates final report and evidence, skips routine transitions and stale approval requests',async()=>{
 enable();const db=await fixture();
 try{
  const e=await event(db,'COMPLETED',{replans:1,hash:'report-hash'}),execution=randomUUID();
  await db.query('INSERT INTO goal_read_reviews VALUES($1,$2,$3,1,$4,$5,now())',[randomUUID(),e.goal,e.plan,{status:'complete',summary:'Read-only fixture recovery completed.'},'report-hash']);
  await db.query('INSERT INTO executions(id,goal_id) VALUES($1,$2)',[execution,e.goal]);
  await db.query("INSERT INTO verifications VALUES($1,$2,'VERIFIED',now())",[randomUUID(),execution]);
  const failure=await event(db,'FAILED',{outboxStatus:'PENDING',reason:'WORK_EXECUTION_FAILED'});
  await db.query("INSERT INTO work_queue VALUES($1,$2,'fixture_read','SECRETNoSpaces',1,'FAILED',now())",[randomUUID(),failure.goal]);
  const approval=await event(db,'WAITING_OWNER');
  await db.query("INSERT INTO approvals VALUES($1,$2,$3,'fixture_write','PENDING',now()+interval '1 day',now())",[randomUUID(),approval.goal,A]);
  await event(db,'EXECUTING');
  const stale=await event(db,'WAITING_OWNER');await db.query("UPDATE goals SET state='EXECUTING' WHERE id=$1",[stale.goal]);
  assert.equal((await projectOwnerNotifications(pool(db))).created,3);
  const n:any=(await db.query('SELECT * FROM owner_notifications WHERE goal_id=$1',[e.goal])).rows[0];
  assert.equal(n.status,'UNROUTED');assert.equal(n.body.summary,'Read-only fixture recovery completed.');assert.equal(n.body.replans,1);
  assert.deepEqual(n.body.evidenceExecutionIds,[execution]);assert.equal(n.body.report.hash,'report-hash');assert.equal(n.body.verifiedExecutions,1);
  assert.equal((await projectOwnerNotifications(pool(db))).created,0);
  const failed:any=(await db.query("SELECT * FROM owner_notifications WHERE kind='FAILED'")).rows[0];
  assert.equal(failed.body.failedAttempts[0].capabilityId,'fixture_read');assert.match(failed.body.reason,/فشلت/);
  assert.equal(JSON.stringify(failed).includes('SECRET'),false);
  assert.equal((await db.query("SELECT * FROM outbox_events WHERE status='PENDING'")).rows.length,1,'projection never publishes runtime events');
  assert.equal((await db.query('SELECT * FROM notification_event_receipts')).rows.length,5);
  const request:any=(await db.query("SELECT * FROM owner_notifications WHERE kind='APPROVAL'")).rows[0];assert.equal(request.severity,'URGENT');assert.equal(request.body.approvalRequests.length,1);
  await db.query("UPDATE goals SET state='EXECUTING' WHERE id=$1",[approval.goal]);
  await projectOwnerNotifications(pool(db));
  assert.equal((await db.query('SELECT status FROM owner_notifications WHERE id=$1',[request.id])).rows[0].status,'SUPPRESSED');
 }finally{await db.close();disable()}
});

test('transaction rollback does not lose an event, published is not delivered, and replay survives durable database reconstruction',async()=>{
 enable();const path=await mkdtemp(join(tmpdir(),'sam-notify-'));let db=await fixture(path);
 try{
  const e=await event(db,'COMPLETED');let fail=true;
  const failing={connect:async()=>({query:async(q:string,p?:any[])=>{
   if(fail&&q.includes('INSERT INTO notification_event_receipts')){fail=false;throw new Error('injected receipt failure')}
   return q.includes('pg_try_advisory_xact_lock')?{rows:[{locked:true}]}:db.query(q,p);
  },release(){}})};
  await assert.rejects(projectOwnerNotifications(failing),/injected/);
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM notification_event_receipts')).rows.length,0);
  assert.equal((await projectOwnerNotifications(pool(db))).created,1);
  await db.close();db=new PGlite(path);
  assert.equal((await projectOwnerNotifications(pool(db))).created,0);
  const n:any=(await db.query('SELECT * FROM owner_notifications WHERE goal_id=$1',[e.goal])).rows[0];
  assert.equal(n.status,'UNROUTED');assert.equal(n.accepted_at,null);assert.equal(n.confirmed_at,null);assert.equal(n.read_at,null);
  assert.equal(n.body.verifiedExecutions,0);assert.match(n.body.summary,/لا يوجد تقرير/);
 }finally{await db.close();await rm(path,{recursive:true,force:true});disable()}
});

test('cutover excludes historical events; long tasks emit once per plan/state and never claim failure',async()=>{
 enable();const db=await fixture();
 try{
  const old=await event(db,'COMPLETED');await db.query("UPDATE outbox_events SET created_at=now()-interval '2 hours' WHERE id=$1",[old.id]);
  const active=await event(db,'EXECUTING');await db.query("UPDATE goals SET created_at=now()-interval '40 minutes' WHERE id=$1",[active.goal]);
  assert.equal((await projectOwnerNotifications(pool(db))).created,1);
  assert.equal((await projectOwnerNotifications(pool(db))).created,0);
  let n:any=(await db.query('SELECT * FROM owner_notifications')).rows[0];assert.equal(n.kind,'PROGRESS');assert.match(n.body.summary,/لا يثبت فشلها/);
  await db.query('UPDATE goals SET current_plan_id=$2 WHERE id=$1',[active.goal,randomUUID()]);
  assert.equal((await projectOwnerNotifications(pool(db))).created,1);
 }finally{await db.close();disable()}
});

test('recipient-bound delivery distinguishes provider acceptance, confirmation and owner read; no duplicate sends after success',async()=>{
 enable();const db=await fixture();let sends=0;
 try{
  const n=await routed(db);
  const wrong={...transport(async()=>{throw new Error('must not send')}),recipientRef:'other-owner'};
  assert.equal((await deliverNextOwnerNotification(pool(db),wrong)).processed,false);
  const t=transport(async(input:any)=>{sends++;assert.equal(input.idempotencyKey,n.id);return {receiptId:'fixture-receipt',status:'ACCEPTED'}});
  assert.equal((await deliverNextOwnerNotification(pool(db),t)).status,'ACCEPTED');
  assert.equal((await deliverNextOwnerNotification(pool(db),t)).processed,false);assert.equal(sends,1);
  const row:any=(await db.query('SELECT * FROM owner_notifications WHERE id=$1',[n.id])).rows[0];
  assert.ok(row.accepted_at);assert.equal(row.confirmed_at,null);assert.equal(row.read_at,null);
  await routed(db);
  assert.equal((await deliverNextOwnerNotification(pool(db),transport(async()=>({receiptId:'confirmed-receipt',status:'CONFIRMED'})))).status,'CONFIRMED');
  assert.equal((await db.query("SELECT * FROM owner_notifications WHERE status='CONFIRMED'")).rows.length,1);
 }finally{await db.close();disable()}
});

test('only known not-sent failures retry with backoff and maximum budget; uncertain outcomes are quarantined',async()=>{
 enable();const db=await fixture();
 try{
  const n=await routed(db);
  const notSent=transport(async()=>{throw new NotificationNotSentError(true)});
  assert.equal((await deliverNextOwnerNotification(pool(db),notSent)).status,'RETRY');
  assert.equal((await deliverNextOwnerNotification(pool(db),notSent)).processed,false,'backoff enforced');
  for(let i=2;i<=5;i++){
   await db.query("UPDATE owner_notifications SET next_attempt_at=now()-interval '1 second' WHERE id=$1",[n.id]);
   assert.equal((await deliverNextOwnerNotification(pool(db),notSent)).status,i<5?'RETRY':'FAILED');
  }
  assert.equal((await db.query('SELECT * FROM notification_delivery_attempts WHERE notification_id=$1',[n.id])).rows.length,5);
  const uncertain=await routed(db);
  assert.equal((await deliverNextOwnerNotification(pool(db),transport(async()=>{throw new Error('provider token SECRET response body')}))).status,'UNKNOWN');
  const row:any=(await db.query('SELECT * FROM owner_notifications WHERE id=$1',[uncertain.id])).rows[0];
  assert.equal(row.last_error_code,'DELIVERY_OUTCOME_UNCERTAIN');assert.equal(JSON.stringify(row).includes('SECRET'),false);
  assert.equal((await deliverNextOwnerNotification(pool(db),notSent)).processed,false);
 }finally{await db.close();disable()}
});

test('expired in-flight attempts never resend, stale claims cannot overwrite a newer outcome and stale approvals are suppressed',async()=>{
 enable();const db=await fixture();
 try{
  const n=await routed(db);
  await db.query("UPDATE owner_notifications SET status='SENDING',attempt=1,lease_until=now()-interval '1 minute' WHERE id=$1",[n.id]);
  await db.query("INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,1,'SENDING')",[n.id]);
  let sent=0;const t=transport(async()=>{sent++;return {receiptId:'r',status:'CONFIRMED'}});
  assert.equal((await deliverNextOwnerNotification(pool(db),t)).processed,false);assert.equal(sent,0);
  assert.equal((await db.query('SELECT status FROM owner_notifications WHERE id=$1',[n.id])).rows[0].status,'UNKNOWN');
  assert.equal((await db.query('SELECT outcome FROM notification_delivery_attempts WHERE notification_id=$1',[n.id])).rows[0].outcome,'UNKNOWN');
  const fresh=await routed(db);
  const stale=await deliverNextOwnerNotification(pool(db),transport(async()=>{
   await db.query("UPDATE owner_notifications SET status='UNKNOWN',last_error_code='manual_reconciliation_required' WHERE id=$1",[fresh.id]);
   return {receiptId:'late',status:'CONFIRMED'};
  }));assert.equal(stale.status,'UNKNOWN');
  const approval=await routed(db,'WAITING_OWNER');await db.query("UPDATE goals SET state='COMPLETED' WHERE id=$1",[approval.goal_id]);
  await deliverNextOwnerNotification(pool(db),t);assert.equal(sent,0);
  assert.equal((await db.query('SELECT status FROM owner_notifications WHERE id=$1',[approval.id])).rows[0].status,'SUPPRESSED');
  const unrouted=await event(db,'WAITING_OWNER');await projectOwnerNotifications(pool(db));
  await db.query("UPDATE goals SET state='COMPLETED' WHERE id=$1",[unrouted.goal]);
  await deliverNextOwnerNotification(pool(db),t);
  assert.equal((await db.query('SELECT status FROM owner_notifications WHERE goal_id=$1',[unrouted.goal])).rows[0].status,'SUPPRESSED');
 }finally{await db.close();disable()}
});

test('owner inbox requires explicit company and system owner; RLS denies other companies',async()=>{
 enable();const db=await fixture();
 try{
  await event(db,'COMPLETED');await projectOwnerNotifications(pool(db));
  const surface=createChatGPTToolSurface();
  assert.equal((await surface.invoke('sam_list_notifications',{legal_entity_id:A},{actor:'test',systemOwner:false})).ok,false);
  assert.equal((await surface.invoke('sam_list_notifications',{}, {actor:'test',systemOwner:true})).ok,false);
  await db.exec('CREATE ROLE notify_reader; GRANT USAGE ON SCHEMA public TO notify_reader; GRANT SELECT ON owner_notifications TO notify_reader; SET ROLE notify_reader');
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[B]);assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[A]);assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,1);
 }finally{await db.exec('RESET ROLE');await db.close();disable()}
});

test('disabled feature touches no new tables or transport, and projection failures are contained',async()=>{
 disable();const db={connect:async()=>{throw new Error('no database available')}};
 assert.equal((await projectOwnerNotifications(db)).enabled,false);
 assert.equal((await deliverNextOwnerNotification(db,transport(async()=>{throw new Error('must not send')}))).disabled,true);
 const surface=createChatGPTToolSurface();assert.equal((await surface.invoke('sam_list_notifications',{legal_entity_id:A},{actor:'test',systemOwner:true})).ok,true);
 process.env.SAM_NOTIFICATIONS_ENABLED='true';assert.equal((await runOwnerNotificationTick(db)).errorCode,'NOTIFICATION_PROJECTION_FAILED');disable();
});


test('a second delivery worker cannot claim an in-flight notification while transport waits',async()=>{
 enable();const db=await fixture();let release:any,started:any;
 const waiting=new Promise<void>(r=>{started=r}),allow=new Promise<void>(r=>{release=r});
 let sends=0;
 try{
  await routed(db);
  const t=transport(async()=>{sends++;started();await allow;return {receiptId:'single-receipt',status:'CONFIRMED'}});
  const first=deliverNextOwnerNotification(pool(db),t);await waiting;
  assert.equal((await deliverNextOwnerNotification(pool(db),t)).processed,false);
  release();assert.equal((await first).status,'CONFIRMED');assert.equal(sends,1);
 }finally{release?.();await db.close();disable()}
});


test('a transport deadline is uncertain and a late receipt never causes an automatic resend or false confirmation',async()=>{
 enable();const db=await fixture();let finish:any;const provider=new Promise<any>(r=>{finish=r});let sends=0;
 try{
  const n=await routed(db);const t=transport(async()=>{sends++;return provider});
  assert.equal((await deliverNextOwnerNotification(pool(db),t,{timeoutMs:5})).status,'UNKNOWN');
  finish({receiptId:'late-provider-receipt',status:'CONFIRMED'});await Promise.resolve();
  assert.equal((await deliverNextOwnerNotification(pool(db),t)).processed,false);assert.equal(sends,1);
  const row:any=(await db.query('SELECT * FROM owner_notifications WHERE id=$1',[n.id])).rows[0];assert.equal(row.status,'UNKNOWN');assert.equal(row.confirmed_at,null);
 }finally{finish?.({receiptId:'cleanup',status:'CONFIRMED'});await db.close();disable()}
});
