import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {fork} from "node:child_process";
import {createServer} from "node:net";
import {once} from "node:events";
import {writeFileSync} from "node:fs";
import {randomUUID} from "node:crypto";
const require=createRequire(import.meta.url);
const {setupAutonomy}=require("../../scripts/development/setup.cjs");
const {databaseClient,developmentEnvironment,assertDevelopmentIdentity}=require("../../scripts/development/environment.cjs");
const wait=(n:number)=>new Promise(r=>setTimeout(r,n));
async function main(){
  const config=await setupAutonomy(true),admin=databaseClient(developmentEnvironment(config.schema));await admin.connect();
  let pool:any,crashed:any,service:any,broken:any;
  let envelope:any;
  const proofs:string[]=[];
  try{
    await assertDevelopmentIdentity(admin);
    const env=developmentEnvironment(config.schema),url=new URL(env.DATABASE_URL);
    url.searchParams.set("options",`${env.PGOPTIONS} -c role=${config.role} -c app.current_org_id=${config.orgId} -c app.current_legal_entity_id=${config.legalEntityId}`);
    Object.assign(process.env,{DATABASE_URL:url.toString(),SAM_DEVELOPMENT_SAFE_MODE:"1",NODE_ENV:"development",
      SAM_AUTONOMY_SANDBOX:"1",SAM_AUTONOMY_TEST_SESSION:"1",SAM_DEV_LEGAL_ENTITY_ID:config.legalEntityId});
    ({pool}=await import("../../packages/db/src/client"));
    const {encodeGoalAcceptance}=await import("../../apps/kernel/src/goalAcceptance");
    const {localCapabilityBundle}=await import("../../apps/development/src/localCapabilities");
    const {createToolExecutors}=await import("../../apps/tools/src/executorFactory");
    const {runCatalogSpecialistTick}=await import("../../apps/agents/src/executiveFlow");
    const {persistPlanAndDelegateAtomic}=await import("../../apps/kernel/src/planning");
    const {verifyNextExecution}=await import("../../apps/production/src/verifier");
    const {learnNextVerifiedExecution}=await import("../../apps/production/src/learning");
    const {recoverKernelAfterRestart}=await import("../../apps/kernel/src/recovery");
    const {recordExecutionAndRequestVerificationAtomic}=await import("../../apps/kernel/src/execution");
    const bundle=localCapabilityBundle({providerId:"deepseek",async invoke(){throw new Error("UNIT_MODEL_DISABLED");}} as any);
    const criteria=encodeGoalAcceptance({version:1,constraints:[{
      capabilityId:"local.calculate",params:{operation:"max"},result:{field:"value",equals:8}}]});
    async function goal(){
      return (await admin.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling,completion_definition)
        VALUES($1,$2,'development_probe','UNIT: maximum of 2 and 8','PLANNING','GREEN',$3) RETURNING id`,
        ["UNIT-RELEASE-"+randomUUID(),config.legalEntityId,criteria])).rows[0].id;
    }
    const executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
    const bad=await goal();
    await persistPlanAndDelegateAtomic({goalId:bad,steps:[{capabilityId:"local.calculate",params:{operation:"mean",values:[2,8]}}]});
    await runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:"unit-wrong-intent",ttlSeconds:10,executors});
    await verifyNextExecution(bundle);
    const wrong=(await admin.query(`SELECT g.state,e.result,v.result verified FROM goals g JOIN executions e ON e.goal_id=g.id
      JOIN verifications v ON v.execution_id=e.id WHERE g.id=$1`,[bad])).rows[0];
    assert.equal(wrong.result.value,5);assert.equal(wrong.verified,"VERIFIED");
    assert.equal(wrong.state,"REPLANNING");assert.equal((await learnNextVerifiedExecution(bundle)).processed,false);
    proofs.push("real PostgreSQL: independently correct mean=5 rejected for owner max=8 intent; not completed or learned");
    const good=await goal();
    const plan=await persistPlanAndDelegateAtomic({goalId:good,steps:[{capabilityId:"local.calculate",params:{operation:"max",values:[2,8]}}]});
    const childEnv={...env,...process.env};
    for(const k of Object.keys(childEnv)){
      if(/KEY|SECRET|TOKEN|OAUTH|GOOGLE|GITHUB|REPLIT_CONNECTORS/i.test(k))delete childEnv[k];
    }
    crashed=fork("tests/development/act_crash_child.ts",[],{
      execArgv:["--import","tsx"],env:childEnv,stdio:["ignore","ignore","ignore","ipc"]
    });
    const message=await new Promise<any>((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error("ACT_CHILD_TIMEOUT")),10000);
      crashed.once("message",(m:any)=>{clearTimeout(timer);resolve(m);});
      crashed.once("exit",()=>{clearTimeout(timer);reject(new Error("ACT_CHILD_EARLY_EXIT"));});
    });
    assert.equal(message.event,"ACT_ARTIFACT_COMMITTED");assert.equal(message.queueId,plan.queueIds[0]);
    assert.equal((await admin.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[good])).rows[0].n,0);
    const exited=once(crashed,"exit");crashed.kill("SIGKILL");await exited;crashed=null;
    await wait(1300);const recovery=await recoverKernelAfterRestart();
    assert(recovery.expiredLeases.includes(plan.queueIds[0]));
    await runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:"unit-act-resumed",ttlSeconds:10,executors});
    await assert.rejects(()=>recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[0],
      fencingToken:message.token,actor:"unit-stale-worker",result:{value:8},evidence:{stale:true}}));
    await verifyNextExecution(bundle);await learnNextVerifiedExecution(bundle);
    const state=(await admin.query("SELECT state FROM goals WHERE id=$1",[good])).rows[0].state;
    assert.equal(state,"COMPLETED");
    for(const table of ["executions","local_artifacts"]){
      assert.equal((await admin.query(`SELECT count(*)::int n FROM ${table} WHERE goal_id=$1`,[good])).rows[0].n,1);
    }
    assert.equal((await admin.query(`SELECT count(*)::int n FROM verifications v JOIN executions e ON e.id=v.execution_id
      WHERE e.goal_id=$1 AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash`,[good])).rows[0].n,1);
    const role=(await pool.query("SELECT (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user) bypass")).rows[0];
    assert.equal(role.bypass,false);
    proofs.push("actual process SIGKILL during ACT after artifact commit before execution commit; real lease expiry, native recovery/delegation, stale fence denied; one artifact/execution; independent hashes and completion");
    const {startRuntimeService}=await import("../../apps/runtime/src/service");
    const {Pool}=require("pg");
    // Actual loopback PostgreSQL transport refusal, not a mocked query result.
    const unused=createServer();unused.listen(0,"127.0.0.1");await once(unused,"listening");
    const unusedPort=(unused.address() as any).port;await new Promise<void>(r=>unused.close(()=>r()));
    broken=new Pool({host:"127.0.0.1",port:unusedPort,database:"unit_unavailable",connectionTimeoutMillis:100});
    let outage=false,ticks=0;
    service=await startRuntimeService({port:0,host:"127.0.0.1",tickIntervalMs:20,
      dependencyProbe:()=>outage?broken.query("SELECT 1"):pool.query("SELECT 1"),
      composition:{supervisorOptions:{monitorSideEffects:false},async runWorkTick(){ticks++;}}});
    const base=`http://127.0.0.1:${service.server.address().port}`;
    outage=true;
    for(let i=0;i<60;i++){if((await fetch(base+"/readyz")).status===503)break;await wait(20);}
    assert.equal((await fetch(base+"/readyz")).status,503);
    const paused=ticks;await wait(80);assert.equal(ticks,paused);
    assert.equal((await fetch(base+"/livez")).status,200);
    assert.equal((await fetch(base+"/statusz")).status,401);
    outage=false;
    for(let i=0;i<60;i++){if((await fetch(base+"/readyz")).status===200)break;await wait(20);}
    assert.equal((await fetch(base+"/readyz")).status,200);await wait(60);assert(ticks>paused);
    await service.stop();service=null;await broken.end();broken=null;
    // Local production-mode native services under a disposable non-bypass role.
    // Call the same supervisor factory, NOT the publication approval gate.
    // No approval flag/environment is changed; this is not a production target.
    const {childEnvironment}=require("../../scripts/release/contract.cjs");
    const {startSupervisor}=require("../../scripts/release/supervisor.cjs");
    const {servicePorts}=require("../../scripts/release/ports.cjs");
    const path=require("node:path");
    const fixtureToken="unit-native-envelope-not-real-secret";
    // Only this disposable test role becomes LOGIN; no production credential or
    // existing development role is created/changed. Known fixture, dropped below.
    assert(/^[a-z_][a-z0-9_]{0,62}$/.test(config.role));
    assert(config.schema.startsWith("sam_replit_test_"));
    const adminUrl=new URL(url);adminUrl.searchParams.delete("options");
    const loginSetup=new Pool({connectionString:adminUrl.toString()});
    try{await loginSetup.query(`ALTER ROLE "${config.role}" LOGIN PASSWORD 'unit-only-disposable-database-fixture'`);}
    finally{await loginSetup.end();}
    const appUrl=new URL(url);appUrl.username=config.role;appUrl.password="unit-only-disposable-database-fixture";
    const releaseConfig={root:process.cwd(),databaseUrl:appUrl.toString(),
      bundle:path.join(process.cwd(),"apps/production/src/localReleaseBundleModule.ts"),
      capabilities:["local.calculate","local.statistics"],port:0,...await servicePorts(),
      shutdownMs:1000,restartLimit:1,enableMcp:true};
    const releaseEnv={SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:config.legalEntityId,
      SAM_COMMAND_CENTER_BEARER_TOKEN:fixtureToken,SAM_MCP_BEARER_TOKEN:"unit-native-mcp-different-fake-secret",
      SAM_COMMAND_CENTER_ALLOWED_HOSTS:"127.0.0.1",SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://127.0.0.1",PATH:process.env.PATH};
    const profile=process.argv.includes("--profile")?require("../release/profile.cjs"):null;
    const profileBefore=profile?.snapshot([process.pid]);
    envelope=startSupervisor(releaseConfig,releaseEnv,
      [["worker","apps/runtime/src/main.ts"],["command-center","apps/command-center/src/main.ts"],["mcp","apps/mcp/src/main.ts"]]
      .map(([name,file])=>({name,command:process.execPath,args:["--import","tsx",file],
        env:childEnvironment(releaseEnv,releaseConfig,name)})));
    await envelope.ready;
    const releaseBase=`http://127.0.0.1:${envelope.server.address().port}`;
    for(let i=0;i<150;i++){if((await fetch(releaseBase+"/readyz")).status===200)break;await wait(40);}
    assert.equal((await fetch(releaseBase+"/readyz")).status,200);
    for(let i=0;i<100;i++){
      try{if((await fetch(releaseBase+"/livez")).status===200&&
        (await fetch(releaseBase+"/api/goals",{headers:{authorization:"Bearer "+fixtureToken}})).status===200)break;}catch{}
      await wait(40);
    }
    assert.equal((await fetch(releaseBase+"/api/goals")).status,401);
    assert.equal((await fetch(releaseBase+"/api/goals",{headers:{authorization:"Bearer "+fixtureToken}})).status,200);
    const page=await (await fetch(releaseBase+"/",{headers:{authorization:"Bearer "+fixtureToken}})).text();
    assert(page.includes('id="acceptance"'));
    assert(!page.includes(fixtureToken));
    await wait(1100);
    const monitor=await (await fetch(releaseBase+"/_sam/status",{headers:{authorization:"Bearer "+fixtureToken}})).json() as any;
    console.log("LOCAL_NATIVE_MONITOR "+JSON.stringify(monitor));
    assert(monitor.worker.ticks>0);assert.equal(monitor.worker.errors,0);
    assert.equal(monitor.components.length,3);assert(monitor.components.every((c:any)=>c.running));
    assert.equal(monitor.cost.authorizedBudgetUsd,0);
    assert(!JSON.stringify(monitor).includes(config.legalEntityId));
    if(profile){
      const receipt=await profile.measureIdle({supervisor:envelope,base:releaseBase,token:fixtureToken,before:profileBefore});
      assert.equal((await admin.query("SELECT count(*)::int n FROM autonomy_model_claims")).rows[0].n,0);
      writeFileSync(".local/sam-dev/release-profile.json",JSON.stringify(receipt,null,2));
      console.log("LOCAL_RELEASE_PROFILE PASS "+JSON.stringify(receipt));
    }
    assert.equal((await envelope.stop()).graceful,true);envelope=null;
    proofs.push("single exposed local envelope with three actual native production-mode service processes; PostgreSQL non-owner/non-bypass RLS preflight, authenticated goals/UI HTML, protected tick/error status, no model keys, graceful stop; not published or visual-browser proof");
    proofs.push("real local connection-refused dependency probe: readiness 503 and ACT paused; PostgreSQL recovery restores readiness/ticks; private status denies anonymous access");
    assert.equal((await admin.query("SELECT count(*)::int n FROM autonomy_model_claims")).rows[0].n,0);
    const proof={status:"PASS",checkedAt:new Date().toISOString(),classification:"LOCAL_REAL_PROCESS_AND_POSTGRES_WITH_OWNER_PLAN_FIXTURE",
      externalModelCalls:0,productionChanges:0,proofs};
    writeFileSync(".local/sam-dev/release-native-faults.json",JSON.stringify(proof,null,2));
    console.log("RELEASE_NATIVE_FAULTS PASS "+JSON.stringify(proof));
  }finally{
    if(envelope)await envelope.stop();
    if(crashed){crashed.kill("SIGKILL");await once(crashed,"exit").catch(()=>{});}
    if(service)await service.stop();if(broken)await broken.end();if(pool)await pool.end();
    await admin.query(`DROP SCHEMA ${config.schema} CASCADE; DROP ROLE ${config.role}`);await admin.end();
  }
}
main().catch(error=>{
  const code=/^[A-Z0-9_]+$/.test(String(error.code))?error.code:"WITHHELD";
  const frames=String(error.stack??"").split("\n").filter(x=>x.trim().startsWith("at ")).slice(0,4);
  console.error("RELEASE_NATIVE_FAULTS FAIL "+JSON.stringify({code,frames}));process.exitCode=1;
});
