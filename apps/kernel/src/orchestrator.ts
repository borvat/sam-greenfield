import { localDevelopment, authorizeDevelopmentGoal } from "../../development/src/planningPolicy";
import { transitionGoalAtomic } from "./stateMachine";
import { persistPlanAndDelegateAtomic, type PersistPlanInput } from "./planning";
import { assembleContext } from "../../brain/src/contextAssembler";
import { withTransaction } from "../../../packages/db/src/client";

export async function observeAndEnterPlanning(goalId: string): Promise<{
  entityType: string;
  entityId: string | null;
  facts: unknown[];
  memory: unknown[];
}> {
  if (localDevelopment()) {
    await withTransaction(client => authorizeDevelopmentGoal(client, goalId));
  }
  await transitionGoalAtomic(goalId, "NEW", "MODELING", "kernel_observe_started");

  const context = await withTransaction(async (client) => {
    const goal = await client.query(
      "SELECT company_scope FROM goals WHERE id=$1",
      [goalId]
    );
    if (goal.rowCount !== 1) throw new Error("Goal not found");
    const entityId = goal.rows[0].company_scope as string | null;
    if (!entityId) {
      return { entityType: "legal_entity", entityId: null, facts: [], memory: [] };
    }
    const assembled = await assembleContext(client, "legal_entity", entityId);
    return {
      entityType: assembled.entity.type,
      entityId: assembled.entity.id,
      facts: assembled.facts,
      memory: assembled.memory
    };
  });

  await transitionGoalAtomic(goalId, "MODELING", "PLANNING", "kernel_observe_complete", {
    fact_count: context.facts.length,
    memory_count: context.memory.length
  });

  return context;
}

export async function persistPlanAndStartExecution(input: PersistPlanInput) {
  return persistPlanAndDelegateAtomic(input);
}
