import {commercialScenario,currentCommercialSource,commercialClaimSupported} from './scenarios';
import {sha256Hex,stableStringify} from '../../../../packages/shared/src/stableJson';
import {decisionSchema} from '../intelligence/contracts';
import type {verifyEvaluationTrace} from './trace';
/** Called only after authentication/chain/counter validation. Machine success
 * verifies mechanics and quotations, never semantic intelligence or advice. */
export function scoreCommercialCapture(capture:ReturnType<typeof verifyEvaluationTrace>){
 const {trial:t,spec,events,reservations,finished}=capture,scenario=commercialScenario(spec.caseId)!;
 const snapshot=events.at(-1).payload,report=snapshot.report;
 const checks:{name:string;status:'PASS'|'FAIL';detail:string}[]=[];
 const check=(name:string,ok:boolean,detail:string)=>checks.push({name,status:ok?'PASS':'FAIL',detail});
 const attempts=[...reservations.entries()].map(([id,r])=>({id,r:r.payload,at:Date.parse(r.created_at),f:finished.get(id)?.payload}));
 const models=attempts.filter(a=>a.r.kind==='model'),sources=Array.isArray(snapshot.sources)?snapshot.sources:[];
 const admitted=(s:any)=>{
  const frozen=scenario.sources.find(f=>f.id===s.result?.sourceId);
  return !!frozen&&currentCommercialSource(scenario,frozen)&&s.company_scope===spec.companyId&&s.verification_result==='VERIFIED'&&sha256Hex(s.result?.sourceData)===sha256Hex(frozen.data)&&
   Date.parse(s.checked_at)>=Date.parse(s.finished_at)&&Date.parse(s.checked_at)<=Date.parse(events.at(-1).created_at)&&
   attempts.some(a=>a.r.kind==='readback'&&a.r.executionId===s.id&&a.f?.status==='success'&&a.f.result?.result==='VERIFIED'&&
    attempts.some(read=>read.r.kind==='tool'&&read.r.workGoalId===a.r.workGoalId&&read.f?.status==='success'&&read.f.result?.result?.sourceId===frozen.id&&sha256Hex(read.f.result.result.sourceData)===sha256Hex(frozen.data)&&read.at<=a.at));
 };
 check('all-source-receipts',sources.length>0&&sources.every(admitted),'Unused receipts must also be current, canonical and company-scoped');
 const validClaim=(c:any)=>typeof c?.topic==='string'&&typeof c.value==='string'&&Array.isArray(c.evidenceIds)&&c.evidenceIds.length>0&&c.evidenceIds.every((id:string)=>{
  const s=sources.find((row:any)=>row.id===id),receipt=report.evidence?.find((e:any)=>e.id===id);
  return s&&receipt&&receipt.verificationId===s.verification_id&&admitted(s)&&commercialClaimSupported(s.result.sourceData,c.topic,c.value);
 });
 check('verified-final-root',snapshot.root?.state==='COMPLETED'&&snapshot.root.verification_result==='VERIFIED'&&stableStringify(snapshot.root.result?.report)===stableStringify(report)&&!t.cancelled,'Root and captured report must agree; cancellation cannot certify completion');
 check('grounded-field-bound-claims',Array.isArray(report?.claims)&&report.claims.length>0&&report.claims.every(validClaim),'Every citation, topic and quoted value must match fresh independent readback; missing, stale, hostile and unrelated fields fail');
 const firstConflicts=new Map<string,any>();
 for(const e of events.filter((e:any)=>e.kind==='CONFLICTS'))for(const c of e.payload.conflicts){
  const key=sha256Hex({topic:c.topic,values:c.values.map((v:any)=>({value:v.value,evidenceIds:[...v.evidenceIds].sort()})).sort((a:any,b:any)=>a.value.localeCompare(b.value))});
  if(!firstConflicts.has(key))firstConflicts.set(key,{...c,at:Date.parse(e.created_at)});
 }
 const conflicts=[...firstConflicts.values()];
 check('consistent-final-claims',Array.isArray(report?.claims)&&report.claims.every((c:any)=>!report.claims.some((other:any)=>other.topic===c.topic&&other.value!==c.value)),'Final quotations must not contradict one another');
 check('corrective-research',conflicts.every((conflict:any)=>report.claims.some((cl:any)=>cl.topic===conflict.topic&&cl.evidenceIds.some((id:string)=>{
  const s=sources.find((r:any)=>r.id===id);return s&&admitted(s)&&!conflict.values.some((v:any)=>v.evidenceIds.includes(id))&&attempts.some(a=>a.r.kind==='tool'&&a.f?.result?.result?.sourceId===s.result.sourceId&&a.at>conflict.at);
 }))), 'Each observed contradiction needs new grounded evidence after detection; there is no expected recommendation');
 const decisions=models.filter(a=>a.r.agentId!=='executive-bootstrap'&&a.f?.status==='success').map(a=>({a,decision:decisionSchema.safeParse(a.f.result?.output)}));
 const agents=[...new Set(decisions.map(d=>d.a.r.agentId).filter(id=>id!=='executive-specialist'))];
 check('specialist-reasoning-loops',agents.length>=2&&agents.every(id=>{
  const own=decisions.filter(d=>d.a.r.agentId===id&&d.decision.success);return own.some(d=>d.decision.data?.action==='dispatch')&&own.some(d=>d.decision.data?.action==='report')&&new Set(own.map(d=>sha256Hex(d.a.r.input))).size>=2;
 }),'Two separate specialists must plan/select capabilities and interpret later evidence in separate model turns; fixtures still do not establish model quality');
 const delegated=events.filter((e:any)=>e.kind==='DELEGATED');
 const parents=new Map<string,string>(delegated.map((e:any)=>[e.payload.goalId,e.payload.parentGoalId]));
 const inTrial=(goal:string)=>{const seen=new Set<string>();for(let depth=0;depth<=4;depth++){if(goal===t.root_goal_id)return true;if(seen.has(goal)||!parents.has(goal))return false;seen.add(goal);goal=parents.get(goal)!;}return false;};
 const reservedDelegations=attempts.reduce((n,a)=>n+a.r.reserved.delegations,0);
 const parentCounts=new Map<string,number>();for(const a of attempts)if(a.r.kind==='delegation'){const k=a.r.agentId+':'+a.r.goalId;parentCounts.set(k,(parentCounts.get(k)??0)+a.r.reserved.delegations);}
 for(const e of delegated){const k=e.payload.agentId+':'+e.payload.parentGoalId;parentCounts.set(k,(parentCounts.get(k)??0)-1);}
 check('delegation-conservation',delegated.length===reservedDelegations&&parents.size===delegated.length&&[...parentCounts.values()].every(n=>n===0)&&[...parents.keys()].every(inTrial)&&attempts.every(a=>inTrial(a.r.goalId)&&(!['tool','readback'].includes(a.r.kind)||parents.get(a.r.workGoalId)===a.r.goalId)), 'Every real child conserves reserved counts and belongs to this root; readbacks retain the delegated work scope');
 check('delegation-and-synthesis',delegated.some((e:any)=>e.payload.capabilityId==='specialist.market')&&delegated.some((e:any)=>e.payload.capabilityId==='specialist.risk')&&new Set(report?.claims?.flatMap((cl:any)=>cl.evidenceIds.map((id:string)=>sources.find((s:any)=>s.id===id)?.result.sourceId))).size>=2,'Real child goals plus final citations from independent sources; usefulness is independently reviewed');
 check('safe-capabilities',attempts.every(a=>a.r.kind==='model'||!['tool','readback'].includes(a.r.kind)||a.r.capabilityId==='source.read')&&delegated.every((e:any)=>['specialist.market','specialist.risk','source.read'].includes(e.payload.capabilityId)),'Only company-scoped reasoners and frozen source reads; no business actions');
 check('model-usage',models.every(a=>a.f?.status!=='success'||a.f.result?.usage&&Number.isSafeInteger(a.f.result.usage.inputTokens)&&a.f.result.usage.inputTokens>=0&&Number.isSafeInteger(a.f.result.usage.outputTokens)&&a.f.result.usage.outputTokens>=0&&a.f.result.usage.inputTokens<=a.r.maxInputTokens&&a.f.result.usage.outputTokens<=a.r.maxOutputTokens&&a.f.result.model===a.r.model),'Every successful provider attempt must disclose bounded usage and the pinned model');
 const learning=Array.isArray(snapshot.learning)?snapshot.learning:[];
 check('verified-learning',learning.filter((l:any)=>l.kind==='VERIFIED_LESSON').length>0&&learning.every((l:any)=>{
  if(l.kind!=='VERIFIED_LESSON')return true;const source=sources.find((s:any)=>s.id===l.execution_id);if(!source||!admitted(source)||l.verification_id!==source.verification_id)return false;
  let p=l;for(const kind of ['EVALUATION','HYPOTHESIS','OBSERVATION']){const parent=learning.find((r:any)=>r.id===p.parent_id);if(!parent||parent.kind!==kind||parent.execution_id!==l.execution_id||parent.verification_id!==l.verification_id||parent.statement!==l.statement)return false;p=parent;}return p.parent_id===null&&Object.values(source.result.sourceData).some(v=>['string','number','boolean'].includes(typeof v)&&String(v)===l.statement);
 }),'Only current independently supported quotation cycles may enter scoped trusted memory');
 check('uncertainty',Array.isArray(report?.uncertainties)&&report.uncertainties.length>0,'Commercial inference remains distinct from verified source quotations');
 return {schemaVersion:1,commit:spec.commit,caseId:spec.caseId,status:checks.every(c=>c.status==='PASS')?'PASS':'FAIL',classification:spec.mode==='fixture'?'AUTHENTICATED_COMMERCIAL_FIXTURE_CAPTURE':'AUTHENTICATED_COMMERCIAL_MODEL_CAPTURE_REVIEW_PENDING',traceAuthenticated:true,headHash:capture.headHash,wholeTrialUsed:t.used,liveReasoningValidated:false,modelQualityVerdict:'NOT_EVALUATED',independentHumanReview:'PENDING',checks};
}
