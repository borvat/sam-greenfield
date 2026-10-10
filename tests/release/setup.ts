import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "node:net";
import {once} from "node:events";
import {spawn,spawnSync} from "node:child_process";
import {readFileSync,existsSync} from "node:fs";
const require=createRequire(import.meta.url);
const {setupModeEnabled,validateSetup}=require("../../scripts/release/setup.cjs");
const pause=(n:number)=>new Promise(r=>setTimeout(r,n));
async function main(){
  const env={NODE_ENV:"test",SAM_RELEASE_SETUP_MODE:"1",SAM_RELEASE_SETUP_LOCAL:"1",
    SAM_RELEASE_APPROVED:"0",PORT:"5011"};
  assert.equal(setupModeEnabled({}),false);
  assert.equal(setupModeEnabled({SAM_RELEASE_SETUP_MODE:"0"}),false);
  assert.equal(validateSetup(env).host,"127.0.0.1");
  assert.equal(validateSetup({...env,NODE_ENV:"production",SAM_RELEASE_SETUP_LOCAL:"0"}).host,"0.0.0.0");
  const invalid=[
    {SAM_RELEASE_SETUP_MODE:"true"},{SAM_RELEASE_SETUP_MODE:""},{SAM_RELEASE_SETUP_MODE:"0"},
    {SAM_RELEASE_SETUP_LOCAL:"true"},{SAM_RELEASE_APPROVED:"1"},{SAM_RELEASE_APPROVED:undefined},
    {NODE_ENV:"production"},{NODE_ENV:"development"},
    {SAM_RELEASE_SETUP_LOCAL:"0"},{PORT:"0"},{PORT:"65536"},{PORT:"1e3"},{PORT:"5011x"}
  ];
  for(const patch of invalid)assert.throws(()=>validateSetup({...env,...patch}));
  for(const patch of [{REPLIT_DEV_DOMAIN:"fixture.invalid"},{SAM_DEVELOPMENT_SAFE_MODE:"1"},{SAM_AUTONOMY_SANDBOX:"1"}]){
    assert.throws(()=>validateSetup({...env,NODE_ENV:"production",SAM_RELEASE_SETUP_LOCAL:"0",...patch}));
  }
  let connections=0;
  const tripwire=createServer(socket=>{connections++;socket.destroy();});
  tripwire.listen(0,"127.0.0.1");await once(tripwire,"listening");
  const deniedPort=(tripwire.address() as any).port;
  const allocation=createServer();allocation.listen(0,"127.0.0.1");await once(allocation,"listening");
  const port=(allocation.address() as any).port;await new Promise<void>(r=>allocation.close(()=>r()));
  const marker="synthetic-setup-sensitive-sentinel-not-a-credential";
  const child=spawn(process.execPath,["--require","./tests/release/setup_guard.cjs","scripts/release/main.cjs"],{
    env:{...process.env,...env,PORT:String(port),
      DATABASE_URL:`postgresql://fixture@127.0.0.1:${deniedPort}/unused`,
      SAM_RELEASE_DATABASE_URL:marker,SAM_COMMAND_CENTER_BEARER_TOKEN:marker,
      DEEPSEEK_API_KEY:marker,OPENAI_API_KEY:marker,GOOGLE_REFRESH_TOKEN:marker,
      SAM_PRODUCTION_BUNDLE_MODULE:"must-not-load",SAM_RELEASE_CAPABILITIES:"finance,gmail_send"},
    stdio:["ignore","pipe","pipe"]
  });
  let output="";child.stdout.on("data",x=>output+=x);child.stderr.on("data",x=>output+=x);
  const exit=once(child,"exit");
  try{
    const base=`http://127.0.0.1:${port}`;
    let started=false;
    for(let i=0;i<100;i++){
      try{if((await fetch(base+"/livez")).status===200){started=true;break;}}catch{}
      if(child.exitCode!==null)break;await pause(20);
    }
    assert(started,"Setup native process did not start");
    const home=await fetch(base+"/");assert.equal(home.status,200);
    assert.match(await home.text(),/سام غير مفعّل/);
    assert.match(home.headers.get("content-security-policy")!,/default-src 'none'/);
    const live=await(await fetch(base+"/livez")).json() as any;
    assert.equal(live.ready,false);assert.equal(live.executiveActivationAuthorized,false);
    assert.equal(live.billingCapEnforced,false);
    for(const key of ["executiveWorker","businessApi","models","externalOperations"])assert.equal(live[key],"DISABLED");
    assert.equal(live.database,"NOT_CONNECTED");
    assert.equal((await fetch(base+"/readyz")).status,503);
    assert.equal(await(await fetch(base+"/livez",{method:"HEAD"})).text(),"");
    for(const method of ["POST","PUT","PATCH","DELETE","OPTIONS"]){
      assert.equal((await fetch(base+"/",{method,body:marker})).status,405);
    }
    for(const path of ["/api/goals","/api/overview","/mcp","/_sam/status","/memory","/users",
      "/livez?secret="+marker,"/"+marker,"/api%2Fgoals"]){
      const response=await fetch(base+path,{headers:{authorization:"Bearer "+marker}});
      assert.equal(response.status,404);assert(!(await response.text()).includes(marker));
    }
    const childList=`/proc/${child.pid}/task/${child.pid}/children`;
    if(existsSync(childList))assert.equal(readFileSync(childList,"utf8").trim(),"");
    assert.equal(connections,0);
    assert(!output.includes(marker));assert(!output.includes("ATTEMPT"));
    child.kill("SIGTERM");const [code]=await exit;assert.equal(code,0);
    await assert.rejects(fetch(base+"/livez"));
  }finally{
    if(child.exitCode===null){child.kill("SIGKILL");await exit;}
    await new Promise<void>(r=>tripwire.close(()=>r()));
  }
  const normal=spawnSync(process.execPath,["scripts/release/main.cjs","--validate-only"],{
    env:{NODE_ENV:"production",SAM_RELEASE_APPROVED:"0",SAM_RELEASE_SETUP_MODE:"0"},encoding:"utf8"});
  assert.equal(normal.status,1);assert.match(normal.stderr,/RELEASE_OWNER_APPROVAL_REQUIRED/);
  const approvedFixture={
    NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
    DATABASE_URL:"postgresql://sam_app@database.invalid/release?sslmode=verify-full",
    SAM_DB_APP_ROLE:"sam_app",SAM_DB_SCHEMA:"sam",
    SAM_RELEASE_ORG_ID:"11111111-1111-1111-1111-111111111111",
    SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:"22222222-2222-2222-2222-222222222222",
    SAM_COMMAND_CENTER_BEARER_TOKEN:"synthetic-normal-contract-not-a-credential",
    SAM_COMMAND_CENTER_ALLOWED_HOSTS:"example.invalid",
    SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://example.invalid",
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/localReleaseBundleModule.ts",
    SAM_RELEASE_CAPABILITIES:"local.calculate"
  };
  for(const patch of [{},{SAM_RELEASE_SETUP_MODE:"0",SAM_RELEASE_SETUP_LOCAL:"0"}]){
    const ordinary=spawnSync(process.execPath,["scripts/release/main.cjs","--validate-only"],{
      env:{...approvedFixture,...patch},encoding:"utf8"});
    assert.equal(ordinary.status,0);assert.match(ordinary.stdout,/RELEASE_CONFIG_CONTRACT PASS/);
    assert(!ordinary.stdout.includes("SETUP_CONTRACT"));
  }
  const checkOnly=spawnSync(process.execPath,["--require","./tests/release/setup_guard.cjs",
    "scripts/release/main.cjs","--validate-only"],{env,encoding:"utf8"});
  assert.equal(checkOnly.status,0);assert(!checkOnly.stdout.includes("LISTENING"));
  console.log("SETUP_MODE PASS: 16 configuration refusals; native loopback HTTP, denied business routes/methods, no forbidden modules, outbound or child calls, zero DB-tripwire connections, withheld sentinels, SIGTERM stop; ordinary release remains blocked. Classification=LOCAL_REAL_SETUP_PROCESS_NOT_PUBLISHED_ACCEPTANCE.");
}
main().catch(()=>{console.error("SETUP_MODE FAIL (details withheld)");process.exitCode=1;});
