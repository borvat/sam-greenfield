import assert from 'node:assert/strict';
import {pool,withTransaction} from '../../packages/db/src/client';
import {withCommitAdmission} from '../../packages/db/src/commitAdmission';
import {openOrdinaryGoalAllowance} from '../../apps/production/src/ordinaryGoalAllowance';
import {transitionGoal} from '../../apps/kernel/src/stateMachine';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture();
 for(const [from,to] of [['PLANNING','FAILED'],['EXECUTING','FAILED'],['MODELING','BLOCKED'],['VERIFYING','COMPLETED'],['VERIFYING','WAITING_EXTERNAL'],['PLANNING','WAITING_OWNER']] as const){
  const id=await f.goal('Atomic ordinary lifecycle fixture');await pool.query("UPDATE goals SET completion_definition='sam.read_report.v1' WHERE id=$1",[id]);
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result,after_ref) VALUES('fixture',$1,'SAM_GOAL_SUBMITTED','sam_mcp','GREEN','CREATED','{"ordinaryGeneralAgentV1":true}')`,[id]);
  const a=await openOrdinaryGoalAllowance({rootGoalId:id,tenant:f.entity,policy:{version:1,capabilityHash:'a'.repeat(64),limits:ceiling,prices:[{providerId:'fixture',model:'fixture',inputPer1k:1,outputPer1k:1}]}});
  await pool.query('UPDATE goals SET state=$2 WHERE id=$1',[id,from]);
  if(from==='PLANNING'&&to==='FAILED'){
   await assert.rejects(withCommitAdmission(c=>a.commit(c),()=>withTransaction(async c=>{
    await c.query('SAVEPOINT closure');await transitionGoal(c,id,from,to,'rolled_back_closure');await c.query('ROLLBACK TO SAVEPOINT closure');
    await c.query('UPDATE goals SET state=$2 WHERE id=$1',[id,to]);
   }),true),/GOAL_CLOSED/);
   assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state,from);
  }
  await withCommitAdmission(c=>a.commit(c),async()=>{
   await withTransaction(c=>transitionGoal(c,id,from,to,'fixture_atomic_closure'));
   // Same admission scope and pooled connection, but new PostgreSQL transaction.
   await assert.rejects(withTransaction(c=>c.query('UPDATE goals SET priority=priority+1 WHERE id=$1',[id])),/GOAL_CLOSED/);
   await assert.rejects(withTransaction(c=>c.query("UPDATE outbox_events SET status='PUBLISHED' WHERE aggregate_id=$1",[id])),/GOAL_CLOSED/);
  },true);
  assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state,to);
  assert.equal((await pool.query('SELECT priority FROM goals WHERE id=$1',[id])).rows[0].priority,0);
  assert.equal((await pool.query("SELECT count(*)::int n FROM outbox_events WHERE aggregate_id=$1 AND status='PUBLISHED'",[id])).rows[0].n,0);
  console.log('PASS own terminal transition and rejection of later transaction',from,to);
 }
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
