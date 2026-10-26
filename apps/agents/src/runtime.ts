import {leaseAttemptLimit,stopExhaustedLease} from '../../kernel/src/leaseBudget';
import {prepareWorkParameters} from '../../kernel/src/dependencies';
import { withTransaction } from "../../../packages/db/src/client";
import { acquireLease } from "../../../packages/db/src/fencing";
import { recordExecutionAndRequestVerificationAtomic } from "../../kernel/src/execution";
import type { CapabilityExecutor, ClaimedWork } from "../../kernel/src/workerRuntime";
import type { SpecialistAgentDefinition } from "./types";

export async function claimNextWorkForSpecialistAtomic(
  agent: SpecialistAgentDefinition,
  workerInstanceId: string,
  ttlSeconds: number,
  rootGoalId?:string
): Promise<ClaimedWork | null> {
  return withTransaction(async (client) => {
    const candidate = await client.query(
      `SELECT id,goal_id,attempt,fencing_token
         FROM work_queue
        WHERE status IN ('QUEUED','HANDBACK')
          AND capability_id = ANY($1::text[])
          AND ($2::uuid IS NULL OR goal_id IN (WITH RECURSIVE scope(id,depth) AS (
            SELECT id,0 FROM goals WHERE id=$2 UNION ALL SELECT g.id,s.depth+1 FROM goals g JOIN scope s ON g.parent_goal_id=s.id WHERE s.depth<4
          ) SELECT id FROM scope))
          AND (due_at IS NULL OR due_at <= now())
          AND (plan_id IS NULL OR work_dependencies_ready(id))
        ORDER BY priority DESC,due_at ASC NULLS FIRST,queued_at ASC,id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1`,
      [agent.capabilities,rootGoalId??null]
    );
    if (candidate.rowCount === 0) return null;

    const limit=leaseAttemptLimit();
    if(limit!==null&&candidate.rows[0].attempt>=limit){await stopExhaustedLease(client,candidate.rows[0]);return null;}
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
              handoff=COALESCE(handoff,'{}'::jsonb)||$3::jsonb
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
    const params=await prepareWorkParameters(client,queueId,row.params??{});
    if(!params)return null;
    return {
      queueId,
      fencingToken,
      capabilityId: row.capability_id,
      params,
      goalId: row.goal_id ?? null,
      planId: row.plan_id ?? null
    };
  });
}

export async function runOneSpecialistWork(input: {
  agent: SpecialistAgentDefinition;
  workerInstanceId: string;
  ttlSeconds: number;
  rootGoalId?:string;
  executors: Record<string, CapabilityExecutor>;
  advancers?:Record<string,CapabilityExecutor|((work:ClaimedWork)=>Promise<Awaited<ReturnType<CapabilityExecutor>>|null>)>;
}): Promise<{ processed: boolean; queueId?: string; executionId?: string; deferred?:boolean }> {
  const work = await claimNextWorkForSpecialistAtomic(
    input.agent,
    input.workerInstanceId,
    input.ttlSeconds,input.rootGoalId
  );
  if (!work) return { processed:false };

  if (!input.agent.capabilities.includes(work.capabilityId)) {
    throw new Error(`Specialist ${input.agent.agentId} cannot execute ${work.capabilityId}`);
  }

  const executor = input.executors[work.capabilityId];
  if (!executor) {
    throw new Error(`No executor registered for capability ${work.capabilityId}`);
  }

  const outcome=await (input.advancers?.[work.capabilityId]??executor)(work);
  if(!outcome){
    // A normal cooperative yield is not a failed lease attempt. A crash still
    // consumes the attempt and is recovered by the existing kernel recovery.
    await withTransaction(async c=>{
      const released=await c.query(`UPDATE work_queue SET status='HANDBACK',lease_owner=NULL,lease_expiry=NULL,
        due_at=now()+interval '100 milliseconds',attempt=greatest(attempt-1,0) WHERE id=$1 AND fencing_token=$2
        AND status IN ('LEASED','EXECUTING') AND lease_expiry>now() RETURNING id`,[work.queueId,work.fencingToken]);
      if(released.rowCount!==1)throw Error('SPECIALIST_YIELD_FENCE_REJECTED');
    });
    return {processed:true,queueId:work.queueId,deferred:true};
  }
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
