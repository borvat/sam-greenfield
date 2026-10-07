import assert from "node:assert/strict";
import {createServer,type Server} from "node:http";
import {pool} from "../../packages/db/src/client";
import {startCommandCenterHttpServer} from "../../apps/command-center/src/http";
import {runLiveGoldenChain} from "../../apps/acceptance/src/liveGoldenChain";

async function listen(handler:Parameters<typeof createServer>[0]){
  const server=createServer(handler);
  await new Promise<void>((resolve,reject)=>{
    server.once("error",reject);
    server.listen(0,"127.0.0.1",()=>{server.off("error",reject);resolve()});
  });
  const a=server.address();if(!a||typeof a==="string")throw new Error("server address unavailable");
  return {server,base:`http://127.0.0.1:${a.port}`};
}
async function close(server:Server){
  await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
}
function send(res:any,status:number,body:any){
  res.statusCode=status;res.setHeader("content-type","application/json");res.end(JSON.stringify(body));
}

async function main(){
  const org=await pool.query("INSERT INTO organizations(name) VALUES('P20 org') RETURNING id");
  const entity=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'P20 entity') RETURNING id",[org.rows[0].id]);

  const cc=await startCommandCenterHttpServer({
    legalEntityId:entity.rows[0].id,
    port:0,
    host:"127.0.0.1",
    bearerToken:"owner",
    allowedHosts:"127.0.0.1"
  });
  const ca=cc.server.address();if(!ca||typeof ca==="string")throw new Error("cc address");
  const ccBase=`http://127.0.0.1:${ca.port}`;
  const ready=await fetch(ccBase+"/readyz");
  assert.equal(ready.status,200);
  assert.equal((await ready.json()).status,"ready");
  await pool.query("UPDATE legal_entities SET status='INACTIVE' WHERE id=$1",[entity.rows[0].id]);
  const notReady=await fetch(ccBase+"/readyz");
  assert.equal(notReady.status,503);
  assert.equal((await notReady.json()).status,"not_ready");
  await cc.close();

  let polls=0;
  const runtime=await listen((req,res)=>{
    if(req.url==="/readyz")return send(res,200,{status:"ready"});
    send(res,404,{});
  });
  const mcp=await listen((req,res)=>{
    if(req.url==="/livez")return send(res,200,{status:"alive"});
    send(res,404,{});
  });
  const fakeCc=await listen(async(req,res)=>{
    if(req.url==="/readyz")return send(res,200,{status:"ready"});
    if(req.method==="POST"&&req.url==="/api/goals"){
      assert.equal(req.headers.authorization,"Bearer live-token");
      const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
      const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.equal(body.authority_ceiling,"GREEN");
      assert.equal(body.domain,"acceptance_canary");
      return send(res,201,{ok:true,data:{id:"11111111-1111-1111-1111-111111111111",business_id:"G900001",state:"NEW"}});
    }
    if(req.method==="GET"&&req.url==="/api/goals/11111111-1111-1111-1111-111111111111/timeline"){
      assert.equal(req.headers.authorization,"Bearer live-token");
      polls++;
      if(polls<3){
        return send(res,200,{ok:true,data:{
          goal:{id:"11111111-1111-1111-1111-111111111111",state:polls===1?"PLANNING":"EXECUTING"},
          plans:polls>=1?[{id:"p1"}]:[],
          work:polls>=2?[{id:"w1"}]:[],
          executions:[],
          verifications:[],
          audit:[{action:"OWNER_GOAL_CREATED"}]
        }});
      }
      return send(res,200,{ok:true,data:{
        goal:{id:"11111111-1111-1111-1111-111111111111",state:"COMPLETED"},
        plans:[{id:"p1"}],
        work:[{id:"w1"}],
        executions:[{id:"e1",status:"EXECUTED"}],
        verifications:[{id:"v1",result:"VERIFIED"}],
        audit:[{action:"OWNER_GOAL_CREATED"},{action:"GOAL_COMPLETED"}]
      }});
    }
    send(res,404,{});
  });

  const evidence=await runLiveGoldenChain({
    runtimeUrl:runtime.base,
    commandCenterUrl:fakeCc.base,
    commandCenterToken:"live-token",
    mcpUrl:mcp.base,
    objective:"Use one GREEN read-only capability and return verified canary evidence.",
    timeoutMs:5000,
    pollMs:1,
    sleep:async()=>{}
  });
  assert.equal(evidence.finalState,"COMPLETED");
  assert.equal(evidence.businessId,"G900001");
  assert.equal(evidence.planCount,1);
  assert.equal(evidence.workCount,1);
  assert.equal(evidence.executionCount,1);
  assert.equal(evidence.verifiedCount,1);
  assert.equal(evidence.polls,3);
  assert.deepEqual(evidence.observedStates,["PLANNING","EXECUTING","COMPLETED"]);

  const blocked=await listen(async(req,res)=>{
    if(req.url==="/readyz")return send(res,200,{status:"ready"});
    if(req.method==="POST"&&req.url==="/api/goals")return send(res,201,{ok:true,data:{id:"22222222-2222-2222-2222-222222222222",business_id:"G900002"}});
    if(req.url?.includes("/timeline"))return send(res,200,{ok:true,data:{goal:{state:"WAITING_OWNER"},plans:[],work:[],executions:[],verifications:[],audit:[]}});
    send(res,404,{});
  });
  let blockedError="";
  try{
    await runLiveGoldenChain({
      runtimeUrl:runtime.base,
      commandCenterUrl:blocked.base,
      commandCenterToken:"live-token",
      objective:"GREEN canary",
      timeoutMs:2000,
      pollMs:1,
      sleep:async()=>{}
    });
  }catch(err){blockedError=err instanceof Error?err.message:String(err)}
  assert.match(blockedError,/unexpectedly requires owner approval/);

  const fakeIncomplete=await listen(async(req,res)=>{
    if(req.url==="/readyz")return send(res,200,{status:"ready"});
    if(req.method==="POST"&&req.url==="/api/goals")return send(res,201,{ok:true,data:{id:"33333333-3333-3333-3333-333333333333",business_id:"G900003"}});
    if(req.url?.includes("/timeline"))return send(res,200,{ok:true,data:{goal:{state:"COMPLETED"},plans:[{}],work:[{}],executions:[{}],verifications:[],audit:[]}});
    send(res,404,{});
  });
  let incompleteError="";
  try{
    await runLiveGoldenChain({
      runtimeUrl:runtime.base,
      commandCenterUrl:fakeIncomplete.base,
      commandCenterToken:"live-token",
      objective:"GREEN canary",
      timeoutMs:2000,
      pollMs:1,
      sleep:async()=>{}
    });
  }catch(err){incompleteError=err instanceof Error?err.message:String(err)}
  assert.match(incompleteError,/no VERIFIED independent verification/);

  const badRuntime=await listen((req,res)=>{
    if(req.url==="/readyz")return send(res,503,{status:"not_ready"});
    send(res,404,{});
  });
  let runtimeError="";
  try{
    await runLiveGoldenChain({runtimeUrl:badRuntime.base,commandCenterUrl:fakeCc.base,commandCenterToken:"live-token",objective:"GREEN canary",timeoutMs:1000,pollMs:1,sleep:async()=>{}});
  }catch(err){runtimeError=err instanceof Error?err.message:String(err)}
  assert.match(runtimeError,/Runtime is not ready/);

  const badCommand=await listen((req,res)=>{
    if(req.url==="/readyz")return send(res,503,{status:"not_ready"});
    send(res,404,{});
  });
  let commandError="";
  try{
    await runLiveGoldenChain({runtimeUrl:runtime.base,commandCenterUrl:badCommand.base,commandCenterToken:"live-token",objective:"GREEN canary",timeoutMs:1000,pollMs:1,sleep:async()=>{}});
  }catch(err){commandError=err instanceof Error?err.message:String(err)}
  assert.match(commandError,/Command Center is not ready/);

  const badMcp=await listen((req,res)=>{
    if(req.url==="/livez")return send(res,503,{status:"down"});
    send(res,404,{});
  });
  let mcpError="";
  try{
    await runLiveGoldenChain({runtimeUrl:runtime.base,commandCenterUrl:fakeCc.base,commandCenterToken:"live-token",mcpUrl:badMcp.base,objective:"GREEN canary",timeoutMs:1000,pollMs:1,sleep:async()=>{}});
  }catch(err){mcpError=err instanceof Error?err.message:String(err)}
  assert.match(mcpError,/MCP is not alive/);

  await Promise.all([
    close(runtime.server),close(mcp.server),close(fakeCc.server),close(blocked.server),close(fakeIncomplete.server),
    close(badRuntime.server),close(badCommand.server),close(badMcp.server)
  ]);
  console.log("PHASE20_LIVE_GOLDEN_CHAIN_GATE PASS");
  await pool.end();
}

main().catch(async err=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
