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
 const compositions=goals.map(goalId=>{
  const bundle=validateProductionBundle({...raw,toolAdapters:raw.toolAdapters.map(adapter=>({...adapter,execute:request=>admitEvaluationSource(input.trial,goalId,()=>adapter.execute(request))}))});
  return createProductionComposition({bundle,workerId:input.workerId,
  ordinaryFailurePolicy:'record',readReportReview:true,planning:{goalId},specialistScopeGoalId:goalId,
  reviewGoalId:goalId,verificationGoalId:goalId,
  authorizeWork:async work=>{if(work.goalId!==goalId)throw Error('EVALUATION_GOAL_NOT_ENROLLED');}});});
 let cursor=0;
 return {async runWorkTick(){
  await withTransaction(async c=>{
   await input.trial.live(c);
   for(const id of goals)await input.trial.scope(c,id);
  });
  const selected=cursor++%compositions.length;
  return withCommitAdmission(async c=>{await input.trial.scope(c,goals[selected]);await input.trial.live(c,'goal.'+goals[selected]);},()=>compositions[selected].runWorkTick());
 }};
}

/** Hold trial admission through the frozen source call; cancellation serializes after dispatch. */
export async function admitEvaluationSource<T>(trial:EvaluationTrial,goalId:string,execute:()=>Promise<T>):Promise<T>{
 assertEvaluationTrial(trial);if(!Object.hasOwn(trial.spec.agents,'goal.'+goalId))throw Error('EVALUATION_GOAL_NOT_ENROLLED');
 return withTransaction(async c=>{await trial.scope(c,goalId);await trial.live(c,'goal.'+goalId);return execute();});
}
