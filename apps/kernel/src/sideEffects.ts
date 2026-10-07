import { withTransaction } from "../../../packages/db/src/client";

export type SideEffectState = "PENDING" | "SENT" | "CONFIRMED" | "FAILED";

export async function beginSideEffectAtomic(input: {
  operationKey: string;
  capabilityId: string;
  requestHash: string;
  goalId?: string | null;
  legalEntityId?: string | null;
  idempotencyKey?: string | null;
}) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO side_effect_operations
        (operation_key, capability_id, goal_id, legal_entity_id, request_hash, idempotency_key)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(operation_key) DO NOTHING
       RETURNING *`,
      [
        input.operationKey,
        input.capabilityId,
        input.goalId ?? null,
        input.legalEntityId ?? null,
        input.requestHash,
        input.idempotencyKey ?? null
      ]
    );

    if (inserted.rowCount === 1) {
      return { created: true, operation: inserted.rows[0] };
    }

    const existing = await client.query(
      "SELECT * FROM side_effect_operations WHERE operation_key=$1 FOR UPDATE",
      [input.operationKey]
    );
    return { created: false, operation: existing.rows[0] };
  });
}

export async function markSideEffectSentAtomic(
  operationKey: string,
  providerReference: string
): Promise<void> {
  await withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE side_effect_operations
          SET state='SENT',
              provider_reference=$2,
              reconciliation_state='NEEDS_RECONCILIATION',
              attempt=attempt+1,
              updated_at=now()
        WHERE operation_key=$1
          AND state='PENDING'
        RETURNING id`,
      [operationKey, providerReference]
    );
    if (res.rowCount !== 1) {
      throw new Error("Side effect is not in PENDING state");
    }
  });
}

export async function confirmSideEffectAtomic(operationKey: string): Promise<void> {
  await withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE side_effect_operations
          SET state='CONFIRMED',
              reconciliation_state='RECONCILED',
              last_reconciled_at=now(),
              updated_at=now()
        WHERE operation_key=$1
          AND state IN ('SENT','CONFIRMED')
        RETURNING id`,
      [operationKey]
    );
    if (res.rowCount !== 1) {
      throw new Error("Side effect cannot be confirmed from current state");
    }
  });
}
