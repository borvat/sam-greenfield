import {withTransaction} from '../../../packages/db/src/client';
import {transitionGoal} from '../../kernel/src/stateMachine';
/** Existing owner action surface and database tenant RLS remain authoritative. */
export async function continueReadReview(input:{goalId:string;legalEntityId:string;actor:string}){
 return withTransaction(async client=>{
  const goal=(await client.query('SELECT * FROM goals WHERE id=$1 AND company_scope=$2 FOR UPDATE',[input.goalId,input.legalEntityId])).rows[0];
  if(!goal)throw Error('REVIEW_GOAL_NOT_FOUND');
  if(goal.completion_definition!=='sam.read_report.v1')throw Error('GOAL_CONTRACT_REQUIRED');
  if(goal.state!=='WAITING_EXTERNAL')throw Error('REVIEW_NOT_WAITING');
  const review=(await client.query('SELECT decision FROM goal_read_reviews WHERE goal_id=$1 AND plan_id=$2',[goal.id,goal.current_plan_id])).rows[0];
  const retry=review?.decision?.runtimeReview;
  // Legacy reviews already consumed their two in-call attempts. Never reset
  // those budgets, infer a new grant, or use a direct read to evade the contract.
  if(!retry||retry.attempts>=2||retry.callsUsed>=4)throw Error('REVIEW_BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION');
  if(retry.retryable!==true)throw Error('REVIEW_NOT_RETRYABLE');
  const valid=await client.query(`SELECT 1 FROM executions e WHERE e.goal_id=$1 AND e.plan_id=$2
   AND (SELECT v.result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)='VERIFIED' LIMIT 1`,[goal.id,goal.current_plan_id]);
  const unfinished=await client.query("SELECT 1 FROM work_queue WHERE goal_id=$1 AND plan_id=$2 AND status<>'EXECUTED' LIMIT 1",[goal.id,goal.current_plan_id]);
  const unverified=await client.query(`SELECT 1 FROM executions e WHERE e.goal_id=$1 AND e.plan_id=$2
   AND (SELECT v.result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1) IS DISTINCT FROM 'VERIFIED' LIMIT 1`,[goal.id,goal.current_plan_id]);
  if(!valid.rowCount||unfinished.rowCount||unverified.rowCount)throw Error('REVIEW_VERIFIED_EVIDENCE_REQUIRED');
  await transitionGoal(client,goal.id,'WAITING_EXTERNAL','VERIFYING','owner_read_review_continuation');
  await client.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[goal.id]);
  await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,source,authority_class,result)
   VALUES($1,$2,'READ_REVIEW_CONTINUATION_REQUESTED','goal',$2,'sam_mcp','GREEN','SCHEDULED')`,[input.actor,goal.id]);
  return {goalId:goal.id,state:'VERIFYING',remainingAttempts:2-retry.attempts,sourceWork:'REUSE_VERIFIED_EXECUTIONS'};
 });
}
