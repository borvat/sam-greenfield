import { createToolExecutors } from "../../tools/src/executorFactory";
import { reconcilePendingSideEffects } from "../../tools/src/reconciler";
import { runCatalogSpecialistTick } from "../../agents/src/executiveFlow";
import type { RuntimeComposition } from "../../runtime/src/service";
import type { ValidatedProductionBundle } from "./bundle";
import { planNextNewGoal } from "./planner";
import { verifyNextExecution } from "./verifier";

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

  return {
    async runWorkTick(){
      const reconciliation=await reconcilePendingSideEffects({
        tools:input.bundle.tools,
        limit:25
      });
      const planning=await planNextNewGoal(input.bundle);
      const execution=await runCatalogSpecialistTick({
        catalog:input.bundle.catalog,
        workerInstanceId:input.workerId,
        ttlSeconds:ttl,
        executors
      });
      const verification=await verifyNextExecution(input.bundle);
      const operational=input.operationalTick?await input.operationalTick():null;

      return {reconciliation,planning,execution,verification,operational};
    }
  };
}
