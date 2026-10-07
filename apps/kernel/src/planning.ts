import { withTransaction } from "../../../packages/db/src/client";
import { enqueueWork } from "./queue";
import { transitionGoal } from "./stateMachine";
import { sha256Hex } from "../../../packages/shared/src/stableJson";

export interface PlanStepInput {
  capabilityId: string;
  params?: Record<string, unknown>;
  priority?: number;
  dueAt?: Date | null;
  idempotencyKey?: string | null;
  operationKeyRef?: string | null;
}

export interface PersistPlanInput {
  goalId: string;
  assumptions?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  steps: PlanStepInput[];
}

export async function persistPlanAndDelegateAtomic(input: PersistPlanInput): Promise<{
  planId: string;
  planHash: string;
  queueIds: string[];
}> {
  if (input.steps.length === 0) throw new Error("Plan requires at least one step");

  return withTransaction(async (client) => {
    const goal = await client.query(
      "SELECT id, state FROM goals WHERE id=$1 FOR UPDATE",
      [input.goalId]
    );
    if (goal.rowCount !== 1) throw new Error("Goal not found");
    if (goal.rows[0].state !== "PLANNING") {
      throw new Error(`Goal must be PLANNING before plan persistence, got ${goal.rows[0].state}`);
    }

    const versionRes = await client.query(
      "SELECT COALESCE(MAX(version),0)+1 AS version FROM plans WHERE goal_id=$1",
      [input.goalId]
    );
    const version = Number(versionRes.rows[0].version);

    const planPayload = {
      goal_id: input.goalId,
      version,
      assumptions: input.assumptions ?? {},
      constraints: input.constraints ?? {},
      dependencies: input.dependencies ?? {},
      steps: input.steps.map((step, index) => ({
        index,
        capability_id: step.capabilityId,
        params: step.params ?? {},
        priority: step.priority ?? 0,
        due_at: step.dueAt?.toISOString() ?? null,
        idempotency_key: step.idempotencyKey ?? null,
        operation_key_ref: step.operationKeyRef ?? null
      }))
    };
    const planHash = sha256Hex(planPayload);

    const inserted = await client.query(
      `INSERT INTO plans(goal_id,version,goal_assumptions,constraints,dependencies,steps,plan_hash)
       VALUES($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7)
       RETURNING id`,
      [
        input.goalId,
        version,
        JSON.stringify(input.assumptions ?? {}),
        JSON.stringify(input.constraints ?? {}),
        JSON.stringify(input.dependencies ?? {}),
        JSON.stringify(planPayload.steps),
        planHash
      ]
    );
    const planId = inserted.rows[0].id as string;

    await client.query(
      "UPDATE goals SET current_plan_id=$2, updated_at=now() WHERE id=$1",
      [input.goalId, planId]
    );

    const queueIds: string[] = [];
    for (const step of input.steps) {
      const queueId = await enqueueWork(client, {
        goalId: input.goalId,
        planId,
        capabilityId: step.capabilityId,
        params: step.params ?? {},
        priority: step.priority,
        dueAt: step.dueAt,
        idempotencyKey: step.idempotencyKey,
        operationKeyRef: null
      });
      queueIds.push(queueId);
    }

    await transitionGoal(
      client,
      input.goalId,
      "PLANNING",
      "EXECUTING",
      "plan_persisted_and_delegated",
      { plan_id: planId, plan_hash: planHash, queue_ids: queueIds }
    );

    return { planId, planHash, queueIds };
  });
}
