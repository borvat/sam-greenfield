export interface FabricEvent {
  event_seq: number;
  dedup_key: string;
  source: string;
  event_type: string;
  payload: any;
}

export async function ingestEvent(
  client: any,
  input: {
    source: string;
    sourceEventId?: string | null;
    eventType: string;
    occurredAt: Date;
    payload?: Record<string, unknown>;
    dedupKey: string;
    provenance?: Record<string, unknown>;
    outboxRef?: string | null;
  }
): Promise<{ inserted: boolean; event: FabricEvent }> {
  const inserted = await client.query(
    `INSERT INTO event_fabric_events
      (source, source_event_id, event_type, occurred_at, payload, dedup_key, provenance, outbox_ref)
     VALUES($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8)
     ON CONFLICT(dedup_key) DO NOTHING
     RETURNING event_seq, dedup_key, source, event_type, payload`,
    [
      input.source,
      input.sourceEventId ?? null,
      input.eventType,
      input.occurredAt,
      JSON.stringify(input.payload ?? {}),
      input.dedupKey,
      JSON.stringify(input.provenance ?? {}),
      input.outboxRef ?? null
    ]
  );

  if (inserted.rowCount === 1) return { inserted: true, event: inserted.rows[0] };

  const existing = await client.query(
    "SELECT event_seq, dedup_key, source, event_type, payload FROM event_fabric_events WHERE dedup_key=$1",
    [input.dedupKey]
  );
  return { inserted: false, event: existing.rows[0] };
}

export async function nextEventForConsumer(client: any, consumerId: string) {
  const res = await client.query(
    `SELECT e.*
       FROM event_fabric_events e
      WHERE NOT EXISTS (
        SELECT 1 FROM inbox_events i
         WHERE i.consumer_id=$1 AND i.dedup_key=e.dedup_key
      )
      ORDER BY e.event_seq
      LIMIT 1
      FOR UPDATE OF e SKIP LOCKED`,
    [consumerId]
  );
  if (res.rowCount === 0) return null;

  const event = res.rows[0];
  await client.query(
    `INSERT INTO inbox_events(consumer_id,event_seq,dedup_key,source_event_id,payload,status)
     VALUES($1,$2,$3,$4,$5::jsonb,'PENDING')
     ON CONFLICT(consumer_id,dedup_key) DO NOTHING`,
    [consumerId, event.event_seq, event.dedup_key, event.source_event_id ?? null, JSON.stringify(event.payload ?? {})]
  );
  return event;
}

export async function markConsumerEventProcessed(
  client: any,
  consumerId: string,
  dedupKey: string
): Promise<void> {
  await client.query(
    `UPDATE inbox_events
        SET status='PROCESSED', processed_at=now()
      WHERE consumer_id=$1 AND dedup_key=$2 AND status='PENDING'`,
    [consumerId, dedupKey]
  );
}
