import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { CapabilityCatalog } from "../../apps/agents/src/capabilityCatalog";
import { runSpecialistSupervisorTick } from "../../apps/agents/src/supervisor";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";

async function createGoal(){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P3SUP-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P3SUPLE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING','GREEN') RETURNING id",
      [`P3SUP-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Supervisor routing test"]
    );
    return g.rows[0].id as string;
  });
}

async function main(){
  const catalog=new CapabilityCatalog([
    {capabilityId:"p3_email",authorityClass:"GREEN",specialistAgentId:"communications",specialistVersion:"1.0.0"},
    {capabilityId:"p3_catalog",authorityClass:"GREEN",specialistAgentId:"commerce",specialistVersion:"1.0.0"}
  ]);

  const goalId=await createGoal();
  await persistPlanAndDelegateAtomic({
    goalId,
    steps:[
      {capabilityId:"p3_catalog",params:{sku:"1"},priority:100},
      {capabilityId:"p3_email",params:{msg:"hello"},priority:200}
    ]
  });

  const executors={
    p3_email:async()=>({result:{ok:true},evidence:{source:"email-test"}}),
    p3_catalog:async()=>({result:{ok:true},evidence:{source:"catalog-test"}})
  };

  const first=await runSpecialistSupervisorTick({
    catalog,
    workerInstanceId:"supervisor-1",
    ttlSeconds:60,
    executors
  });
  assert.equal(first.processed,true);
  assert.equal(first.agentId,"communications");

  const firstRow=await pool.query("SELECT capability_id,handoff FROM work_queue WHERE id=$1",[first.queueId]);
  assert.equal(firstRow.rows[0].capability_id,"p3_email");
  assert.equal(firstRow.rows[0].handoff.agent_id,"communications");

  const second=await runSpecialistSupervisorTick({
    catalog,
    workerInstanceId:"supervisor-1",
    ttlSeconds:60,
    executors
  });
  assert.equal(second.processed,true);
  assert.equal(second.agentId,"commerce");

  const third=await runSpecialistSupervisorTick({
    catalog,
    workerInstanceId:"supervisor-1",
    ttlSeconds:60,
    executors
  });
  assert.equal(third.processed,false);

  console.log("PHASE3_SPECIALIST_SUPERVISOR PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
