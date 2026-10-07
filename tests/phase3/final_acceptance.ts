import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import type { ModelProviderAdapter } from "../../packages/model-gateway/src/types";
import { CapabilityCatalog } from "../../apps/agents/src/capabilityCatalog";
import { runCatalogPlanningCycle,runCatalogSpecialistTick } from "../../apps/agents/src/executiveFlow";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(authorityCeiling:"GREEN"|"YELLOW",objective:string){
  return withTransaction(async(client)=>{
    const org=await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P3FA-${Date.now()}-${Math.random()}`]
    );
    const le=await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P3FALE-${Date.now()}-${Math.random()}`]
    );
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'NEW',$4) RETURNING id",
      [`P3FA-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,objective,authorityCeiling]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function seedProvider(){
  await pool.query(
    `INSERT INTO model_providers
      (provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
     VALUES('qwen','["qwen-p3"]'::jsonb,'["planning"]'::jsonb,'["INTERNAL"]'::jsonb,'HEALTHY',0.001,0.001)
     ON CONFLICT(provider_id) DO UPDATE SET
       models=EXCLUDED.models,
       capabilities=EXCLUDED.capabilities,
       privacy_class_allowed=EXCLUDED.privacy_class_allowed,
       health='HEALTHY'`
  );
}

async function main(){
  await seedProvider();

  const catalog=new CapabilityCatalog([
    {
      capabilityId:"phase3_safe_action",
      authorityClass:"GREEN",
      specialistAgentId:"operations",
      specialistVersion:"3.0.0"
    },
    {
      capabilityId:"phase3_yellow_action",
      authorityClass:"YELLOW",
      specialistAgentId:"communications",
      specialistVersion:"3.0.0"
    }
  ]);

  const safeAdapter:ModelProviderAdapter={
    providerId:"qwen",
    async invoke(_task,model){
      return {
        model,
        usage:{inputTokens:100,outputTokens:100},
        output:{
          assumptions:{catalog_driven:true},
          constraints:{authority:"GREEN"},
          dependencies:{},
          steps:[
            {
              capabilityId:"phase3_safe_action",
              params:{value:77},
              priority:2147483647
            }
          ]
        }
      };
    }
  };

  const gateway=new ModelGateway({qwen:safeAdapter});
  const goal=await createGoal("GREEN","Run catalog-owned safe action");

  const plan=await runCatalogPlanningCycle({
    catalog,
    gateway,
    goalId:goal.goalId,
    dataClassification:"INTERNAL",
    maxCostUsd:1,
    preferredProviders:["qwen"]
  });

  assert.equal(plan.authority.authorized,true);
  assert.equal(plan.persisted.queueIds.length,1);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"EXECUTING");

  const tick=await runCatalogSpecialistTick({
    catalog,
    workerInstanceId:"phase3-final-worker",
    ttlSeconds:60,
    executors:{
      phase3_safe_action:async(work)=>({
        result:{value:work.params.value},
        evidence:{synthetic_readback:true}
      })
    }
  });

  assert.equal(tick.processed,true);
  assert.equal(tick.agentId,"operations");
  assert.ok(tick.executionId);

  const assignment=await one(
    "SELECT handoff,worker_version,status FROM work_queue WHERE id=$1",
    [tick.queueId]
  );
  assert.equal(assignment.handoff.agent_id,"operations");
  assert.equal(assignment.worker_version,"3.0.0");
  assert.equal(assignment.status,"EXECUTED");
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"VERIFYING");

  const contract=await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES('phase3_safe_action','Phase3 final verifier','db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description
     RETURNING id`
  );

  await recordIndependentVerificationAtomic({
    executionId:tick.executionId!,
    verifier:"phase3-final-independent-verifier",
    contractId:contract.rows[0].id,
    independentEvidence:{value:77,readback:true},
    result:"VERIFIED"
  });
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"COMPLETED");

  const yellowGoal=await createGoal("YELLOW","Attempt yellow action without approval");
  const yellowGateway=new ModelGateway({
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
              {capabilityId:"phase3_yellow_action",params:{message:"needs approval"},priority:100}
            ]
          }
        };
      }
    }
  });

  let blocked=false;
  try{
    await runCatalogPlanningCycle({
      catalog,
      gateway:yellowGateway,
      goalId:yellowGoal.goalId,
      dataClassification:"INTERNAL",
      maxCostUsd:1,
      preferredProviders:["qwen"]
    });
  }catch(err){
    blocked=err instanceof Error && err.message.includes("authority");
  }

  assert.equal(blocked,true);
  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[yellowGoal.goalId])).state,"WAITING_OWNER");
  assert.equal(Number((await one(
    "SELECT COUNT(*)::int c FROM work_queue WHERE goal_id=$1",
    [yellowGoal.goalId]
  )).c),0);

  console.log("PHASE3_FINAL_ACCEPTANCE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
