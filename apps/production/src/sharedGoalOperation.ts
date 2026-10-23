import type {PoolClient} from 'pg';
import {withTransaction} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {assertEvaluationTrial,type EvaluationTrial} from '../../agents/src/evaluation/trial';
import {evidenceFamily,type DelegationPolicy} from '../../brain/src/evidence/delegationScope';
/** Same durable trial ledger for reads, readbacks and cooperative reasoning.
 * Reasoning decisions are already model/iteration charged; final local results
 * receive a zero-cost persistence receipt, never a fresh allowance. */
export async function sharedGoalOperation<T>(input:{trial:EvaluationTrial;goalId:string;policy:DelegationPolicy;kind:'tool'|'readback'|'reasoning-result';capabilityId:string;queueId?:string;fencingToken?:number;executionId?:string},run:(client:PoolClient)=>Promise<T>){
 const {trial,goalId,policy,kind,...identity}=input;assertEvaluationTrial(trial);
 const reservation=await withTransaction(async c=>{
  const family=await evidenceFamily(c,goalId,trial.spec.companyId,policy),agentId='goal.'+family.rootGoalId;
  if(!Object.hasOwn(trial.spec.agents,agentId))throw Error('EVALUATION_GOAL_NOT_ENROLLED');
  const id=await trial.reserve(c,{goalId,agentId,kind,delta:kind==='reasoning-result'?{}:{tools:1},metadata:{...identity,workGoalId:goalId,delegationHash:family.hash}});
  return {id,agentId,familyHash:family.hash};
 });
 await trial.begin(reservation.id,{...identity,kind,agentId:reservation.agentId,workGoalId:goalId});
 try{
  // Advance invokes the existing engine, whose nested transactions have final
  // commit admission. Pure read/verification callbacks serialize with cancellation.
  const invoke=async(c:PoolClient)=>{
   const family=await evidenceFamily(c,goalId,trial.spec.companyId,policy);
   if(family.hash!==reservation.familyHash)throw Error('EVIDENCE_DELEGATION_CHANGED');
   await trial.scope(c,goalId);await trial.live(c,reservation.agentId);return run(c);
  };
  const outcome:any=await withTransaction(invoke);
  const evidence={...outcome.evidence,evaluationReservation:{trialId:trial.id,id:reservation.id,kind,goalId}};
  await trial.finish(reservation.id,{status:'success',disposition:'persisted-result-required',...(kind==='readback'?{verificationResult:outcome.result,verificationEvidenceHash:sha256Hex(evidence)}:{resultHash:sha256Hex(outcome.result)})});
  return {...outcome,evidence} as T;
 }catch(error){await trial.finish(reservation.id,{status:'failure'});throw error;}
}
