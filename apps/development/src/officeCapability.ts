import assert from "node:assert/strict";
import { withTransaction } from "../../../packages/db/src/client";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import { validateProductionBundle } from "../../production/src/bundle";
import { PROBE_CAPABILITY } from "./syntheticProbe";

// A real local database operation, not a fabricated execution response.
export function officeBundle(goalId: string, entityId: string) {
  return validateProductionBundle({
    capabilities: [{ capabilityId: PROBE_CAPABILITY, authorityClass: "GREEN", specialistAgentId: "development-office", specialistVersion: "1.0.0" }],
    toolDefinitions: [{ capabilityId: PROBE_CAPABILITY, authorityClass: "GREEN", sideEffect: false }],
    toolAdapters: [{
      capabilityId: PROBE_CAPABILITY,
      async execute(request) {
        assert.equal(Object.keys(request.params).join(","), "task");
        assert.ok(["A", "B", "C"].includes(String(request.params.task)));
        const queueId = /^tool:([0-9a-f-]{36}):/.exec(request.idempotencyKey)?.[1];
        assert.ok(queueId);
        return withTransaction(async client => {
          const work = await client.query(`SELECT w.params,w.priority FROM work_queue w JOIN goals g ON g.id=w.goal_id
            WHERE w.id=$1 AND g.id=$2 AND g.company_scope=$3 AND g.state='EXECUTING'`, [queueId, goalId, entityId]);
          assert.equal(work.rowCount, 1);
          assert.deepEqual(work.rows[0].params, request.params);
          const hash = sha256Hex(request.params);
          await client.query(`INSERT INTO development_office_results(goal_id,entity_id,task,priority,params_hash,idempotency_key)
            VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(idempotency_key) DO NOTHING`,
            [goalId, entityId, request.params.task, work.rows[0].priority, hash, request.idempotencyKey]);
          const saved = await client.query(`SELECT task,priority,params_hash FROM development_office_results
            WHERE idempotency_key=$1 AND goal_id=$2 AND entity_id=$3`, [request.idempotencyKey, goalId, entityId]);
          assert.equal(saved.rowCount, 1);
          assert.equal(saved.rows[0].task, request.params.task);
          assert.equal(saved.rows[0].priority, work.rows[0].priority);
          assert.equal(saved.rows[0].params_hash, hash);
          return { result: { recorded: true }, evidence: { localDatabaseWrite: true, paramsHash: hash } };
        });
      }
    }],
    verificationAdapters: [{
      capabilityId: PROBE_CAPABILITY,
      async verify(input) {
        // Deliberately ignore input.execution.evidence and the executor result.
        const readback = await withTransaction(client => client.query(`SELECT r.task,r.priority,r.params_hash,w.params,
          w.priority AS planned_priority FROM development_office_results r
          JOIN work_queue w ON r.goal_id=w.goal_id AND r.task=w.params->>'task'
          JOIN executions e ON e.queue_id=w.id
          WHERE e.id=$1 AND r.goal_id=$2 AND r.entity_id=$3`,
          [input.execution.id, goalId, entityId]));
        const row = readback.rows[0];
        // Independently specified expected outcome from fictional due dates.
        const expected: Record<string, number> = { B: 3, A: 2, C: 1 };
        const confirmed = readback.rowCount === 1 && row.priority === expected[row.task] &&
          row.priority === row.planned_priority && row.params_hash === sha256Hex(row.params);
        return { result: confirmed ? "VERIFIED" as const : "FAILED" as const,
          evidence: { confirmed, databaseReadback: true, independentExpectedRank: true },
          verifier: "development-office-independent-db-verifier" };
      }
    }]
  });
}
