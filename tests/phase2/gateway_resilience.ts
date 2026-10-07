import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { loadProviderRegistry } from "../../packages/model-gateway/src/registry";
import { applyRecentFailureCircuitBreaker } from "../../packages/model-gateway/src/health";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import type { ModelProviderAdapter } from "../../packages/model-gateway/src/types";

async function reset(){
  await pool.query("DELETE FROM model_calls");
  await pool.query("DELETE FROM model_providers");
}

async function seed(providerId:string, costIn:number, costOut:number){
  await pool.query(
    `INSERT INTO model_providers
      (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
     VALUES($1,$2::jsonb,'["planning"]'::jsonb,'["PUBLIC","INTERNAL"]'::jsonb,'HEALTHY',$3,$4)`,
    [providerId,JSON.stringify([`${providerId}-test`]),costIn,costOut]
  );
}

async function main(){
  await reset();
  await seed("openai",0.003,0.003);
  await seed("qwen",0.003,0.003);

  for(let i=0;i<3;i++){
    await pool.query(
      `INSERT INTO model_calls
        (task,provider,model,reason_selected,tokens,cost,latency_ms,retry_count,success,verification_result,data_classification)
       VALUES('planning','openai','openai-test','synthetic',0,0,1,$1,false,'synthetic failure','INTERNAL')`,
      [i]
    );
  }

  const base = await loadProviderRegistry(pool);
  const effective = await applyRecentFailureCircuitBreaker(pool,base);
  const openai = effective.find((p)=>p.providerId==="openai");
  assert.equal(openai?.health,"DOWN");

  await pool.query("DELETE FROM model_calls");

  let openaiCalls=0;
  let qwenCalls=0;
  const adapters:Record<string,ModelProviderAdapter>={
    openai:{
      providerId:"openai",
      async invoke(){
        openaiCalls += 1;
        throw new Error("synthetic failure");
      }
    },
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        qwenCalls += 1;
        return {
          model,
          usage:{inputTokens:100,outputTokens:100},
          output:{ok:true}
        };
      }
    }
  };

  const gateway=new ModelGateway(adapters);
  let budgetRejected=false;
  try{
    await gateway.invoke({
      task:"planning",
      capability:"planning",
      dataClassification:"INTERNAL",
      input:{},
      maxCostUsd:0.01,
      preferredProviders:["openai","qwen"]
    });
  }catch(err){
    budgetRejected = err instanceof Error && err.message.includes("budget");
  }

  assert.equal(openaiCalls,1);
  assert.equal(qwenCalls,0);
  assert.equal(budgetRejected,true);

  const failedCalls=Number((await pool.query(
    "SELECT COUNT(*)::int c FROM model_calls WHERE provider='openai' AND success=false"
  )).rows[0].c);
  assert.equal(failedCalls,1);

  console.log("PHASE2_GATEWAY_RESILIENCE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
