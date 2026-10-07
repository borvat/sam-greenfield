import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";
import { sha256Hex } from "../../../packages/shared/src/stableJson";

export async function recordExecutionAndRequestVerificationAtomic(input: {
  queueId: string;
  fencingToken: number;
  actor: string;
  result: Record<string, unknown>;
  evidence: Record<string, unknown>;
  operationKeyRef?: string | null;
}): Promise<{ executionId: string; executionHash: string }> {
  return withTransaction(async (client) => {
    const work = await client.query(
      `SELECT w.*, p.plan_hash
         FROM work_queue w
         LEFT JOIN plans p ON p.id=w.plan_id
        WHERE w.id=$1
        FOR UPDATE OF w`,
      [input.queueId]
    );
    if (work.rowCount !== 1) throw new Error("Work item not found");

    const row = work.rows[0];
    if (Number(row.fencing_token) !== Number(input.fencingToken)) {
      throw new Error("Stale fencing token");
    }
    if (!["LEASED", "EXECUTING"].includes(row.status)) {
      throw new Error(`Work item must be LEASED/EXECUTING, got ${row.status}`);
    }
    if (!row.goal_id || !row.plan_id || !row.plan_hash) {
      throw new Error("Execution requires goal_id, plan_id and persisted plan_hash");
    }

    await client.query(
      "UPDATE work_queue SET status='EXECUTING' WHERE id=$1 AND fencing_token=$2",
      [input.queueId, input.fencingToken]
    );

    const executionHash = sha256Hex({
      queue_id: input.queueId,
      goal_id: row.goal_id,
      plan_id: row.plan_id,
      plan_hash: row.plan_hash,
      capability_id: row.capability_id,
      params: row.params ?? {},
      result: input.result,
      evidence: input.evidence,
      fencing_token: Number(input.fencingToken),
      operation_key_ref: input.operationKeyRef ?? row.operation_key_ref ?? null
    });

    const inserted = await client.query(
      `INSERT INTO executions
        (queue_id,goal_id,plan_id,plan_hash,execution_hash,capability_id,params,result,evidence,fencing_token,operation_key_ref,actor,finished_at,status)
       VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12,now(),'EXECUTED')
       RETURNING id`,
      [
        input.queueId,
        row.goal_id,
        row.plan_id,
        row.plan_hash,
        executionHash,
        row.capability_id,
        JSON.stringify(row.params ?? {}),
        JSON.stringify(input.result),
        JSON.stringify(input.evidence),
        Number(input.fencingToken),
        input.operationKeyRef ?? row.operation_key_ref ?? null,
        input.actor
      ]
    );
    const executionId = inserted.rows[0].id as string;

    const committed = await client.query(
      `UPDATE work_queue
          SET status='EXECUTED'
        WHERE id=$1 AND fencing_token=$2 AND status='EXECUTING'
        RETURNING id`,
      [input.queueId, Number(input.fencingToken)]
    );
    if (committed.rowCount !== 1) throw new Error("Fencing commit rejected");

    await insertOutboxEvent(client, {
      aggregateType: "execution",
      aggregateId: executionId,
      eventType: "EXECUTION_RECORDED",
      payload: {
        goal_id: row.goal_id,
        plan_id: row.plan_id,
        queue_id: input.queueId,
        execution_hash: executionHash
      }
    });

    const remaining = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM work_queue
        WHERE goal_id=$1
          AND plan_id=$2
          AND status <> 'EXECUTED'`,
      [row.goal_id, row.plan_id]
    );

    if (Number(remaining.rows[0].count) === 0) {
      await transitionGoal(
        client,
        row.goal_id,
        "EXECUTING",
        "VERIFYING",
        "all_plan_work_executed",
        { plan_id: row.plan_id }
      );
    }

    return { executionId, executionHash };
  });
}
