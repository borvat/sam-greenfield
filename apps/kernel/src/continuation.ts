import type { GoalState } from "../../../packages/shared/src/types";
import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";

export async function scheduleContinuationAtomic(
  goalId: string,
  expectedState: GoalState,
  waitingState: Extract<GoalState, "WAITING_EXTERNAL" | "WAITING_OWNER" | "BLOCKED">,
  wakeAt: Date,
  reason: string
): Promise<void> {
  await withTransaction(async (client) => {
    await transitionGoal(client, goalId, expectedState, waitingState, reason, {
      next_wake_at: wakeAt.toISOString()
    });
    await client.query(
      "UPDATE goals SET next_wake_at=$2, wake_reason=$3 WHERE id=$1",
      [goalId, wakeAt, reason]
    ).catch(async () => {
      await client.query(
        "UPDATE goals SET next_wake_at=$2 WHERE id=$1",
        [goalId, wakeAt]
      );
    });
  });
}

export async function wakeDueGoals(limit = 100): Promise<string[]> {
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT id, state
         FROM goals
        WHERE next_wake_at IS NOT NULL
          AND next_wake_at <= now()
          AND state IN ('WAITING_EXTERNAL','WAITING_OWNER','BLOCKED')
        ORDER BY next_wake_at, id
        FOR UPDATE SKIP LOCKED
        LIMIT $1`,
      [limit]
    );

    const ids: string[] = [];
    for (const row of res.rows) {
      const from = row.state as GoalState;
      await client.query(
        "UPDATE goals SET state='MODELING', next_wake_at=NULL, updated_at=now() WHERE id=$1",
        [row.id]
      );
      await insertOutboxEvent(client, {
        aggregateType: "goal",
        aggregateId: row.id,
        eventType: "GOAL_CONTINUATION_DUE",
        payload: { from, to: "MODELING" }
      });
      ids.push(row.id);
    }
    return ids;
  });
}
