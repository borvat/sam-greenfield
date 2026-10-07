import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";

export async function reconcileExpiredLeases(limit = 100): Promise<string[]> {
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT id, fencing_token
         FROM work_queue
        WHERE status IN ('LEASED','EXECUTING')
          AND lease_expiry IS NOT NULL
          AND lease_expiry < now()
        ORDER BY lease_expiry, id
        FOR UPDATE SKIP LOCKED
        LIMIT $1`,
      [limit]
    );

    const recovered: string[] = [];
    for (const row of res.rows) {
      await client.query(
        `UPDATE work_queue
            SET status='HANDBACK',
                lease_owner=NULL,
                lease_timestamp=NULL,
                lease_expiry=NULL,
                wake_reason='LEASE_EXPIRED'
          WHERE id=$1 AND fencing_token=$2`,
        [row.id, row.fencing_token]
      );
      await insertOutboxEvent(client, {
        aggregateType: "work_queue",
        aggregateId: row.id,
        eventType: "WORK_LEASE_EXPIRED",
        payload: { fencing_token: row.fencing_token }
      });
      recovered.push(row.id);
    }
    return recovered;
  });
}

export async function listSideEffectsNeedingReconciliation(limit = 100) {
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT *
         FROM side_effect_operations
        WHERE reconciliation_state='NEEDS_RECONCILIATION'
        ORDER BY updated_at, id
        FOR UPDATE SKIP LOCKED
        LIMIT $1`,
      [limit]
    );
    return res.rows;
  });
}
