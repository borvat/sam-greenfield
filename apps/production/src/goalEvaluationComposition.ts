import {transitionGoal} from '../../kernel/src/stateMachine';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {recoverKernelAfterRestart} from '../../kernel/src/recovery';
import {assertLocalDerivedAdapter} from './verifiedEvidenceBundle';
import {DERIVE_CAPABILITY} from '../../brain/src/evidence/artifacts';
import {withCommitAdmission} from '../../../packages/db/src/commitAdmission';
import {assertFrozenEvaluationSources} from '../../agents/src/evaluation/frozenSources';
import {withTransaction} from '../../../packages/db/src/client';
import {withGoalEvaluation} from './goalEvaluationBundle';
import {assertEvaluationTrial,type EvaluationTrial} from '../../agents/src/evaluation/trial';
import {validateProductionBundle} from './bundle';
import {createProductionComposition} from './composition';
import type {ProductionBundle} from './types';
/** Isolated synthetic entry composition, never selected by production startup.
 * Uses ordinary runtime stages, scoped to enrolled children; root is coordinator.
 * No profile provisioning, model registration, credentials or live flag changes.
 */
export function createGoalEvaluationComposition(input:{bundle:ProductionBundle;trial:EvaluationTrial;expectedCommit:string;workerId:string}){
 const raw=withGoalEvaluation(input.bundle,input.trial,input.expectedCommit);
 if(raw.toolDefinitions.some(t=>t.authorityClass!=='GREEN'||t.sideEffect)||raw.verifiedLearning)throw Error('EVALUATION_READ_ONLY_BUNDLE_REQUIRED');
 for(const adapter of raw.toolAdapters){const verifier=raw.verificationAdapters?.find(v=>v.capabilityId===adapter.capabilityId);
  if(adapter.capabilityId===DERIVE_CAPABILITY)assertLocalDerivedAdapter(adapter,verifier);
  else assertFrozenEvaluationSources(adapter,verifier,input.trial.spec.caseId);
 }
 validateProductionBundle(raw);
 const goals=Object.keys(input.trial.spec.agents).filter(k=>k.startsWith('goal.')).map(k=>k.slice(5));
 const exhausted=new Map<string,string>();
 const terminal=(state:string)=>['COMPLETED','FAILED','CANCELLED','BLOCKED'].includes(state);
 const exhaustion=(error:unknown)=>{const message=error instanceof Error?error.message:String(error);return /^EVALUATION_(?:AGENT_)?(?:BUDGET_EXHAUSTED|TIME_EXHAUSTED)(?::[A-Za-z]+)?$/.test(message)?message:undefined;};
 const failExhausted=async(goalId:string,reason:string)=>withTransaction(async c=>{
  await input.trial.scope(c,goalId);
  const goal=(await c.query('SELECT state FROM goals WHERE id=$1 FOR UPDATE',[goalId])).rows[0];
  await input.trial.live(c); // Trial still authorized; no new work or agent budget reset.
  if(!terminal(goal.state)){await transitionGoal(c,goalId,goal.state,'FAILED','evaluation_exhausted',{code:reason});await c.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[goalId]);}
 });
 const activeGoals=async()=>withTransaction(async c=>{await input.trial.live(c);for(const id of goals)await input.trial.scope(c,id);return (await c.query('SELECT id,state FROM goals WHERE id=ANY($1::uuid[])',[goals])).rows.filter(g=>!terminal(g.state)).map(g=>g.id as string);});
 const compositions=goals.map(goalId=>{
  const bundle=validateProductionBundle({...raw,toolAdapters:raw.toolAdapters.map(adapter=>({...adapter,execute:request=>admitEvaluationSource(input.trial,goalId,()=>adapter.execute(request),'tool',adapter.capabilityId,request.executionContext)})),verificationAdapters:raw.verificationAdapters?.map(adapter=>({...adapter,verify:request=>admitEvaluationSource(input.trial,goalId,()=>adapter.verify(request),'readback',adapter.capabilityId,{executionId:request.execution.id})}))});
  return createProductionComposition({bundle,workerId:input.workerId,
  ordinaryFailurePolicy:'record',readReportReview:true,planning:{goalId},
  onStageError:(_stage,error)=>{const reason=exhaustion(error);if(reason)exhausted.set(goalId,reason);},specialistScopeGoalId:goalId,
  reviewGoalId:goalId,verificationGoalId:goalId,maintenanceGoalIds:[goalId],
  authorizeWork:async work=>{if(work.goalId!==goalId)throw Error('EVALUATION_GOAL_NOT_ENROLLED');}});});
 let cursor=0;
 return {
  async recover(){
   let active=await activeGoals();
   for(const id of active)try{await withTransaction(c=>input.trial.live(c,'goal.'+id));}catch(error){const reason=exhaustion(error);if(!reason)throw error;await failExhausted(id,reason);}
   active=await activeGoals();
   return withCommitAdmission(async c=>{await input.trial.live(c);for(const id of active){await input.trial.scope(c,id);await input.trial.live(c,'goal.'+id);}},()=>recoverKernelAfterRestart(active));
  },
  async supervise(){
   // Trial admission health only; never reconcile tenant-wide operational incidents
   // from a synthetic service composition. Ordinary service supervision is unchanged.
   return withTransaction(async c=>{await input.trial.live(c);return {coverage:'TRIAL_ONLY',trialId:input.trial.id};});
  },
  async runWorkTick(){
  const active=await activeGoals();if(!active.length)return {processed:false,terminal:true};
  const goalId=active[cursor++%active.length],selected=goals.indexOf(goalId);
  let result:any;
  try{result=await withCommitAdmission(async c=>{await input.trial.scope(c,goalId);await input.trial.live(c,'goal.'+goalId);},()=>compositions[selected].runWorkTick());}
  catch(error){const reason=exhaustion(error);if(!reason)throw error;exhausted.set(goalId,reason);}
  const planReason=exhaustion(result?.planning?.reason);if(planReason)exhausted.set(goalId,planReason);
  const reason=exhausted.get(goalId);if(reason){await failExhausted(goalId,reason);exhausted.delete(goalId);return {processed:true,failed:true,reason};}
  return result;
 }};
}

