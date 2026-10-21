import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import type { ModelProviderAdapter,ProviderConfig } from "../../packages/model-gateway/src/types";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { createKernelProductionDispatcher } from "../../apps/production/src/dispatcher";
import { createProductionComposition } from "../../apps/production/src/composition";
import { syncProductionModelRegistry } from "../../apps/production/src/modelRegistry";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";

async function main(){
  const suffix=Date.now().toString();
  const org=await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P22-${suffix}`]);
  const entity=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P22-QNAN-${suffix}`]);
  const entityId=entity.rows[0].id as string;
  const salesId=`p22_sales_${suffix}`;
  const stockId=`p22_stock_${suffix}`;
  const modelId=`p22_planner_${suffix}`;

  for(const capabilityId of [salesId,stockId]){
    await pool.query(
      `INSERT INTO verification_contracts
       (capability_id,description,verification_method,required_evidence_fields,independent_query_template)
       VALUES($1,'Phase 22 read-only planner acceptance','db_query','{"source":"string"}'::jsonb,'{"independent":true}'::jsonb)`,
      [capabilityId]
    );
  }

  const modelConfig:ProviderConfig={
    providerId:modelId,models:["planner-test"],capabilities:["planning"],
    privacyClasses:["INTERNAL"],health:"HEALTHY",costPer1kInput:0.001,costPer1kOutput:0.001
  };
  await syncProductionModelRegistry([modelConfig]);

  const modelAdapter:ModelProviderAdapter={
    providerId:modelId,
    async invoke(_task,model){
      const review:any=_task.input;
      if(review?.proposedReport)return {model,usage:{inputTokens:80,outputTokens:50},output:{accepted:true,missing:[]}};
      if(review?.verifiedObservations){
        const sources=review.verifiedObservations;
        return {model,usage:{inputTokens:80,outputTokens:100},output:{status:"complete",summary:"Sales and inventory reads combined",requirements:[{requirement:"Read and combine both sources",fulfilled:true,evidenceIds:sources.map((s:any)=>s.id)}],findings:sources.map((s:any)=>({text:"Verified read completed",executionId:s.id,quoteLine:0})),limitations:["Synthetic data only"],steps:[]}};
      }
      return {
        model,
        usage:{inputTokens:80,outputTokens:50},
        output:{
          assumptions:{source:"SAM planner"},
          constraints:{read_only:true},
          dependencies:{},
          steps:[
            {capabilityId:salesId,params:{period:"last_30_days"},priority:100},
            {capabilityId:stockId,params:{scope:"all_offers"},priority:90}
          ]
        }
      };
    }
  };

  const bundle=validateProductionBundle({
    capabilities:[salesId,stockId].map(capabilityId=>({
      capabilityId,authorityClass:"GREEN" as const,specialistAgentId:"marketplace",specialistVersion:"22.0.0"
    })),
    toolDefinitions:[salesId,stockId].map(capabilityId=>({
      capabilityId,authorityClass:"GREEN" as const,sideEffect:false,inputSchema:{type:"object"}
    })),
    toolAdapters:[salesId,stockId].map(capabilityId=>({
      capabilityId,
      async execute(request){
        return {result:{read:true,capabilityId},evidence:{source:"synthetic_read_only_test",params:request.params}};
      }
    })),
    verificationAdapters:[salesId,stockId].map(capabilityId=>({
      capabilityId,
      async verify(){
        return {result:"VERIFIED" as const,evidence:{source:"independent_test_readback",capabilityId},verifier:"phase22-independent-verifier"};
      }
    })),
    modelAdapters:[modelAdapter],modelProviderConfigs:[modelConfig],dataClassification:"INTERNAL",planningMaxCostUsd:0.25
  });

  const dispatcher=createKernelProductionDispatcher(bundle);
  const surface=createChatGPTToolSurface({dispatcher});
  assert.equal(surface.definition("sam_submit_goal").availability,"AVAILABLE");
  const submitted=await surface.invoke("sam_submit_goal",{
    objective:"Read QNAN sales and inventory, combine the findings, verify them, and report. Read-only only.",
    legal_entity_id:entityId
  },{actor:"phase22-owner",systemOwner:true});
  assert.equal(submitted.ok,true);
  const result=submitted.data as any;
  assert.equal(result.status,"SUBMITTED");
  const goalId=result.goalId as string;
  assert.ok(goalId);

  const before=await pool.query("SELECT state FROM goals WHERE id=$1",[goalId]);
  assert.equal(before.rows[0].state,"NEW");
  assert.equal(Number((await pool.query("SELECT COUNT(*)::int n FROM plans WHERE goal_id=$1",[goalId])).rows[0].n),0);

  const composition=createProductionComposition({bundle,workerId:"phase22-worker"});
  let state="NEW";
  for(let i=0;i<8&&state!=="COMPLETED";i++){
    await composition.runWorkTick();
    const row=await pool.query("SELECT state FROM goals WHERE id=$1",[goalId]);
    state=row.rows[0].state as string;
  }
  assert.equal(state,"COMPLETED");

  const plan=await pool.query("SELECT steps FROM plans WHERE goal_id=$1 ORDER BY version DESC LIMIT 1",[goalId]);
  assert.equal(plan.rows[0].steps.length,2);
  const executions=await pool.query("SELECT capability_id,status FROM executions WHERE goal_id=$1 ORDER BY started_at",[goalId]);
  assert.equal(executions.rowCount,2);
  assert.ok(executions.rows.every((row:any)=>row.status==="EXECUTED"));
  const verifications=await pool.query("SELECT result FROM verifications WHERE execution_id IN (SELECT id FROM executions WHERE goal_id=$1)",[goalId]);
  assert.equal(verifications.rowCount,2);
  assert.ok(verifications.rows.every((row:any)=>row.result==="VERIFIED"));

  console.log(`PHASE22_SUBMIT_GOAL_PLANNER PASS goal=${goalId} plan_steps=2 executions=2 verified=2`);
  await pool.end();
}

main().catch(async(error)=>{
  console.error(error);
  await pool.end();
  process.exit(1);
});
