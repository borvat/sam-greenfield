import {relayOutboxUntilEmpty} from '../../kernel/src/outboxRelay';
import {processNextKernelEventAtomic} from '../../kernel/src/eventConsumer';
import {reconcileBlockedDependencies} from '../../kernel/src/dependencies';
import { createToolExecutors } from "../../tools/src/executorFactory";
import { reconcilePendingSideEffects } from "../../tools/src/reconciler";
import { runCatalogSpecialistTick } from "../../agents/src/executiveFlow";
import type { RuntimeComposition } from "../../runtime/src/service";
import type { ValidatedProductionBundle } from "./bundle";
import { planNextNewGoal } from "./planner";
import { verifyNextExecution } from "./verifier";
import { learnNextVerifiedExecution } from "./learning";
import { recoverKernelAfterRestart } from "../../kernel/src/recovery";
import {withTransaction} from "../../../packages/db/src/client";
import {pilotEnabled,authorizePilotGoal,assertPilotStep} from "./syntheticPilotScope";

export function createProductionComposition(input:{
  bundle:ValidatedProductionBundle;
  workerId:string;
  operationalTick?:()=>Promise<unknown>;
  authorizeWork?:(work:import('../../kernel/src/workerRuntime').ClaimedWork)=>Promise<void>;
}):RuntimeComposition{
  const ordinaryExecutors=createToolExecutors({
    catalog:input.bundle.catalog,
    tools:input.bundle.tools
  });
  const executors=Object.fromEntries(Object.entries(ordinaryExecutors).map(([id,execute])=>[id,async(work:Parameters<typeof execute>[0])=>{
    if(input.authorizeWork)await input.authorizeWork(work);
    if(pilotEnabled()){
      if(!work.goalId)throw new Error("PILOT_GOAL_SCOPE_DENIED");
      const objective=await withTransaction(client=>authorizePilotGoal(client,work.goalId!));
      assertPilotStep(objective,work.capabilityId,work.params);
    }
    return execute(work);
  }]));
  const ttl=input.bundle.raw.workerLeaseTtlSeconds??60;
  const hasSideEffects=Object.keys(input.bundle.catalog.authorityPolicies()).some(id=>input.bundle.tools.definition(id).sideEffect);

  const attempt=async<T>(stage:string,run:()=>Promise<T>):Promise<T|{processed:false;failed:true;reason:string}>=>{
    try{return await run();}catch{
      console.error(JSON.stringify({event:'RUNTIME_STAGE_FAILED',stage,details:'withheld'}));
      return {processed:false,failed:true,reason:'STAGE_FAILED'};
    }
  };
  return {
    async runWorkTick(){
      const recovery=await recoverKernelAfterRestart();
      const dependencyRecovery=await reconcileBlockedDependencies();
      const events={relayed:await relayOutboxUntilEmpty(100),consumed:0};
      while(events.consumed<100&&(await processNextKernelEventAtomic()).processed)events.consumed++;
      const reconciliation=hasSideEffects?await attempt("reconciliation",()=>reconcilePendingSideEffects({
        tools:input.bundle.tools,
        limit:25
      })):null;
      const earlyVerification=input.bundle.raw.deferVerification?await attempt("verification",()=>verifyNextExecution(input.bundle)):null;
      const earlyLearning=input.bundle.raw.deferVerification?await attempt("learning",()=>learnNextVerifiedExecution(input.bundle)):null;
      const planning=await attempt("planning",()=>planNextNewGoal(input.bundle));
      const execution=await attempt("execution",()=>runCatalogSpecialistTick({
        catalog:input.bundle.catalog,
        workerInstanceId:input.workerId,
        ttlSeconds:ttl,
        executors
      }));
      const verification=earlyVerification??await attempt("verification",()=>verifyNextExecution(input.bundle));
      const learning=earlyLearning??await attempt("learning",()=>learnNextVerifiedExecution(input.bundle));
      const operational=input.operationalTick?await attempt("operational",input.operationalTick):null;

      return {events,dependencyRecovery,recovery,reconciliation,planning,execution,verification,learning,operational};
    }
  };
}
