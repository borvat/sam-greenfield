import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "node:net";
import {once} from "node:events";
import {spawn,spawnSync} from "node:child_process";
import {readFileSync,existsSync} from "node:fs";
const require=createRequire(import.meta.url);
const {setupModeEnabled,validateSetup,startSetup}=require("../../scripts/release/setup.cjs");
const pause=(n:number)=>new Promise(r=>setTimeout(r,n));
async function main(){
  const env={NODE_ENV:"test",SAM_RELEASE_SETUP_MODE:"1",SAM_RELEASE_SETUP_LOCAL:"1",
    SAM_RELEASE_APPROVED:"0",PORT:"5011"};
  assert.equal(setupModeEnabled({}),false);
  assert.equal(setupModeEnabled({SAM_RELEASE_SETUP_MODE:"0"}),false);
  assert.equal(validateSetup(env).host,"127.0.0.1");
  const production={...env,NODE_ENV:"production",SAM_RELEASE_SETUP_LOCAL:"0",
    REPLIT_DEPLOYMENT:"1",REPLIT_DEV_DOMAIN:"synthetic-fixture.replit.dev"};
  assert.equal(validateSetup(production).host,"0.0.0.0");
  let configurationRefusals=0;
  const invalid=[
    {SAM_RELEASE_SETUP_MODE:"true"},{SAM_RELEASE_SETUP_MODE:""},{SAM_RELEASE_SETUP_MODE:"0"},
    {SAM_RELEASE_SETUP_LOCAL:"true"},{SAM_RELEASE_APPROVED:"1"},{SAM_RELEASE_APPROVED:undefined},
    {NODE_ENV:"production"},{NODE_ENV:"development"},
    {SAM_RELEASE_SETUP_LOCAL:"0"},{PORT:"0"},{PORT:"65536"},{PORT:"1e3"},{PORT:"5011x"}
  ];
  for(const patch of invalid){
    assert.throws(()=>validateSetup({...env,...patch}));configurationRefusals++;
  }
  for(const patch of [
    {REPLIT_DEPLOYMENT:undefined},{REPLIT_DEPLOYMENT:"0"},{REPLIT_DEPLOYMENT:""},
    {REPLIT_DEPLOYMENT:"true"},{REPLIT_DEPLOYMENT:1},
    {NODE_ENV:"development"},{NODE_ENV:"test"},{NODE_ENV:undefined},
    {SAM_DEVELOPMENT_SAFE_MODE:"1"},{SAM_DEVELOPMENT_SAFE_MODE:"true"},
    {SAM_AUTONOMY_SANDBOX:"1"},{SAM_AUTONOMY_SANDBOX:"true"},
    {SAM_RELEASE_SETUP_LOCAL:"1"},{SAM_RELEASE_APPROVED:"1"}
  ]){
    assert.throws(()=>validateSetup({...production,...patch}));configurationRefusals++;
  }
  assert.throws(()=>validateSetup({...env,REPLIT_DEPLOYMENT:"1"}));configurationRefusals++;
  let connections=0;
  const tripwire=createServer(socket=>{connections++;socket.destroy();});
  tripwire.listen(0,"127.0.0.1");await once(tripwire,"listening");
  const deniedPort=(tripwire.address() as any).port;
  const allocation=createServer();allocation.listen(0,"127.0.0.1");await once(allocation,"listening");
  const port=(allocation.address() as any).port;await new Promise<void>(r=>allocation.close(()=>r()));
  const marker="synthetic-setup-sensitive-sentinel-not-a-credential";
  const resource="https://sam.fixture.example/mcp",issuer="https://sam-fixture.eu.auth0.com/";
  for(const patch of [
    {SAM_MCP_OAUTH_RESOURCE:"http://sam.fixture.example/mcp"},
    {SAM_MCP_OAUTH_RESOURCE:resource+"?token="+marker},
    {SAM_MCP_OAUTH_RESOURCE:"https://sam.fixture.example/"},
    {SAM_MCP_OAUTH_RESOURCE:"https://sam.fixture.example/\nmcp"},
    {SAM_MCP_OAUTH_ISSUER:"https://sam.fixture.example/"},
    {SAM_MCP_OAUTH_ISSUER:"https://sam-fixture.eu.auth0.com/authorize"},
    {SAM_MCP_OAUTH_ISSUER:"https://user:password@sam-fixture.eu.auth0.com/"},
    {SAM_MCP_OAUTH_ISSUER:""}
  ]){
    assert.throws(()=>validateSetup({...env,SAM_MCP_OAUTH_RESOURCE:resource,SAM_MCP_OAUTH_ISSUER:issuer,...patch}),
      /RELEASE_SETUP_OAUTH_DISCOVERY_INVALID/);configurationRefusals++;
  }
  assert.equal(validateSetup({...env,SAM_MCP_OAUTH_RESOURCE:resource}).oauthDiscovery,null);
  const child=spawn(process.execPath,["--require","./tests/release/setup_guard.cjs","scripts/release/main.cjs"],{
    env:{PATH:process.env.PATH,...production,PORT:String(port),
      SAM_MCP_OAUTH_RESOURCE:resource,SAM_MCP_OAUTH_ISSUER:issuer,
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
    for(const path of ["/api/goals","/api/overview","/_sam/status","/memory","/users",
      "/livez?secret="+marker,"/"+marker,"/api%2Fgoals"]){
      const response=await fetch(base+path,{headers:{authorization:"Bearer "+marker}});
      assert.equal(response.status,404);assert(!(await response.text()).includes(marker));
    }
    for(const path of ["/.well-known/oauth-protected-resource","/.well-known/oauth-protected-resource/mcp"]){
      const response=await fetch(base+path,{headers:{host:"attacker.example"}});
      assert.equal(response.status,200);
      const metadata=await response.json() as any;
      assert.equal(metadata.resource,resource);
      assert.deepEqual(metadata.authorization_servers,[issuer]);
      assert.deepEqual(metadata.scopes_supported,["sam:synthetic:read","sam:synthetic:submit"]);
      assert.deepEqual(metadata.bearer_methods_supported,["header"]);
      assert.equal((await fetch(base+path,{method:"HEAD"})).status,200);
      assert.equal((await fetch(base+path,{method:"POST",body:marker})).status,405);
    }
    for(const method of ["GET","HEAD","POST","DELETE","PUT","OPTIONS"]){
      const response=await fetch(base+"/mcp",{method,headers:{authorization:"Bearer "+marker},
        ...(method==="POST"?{body:JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list"})}:{})});
      assert.equal(response.status,401);
      assert.equal(response.headers.get("www-authenticate"),
        `Bearer resource_metadata="https://sam.fixture.example/.well-known/oauth-protected-resource/mcp", scope="sam:synthetic:read sam:synthetic:submit"`);
      assert(!(await response.text()).includes(marker));
    }
    assert.equal((await fetch(base+"/.well-known/oauth-authorization-server")).status,404);
    assert.equal((await fetch(base+"/.well-known/openid-configuration")).status,404);
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
  const incomplete=startSetup(validateSetup({...env,PORT:String(port),SAM_MCP_OAUTH_RESOURCE:resource}));
  await incomplete.ready;
  try{
    for(const path of ["/mcp","/.well-known/oauth-protected-resource","/.well-known/oauth-protected-resource/mcp"]){
      const response=await fetch(`http://127.0.0.1:${port}`+path);
      assert.equal(response.status,503);
      assert.equal((await response.json() as any).error,"OAUTH_DISCOVERY_NOT_CONFIGURED");
      assert.equal(response.headers.get("www-authenticate"),null);
    }
  }finally{await incomplete.stop();}
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
  console.log(`SETUP_MODE PASS: ${configurationRefusals} configuration refusals; published-context fixture accepts dev-domain metadata only with deployment marker1; two RFC9728 metadata routes; six protected MCP method challenges; missing issuer503; no fake AS; native HTTP, no forbidden modules/outbound/children; zero DB-tripwire connections; sentinels withheld; readiness503/SIGTERM; ordinary release unchanged. Classification=LOCAL_REAL_SETUP_PROCESS_NOT_PUBLISHED_ACCEPTANCE.`);
}
main().catch(()=>{console.error("SETUP_MODE FAIL (details withheld)");process.exitCode=1;});
