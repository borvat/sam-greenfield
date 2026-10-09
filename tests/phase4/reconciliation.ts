import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { CapabilityCatalog } from "../../apps/agents/src/capabilityCatalog";
import { ToolRegistry } from "../../packages/tool-gateway/src/registry";
import { createToolExecutors } from "../../apps/tools/src/executorFactory";
import { reconcileOneSideEffectAtomic,reconcilePendingSideEffects } from "../../apps/tools/src/reconciler";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { runOneSpecialistWork } from "../../apps/agents/src/runtime";
import { beginSideEffectAtomic,bindSideEffectToWorkAtomic } from "../../apps/kernel/src/sideEffects";
import { sha256Hex } from "../../packages/shared/src/stableJson";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P4R-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P4RLE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING','GREEN') RETURNING id",
      [`P4RG-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Phase4 reconciliation proof"]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function main(){
  const catalog=new CapabilityCatalog([
    {capabilityId:"p4_reconcile_send",authorityClass:"GREEN",specialistAgentId:"ops",specialistVersion:"4.1.0"}
  ]);

  let sends=0;
  let reconciles=0;
  const tools=new ToolRegistry(
    [{capabilityId:"p4_reconcile_send",authorityClass:"GREEN",sideEffect:true}],
    [{
      capabilityId:"p4_reconcile_send",
      async execute(request:any){
        sends+=1;
        return {
          providerReference:"provider-reconcile-1",
          result:{accepted:true},
          evidence:{submission:true}
        };
      },
      async reconcile(input:any){
        reconciles+=1;
        assert.equal(input.providerReference,"provider-reconcile-1");
        assert.ok(input.idempotencyKey.startsWith("tool:"));
        return {result:"CONFIRMED" as const,evidence:{readback:true}};
      }
    } as any]
  );

  const executors=createToolExecutors({catalog,tools});
  const agent=catalog.specialists.getAgent("ops");
  const goal=await createGoal();
  const plan=await persistPlanAndDelegateAtomic({
    goalId:goal.goalId,
    steps:[{capabilityId:"p4_reconcile_send",params:{payload:"x"},priority:2147483647}]
  });

  const run=await runOneSpecialistWork({
    agent,
    workerInstanceId:"p4-reconcile-worker",
    ttlSeconds:60,
    executors
  });
  assert.equal(run.processed,true);
  assert.equal(sends,1);

  const op=await one(
    "SELECT operation_key,state,reconciliation_state FROM side_effect_operations WHERE goal_id=$1",
    [goal.goalId]
  );
  assert.equal(op.state,"SENT");
  assert.equal(op.reconciliation_state,"NEEDS_RECONCILIATION");

  assert.equal(
    await reconcileOneSideEffectAtomic({tools,operationKey:op.operation_key}),
    "CONFIRMED"
  );
  assert.equal(reconciles,1);

  const confirmed=await one(
    "SELECT state,reconciliation_state FROM side_effect_operations WHERE operation_key=$1",
    [op.operation_key]
  );
  assert.equal(confirmed.state,"CONFIRMED");
  assert.equal(confirmed.reconciliation_state,"RECONCILED");

  const crashGoal=await createGoal();
  const crashPlan=await persistPlanAndDelegateAtomic({
    goalId:crashGoal.goalId,
    steps:[{capabilityId:"p4_reconcile_send",params:{payload:"crash"},priority:2147483647}]
  });
  const crashParams={payload:"crash"};
  const requestHash=sha256Hex(crashParams);
  const operationKey=`tool:${crashPlan.queueIds[0]}:p4_reconcile_send:${requestHash}`;
  await beginSideEffectAtomic({
    operationKey,
    capabilityId:"p4_reconcile_send",
    requestHash,
    goalId:crashGoal.goalId,
    legalEntityId:crashGoal.legalEntityId,
    idempotencyKey:operationKey
  });
  await bindSideEffectToWorkAtomic(crashPlan.queueIds[0],operationKey);

  let blocked=false;
  try{
    await executors.p4_reconcile_send({
      queueId:crashPlan.queueIds[0],
      fencingToken:1,
      capabilityId:"p4_reconcile_send",
      params:crashParams,
      goalId:crashGoal.goalId,
      planId:crashPlan.planId
    } as any);
  }catch(err){
    blocked=err instanceof Error && err.message.includes("reconciliation required");
  }
  assert.equal(blocked,true);
  assert.equal(sends,1);

  await pool.query(
    `UPDATE side_effect_operations
        SET state='SENT',
            provider_reference='provider-reconcile-1',
            reconciliation_state='NEEDS_RECONCILIATION'
      WHERE operation_key=$1`,
    [operationKey]
  );

  const batch=await reconcilePendingSideEffects({tools,limit:10});
  assert.ok(batch.confirmed>=1);

  console.log("PHASE4_RECONCILIATION PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
