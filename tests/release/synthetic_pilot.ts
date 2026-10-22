// LOCAL MOCK PREPARATION ONLY. No migration, role creation or external provider.
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "node:http";
const require=createRequire(import.meta.url);
const {syntheticPilot}=require("../../scripts/release/synthetic-pilot.cjs");
const {validateRelease,childEnvironment}=require("../../scripts/release/contract.cjs");
const now=Date.now();
const org="10000000-0000-4000-8000-000000000001",entity="10000000-0000-4000-8000-000000000002";
const env={
  NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
  SAM_RELEASE_SYNTHETIC_PLANNER:"1",SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED:"1",
  SAM_PILOT_RUN_ID:"10000000-0000-4000-8000-000000000003",
  SAM_PILOT_EXPIRES_AT:new Date(now+3600000).toISOString(),
  SAM_PILOT_PRICE_REVIEWED_AT:new Date(now-1000).toISOString(),
  SAM_PILOT_INPUT_USD_PER_1K:"0.001",SAM_PILOT_OUTPUT_USD_PER_1K:"0.002",
  SAM_PILOT_MAX_REQUESTS:"4",SAM_PILOT_MAX_COST_USD:"0.25",
  SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/syntheticPilotBundleModule.ts",
  SAM_RELEASE_CAPABILITIES:"local.calculate,local.statistics",
  DEEPSEEK_API_KEY:"synthetic-key-no-live-access",
  DATABASE_URL:"postgres://synthetic_app:synthetic-password@unit.invalid/neondb?sslmode=verify-full",
  SAM_DB_APP_ROLE:"synthetic_app",SAM_DB_SCHEMA:"sam_pilot",
  SAM_RELEASE_ORG_ID:org,SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,
  SAM_COMMAND_CENTER_BEARER_TOKEN:"synthetic-private-token-not-real-123456",
  SAM_COMMAND_CENTER_ALLOWED_HOSTS:"unit.invalid",SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://unit.invalid"
};
Object.assign(process.env,env);
let refused=0,httpCalls=0,contextReads=0;
const ledger:any[]=[];
let unsafeRole=false,foreignGoal=false,missingRls=false,mutableLedger=false,providerDown=false,breaker=false;
const {Pool}=require("pg");
async function query(sql:string,params:any[]=[]):Promise<any>{
  if(sql.includes("world_facts")||sql.includes("memory_records")){contextReads++;throw new Error("MOCK_CONTEXT_TRIPWIRE");}
  if(sql.includes("FROM model_providers"))return {rows:[{provider_id:"deepseek",models:["deepseek-flash"],
    capabilities:["planning"],cost_per_1k_input:0.001,cost_per_1k_output:0.002,
    privacy_class_allowed:["PUBLIC"],health:providerDown?"DOWN":"HEALTHY"}]};
  if(sql.includes("WITH ranked AS"))return {rows:breaker?[{provider:"deepseek",recent_failures:3,recent_successes:0}]:[]};
  if(sql.includes("mutable_reservation"))return {rows:[{readable:true,appendable:true,finalizable:true,mutable_reservation:mutableLedger}]};
  if(sql.includes("current_user=session_user"))return {rows:[{same_login:true}]};
  if(sql.includes("SELECT rolsuper"))return {rows:[{rolsuper:unsafeRole,rolbypassrls:false,rolcreatedb:false,rolcreaterole:false,rolreplication:false}]};
  if(sql.includes("rolname<>current_user"))return {rows:[{n:0}]};
  if(sql.includes("relowner,'MEMBER'"))return {rows:[{n:0}]};
  if(sql.includes("has_schema_privilege"))return {rows:[{schema_create:false,database_create:false,table_ddl:false}]};
  if(sql.includes("bool_and(relrowsecurity)"))return {rows:[{n:missingRls?5:6,protected:!missingRls}]};
  if(sql.includes("SELECT g.objective")){
    assert.match(sql,/g.company_scope=\$2 AND e.org_id=\$3/);
    assert.equal(params[1],entity);assert.equal(params[2],org);
    return {rowCount:foreignGoal?0:1,rows:foreignGoal?[]:[{objective:objectiveText}]};
  }
  if(sql.includes("count(*)::int n,coalesce(sum(cost)"))return {rows:[{n:ledger.length,reserved:ledger.reduce((sum,row)=>sum+row.cost,0)}]};
  if(sql.includes("INSERT INTO model_calls")){
    const row={id:`mock-${ledger.length}`,cost:params[6],success:false,stage:params[10],task:params[0]};
    ledger.push(row);return {rows:[{id:row.id}]};
  }
  if(sql.includes("UPDATE model_calls")){
    const row=ledger.find(row=>row.id===params[0]);assert(row);
    row.stage=params[2]??"PILOT_REJECTED_USAGE_UNKNOWN";
    if(sql.includes("success=true"))row.success=true;
    return {rows:[],rowCount:1};
  }
  if(sql.includes("unnest")){
    const values=params[0] as number[];
    return {rows:[{count:values.length,sum:values.reduce((a,b)=>a+b,0),
      mean:values.reduce((a,b)=>a+b,0)/values.length,min:Math.min(...values),max:Math.max(...values)}]};
  }
  if(/^(BEGIN|COMMIT|ROLLBACK)|pg_advisory_xact_lock/.test(sql))return {rows:[]};
  throw new Error("UNEXPECTED_MOCK_SQL");
}
Pool.prototype.connect=async()=>({query,release(){}});
Pool.prototype.query=query;
let responseMode="valid";
let lastRequest:any;
const objectiveText=JSON.stringify({synthetic:true,operation:"sum",values:[4,-2,9]});
const server=createServer(async(req,res)=>{
  let text="";for await(const part of req)text+=part;
  httpCalls++;
  lastRequest=JSON.parse(text);
  assert.equal(lastRequest.thinking.type,"disabled");
  assert.equal(lastRequest.max_tokens,512);
  assert.equal(lastRequest.model,"deepseek-flash");
  const input=JSON.parse(lastRequest.messages[0].content).input;
  assert(!text.includes(entity)&&!text.includes(org)&&!text.includes("mock-goal"));
  assert.deepEqual(input.context,{synthetic:true,facts:[],memory:[]});
  if(responseMode==="auth"){
    res.writeHead(401);res.end(JSON.stringify({error:"synthetic-sensitive-sentinel-never-output"}));return;
  }
  const output:any={steps:[{capabilityId:responseMode==="tool"?"gmail_send":responseMode==="stats"?"local.statistics":"local.calculate",
    params:responseMode==="stats"?{values:input.objective.values}:
      {operation:responseMode==="intent"?"max":input.objective.operation,values:input.objective.values},priority:1}],
    assumptions:{},constraints:{},dependencies:{}};
  if(responseMode==="secret")output.assumptions.password="synthetic-sensitive-sentinel-never-output";
  res.setHeader("content-type","application/json");
  res.end(JSON.stringify({model:"deepseek-flash",
    usage:responseMode==="usage"?{}:{prompt_tokens:100,completion_tokens:70},
    choices:[{message:{content:JSON.stringify(output)}}]}));
});
async function main(){
  for(const [key,value] of [
    ["DEEPSEEK_API_KEY",""],["SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED","0"],
    ["SAM_PILOT_MAX_REQUESTS","5"],["SAM_PILOT_MAX_COST_USD","0.26"],
    ["SAM_PILOT_INPUT_USD_PER_1K","0"],["SAM_PILOT_OUTPUT_USD_PER_1K","NaN"],
    ["SAM_PILOT_EXPIRES_AT",new Date(now-1).toISOString()],
    ["SAM_PILOT_EXPIRES_AT",new Date(now+86400001).toISOString()],
    ["SAM_PILOT_PRICE_REVIEWED_AT",new Date(now-8*86400000).toISOString()],
    ["SAM_PRODUCTION_BUNDLE_MODULE","tests/release/native_bundle.ts"],
    ["SAM_RELEASE_CAPABILITIES","local.calculate,gmail_send"],["SAM_RELEASE_ENABLE_MCP","1"],
    ["NODE_ENV","development"],["REPLIT_DEV_DOMAIN","unit.invalid"],
    ["SAM_RELEASE_APPROVED","0"]
  ]){
    assert.throws(()=>syntheticPilot({...env,[key]:value},now));refused++;
  }
  const config=validateRelease(env);
  const worker=childEnvironment({...env,GOOGLE_TOKEN:"synthetic-never-inherit",SAM_PILOT_ADMIN_PASSWORD:"synthetic-never-inherit"},config,"worker");
  assert.equal(syntheticPilot(worker).runId,env.SAM_PILOT_RUN_ID);
  assert.equal(worker.DEEPSEEK_API_KEY,env.DEEPSEEK_API_KEY);
  assert(!worker.GOOGLE_TOKEN&&!worker.SAM_PILOT_ADMIN_PASSWORD);
  assert(!childEnvironment(env,config,"command-center").DEEPSEEK_API_KEY);
  assert(!childEnvironment(env,config,"mcp").DEEPSEEK_API_KEY);
  const ordinary={...env,SAM_RELEASE_SYNTHETIC_PLANNER:"0",
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/localReleaseBundleModule.ts"};
  assert(!childEnvironment(ordinary,validateRelease(ordinary),"worker").DEEPSEEK_API_KEY);
  const {assertReleaseDatabaseSafety}=await import("../../packages/db/src/releaseSafety");
  await assertReleaseDatabaseSafety({query});
  unsafeRole=true;await assert.rejects(()=>assertReleaseDatabaseSafety({query}));refused++;unsafeRole=false;
  missingRls=true;await assert.rejects(()=>assertReleaseDatabaseSafety({query}));refused++;missingRls=false;
  const {assembleContext}=await import("../../apps/brain/src/contextAssembler");
  const {authorizePilotGoal,numericObjective}=await import("../../apps/production/src/syntheticPilotScope");
  await authorizePilotGoal({query},"mock-goal");
  foreignGoal=true;await assert.rejects(()=>authorizePilotGoal({query},"mock-other"));refused++;foreignGoal=false;
  await assert.rejects(()=>assembleContext({query},"legal_entity","mock-other"));refused++;
  const assembled=await assembleContext({query},"legal_entity",entity);
  assert.deepEqual(assembled.facts,[]);assert.deepEqual(assembled.memory,[]);assert.equal(contextReads,0);
  assert.throws(()=>numericObjective('{"synthetic":true,"operation":"sum","values":[1],"company":"blocked"}'));refused++;
  await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
  const port=(server.address() as any).port;
  const {fetchJson}=await import("../../packages/model-providers/src/common");
  const {createSyntheticPilotBundle}=await import("../../apps/production/src/syntheticPilotBundleModule");
  const {loadProductionBundle}=await import("../../apps/production/src/loadBundle");
  const loaded=await loadProductionBundle(config.bundle);
  assert.equal(loaded.raw.modelAdapters?.length,1);
  assert.deepEqual(loaded.raw.capabilities.map(c=>c.capabilityId),["local.calculate","local.statistics"]);
  const bundle=createSyntheticPilotBundle(async(_url,init,timeout)=>fetchJson(`http://127.0.0.1:${port}/mock`,init,timeout));
  const {proposePlan}=await import("../../apps/brain/src/planner");
  const context={entityType:"legal_entity",entityId:entity,facts:[],memory:[]};
  const planning={goalId:"mock-goal",objective:objectiveText,context,dataClassification:"PUBLIC" as const,maxCostUsd:0.25};
  const gateway=bundle.plannerGateway!();
  providerDown=true;await assert.rejects(()=>proposePlan({...planning,gateway}),/PILOT_PROVIDER_POLICY_DENIED/);refused++;providerDown=false;
  breaker=true;await assert.rejects(()=>proposePlan({...planning,gateway}),/PILOT_PROVIDER_POLICY_DENIED/);refused++;breaker=false;
  mutableLedger=true;
  await assert.rejects(()=>proposePlan({...planning,gateway}),/PILOT_LEDGER_PRIVILEGES_DENIED/);refused++;
  mutableLedger=false;
  for(const unsafe of [
    {...context,facts:[{company:"synthetic-sensitive-sentinel-never-output"}]},
    {...context,memory:[{text:"synthetic-sensitive-sentinel-never-output"}]},
    {...context,entityId:"another-entity"},
    {...context,document:"synthetic-sensitive-sentinel-never-output"}
  ]){
    await assert.rejects(()=>proposePlan({...planning,context:unsafe,gateway}),/PILOT_INPUT_SCOPE_DENIED/);refused++;
  }
  assert.equal(httpCalls,0);assert.equal(ledger.length,0);
  await assert.rejects(()=>bundle.modelAdapters![0].invoke({task:"unapproved",capability:"planning",dataClassification:"PUBLIC",input:{}},"deepseek-flash"));refused++;
  const plan=await proposePlan({...planning,gateway});
  assert.equal(plan.steps[0].capabilityId,"local.calculate");
  assert.equal(httpCalls,1);assert.equal(ledger.length,1);assert(ledger[0].success);
  const {validateProductionBundle}=await import("../../apps/production/src/bundle");
  const valid=validateProductionBundle(bundle);
  const result=await valid.tools.adapter("local.calculate").execute({
    capabilityId:"local.calculate",params:plan.steps[0].params!,idempotencyKey:"mock-only"});
  assert.equal(result.result.value,11);
  const execution={id:"mock-execution",capabilityId:"local.calculate",params:plan.steps[0].params!,
    evidence:result.evidence,operationKeyRef:null};
  const contract={id:"mock-contract",method:"INDEPENDENT_QUERY",requiredEvidenceFields:{},independentQueryTemplate:{}};
  assert.equal((await valid.verifiers.get("local.calculate")!.verify({execution,contract})).result,"VERIFIED");
  assert.equal((await valid.verifiers.get("local.calculate")!.verify({
    execution:{...execution,evidence:{...result.evidence,resultHash:"tampered"}},contract})).result,"FAILED");
  assert.throws(()=>valid.tools.definition("gmail_send"));refused++;
  for(const mode of ["tool","secret","intent"]){
    responseMode=mode;await assert.rejects(()=>proposePlan({...planning,gateway}),error=>
      error instanceof Error&&error.message==="PILOT_MODEL_ATTEMPT_REJECTED");refused++;
  }
  assert.equal(httpCalls,4);
  assert.equal(JSON.parse(ledger[1].stage).stage,"PILOT_PLAN_SCOPE");
  assert.equal(JSON.parse(ledger[1].stage).usageKnown,true);
  assert(!JSON.stringify(ledger).includes("synthetic-sensitive-sentinel-never-output"));
  await assert.rejects(()=>proposePlan({...planning,gateway:bundle.plannerGateway!()}),/PILOT_RUN_BUDGET_EXHAUSTED/);refused++;
  assert.equal(httpCalls,4); // New gateway instance does not reset the persisted mock ledger.
  ledger.length=0;responseMode="auth";
  await assert.rejects(()=>proposePlan({...planning,gateway}),/PILOT_MODEL_ATTEMPT_REJECTED/);refused++;
  assert.equal(httpCalls,5);assert.equal(ledger.length,1);assert(ledger[0].cost>0&&!ledger[0].success);
  assert.equal(JSON.parse(ledger[0].stage).code,"PROVIDER_AUTH_REJECTED");
  assert.equal(JSON.parse(ledger[0].stage).usageKnown,false);
  responseMode="usage";
  await assert.rejects(()=>proposePlan({...planning,gateway}),/PILOT_MODEL_ATTEMPT_REJECTED/);refused++;
  // Reset only the MOCK fixture between independent cases; production has no reset.
  ledger.length=0;responseMode="stats";
  const second=await proposePlan({...planning,gateway,
    objective:JSON.stringify({synthetic:true,operation:"mean",values:[2,4,12]}),
    context:{entity:{type:"legal_entity",id:entity},facts:[],memory:[],
      replan_reason:"synthetic-sensitive-sentinel-never-output"}});
  assert.equal(second.steps[0].capabilityId,"local.statistics");
  assert(!JSON.stringify(lastRequest).includes("synthetic-sensitive-sentinel-never-output"));
  assert(JSON.stringify(lastRequest).includes("previous local proposal failed verification"));
  process.env.SAM_PILOT_MAX_COST_USD="0.001";
  const tinyBudget=createSyntheticPilotBundle();
  await assert.rejects(()=>proposePlan({...planning,gateway:tinyBudget.plannerGateway!()}),/PILOT_COST_CEILING/);refused++;
  process.env.SAM_PILOT_MAX_COST_USD="0.25";
  process.env.SAM_PILOT_EXPIRES_AT=new Date(Date.now()-1).toISOString();
  await assert.rejects(()=>proposePlan({...planning,gateway}));refused++;
  assert.equal(httpCalls,7);
  console.log(JSON.stringify({test:"SYNTHETIC_RELEASE_PILOT",status:"PASS",refusedCases:refused,
    mockHttpRequests:httpCalls,contextReads,realProviderCalls:0,migrations:0,rolesCreated:0,
    classification:"UNIT_MOCK_DB_LOCAL_HTTP_REAL_PLANNER_AND_LOCAL_EXECUTOR_NOT_LIVE_ACCEPTANCE"}));
}
main().catch(()=>{console.error("SYNTHETIC_RELEASE_PILOT FAIL; details withheld");process.exitCode=1;})
  .finally(async()=>{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));
    const {pool}=await import("../../packages/db/src/client");await pool.end();});
