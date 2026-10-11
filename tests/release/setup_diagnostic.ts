import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "node:net";
import {once} from "node:events";
import {spawn} from "node:child_process";
import {request} from "node:http";
const require=createRequire(import.meta.url);
const {validateSetup,setupModeEnabled}=require("../../scripts/release/setup.cjs");
async function main(){
const resource="https://diagnostic-fixture.example/mcp";
const env={NODE_ENV:"production",REPLIT_DEPLOYMENT:"1",REPLIT_DEV_DOMAIN:"fixture.replit.dev",
  SAM_RELEASE_SETUP_MODE:"1",SAM_RELEASE_SETUP_LOCAL:"0",SAM_RELEASE_APPROVED:"0",
  SAM_RELEASE_SETUP_DIAGNOSTIC_MCP:"1",SAM_MCP_OAUTH_RESOURCE:resource};
assert.equal(validateSetup({...env,SAM_RELEASE_SETUP_DIAGNOSTIC_MCP:undefined}).diagnosticMcp,false);
assert.equal(validateSetup({...env,SAM_RELEASE_SETUP_DIAGNOSTIC_MCP:"0"}).diagnosticMcp,false);
for(const patch of [{SAM_RELEASE_SETUP_DIAGNOSTIC_MCP:"true"},{SAM_RELEASE_SETUP_MODE:"0"},
  {SAM_RELEASE_APPROVED:"1"},{REPLIT_DEPLOYMENT:undefined},{NODE_ENV:"development"},
  {SAM_MCP_OAUTH_RESOURCE:undefined},{SAM_MCP_OAUTH_RESOURCE:"http://fixture.example/mcp"}])
  assert.throws(()=>validateSetup({...env,...patch}));
assert.throws(()=>setupModeEnabled({...env,SAM_RELEASE_SETUP_MODE:"0"}));
const allocation=createServer();allocation.listen(0,"127.0.0.1");await once(allocation,"listening");
const port=(allocation.address() as {port:number}).port;
await new Promise<void>(resolve=>allocation.close(()=>resolve()));
const sentinel="SYNTHETIC_SECRET_MUST_NOT_APPEAR";
const child=spawn(process.execPath,["--require","./tests/release/setup_guard.cjs","scripts/release/main.cjs"],{
  env:{PATH:process.env.PATH,...env,PORT:String(port),DATABASE_URL:sentinel,DEEPSEEK_API_KEY:sentinel,SESSION_SECRET:sentinel},
  stdio:["ignore","pipe","pipe"]
});
let output="";child.stdout.on("data",x=>output+=x);child.stderr.on("data",x=>output+=x);
const exited=once(child,"exit");
const base=`http://127.0.0.1:${port}`;
const headers={"host":"diagnostic-fixture.example","content-type":"application/json","accept":"application/json, text/event-stream"};
const send=(method:string,body:string,extra:Record<string,string>={})=>new Promise<{status:number,body:string}>((resolve,reject)=>{
  const req=request(base+"/mcp",{method,headers:{...headers,...extra}},res=>{
    let text="";res.on("data",chunk=>text+=chunk);
    res.on("end",()=>resolve({status:res.statusCode!,body:text}));
  });req.on("error",reject);req.end(body);
});
const rpc=async(method:string,params:unknown={})=>{
  const r=await send("POST",JSON.stringify({jsonrpc:"2.0",id:1,method,params}));
  const body=JSON.parse(r.body);assert.ok(!JSON.stringify(body).includes(sentinel));return {r,body};
};
try{
  let ready=false;
  for(let n=0;n<80;n++){try{if((await fetch(base+"/livez")).status===200){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,50));}
  assert.ok(ready);
  const init=await rpc("initialize",{protocolVersion:"2025-11-25",capabilities:{},
    clientInfo:{name:"synthetic-local-client",version:"1.0"}});
  assert.equal(init.r.status,200);assert.equal(init.body.result.serverInfo.name,"sam-closed-setup-diagnostics");
  const notification=await send("POST",JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"}));
  assert.equal(notification.status,202);
  const listed=await rpc("tools/list");assert.equal(listed.r.status,200);
  assert.deepEqual(listed.body.result.tools.map((t:{name:string})=>t.name).sort(),
    ["sam_release_test_results","sam_service_status"]);
  for(const name of ["sam_service_status","sam_release_test_results"]){
    const called=await rpc("tools/call",{name,arguments:{}});
    assert.equal(called.r.status,200);assert.ok(called.body.result.content[0].text);
    const data=JSON.parse(called.body.result.content[0].text);
    if(name==="sam_service_status"){
      assert.equal(data.database,"NOT_CONNECTED");assert.equal(data.models,"DISABLED");
    }else{assert.equal(data.status,"NOT_RUN");assert.equal(data.readsSavedEvidence,false);}
  }
  const anonymousWithHeader=await send("POST",JSON.stringify({jsonrpc:"2.0",id:1,
    method:"tools/list"}),{authorization:`Bearer ${sentinel}`});
  assert.equal(anonymousWithHeader.status,200);
  assert.ok(!anonymousWithHeader.body.includes(sentinel));
  for(const name of ["sam_submit_synthetic_goal","sam_get_goal_status","sam_get_goal_result",sentinel]){
    assert.equal((await rpc("tools/call",{name,arguments:{}})).r.status,400);
  }
  assert.equal((await rpc("tools/call",{name:"sam_service_status",arguments:{secret:sentinel}})).r.status,400);
  assert.equal((await rpc("resources/list")).r.status,400);
  assert.equal((await send("GET","",{host:"wrong.example"})).status,403);
  assert.equal((await send("GET","",{origin:"https://evil.example"})).status,403);
  assert.equal((await send("GET","")).status,405);
  assert.equal((await fetch(base+"/api/goals")).status,404);
  assert.equal((await fetch(base+"/readyz")).status,503);
  assert.equal((await fetch(base+"/.well-known/oauth-protected-resource")).status,404);
}finally{child.kill("SIGTERM");await exited;}
assert.ok(!output.includes(sentinel));
assert.ok(!/FORBIDDEN_MODULE|OUTBOUND_OR_CHILD|RELEASE_STARTUP_REFUSED/.test(output));
assert.equal(child.exitCode,0);
console.log("DIAGNOSTIC_MCP_PASS: native production-context process, initialize/notification/list/call; exactly two static public tools; default OFF and setup-only; negative tools/args/host/origin; no DB/outbound/children; SIGTERM. LOCAL_PROTOCOL_NOT_CHATGPT_LIVE_ACCEPTANCE.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
