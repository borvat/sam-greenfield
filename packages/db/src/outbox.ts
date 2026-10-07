export interface OutboxInput {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export async function insertOutboxEvent(client: any, input: OutboxInput): Promise<string> {
  const res = await client.query(
    `INSERT INTO outbox_events(aggregate_type, aggregate_id, event_type, payload)
     VALUES($1,$2,$3,$4::jsonb)
     RETURNING id`,
    [input.aggregateType, input.aggregateId, input.eventType, JSON.stringify(input.payload)]
  );
  return res.rows[0].id;
}

export async function claimOutboxBatch(client: any, limit = 100) {
  const res = await client.query(
    `SELECT *
       FROM outbox_events
      WHERE status='PENDING'
      ORDER BY created_at, id
      FOR UPDATE SKIP LOCKED
      LIMIT $1`,
    [limit]
  );
  return res.rows;
}

export async function markOutboxPublished(client: any, outboxId: string): Promise<void> {
  await client.query(
    `UPDATE outbox_events
        SET status='PUBLISHED', published_at=now(), publish_attempt=publish_attempt+1
      WHERE id=$1 AND status='PENDING'`,
    [outboxId]
  );
}

export async function markOutboxFailed(client: any, outboxId: string): Promise<void> {
  await client.query(
    `UPDATE outbox_events
        SET status='FAILED', publish_attempt=publish_attempt+1
      WHERE id=$1 AND status='PENDING'`,
    [outboxId]
  );
}

export async function publishOutbox(
  client: any,
  publish: (event: any) => Promise<void>,
  limit = 100
): Promise<number> {
  const rows = await claimOutboxBatch(client, limit);
  let published = 0;
  for (const row of rows) {
    try {
      await publish(row);
      await markOutboxPublished(client, row.id);
      published += 1;
    } catch (err) {
      await client.query(
        "UPDATE outbox_events SET publish_attempt=publish_attempt+1 WHERE id=$1",
        [row.id]
      );
      throw err;
    }
  }
  return published;
}
