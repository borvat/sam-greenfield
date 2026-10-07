import type { GoalState } from "../../../packages/shared/src/types";
import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";

const ALLOWED: Record<GoalState, readonly GoalState[]> = {
  NEW: ["MODELING", "CANCELLED", "FAILED"],
  MODELING: ["PLANNING", "BLOCKED", "FAILED", "CANCELLED"],
  PLANNING: ["EXECUTING", "WAITING_OWNER", "BLOCKED", "FAILED", "CANCELLED"],
  EXECUTING: ["VERIFYING", "WAITING_EXTERNAL", "WAITING_OWNER", "BLOCKED", "FAILED", "CANCELLED"],
  WAITING_EXTERNAL: ["MODELING", "EXECUTING", "VERIFYING", "FAILED", "CANCELLED"],
  WAITING_OWNER: ["MODELING", "EXECUTING", "FAILED", "CANCELLED"],
  BLOCKED: ["MODELING", "PLANNING", "EXECUTING", "FAILED", "CANCELLED"],
  VERIFYING: ["COMPLETED", "REPLANNING", "WAITING_EXTERNAL", "FAILED"],
  REPLANNING: ["PLANNING", "BLOCKED", "FAILED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: []
};

export function canTransition(from: GoalState, to: GoalState): boolean {
  return ALLOWED[from].includes(to);
}

export async function transitionGoal(
  client: any,
  goalId: string,
  expectedState: GoalState,
  nextState: GoalState,
  reason?: string,
  extraPayload: Record<string, unknown> = {}
): Promise<void> {
  if (!canTransition(expectedState, nextState)) {
    throw new Error(`Illegal goal transition ${expectedState} -> ${nextState}`);
  }

  const locked = await client.query(
    "SELECT id, state FROM goals WHERE id=$1 FOR UPDATE",
    [goalId]
  );
  if (locked.rowCount !== 1) throw new Error(`Goal not found: ${goalId}`);
  const actual = locked.rows[0].state as GoalState;
  if (actual !== expectedState) {
    throw new Error(`Goal state changed concurrently: expected ${expectedState}, actual ${actual}`);
  }

  await client.query(
    "UPDATE goals SET state=$2, updated_at=now() WHERE id=$1",
    [goalId, nextState]
  );

  await insertOutboxEvent(client, {
    aggregateType: "goal",
    aggregateId: goalId,
    eventType: "GOAL_STATE_CHANGED",
    payload: {
      from: expectedState,
      to: nextState,
      reason: reason ?? null,
      ...extraPayload
    }
  });
}

export async function transitionGoalAtomic(
  goalId: string,
  expectedState: GoalState,
  nextState: GoalState,
  reason?: string,
  extraPayload: Record<string, unknown> = {}
): Promise<void> {
  return withTransaction((client) =>
    transitionGoal(client, goalId, expectedState, nextState, reason, extraPayload)
  );
}
