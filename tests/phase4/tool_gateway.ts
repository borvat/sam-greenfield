import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { CapabilityCatalog } from "../../apps/agents/src/capabilityCatalog";
import { ToolRegistry } from "../../packages/tool-gateway/src/registry";
import { createToolExecutors } from "../../apps/tools/src/executorFactory";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { runOneSpecialistWork } from "../../apps/agents/src/runtime";
import { confirmSideEffectAtomic } from "../../apps/kernel/src/sideEffects";
import { sha256Hex } from "../../packages/shared/src/stableJson";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(authority:"GREEN"|"YELLOW"){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P4-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P4LE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING',$4) RETURNING id",
      [`P4G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Tool gateway proof",authority]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function main(){
  const catalog=new CapabilityCatalog([
    {capabilityId:"p4_read",authorityClass:"GREEN",specialistAgentId:"ops",specialistVersion:"4.0.0"},
    {capabilityId:"p4_send",authorityClass:"YELLOW",specialistAgentId:"ops",specialistVersion:"4.0.0"}
  ]);

  let readCalls=0;
  let sendCalls=0;
  let lastIdempotencyKey="";

  const tools=new ToolRegistry(
    [
      {capabilityId:"p4_read",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"p4_send",authorityClass:"YELLOW",sideEffect:true}
    ],
    [
      {
        capabilityId:"p4_read",
        async execute(request){
          readCalls+=1;
          return {result:{value:request.params.value},evidence:{readback:true}};
        }
      },
      {
        capabilityId:"p4_send",
        async execute(request){
          sendCalls+=1;
          lastIdempotencyKey=request.idempotencyKey;
          return {
            providerReference:"provider-p4-1",
            result:{sent:true},
            evidence:{accepted:true}
          };
        }
      }
    ]
  );

  const executors=createToolExecutors({catalog,tools});
  const agent=catalog.specialists.getAgent("ops");

  const readGoal=await createGoal("GREEN");
  const readPlan=await persistPlanAndDelegateAtomic({
    goalId:readGoal.goalId,
    steps:[{capabilityId:"p4_read",params:{value:11},priority:1000}]
  });
  const readRun=await runOneSpecialistWork({
    agent,
    workerInstanceId:"p4-worker-read",
    ttlSeconds:60,
    executors
  });
  assert.equal(readRun.processed,true);
  assert.equal(readCalls,1);
  assert.equal(Number((await one("SELECT COUNT(*)::int c FROM side_effect_operations WHERE goal_id=$1",[readGoal.goalId])).c),0);

  const sendGoal=await createGoal("YELLOW");
  const params={to:"synthetic@example.test",subject:"RFQ"};
  await pool.query(
    `INSERT INTO approvals
      (goal_id,capability_id,params_hash,legal_entity_id,expiry_at,authority_class,requested_by,approved_by,status,max_uses)
     VALUES($1,'p4_send',$2,$3,now()+interval '1 hour','YELLOW','phase4-test','owner-test','APPROVED',1)`,
    [sendGoal.goalId,sha256Hex(params),sendGoal.legalEntityId]
  );

  const sendPlan=await persistPlanAndDelegateAtomic({
    goalId:sendGoal.goalId,
    steps:[{capabilityId:"p4_send",params,priority:2000}]
  });
  const sendRun=await runOneSpecialistWork({
    agent,
    workerInstanceId:"p4-worker-send",
    ttlSeconds:60,
    executors
  });
  assert.equal(sendRun.processed,true);
  assert.equal(sendCalls,1);
  assert.ok(lastIdempotencyKey.startsWith(`tool:${sendPlan.queueIds[0]}:p4_send:`));

  const approval=await one(
    "SELECT used_count,status FROM approvals WHERE goal_id=$1 AND capability_id='p4_send'",
    [sendGoal.goalId]
  );
  assert.equal(Number(approval.used_count),1);
  assert.equal(approval.status,"USED");

  const op=await one(
    "SELECT operation_key,state,provider_reference,reconciliation_state FROM side_effect_operations WHERE goal_id=$1",
    [sendGoal.goalId]
  );
  assert.equal(op.state,"SENT");
  assert.equal(op.provider_reference,"provider-p4-1");
  assert.equal(op.reconciliation_state,"NEEDS_RECONCILIATION");

  await confirmSideEffectAtomic(op.operation_key);
  const confirmed=await one(
    "SELECT state,reconciliation_state FROM side_effect_operations WHERE operation_key=$1",
    [op.operation_key]
  );
  assert.equal(confirmed.state,"CONFIRMED");
  assert.equal(confirmed.reconciliation_state,"RECONCILED");

  let duplicateSendCalls=0;
  const dedupExecutor=createToolExecutors({
    catalog,
    tools:new ToolRegistry(
      [
        {capabilityId:"p4_read",authorityClass:"GREEN",sideEffect:false},
        {capabilityId:"p4_send",authorityClass:"YELLOW",sideEffect:true}
      ],
      [
        {capabilityId:"p4_read",async execute()=>({result:{},evidence:{}})},
        {
          capabilityId:"p4_send",
          async execute(){
            duplicateSendCalls+=1;
            return {providerReference:"should-not-send",result:{},evidence:{}};
          }
        }
      ]
    )
  });

  const work={
    queueId:sendPlan.queueIds[0],
    fencingToken:1,
    capabilityId:"p4_send",
    params,
    goalId:sendGoal.goalId,
    planId:sendPlan.planId
  };
  const dedupResult=await dedupExecutor.p4_send(work as any);
  assert.equal(duplicateSendCalls,0);
  assert.equal(dedupResult.result.deduplicated,true);

  const mismatchCatalog=new CapabilityCatalog([
    {capabilityId:"x",authorityClass:"GREEN",specialistAgentId:"xagent",specialistVersion:"1"}
  ]);
  let mismatchRejected=false;
  try{
    createToolExecutors({
      catalog:mismatchCatalog,
      tools:new ToolRegistry(
        [{capabilityId:"x",authorityClass:"YELLOW",sideEffect:true}],
        [{capabilityId:"x",async execute()=>({providerReference:"x",result:{},evidence:{}})}]
      )
    });
  }catch{
    mismatchRejected=true;
  }
  assert.equal(mismatchRejected,true);

  console.log("PHASE4_TOOL_GATEWAY PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
