import { withTransaction } from "../../../packages/db/src/client";
import { acquireLease } from "../../../packages/db/src/fencing";
import { recordExecutionAndRequestVerificationAtomic } from "../../kernel/src/execution";
import type { CapabilityExecutor, ClaimedWork } from "../../kernel/src/workerRuntime";
import type { SpecialistAgentDefinition } from "./types";

export async function claimNextWorkForSpecialistAtomic(
  agent: SpecialistAgentDefinition,
  workerInstanceId: string,
  ttlSeconds: number
): Promise<ClaimedWork | null> {
  return withTransaction(async (client) => {
    const candidate = await client.query(
      `SELECT id
         FROM work_queue
        WHERE status IN ('QUEUED','HANDBACK')
          AND capability_id = ANY($1::text[])
          AND (due_at IS NULL OR due_at <= now())
        ORDER BY priority DESC,due_at ASC NULLS FIRST,queued_at ASC,id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1`,
      [agent.capabilities]
    );
    if (candidate.rowCount === 0) return null;

    const queueId = candidate.rows[0].id as string;
    const leaseOwner = `${agent.agentId}:${workerInstanceId}`;
    const fencingToken = await acquireLease(client,queueId,leaseOwner,ttlSeconds);

    const handoff = {
      agent_id: agent.agentId,
      agent_version: agent.version,
      worker_instance_id: workerInstanceId,
      claimed_at: new Date().toISOString()
    };

    const updated = await client.query(
      `UPDATE work_queue
          SET worker_version=$2,
              handoff=$3::jsonb
        WHERE id=$1
          AND fencing_token=$4
          AND lease_owner=$5
        RETURNING id,goal_id,plan_id,capability_id,params`,
      [
        queueId,
        agent.version,
        JSON.stringify(handoff),
        fencingToken,
        leaseOwner
      ]
    );
    if (updated.rowCount !== 1) throw new Error("Specialist handoff persistence failed");

    const row = updated.rows[0];
    return {
      queueId,
      fencingToken,
      capabilityId: row.capability_id,
      params: row.params ?? {},
      goalId: row.goal_id ?? null,
      planId: row.plan_id ?? null
    };
  });
}

export async function runOneSpecialistWork(input: {
  agent: SpecialistAgentDefinition;
  workerInstanceId: string;
  ttlSeconds: number;
  executors: Record<string, CapabilityExecutor>;
}): Promise<{ processed: boolean; queueId?: string; executionId?: string }> {
  const work = await claimNextWorkForSpecialistAtomic(
    input.agent,
    input.workerInstanceId,
    input.ttlSeconds
  );
  if (!work) return { processed:false };

  if (!input.agent.capabilities.includes(work.capabilityId)) {
    throw new Error(`Specialist ${input.agent.agentId} cannot execute ${work.capabilityId}`);
  }

  const executor = input.executors[work.capabilityId];
  if (!executor) {
    throw new Error(`No executor registered for capability ${work.capabilityId}`);
  }

  const outcome = await executor(work);
  const actor = `${input.agent.agentId}@${input.agent.version}`;
  const execution = await recordExecutionAndRequestVerificationAtomic({
    queueId:work.queueId,
    fencingToken:work.fencingToken,
    actor,
    result:outcome.result,
    evidence:{
      ...outcome.evidence,
      specialist_agent_id:input.agent.agentId,
      specialist_agent_version:input.agent.version
    }
  });

  return {
    processed:true,
    queueId:work.queueId,
    executionId:execution.executionId
  };
}
