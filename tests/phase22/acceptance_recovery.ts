import assert from "node:assert/strict";
import { createServer,type Server } from "node:http";
import { pool } from "../../packages/db/src/client";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { createProductionComposition } from "../../apps/production/src/composition";
import { syncProductionModelRegistry } from "../../apps/production/src/modelRegistry";
import { planNextNewGoal } from "../../apps/production/src/planner";

async function main(){
  const tag=`acceptance-${Date.now()}`;
  let server:Server,base="",reads=0;
  async function start(){
    server=createServer((req,res)=>{reads++;res.setHeader("content-type","application/json");res.end(JSON.stringify({value:req.url==="/left"?2:3}));});
    await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
    base=`http://127.0.0.1:${(server.address() as any).port}`;
  }
  async function stop(){if(!server.listening)return;await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  await start();
  async function source(path:string){
    try{const response=await fetch(`${base}/${path}`,{signal:AbortSignal.timeout(1000)});return (await response.json()).value as number;}
    catch{throw new Error("SOURCE_UNAVAILABLE: isolated HTTP source disconnected");}
  }
  const org=await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[tag]);
  const entity=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,tag]);
  const ids=[`${tag}_left`,`${tag}_right`];
  const config={providerId:tag,models:["fixture-planner"],capabilities:["planning"],privacyClasses:["INTERNAL" as const],health:"HEALTHY" as const,costPer1kInput:0,costPer1kOutput:0};
  await syncProductionModelRegistry([config]);
  let finishLate:((value:any)=>void)|undefined;
  for(const id of ids)await pool.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,'Isolated acceptance','api_readback','{}','{}')",[id]);
  const bundle=validateProductionBundle({
    capabilities:ids.map((capabilityId,i)=>({capabilityId,authorityClass:"GREEN" as const,specialistAgentId:i?"documents-fixture":"communications-fixture",specialistVersion:"test"})),
    toolDefinitions:ids.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,sideEffect:false,inputSchema:{type:"object"}})),
    modelProviderConfigs:[config],modelAdapters:[{providerId:tag,async invoke(task:any){
      const objective=String(task.input.objective);
      if(objective.includes("pending"))return new Promise<any>(resolve=>{finishLate=resolve;});
      return {model:"fixture-planner",usage:{inputTokens:1,outputTokens:1},output:{steps:objective.includes("empty")?[]:ids.map(capabilityId=>({capabilityId,params:{failTool:objective.includes("tool-error")},priority:0}))}};
    }}],
    toolAdapters:ids.map((capabilityId,i)=>({capabilityId,async execute(request){
      if(request.params.failTool)throw new Error("TOOL_EXECUTION_FAILED: isolated deterministic failure");
      const value=await source(i?"right":"left");
      return {result:{value},evidence:{value,source:"isolated-http",read_only:true}};
    }})),
    verificationAdapters:ids.map((capabilityId,i)=>({capabilityId,async verify(input){
      const value=await source(i?"right":"left");
      return {result:value===input.execution.evidence.value?"VERIFIED" as const:"FAILED" as const,evidence:{independent_http_value:value},verifier:"independent-http-reader"};
    }}))
  });
  const composition=createProductionComposition({bundle,workerId:"isolated-acceptance"});
  let n=0;
  async function goal(objective:string){return (await pool.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'NEW','GREEN') RETURNING id",[`${tag}-${++n}`,entity.rows[0].id,objective])).rows[0].id as string;}
  async function state(id:string){return (await pool.query("SELECT state FROM goals WHERE id=$1",[id])).rows[0].state;}
  async function drain(id:string){for(let i=0;i<8&&!['COMPLETED','FAILED'].includes(await state(id));i++)await composition.runWorkTick();}
  async function failure(id:string,reason:RegExp){
    assert.equal(await state(id),"FAILED");
    assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[id])).rows[0].n,0);
    const logs=(await pool.query("SELECT after_ref FROM audit_log WHERE goal_id=$1 AND action='RUNTIME_FAILURE'",[id])).rows;
    assert.equal(logs.length,1);assert.match(logs[0].after_ref.error,reason);
  }
  async function planningFailure(id:string,code:string){
    assert.equal(await state(id),"FAILED");
    assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[id])).rows[0].n,0);
    const record=(await pool.query("SELECT planning_failure FROM goals WHERE id=$1",[id])).rows[0].planning_failure;
    assert.equal(record.code,code);assert.equal(record.attempt,1);assert.equal(record.maxAttempts,1);
  }
  try{
    const normal=await goal("normal two-specialist fixture");await drain(normal);assert.equal(await state(normal),"COMPLETED");
    const agents=(await pool.query("SELECT DISTINCT handoff->>'agent_id' agent FROM work_queue WHERE goal_id=$1",[normal])).rows.map(r=>r.agent).sort();
    assert.deepEqual(agents,["communications-fixture","documents-fixture"]);
    assert.equal((await pool.query("SELECT count(*)::int n FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1 AND v.result='VERIFIED'",[normal])).rows[0].n,2);
    assert.equal(reads,4,"each fixture result must have its own independent HTTP reread");
    console.log("ISOLATED_TWO_SPECIALIST_ROUTING PASS planned=2 agents=2 verified=2; combined report NOT IMPLEMENTED by this fixture");

    await stop();
    const outage=await goal("source outage");await drain(outage);await failure(outage,/SOURCE_UNAVAILABLE/);
    await start();
    const recovered=await goal("healthy after source recovery");await drain(recovered);assert.equal(await state(recovered),"COMPLETED");
    console.log("ISOLATED_SOURCE_OUTAGE PASS failed, reason audited, no false completion, later healthy goal completed");

    const badTool=await goal("tool-error");await drain(badTool);await failure(badTool,/TOOL_EXECUTION_FAILED/);
    const afterTool=await goal("healthy after tool failure");await drain(afterTool);assert.equal(await state(afterTool),"COMPLETED");
    console.log("ISOLATED_TOOL_FAILURE PASS failed, siblings stopped, later healthy goal completed");

    const empty=await goal("empty plan");await planNextNewGoal(bundle,{goalId:empty,maxAttempts:1});await planningFailure(empty,"PLAN_CONTRACT_INVALID");
    const afterEmpty=await goal("healthy after invalid plan");await drain(afterEmpty);assert.equal(await state(afterEmpty),"COMPLETED");
    console.log("ISOLATED_EMPTY_PLAN PASS failed after bounded correction, later healthy goal completed");
    const pending=await goal("pending model request");
    const bounded=await planNextNewGoal(bundle,{deadlineMs:100,maxAttempts:1});
    assert.equal(bounded.failed,true);await planningFailure(pending,"PLANNING_DEADLINE_EXCEEDED");
    assert.ok(finishLate,"fixture model request must have started before the deadline");
    finishLate!({model:"fixture-planner",usage:{inputTokens:1,outputTokens:1},output:{steps:ids.map(capabilityId=>({capabilityId,params:{}}))}});
    await new Promise(resolve=>setTimeout(resolve,50));
    assert.equal(await state(pending),"FAILED");
    assert.equal((await pool.query("SELECT count(*)::int n FROM plans WHERE goal_id=$1",[pending])).rows[0].n,0);
    const afterDeadline=await goal("healthy after deadline");await drain(afterDeadline);assert.equal(await state(afterDeadline),"COMPLETED");
    console.log("ISOLATED_PLANNING_DEADLINE PASS hung request failed, late output cannot create plan, next goal completed");
    assert.equal((await pool.query("SELECT count(*)::int n FROM side_effect_operations WHERE goal_id IN (SELECT id FROM goals WHERE company_scope=$1)",[entity.rows[0].id])).rows[0].n,0);
  }finally{await stop();await pool.end();}
}
main().catch(error=>{console.error(error);process.exit(1);});
