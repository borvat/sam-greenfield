import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { observeAndEnterPlanning, persistPlanAndStartExecution } from "../../apps/kernel/src/orchestrator";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { beginSideEffectAtomic, markSideEffectSentAtomic, confirmSideEffectAtomic } from "../../apps/kernel/src/sideEffects";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";

async function one(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal() {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", [`P1VS-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id", [org.rows[0].id, `P1LE-${Date.now()}-${Math.random()}`]);
    const goal = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,'NEW') RETURNING id",
      [`P1VS-${Date.now()}-${Math.floor(Math.random()*1e9)}`, le.rows[0].id, "Phase 1 vertical slice"]
    );
    return { goalId: goal.rows[0].id, legalEntityId: le.rows[0].id };
  });
}

async function main() {
  const created = await createGoal();

  const context = await observeAndEnterPlanning(created.goalId);
  assert.equal(context.entityId, created.legalEntityId);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[created.goalId])).state, "PLANNING");

  const operationKey = `P1VS:${created.goalId}:gmail_send:v1`;
  const plan = await persistPlanAndStartExecution({
    goalId: created.goalId,
    assumptions: { source: "vertical-slice-test" },
    constraints: { authority: "GREEN" },
    dependencies: {},
    steps: [{
      capabilityId: "gmail_send",
      params: { target: "synthetic-test-target" },
      operationKeyRef: operationKey,
      idempotencyKey: operationKey
    }]
  });

  assert.equal(plan.queueIds.length, 1);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[created.goalId])).state, "EXECUTING");
  assert.equal((await one("SELECT current_plan_id FROM goals WHERE id=$1",[created.goalId])).current_plan_id, plan.planId);

  const sideA = await beginSideEffectAtomic({
    operationKey,
    capabilityId: "gmail_send",
    requestHash: "phase1-vs-hash",
    goalId: created.goalId,
    legalEntityId: created.legalEntityId,
    idempotencyKey: operationKey
  });
  const sideB = await beginSideEffectAtomic({
    operationKey,
    capabilityId: "gmail_send",
    requestHash: "phase1-vs-hash",
    goalId: created.goalId,
    legalEntityId: created.legalEntityId,
    idempotencyKey: operationKey
  });
  assert.equal(sideA.created, true);
  assert.equal(sideB.created, false);
  assert.equal(sideA.operation.id, sideB.operation.id);

  const lease = await leaseWorkAtomic(plan.queueIds[0], "worker-phase1", 60);
  await markSideEffectSentAtomic(operationKey, "provider-ref-phase1");
  await confirmSideEffectAtomic(operationKey);

  const execution = await recordExecutionAndRequestVerificationAtomic({
    queueId: plan.queueIds[0],
    fencingToken: lease.token,
    actor: "worker-phase1",
    result: { provider_reference: "provider-ref-phase1" },
    evidence: { submitted: true },
    operationKeyRef: operationKey
  });

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[created.goalId])).state, "VERIFYING");
  assert.equal(Number((await one("SELECT count(*)::int c FROM verifications WHERE execution_id=$1",[execution.executionId])).c), 0);

  const contract = await one("SELECT id FROM verification_contracts WHERE capability_id='gmail_send' LIMIT 1");

  let sameActorRejected = false;
  try {
    await recordIndependentVerificationAtomic({
      executionId: execution.executionId,
      verifier: "worker-phase1",
      contractId: contract.id,
      independentEvidence: { provider_reference: "provider-ref-phase1" },
      result: "VERIFIED"
    });
  } catch {
    sameActorRejected = true;
  }
  assert.equal(sameActorRejected, true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[created.goalId])).state, "VERIFYING");

  await recordIndependentVerificationAtomic({
    executionId: execution.executionId,
    verifier: "independent-verifier-phase1",
    contractId: contract.id,
    independentEvidence: { provider_reference: "provider-ref-phase1", readback: true },
    result: "VERIFIED"
  });

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[created.goalId])).state, "COMPLETED");
  assert.equal(Number((await one("SELECT count(*)::int c FROM verifications WHERE execution_id=$1 AND result='VERIFIED'",[execution.executionId])).c), 1);

  console.log("PHASE1_FULL_VERTICAL_SLICE PASS");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
