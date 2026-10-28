import {hasPreflightRecoveryEvidence} from '../../kernel/src/readReviewDiagnostic';
import {readReviewBudget,recoverableReadReview,readReviewRecovery} from '../../kernel/src/readReviewBudget';
import {withTransaction} from '../../../packages/db/src/client';
import {transitionGoal} from '../../kernel/src/stateMachine';
/** Existing owner action surface and database tenant RLS remain authoritative. */
export async function continueReadReview(input:{goalId:string;legalEntityId:string;actor:string}){
 return withTransaction(async client=>{
  const goal=(await client.query('SELECT * FROM goals WHERE id=$1 AND company_scope=$2 FOR UPDATE',[input.goalId,input.legalEntityId])).rows[0];
  if(!goal)throw Error('REVIEW_GOAL_NOT_FOUND');
  if(goal.completion_definition!=='sam.read_report.v1')throw Error('GOAL_CONTRACT_REQUIRED');
  const review=(await client.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1 AND plan_id=$2',[goal.id,goal.current_plan_id])).rows.sort((a:any,b:any)=>Number(b.revision??1)-Number(a.revision??1))[0];
  const recovery=await readReviewRecovery(client,goal.id,goal.current_plan_id);
  if(recovery)return {goalId:goal.id,state:goal.state,remainingAttempts:0,sourceWork:'REUSE_VERIFIED_EXECUTIONS',recoveryReportId:review?.id,idempotent:true};
  if(goal.state!=='WAITING_EXTERNAL')throw Error('REVIEW_NOT_WAITING');
  const retry=await readReviewBudget(client,goal.id,goal.current_plan_id);
  const recovering=recoverableReadReview(review,retry);
  // Legacy reviews already consumed their two in-call attempts. Never reset
  // those budgets, infer a new grant, or use a direct read to evade the contract.
  if(review&&!recovering||retry&&(retry.attempts>=2||retry.callsUsed>=4))throw Error('REVIEW_BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION');
  if(!review&&!retry&&!await hasPreflightRecoveryEvidence(client,goal.id,goal.current_plan_id))throw Error('REVIEW_PREFLIGHT_EVIDENCE_REQUIRED');
  if(retry&&!recovering&&retry.retryable!==true)throw Error('REVIEW_NOT_RETRYABLE');
  const valid=await client.query(`SELECT 1 FROM executions e WHERE e.goal_id=$1 AND e.plan_id=$2
   AND (SELECT v.result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)='VERIFIED' LIMIT 1`,[goal.id,goal.current_plan_id]);
  const unfinished=await client.query("SELECT 1 FROM work_queue WHERE goal_id=$1 AND plan_id=$2 AND status<>'EXECUTED' LIMIT 1",[goal.id,goal.current_plan_id]);
  const unverified=await client.query(`SELECT 1 FROM executions e WHERE e.goal_id=$1 AND e.plan_id=$2
   AND (SELECT v.result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1) IS DISTINCT FROM 'VERIFIED' LIMIT 1`,[goal.id,goal.current_plan_id]);
  if(!valid.rowCount||unfinished.rowCount||unverified.rowCount)throw Error('REVIEW_VERIFIED_EVIDENCE_REQUIRED');
  await transitionGoal(client,goal.id,'WAITING_EXTERNAL','VERIFYING','owner_read_review_continuation');
  await client.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[goal.id]);
  await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
   VALUES($1,$2,'READ_REVIEW_CONTINUATION_REQUESTED','goal',$2,$3::jsonb,'sam_mcp','GREEN','SCHEDULED')`,[input.actor,goal.id,JSON.stringify(recovering?{schema:'sam.read_review_recovery.v1',planId:goal.current_plan_id,reportId:review.id,reportHash:review.report_hash,attempts:retry?.attempts??review.decision.runtimeReview.attempts,callsUsed:0}:null)]);
  return {goalId:goal.id,state:'VERIFYING',remainingAttempts:2-(retry?.attempts??review?.decision?.runtimeReview?.attempts??0),sourceWork:'REUSE_VERIFIED_EXECUTIONS'};
 });
}
