/** Single synthetic artifact repair; execution/testing is delegated to official Modal. */
import {pool,withTransaction} from '../../../packages/db/src/client';
import {createHash} from 'node:crypto';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {HermesClient} from '../../../packages/hermes/src/client';
import {codingProbe,parseCodingArtifact,CODING_OBJECTIVE} from '../../../packages/hermes/src/codingProbe';
import {withHermesCandidate,HERMES_CAPABILITY} from './hermesBundle';
import {validateProductionBundle} from './bundle';
import {transitionGoal} from '../../kernel/src/stateMachine';
import {persistPlanAndDelegate} from '../../kernel/src/planning';
import {evaluatePlanAuthority} from '../../brain/src/authorityGuard';
import {reviewNextReadGoal} from './readGoalReview';

export function hermesCodingBundle(client:HermesClient,verifyArtifact:(id:string,artifact:ReturnType<typeof parseCodingArtifact>)=>Promise<any>){
 return validateProductionBundle(withHermesCandidate({capabilities:[],toolDefinitions:[],toolAdapters:[],workerLeaseTtlSeconds:240},{client,
  verifier:{capabilityId:HERMES_CAPABILITY,async verify(input){
   const row=(await pool.query(`SELECT g.objective,e.result,w.handoff->'hermes' receipt FROM executions e JOIN goals g ON g.id=e.goal_id
    JOIN work_queue w ON w.goal_id=g.id AND w.plan_id=e.plan_id WHERE e.id=$1 AND g.domain='hermes_coding_probe' AND g.current_plan_id=e.plan_id`,[input.execution.id])).rows[0];
   const fail=(reason:string)=>({result:'FAILED' as const,verifier:'sam-modal-independent',evidence:{reason}});
   if(!row||row.objective!==CODING_OBJECTIVE||row.receipt?.runtime?.model_lock!=='confirmed'||row.receipt.runtime.provider!=='nous'||row.receipt.runtime.model!=='poolside/laguna-s-2.1:free')return fail('CODING_NATIVE_LOCK_REQUIRED');
   let artifact;try{artifact=parseCodingArtifact(row.result.candidate);}catch{return fail('CODING_ARTIFACT_DENIED');}
   const checked=await verifyArtifact(input.execution.id,artifact);
   const r=checked?.receipt;
   if(checked?.ok!==true||r?.complete!==true||r.jobId!==input.execution.id||r.sourceHash!==createHash('sha256').update(artifact.files['clamp.py']).digest('hex')||r.independentAssertions!==46||r.wrongCodeRejected!==true||!Array.isArray(r.stages)||r.stages.length!==3||r.stages.some((s:any)=>s.cleanup!==true||typeof s.sandboxId!=="string")||new Set(r.stages.map((s:any)=>s.sandboxId)).size!==3||r.stages.map((s:any)=>s.name).join(",")!=="wrong_control,hermes_requested_tests,sam_independent_tests"||r.stages[0].rejected!==true||r.stages[1].exitCode!==0||r.stages[2].exitCode!==0)return fail('CODING_INDEPENDENT_CHECK_FAILED');
   return {result:'VERIFIED',verifier:'sam-modal-independent',evidence:{candidateHash:sha256Hex(row.result.candidate),independentCheck:'Fresh network-blocked Modal guest with immutable 46-assertion suite; wrong source rejected',sourceHash:r.sourceHash,modalReceipt:r}};
  }}}));
}

export async function prepareHermesCoding(bundle:ReturnType<typeof hermesCodingBundle>,goalId:string,entity:string,activatedAt:string){
 return withTransaction(async c=>{
  const g=(await c.query(`SELECT id,objective FROM goals WHERE id=$1 AND company_scope=$2 AND domain='hermes_coding_probe' AND authority_ceiling='GREEN'
   AND completion_definition='sam.read_report.v1' AND created_at>=$3 AND state='NEW' FOR UPDATE`,[goalId,entity,activatedAt])).rows[0];
  if(!g)return false;
  const prior=(await c.query(`SELECT count(*)::int n FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE g.domain='hermes_coding_probe'`)).rows[0].n;
  if(prior>=1)throw Error('CODING_TASK_CEILING');
  const params={agent_role:'programmer',instructions:codingProbe(g.objective).instructions};
  const authority=await evaluatePlanAuthority(c,{goalId,legalEntityId:entity,steps:[{capabilityId:HERMES_CAPABILITY,params}],capabilityPolicies:bundle.catalog.authorityPolicies()});
  if(!authority.authorized)throw Error('CODING_AUTHORITY_DENIED');
  await transitionGoal(c,goalId,'NEW','MODELING','bounded_coding_probe');await transitionGoal(c,goalId,'MODELING','PLANNING','synthetic_artifact_repair');
  await persistPlanAndDelegate(c,{goalId,assumptions:{integrationProbe:true,planner:'Single synthetic repair with independent sandbox tests'},steps:[{capabilityId:HERMES_CAPABILITY,params}]});return true;
 });
}

export async function reviewHermesCoding(bundle:ReturnType<typeof hermesCodingBundle>,goalId:string){
 return reviewNextReadGoal(bundle,pool,async(input:any)=>{
  const row=(await pool.query(`SELECT e.id,e.result,v.independent_evidence FROM executions e JOIN goals g ON g.id=e.goal_id
   JOIN verifications v ON v.execution_id=e.id AND v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
   WHERE g.id=$1 AND g.domain='hermes_coding_probe' AND g.current_plan_id=e.plan_id AND v.verifier='sam-modal-independent'`,[goalId])).rows[0];
  if(!row||row.independent_evidence.modalReceipt?.complete!==true)throw Error('CODING_VERIFIED_EVIDENCE_REQUIRED');
  const summary='إصلاح clamp اجتاز اختبارات مستقلة داخل Modal.';
  if(input.proposedReport)return {accepted:input.proposedReport.summary===summary&&input.proposedReport.findings?.[0]?.executionId===row.id,missing:[]};
  const source=input.verifiedObservations.find((s:any)=>s.id===row.id),line=source?.lines.findIndex((s:string)=>s.includes('"candidate"'));
  if(!source||line<0||!source.citableLines.includes(line))throw Error('CODING_CITATION_REQUIRED');
  return {status:'complete',summary,requirements:[{requirement:CODING_OBJECTIVE,fulfilled:true,evidenceIds:[row.id]}],findings:[{text:'أنتج Hermes الإصلاح واختباراته؛ شغّل SAM الاختبارات في Modal وتحقق مستقلاً في بيئة جديدة.',executionId:row.id,quoteLine:line,confidence:'HIGH',confidenceBasis:'Independent immutable tests in fresh sandbox'}],limitations:['مهمة مصطنعة واحدة عبر وسيط SAM؛ لا صلاحيات برمجة أو GitHub عامة.'],steps:[]};
 },{goalId});
}
