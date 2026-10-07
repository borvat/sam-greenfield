import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";

const MAX_REPLANS = 2;

export async function beginReplanAtomic(goalId: string, reason: string): Promise<"PLANNING" | "FAILED"> {
  return withTransaction(async (client) => {
    const goal = await client.query(
      "SELECT id,state,replan_attempts FROM goals WHERE id=$1 FOR UPDATE",
      [goalId]
    );
    if (goal.rowCount !== 1) throw new Error("Goal not found");
    if (goal.rows[0].state !== "REPLANNING") {
      throw new Error(`Goal must be REPLANNING, got ${goal.rows[0].state}`);
    }

    const attempts = Number(goal.rows[0].replan_attempts ?? 0);
    if (attempts >= MAX_REPLANS) {
      await transitionGoal(client, goalId, "REPLANNING", "FAILED", "replan_budget_exhausted", {
        replan_attempts: attempts,
        reason
      });
      return "FAILED";
    }

    const nextAttempts = attempts + 1;
    await client.query(
      "UPDATE goals SET replan_attempts=$2,replan_reason=$3,updated_at=now() WHERE id=$1",
      [goalId, nextAttempts, reason]
    );
    await transitionGoal(client, goalId, "REPLANNING", "PLANNING", "replan_started", {
      replan_attempts: nextAttempts,
      reason
    });
    await insertOutboxEvent(client, {
      aggregateType: "goal",
      aggregateId: goalId,
      eventType: "GOAL_REPLAN_STARTED",
      payload: { replan_attempts: nextAttempts, reason }
    });
    return "PLANNING";
  });
}
