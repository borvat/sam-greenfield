import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { beginReplanAtomic } from "../../apps/kernel/src/replanning";
import { relayNextOutboxToEventFabricAtomic } from "../../apps/kernel/src/outboxRelay";
import { runKernelTick } from "../../apps/kernel/src/runtimeSupervisor";

async function one(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal(state: string) {
  return withTransaction(async (client) => {
    const org = await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P1FA-${Date.now()}-${Math.random()}`]
    );
    const le = await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P1FALE-${Date.now()}-${Math.random()}`]
    );
    const goal = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,$4) RETURNING id",
      [`P1FA-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Phase1 final acceptance",state]
    );
    return { goalId: goal.rows[0].id, legalEntityId: le.rows[0].id };
  });
}

async function verifyReplanBudget() {
  const goal = await createGoal("REPLANNING");

  assert.equal(await beginReplanAtomic(goal.goalId,"first"),"PLANNING");
  await pool.query("UPDATE goals SET state='REPLANNING' WHERE id=$1",[goal.goalId]);

  assert.equal(await beginReplanAtomic(goal.goalId,"second"),"PLANNING");
  await pool.query("UPDATE goals SET state='REPLANNING' WHERE id=$1",[goal.goalId]);

  assert.equal(await beginReplanAtomic(goal.goalId,"third"),"FAILED");
  const row = await one("SELECT state,replan_attempts FROM goals WHERE id=$1",[goal.goalId]);
  assert.equal(row.state,"FAILED");
  assert.equal(Number(row.replan_attempts),2);
}

async function verifyOutboxAtomicRollback() {
  const before = Number((await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE source='outbox'"
  )).c);

  try {
    await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload)
         VALUES('goal',gen_random_uuid(),'ROLLBACK_PROBE','{}'::jsonb)
         RETURNING id`
      );
      const outboxId = inserted.rows[0].id;
      await client.query(
        `INSERT INTO event_fabric_events(source,event_type,occurred_at,dedup_key,payload,outbox_ref)
         VALUES('outbox','ROLLBACK_PROBE',now(),$1,'{}'::jsonb,$2)`,
        [`outbox:${outboxId}`,outboxId]
      );
      throw new Error("forced rollback");
    });
  } catch {}

  const after = Number((await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE source='outbox'"
  )).c);
  assert.equal(after,before);
}

async function verifyRelayIdempotency() {
  const out = await pool.query(
    `INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload)
     VALUES('goal',gen_random_uuid(),'RELAY_PROBE','{}'::jsonb)
     RETURNING id`
  );
  const id = out.rows[0].id;

  const first = await relayNextOutboxToEventFabricAtomic();
  assert.equal(first.relayed,true);

  const count1 = Number((await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE dedup_key=$1",
    [`outbox:${id}`]
  )).c);
  assert.equal(count1,1);

  const count2 = Number((await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE dedup_key=$1",
    [`outbox:${id}`]
  )).c);
  assert.equal(count2,1);
}

async function verifySupervisorEndToEnd() {
  const goal = await createGoal("PLANNING");
  const plan = await persistPlanAndDelegateAtomic({
    goalId: goal.goalId,
    steps:[{capabilityId:"final_echo",params:{value:7},priority:2147483647}]
  });

  const tick = await runKernelTick({
    owner:"final-worker",
    ttlSeconds:60,
    executors:{
      final_echo: async (work)=>({
        result:{echo:work.params.value},
        evidence:{observed:true,source:"final-acceptance"}
      })
    }
  });

  assert.equal(tick.processedWork,true);
  assert.ok(tick.executionId);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"VERIFYING");

  const contract = await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES('final_echo','final acceptance verification','db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description
     RETURNING id`
  );

  await recordIndependentVerificationAtomic({
    executionId:tick.executionId!,
    verifier:"final-independent-verifier",
    contractId:contract.rows[0].id,
    independentEvidence:{echo:7,readback:true},
    result:"VERIFIED"
  });

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"COMPLETED");

  const queued = await one("SELECT status FROM work_queue WHERE id=$1",[plan.queueIds[0]]);
  assert.equal(queued.status,"EXECUTED");
}

async function verifyFailedVerificationNeverCompletes() {
  const goal = await createGoal("PLANNING");
  const plan = await persistPlanAndDelegateAtomic({
    goalId:goal.goalId,
    steps:[{capabilityId:"gmail_send",params:{probe:true},priority:2147483647}]
  });
  const lease = await leaseWorkAtomic(plan.queueIds[0],"probe-worker",60);
  const exec = await recordExecutionAndRequestVerificationAtomic({
    queueId:plan.queueIds[0],
    fencingToken:lease.token,
    actor:"probe-worker",
    result:{ok:false},
    evidence:{attempted:true}
  });
  const contract = await one("SELECT id FROM verification_contracts WHERE capability_id='gmail_send' LIMIT 1");

  await recordIndependentVerificationAtomic({
    executionId:exec.executionId,
    verifier:"probe-verifier",
    contractId:contract.id,
    independentEvidence:{readback:false},
    result:"FAILED"
  });

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"REPLANNING");
}

async function main() {
  await verifyReplanBudget();
  await verifyOutboxAtomicRollback();
  await verifyRelayIdempotency();
  await verifySupervisorEndToEnd();
  await verifyFailedVerificationNeverCompletes();

  console.log("PHASE1_FINAL_ACCEPTANCE PASS");
  await pool.end();
}

main().catch(async (err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
