import {scopedCatalog} from "../../perception/src/policy";
import { recordPlanningFailure } from "../../kernel/src/failures";
import { withTransaction } from "../../../packages/db/src/client";
import { transitionGoal } from "../../kernel/src/stateMachine";
import { beginReplan } from "../../kernel/src/replanning";
import { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import { runCatalogPlanningCycle,runCatalogReplanCycle } from "../../agents/src/executiveFlow";
import type { ValidatedProductionBundle } from "./bundle";

export async function planNextNewGoal(
  bundle:ValidatedProductionBundle,
  deadlineMs=120_000
):Promise<{processed:boolean;goalId?:string;failed?:boolean}>{
  if(!Number.isFinite(deadlineMs)||deadlineMs<=0)throw new Error("Planning deadline must be positive");
  const adapters=bundle.raw.modelAdapters??[];
  if(adapters.length===0) return {processed:false};

  // Claim the planning state atomically before making a model request. A second
  // runtime cannot plan this goal while the first one's request is in flight.
  const next=await withTransaction(async client=>{
    const res=await client.query(
      `SELECT id,state,replan_reason FROM goals
        WHERE state IN ('NEW','REPLANNING')
        ORDER BY priority DESC,created_at,id
        FOR UPDATE SKIP LOCKED LIMIT 1`
    );
    const row=res.rows[0] as {id:string;state:string;replan_reason:string|null}|undefined;
    if(!row) return null;
    if(row.state==="REPLANNING"){
      const result=await beginReplan(client,row.id,row.replan_reason??"independent verification failed");
      return {...row,exhausted:result==="FAILED"};
    }
    await transitionGoal(client,row.id,"NEW","MODELING","runtime_claimed_planning");
    return {...row,exhausted:false};
  });
  if(!next) return {processed:false};
  if(next.exhausted) return {processed:true,goalId:next.id,failed:true};

  const gateway=new ModelGateway(Object.fromEntries(adapters.map(adapter=>[adapter.providerId,adapter])));
  let deadline:NodeJS.Timeout|undefined;
  try{
  const planningInput={
    catalog:await withTransaction(c=>scopedCatalog(c,bundle.catalog,next.id)),gateway,goalId:next.id,
    dataClassification:bundle.raw.dataClassification??"INTERNAL",
    maxCostUsd:bundle.raw.planningMaxCostUsd??0.25
  };
    const planning=next.state==="REPLANNING"
      ?runCatalogReplanCycle({...planningInput,alreadyStarted:true,reason:next.replan_reason??"independent verification failed"})
      :runCatalogPlanningCycle({...planningInput,alreadyModeling:true});
    await Promise.race([planning,new Promise<never>((_,reject)=>{
      deadline=setTimeout(()=>reject(new Error(`PLANNING_DEADLINE_EXCEEDED: no completed plan within ${deadlineMs}ms`)),deadlineMs);
    })]);
    return {processed:true,goalId:next.id};
  }catch(error){
    const failed=await recordPlanningFailure(next.id,error);
    return {processed:true,goalId:next.id,failed};
  }finally{
    if(deadline)clearTimeout(deadline);
  }
}
