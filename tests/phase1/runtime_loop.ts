import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { runOneClaimedWork, claimNextWorkAtomic } from "../../apps/kernel/src/workerRuntime";
import { recoverKernelAfterRestart } from "../../apps/kernel/src/recovery";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { relayOutboxUntilEmpty } from "../../apps/kernel/src/outboxRelay";
import { ingestEvent } from "../../apps/event-fabric/src/index";
import { processNextKernelEventAtomic } from "../../apps/kernel/src/eventConsumer";

async function one(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal(state: string) {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", [`P1RT-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id", [org.rows[0].id,`P1RTLE-${Date.now()}-${Math.random()}`]);
    const goal = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,$4) RETURNING id",
      [`P1RT-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Phase1 runtime loop",state]
    );
    return { goalId:goal.rows[0].id, legalEntityId:le.rows[0].id };
  });
}

async function main() {
  const goal = await createGoal("PLANNING");
  const plan = await persistPlanAndDelegateAtomic({
    goalId: goal.goalId,
    steps: [{ capabilityId:"test_echo", params:{value:42} }]
  });

  const firstLease = await claimNextWorkAtomic("worker-crash",1);
  assert.ok(firstLease);
  assert.equal(firstLease?.queueId,plan.queueIds[0]);

  await pool.query(
    "UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",
    [plan.queueIds[0]]
  );

  const recovery = await recoverKernelAfterRestart();
  assert.ok(recovery.expiredLeases.includes(plan.queueIds[0]));
  assert.equal((await one("SELECT status FROM work_queue WHERE id=$1",[plan.queueIds[0]])).status,"HANDBACK");

  const run = await runOneClaimedWork("worker-restarted",60,{
    test_echo: async (work) => ({
      result:{echo:work.params.value},
      evidence:{runtime:"synthetic",observed:true}
    })
  });
  assert.equal(run.processed,true);
  assert.equal(run.queueId,plan.queueIds[0]);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"VERIFYING");

  const contract = await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES('test_echo','synthetic independent check','db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description
     RETURNING id`
  );
  await recordIndependentVerificationAtomic({
    executionId:run.executionId!,
    verifier:"runtime-independent-verifier",
    contractId:contract.rows[0].id,
    independentEvidence:{echo:42,db_readback:true},
    result:"VERIFIED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"COMPLETED");

  const relayed = await relayOutboxUntilEmpty();
  assert.ok(relayed > 0);
  const duplicateCheck = await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE dedup_key LIKE 'outbox:%'"
  );
  const before = Number(duplicateCheck.c);
  await relayOutboxUntilEmpty();
  const after = Number((await one(
    "SELECT COUNT(*)::int c FROM event_fabric_events WHERE dedup_key LIKE 'outbox:%'"
  )).c);
  assert.equal(after,before);

  const waiting = await createGoal("WAITING_EXTERNAL");
  const dedup = `runtime-wake:${waiting.goalId}:${Date.now()}`;
  await withTransaction((client)=>ingestEvent(client,{
    source:"runtime-test",
    eventType:"EXTERNAL_REPLY",
    occurredAt:new Date(),
    payload:{goal_id:waiting.goalId},
    dedupKey:dedup
  }));

  let wakeResult = null;
  for (let i=0;i<100;i++) {
    const next = await processNextKernelEventAtomic();
    if (!next.processed) break;
    if (next.goalId === waiting.goalId) {
      wakeResult = next;
      break;
    }
  }
  assert.ok(wakeResult);
  assert.equal(wakeResult?.wokeGoal,true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[waiting.goalId])).state,"MODELING");

  const inboxCount = Number((await one(
    "SELECT COUNT(*)::int c FROM inbox_events WHERE consumer_id='kernel_runtime' AND dedup_key=$1 AND status='PROCESSED'",
    [dedup]
  )).c);
  assert.equal(inboxCount,1);

  console.log("PHASE1_RUNTIME_LOOP PASS");
  await pool.end();
}

main().catch(async (err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
