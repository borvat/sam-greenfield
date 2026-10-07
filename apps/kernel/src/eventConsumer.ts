import { withTransaction } from "../../../packages/db/src/client";
import { nextEventForConsumer, markConsumerEventProcessed } from "../../event-fabric/src/index";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";

const CONSUMER_ID = "kernel_runtime";
const WAKE_EVENTS = new Set([
  "EXTERNAL_REPLY",
  "APPROVAL_RESOLVED",
  "DEPENDENCY_READY",
  "GOAL_CONTINUATION_DUE"
]);

export async function processNextKernelEventAtomic(): Promise<{
  processed: boolean;
  eventSeq?: number;
  goalId?: string;
  wokeGoal?: boolean;
}> {
  return withTransaction(async (client) => {
    const event = await nextEventForConsumer(client, CONSUMER_ID);
    if (!event) return { processed: false };

    const payload = event.payload ?? {};
    const goalId = typeof payload.goal_id === "string" ? payload.goal_id : undefined;
    let wokeGoal = false;

    if (goalId && WAKE_EVENTS.has(event.event_type)) {
      const goal = await client.query(
        "SELECT id,state FROM goals WHERE id=$1 FOR UPDATE",
        [goalId]
      );
      if (
        goal.rowCount === 1 &&
        ["WAITING_EXTERNAL","WAITING_OWNER","BLOCKED"].includes(goal.rows[0].state)
      ) {
        const from = goal.rows[0].state;
        await client.query(
          "UPDATE goals SET state='MODELING',next_wake_at=NULL,updated_at=now() WHERE id=$1",
          [goalId]
        );
        await insertOutboxEvent(client, {
          aggregateType: "goal",
          aggregateId: goalId,
          eventType: "GOAL_WOKEN_BY_EVENT",
          payload: {
            goal_id: goalId,
            from,
            to: "MODELING",
            source_event_seq: Number(event.event_seq),
            source_event_type: event.event_type
          }
        });
        wokeGoal = true;
      }
    }

    await markConsumerEventProcessed(client, CONSUMER_ID, event.dedup_key);

    return {
      processed: true,
      eventSeq: Number(event.event_seq),
      goalId,
      wokeGoal
    };
  });
}
