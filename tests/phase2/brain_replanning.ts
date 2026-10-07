import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import type { ModelProviderAdapter } from "../../packages/model-gateway/src/types";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { runBrainReplanCycle } from "../../apps/brain/src/replanner";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P2RP-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P2RPLE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,'PLANNING') RETURNING id",
      [`P2RP-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Recover from failed execution with a revised plan"]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function main(){
  await pool.query(
    `INSERT INTO model_providers
      (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
     VALUES('qwen','["qwen-test"]'::jsonb,'["planning"]'::jsonb,'["INTERNAL"]'::jsonb,'HEALTHY',0.001,0.001)
     ON CONFLICT(provider_id) DO UPDATE SET
       models=EXCLUDED.models,
       capabilities=EXCLUDED.capabilities,
       privacy_class_allowed=EXCLUDED.privacy_class_allowed,
       health='HEALTHY'`
  );

  const goal=await createGoal();
  const first=await persistPlanAndDelegateAtomic({
    goalId:goal.goalId,
    steps:[{capabilityId:"gmail_send",params:{attempt:1},priority:100}]
  });

  const lease=await leaseWorkAtomic(first.queueIds[0],"worker-original",60);
  const execution=await recordExecutionAndRequestVerificationAtomic({
    queueId:first.queueIds[0],
    fencingToken:lease.token,
    actor:"worker-original",
    result:{ok:false},
    evidence:{attempted:true}
  });

  const contract=await one("SELECT id FROM verification_contracts WHERE capability_id='gmail_send' LIMIT 1");
  await recordIndependentVerificationAtomic({
    executionId:execution.executionId,
    verifier:"independent-replan-verifier",
    contractId:contract.id,
    independentEvidence:{confirmed_failure:true},
    result:"FAILED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"REPLANNING");

  const adapter:ModelProviderAdapter={
    providerId:"qwen",
    async invoke(_task,model){
      return {
        model,
        usage:{inputTokens:100,outputTokens:80},
        output:{
          assumptions:{previous_attempt_failed:true},
          constraints:{authority:"GREEN"},
          dependencies:{},
          steps:[
            {capabilityId:"test_echo",params:{revised:true},priority:200}
          ]
        }
      };
    }
  };

  const gateway=new ModelGateway({qwen:adapter});
  const replanned=await runBrainReplanCycle({
    gateway,
    goalId:goal.goalId,
    reason:"independent verification failed",
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["qwen"]
  });

  assert.equal(replanned.failed,false);
  const state=await one("SELECT state,replan_attempts,current_plan_id FROM goals WHERE id=$1",[goal.goalId]);
  assert.equal(state.state,"EXECUTING");
  assert.equal(Number(state.replan_attempts),1);
  assert.notEqual(state.current_plan_id,first.planId);

  const versions=await pool.query("SELECT version,id FROM plans WHERE goal_id=$1 ORDER BY version",[goal.goalId]);
  assert.equal(versions.rowCount,2);
  assert.equal(Number(versions.rows[0].version),1);
  assert.equal(Number(versions.rows[1].version),2);

  const oldExecuted=Number((await one(
    "SELECT COUNT(*)::int c FROM work_queue WHERE goal_id=$1 AND plan_id=$2 AND status='EXECUTED'",
    [goal.goalId,first.planId]
  )).c);
  assert.equal(oldExecuted,1);

  const newQueued=Number((await one(
    "SELECT COUNT(*)::int c FROM work_queue WHERE goal_id=$1 AND plan_id=$2 AND status='QUEUED'",
    [goal.goalId,state.current_plan_id]
  )).c);
  assert.equal(newQueued,1);

  await pool.query("UPDATE goals SET state='REPLANNING',replan_attempts=2 WHERE id=$1",[goal.goalId]);
  const exhausted=await runBrainReplanCycle({
    gateway,
    goalId:goal.goalId,
    reason:"budget exhaustion probe",
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["qwen"]
  });
  assert.equal(exhausted.failed,true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"FAILED");

  console.log("PHASE2_BRAIN_REPLANNING PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
