import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { observeAndEnterPlanning, persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { proposePlan } from "./planner";
import { evaluatePlanAuthority, type CapabilityAuthorityPolicy } from "./authorityGuard";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";

export async function runBrainPlanningCycle(input: {
  alreadyModeling?:boolean;
  gateway: ModelGateway;
  goalId: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
  capabilityPolicies: CapabilityAuthorityPolicy;
  availableCapabilities?:unknown[];
}) {
  const goal = await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id,objective,state,completion_definition FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (goal.state !== (input.alreadyModeling?"MODELING":"NEW")) {
    throw new Error(`Brain planning cycle requires NEW goal, got ${goal.state}`);
  }

  const context = await observeAndEnterPlanning(input.goalId,input.alreadyModeling);

  const candidate = await proposePlan({
    gateway: input.gateway,
    goalId: input.goalId,
    objective: goal.objective,
    context:goal.completion_definition==="sam.read_report.v1"?{...context,continuation:"After independent verification the executive observes results, plans concrete follow-up reads from returned IDs, and persists an evidence-linked final report. Start with discovery when IDs are unknown; do not invent IDs or declare the remaining deliverables impossible."}:context,
    availableCapabilities:goal.completion_definition==="sam.read_report.v1"?input.availableCapabilities?.filter((x:any)=>x.sideEffect===false&&x.authorityClass==="GREEN"):input.availableCapabilities,
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
