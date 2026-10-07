
export async function publishOutbox(client: any) {
  // Relay: publish PENDING outbox_events to Event Fabric / Queue
  const res = await client.query(`SELECT * FROM outbox_events WHERE status='PENDING' ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED`);
  for (const row of res.rows) {
    // In real implementation, publish to queue/event fabric
    await client.query(`UPDATE outbox_events SET status='PUBLISHED', published_at=now() WHERE id=$1`, [row.id]);
  }
  return res.rows.length;
}
