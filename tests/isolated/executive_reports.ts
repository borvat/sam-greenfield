/** Isolated scheduler/delivery state proofs. Adapter sends are in-process fixtures only. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {dueReportPeriods,configureExecutiveReports,generateExecutiveReports,claimExecutiveDelivery,finishExecutiveDelivery,recoverExecutiveDeliveries} from '../../apps/notifications/src/executiveReports';
import {runExecutiveReportTick} from '../../apps/notifications/src/executiveRuntime';
import {pool} from '../../packages/db/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const id=(n:number)=>'22222222-2222-4222-8222-'+n.toString(16).padStart(12,'0');
const company=id(1),foreign=id(2),org=id(3),goal=id(4),plan=id(5),queue=id(6),execution=id(7);
const context={actor:'owner-fixture',systemOwner:true,legalEntityId:company};
const schedule={timezone:'Asia/Damascus',daily_time:'08:00',weekly_time:'08:00',weekly_day:0};
const now=new Date('2026-11-01T05:00:00Z');
async function fixture(){
 const db=new PGlite();
 const c={async query(sql:string,args?:any[]){const r=await db.query(sql,args);return {...r,rowCount:r.rows.length};}} as any;
 await db.exec(`CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_org_id',true),'')::uuid $$;
 CREATE FUNCTION current_legal_entity_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_legal_entity_id',true),'')::uuid $$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY,org_id uuid);
 CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid,current_plan_id uuid,state text,priority int DEFAULT 50,updated_at timestamptz DEFAULT now());
 CREATE TABLE work_queue(id uuid PRIMARY KEY,goal_id uuid,plan_id uuid,capability_id text,status text,wake_reason text,queued_at timestamptz DEFAULT now());
 CREATE TABLE executions(id uuid PRIMARY KEY,queue_id uuid,plan_id uuid,actor text,plan_hash text,execution_hash text,started_at timestamptz DEFAULT now(),finished_at timestamptz);
 CREATE TABLE verifications(id uuid PRIMARY KEY,execution_id uuid,result text,verifier text,plan_hash text,execution_hash text,checked_at timestamptz DEFAULT now());`);
 await c.query('SELECT set_config($1,$2,false),set_config($3,$4,false)',['app.current_org_id',org,'app.current_legal_entity_id',company]);
 await c.query('INSERT INTO legal_entities VALUES($1,$3),($2,$3)',[company,foreign,org]);
 await c.query("INSERT INTO goals(id,company_scope,current_plan_id,state) VALUES($1,$2,$3,'WAITING_OWNER')",[goal,company,plan]);
 await c.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status) VALUES($1,$2,$3,'fixture.read','EXECUTED')",[queue,goal,plan]);
 await c.query("INSERT INTO executions(id,queue_id,plan_id,actor,plan_hash,execution_hash,finished_at) VALUES($1,$2,$3,'executor','p','e',now())",[execution,queue,plan]);
 await c.query("INSERT INTO verifications VALUES($1,$2,'VERIFIED','independent-verifier','p','e',now())",[id(8),execution]);
 await db.exec(readFileSync('packages/db/integration-migrations/00107_executive_reports.sql','utf8'));
 return {db,c,async close(){await db.close();}};
}
test('local calendar defaults, boundary, latest missed run, DST fold and gap',()=>{
 const due=dueReportPeriods(schedule,now);assert.deepEqual(due.map(p=>p.period),['2026-11-01','2026-11-01']);assert.equal(due[0].plannedAt.toISOString(),now.toISOString());
 const before=dueReportPeriods(schedule,new Date('2026-11-01T04:59:00Z'));assert.deepEqual(before.map(p=>p.period),['2026-10-31','2026-10-25']);
 const fold=dueReportPeriods({...schedule,timezone:'America/New_York',daily_time:'01:30',weekly_time:'01:30'},new Date('2026-11-01T06:15:00Z'));
 assert.deepEqual(fold.map(p=>p.period),['2026-11-01','2026-11-01']);assert.equal(fold[0].plannedAt.toISOString(),'2026-11-01T05:30:00.000Z');
 const gap=dueReportPeriods({...schedule,timezone:'America/New_York',daily_time:'02:30',weekly_time:'02:30'},new Date('2026-03-08T07:01:00Z'));assert.equal(gap[0].plannedAt.toISOString(),'2026-03-08T07:00:00.000Z');
 assert.throws(()=>dueReportPeriods({...schedule,timezone:'invalid-zone'},now),/SCHEDULE_INVALID/);
 assert.throws(()=>dueReportPeriods({...schedule,weekly_day:7},now),/SCHEDULE_INVALID/);
});
test('persistent snapshots are deduplicated across repeated/concurrent ticks, preserve evidence and tenant scope',async()=>{
 const f=await fixture();try{
  assert.equal((await generateExecutiveReports(f.c,context,now)).reason,'DISABLED_OR_UNCONFIGURED');
  await assert.rejects(configureExecutiveReports(f.c,context,{...schedule,enabled:true,approved:false}),/OWNER_APPROVAL/);
  await configureExecutiveReports(f.c,context,{...schedule,enabled:true,approved:true});
  const results=await Promise.all([generateExecutiveReports(f.c,context,now),generateExecutiveReports(f.c,context,now)]);
  assert.equal(results.reduce((n,r)=>n+r.generated,0),2);
  const rows=(await f.c.query('SELECT * FROM executive_reports ORDER BY report_type')).rows;assert.equal(rows.length,2);
  assert.equal(rows[0].status,'BLOCKED');assert.equal(rows[0].artifact.coverage.sales,'UNKNOWN');assert.equal(rows[0].artifact.tasks[0].execution_id,execution);assert.equal(rows[0].artifact_hash,sha256Hex(rows[0].artifact));assert.equal(rows[1].artifact.meeting.achievements.length,1);
  await f.c.query("UPDATE verifications SET execution_hash='changed' WHERE execution_id=$1",[execution]);
  assert.equal((await generateExecutiveReports(f.c,context,new Date('2026-11-01T07:00:00Z'))).generated,0);
  assert.equal((await f.c.query('SELECT artifact_hash FROM executive_reports ORDER BY report_type')).rows[0].artifact_hash,rows[0].artifact_hash);
  const nextWeek=new Date('2026-11-08T05:00:00Z');assert.equal((await generateExecutiveReports(f.c,context,nextWeek)).generated,2);
  const changed=(await f.c.query("SELECT artifact FROM executive_reports WHERE report_type='WEEKLY' AND period_key='2026-11-08'")).rows[0].artifact;assert.equal(changed.meeting.achievements.length,0);
  await assert.rejects(generateExecutiveReports(f.c,{...context,legalEntityId:foreign},now),/AUTHORIZED_COMPANY/);
  await f.db.exec('CREATE ROLE report_fixture_reader;GRANT USAGE ON SCHEMA public TO report_fixture_reader;GRANT SELECT,INSERT,UPDATE ON executive_reports,executive_report_settings,executive_report_attempts TO report_fixture_reader;');
  await f.c.query('SELECT set_config($1,$2,false)',['app.current_legal_entity_id',foreign]);await f.db.exec('SET ROLE report_fixture_reader');
  assert.equal((await f.c.query('SELECT * FROM executive_reports')).rows.length,0);
  await assert.rejects(f.c.query('INSERT INTO executive_report_settings(legal_entity_id) VALUES($1)',[company]),/row-level security/);
 }finally{await f.close();}
});
test('delivery fencing, safe retries, ambiguity, tampering and restart never blindly replay',async()=>{
 const f=await fixture();try{
  await configureExecutiveReports(f.c,context,{...schedule,enabled:true,approved:true,channel:'fixture',recipientRef:'owner-ref'});
  await generateExecutiveReports(f.c,context,now);
  let claim=await claimExecutiveDelivery(f.c,context,'fixture',now);assert.ok(claim);
  const otherClaim=await claimExecutiveDelivery(f.c,context,'fixture',now);assert.ok(otherClaim);assert.notEqual(otherClaim.id,claim.id);
  assert.equal(await claimExecutiveDelivery(f.c,context,'fixture',now),null);
  let delivery=await finishExecutiveDelivery(f.c,context,claim,{outcome:'RETRY',retrySafe:true},now);assert.equal(delivery.status,'RETRY');
  const later=new Date(now.getTime()+121000);claim=await claimExecutiveDelivery(f.c,context,'fixture',later);assert.ok(claim);assert.equal(claim.attempt,2);
  await finishExecutiveDelivery(f.c,context,claim,{outcome:'RETRY',retrySafe:true},later);
  const third=new Date(later.getTime()+241000);claim=await claimExecutiveDelivery(f.c,context,'fixture',third);assert.equal(claim.attempt,3);
  delivery=await finishExecutiveDelivery(f.c,context,claim,{outcome:'RETRY',retrySafe:true},third);assert.equal(delivery.status,'FAILED');
  assert.equal((await f.c.query('SELECT status FROM executive_reports WHERE id=$1',[otherClaim.id])).rows[0].status,'UNKNOWN');
  await assert.rejects(finishExecutiveDelivery(f.c,context,otherClaim,{outcome:'CONFIRMED',receiptId:'late-receipt'},third),/FENCE_REJECTED/);
  assert.equal(await claimExecutiveDelivery(f.c,context,'fixture',third),null);
  const next=new Date('2026-11-02T05:00:00Z');await generateExecutiveReports(f.c,context,next);claim=await claimExecutiveDelivery(f.c,context,'fixture',next);
  assert.equal((await finishExecutiveDelivery(f.c,context,claim,{outcome:'RETRY'} as any,next)).status,'UNKNOWN');
  const next2=new Date('2026-11-03T05:00:00Z');await generateExecutiveReports(f.c,context,next2);claim=await claimExecutiveDelivery(f.c,context,'fixture',next2);
  assert.equal((await finishExecutiveDelivery(f.c,context,claim,{outcome:'ACCEPTED',receiptId:'fixture-receipt'},next2)).status,'ACCEPTED');
  assert.equal((await f.c.query('SELECT receipt_id,sent_at FROM executive_reports WHERE id=$1',[claim.id])).rows[0].receipt_id,'fixture-receipt');
  const next3=new Date('2026-11-04T05:00:00Z');await generateExecutiveReports(f.c,context,next3);await f.c.query("UPDATE executive_reports SET artifact='{}' WHERE period_key='2026-11-04'");
  assert.equal(await claimExecutiveDelivery(f.c,context,'fixture',next3),null);assert.equal((await f.c.query("SELECT last_error_code FROM executive_reports WHERE period_key='2026-11-04'")).rows[0].last_error_code,'ARTIFACT_HASH_MISMATCH');
  assert.equal((await recoverExecutiveDeliveries(f.c,context,next3)).ambiguous,0);
 }finally{await f.close();}
});
test('runtime is inert by default, blocks absent adapter, and records timeout as ambiguous with no resend',async t=>{
 const f=await fixture(),original=pool.connect;
 const keys=['SAM_EXECUTIVE_REPORTS_ENABLED','SAM_DEFAULT_LEGAL_ENTITY_ID'] as const,prior=keys.map(k=>process.env[k]);
 let dbAccess=0;
 (pool as any).connect=async()=>{dbAccess++;return {...f.c,release(){}};};
 t.after(async()=>{t.mock.timers.reset();pool.connect=original;keys.forEach((k,i)=>{if(prior[i]===undefined)delete process.env[k];else process.env[k]=prior[i];});await f.close();});
 delete process.env.SAM_EXECUTIVE_REPORTS_ENABLED;assert.deepEqual(await runExecutiveReportTick(),{enabled:false});assert.equal(dbAccess,0);
 process.env.SAM_EXECUTIVE_REPORTS_ENABLED='1';process.env.SAM_DEFAULT_LEGAL_ENTITY_ID=company;
 await configureExecutiveReports(f.c,context,{...schedule,enabled:true,approved:true,channel:'fixture',recipientRef:'owner-ref'});
 assert.equal((await runExecutiveReportTick()).delivery,'BLOCKED_ADAPTER_UNCONFIGURED');
 let sent=0,signal:AbortSignal|undefined,start!:()=>void;const started=new Promise<void>(resolve=>{start=resolve;});
 t.mock.timers.enable({apis:['setTimeout']});
 const running=runExecutiveReportTick({channel:'fixture',async send(input){sent++;signal=input.signal;start();return new Promise(()=>{});}});
 await started;t.mock.timers.tick(45000);const outcome=await running;
 assert.equal((outcome.delivery as any).status,'UNKNOWN');assert.ok(signal?.aborted);assert.equal(sent,1);
 // A fresh tick can consider the other report, but never the ambiguous report ID.
 const ambiguous=(await f.c.query("SELECT id FROM executive_reports WHERE status='UNKNOWN'")).rows[0].id;
 await runExecutiveReportTick({channel:'fixture',async send(input){assert.notEqual(input.reportId,ambiguous);return {outcome:'CONFIRMED',receiptId:'fixture-confirmed'};}});
 assert.equal((await f.c.query('SELECT status FROM executive_reports WHERE id=$1',[ambiguous])).rows[0].status,'UNKNOWN');
});
