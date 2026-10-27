/** Synthetic PostgreSQL fixture only: optional integration table and ACLs. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {pool} from '../../packages/db/src/client';
import {commandCenterGoalTimeline} from '../../apps/command-center/src/store';
const entity='11111111-1111-4111-8111-111111111111',goal='22222222-2222-4222-8222-222222222222';
test('synthetic core timeline survives missing or SELECT-denied reports and exposes RLS visibility',async()=>{
 const db=new PGlite(),original=pool.connect;let reportReads=0;
 (pool as any).connect=async()=>({release(){},async query(sql:string,args?:any[]){if(sql.startsWith('SELECT * FROM goal_read_reviews'))reportReads++;const r=await db.query(sql,args);return {...r,rowCount:r.rows.length};}});
 try{
  await db.exec(`CREATE TABLE goals(id UUID,company_scope UUID);
   CREATE TABLE plans(goal_id UUID,version INT);
   CREATE TABLE work_queue(goal_id UUID,queued_at TIMESTAMPTZ,id UUID);
   CREATE TABLE executions(id UUID,goal_id UUID,started_at TIMESTAMPTZ);
   CREATE TABLE verifications(execution_id UUID,checked_at TIMESTAMPTZ,id UUID);
   CREATE TABLE audit_log(goal_id UUID,timestamp TIMESTAMPTZ,id UUID);
   CREATE TABLE approvals(goal_id UUID,legal_entity_id UUID,created_at TIMESTAMPTZ,id UUID);`);
  await db.query('INSERT INTO goals VALUES($1,$2)',[goal,entity]);
  let timeline=await commandCenterGoalTimeline(entity,goal);
  assert.equal(timeline?.goal.id,goal);assert.deepEqual(timeline?.reports,[]);assert.equal(timeline?.reportsAvailability,'MISSING_INTEGRATION_TABLE');assert.equal(reportReads,0);
  await db.exec(`CREATE TABLE goal_read_reviews(id UUID,goal_id UUID,round INT,created_at TIMESTAMPTZ,report_hash TEXT);
   CREATE ROLE timeline_reader;
   GRANT SELECT ON goals,plans,work_queue,executions,verifications,audit_log,approvals TO timeline_reader;`);
  await db.query('INSERT INTO goal_read_reviews VALUES($1,$2,1,now(),$3)',[entity,goal,'exact-original-hash']);
  await db.exec('SET ROLE timeline_reader');
  timeline=await commandCenterGoalTimeline(entity,goal);
  assert.equal(timeline?.goal.id,goal);assert.deepEqual(timeline?.reports,[]);assert.equal(timeline?.reportsAvailability,'PERMISSION_UNAVAILABLE');assert.equal(reportReads,0);
  await db.exec('RESET ROLE');
  timeline=await commandCenterGoalTimeline(entity,goal);
  assert.equal(timeline?.reportsAvailability,'CURRENT_ROLE_RLS_VISIBLE_REPORTS');assert.equal(timeline?.reports[0].report_hash,'exact-original-hash');assert.equal(reportReads,1);
  assert.equal(await commandCenterGoalTimeline(goal,goal),null);
 }finally{pool.connect=original;await db.close();}
});
