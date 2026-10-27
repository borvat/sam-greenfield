import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { beginReplanAtomic } from "../../apps/kernel/src/replanning";
import { recordWorkFailure } from "../../apps/kernel/src/failures";
import { reconcileFinishedPlansAfterRestart } from "../../apps/kernel/src/recovery";
import { wakeGoalFromEventAtomic } from "../../apps/kernel/src/continuation";

async function one(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal(state: string) {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", [`P1RR-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id", [org.rows[0].id,`P1RRLE-${Date.now()}-${Math.random()}`]);
    const g = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,$4) RETURNING id",
      [`P1RR-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Phase1 replan recovery",state]
    );
    return { goalId:g.rows[0].id, legalEntityId:le.rows[0].id };
  });
}

async function main() {
  const multi = await createGoal("PLANNING");
  const plan = await persistPlanAndDelegateAtomic({
    goalId: multi.goalId,
    steps:[
      { capabilityId:"gmail_send", params:{step:1} },
      { capabilityId:"gmail_send", params:{step:2} }
    ]
  });

  const l1 = await leaseWorkAtomic(plan.queueIds[0],"worker-1",60);
  const e1 = await recordExecutionAndRequestVerificationAtomic({
    queueId:plan.queueIds[0],fencingToken:l1.token,actor:"worker-1",result:{ok:true},evidence:{step:1}
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[multi.goalId])).state,"EXECUTING");

  const l2 = await leaseWorkAtomic(plan.queueIds[1],"worker-2",60);
  const e2 = await recordExecutionAndRequestVerificationAtomic({
    queueId:plan.queueIds[1],fencingToken:l2.token,actor:"worker-2",result:{ok:true},evidence:{step:2}
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[multi.goalId])).state,"VERIFYING");

  const contract = await one("SELECT id FROM verification_contracts WHERE capability_id='gmail_send' LIMIT 1");
  await recordIndependentVerificationAtomic({
    executionId:e1.executionId,verifier:"verify-1",contractId:contract.id,
    independentEvidence:{provider_message_id:"fixture",readback:true,step:1},result:"VERIFIED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[multi.goalId])).state,"VERIFYING");

  await recordIndependentVerificationAtomic({
    executionId:e2.executionId,verifier:"verify-2",contractId:contract.id,
    independentEvidence:{provider_message_id:"fixture",readback:true,step:2},result:"VERIFIED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[multi.goalId])).state,"COMPLETED");

  const failed = await createGoal("PLANNING");
  const fp = await persistPlanAndDelegateAtomic({
    goalId:failed.goalId,steps:[{capabilityId:"gmail_send",params:{case:"fail"}}]
  });
  const fl = await leaseWorkAtomic(fp.queueIds[0],"worker-fail",60);
  const fe = await recordExecutionAndRequestVerificationAtomic({
    queueId:fp.queueIds[0],fencingToken:fl.token,actor:"worker-fail",result:{ok:false},evidence:{attempted:true}
  });
  await recordIndependentVerificationAtomic({
    executionId:fe.executionId,verifier:"verify-fail",contractId:contract.id,
    independentEvidence:{readback:false},result:"FAILED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[failed.goalId])).state,"REPLANNING");
  assert.equal(await beginReplanAtomic(failed.goalId,"verification failed"),"PLANNING");
  assert.equal(Number((await one("SELECT replan_attempts FROM goals WHERE id=$1",[failed.goalId])).replan_attempts),1);

  // A read-only Drive 404 can recover inside the SAME goal, with bounded replans.
  const readOnly=await createGoal("PLANNING");
  const roPlan=await persistPlanAndDelegateAtomic({
    goalId:readOnly.goalId,steps:[{capabilityId:"drive_get_metadata",params:{fileId:"synthetic-missing"}}]
  });
  const roLease=await leaseWorkAtomic(roPlan.queueIds[0],"worker-drive-404",60);
  await recordWorkFailure({queueId:roPlan.queueIds[0],fencingToken:roLease.token,actor:"worker-drive-404",error:new Error("Google Drive API HTTP 404: File not found")});
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[readOnly.goalId])).state,"REPLANNING");
  assert.equal((await one("SELECT status FROM work_queue WHERE id=$1",[roPlan.queueIds[0]])).status,"FAILED");
  assert.equal(await beginReplanAtomic(readOnly.goalId,"missing file"),"PLANNING");
  assert.equal(Number((await one("SELECT replan_attempts FROM goals WHERE id=$1",[readOnly.goalId])).replan_attempts),1);

  // A failure on a write capability must NOT retry or replan.
  const writeFailure=await createGoal("PLANNING");
  const writePlan=await persistPlanAndDelegateAtomic({
    goalId:writeFailure.goalId,steps:[{capabilityId:"gmail_send",params:{test:"no-automatic-retry"}}]
  });
  const writeLease=await leaseWorkAtomic(writePlan.queueIds[0],"worker-write-fail",60);
  await recordWorkFailure({queueId:writePlan.queueIds[0],fencingToken:writeLease.token,actor:"worker-write-fail",error:new Error("Google Drive API HTTP 404: File not found")});
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[writeFailure.goalId])).state,"FAILED");

  const crash = await createGoal("EXECUTING");
  const cp = await pool.query(
    "INSERT INTO plans(goal_id,version,steps,plan_hash) VALUES($1,1,'[]'::jsonb,'restart-plan') RETURNING id",
    [crash.goalId]
  );
  await pool.query("UPDATE goals SET current_plan_id=$2 WHERE id=$1",[crash.goalId,cp.rows[0].id]);
  await pool.query(
    "INSERT INTO work_queue(goal_id,plan_id,capability_id,status,fencing_token) VALUES($1,$2,'gmail_send','EXECUTED',2)",
    [crash.goalId,cp.rows[0].id]
  );
  const recovered = await reconcileFinishedPlansAfterRestart();
  assert.ok(recovered.includes(crash.goalId));
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[crash.goalId])).state,"VERIFYING");

  const waiting = await createGoal("WAITING_EXTERNAL");
  assert.equal(await wakeGoalFromEventAtomic(waiting.goalId,12345,"EXTERNAL_REPLY"),true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[waiting.goalId])).state,"MODELING");

  console.log("PHASE1_REPLAN_RECOVERY PASS");
  await pool.end();
}

main().catch(async (err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
