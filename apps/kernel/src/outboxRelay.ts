import { withTransaction } from "../../../packages/db/src/client";
import { ingestEvent } from "../../event-fabric/src/index";
import { markOutboxPublished } from "../../../packages/db/src/outbox";

export async function relayNextOutboxToEventFabricAtomic(goalIds?:readonly string[]): Promise<{
  relayed: boolean;
  outboxId?: string;
  eventSeq?: number;
}> {
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT *
         FROM outbox_events
        WHERE status='PENDING' AND ($1::text[] IS NULL OR
         (aggregate_type='goal' AND aggregate_id::text=ANY($1::text[])) OR
         (aggregate_type='work_queue' AND EXISTS(SELECT 1 FROM work_queue w WHERE w.id::text=aggregate_id::text AND w.goal_id::text=ANY($1::text[]))))
        ORDER BY created_at,id
        FOR UPDATE SKIP LOCKED
        LIMIT 1`,[goalIds??null]
    );
    if (res.rowCount === 0) return { relayed: false };

    const row = res.rows[0];
    const ingested = await ingestEvent(client, {
      source: "outbox",
      sourceEventId: row.id,
      eventType: row.event_type,
      occurredAt: row.created_at,
      payload: {
        aggregate_type: row.aggregate_type,
        aggregate_id: row.aggregate_id,
        ...(row.payload ?? {})
      },
      dedupKey: `outbox:${row.id}`,
      provenance: { outbox_id: row.id },
      outboxRef: row.id
    });

    await markOutboxPublished(client, row.id);

    return {
      relayed: true,
      outboxId: row.id,
      eventSeq: Number(ingested.event.event_seq)
    };
  });
}

export async function relayOutboxUntilEmpty(maxEvents = 1000, goalIds?:readonly string[]): Promise<number> {
  let count = 0;
  while (count < maxEvents) {
    const next = await relayNextOutboxToEventFabricAtomic(goalIds);
    if (!next.relayed) break;
    count += 1;
  }
  return count;
}
