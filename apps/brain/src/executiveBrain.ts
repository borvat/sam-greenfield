import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { observeAndEnterPlanning, persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { proposePlan } from "./planner";
import { evaluatePlanAuthority, type CapabilityAuthorityPolicy } from "./authorityGuard";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";
import { authorizeDevelopmentGoal } from "../../development/src/planningPolicy";

export async function runBrainPlanningCycle(input: {
  gateway: ModelGateway;
  goalId: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
  capabilityPolicies: CapabilityAuthorityPolicy;
}) {
  const goal = await withTransaction(async (client) => {
    await authorizeDevelopmentGoal(client, input.goalId);
    const res = await client.query(
      "SELECT id,objective,state FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (goal.state !== "NEW") {
    throw new Error(`Brain planning cycle requires NEW goal, got ${goal.state}`);
  }

  const context = await observeAndEnterPlanning(input.goalId);

  const candidate = await proposePlan({
    gateway: input.gateway,
    goalId: input.goalId,
    objective: goal.objective,
    context,
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
