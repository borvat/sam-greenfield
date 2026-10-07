import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { SpecialistRegistry } from "../../apps/agents/src/registry";
import { runOneSpecialistWork } from "../../apps/agents/src/runtime";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(){
  return withTransaction(async(client)=>{
    const org=await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P3-${Date.now()}-${Math.random()}`]
    );
    const le=await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P3LE-${Date.now()}-${Math.random()}`]
    );
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING','GREEN') RETURNING id",
      [`P3G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Specialist delegation proof"]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function main(){
  let ambiguityRejected=false;
  try{
    new SpecialistRegistry([
      {agentId:"a",version:"1",capabilities:["shared"]},
      {agentId:"b",version:"1",capabilities:["shared"]}
    ]);
  }catch{
    ambiguityRejected=true;
  }
  assert.equal(ambiguityRejected,true);

  const registry=new SpecialistRegistry([
    {agentId:"communications",version:"1.0.0",capabilities:["phase3_email"]},
    {agentId:"commerce",version:"2.0.0",capabilities:["phase3_catalog"]}
  ]);

  assert.equal(registry.ownerOf("phase3_email").agentId,"communications");
  assert.equal(registry.ownerOf("phase3_catalog").agentId,"commerce");

  let unknownRejected=false;
  try{ registry.ownerOf("phase3_unknown"); }catch{ unknownRejected=true; }
  assert.equal(unknownRejected,true);

  const goal=await createGoal();
  const plan=await persistPlanAndDelegateAtomic({
    goalId:goal.goalId,
    steps:[
      {capabilityId:"phase3_email",params:{message:"hello"},priority:200},
      {capabilityId:"phase3_catalog",params:{sku:"sku-1"},priority:100}
    ]
  });

  const communications=registry.getAgent("communications");
  const commerce=registry.getAgent("commerce");

  const commRun=await runOneSpecialistWork({
    agent:communications,
    workerInstanceId:"comm-worker-1",
    ttlSeconds:60,
    executors:{
      phase3_email:async(work)=>({
        result:{sent:true},
        evidence:{synthetic_provider_id:"email-1",capability:work.capabilityId}
      })
    }
  });
  assert.equal(commRun.processed,true);

  const commQueue=await one(
    "SELECT capability_id,worker_version,handoff,status FROM work_queue WHERE id=$1",
    [commRun.queueId]
  );
  assert.equal(commQueue.capability_id,"phase3_email");
  assert.equal(commQueue.worker_version,"1.0.0");
  assert.equal(commQueue.handoff.agent_id,"communications");
  assert.equal(commQueue.status,"EXECUTED");

  const commerceRun=await runOneSpecialistWork({
    agent:commerce,
    workerInstanceId:"commerce-worker-1",
    ttlSeconds:60,
    executors:{
      phase3_catalog:async(work)=>({
        result:{updated:true},
        evidence:{synthetic_readback:"sku-1",capability:work.capabilityId}
      })
    }
  });
  assert.equal(commerceRun.processed,true);

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"VERIFYING");

  const actors=await pool.query(
    "SELECT capability_id,actor FROM executions WHERE goal_id=$1 ORDER BY capability_id",
    [goal.goalId]
  );
  assert.equal(actors.rowCount,2);
  assert.ok(actors.rows.some((r:any)=>r.actor==="communications@1.0.0"));
  assert.ok(actors.rows.some((r:any)=>r.actor==="commerce@2.0.0"));

  for(const capability of ["phase3_email","phase3_catalog"]){
    await pool.query(
      `INSERT INTO verification_contracts
        (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
       VALUES($1,$2,'db_query','{}'::jsonb,'{}'::jsonb,true)
       ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description`,
      [capability,`Verify ${capability}`]
    );
  }

  const executions=await pool.query(
    "SELECT id,capability_id,actor FROM executions WHERE goal_id=$1 ORDER BY capability_id",
    [goal.goalId]
  );

  for(const execution of executions.rows){
    const contract=await one(
      "SELECT id FROM verification_contracts WHERE capability_id=$1",
      [execution.capability_id]
    );
    await recordIndependentVerificationAtomic({
      executionId:execution.id,
      verifier:`independent-${execution.capability_id}`,
      contractId:contract.id,
      independentEvidence:{readback:true},
      result:"VERIFIED"
    });
  }

  assert.equal((await one("SELECT state FROM goals WHERE id=$1",[goal.goalId])).state,"COMPLETED");

  const emptyForComm=await runOneSpecialistWork({
    agent:communications,
    workerInstanceId:"comm-worker-2",
    ttlSeconds:60,
    executors:{phase3_email:async()=>({result:{},evidence:{}})}
  });
  assert.equal(emptyForComm.processed,false);

  console.log("PHASE3_SPECIALIST_DELEGATION PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
