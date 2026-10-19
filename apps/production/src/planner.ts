import { withTransaction } from "../../../packages/db/src/client";
import { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import { runCatalogPlanningCycle,runCatalogReplanCycle } from "../../agents/src/executiveFlow";
import type { ValidatedProductionBundle } from "./bundle";

export async function planNextNewGoal(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;goalId?:string}>{
  const adapters=bundle.raw.modelAdapters??[];
  if(adapters.length===0) return {processed:false};

  const next=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT id FROM goals
        WHERE state='NEW'
        ORDER BY priority DESC,created_at,id
        LIMIT 1`
    );
    return res.rows[0]?.id as string|undefined;
  });
  if(!next) return {processed:false};

  const gateway=new ModelGateway(
    Object.fromEntries(adapters.map((adapter)=>[adapter.providerId,adapter]))
  );

  await runCatalogPlanningCycle({
    catalog:bundle.catalog,
    gateway,
    goalId:next,
    dataClassification:bundle.raw.dataClassification??"INTERNAL",
    maxCostUsd:bundle.raw.planningMaxCostUsd??0.25
  });

  return {processed:true,goalId:next};
}

export async function replanNextGoal(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;goalId?:string}>{
  const adapters=bundle.raw.modelAdapters??[];
  if(adapters.length===0)return {processed:false};
  const next=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT id,replan_reason FROM goals
        WHERE state='REPLANNING'
        ORDER BY priority DESC,updated_at,id
        LIMIT 1`
    );
    return res.rows[0] as {id:string;replan_reason:string|null}|undefined;
  });
  if(!next)return {processed:false};
  const gateway=new ModelGateway(Object.fromEntries(adapters.map((adapter)=>[adapter.providerId,adapter])));
  await runCatalogReplanCycle({
    catalog:bundle.catalog,
    gateway,
    goalId:next.id,
    reason:next.replan_reason??"Verification found a read-only data gap",
    dataClassification:bundle.raw.dataClassification??"INTERNAL",
    maxCostUsd:bundle.raw.planningMaxCostUsd??0.25
  });
  return {processed:true,goalId:next.id};
}
