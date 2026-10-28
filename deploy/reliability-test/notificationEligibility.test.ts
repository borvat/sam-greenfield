/** Notification eligibility only; local synthetic PostgreSQL, no memory acceptance. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {acceptanceFixture,seedAcceptanceNotification,inspectNotificationGoal} from './ownerAcceptance';
import {parseAcceptanceOperation} from './ownerAcceptanceOperator';
const company='2796e0d9-1701-4e53-a7ac-d198c0e44c01',goal='33333333-3333-4333-8333-333333333333',other='44444444-4444-4444-8444-444444444444';
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid,business_id text UNIQUE,objective text,domain text,state text,authority_ceiling text,parent_goal_id uuid,current_plan_id uuid);
 CREATE TABLE evaluation_companies(legal_entity_id uuid PRIMARY KEY,purpose text);
 CREATE TABLE evaluation_trials(root_goal_id uuid,legal_entity_id uuid);
 CREATE TABLE plans(id uuid PRIMARY KEY,goal_id uuid);
 CREATE TABLE work_queue(id uuid PRIMARY KEY,goal_id uuid);
 CREATE TABLE executions(id uuid PRIMARY KEY,goal_id uuid);
 CREATE TABLE owner_notifications(id uuid PRIMARY KEY,legal_entity_id uuid,goal_id uuid,dedup_key text UNIQUE,kind text,severity text,title text,body jsonb,status text);`);
 await db.query("INSERT INTO evaluation_companies VALUES($1,'SYNTHETIC_EVALUATION_ONLY')",[company]);
 await db.query("INSERT INTO goals VALUES($1,$2,'G000001','Read-only synthetic startup check. Execution remains disabled.','owner_command','NEW','GREEN',NULL,NULL)",[goal,company]);
 const queries:string[]=[];
 const c={async query(sql:string,args:any[]=[]){queries.push(sql);const r=await db.query(sql,args);return {...r,rowCount:r.rows.length};}};
 return {db,c,queries};
}
test('zero-trial exact existing synthetic startup goal can seed one labelled notification and deduplicate',async()=>{
 const {db,c}=await fixture();
 try{
  assert.equal((await db.query('SELECT * FROM evaluation_trials')).rows.length,0);
  await c.query('BEGIN');const first=await seedAcceptanceNotification(c,company,goal);await c.query('COMMIT');
  await c.query('BEGIN');const repeated=await seedAcceptanceNotification(c,company,goal);await c.query('COMMIT');
  assert.deepEqual(repeated,first);assert.equal(first.notificationId,acceptanceFixture.notificationId);assert.equal(first.status,'UNROUTED');
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,1);
 }finally{await db.close();}
});
test('read-only inspection exposes only one eligible goal provenance and CLI refuses invalid arguments',async()=>{
 const {db,c,queries}=await fixture();
 try{
  await c.query('BEGIN READ ONLY');const result=await inspectNotificationGoal(c,company);await c.query('ROLLBACK');
  assert.equal(result.goal.id,goal);assert.equal(result.goal.company_scope,company);assert.equal(result.eligibility,'EXACT_SYNTHETIC_STARTUP_GOAL');
  assert.deepEqual(Object.keys(result.goal).sort(),['authority_ceiling','business_id','company_scope','current_plan_id','domain','id','objective','parent_goal_id','state']);
  assert.deepEqual(queries.filter(q=>!/^(SELECT|BEGIN READ ONLY|ROLLBACK)\b/.test(q)),[]);
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
  assert.deepEqual(parseAcceptanceOperation(['--inspect-notification-goal']),{mode:'--inspect-notification-goal',goalId:undefined});
  assert.deepEqual(parseAcceptanceOperation(['--seed-notification',goal]),{mode:'--seed-notification',goalId:goal});
  assert.equal(parseAcceptanceOperation(['--verify']).mode,'--verify');
  for(const args of [[],['--unknown'],['--inspect-notification-goal',goal],['--verify',goal],['--seed-notification'],['--seed-notification','invalid'],['--seed-notification',goal,'extra']])assert.throws(()=>parseAcceptanceOperation(args),/EXPLICIT_UI_ACCEPTANCE_OPERATION_REQUIRED/);
 }finally{await db.close();}
});
test('fallback rejects changed goal identity, scope, authority, enrollment and every direct execution association before insert',async()=>{
 const {db,c,queries}=await fixture();
 const attacks=[
  "UPDATE goals SET company_scope='44444444-4444-4444-8444-444444444444'",
  "UPDATE goals SET business_id='G000002'","UPDATE goals SET objective='synthetic but not the approved startup fixture'",
  "UPDATE goals SET domain='other'","UPDATE goals SET state='PLANNING'","UPDATE goals SET authority_ceiling='YELLOW'",
  "UPDATE goals SET parent_goal_id='44444444-4444-4444-8444-444444444444'",
  "UPDATE goals SET current_plan_id='44444444-4444-4444-8444-444444444444'",
  "UPDATE evaluation_companies SET purpose='OTHER'",'DELETE FROM evaluation_companies',
  ...['plans','work_queue','executions'].map(table=>`INSERT INTO ${table} VALUES('${other}','${goal}')`)
 ];
 try{
  for(const attack of attacks){
   await c.query('BEGIN');await db.exec(attack);const start=queries.length;
   await assert.rejects(seedAcceptanceNotification(c,company,goal),/EXACT_SYNTHETIC_GOAL_REQUIRED/);
   assert.deepEqual(queries.slice(start).filter(q=>/^INSERT INTO owner_notifications/.test(q)),[]);await c.query('ROLLBACK');
  }
  await c.query('BEGIN');await assert.rejects(seedAcceptanceNotification(c,company,other),/EXACT_SYNTHETIC_GOAL_REQUIRED/);await c.query('ROLLBACK');
  await c.query('BEGIN');const wrongCompanyStart=queries.length;
  await assert.rejects(seedAcceptanceNotification(c,other,goal),/EXACT_SYNTHETIC_GOAL_REQUIRED/);
  assert.equal(queries.slice(wrongCompanyStart).some(q=>q.includes('NOT EXISTS(SELECT 1 FROM plans')),false);
  await c.query('ROLLBACK');
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
  // Associations to a different goal must not exclude this direct-goal fixture.
  for(const table of ['plans','work_queue','executions'])await db.query(`INSERT INTO ${table} VALUES($1,$2)`,[other,other]);
  await c.query('BEGIN');await seedAcceptanceNotification(c,company,goal);await c.query('COMMIT');
 }finally{await db.close();}
});
test('seed rechecks eligibility after inspection; zero and multiple discovery matches fail closed',async()=>{
 const {db,c}=await fixture();
 try{
  await inspectNotificationGoal(c,company);
  await db.query("UPDATE goals SET state='PLANNING' WHERE id=$1",[goal]);
  await c.query('BEGIN');await assert.rejects(seedAcceptanceNotification(c,company,goal),/EXACT_SYNTHETIC_GOAL_REQUIRED/);await c.query('ROLLBACK');
  await assert.rejects(inspectNotificationGoal(c,company),/EXACT_SYNTHETIC_GOAL_REQUIRED/);
  await db.query("UPDATE goals SET state='NEW' WHERE id=$1",[goal]);
  await db.query("INSERT INTO goals(id,company_scope,business_id) VALUES($1,$2,'OTHER-TRIAL')",[other,company]);
  await db.query('INSERT INTO evaluation_trials VALUES($1,$2)',[other,company]);
  await assert.rejects(inspectNotificationGoal(c,company),/EXACT_SYNTHETIC_GOAL_REQUIRED/);
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,0);
 }finally{await db.close();}
});
test('original enrolled evaluation-trial branch remains valid and notification conflicts remain refused',async()=>{
 const {db,c}=await fixture();
 try{
  await db.query("UPDATE goals SET business_id='EXISTING-TRIAL',objective='Existing synthetic trial',domain='evaluation',state='COMPLETED' WHERE id=$1",[goal]);
  await db.query('INSERT INTO evaluation_trials VALUES($1,$2)',[goal,company]);
  assert.equal((await inspectNotificationGoal(c,company)).eligibility,'EXISTING_EVALUATION_TRIAL');
  await c.query('BEGIN');await seedAcceptanceNotification(c,company,goal);await c.query('COMMIT');
  await db.query("UPDATE owner_notifications SET body='{}'");
  await c.query('BEGIN');await assert.rejects(seedAcceptanceNotification(c,company,goal),/EXACT_SYNTHETIC_NOTIFICATION_CONFLICT/);await c.query('ROLLBACK');
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,1);
 }finally{await db.close();}
});
test('missing required SELECT permission prevents inspection and fallback seed before notification insert',async()=>{
 const {db,c,queries}=await fixture();
 try{
  await db.exec(`CREATE ROLE synthetic_notification_without_plan_select;
   GRANT SELECT ON goals,evaluation_companies,evaluation_trials,work_queue,executions,owner_notifications TO synthetic_notification_without_plan_select;
   GRANT INSERT ON owner_notifications TO synthetic_notification_without_plan_select;
   SET ROLE synthetic_notification_without_plan_select;`);
  await assert.rejects(inspectNotificationGoal(c,company),(e:any)=>e.code==='42501');
  await c.query('BEGIN');const start=queries.length;
  await assert.rejects(seedAcceptanceNotification(c,company,goal),(e:any)=>e.code==='42501');await c.query('ROLLBACK');
  assert.deepEqual(queries.slice(start).filter(q=>/^INSERT INTO owner_notifications/.test(q)),[]);
 }finally{await db.exec('RESET ROLE');await db.close();}
});
