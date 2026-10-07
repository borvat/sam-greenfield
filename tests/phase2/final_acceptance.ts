import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import type { ModelProviderAdapter } from "../../packages/model-gateway/src/types";
import { runBrainPlanningCycle } from "../../apps/brain/src/executiveBrain";
import { runOneClaimedWork } from "../../apps/kernel/src/workerRuntime";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(authorityCeiling:"GREEN"|"YELLOW"|"RED", objective:string){
  return withTransaction(async(client)=>{
    const org=await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P2FA-${Date.now()}-${Math.random()}`]
    );
    const le=await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P2FALE-${Date.now()}-${Math.random()}`]
    );
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'NEW',$4) RETURNING id",
      [`P2FA-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,objective,authorityCeiling]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function seedProvider(providerId:string, model:string, privacy:string[]){
  await pool.query(
    `INSERT INTO model_providers
      (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
     VALUES($1,$2::jsonb,'["planning"]'::jsonb,$3::jsonb,'HEALTHY',0.001,0.001)
     ON CONFLICT(provider_id) DO UPDATE SET
       models=EXCLUDED.models,
       capabilities=EXCLUDED.capabilities,
       privacy_class_allowed=EXCLUDED.privacy_class_allowed,
       health='HEALTHY',
       cost_per_1k_input=EXCLUDED.cost_per_1k_input,
       cost_per_1k_output=EXCLUDED.cost_per_1k_output`,
    [providerId,JSON.stringify([model]),JSON.stringify(privacy)]
  );
}

async function main(){
  await pool.query("DELETE FROM model_calls");
  await pool.query("DELETE FROM model_providers");
  await seedProvider("openai","gpt-phase2",["PUBLIC","INTERNAL","CONFIDENTIAL"]);
  await seedProvider("qwen","qwen-phase2",["PUBLIC","INTERNAL"]);

  let primaryCalls=0;
  let fallbackCalls=0;

  const adapters:Record<string,ModelProviderAdapter>={
    openai:{
      providerId:"openai",
      async invoke(){
        primaryCalls += 1;
        throw new Error("synthetic primary outage");
      }
    },
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        fallbackCalls += 1;
        return {
          model,
          modelVersion:"phase2-test-v1",
          usage:{inputTokens:120,outputTokens:80},
          output:{
            assumptions:{verified_context_only:true},
            constraints:{authority:"GREEN"},
            dependencies:{},
            steps:[
              {capabilityId:"phase2_echo",params:{value:42},priority:999999}
            ]
          }
        };
      }
    }
  };

  const gateway=new ModelGateway(adapters);
  const goal=await createGoal("GREEN","Complete a safe synthetic task");

  const planned=await runBrainPlanningCycle({
    gateway,
    goalId:goal.goalId,
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["openai","qwen"],
    capabilityPolicies:{phase2_echo:"GREEN"}
  });

  assert.equal(primaryCalls,1);
  assert.equal(fallbackCalls,1);
  assert.equal(planned.persisted.queueIds.length,1);
  assert.equal(planned.authority.authorized,true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"EXECUTING");

  const callAudit=await pool.query(
    "SELECT provider,success FROM model_calls WHERE task='executive_planning' ORDER BY created_at,id"
  );
  assert.equal(callAudit.rowCount,2);
  assert.equal(callAudit.rows[0].provider,"openai");
  assert.equal(callAudit.rows[0].success,false);
  assert.equal(callAudit.rows[1].provider,"qwen");
  assert.equal(callAudit.rows[1].success,true);

  const execution=await runOneClaimedWork("phase2-worker",60,{
    phase2_echo:async(work)=>({
      result:{echo:work.params.value},
      evidence:{readback_candidate:true}
    })
  });

  assert.equal(execution.processed,true);
  assert.ok(execution.executionId);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"VERIFYING");

  const contract=await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES('phase2_echo','Phase 2 final independent verification','db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description
     RETURNING id`
  );

  await recordIndependentVerificationAtomic({
    executionId:execution.executionId!,
    verifier:"phase2-independent-verifier",
    contractId:contract.rows[0].id,
    independentEvidence:{echo:42,db_readback:true},
    result:"VERIFIED"
  });

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"COMPLETED");

  const blockedGoal=await createGoal("YELLOW","Attempt a yellow capability without approval");
  const blockedGateway=new ModelGateway({
    qwen:{
      providerId:"qwen",
      async invoke(_task,model){
        return {
          model,
          usage:{inputTokens:50,outputTokens:50},
          output:{
            assumptions:{},
            constraints:{},
            dependencies:{},
            steps:[
              {capabilityId:"supplier_email",params:{supplier_id:"synthetic",subject:"RFQ"},priority:100}
            ]
          }
        };
      }
    }
  });

  let blocked=false;
  try{
    await runBrainPlanningCycle({
      gateway:blockedGateway,
      goalId:blockedGoal.goalId,
      dataClassification:"INTERNAL",
      maxCostUsd:1,
      preferredProviders:["qwen"],
      capabilityPolicies:{supplier_email:"YELLOW"}
    });
  }catch(err){
    blocked = err instanceof Error && err.message.includes("authority");
  }

  assert.equal(blocked,true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[blockedGoal.goalId])).state,"WAITING_OWNER");
  assert.equal(Number((await one(
    "SELECT COUNT(*)::int c FROM work_queue WHERE goal_id=$1",
    [blockedGoal.goalId]
  )).c),0);

  console.log("PHASE2_FINAL_ACCEPTANCE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
