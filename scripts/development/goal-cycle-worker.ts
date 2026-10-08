import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { officeBundle } from "../../apps/development/src/officeCapability";
import { createProductionComposition } from "../../apps/production/src/composition";
import { relayOutboxUntilEmpty } from "../../apps/kernel/src/outboxRelay";
import { sha256Hex } from "../../packages/shared/src/stableJson";
import { PROBE_CAPABILITY } from "../../apps/development/src/syntheticProbe";

async function main() {
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE, "1");
  assert.equal(process.env.DEEPSEEK_API_KEY, undefined);
  const role = (await pool.query("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user")).rows[0];
  assert.equal(role.rolsuper, false); assert.equal(role.rolbypassrls, false);
  const goalId = process.env.SAM_CYCLE_GOAL_ID!;
  const bundle = officeBundle(goalId, process.env.SAM_DEV_LEGAL_ENTITY_ID!);
  const worker = createProductionComposition({ bundle, workerId: "local-office-cycle-worker" });
  for (let tick = 0; tick < 10; tick++) {
    const outcome = await worker.runWorkTick() as any; // Original lease/fencing, execution and verification paths.
    if (outcome.execution.processed) {
      await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result,evidence_id)
        VALUES('development-office@1.0.0',$1,'LOCAL_CAPABILITY_EXECUTED','original_runtime_tick','EXECUTED',$2)`,
        [goalId, outcome.execution.executionId]);
    }
    if (outcome.verification.processed) {
      await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result,evidence_id)
        SELECT verifier,$1,'INDEPENDENT_VERIFICATION_RECORDED','original_runtime_tick',result,id
        FROM verifications WHERE id=$2`, [goalId, outcome.verification.verificationId]);
    }
    if (tick === 0 && process.env.SAM_CYCLE_UNIT_TEST === "1") {
      const work = (await pool.query("SELECT id,params FROM work_queue WHERE status='EXECUTED' LIMIT 1")).rows[0];
      const adapter = bundle.tools.adapter(PROBE_CAPABILITY);
      await adapter.execute({ capabilityId: PROBE_CAPABILITY, params: work.params,
        idempotencyKey: `tool:${work.id}:${PROBE_CAPABILITY}:${sha256Hex(work.params)}` });
      assert.equal((await pool.query("SELECT count(*)::int AS n FROM development_office_results")).rows[0].n, 1);
      await assert.rejects(adapter.execute({ capabilityId: PROBE_CAPABILITY, params: { task: "B", email: "forbidden" }, idempotencyKey: "forbidden" }));
      assert.throws(() => bundle.tools.adapter("gmail.send"));
    }
    if ((await pool.query("SELECT state FROM goals WHERE id=$1", [goalId])).rows[0].state === "COMPLETED") break;
  }
  assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1", [goalId])).rows[0].state, "COMPLETED");
  if (process.env.SAM_CYCLE_UNIT_TEST === "1") {
    const execution = (await pool.query("SELECT id FROM executions WHERE params->>'task'='B'")).rows[0];
    await pool.query("UPDATE development_office_results SET priority=2 WHERE task='B'");
    const outcome = await bundle.verifiers.get(PROBE_CAPABILITY)!.verify({
      execution: { id: execution.id, capabilityId: PROBE_CAPABILITY, params: { task: "B" }, evidence: { confirmed: true }, operationKeyRef: null },
      contract: { id: "unit", method: "db_query", requiredEvidenceFields: {}, independentQueryTemplate: {} }
    });
    assert.equal(outcome.result, "FAILED"); // Real changed artifact; self-reported success cannot override it.
    await pool.query("UPDATE development_office_results SET priority=3 WHERE task='B'");
  }
  const before = (await pool.query("SELECT count(*)::int AS n FROM executions")).rows[0].n;
  const extra = await worker.runWorkTick() as any;
  assert.equal(extra.execution.processed, false);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM executions")).rows[0].n, before);
  await relayOutboxUntilEmpty();
}
main().catch(() => { process.exitCode = 1; }).finally(async () => { await pool.end(); });
