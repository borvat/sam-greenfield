import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { transitionGoalAtomic } from "../../apps/kernel/src/stateMachine";
import { enqueueWork, leaseWorkAtomic, commitWorkAtomic } from "../../apps/kernel/src/queue";
import { scheduleContinuationAtomic, wakeDueGoals } from "../../apps/kernel/src/continuation";
import { reconcileExpiredLeases } from "../../apps/kernel/src/reconciliation";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { loadVerifiedWorldModel } from "../../apps/brain/src/worldModel";
import { beginSideEffectAtomic, markSideEffectSentAtomic, confirmSideEffectAtomic } from "../../apps/kernel/src/sideEffects";

async function scalar(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal(state = "NEW") {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", [`P1-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id", [org.rows[0].id, `LE-${Date.now()}-${Math.random()}`]);
    const bid = `P1G-${Date.now()}-${Math.floor(Math.random()*1e9)}`;
    const g = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,$4) RETURNING id",
      [bid, le.rows[0].id, "Phase1 smoke goal", state]
    );
    return { goalId: g.rows[0].id, entityId: le.rows[0].id };
  });
}

async function main() {
  const g1 = await createGoal("NEW");
  await transitionGoalAtomic(g1.goalId, "NEW", "MODELING", "smoke");
  assert.equal((await scalar("SELECT state FROM goals WHERE id=$1",[g1.goalId])).state, "MODELING");
  assert.equal(Number((await scalar("SELECT count(*)::int c FROM outbox_events WHERE aggregate_id=$1 AND event_type='GOAL_STATE_CHANGED'",[g1.goalId])).c), 1);

  const rollbackGoal = await createGoal("NEW");
  try {
    await withTransaction(async (client) => {
      const { transitionGoal } = await import("../../apps/kernel/src/stateMachine");
      await transitionGoal(client, rollbackGoal.goalId, "NEW", "MODELING", "rollback");
      throw new Error("force rollback");
    });
  } catch {}
  assert.equal((await scalar("SELECT state FROM goals WHERE id=$1",[rollbackGoal.goalId])).state, "NEW");
  assert.equal(Number((await scalar("SELECT count(*)::int c FROM outbox_events WHERE aggregate_id=$1",[rollbackGoal.goalId])).c), 0);

  const workId = await withTransaction((client) => enqueueWork(client,{goalId:g1.goalId,capabilityId:"test_capability"}));
  const leaseA = await leaseWorkAtomic(workId,"worker-a",60);
  await pool.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[workId]);
  const leaseB = await leaseWorkAtomic(workId,"worker-b",60);
  assert.equal(leaseB.token, leaseA.token + 1);
  assert.equal(await commitWorkAtomic(workId,leaseA.token), false);
  assert.equal(await commitWorkAtomic(workId,leaseB.token), true);

  const recoverId = await withTransaction((client) => enqueueWork(client,{goalId:g1.goalId,capabilityId:"recover_capability"}));
  await leaseWorkAtomic(recoverId,"worker-crash",1);
  await pool.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[recoverId]);
  const recovered = await reconcileExpiredLeases();
  assert.ok(recovered.includes(recoverId));
  assert.equal((await scalar("SELECT status FROM work_queue WHERE id=$1",[recoverId])).status, "HANDBACK");

  const continuationGoal = await createGoal("EXECUTING");
  await scheduleContinuationAtomic(continuationGoal.goalId,"EXECUTING","WAITING_EXTERNAL",new Date(Date.now()-1000),"external wait");
  const woke = await wakeDueGoals();
  assert.ok(woke.includes(continuationGoal.goalId));
  assert.equal((await scalar("SELECT state FROM goals WHERE id=$1",[continuationGoal.goalId])).state, "MODELING");

  const opKey = `P1:effect:${Date.now()}:${Math.random()}`;
  const effectA = await beginSideEffectAtomic({
    operationKey: opKey,
    capabilityId: "gmail_send",
    requestHash: "hash-smoke"
  });
  const effectB = await beginSideEffectAtomic({
    operationKey: opKey,
    capabilityId: "gmail_send",
    requestHash: "hash-smoke"
  });
  assert.equal(effectA.created, true);
  assert.equal(effectB.created, false);
  assert.equal(effectA.operation.id, effectB.operation.id);
  await markSideEffectSentAtomic(opKey, "provider-ref-smoke");
  await confirmSideEffectAtomic(opKey);
  assert.equal((await scalar("SELECT state FROM side_effect_operations WHERE operation_key=$1",[opKey])).state, "CONFIRMED");

  const verifyGoal = await createGoal("VERIFYING");
  const contract = await scalar("SELECT id FROM verification_contracts WHERE capability_id='gmail_send' LIMIT 1");
  const plan = await pool.query(
    "INSERT INTO plans(goal_id,version,steps,plan_hash) VALUES($1,1,'[]'::jsonb,'plan-h') RETURNING id",
    [verifyGoal.goalId]
  );
  await pool.query("UPDATE goals SET current_plan_id=$2 WHERE id=$1",[verifyGoal.goalId,plan.rows[0].id]);
  const work = await pool.query(
    "INSERT INTO work_queue(goal_id,plan_id,capability_id,status,fencing_token) VALUES($1,$2,'gmail_send','EXECUTED',1) RETURNING id",
    [verifyGoal.goalId,plan.rows[0].id]
  );
  const exec = await pool.query(
    "INSERT INTO executions(queue_id,goal_id,plan_id,plan_hash,execution_hash,capability_id,params,result,evidence,fencing_token,actor,status) VALUES($1,$2,$3,'plan-h','exec-h','gmail_send','{}','{}','{}',1,'worker','DONE') RETURNING id",
    [work.rows[0].id,verifyGoal.goalId,plan.rows[0].id]
  );
  await recordIndependentVerificationAtomic({
    executionId: exec.rows[0].id,
    verifier: "independent-smoke-verifier",
    contractId: contract.id,
    independentEvidence: { provider_message_id: "msg-smoke" },
    result: "VERIFIED"
  });
  assert.equal((await scalar("SELECT state FROM goals WHERE id=$1",[verifyGoal.goalId])).state, "COMPLETED");

  const inferred = await pool.query(
    "INSERT INTO world_facts(entity_type,entity_id,domain,attribute,value,status,source,source_timestamp,confidence) VALUES('legal_entity',$1,'test','health',$2::jsonb,'INFERRED','smoke',now()+interval '1 hour',1.0) RETURNING id",
    [g1.entityId, JSON.stringify({v:"inferred-newer"})]
  );
  void inferred;
  await pool.query(
    "INSERT INTO world_facts(entity_type,entity_id,domain,attribute,value,status,source,source_timestamp,confidence) VALUES('legal_entity',$1,'test','health',$2::jsonb,'VERIFIED','smoke',now()-interval '1 minute',0.8)",
    [g1.entityId, JSON.stringify({v:"verified-old"})]
  );
  await pool.query(
    "INSERT INTO world_facts(entity_type,entity_id,domain,attribute,value,status,source,source_timestamp,confidence) VALUES('legal_entity',$1,'test','health',$2::jsonb,'VERIFIED','smoke',now(),0.9)",
    [g1.entityId, JSON.stringify({v:"verified-new"})]
  );
  const facts = await withTransaction((client)=>loadVerifiedWorldModel(client,"legal_entity",g1.entityId));
  const health = facts.find((f:any)=>f.attribute==="health");
  assert.ok(health && typeof health.value==="object" && health.value!==null && "v" in health.value);
  assert.equal(health.value.v, "verified-new");

  console.log("PHASE1_KERNEL_SMOKE PASS");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
