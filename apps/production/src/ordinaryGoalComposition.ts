import {validateGoalObligations} from '../../kernel/src/goalObligations';
import {pool,withTransaction} from '../../../packages/db/src/client';
import {withCommitAdmission} from '../../../packages/db/src/commitAdmission';
import {assertIntegrationAccess} from '../../../packages/db/src/integrationProfile';
import {admitOrdinaryModels,assertOrdinaryAdapter} from '../../../packages/model-gateway/src/ordinaryAdmission';
import {ModelGateway} from '../../../packages/model-gateway/src/gateway';
import {evaluationInputBytes} from '../../../packages/model-gateway/src/evaluationAdapter';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {createSpecialistIntelligence} from '../../agents/src/intelligence/engine';
import type {SpecialistConfig,Limits} from '../../agents/src/intelligence/contracts';
import {evidenceFamily,assertAssignedExecution} from '../../brain/src/evidence/delegationScope';
import type {OutputContracts} from '../../brain/src/evidence/contracts';
import {transitionGoal} from '../../kernel/src/stateMachine';
import {recoverKernelAfterRestart} from '../../kernel/src/recovery';
import {createProductionComposition} from './composition';
import {validateProductionBundle} from './bundle';
import {sharedGoalBundle} from './sharedGoalComposition';
import {evaluationBundleHash} from './goalEvaluationBundle';
import {evidenceReleaseContracts} from './evidenceReleaseContracts';
import {assertLocalDerivedAdapter} from './verifiedEvidenceBundle';
import {DERIVE_CAPABILITY} from '../../brain/src/evidence/artifacts';
import {ordinaryGoalGateway} from './ordinaryGoalGateway';
import {openOrdinaryGoalAllowance} from './ordinaryGoalAllowance';
import type {ProductionBundle} from './types';
import {SAM_GOOGLE_VERIFICATION_CONTRACTS} from './samGoogleBundle';
import {GMAIL_READ_VERIFICATION_CONTRACTS} from './gmailReadBundle';
import {DRIVE_VERIFICATION_CONTRACTS} from './driveBundle';
import {BOL_VERIFICATION_CONTRACTS} from './bolMcpBundle';
import {EBOEKHOUDEN_VERIFICATION_CONTRACTS} from './eboekhoudenBundle';
import {FINANCE_RECONCILIATION_CONTRACTS} from './financeReconciliationBundle';

export interface OrdinaryAgentSetup {limits:Limits;specialists:SpecialistConfig[]}
const setups=new WeakMap<ProductionBundle,{setup:OrdinaryAgentSetup;tenant:string;digest:string}>();
export const isOrdinaryGoalBundle=(bundle:ProductionBundle)=>setups.has(bundle);
/** Uses the same generic evidence/delegation builder, not evaluation admission.
 * Neither this function nor startup installs schemas or registrations. */
