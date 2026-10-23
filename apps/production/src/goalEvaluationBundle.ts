import {assertEvaluationPermit} from '../../../packages/model-gateway/src/evaluationPermit';
import {ModelGateway} from '../../../packages/model-gateway/src/gateway';
import type {ModelTask} from '../../../packages/model-gateway/src/types';
import {assertEvaluationTrial,type EvaluationTrial} from '../../agents/src/evaluation/trial';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {ProductionBundle} from './types';
export const evaluationBundleHash=(bundle:ProductionBundle)=>sha256Hex({tools:bundle.toolDefinitions,contracts:bundle.verifiedEvidenceContracts??[]});
/** Explicit permit-bound composition. Reuses the existing durable trial ledger.
 * Agent keys encode immutable goal enrollment, so reopening cannot shuffle quotas.
 * No entrypoint calls this factory; live release/owner interlocks remain intact.
 */
export function withGoalEvaluation(bundle:ProductionBundle,trial:EvaluationTrial,expectedCommit:string):ProductionBundle{
 assertEvaluationTrial(trial);assertEvaluationPermit(trial.permit);
 if(trial.spec.mode!==trial.permit.mode||trial.spec.commit!==expectedCommit||
  trial.spec.capabilityHash!==evaluationBundleHash(bundle)||bundle.modelGatewayForGoal||bundle.plannerGateway)
  throw Error('EVALUATION_COMPOSITION_DENIED');
 const slots=Object.keys(trial.spec.agents).filter(k=>k!=='executive-bootstrap');
 if(slots.length!==3||slots.some(k=>!/^goal\.[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(k))||
  trial.spec.limits.models>24||slots.some(k=>trial.spec.agents[k].models>8)||
  trial.spec.agents['executive-bootstrap'].models!==0)throw Error('EVALUATION_GOAL_ENROLLMENT_REQUIRED');
 const base=new ModelGateway(Object.fromEntries((bundle.modelAdapters??[]).map(a=>[a.providerId,a])));
 return {...bundle,modelGatewayForGoal(goalId:string){
  const key='goal.'+goalId;
  if(!slots.includes(key))throw Error('EVALUATION_GOAL_NOT_ENROLLED');
  const bounded=trial.gateway(base,goalId,key);
  return new class extends ModelGateway{
   constructor(){super({});}
   override invoke(task:ModelTask){
    // Never inherit arbitrary reservation callbacks or a caller's other permit.
    if(task.boundedSynthetic||task.boundedEvaluation)throw Error('EVALUATION_BOUNDARY_OVERRIDE_DENIED');
    return bounded.invoke(task);
   }
  }();
 }};
}
