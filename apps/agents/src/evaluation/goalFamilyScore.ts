import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {assertExecutionIntegrity} from '../../../brain/src/evidence/verifiedSources';
/** Every persisted operation must have its exact durable pre-dispatch reservation. */
export function assertGoalFamilyOperationLinks(snapshot:any,capture:any){
 for(const reserved of capture.events.filter((e:any)=>e.kind==='RESERVED'&&['tool','readback'].includes(e.payload.kind))){
  const finished=capture.events.find((e:any)=>e.kind==='FINISHED'&&e.reservation_id===reserved.reservation_id&&e.payload.status==='success');
  if(!finished)continue;
  const matches=snapshot.sources.filter((s:any)=>(reserved.payload.kind==='tool'?s.evidence:s.verification_evidence)?.evaluationReservation?.id===reserved.reservation_id);
  if(matches.length!==1)throw Error('EVALUATION_OPERATION_PERSISTENCE_UNCONFIRMED');
 }
 for(const source of snapshot.sources){
  const link=source.evidence?.evaluationReservation;
  const dispatched=capture.events.find((e:any)=>e.kind==='RESERVED'&&e.reservation_id===link?.id&&e.payload.kind==='tool'&&e.payload.queueId===source.queue_id&&e.payload.fencingToken===Number(source.fencing_token)&&e.payload.goalId===source.goal_id);
  const finished=dispatched&&capture.events.find((e:any)=>e.kind==='FINISHED'&&e.reservation_id===dispatched.reservation_id&&e.payload.status==='success');
  if(link?.trialId!==capture.trial.id||!finished||finished.payload.resultHash!==sha256Hex(source.result))throw Error('EVALUATION_EXECUTION_RESERVATION_REQUIRED');
  if(source.verification_id){
   const read=source.verification_evidence?.evaluationReservation;
   const reserved=capture.events.find((e:any)=>e.kind==='RESERVED'&&e.reservation_id===read?.id&&e.payload.kind==='readback'&&e.payload.executionId===source.id&&e.payload.goalId===source.goal_id);
   const verified=reserved&&capture.events.find((e:any)=>e.kind==='FINISHED'&&e.reservation_id===reserved.reservation_id&&e.payload.status==='success');
   if(read?.trialId!==capture.trial.id||!verified||verified.payload.verificationResult!==source.verification_result||verified.payload.verificationEvidenceHash!==sha256Hex(source.verification_evidence))throw Error('EVALUATION_READBACK_RESERVATION_REQUIRED');
  }
 }
}
/** Integrity is distinct from independent objective quality or useful autonomy. */
export function scoreGoalFamilyCapture(capture:any){
 const snapshot=capture.events.at(-1)?.payload,spec=capture.spec;
 const ids=Object.keys(spec.agents).filter(k=>k.startsWith('goal.')).map(k=>k.slice(5)).sort();
 if(snapshot?.format!=='sam.goal-family.v1'||snapshot.root?.id!==capture.trial.root_goal_id||snapshot.root?.state!=='NEW'||ids.length!==3||
  sha256Hex(snapshot.goals?.map((g:any)=>g.id).sort())!==sha256Hex(ids))throw Error('EVALUATION_GOAL_CAPTURE_INVALID');
 assertGoalFamilyOperationLinks(snapshot,capture);
 for(const goal of snapshot.goals){
  const report=snapshot.reports.find((r:any)=>r.goal_id===goal.id&&r.plan_id===goal.currentPlanId);
  if(goal.state==='COMPLETED'&&report?.decision.status!=='complete'||report&&sha256Hex(report.decision)!==report.report_hash)throw Error('EVALUATION_GOAL_CAPTURE_INVALID');
  if(!['COMPLETED','WAITING_EXTERNAL','FAILED','CANCELLED','BLOCKED'].includes(goal.state))throw Error('EVALUATION_GOAL_CAPTURE_INVALID');
  const references=new Set([...(report?.decision.findings??[]).map((f:any)=>f.executionId),...(report?.decision.requirements??[]).flatMap((r:any)=>r.evidenceIds)]);
  for(const reference of references){
   const source=snapshot.sources.find((s:any)=>s.id===reference&&s.goal_id===goal.id);
   if(!source||source.verification_result!=='VERIFIED'||source.execution_hash!==source.verified_hash)throw Error('EVALUATION_EVIDENCE_REVOKED');assertExecutionIntegrity(source);
  }
 }
 return {status:'PASS',classification:spec.mode==='fixture'?'AUTHENTICATED_GOAL_FAMILY_FIXTURE':'AUTHENTICATED_GOAL_FAMILY_MODEL_CAPTURE',traceAuthenticated:true,
  commit:spec.commit,headHash:capture.headHash,wholeTrialUsed:capture.trial.used,declaredCompletedGoals:snapshot.goals.filter((g:any)=>g.state==='COMPLETED').length,
  checks:[{name:'goal-family-capture-integrity',status:'PASS',detail:'Three enrolled terminal goal reports and current source identities; objective quality not evaluated'}],functionalVerdict:'NOT_EVALUATED',liveReasoningValidated:false,independentHumanReview:'PENDING'};
}
