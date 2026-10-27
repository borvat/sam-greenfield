/** Only runtime-owned allowlisted diagnostics; provider messages never persist. */
const codes=new Set(['REVIEW_SOURCE_BUDGET_EXCEEDED','REVIEW_EVIDENCE_PROJECTION_BLOCKED','REVIEW_INPUT_BUDGET_EXCEEDED','REVIEW_MODEL_DEADLINE','REVIEW_CALL_FAILED','REVIEW_CRITIQUE_REJECTED','REVIEW_FAILED','RESEARCH_PLAN_REQUIRED','RESEARCH_QUESTIONS_INVALID','RESEARCH_QUESTION_INVALID','RESEARCH_STOP_CONDITIONS_REQUIRED','RESEARCH_COST_BUDGET_INVALID','REVIEW_RUNTIME_FAILED']);
export function safeReviewCode(error:unknown){
 const code=error instanceof Error?error.message.split(':')[0]:'';
 return codes.has(code)?code:'REVIEW_RUNTIME_FAILED';
}
export async function recordReviewDiagnostic(client:any,input:{goalId:string;planId:string;code:string;phase:'preflight'|'runtime';beforeFirstReservation:boolean}){
 const diagnostic={planId:input.planId,code:codes.has(input.code)?input.code:'REVIEW_RUNTIME_FAILED',phase:input.phase,
  beforeFirstReservation:input.beforeFirstReservation,nextAction:input.phase==='preflight'?'INSPECT_CONFIGURATION_AND_VERIFIED_EVIDENCE_THEN_OWNER_CONTINUE':'INSPECT_REVIEW_BUDGET_AND_REPORT; NEW_AUTHORIZATION_IF_EXHAUSTED'};
 await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES('read_review',$1,'READ_REVIEW_DIAGNOSTIC','goal',$1,$2::jsonb,'runtime','GREEN','WAITING')`,[input.goalId,JSON.stringify(diagnostic)]);
 return diagnostic;
}
export async function hasPreflightRecoveryEvidence(client:any,goalId:string,planId:string){
 const row=(await client.query(`SELECT 1 FROM audit_log d WHERE d.goal_id=$1 AND d.action='READ_REVIEW_DIAGNOSTIC'
  AND d.after_ref->>'planId'=$2 AND d.after_ref->>'phase'='preflight' AND d.after_ref->>'beforeFirstReservation'='true'
  AND NOT EXISTS(SELECT 1 FROM audit_log b WHERE b.goal_id=$1 AND b.action='READ_REVIEW_BUDGET' AND b.after_ref->>'planId'=$2)
  LIMIT 1`,[goalId,planId])).rows[0];
 return Boolean(row);
}
