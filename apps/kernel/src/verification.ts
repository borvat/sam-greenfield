import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";

export type VerificationResult = "VERIFIED" | "FAILED" | "INCONCLUSIVE" | "NOT_OBSERVABLE";

export async function recordIndependentVerificationAtomic(input: {
  executionId: string;
  verifier: string;
  contractId: string;
  independentEvidence: Record<string, unknown>;
  result: VerificationResult;
}): Promise<string> {
  return withTransaction(async (client) => {
    const execution = await client.query(
      "SELECT id, goal_id, plan_id, plan_hash, execution_hash, actor FROM executions WHERE id=$1 FOR UPDATE",
      [input.executionId]
    );
    if (execution.rowCount !== 1) throw new Error("Execution not found");

    const ex = execution.rows[0];
    if (ex.actor === input.verifier) {
      throw new Error("Verifier must be independent from execution actor");
    }

    const contract = await client.query(
      "SELECT id, must_not_trust_execution_result FROM verification_contracts WHERE id=$1",
      [input.contractId]
    );
    if (contract.rowCount !== 1) throw new Error("Verification contract not found");
    if (!contract.rows[0].must_not_trust_execution_result) {
      throw new Error("Verification contract must require independent evidence");
    }
    if (!input.independentEvidence || Object.keys(input.independentEvidence).length === 0) {
      throw new Error("Independent verification evidence is required");
    }

    if (ex.goal_id) {
      const goal = await client.query("SELECT state FROM goals WHERE id=$1 FOR UPDATE", [ex.goal_id]);
      if (goal.rowCount !== 1) throw new Error("Goal not found for execution");
      if (goal.rows[0].state !== "VERIFYING") {
        throw new Error(`Goal must be VERIFYING before verification, got ${goal.rows[0].state}`);
      }
    }

    const inserted = await client.query(
      `INSERT INTO verifications
        (execution_id, verifier, method, contract_id, independent_evidence, result, plan_hash, execution_hash)
       SELECT $1,$2,verification_method,$3,$4::jsonb,$5,$6,$7
         FROM verification_contracts
        WHERE id=$3
       RETURNING id`,
      [
        input.executionId,
        input.verifier,
        input.contractId,
        JSON.stringify(input.independentEvidence),
        input.result,
        ex.plan_hash,
        ex.execution_hash
      ]
    );
    const verificationId = inserted.rows[0].id as string;

    if (ex.goal_id) {
      if (input.result === "VERIFIED") {
        const coverage = await client.query(
          `SELECT
             COUNT(*)::int AS total,
             COUNT(*) FILTER (
               WHERE EXISTS (
                 SELECT 1
                   FROM executions e
                   JOIN verifications v ON v.execution_id=e.id
                  WHERE e.queue_id=w.id
                    AND v.result='VERIFIED'
               )
             )::int AS verified
             FROM work_queue w
            WHERE w.goal_id=$1
              AND w.plan_id=$2
              AND w.status='EXECUTED'`,
          [ex.goal_id, ex.plan_id]
        );
        const total = Number(coverage.rows[0].total);
        const verified = Number(coverage.rows[0].verified);
        if (total > 0 && total === verified) {
          await transitionGoal(client, ex.goal_id, "VERIFYING", "COMPLETED", "independent_verification_passed", {
            verification_id: verificationId,
            verified_executions: verified
          });
        }
      } else if (input.result === "FAILED") {
        await transitionGoal(client, ex.goal_id, "VERIFYING", "REPLANNING", "independent_verification_failed", {
          verification_id: verificationId
        });
      } else {
        await transitionGoal(client, ex.goal_id, "VERIFYING", "WAITING_EXTERNAL", "independent_verification_inconclusive", {
          verification_id: verificationId,
          result: input.result
        });
      }
    }

    await insertOutboxEvent(client, {
      aggregateType: "verification",
      aggregateId: verificationId,
      eventType: "EXECUTION_VERIFIED",
      payload: {
        execution_id: input.executionId,
        result: input.result,
        verifier: input.verifier
      }
    });

    return verificationId;
  });
}
