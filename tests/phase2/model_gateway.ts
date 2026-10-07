import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { routeModel } from "../../packages/model-gateway/src/router";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { proposePlan, validateCandidatePlan } from "../../apps/brain/src/planner";
import type { ModelProviderAdapter, ProviderConfig } from "../../packages/model-gateway/src/types";

async function seedProviders() {
  await pool.query("DELETE FROM model_calls");
  await pool.query("DELETE FROM model_providers");
  const rows = [
    ["openai",["gpt-test"],["planning"],["PUBLIC","INTERNAL","CONFIDENTIAL"],"HEALTHY",0.01,0.02],
    ["anthropic",["claude-test"],["planning"],["PUBLIC","INTERNAL"],"HEALTHY",0.02,0.03],
    ["google",["gemini-test"],["planning"],["PUBLIC"],"DEGRADED",0.001,0.002],
    ["deepseek",["deepseek-test"],["planning"],["PUBLIC","INTERNAL"],"DOWN",0.0005,0.001],
    ["qwen",["qwen-test"],["planning"],["PUBLIC","INTERNAL"],"HEALTHY",0.003,0.004]
  ];
  for (const r of rows) {
    await pool.query(
      `INSERT INTO model_providers
       (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
       VALUES($1,$2::jsonb,$3::jsonb,$4::jsonb,$5,$6,$7)`,
      [r[0],JSON.stringify(r[1]),JSON.stringify(r[2]),JSON.stringify(r[3]),r[4],r[5],r[6]]
    );
  }
}

async function main() {
  await seedProviders();

  const providers: ProviderConfig[] = (await pool.query(
    "SELECT provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output FROM model_providers ORDER BY provider_id"
  )).rows.map((row:any)=>({
    providerId:row.provider_id,
    models:row.models,
    capabilities:row.capabilities,
    privacyClasses:row.privacy_class_allowed,
    health:row.health,
    costPer1kInput:Number(row.cost_per_1k_input),
    costPer1kOutput:Number(row.cost_per_1k_output)
  }));

  const confidential = routeModel({
    task:"plan",capability:"planning",dataClassification:"CONFIDENTIAL",input:{},maxCostUsd:1,
    preferredProviders:["anthropic","openai"]
  },providers);
  assert.equal(confidential.length,1);
  assert.equal(confidential[0].providerId,"openai");

  const cheap = routeModel({
    task:"plan",capability:"planning",dataClassification:"PUBLIC",input:{},maxCostUsd:0.01
  },providers);
  assert.ok(cheap.every((c)=>c.providerId!=="openai" && c.providerId!=="anthropic" && c.providerId!=="deepseek"));

  let openaiAttempts = 0;
  const adapters: Record<string,ModelProviderAdapter> = {
    openai:{
      providerId:"openai",
      async invoke(_task,model){
        openaiAttempts += 1;
        throw new Error("synthetic openai outage");
      }
    },
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        return {
          model,
          modelVersion:"test-v1",
          usage:{inputTokens:100,outputTokens:100},
          output:{
            assumptions:{source:"gateway-test"},
            constraints:{authority:"GREEN"},
            dependencies:{},
            steps:[{capabilityId:"test_echo",params:{value:9},priority:1}]
          }
        };
      }
    }
  };

  const gateway = new ModelGateway(adapters);
  const proposed = await proposePlan({
    gateway,
    goalId:"00000000-0000-0000-0000-000000000001",
    objective:"test objective",
    context:{facts:[]},
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["openai","qwen"]
  });

  assert.equal(openaiAttempts,1);
  assert.equal(proposed.steps.length,1);
  assert.equal(proposed.steps[0].capabilityId,"test_echo");

  const calls = await pool.query("SELECT provider,success,retry_count FROM model_calls ORDER BY created_at,id");
  assert.equal(calls.rowCount,2);
  assert.equal(calls.rows[0].provider,"openai");
  assert.equal(calls.rows[0].success,false);
  assert.equal(calls.rows[1].provider,"qwen");
  assert.equal(calls.rows[1].success,true);

  let invalidRejected = false;
  try { validateCandidatePlan({steps:[]}); } catch { invalidRejected = true; }
  assert.equal(invalidRejected,true);

  const restricted = routeModel({
    task:"plan",capability:"planning",dataClassification:"RESTRICTED",input:{},maxCostUsd:1
  },providers);
  assert.equal(restricted.length,0);

  console.log("PHASE2_MODEL_GATEWAY PASS");
  await pool.end();
}

main().catch(async (err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
