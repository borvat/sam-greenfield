import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { observeAndEnterPlanning, persistPlanAndStartExecution } from "../../kernel/src/orchestrator";
import { proposePlan } from "./planner";

export async function runBrainPlanningCycle(input: {
  gateway: ModelGateway;
  goalId: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
}) {
  const goal = await withTransaction(async (client) => {
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

  const persisted = await persistPlanAndStartExecution(candidate);

  return {
    context,
    candidate,
    persisted
  };
}
