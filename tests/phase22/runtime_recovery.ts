import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { createProductionComposition } from "../../apps/production/src/composition";
import { persistPlanAndDelegateAtomic } from "../../apps/kernel/src/planning";
import { leaseWorkAtomic } from "../../apps/kernel/src/queue";
import { recordExecutionAndRequestVerificationAtomic } from "../../apps/kernel/src/execution";
import { failInterruptedPlanning,recordWorkFailure } from "../../apps/kernel/src/failures";
import { planNextNewGoal } from "../../apps/production/src/planner";
import { syncProductionModelRegistry } from "../../apps/production/src/modelRegistry";
import { validateToolParameters } from "../../packages/tool-gateway/src/validation";
import { proposePlan } from "../../apps/brain/src/planner";

const schema={type:"object",properties:{page:{type:"integer",minimum:1},latestChangeDate:{type:"string"}},additionalProperties:false};
const descriptor={capabilityId:"bol_list_orders",sideEffect:false,parameters:schema};
const invokeInput={goalId:"test",objective:"read-only bol.com orders",context:{},dataClassification:"INTERNAL" as const,maxCostUsd:0.2,availableCapabilities:[descriptor]};
async function main(){
  assert.throws(()=>validateToolParameters("bol_list_orders",{latestChangeDate:"2026-02-30"},schema),/real ISO date/);
  assert.throws(()=>validateToolParameters("bol_list_orders",{latestChangeDate:"{{execution_date_minus_7_days}}"},schema),/Unresolved/);
  assert.throws(()=>validateToolParameters("bol_list_orders",{page:"1"},schema),/integer/);
  assert.throws(()=>validateToolParameters("test",{nested:[{value:"${unresolved}"}]}),/Unresolved/);
  validateToolParameters("bol_list_orders",{latestChangeDate:"2026-10-13",page:1},schema);
  let calls=0;
  const grounded=await proposePlan({...invokeInput,gateway:{async invoke(task:any){
    calls++;
    assert.ok(!Number.isNaN(Date.parse(task.input.planningTimeUtc)));
    assert.equal(task.maxCostUsd,0.1);
    if(calls===2) assert.match(task.input.validationFeedback,/Unresolved/);
    return {result:{output:{steps:[{capabilityId:"bol_list_orders",params:{page:1,latestChangeDate:calls===1?"{{date}}":"2026-10-13"}}]}}};
  }} as any});
  assert.equal(calls,2);
  assert.equal(grounded.steps[0].params?.latestChangeDate,"2026-10-13");
  await assert.rejects(proposePlan({...invokeInput,gateway:{async invoke(){return {result:{output:{steps:[{capabilityId:"bol_cancel_order_item",params:{}}]}}}}} as any}),/unavailable capability/);

  const suffix=`recovery-${Date.now()}`;
  const org=await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[suffix]);
  const entity=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,suffix]);
  let sequence=0;
  async function goal(state="PLANNING"){
    const result=await pool.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Recovery acceptance',$3,'GREEN') RETURNING id",[`${suffix}-${++sequence}`,entity.rows[0].id,state]);
    return result.rows[0].id;
  }
  async function state(id:string){return (await pool.query("SELECT state FROM goals WHERE id=$1",[id])).rows[0].state;}
  const executed:string[]=[];
  const bundle=validateProductionBundle({
    capabilities:[{capabilityId:"recovery_read",authorityClass:"GREEN",specialistAgentId:"test",specialistVersion:"1"}],
    toolDefinitions:[{capabilityId:"recovery_read",authorityClass:"GREEN",sideEffect:false,inputSchema:{type:"object"}}],
    toolAdapters:[{capabilityId:"recovery_read",async execute(request){
      executed.push(String(request.params.name));
      if(request.params.fail) throw new Error("read source disconnected");
      return {result:{value:42},evidence:{source:"isolated-test"}};
    }}],
    verificationAdapters:[{capabilityId:"recovery_read",async verify(){return {result:"VERIFIED",evidence:{independent:true},verifier:"independent-test"};}}]
  });
  await pool.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES('recovery_read','test','db_query','{}','{}')");
  const composition=createProductionComposition({ordinaryFailurePolicy:"record",bundle,workerId:"recovery-test"});

  // Recover a lease that expires after the service has already started.
  await composition.runWorkTick();
  const recoveredGoal=await goal();
  const recovered=await persistPlanAndDelegateAtomic({goalId:recoveredGoal,steps:[{capabilityId:"recovery_read",params:{name:"recovered"}}]});
  const oldLease=await leaseWorkAtomic(recovered.queueIds[0],"dead-worker",60);
  await pool.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[recovered.queueIds[0]]);
  await composition.runWorkTick();
  assert.equal(await state(recoveredGoal),"COMPLETED");
  const newToken=(await pool.query("SELECT fencing_token FROM work_queue WHERE id=$1",[recovered.queueIds[0]])).rows[0].fencing_token;
  assert.ok(Number(newToken)>oldLease.token);
  await assert.rejects(recordExecutionAndRequestVerificationAtomic({queueId:recovered.queueIds[0],fencingToken:oldLease.token,actor:"dead-worker",result:{},evidence:{}}),/Stale fencing token/);

  // A source failure stops sibling work, preserves evidence, and does not block unrelated goals.
  const badGoal=await goal();
  const badPlan=await persistPlanAndDelegateAtomic({goalId:badGoal,steps:[
    {capabilityId:"recovery_read",params:{name:"failing",fail:true},priority:100},
    {capabilityId:"recovery_read",params:{name:"must-not-run"},priority:0}
  ]});
  const goodGoal=await goal();
  await persistPlanAndDelegateAtomic({goalId:goodGoal,steps:[{capabilityId:"recovery_read",params:{name:"unrelated"},priority:50}]});
  await composition.runWorkTick();
  assert.equal(await state(badGoal),"FAILED");
  assert.equal(Number((await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[badGoal])).rows[0].n),0);
  const audit=(await pool.query("SELECT after_ref FROM audit_log WHERE goal_id=$1 AND action='RUNTIME_FAILURE'",[badGoal])).rows[0];
  assert.match(audit.after_ref.error,/read source disconnected/);
  assert.equal(Number((await pool.query("SELECT count(*)::int n FROM work_queue WHERE plan_id=$1 AND status='FAILED'",[badPlan.planId])).rows[0].n),2);
  await composition.runWorkTick();
  assert.equal(await state(goodGoal),"COMPLETED");
  assert.ok(!executed.includes("must-not-run"));

  // A stale worker cannot fail a goal after a newer worker acquired its lease.
  const fencedGoal=await goal();
  const fenced=await persistPlanAndDelegateAtomic({goalId:fencedGoal,steps:[{capabilityId:"recovery_read",params:{name:"fenced"}}]});
  const first=await leaseWorkAtomic(fenced.queueIds[0],"old",60);
  await pool.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[fenced.queueIds[0]]);
  const second=await leaseWorkAtomic(fenced.queueIds[0],"new",60);
  assert.ok(second.token>first.token);
  assert.equal(await recordWorkFailure({queueId:fenced.queueIds[0],fencingToken:first.token,error:new Error("stale"),actor:"old"}),false);
  assert.equal(await state(fencedGoal),"EXECUTING");
  await pool.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[fenced.queueIds[0]]);
  await composition.runWorkTick();
  assert.equal(await state(fencedGoal),"COMPLETED");

  const stale=await goal("PLANNING");
  const waiting=await goal("WAITING_OWNER");
  await pool.query("UPDATE goals SET updated_at=now()-interval '20 minutes' WHERE id=ANY($1::uuid[])",[[stale,waiting]]);
  assert.ok((await failInterruptedPlanning()).includes(stale));
  assert.equal(await state(stale),"FAILED");
  assert.equal(await state(waiting),"WAITING_OWNER");

  // Invalid model plans cannot leave a new goal stuck in PLANNING forever.
  const modelConfig={providerId:suffix,models:["test"],capabilities:["planning"],privacyClasses:["INTERNAL" as const],health:"HEALTHY" as const,costPer1kInput:0,costPer1kOutput:0};
  await syncProductionModelRegistry([modelConfig]);
  const planningGoal=await goal("NEW");
  const planningBundle=validateProductionBundle({...bundle.raw,modelProviderConfigs:[modelConfig],modelAdapters:[{providerId:suffix,async invoke(){return {model:"test",usage:{inputTokens:1,outputTokens:1},output:{steps:[]}}}}]});
  const planned=await planNextNewGoal(planningBundle,{maxAttempts:1});
  assert.equal(planned.failed,true);
  assert.equal(await state(planningGoal),"FAILED");
  assert.equal((await pool.query("SELECT planning_failure FROM goals WHERE id=$1",[planningGoal])).rows[0].planning_failure.code,"PLAN_CONTRACT_INVALID");

  const replanningGoal=await goal("REPLANNING");
  const replanBundle=validateProductionBundle({...bundle.raw,modelProviderConfigs:[modelConfig],modelAdapters:[{providerId:suffix,async invoke(){return {model:"test",usage:{inputTokens:1,outputTokens:1},output:{steps:[{capabilityId:"recovery_read",params:{name:"replanned"}}]}}}}]});
  const replanComposition=createProductionComposition({ordinaryFailurePolicy:"record",bundle:replanBundle,workerId:"replanner"});
  await replanComposition.runWorkTick();
  assert.equal(await state(replanningGoal),"COMPLETED");
  assert.equal((await pool.query("SELECT replan_attempts FROM goals WHERE id=$1",[replanningGoal])).rows[0].replan_attempts,1);
  const exhaustedGoal=await goal("REPLANNING");
  await pool.query("UPDATE goals SET replan_attempts=2 WHERE id=$1",[exhaustedGoal]);
  await replanComposition.runWorkTick();
  assert.equal(await state(exhaustedGoal),"FAILED");

  await composition.runWorkTick();
  assert.equal(Number((await pool.query("SELECT count(*)::int n FROM outbox_events WHERE status='PENDING'",[])).rows[0].n),0);
  console.log("RUNTIME_RECOVERY PASS: grounded dates, schema validation, bounded correction, periodic recovery, fencing, recorded failures, sibling stop, independent continuation, stale planning, outbox relay");
  await pool.end();
}
main().catch(async error=>{console.error(error);await pool.end();process.exit(1);});
