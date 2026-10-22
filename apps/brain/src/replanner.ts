import {loadReplanContext} from './replanContext';
import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { assembleContext } from "./contextAssembler";
import { proposePlan } from "./planner";
import { beginReplanAtomic } from "../../kernel/src/replanning";
import { persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { evaluatePlanAuthority, type CapabilityAuthorityPolicy } from "./authorityGuard";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";
import { authorizeDevelopmentGoal } from "../../development/src/planningPolicy";
import {pilotEnabled,authorizePilotGoal} from "../../production/src/syntheticPilotScope";

export async function runBrainReplanCycle(input: {
  alreadyStarted?:boolean;
  gateway: ModelGateway;
  goalId: string;
  reason: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  signal?: AbortSignal;
  preferredProviders?: string[];
  capabilityPolicies: CapabilityAuthorityPolicy;
  availableCapabilities?: unknown[];
}) {
  const goal = await withTransaction(async (client) => {
    if(pilotEnabled())await authorizePilotGoal(client,input.goalId);
    await authorizeDevelopmentGoal(client, input.goalId);
    const res = await client.query(
      "SELECT id,objective,state,company_scope FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (goal.state !== (input.alreadyStarted?"PLANNING":"REPLANNING")) {
    throw new Error(`Brain replan cycle requires REPLANNING goal, got ${goal.state}`);
  }

  const replanState = input.alreadyStarted?"PLANNING":await beginReplanAtomic(input.goalId,input.reason);
  if (replanState === "FAILED") {
    return { failed:true, reason:"replan_budget_exhausted" as const };
  }

  const context = await withTransaction(async (client) => {
    if (!goal.company_scope) {
      return { entity:{type:"legal_entity",id:null},facts:[],memory:[] };
    }
    return assembleContext(client,"legal_entity",goal.company_scope,goal.objective);
  });

  const failedReads=await withTransaction(async client=>{
    const r=await client.query("SELECT DISTINCT capability_id,params FROM work_queue WHERE goal_id=$1 AND status='FAILED'",[input.goalId]);
    const readOnly=new Set((input.availableCapabilities??[]).filter((x:any)=>x?.sideEffect===false).map((x:any)=>String(x.capabilityId)));
    return r.rows.filter((x:any)=>readOnly.has(String(x.capability_id))).map((x:any)=>({capabilityId:String(x.capability_id),params:x.params??{}}));
  });
  const history=await loadReplanContext(input.goalId);
  const candidate = await proposePlan({
    gateway:input.gateway,
    goalId:input.goalId,
    objective:goal.objective,
    availableCapabilities:input.availableCapabilities,
    forbiddenReadSteps:failedReads,
    context:{
      ...context,
      ...history,
      replan_reason:input.reason
    },
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    signal:input.signal,preferredProviders:input.preferredProviders
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

  input.signal?.throwIfAborted();
  const persisted = await persistPlanAndStartExecution(candidate);

  return {
    failed:false,
    context,
    candidate,
    authority,
    persisted
  };
}