export function ordinaryGoalBundle(base:ProductionBundle,contracts:OutputContracts,setup:OrdinaryAgentSetup,tenant:string){
 if(process.env.SAM_ORDINARY_GENERAL_AGENT!=='1')throw Error('ORDINARY_GENERAL_AGENT_DISABLED');
 if(base.plannerGateway||base.modelGatewayForGoal)throw Error('ORDINARY_MODEL_BOUNDARY_OVERRIDE_DENIED');
 const bundle=sharedGoalBundle(base,contracts,setup.specialists,tenant);
 setups.set(bundle,{setup:structuredClone(setup),tenant,digest:evaluationBundleHash(bundle)});return bundle;
}
export async function createOrdinaryGoalComposition(input:{bundle:ProductionBundle;workerId:string;diagnostic?:(stage:string,error:unknown)=>void}){
 const assembled=setups.get(input.bundle);
 if(!assembled||assembled.digest!==evaluationBundleHash(input.bundle)||process.env.SAM_ORDINARY_GENERAL_AGENT!=='1')throw Error('ORDINARY_GENERAL_AGENT_ASSEMBLY_REQUIRED');
 const {setup,tenant}=assembled,policy=input.bundle.descendantEvidencePolicy!;
 const prices=(input.bundle.modelProviderConfigs??[]).flatMap(p=>p.models.map(model=>({providerId:p.providerId,model,inputPer1k:p.costPer1kInput,outputPer1k:p.costPer1kOutput})));
 const admission=await withTransaction(c=>admitOrdinaryModels(c,prices));
 if(admission.tenant!==tenant)throw Error('ORDINARY_GENERAL_AGENT_TENANT_MISMATCH');
 for(const p of prices){const a=input.bundle.modelAdapters?.find(a=>a.providerId===p.providerId);if(!a)throw Error('ORDINARY_MODEL_ADAPTER_REQUIRED');assertOrdinaryAdapter(a,p.model);}
 const logical=new Set(setup.specialists.map(c=>c.capabilityId));
 const checked=validateProductionBundle(input.bundle);
 assertLocalDerivedAdapter(input.bundle.toolAdapters.find(a=>a.capabilityId===DERIVE_CAPABILITY)!,checked.verifiers.get(DERIVE_CAPABILITY));
 await withTransaction(async c=>{
  await assertIntegrationAccess(c);
  for(const config of input.bundle.modelProviderConfigs??[]){
   const row=(await c.query('SELECT models,capabilities,privacy_class_allowed FROM model_providers WHERE provider_id=$1',[config.providerId])).rows[0];
   if(!row||sha256Hex(row.models)!==sha256Hex(config.models)||sha256Hex(row.capabilities)!==sha256Hex(config.capabilities)||sha256Hex(row.privacy_class_allowed)!==sha256Hex(config.privacyClasses))throw Error('ORDINARY_MODEL_REGISTRY_MISMATCH');
  }
  for(const task of ['planning','specialist_reasoning'])if(!(input.bundle.modelProviderConfigs??[]).some(p=>p.capabilities.includes(task)))throw Error('ORDINARY_MODEL_CAPABILITY_REQUIRED');
  const known=[...SAM_GOOGLE_VERIFICATION_CONTRACTS,...GMAIL_READ_VERIFICATION_CONTRACTS,...DRIVE_VERIFICATION_CONTRACTS,...BOL_VERIFICATION_CONTRACTS,...EBOEKHOUDEN_VERIFICATION_CONTRACTS,...FINANCE_RECONCILIATION_CONTRACTS];
  for(const capability of input.bundle.capabilities.filter(cap=>!logical.has(cap.capabilityId))){
   if(!checked.verifiers.has(capability.capabilityId))throw Error('ORDINARY_SOURCE_VERIFIER_REQUIRED');
   const row=(await c.query('SELECT * FROM verification_contracts WHERE capability_id=$1',[capability.capabilityId])).rows[0];
   const expected=known.find(v=>v.capabilityId===capability.capabilityId);
   if(!row?.must_not_trust_execution_result||expected&&(row.verification_method!==expected.verificationMethod||sha256Hex(row.required_evidence_fields)!==sha256Hex(expected.requiredEvidenceFields)||sha256Hex(row.independent_query_template)!==sha256Hex(expected.independentQueryTemplate)))throw Error('ORDINARY_VERIFICATION_REGISTRATION_REQUIRED');
  }
  for(const spec of [...evidenceReleaseContracts(checked),...setup.specialists.map(s=>({capabilityId:s.capabilityId,verificationMethod:'db_query',requiredEvidenceFields:{grounded:'boolean'},independentQueryTemplate:{method:'ordinary-specialist-pointer-replay-v1'}}))]){
   const row=(await c.query('SELECT * FROM verification_contracts WHERE capability_id=$1',[spec.capabilityId])).rows[0];
   if(!row||!row.must_not_trust_execution_result||row.verification_method!==spec.verificationMethod||sha256Hex(row.required_evidence_fields)!==sha256Hex(spec.requiredEvidenceFields)||sha256Hex(row.independent_query_template)!==sha256Hex(spec.independentQueryTemplate))throw Error('ORDINARY_VERIFICATION_REGISTRATION_REQUIRED');
  }
 });
 const allowancePolicy={version:1 as const,capabilityHash:assembled.digest,limits:setup.limits,prices};
 type Allowance=Awaited<ReturnType<typeof openOrdinaryGoalAllowance>>;
 const allowances=new Map<string,Allowance>();
 const family=(c:any,id:string)=>evidenceFamily(c,id,tenant,policy);
 async function rootAllowance(root:string){
  let allowance=allowances.get(root);if(!allowance){allowance=await openOrdinaryGoalAllowance({rootGoalId:root,tenant,policy:allowancePolicy});allowances.set(root,allowance);}return allowance;
 }
 async function forGoal(c:any,id:string){const direct=allowances.get(id);if(direct){await direct.live(c);return direct;}const f=await family(c,id),a=allowances.get(f.rootGoalId);if(!a)throw Error('ORDINARY_ALLOWANCE_MISSING');await a.live(c);return a;}
 const base=new ModelGateway(Object.fromEntries((input.bundle.modelAdapters??[]).map(a=>[a.providerId,a])));
 const gateway=(goalId:string,underlying=base)=>new class extends ModelGateway{
  constructor(){super({});}
  override async invoke(task:Parameters<ModelGateway['invoke']>[0]){
   const allowance=await withTransaction(c=>forGoal(c,goalId));
   return ordinaryGoalGateway({base:underlying,admission,allowance,policy:allowancePolicy}).invoke(task);
  }
 }();
 const engine=await createSpecialistIntelligence({configs:setup.specialists,catalog:checked.catalog,tools:checked.tools,gateway:base,sharedGoalPolicy:policy,
  ordinary:{admission,live:async(c,id)=>{await forGoal(c,id);},charge:async(c,id,kind)=>(await forGoal(c,id)).charge(c,kind),gateway},diagnostic:e=>input.diagnostic?.('specialist',e)});
 async function operation<T>(goalId:string,kind:'tool'|'readback',call:()=>Promise<T>):Promise<T>{
  const allowance=await withTransaction(c=>forGoal(c,goalId));
  const ticket=await allowance.reserve(kind);await allowance.begin(ticket);
  let value:T,timer:ReturnType<typeof setTimeout>|undefined;
  const remaining=Date.parse((await allowance.snapshot()).deadline)-Date.now();
  if(remaining<=0){await allowance.finish(ticket,'failure');throw Error('ORDINARY_ALLOWANCE_TIME_EXHAUSTED');}
  try{value=await Promise.race([call(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('ORDINARY_TOOL_TIMEOUT')),Math.max(1,Math.min(remaining,setup.limits.toolCallMs)));})]);}
  catch(e){await allowance.finish(ticket,'failure');throw e;}finally{if(timer)clearTimeout(timer);}
  await allowance.finish(ticket,'success',sha256Hex(value));
  await withTransaction(c=>forGoal(c,goalId));
  // Receipt follows the result into the existing execution/verification ledger.
  return {...value,evidence:{...(value as any).evidence,ordinaryAllowance:{rootGoalId:allowance.rootGoalId,ticket,kind}}};
 }
 const wrapped:ProductionBundle={...input.bundle,modelGatewayForGoal:gateway,
  reviewEvidenceChars:Math.min(16000,Math.floor(setup.limits.maxInputTokens*.4)),reviewInputAdmission(_id,data){if(evaluationInputBytes(data)>setup.limits.maxInputTokens)throw Error('REVIEW_INPUT_BUDGET_EXCEEDED');},
  toolAdapters:input.bundle.toolAdapters.map(adapter=>logical.has(adapter.capabilityId)?adapter:{...adapter,async execute(request){
   const context=request.executionContext;if(!context)throw Error('ORDINARY_WORK_CONTEXT_REQUIRED');
   const row=(await pool.query('SELECT goal_id FROM work_queue WHERE id=$1 AND fencing_token=$2',[context.queueId,context.fencingToken])).rows[0];
   if(!row)throw Error('ORDINARY_WORK_CONTEXT_REQUIRED');return operation(row.goal_id,'tool',()=>adapter.execute(request));
  }}),verificationAdapters:[...(input.bundle.verificationAdapters??[]).map(adapter=>({...adapter,async verify(request:Parameters<typeof adapter.verify>[0]){
   const row=(await pool.query('SELECT goal_id FROM executions WHERE id=$1',[request.execution.id])).rows[0];if(!row)throw Error('ORDINARY_EXECUTION_SCOPE_REQUIRED');
   return operation(row.goal_id,'readback',()=>adapter.verify(request));
  }})),...setup.specialists.map(cfg=>({capabilityId:cfg.capabilityId,async verify(request:any){
   const row=(await pool.query('SELECT goal_id FROM executions WHERE id=$1',[request.execution.id])).rows[0];if(!row)throw Error('ORDINARY_EXECUTION_SCOPE_REQUIRED');
   return operation(row.goal_id,'readback',async()=>{const grounded=await engine.verifyReport(request.execution.result??{},String(request.execution.evidence.specialist_session??''));return {result:grounded?'VERIFIED' as const:'INCONCLUSIVE' as const,evidence:{grounded,classification:'MODEL_INFERENCE'},verifier:'ordinary-specialist-pointer-replay-v1'};});
  }}))]};
 const bundle=validateProductionBundle(wrapped);
 // Only authenticated ordinary roots are eligible. Other goals, including old
 // WAITING_EXTERNAL goals, are never adopted or granted a fresh allowance.
 const active=async()=> (await pool.query(`SELECT g.id FROM goals g WHERE g.company_scope=$1 AND g.parent_goal_id IS NULL
  AND g.authority_ceiling='GREEN' AND g.completion_definition='sam.read_report.v1'
  AND g.state IN ('NEW','MODELING','PLANNING','EXECUTING','VERIFYING','REPLANNING')
  AND EXISTS(SELECT 1 FROM audit_log a WHERE a.goal_id=g.id AND a.action='SAM_GOAL_SUBMITTED' AND a.source='sam_mcp' AND a.result='CREATED' AND a.after_ref->>'ordinaryGeneralAgentV1'='true')
  ORDER BY g.created_at,g.id`,[tenant])).rows.map(g=>g.id as string);
 let cursor=0;const verifyCursor=new Map<string,number>();
 const stoppingCode=(e:unknown)=>e instanceof Error?(/^ORDINARY_(ALLOWANCE_(BUDGET|TIME)_EXHAUSTED|MODEL_TIMEOUT|TOOL_TIMEOUT)/.test(e.message)?e.message.split(':')[0]:e.message==='EVIDENCE_DELEGATION_SCOPE_INVALID'?'ORDINARY_DELEGATION_UNAVAILABLE':undefined):undefined;
 async function fail(root:string,code:string){await withTransaction(async c=>{
  const r=(await c.query('SELECT state,current_plan_id,objective FROM goals WHERE id=$1 AND company_scope=$2 FOR UPDATE',[root,tenant])).rows[0];
  if(!r||['COMPLETED','CANCELLED','FAILED','BLOCKED'].includes(r.state))return;
  if(r.current_plan_id){
   const first=(await c.query('SELECT goal_assumptions FROM plans WHERE goal_id=$1 ORDER BY version LIMIT 1',[root])).rows[0];
   const obligations=validateGoalObligations(first?.goal_assumptions?.goalObligations,r.objective);
   const decision={status:'blocked',summary:'Execution stopped without establishing the objective. No completion is claimed.',requirements:obligations.deliverables.map(d=>({obligationId:d.id,requirement:d.description,fulfilled:false,evidenceIds:[]})),findings:[],steps:[],limitations:[code,'Delegated evidence or the remaining allowance is insufficient; inspect the recorded task outcomes before any authorized continuation.'],runtimeTermination:{code}};
   await c.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,$3,$4) ON CONFLICT(goal_id,plan_id) DO NOTHING',[root,r.current_plan_id,JSON.stringify(decision),sha256Hex(decision)]);
  }
  await transitionGoal(c,root,r.state,'FAILED','ordinary_goal_stopped',{code});
 });}
 return {async recover(){for(const root of await active()){
  const a=await rootAllowance(root);try{const f=await withTransaction(async c=>{await a.live(c);return family(c,root);});await withCommitAdmission(c=>a.commit(c),()=>recoverKernelAfterRestart(f.goalIds));}catch(e){const code=stoppingCode(e);if(!code)throw e;await fail(root,code);}
 }},async supervise(){return {coverage:'AUTHENTICATED_ORDINARY_GOAL_FAMILIES'};},async runWorkTick(){
  const ids=await active();if(!ids.length)return {processed:false};const root=ids[cursor++%ids.length],a=await rootAllowance(root);let exhaustedStage:string|undefined;
  try{return await withCommitAdmission(c=>a.commit(c),async()=>{
   const f=await withTransaction(async c=>{await a.live(c);return family(c,root);});const n=verifyCursor.get(root)??0;verifyCursor.set(root,n+1);
   return createProductionComposition({bundle,workerId:input.workerId,ordinaryFailurePolicy:'record',readReportReview:true,planning:{goalId:root},excludeDelegatedSpecialistPlanning:true,
    specialistScopeGoalId:root,specialistAdvancers:engine.advancers,maintenanceGoalIds:f.goalIds,verificationGoalId:f.goalIds[n%f.goalIds.length],reviewGoalId:root,
    authorizeWork:async work=>{await withTransaction(async c=>{await a.live(c);const current=await family(c,root);if(!current.goalIds.includes(work.goalId!))throw Error('ORDINARY_WORK_SCOPE_DENIED');if(work.goalId!==root)await assertAssignedExecution(c,{goal_id:work.goalId,plan_id:work.planId,queue_id:work.queueId,capability_id:work.capabilityId,params:work.params},current);});await engine.beforeTool(work);},
    onStageError:(stage,e)=>{input.diagnostic?.(stage,e);exhaustedStage=exhaustedStage??stoppingCode(e);}}).runWorkTick();
  });}catch(e){const code=stoppingCode(e);if(!code)throw e;exhaustedStage=code;return {processed:true,failed:true,reason:code};}
  finally{if(exhaustedStage)await fail(root,exhaustedStage);}
 }};
}
