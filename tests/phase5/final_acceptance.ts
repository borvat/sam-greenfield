import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { recordIndependentVerificationAtomic } from "../../apps/kernel/src/verification";
import { learnVerifiedWorldFact,observeVerifiedMemory,recordOwnerRule } from "../../apps/brain/src/learning";
import { assembleContext } from "../../apps/brain/src/contextAssembler";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createGoal(state="PLANNING"){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P5FA-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P5FALE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,$4,'GREEN') RETURNING id",
      [`P5FAG-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Phase5 final acceptance",state]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function makeExecution(input:{
  goalId:string;
  capabilityId:string;
  actor:string;
  verification:"VERIFIED"|"FAILED";
  value:number;
}){
  const plan=await persistPlanAndDelegateAtomic({
    goalId:input.goalId,
    steps:[{capabilityId:input.capabilityId,params:{value:input.value},priority:2147483647}]
  });
  const lease=await leaseWorkAtomic(plan.queueIds[0],input.actor,60);
  const execution=await recordExecutionAndRequestVerificationAtomic({
    queueId:plan.queueIds[0],
    fencingToken:lease.token,
    actor:input.actor,
    result:{value:input.value},
    evidence:{observed:true}
  });
  await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES($1,$2,'db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description`,
    [input.capabilityId,`Verify ${input.capabilityId}`]
  );
  const contract=await one("SELECT id FROM verification_contracts WHERE capability_id=$1",[input.capabilityId]);
  await recordIndependentVerificationAtomic({
    executionId:execution.executionId,
    verifier:`independent-${input.actor}`,
    contractId:contract.id,
    independentEvidence:{value:input.value,readback:input.verification==="VERIFIED"},
    result:input.verification
  });
  return execution.executionId as string;
}

async function main(){
  const g1=await createGoal();
  const e1=await makeExecution({
    goalId:g1.goalId,
    capabilityId:"p5fa_observe1",
    actor:"p5fa-worker1",
    verification:"VERIFIED",
    value:100
  });

  await learnVerifiedWorldFact({
    executionId:e1,
    entityType:"legal_entity",
    entityId:g1.legalEntityId,
    domain:"commercial",
    attribute:"preferred_moq",
    value:{units:100},
    scope:{market:"synthetic"}
  });

  await pool.query(
    `INSERT INTO world_facts
      (entity_type,entity_id,domain,attribute,value,scope,status,source,source_timestamp,confidence)
     VALUES('legal_entity',$1,'commercial','preferred_moq','{"units":999}'::jsonb,'{"market":"synthetic"}'::jsonb,'INFERRED','unverified-model',now()+interval '1 day',1)`,
    [g1.legalEntityId]
  );

  const context1=await withTransaction((client)=>assembleContext(client,"legal_entity",g1.legalEntityId));
  const verifiedFact=context1.facts.find((f:any)=>f.attribute==="preferred_moq");
  assert.deepEqual(verifiedFact.value,{units:100});

  const firstObs=await observeVerifiedMemory({
    executionId:e1,
    type:"COMMERCIAL",
    statement:"Synthetic supplier accepts deferred payment",
    scope:{supplier:"phase5-final"}
  });
  assert.equal(firstObs.status,"OBSERVED");

  const duplicateObs=await observeVerifiedMemory({
    executionId:e1,
    type:"COMMERCIAL",
    statement:"Synthetic supplier accepts deferred payment",
    scope:{supplier:"phase5-final"}
  });
  assert.equal(duplicateObs.supportCount,1);

  const g2=await createGoal();
  const e2=await makeExecution({
    goalId:g2.goalId,
    capabilityId:"p5fa_observe2",
    actor:"p5fa-worker2",
    verification:"VERIFIED",
    value:101
  });

  const reinforced=await observeVerifiedMemory({
    executionId:e2,
    type:"COMMERCIAL",
    statement:"Synthetic supplier accepts deferred payment",
    scope:{supplier:"phase5-final"}
  });
  assert.equal(reinforced.status,"REINFORCED");
  assert.equal(reinforced.supportCount,2);

  const rule1=await recordOwnerRule({
    type:"FORMAL_RULE",
    statement:"Synthetic rule version 1",
    scope:{rule_key:"phase5-final"},
    source:"owner-test",
    approvedBy:"owner"
  });
  const rule2=await recordOwnerRule({
    type:"FORMAL_RULE",
    statement:"Synthetic rule version 2",
    scope:{rule_key:"phase5-final"},
    source:"owner-test",
    approvedBy:"owner",
    supersedesMemoryId:rule1
  });

  const oldRule=await one("SELECT status,superseded_by FROM memory_records WHERE id=$1",[rule1]);
  assert.equal(oldRule.status,"SUPERSEDED");
  assert.equal(oldRule.superseded_by,rule2);

  const context2=await withTransaction((client)=>assembleContext(client,"legal_entity",g1.legalEntityId));
  assert.ok(context2.memory.some((m:any)=>m.id===rule2 && m.status==="APPROVED_RULE"));
  assert.ok(!context2.memory.some((m:any)=>m.id===rule1));
  assert.ok(context2.memory.some((m:any)=>m.statement==="Synthetic supplier accepts deferred payment" && m.status==="REINFORCED"));

  const bad=await createGoal();
  const failedExecution=await makeExecution({
    goalId:bad.goalId,
    capabilityId:"p5fa_failed",
    actor:"p5fa-failed-worker",
    verification:"FAILED",
    value:500
  });

  let factBlocked=false;
  try{
    await learnVerifiedWorldFact({
      executionId:failedExecution,
      entityType:"legal_entity",
      entityId:bad.legalEntityId,
      domain:"operations",
      attribute:"must_not_learn",
      value:true
    });
  }catch(err){
    factBlocked=err instanceof Error && err.message.includes("VERIFIED");
  }
  assert.equal(factBlocked,true);

  let memoryBlocked=false;
  try{
    await observeVerifiedMemory({
      executionId:failedExecution,
      type:"OPERATIONAL",
      statement:"Failed execution must not become memory"
    });
  }catch(err){
    memoryBlocked=err instanceof Error && err.message.includes("VERIFIED");
  }
  assert.equal(memoryBlocked,true);

  const poisonedFactCount=Number((await one(
    "SELECT COUNT(*)::int c FROM world_facts WHERE entity_id=$1 AND attribute='must_not_learn'",
    [bad.legalEntityId]
  )).c);
  assert.equal(poisonedFactCount,0);

  console.log("PHASE5_FINAL_ACCEPTANCE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
