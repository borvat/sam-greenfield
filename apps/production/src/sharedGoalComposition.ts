import {assertIntegrationAccess} from '../../../packages/db/src/integrationProfile';
import {pool,withTransaction} from '../../../packages/db/src/client';
import {withCommitAdmission} from '../../../packages/db/src/commitAdmission';
import {ModelGateway} from '../../../packages/model-gateway/src/gateway';
import {assertRegisteredEvaluationAdapter} from '../../../packages/model-gateway/src/evaluationAdapter';
import {assertEvaluationTrial,type EvaluationTrial} from '../../agents/src/evaluation/trial';
import {assertFrozenEvaluationSources} from '../../agents/src/evaluation/frozenSources';
import {createSpecialistIntelligence} from '../../agents/src/intelligence/engine';
import type {SpecialistConfig} from '../../agents/src/intelligence/contracts';
import {evidenceFamily,assertAssignedExecution} from '../../brain/src/evidence/delegationScope';
import type {OutputContracts} from '../../brain/src/evidence/contracts';
import {DERIVE_CAPABILITY} from '../../brain/src/evidence/artifacts';
import {recoverKernelAfterRestart} from '../../kernel/src/recovery';
import {transitionGoal} from '../../kernel/src/stateMachine';
import {createProductionComposition} from './composition';
import {validateProductionBundle} from './bundle';
import {withVerifiedEvidence,assertLocalDerivedAdapter} from './verifiedEvidenceBundle';
import {withGoalEvaluation,evaluationBundleHash} from './goalEvaluationBundle';
import {sharedGoalOperation} from './sharedGoalOperation';
import type {ProductionBundle} from './types';
const bundles=new WeakMap<ProductionBundle,{configs:SpecialistConfig[];tenant:string;digest:string}>();
const objectiveSchema={type:'object',additionalProperties:false,required:['objective'],properties:{objective:{type:'string',minLength:1,maxLength:2000}}};
/** Explicit, disabled assembly. Both fixture and any future reviewed transport use
 * the ordinary planner, scheduler, verifier and report path. No registrations or
 * permissions are written here. Current admission accepts frozen sources only. */
