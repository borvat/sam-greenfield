import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { observeAndEnterPlanning, persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { proposePlan } from "./planner";
import { evaluatePlanAuthority, type CapabilityAuthorityPolicy } from "./authorityGuard";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";
import { authorizeDevelopmentGoal } from "../../development/src/planningPolicy";
import { assembleContext } from "./contextAssembler";

export async function runBrainPlanningCycle(input: {
  gateway: ModelGateway;
  goalId: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
  capabilityPolicies: CapabilityAuthorityPolicy;
  availableCapabilities?: unknown[];
}) {
  const goal = await withTransaction(async (client) => {
    await authorizeDevelopmentGoal(client, input.goalId);
    const res = await client.query(
      "SELECT id,objective,state,company_scope,replan_reason FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (!["NEW","MODELING","PLANNING"].includes(goal.state)) {
    throw new Error(`Brain planning cycle cannot resume ${goal.state}`);
  }

  const context = goal.state==="NEW"?await observeAndEnterPlanning(input.goalId):await withTransaction(async client=>{
    if(!goal.company_scope) return {entityType:"legal_entity",entityId:null,facts:[],memory:[]};
    const assembled=await assembleContext(client,"legal_entity",goal.company_scope);
    return {entityType:assembled.entity.type,entityId:assembled.entity.id,facts:assembled.facts,memory:assembled.memory};
  });
  if(goal.state==="MODELING")await transitionGoalAtomic(input.goalId,"MODELING","PLANNING","kernel_observe_resumed");

  const candidate = await proposePlan({
    gateway: input.gateway,
    goalId: input.goalId,
    objective: goal.objective,
    context:goal.replan_reason?{...context,replan_reason:goal.replan_reason}:context,
    availableCapabilities:input.availableCapabilities,
    dataClassification: input.dataClassification,
    maxCostUsd: input.maxCostUsd,
    preferredProviders: input.preferredProviders
  });

  const authority = await withTransaction((client) => evaluatePlanAuthority(client, {
    goalId: input.goalId,
    legalEntityId: context.entityId,
    steps: candidate.steps,
    capabilityPolicies: input.capabilityPolicies
  }));

  if (!authority.authorized) {
    await transitionGoalAtomic(
      input.goalId,
      "PLANNING",
      "WAITING_OWNER",
      "candidate_plan_requires_authority",
      { blocked: authority.blocked }
    );
    throw new Error("Candidate plan blocked by authority policy");
  }

  const persisted = await persistPlanAndStartExecution(candidate);

  return {
    context,
    candidate,
    authority,
    persisted
  };
}
