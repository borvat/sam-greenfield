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
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P5-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P5LE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,$4,'GREEN') RETURNING id",
      [`P5G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Verified learning proof",state]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function verifiedExecution(goalId:string,capabilityId:string,actor:string,value:number){
  const plan=await persistPlanAndDelegateAtomic({
    goalId,
    steps:[{capabilityId,params:{value},priority:2147483647}]
  });
  const lease=await leaseWorkAtomic(plan.queueIds[0],actor,60);
  const execution=await recordExecutionAndRequestVerificationAtomic({
    queueId:plan.queueIds[0],
    fencingToken:lease.token,
    actor,
    result:{value},
    evidence:{observed:true}
  });
  await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES($1,$2,'db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO UPDATE SET description=EXCLUDED.description`,
    [capabilityId,`Verify ${capabilityId}`]
  );
  const contract=await one("SELECT id FROM verification_contracts WHERE capability_id=$1",[capabilityId]);
  await recordIndependentVerificationAtomic({
    executionId:execution.executionId,
    verifier:`independent-${actor}`,
    contractId:contract.id,
    independentEvidence:{value,readback:true},
    result:"VERIFIED"
  });
  return execution.executionId as string;
}

async function main(){
  const goal1=await createGoal();
  const exec1=await verifiedExecution(goal1.goalId,"p5_observe_a","worker-a",10);

  const fact1=await learnVerifiedWorldFact({
    executionId:exec1,
    entityType:"legal_entity",
    entityId:goal1.legalEntityId,
    domain:"operations",
    attribute:"preferred_batch_size",
    value:{units:10},
    scope:{channel:"synthetic"}
  });
  assert.ok(fact1);

  const goal2=await createGoal();
  const exec2=await verifiedExecution(goal2.goalId,"p5_observe_b","worker-b",20);
  const fact2=await learnVerifiedWorldFact({
    executionId:exec2,
    entityType:"legal_entity",
    entityId:goal1.legalEntityId,
    domain:"operations",
    attribute:"preferred_batch_size",
    value:{units:20},
    scope:{channel:"synthetic"}
  });
  assert.ok(fact2);

  const oldFact=await one(
    "SELECT superseded_at FROM world_facts WHERE id=$1",
    [fact1]
  );
  const newFact=await one(
    "SELECT superseded_at FROM world_facts WHERE id=$1",
    [fact2]
  );
  assert.ok(oldFact.superseded_at);
  assert.equal(newFact.superseded_at,null);

  const m1=await observeVerifiedMemory({
    executionId:exec1,
    type:"OPERATIONAL",
    statement:"Synthetic supplier responds faster in the morning",
    scope:{supplier:"synthetic"}
  });
  assert.equal(m1.status,"OBSERVED");
  assert.equal(m1.supportCount,1);

  const mDuplicate=await observeVerifiedMemory({
    executionId:exec1,
    type:"OPERATIONAL",
    statement:"Synthetic supplier responds faster in the morning",
    scope:{supplier:"synthetic"}
  });
  assert.equal(mDuplicate.supportCount,1);

  const m2=await observeVerifiedMemory({
    executionId:exec2,
    type:"OPERATIONAL",
    statement:"Synthetic supplier responds faster in the morning",
    scope:{supplier:"synthetic"}
  });
  assert.equal(m2.status,"REINFORCED");
  assert.equal(m2.supportCount,2);

  const ownerRule=await recordOwnerRule({
    type:"FORMAL_RULE",
    statement:"Synthetic formal rule for Phase 5 acceptance",
    scope:{domain:"synthetic"},
    source:"owner_test",
    approvedBy:"owner"
  });
  assert.ok(ownerRule);

  const context=await withTransaction((client)=>assembleContext(client,"legal_entity",goal1.legalEntityId));
  const currentFact=context.facts.find((f:any)=>f.attribute==="preferred_batch_size");
  assert.deepEqual(currentFact.value,{units:20});
  assert.ok(context.memory.some((m:any)=>m.statement==="Synthetic supplier responds faster in the morning" && m.status==="REINFORCED"));
  assert.ok(context.memory.some((m:any)=>m.statement==="Synthetic formal rule for Phase 5 acceptance" && m.status==="APPROVED_RULE"));

  const badGoal=await createGoal();
  const badPlan=await persistPlanAndDelegateAtomic({
    goalId:badGoal.goalId,
    steps:[{capabilityId:"p5_bad",params:{},priority:2147483647}]
  });
  const badLease=await leaseWorkAtomic(badPlan.queueIds[0],"worker-bad",60);
  const badExec=await recordExecutionAndRequestVerificationAtomic({
    queueId:badPlan.queueIds[0],
    fencingToken:badLease.token,
    actor:"worker-bad",
    result:{ok:false},
    evidence:{attempted:true}
  });
  await pool.query(
    `INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
     VALUES('p5_bad','bad verify','db_query','{}'::jsonb,'{}'::jsonb,true)
     ON CONFLICT(capability_id) DO NOTHING`
  );
  const badContract=await one("SELECT id FROM verification_contracts WHERE capability_id='p5_bad'");
  await recordIndependentVerificationAtomic({
    executionId:badExec.executionId,
    verifier:"independent-bad",
    contractId:badContract.id,
    independentEvidence:{readback:false},
    result:"FAILED"
  });

  let blocked=false;
  try{
    await observeVerifiedMemory({
      executionId:badExec.executionId,
      type:"OPERATIONAL",
      statement:"This must never be learned"
    });
  }catch(err){
    blocked=err instanceof Error && err.message.includes("VERIFIED");
  }
  assert.equal(blocked,true);

  console.log("PHASE5_VERIFIED_LEARNING PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
