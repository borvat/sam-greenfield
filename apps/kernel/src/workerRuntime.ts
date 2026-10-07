import { withTransaction } from "../../../packages/db/src/client";
import { acquireLease } from "../../../packages/db/src/fencing";
import { recordExecutionAndRequestVerificationAtomic } from "./execution";

export interface ClaimedWork {
  queueId: string;
  fencingToken: number;
  capabilityId: string;
  params: Record<string, unknown>;
  goalId: string | null;
  planId: string | null;
}

export type CapabilityExecutor = (
  work: ClaimedWork
) => Promise<{ result: Record<string, unknown>; evidence: Record<string, unknown> }>;

export async function claimNextWorkAtomic(
  owner: string,
  ttlSeconds: number
): Promise<ClaimedWork | null> {
  return withTransaction(async (client) => {
    const candidate = await client.query(
      `SELECT id
         FROM work_queue
        WHERE status IN ('QUEUED','HANDBACK')
          AND (due_at IS NULL OR due_at <= now())
        ORDER BY priority DESC,due_at ASC NULLS FIRST,queued_at ASC,id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1`
    );
    if (candidate.rowCount === 0) return null;

    const queueId = candidate.rows[0].id as string;
    const fencingToken = await acquireLease(client, queueId, owner, ttlSeconds);
    const row = await client.query(
      "SELECT id,goal_id,plan_id,capability_id,params FROM work_queue WHERE id=$1",
      [queueId]
    );

    return {
      queueId,
      fencingToken,
      capabilityId: row.rows[0].capability_id,
      params: row.rows[0].params ?? {},
      goalId: row.rows[0].goal_id ?? null,
      planId: row.rows[0].plan_id ?? null
    };
  });
}

export async function runOneClaimedWork(
  owner: string,
  ttlSeconds: number,
  executors: Record<string, CapabilityExecutor>
): Promise<{ processed: boolean; executionId?: string; queueId?: string }> {
  const work = await claimNextWorkAtomic(owner, ttlSeconds);
  if (!work) return { processed: false };

  const executor = executors[work.capabilityId];
  if (!executor) {
    throw new Error(`No executor registered for capability ${work.capabilityId}`);
  }

  const outcome = await executor(work);
  const execution = await recordExecutionAndRequestVerificationAtomic({
    queueId: work.queueId,
    fencingToken: work.fencingToken,
    actor: owner,
    result: outcome.result,
    evidence: outcome.evidence
  });

  return {
    processed: true,
    executionId: execution.executionId,
    queueId: work.queueId
  };
}
