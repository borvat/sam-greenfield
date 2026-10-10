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
}):RuntimeComposition{
  const ordinaryExecutors=createToolExecutors({
    catalog:input.bundle.catalog,
    tools:input.bundle.tools
  });
  const executors=Object.fromEntries(Object.entries(ordinaryExecutors).map(([id,execute])=>[id,async(work:Parameters<typeof execute>[0])=>{
    if(pilotEnabled()){
      if(!work.goalId)throw new Error("PILOT_GOAL_SCOPE_DENIED");
      const objective=await withTransaction(client=>authorizePilotGoal(client,work.goalId!));
      assertPilotStep(objective,work.capabilityId,work.params);
    }
    return execute(work);
  }]));
  const ttl=input.bundle.raw.workerLeaseTtlSeconds??60;
  const hasSideEffects=Object.keys(input.bundle.catalog.authorityPolicies()).some(id=>input.bundle.tools.definition(id).sideEffect);

  return {
    async runWorkTick(){
      const recovery=await recoverKernelAfterRestart();
      const reconciliation=hasSideEffects?await reconcilePendingSideEffects({
        tools:input.bundle.tools,
        limit:25
      }):null;
      const earlyVerification=input.bundle.raw.deferVerification?await verifyNextExecution(input.bundle):null;
      const earlyLearning=input.bundle.raw.deferVerification?await learnNextVerifiedExecution(input.bundle):null;
      const planning=await planNextNewGoal(input.bundle);
      const execution=await runCatalogSpecialistTick({
        catalog:input.bundle.catalog,
        workerInstanceId:input.workerId,
        ttlSeconds:ttl,
        executors
      });
      const verification=earlyVerification??await verifyNextExecution(input.bundle);
      const learning=earlyLearning??await learnNextVerifiedExecution(input.bundle);
      const operational=input.operationalTick?await input.operationalTick():null;

      return {recovery,reconciliation,planning,execution,verification,learning,operational};
    }
  };
}
