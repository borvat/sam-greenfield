import { createToolExecutors } from "../../tools/src/executorFactory";
import { reconcilePendingSideEffects } from "../../tools/src/reconciler";
import { runCatalogSpecialistTick } from "../../agents/src/executiveFlow";
import type { RuntimeComposition } from "../../runtime/src/service";
import type { ValidatedProductionBundle } from "./bundle";
import { planNextNewGoal } from "./planner";
import { verifyNextExecution } from "./verifier";
import { learnNextVerifiedExecution } from "./learning";

export function createProductionComposition(input:{
  bundle:ValidatedProductionBundle;
  workerId:string;
  operationalTick?:()=>Promise<unknown>;
}):RuntimeComposition{
  const executors=createToolExecutors({
    catalog:input.bundle.catalog,
    tools:input.bundle.tools
  });
  const ttl=input.bundle.raw.workerLeaseTtlSeconds??60;
  const hasSideEffects=Object.keys(input.bundle.catalog.authorityPolicies()).some(id=>input.bundle.tools.definition(id).sideEffect);

  return {
    async runWorkTick(){
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

      return {reconciliation,planning,execution,verification,learning,operational};
    }
  };
}
