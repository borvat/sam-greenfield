import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "node:net";
import {once} from "node:events";
import {createReleaseReadSurface} from "../../apps/mcp/src/releaseReadSurface";
import {checkGoalAcceptance,encodeGoalAcceptance} from "../../apps/kernel/src/goalAcceptance";
const require=createRequire(import.meta.url);
const {validateRelease,childEnvironment}=require("../../scripts/release/contract.cjs");
const {startSupervisor}=require("../../scripts/release/supervisor.cjs");
const wait=(n:number)=>new Promise(r=>setTimeout(r,n));
async function freePort(){
  const server=createServer();server.listen(0,"127.0.0.1");await once(server,"listening");
  const port=(server.address() as any).port;await new Promise<void>(r=>server.close(()=>r()));return port;
}
async function main(){
  const token="unit-fixture-bearer-not-a-real-secret";
  const env={
    NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
    DATABASE_URL:"postgresql://sam_app@database.invalid/release?sslmode=verify-full",
    SAM_DB_APP_ROLE:"sam_app",SAM_DB_SCHEMA:"sam",SAM_RELEASE_ORG_ID:"11111111-1111-1111-1111-111111111111",
    SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:"22222222-2222-2222-2222-222222222222",
    SAM_COMMAND_CENTER_BEARER_TOKEN:token,SAM_COMMAND_CENTER_ALLOWED_HOSTS:"example.invalid",
    SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://example.invalid",
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/defaultBundleModule.ts",
    SAM_RELEASE_CAPABILITIES:"local.calculate"
  };
  const config=validateRelease(env);
  for(const suffix of ["?sslmode=require","?sslmode=no-verify","?sslmode=verify-ca",
    "?sslmode=verify-full&sslmode=no-verify","?sslmode=verify-full&ssl=false",
    "?sslmode=verify-full&user=postgres","?sslmode=verify-full&host=other.invalid"]){
    assert.throws(()=>validateRelease({...env,DATABASE_URL:"postgresql://sam_app@database.invalid/release"+suffix}));
  }
  assert.throws(()=>validateRelease({...env,NODE_TLS_REJECT_UNAUTHORIZED:"0"}));
  assert.throws(()=>validateRelease({...env,DATABASE_URL:"postgresql://sam_app@127.0.0.1/release?sslmode=verify-full"}),/RELEASE_DATABASE_TLS_DNS_HOST_REQUIRED/);
  for(const mode of ["transaction","session","unknown"])
    assert.throws(()=>validateRelease({...env,SAM_DB_CONNECTION_MODE:mode}),/RELEASE_DATABASE_POOLING_FORBIDDEN/);
  assert.equal(new URL(validateRelease({...env,SAM_DB_CONNECTION_MODE:"direct"}).databaseUrl).hostname,"database.invalid");
  const appOverride=validateRelease({...env,
    DATABASE_URL:"postgresql://postgres@managed.invalid/managed?sslmode=verify-full",
    SAM_RELEASE_DATABASE_URL:env.DATABASE_URL});
  assert.equal(new URL(appOverride.databaseUrl).username,"sam_app");
  assert.equal(new URL(appOverride.databaseUrl).hostname,"database.invalid");
  for(const bad of ["","not-a-url","postgresql://postgres@database.invalid/release?sslmode=verify-full",
    "postgresql://sam_app@database.invalid/release"]){
    assert.throws(()=>validateRelease({...env,SAM_RELEASE_DATABASE_URL:bad}));
  }
  assert(!Object.hasOwn(childEnvironment({...env,SAM_RELEASE_DATABASE_URL:env.DATABASE_URL},appOverride,"worker"),
    "SAM_RELEASE_DATABASE_URL"));
  assert.equal(config.leaseMaxAttempts,3);
  for(const bad of ["0","21","not-a-number","2.5"])
    assert.throws(()=>validateRelease({...env,SAM_WORK_LEASE_MAX_ATTEMPTS:bad}));
  for(const patch of [
    {SAM_RELEASE_APPROVED:"0"},{REPLIT_DEV_DOMAIN:"editor.invalid"},{SAM_DB_APP_ROLE:"postgres"},
    {DATABASE_URL:"postgresql://privileged_owner@database.invalid/release?sslmode=verify-full"},
    {SAM_DB_SCHEMA:"sam_replit_dev"},{SAM_COMMAND_CENTER_ALLOWED_HOSTS:"*"},
    {SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"http://example.invalid"},
    {SAM_PRODUCTION_BUNDLE_MODULE:"../../outside.ts"},{SAM_RELEASE_CAPABILITIES:"gmail_send"},
    {SAM_RELEASE_ENABLE_MCP:"1"},{DATABASE_URL:"postgresql://fixture@database.invalid/release"}
  ])assert.throws(()=>validateRelease({...env,...patch}));
  const child=childEnvironment({...env,DEEPSEEK_API_KEY:"fixture-only",GOOGLE_REFRESH_TOKEN:"fixture-only"},config,"worker");
  assert(!("DEEPSEEK_API_KEY" in child));assert(!("GOOGLE_REFRESH_TOKEN" in child));
  assert.match(child.DATABASE_URL,/role%3Dsam_app/);
  assert.equal(child.SAM_RUNTIME_HOST,"127.0.0.1");assert.equal(child.SAM_REQUIRE_GOAL_ACCEPTANCE,"1");
  const mcp=childEnvironment(env,config,"mcp");
  assert.equal(mcp.SAM_MCP_RELEASE_READ_ONLY,"1");assert(!("SAM_PRODUCTION_BUNDLE_MODULE" in mcp));
  const contract=encodeGoalAcceptance({version:1,constraints:[{
    capabilityId:"local.calculate",params:{operation:"max"},result:{field:"value",equals:8}}]});
  assert.equal(checkGoalAcceptance(contract,[{capability_id:"local.calculate",params:{operation:"mean"},result:{value:5}}]).reason,"GOAL_INTENT_MISMATCH");
  assert.equal(checkGoalAcceptance(contract,[{capability_id:"local.calculate",params:{operation:"max"},result:{value:8}}]).passed,true);
  assert.equal(checkGoalAcceptance("sam.acceptance/v1:broken",[]).reason,"GOAL_CONTRACT_INVALID");
  assert.throws(()=>encodeGoalAcceptance({version:1,constraints:[{capabilityId:"x",params:{},result:{field:"constructor",equals:1}}]}));
  const surface=createReleaseReadSurface();
  assert.deepEqual(surface.definitions().map(d=>d.name),["sam_release_test_results","sam_service_status"]);
  const ctx={actor:"unit-release",systemOwner:true};
  for(const name of ["create_goal","memory","users","drive_read","gmail_send"]){
    assert.equal((await surface.invoke(name,{},ctx)).ok,false);
  }
  assert.equal((await surface.invoke("sam_service_status",{file:"unapproved"},ctx)).ok,false);
  const workerPort=await freePort(),commandPort=await freePort();
  const logs:string[]=[];const original=console.log;console.log=(...x)=>{logs.push(x.join(" "));};
  let supervisor:any;
  try{
    supervisor=startSupervisor({...config,port:0,workerPort,commandPort,shutdownMs:200,restartLimit:1},env,
      [["worker",workerPort],["command-center",commandPort]].map(([name,port])=>({
        name,command:process.execPath,args:["tests/release/service_child.cjs",String(port)],env:{FIXTURE_BEARER:token}
      })));
    await supervisor.ready;
    const base=`http://127.0.0.1:${supervisor.server.address().port}`;
    for(let i=0;i<50;i++){if((await fetch(base+"/readyz")).status===200)break;await wait(20);}
    assert.equal((await fetch(base+"/readyz")).status,200);
    assert.equal((await fetch(base+"/")).status,401);
    assert.equal((await fetch(base+"/_sam/status")).status,401);
    assert.equal((await fetch(base+"/api/overview",{headers:{authorization:"Bearer "+token}})).status,200);
    assert.equal((await fetch(base+"/mcp")).status,404);
    const old=supervisor.state.get("worker").child.pid;
    supervisor.state.get("worker").child.kill("SIGKILL");
    for(let i=0;i<100;i++){
      await wait(20);const s=supervisor.state.get("worker");
      if(s.child?.pid!==old&&(await fetch(base+"/readyz")).status===200)break;
    }
    assert.equal(supervisor.state.get("worker").restarts,1);
    assert.notEqual(supervisor.state.get("worker").child.pid,old);
    const status=await (await fetch(base+"/_sam/status",{headers:{authorization:"Bearer "+token}})).json() as any;
    assert.equal(status.cost.status,"EXTERNAL_MODEL_DISABLED");
    assert(!JSON.stringify(status).includes(token));
    supervisor.state.get("worker").child.kill("SIGKILL");await wait(120);
    assert.equal(supervisor.state.get("worker").exhausted,true);
    assert.equal((await fetch(base+"/readyz")).status,503);
    assert.equal((await supervisor.stop()).graceful,true);
    assert(!logs.join("\n").includes("fixture-sensitive-output-must-be-withheld"));
    assert(!logs.join("\n").includes(token));
  }finally{
    if(supervisor)await supervisor.stop();console.log=original;
  }
  console.log("RELEASE_CONTRACTS PASS: config/refusal, credential stripping, owner criteria, read-only MCP, one-port proxy, bounded real-child restart, graceful stop, output withholding. Classification=LOCAL_PROCESS_WITH_FIXTURE_BACKENDS.");
}
main().catch(()=>{console.error("RELEASE_CONTRACTS FAIL (details withheld)");process.exitCode=1;});
