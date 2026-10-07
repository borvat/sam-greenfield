import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import type { ModelProviderAdapter } from "../../packages/model-gateway/src/types";
import { runBrainPlanningCycle } from "../../apps/brain/src/executiveBrain";

async function one(sql: string, params: any[] = []) {
  const r = await pool.query(sql, params);
  return r.rows[0];
}

async function createGoal(objective: string) {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P2BK-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P2LE-${Date.now()}-${Math.random()}`]);
    const g = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,$3,'NEW') RETURNING id",
      [`P2G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,objective]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function seedProvider(providerId: string, model: string) {
  await pool.query(
    `INSERT INTO model_providers
      (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
     VALUES($1,$2::jsonb,'["planning"]'::jsonb,'["PUBLIC","INTERNAL","CONFIDENTIAL"]'::jsonb,'HEALTHY',0.001,0.001)
     ON CONFLICT(provider_id) DO UPDATE SET
       models=EXCLUDED.models,
       capabilities=EXCLUDED.capabilities,
       privacy_class_allowed=EXCLUDED.privacy_class_allowed,
       health='HEALTHY'`,
    [providerId,JSON.stringify([model])]
  );
}

async function main() {
  await seedProvider("openai","gpt-test");
  await seedProvider("qwen","qwen-test");

  const adapters: Record<string,ModelProviderAdapter> = {
    openai:{
      providerId:"openai",
      async invoke(){
        throw new Error("synthetic primary failure");
      }
    },
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        return {
          model,
          usage:{inputTokens:120,outputTokens:80},
          output:{
            assumptions:{world_model:"verified_only"},
            constraints:{authority:"GREEN"},
            dependencies:{},
            steps:[
              {capabilityId:"test_echo",params:{value:1},priority:100},
              {capabilityId:"test_echo",params:{value:2},priority:90}
            ]
          }
        };
      }
    }
  };

  const goal = await createGoal("Build a two-step verified plan");
  const gateway = new ModelGateway(adapters);

  const cycle = await runBrainPlanningCycle({
    gateway,
    goalId:goal.goalId,
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["openai","qwen"]
  });

  assert.equal(cycle.persisted.queueIds.length,2);
  const state = await one("SELECT state,current_plan_id FROM goals WHERE id=$1",[goal.goalId]);
  assert.equal(state.state,"EXECUTING");
  assert.equal(state.current_plan_id,cycle.persisted.planId);

  const plan = await one("SELECT plan_hash,steps FROM plans WHERE id=$1",[cycle.persisted.planId]);
  assert.ok(typeof plan.plan_hash === "string" && plan.plan_hash.length > 20);
  assert.equal(plan.steps.length,2);

  const work = await pool.query(
    "SELECT capability_id,status FROM work_queue WHERE goal_id=$1 AND plan_id=$2 ORDER BY priority DESC",
    [goal.goalId,cycle.persisted.planId]
  );
  assert.equal(work.rowCount,2);
  assert.ok(work.rows.every((r:any)=>r.status==="QUEUED"));

  const calls = await pool.query(
    "SELECT provider,success FROM model_calls WHERE task='executive_planning' ORDER BY created_at,id"
  );
  assert.ok(calls.rows.some((r:any)=>r.provider==="openai" && r.success===false));
  assert.ok(calls.rows.some((r:any)=>r.provider==="qwen" && r.success===true));

  const invalidGoal = await createGoal("Reject invalid planner output");
  const invalidGateway = new ModelGateway({
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        return {model,usage:{inputTokens:10,outputTokens:10},output:{steps:[]}};
      }
    }
  });

  let invalidRejected = false;
  try {
    await runBrainPlanningCycle({
      gateway:invalidGateway,
      goalId:invalidGoal.goalId,
      dataClassification:"INTERNAL",
      maxCostUsd:1,
      preferredProviders:["qwen"]
    });
  } catch {
    invalidRejected = true;
  }
  assert.equal(invalidRejected,true);

  const invalidState = await one("SELECT state FROM goals WHERE id=$1",[invalidGoal.goalId]);
  assert.equal(invalidState.state,"PLANNING");
  const invalidWork = Number((await one("SELECT COUNT(*)::int c FROM work_queue WHERE goal_id=$1",[invalidGoal.goalId])).c);
  assert.equal(invalidWork,0);

  console.log("PHASE2_BRAIN_KERNEL_HANDOFF PASS");
  await pool.end();
}

main().catch(async (err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
