import { withTransaction } from "../../../packages/db/src/client";
import { acquireLease, commitWithFencing } from "../../../packages/db/src/fencing";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";

export interface EnqueueWorkInput {
  goalId?: string | null;
  planId?: string | null;
  stepId?: string | null;
  capabilityId: string;
  params?: Record<string, unknown>;
  priority?: number;
  dueAt?: Date | null;
  idempotencyKey?: string | null;
  operationKeyRef?: string | null;
}

export async function enqueueWork(client: any, input: EnqueueWorkInput): Promise<string> {
  const res = await client.query(
    `INSERT INTO work_queue
      (goal_id, plan_id, step_id, capability_id, params, priority, due_at, idempotency_key, operation_key_ref)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)
     RETURNING id`,
    [
      input.goalId ?? null,
      input.planId ?? null,
      input.stepId ?? null,
      input.capabilityId,
      JSON.stringify(input.params ?? {}),
      input.priority ?? 0,
      input.dueAt ?? null,
      input.idempotencyKey ?? null,
      input.operationKeyRef ?? null
    ]
  );
  const id = res.rows[0].id as string;
  await insertOutboxEvent(client, {
    aggregateType: "work_queue",
    aggregateId: id,
    eventType: "WORK_QUEUED",
    payload: { goal_id: input.goalId ?? null, capability_id: input.capabilityId }
  });
  return id;
}

export async function leaseWorkAtomic(queueId: string, owner: string, ttlSeconds: number) {
  return withTransaction(async (client) => {
    const token = await acquireLease(client, queueId, owner, ttlSeconds);
    const row = await client.query("SELECT * FROM work_queue WHERE id=$1", [queueId]);
    return { token, work: row.rows[0] };
  });
}

export async function commitWorkAtomic(queueId: string, fencingToken: number): Promise<boolean> {
  return withTransaction(async (client) => {
    const ok = await commitWithFencing(client, queueId, fencingToken);
    if (!ok) return false;
    await insertOutboxEvent(client, {
      aggregateType: "work_queue",
      aggregateId: queueId,
      eventType: "WORK_EXECUTED",
      payload: { fencing_token: fencingToken }
    });
    return true;
  });
}