export function sharedGoalBundle(base:ProductionBundle,contracts:OutputContracts,configs:SpecialistConfig[],tenant:string):ProductionBundle{
 if(!configs.length||configs.length>4||base.descendantEvidencePolicy||base.requireGoalObligations)throw Error('SHARED_GOAL_BUNDLE_INVALID');
 const policy=Object.fromEntries(configs.map(c=>[c.capabilityId,[...c.allowedCapabilities]]));
 const raw:ProductionBundle={...base,descendantEvidencePolicy:policy,requireGoalObligations:true,
  capabilities:[...base.capabilities,...configs.map(c=>({capabilityId:c.capabilityId,authorityClass:'GREEN' as const,specialistAgentId:c.agentId,specialistVersion:'1',description:c.purpose,parameters:objectiveSchema,sideEffect:false}))],
  toolDefinitions:[...base.toolDefinitions,...configs.map(c=>({capabilityId:c.capabilityId,authorityClass:'GREEN' as const,sideEffect:false,costUpperBoundUsd:0,description:c.purpose,inputSchema:objectiveSchema}))],
  toolAdapters:[...base.toolAdapters,...configs.map(c=>({capabilityId:c.capabilityId,async execute():Promise<never>{throw Error('SHARED_REASONING_ADVANCER_REQUIRED');}}))]};
 for(const item of [...raw.capabilities,...raw.toolDefinitions]){
  if(item.authorityClass!=='GREEN'||'sideEffect'in item&&item.sideEffect!==false||item.companyScopes?.some(id=>id!==tenant))throw Error('SHARED_GOAL_READ_SCOPE_REQUIRED');
 }
 const configured=withVerifiedEvidence(raw,contracts);
 configured.capabilities=configured.capabilities.map(c=>({...c,sideEffect:false,companyScopes:[tenant]}));
 configured.toolDefinitions=configured.toolDefinitions.map(t=>({...t,companyScopes:[tenant],costUpperBoundUsd:t.costUpperBoundUsd??0}));
 const copied=structuredClone(configs);bundles.set(configured,{configs:copied,tenant,digest:evaluationBundleHash(configured)});return configured;
}
export async function createSharedGoalComposition(input:{bundle:ProductionBundle;trial:EvaluationTrial;expectedCommit:string;workerId:string}){
 assertEvaluationTrial(input.trial);
 const setup=bundles.get(input.bundle);if(!setup||setup.tenant!==input.trial.spec.companyId||setup.digest!==evaluationBundleHash(input.bundle))throw Error('SHARED_GOAL_ASSEMBLY_REQUIRED');
 const raw=withGoalEvaluation(input.bundle,input.trial,input.expectedCommit),policy=raw.descendantEvidencePolicy!;
 const logical=new Set(setup.configs.map(c=>c.capabilityId));
 for(const adapter of raw.modelAdapters??[])assertRegisteredEvaluationAdapter(adapter,input.trial.permit.mode);
 for(const adapter of raw.toolAdapters){if(logical.has(adapter.capabilityId))continue;
  const verifier=raw.verificationAdapters?.find(v=>v.capabilityId===adapter.capabilityId);
  if(adapter.capabilityId===DERIVE_CAPABILITY)assertLocalDerivedAdapter(adapter,verifier);else assertFrozenEvaluationSources(adapter,verifier,input.trial.spec.caseId);
 }
 const roots=Object.keys(input.trial.spec.agents).filter(k=>k.startsWith('goal.')).map(k=>k.slice(5));
 // Shared owner tools/readbacks are the authoritative ceiling, including all
 // logical specialists. A smaller hidden local tool budget cannot be ignored.
 for(const cfg of setup.configs)for(const id of roots)if(cfg.limits.tools<input.trial.spec.agents['goal.'+id].tools)throw Error('SHARED_TOOL_LIMIT_MISMATCH');
 await withTransaction(async c=>{await assertIntegrationAccess(c);const access=(await c.query("SELECT (has_table_privilege(current_user,'goal_read_reviews','SELECT') AND has_table_privilege(current_user,'goal_read_reviews','INSERT')) allowed")).rows[0];if(!access?.allowed)throw Error('EVALUATION_REPORT_ACCESS_REQUIRED');await input.trial.live(c);});
 const checked=validateProductionBundle(raw);
 const engine=await createSpecialistIntelligence({configs:setup.configs,catalog:checked.catalog,tools:checked.tools,gateway:new ModelGateway(Object.fromEntries((raw.modelAdapters??[]).map(a=>[a.providerId,a]))),trial:input.trial,sharedGoalPolicy:policy});
 const family=(c:any,id:string)=>evidenceFamily(c,id,setup.tenant,policy);
 const scope=async(c:any,root:string)=>{await input.trial.scope(c,root);await input.trial.live(c,'goal.'+root);return family(c,root);};
 const terminal=(s:string)=>['COMPLETED','FAILED','CANCELLED','BLOCKED'].includes(s);
 const exhaustion=(error:unknown)=>{const message=error instanceof Error?error.message:String(error);return /^EVALUATION_(?:AGENT_)?(?:BUDGET_EXHAUSTED|TIME_EXHAUSTED)(?::[A-Za-z]+)?$/.test(message)?message:undefined;};
 const failExhausted=async(root:string,reason:string)=>withTransaction(async c=>{
  await input.trial.scope(c,root);const g=(await c.query('SELECT state FROM goals WHERE id=$1 FOR UPDATE',[root])).rows[0];
  await input.trial.live(c);
  if(!terminal(g.state)){await transitionGoal(c,root,g.state,'FAILED','shared_evaluation_exhausted',{code:reason});await c.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[root]);}
 });
 let cursor=0;const verifierCursors=new Map<string,number>();
 const wrapped:ProductionBundle={...raw,toolAdapters:raw.toolAdapters.map(adapter=>logical.has(adapter.capabilityId)?adapter:{...adapter,async execute(request){
   const context=request.executionContext;if(!context)throw Error('EVIDENCE_WORK_CONTEXT_REQUIRED');
   const row=(await pool.query('SELECT goal_id FROM work_queue WHERE id=$1 AND fencing_token=$2',[context.queueId,context.fencingToken])).rows[0];if(!row)throw Error('EVIDENCE_WORK_SCOPE_REQUIRED');
   return sharedGoalOperation({trial:input.trial,goalId:row.goal_id,policy,kind:'tool',capabilityId:adapter.capabilityId,...context},()=>adapter.execute(request));
  }}),verificationAdapters:[...(raw.verificationAdapters??[]).map(adapter=>({...adapter,async verify(request:Parameters<import("./types").VerificationAdapter["verify"]>[0]){
   const row=(await pool.query('SELECT goal_id FROM executions WHERE id=$1',[request.execution.id])).rows[0];if(!row)throw Error('EVIDENCE_EXECUTION_SCOPE_REQUIRED');
   return sharedGoalOperation({trial:input.trial,goalId:row.goal_id,policy,kind:'readback',capabilityId:adapter.capabilityId,executionId:request.execution.id},()=>adapter.verify(request));
  }})),...setup.configs.map(cfg=>({capabilityId:cfg.capabilityId,async verify(request:any){
   const row=(await pool.query('SELECT goal_id FROM executions WHERE id=$1',[request.execution.id])).rows[0];if(!row)throw Error('EVIDENCE_EXECUTION_SCOPE_REQUIRED');
   return sharedGoalOperation({trial:input.trial,goalId:row.goal_id,policy,kind:'readback',capabilityId:cfg.capabilityId,executionId:request.execution.id},async c=>{const grounded=await engine.verifyReport(request.execution.result??{},String(request.execution.evidence.specialist_session??''),c);return {result:grounded?'VERIFIED' as const:'INCONCLUSIVE' as const,evidence:{grounded,classification:'MODEL_INFERENCE'},verifier:'shared-pointer-reasoning-v1'};});
  }}))]};
 const bundle=validateProductionBundle(wrapped);
 const authorize=async(work:any,root:string)=>withTransaction(async c=>{
  const f=await scope(c,root);if(!f.goalIds.includes(work.goalId))throw Error('EVALUATION_GOAL_NOT_ENROLLED');
  if(work.goalId!==root)await assertAssignedExecution(c,{goal_id:work.goalId,plan_id:work.planId,capability_id:work.capabilityId,queue_id:work.queueId,params:work.params},f);
 });
 const active=()=>withTransaction(async c=>{await input.trial.live(c);return (await c.query('SELECT id,state FROM goals WHERE id=ANY($1::uuid[])',[roots])).rows.filter(g=>!terminal(g.state)).map(g=>g.id as string);});
 return {async recover(){
  for(const root of await active()){try{const f=await withTransaction(c=>scope(c,root));await withCommitAdmission(c=>scope(c,root),()=>recoverKernelAfterRestart(f.goalIds));}catch(error){const reason=exhaustion(error);if(!reason)throw error;await failExhausted(root,reason);}}
 },async supervise(){return withTransaction(async c=>{await input.trial.live(c);return {coverage:'SHARED_GOAL_FAMILY_ONLY'};});},async runWorkTick(){
  const ids=await active();if(!ids.length)return {processed:false};const root=ids[cursor++%ids.length];
  let exhausted:string|undefined;
  try{const result=await withCommitAdmission(c=>scope(c,root),async()=>{
   const f=await withTransaction(c=>scope(c,root)),n=verifierCursors.get(root)??0;verifierCursors.set(root,n+1);
   const advancers=Object.fromEntries(Object.entries(engine.advancers).map(([id,advance])=>[id,async(work:any)=>{
    await authorize(work,root);const result=await advance(work);if(!result)return null;
    return sharedGoalOperation({trial:input.trial,goalId:work.goalId,policy,kind:'reasoning-result',capabilityId:id,queueId:work.queueId,fencingToken:work.fencingToken},async()=>result);
   }]));
   return createProductionComposition({bundle,workerId:input.workerId,ordinaryFailurePolicy:'record',onStageError:(_stage,error)=>{exhausted=exhaustion(error)??exhausted;},readReportReview:true,planning:{goalId:root},excludeDelegatedSpecialistPlanning:true,specialistScopeGoalId:root,specialistAdvancers:advancers,maintenanceGoalIds:f.goalIds,verificationGoalId:f.goalIds[n%f.goalIds.length],reviewGoalId:root,authorizeWork:w=>authorize(w,root)}).runWorkTick();
  });exhausted=exhaustion((result as any)?.planning?.reason)??exhausted;
   if(exhausted){await failExhausted(root,exhausted);return {processed:true,failed:true,reason:exhausted};}return result;
  }catch(error){const reason=exhaustion(error);if(!reason)throw error;await failExhausted(root,reason);return {processed:true,failed:true,reason};
  }
 }};
}
