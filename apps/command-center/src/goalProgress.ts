import {readReportResolution} from '../../production/src/readReportResolution';
/** Presentation projection only. Never turns a status flag into verification. */
export function goalProgress(input:{goal:any;work:any[];executions:any[];verifications:any[];reports:any[];audit?:any[]}){
 const {goal}=input;
 const work=input.work.filter(w=>w.plan_id===goal.current_plan_id);
 const executions=input.executions.filter(e=>e.plan_id===goal.current_plan_id&&e.status==='EXECUTED');
 const reports=input.reports.filter(r=>r.plan_id===goal.current_plan_id);
 const report=reports.at(-1)??null;
 const latest=new Map<string,any>();
 for(const v of [...input.verifications].sort((a,b)=>String(a.checked_at).localeCompare(String(b.checked_at))||String(a.id).localeCompare(String(b.id))))latest.set(v.execution_id,v);
 const verified=executions.filter(e=>{const v=latest.get(e.id);return v?.result==='VERIFIED'&&v.plan_hash===e.plan_hash&&v.execution_hash===e.execution_hash;}).length;
 const complete=work.length>0&&work.every(w=>w.status==='EXECUTED'&&executions.filter(e=>e.queue_id===w.id).length===1)&&executions.length===work.length&&verified===executions.length;
 const decision=report?.decision;
 const receipt=[...(input.audit??[])].reverse().find(a=>a.action==='READ_REVIEW_BUDGET'&&a.after_ref?.planId===goal.current_plan_id)?.after_ref?.runtimeReview;
 const pendingRetry=!report&&receipt?.retryable===true&&receipt.attempts<2&&receipt.callsUsed<4&&Boolean(goal.next_wake_at);
 const resolution=decision?readReportResolution(decision.status==='complete'&&!(goal.state==='COMPLETED'&&complete)?{status:'blocked',limitations:['REVIEW_CURRENT_VERIFICATION_UNPROVEN']}:decision,false):receipt?(['WAITING_EXTERNAL','BLOCKED'].includes(goal.state)?readReportResolution({status:'blocked',limitations:[receipt.errorCode??'REVIEW_PENDING'],runtimeReview:receipt},pendingRetry):{...readReportResolution({status:'continue'}),nextAction:'Wait for the current bounded review; verified source work is retained.'}):null;
 const displayState=goal.state==='WAITING_EXTERNAL'&&resolution?.disposition==='STOPPED'?'BLOCKED':goal.state==='COMPLETED'?(complete&&decision?.status==='complete'?'VERIFIED':'EXECUTION_COMPLETE'):goal.state;
 return {displayState,executionState:goal.state,lastProgressAt:goal.updated_at,startedAt:goal.created_at,
  currentPlanId:goal.current_plan_id,workCount:work.length,executedCount:executions.length,verifiedCount:verified,
  attempts:work.reduce((n,w)=>n+Number(w.attempt??0),0),tools:[...new Set(work.map(w=>w.capability_id))],
  agents:[...new Set(executions.map(e=>e.actor).filter(Boolean))],
  resolution,finalReport:decision??null,reportVerified:displayState==='VERIFIED',
  blockedReason:decision?.status==='blocked'?(Array.isArray(decision.limitations)?decision.limitations.map(String):[]):goal.replan_reason?[String(goal.replan_reason)]:[]};
}
