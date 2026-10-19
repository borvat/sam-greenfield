import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { assembleContext } from "./contextAssembler";
import { proposePlan } from "./planner";
import { beginReplanAtomic } from "../../kernel/src/replanning";
import { persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { evaluatePlanAuthority, type CapabilityAuthorityPolicy } from "./authorityGuard";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";

function compactExecutionResults(rows:Array<Record<string,any>>){
  return rows.map((row)=>{
    const outer=row.result&&typeof row.result==="object"?row.result as Record<string,any>:{};
    const data=outer.data&&typeof outer.data==="object"?outer.data as Record<string,any>:outer;
    if(Array.isArray(data.orders))return {capability_id:row.capability_id,params:row.params,order_count:data.orders.length,order_ids:data.orders.slice(0,10).map((x:any)=>x?.orderId).filter(Boolean),analysis:data.analysis,pagination:data.pagination};
    if(Array.isArray(data.returns))return {capability_id:row.capability_id,params:row.params,return_count:data.returns.length,order_ids:[...new Set(data.returns.map((x:any)=>x?.returnItems?.map((i:any)=>i?.orderId)??[]).flat().filter(Boolean))].slice(0,20),pagination:data.pagination};
    if(Array.isArray(data.inventory))return {capability_id:row.capability_id,params:row.params,inventory_count:data.inventory.length,analysis:data.analysis,pagination:data.pagination};
    return {capability_id:row.capability_id,params:row.params,result_preview:JSON.stringify(data).slice(0,1000)};
  });
}

export async function runBrainReplanCycle(input: {
  gateway: ModelGateway;
  goalId: string;
  reason: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
  capabilityPolicies: CapabilityAuthorityPolicy;
  availableCapabilities?:unknown[];
}) {
  const goal = await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id,objective,state,company_scope,current_plan_id FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (goal.state !== "REPLANNING") {
    throw new Error(`Brain replan cycle requires REPLANNING goal, got ${goal.state}`);
  }

  const replanState = await beginReplanAtomic(input.goalId,input.reason);
  if (replanState === "FAILED") {
    return { failed:true, reason:"replan_budget_exhausted" as const };
  }

  const context = await withTransaction(async (client) => {
    const prior=goal.current_plan_id?await client.query(
      `SELECT capability_id,params,result FROM executions
        WHERE goal_id=$1 AND plan_id=$2 AND status='EXECUTED'
        ORDER BY finished_at DESC NULLS LAST,started_at DESC LIMIT 20`,
      [input.goalId,goal.current_plan_id]
    ): {rows:[]};
    const previous_execution_evidence=compactExecutionResults(prior.rows);
    if (!goal.company_scope) {
      return { entity:{type:"legal_entity",id:null},facts:[],memory:[],previous_execution_evidence };
    }
    return {...await assembleContext(client,"legal_entity",goal.company_scope),previous_execution_evidence};
  });

  const candidate = await proposePlan({
    gateway:input.gateway,
    goalId:input.goalId,
    objective:goal.objective,
    availableCapabilities:input.availableCapabilities,
    context:{
      ...context,
      replan_reason:input.reason
    },
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    preferredProviders:input.preferredProviders
  });

  const authority = await withTransaction((client) => evaluatePlanAuthority(client, {
    goalId: input.goalId,
    legalEntityId: goal.company_scope ?? null,
    steps: candidate.steps,
    capabilityPolicies: input.capabilityPolicies
  }));

  if (!authority.authorized) {
    await transitionGoalAtomic(
      input.goalId,
      "PLANNING",
      "WAITING_OWNER",
      "replanned_candidate_requires_authority",
      { blocked: authority.blocked }
    );
    throw new Error("Replanned candidate blocked by authority policy");
  }

  const persisted = await persistPlanAndStartExecution(candidate);

  return {
    failed:false,
    context,
    candidate,
    authority,
    persisted
  };
}
