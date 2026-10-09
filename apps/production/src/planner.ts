import { withTransaction } from "../../../packages/db/src/client";
import { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import { runCatalogPlanningCycle,runCatalogReplanCycle } from "../../agents/src/executiveFlow";
import { autonomyEnabled } from "../../development/src/autonomyBoundary";
import { transitionGoal } from "../../kernel/src/stateMachine";
import type { ValidatedProductionBundle } from "./bundle";

export async function planNextNewGoal(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;goalId?:string}>{
  const adapters=bundle.raw.modelAdapters??[];
  if(adapters.length===0) return {processed:false};

  return withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT id,state FROM goals
        WHERE state IN ('NEW','MODELING','PLANNING','REPLANNING')
        ORDER BY priority DESC,created_at,id
        LIMIT 1`
    );
    const next=res.rows[0];
    if(!next) return {processed:false};
    const locked=await client.query("SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS ok",["sam-planning:"+next.id]);
    if(!locked.rows[0].ok)return {processed:false};
    const current=(await client.query("SELECT state FROM goals WHERE id=$1",[next.id])).rows[0];
    if(!["NEW","MODELING","PLANNING","REPLANNING"].includes(current.state))return {processed:false};
    if(current.state==="REPLANNING"&&bundle.raw.replanPolicy){
      const failure=await client.query(`SELECT v.independent_evidence FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 AND v.result='FAILED' ORDER BY v.checked_at DESC,v.id DESC LIMIT 1`,[next.id]);
      if(!bundle.raw.replanPolicy.recoverableEvidenceReasons.includes(failure.rows[0]?.independent_evidence?.reason)){
        await transitionGoal(client,next.id,"REPLANNING","BLOCKED","nonrecoverable_verification_failure",{reason:"RECOVERY_NOT_AUTHORIZED"});
        return {processed:true,goalId:next.id};
      }
    }

  const gateway=bundle.raw.plannerGateway?.()??new ModelGateway(
    Object.fromEntries(adapters.map((adapter)=>[adapter.providerId,adapter]))
  );

  const input={
    catalog:bundle.catalog,
    gateway,
    goalId:next.id,
    dataClassification:bundle.raw.dataClassification??"INTERNAL",
    maxCostUsd:bundle.raw.planningMaxCostUsd??0.25
  };
  try{
    if(current.state==="REPLANNING")await runCatalogReplanCycle({...input,reason:"independent_verification_failed"});
    else await runCatalogPlanningCycle(input);
  }catch(error){
    if(autonomyEnabled())await withTransaction(async db=>{
      const state=(await db.query("SELECT state FROM goals WHERE id=$1 FOR UPDATE",[next.id])).rows[0]?.state;
      if(state==="PLANNING")await transitionGoal(db,next.id,"PLANNING","WAITING_OWNER","planning_failed_closed",{reason:"AUTONOMY_PLANNING_REJECTED"});
    });
    throw error;
  }

  return {processed:true,goalId:next.id};
  });
}
