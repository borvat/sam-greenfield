/** Runtime-owned disposition. A verified read is not a verified business answer.
 * No new authority, retry, source fact or automatic wake is created here.
 */
export function readReportResolution(decision:any, retryable=false){
 if(decision?.status==='continue')return {version:1,outcome:'pending',disposition:'IN_PROGRESS',reasonCode:null,
  nextAction:'Execute and independently verify the persisted follow-up plan within the existing authority and budget.',
  resumeCondition:null,automaticResume:false};
 const complete=decision?.status==='complete';
 const partial=!complete&&Array.isArray(decision?.findings)&&decision.findings.length>0&&
  decision.requirements?.some((r:any)=>r.fulfilled===true&&r.evidenceIds?.length>0);
 const reasons=Array.isArray(decision?.limitations)?decision.limitations.filter((s:any)=>typeof s==='string'):[];
 const code=decision?.runtimeReview?.errorCode??reasons.find((s:string)=>/^REVIEW_[A-Z_]+$/.test(s))??null;
 const inputBlocked=reasons.some((s:string)=>/REVIEW_(EVIDENCE_PROJECTION_BLOCKED|INPUT_BUDGET_EXCEEDED|SOURCE_BUDGET_EXCEEDED)/.test(s));
 const evidenceGap=reasons.some((s:string)=>s.startsWith('REVIEW_MONETARY_COVERAGE_UNPROVEN'));
 return {version:1,outcome:complete?'complete':partial?'partial':'blocked',
  disposition:complete?'FINISHED':retryable?'BOUNDED_RETRY_SCHEDULED':'STOPPED',
  reasonCode:code??(evidenceGap?'REVIEW_MONETARY_COVERAGE_UNPROVEN':complete?null:'REVIEW_REQUIREMENTS_UNPROVEN'),
  nextAction:complete?'Read the final report and its source citations.':retryable?
   'Wait for the scheduled review retry; reuse verified reads within the existing budget.':
   inputBlocked?'Repair the bounded evidence projection and verify it on a newly authorized goal.':
   evidenceGap?'Obtain verified requested-period monetary evidence, including currency, coverage and VAT basis, then test with a new authorized goal.':
   'Inspect the retained report and review diagnostics; resolve the unmet requirements before testing a new authorized goal.',
  resumeCondition:complete?null:retryable?'Scheduled wake is due and the original review attempt/call limits remain available.':
   'No automatic resume. A corrected dependency or release and a new authorized goal are required; preserve the old goal and its budget.',
  automaticResume:retryable&&!complete};
}