/** Hold trial admission through the frozen source call; cancellation serializes after dispatch. */
export async function admitEvaluationSource<T>(trial:EvaluationTrial,goalId:string,execute:()=>Promise<T>,kind:'tool'|'readback'='tool',capabilityId='source.read',identity:{queueId?:string;fencingToken?:number;executionId?:string}={}):Promise<T>{
 assertEvaluationTrial(trial);if(!Object.hasOwn(trial.spec.agents,'goal.'+goalId))throw Error('EVALUATION_GOAL_NOT_ENROLLED');
 const agentId='goal.'+goalId;
 // Commit reservation before dispatch: failures/crashes never refund consumed work.
 const ticket=await withTransaction(c=>trial.reserve(c,{goalId,agentId,kind,delta:{tools:1},metadata:{capabilityId,workGoalId:goalId,...identity}}));
 await trial.begin(ticket,{agentId,kind,capabilityId,workGoalId:goalId,...identity});
 try{
  const result=await withTransaction(async c=>{await trial.scope(c,goalId);await trial.live(c,agentId);return execute();});
  const outcome=result as any;
  const evidence={...outcome.evidence,evaluationReservation:{trialId:trial.id,id:ticket,kind,goalId}};
  await trial.finish(ticket,{status:'success',...(kind==='tool'?{resultHash:sha256Hex(outcome.result)}:{verificationResult:outcome.result,verificationEvidenceHash:sha256Hex(evidence)})});
  return {...outcome,evidence} as T;
 }catch(error){await trial.finish(ticket,{status:'failure'});throw error;}

}
