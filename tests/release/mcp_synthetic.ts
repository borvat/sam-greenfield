// Entirely local: ephemeral synthetic signing keys, fake SQL for protocol tests.
// The PostgreSQL harness imports these helpers for actual isolated PG acceptance.
import assert from "node:assert/strict";
import {generateKeyPairSync,sign,randomUUID} from "node:crypto";
import {createRequire} from "node:module";
import {createServer} from "node:http";
import {once} from "node:events";
import {pathToFileURL} from "node:url";
import {Client,StreamableHTTPClientTransport} from "@modelcontextprotocol/client";
import {pool} from "../../packages/db/src/client";
import {startMcpHttpServer} from "../../apps/mcp/src/http";
import {createSyntheticGoalSurface} from "../../apps/mcp/src/syntheticGoalSurface";
import {authenticateOAuth,oauthResourceConfig} from "../../apps/mcp/src/oauthResource";

export function oauthFixture(base:NodeJS.ProcessEnv={}){
  const {publicKey,privateKey}=generateKeyPairSync("rsa",{modulusLength:2048});
  const jwk={...publicKey.export({format:"jwk"}),kid:"local-fixture",alg:"RS256",use:"sig"};
  const env={...base,NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
    SAM_MCP_SYNTHETIC_TOOLS:"1",SAM_MCP_OAUTH_APPROVED:"1",
    SAM_COMMAND_CENTER_ALLOWED_HOSTS:"pilot.example.invalid",
    SAM_MCP_OAUTH_RESOURCE:"https://pilot.example.invalid/mcp",SAM_MCP_OAUTH_ISSUER:"https://issuer.example.invalid",
    SAM_MCP_OAUTH_SUBJECT:"synthetic-owner",SAM_MCP_OAUTH_CLIENT_ID:"synthetic-client",
    SAM_MCP_OAUTH_PUBLIC_JWKS:JSON.stringify({keys:[jwk]}),
    SAM_RELEASE_ORG_ID:base.SAM_RELEASE_ORG_ID??"11111111-1111-4111-8111-111111111111",
    SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:base.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID??"22222222-2222-4222-8222-222222222222",
    SAM_PILOT_RUN_ID:base.SAM_PILOT_RUN_ID??randomUUID(),
    SAM_PILOT_MAX_REQUESTS:base.SAM_PILOT_MAX_REQUESTS??"1",
    SAM_PILOT_EXPIRES_AT:base.SAM_PILOT_EXPIRES_AT??new Date(Date.now()+600000).toISOString()};
  const config=oauthResourceConfig(env);
  function token(change:Record<string,unknown>={},headerChange:Record<string,unknown>={}){
    const now=Math.floor(Date.now()/1000);
    const header={alg:"RS256",typ:"at+jwt",kid:jwk.kid,...headerChange};
    const claims={iss:config.issuer,aud:config.resource,sub:config.subject,client_id:config.clientId,
      org_id:config.orgId,legal_entity_id:config.entityId,pilot_run_id:config.runId,
      scope:"sam:synthetic:read sam:synthetic:submit",iat:now,exp:now+300,...change};
    const data=[header,claims].map(x=>Buffer.from(JSON.stringify(x)).toString("base64url")).join(".");
    return data+"."+sign("RSA-SHA256",Buffer.from(data),privateKey).toString("base64url");
  }
  return {env,config,token};
}
export function decodeMcp(value:any){return JSON.parse(value.content[0].text);}
export async function syntheticMcpClient(base:NodeJS.ProcessEnv={}){
  const fixture=oauthFixture(base);
  const service=await startMcpHttpServer({surface:createSyntheticGoalSurface(),actor:"synthetic-mcp",
    port:0,host:"127.0.0.1",allowedHosts:["127.0.0.1"],oauth:fixture.config});
  const url=new URL(`http://127.0.0.1:${(service.server.address() as any).port}/mcp`);
  const client=new Client({name:"local-synthetic-fixture",version:"1.0.0"},{versionNegotiation:{mode:"auto"}});
  const headers={Authorization:"Bearer "+fixture.token()};
  try{
    await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{headers}}));
  }catch{await service.close();throw new Error("LOCAL_MCP_HANDSHAKE_FAILED");}
  return {client,service,url,headers,...fixture,close:async()=>{await client.close();await service.close();}};
}
async function main(){
  const originalFetch=globalThis.fetch;
  globalThis.fetch=((input:any,init?:RequestInit)=>{
    const u=new URL(typeof input==="string"?input:input.url??input.toString());
    if(u.hostname!=="127.0.0.1")throw new Error("TEST_OUTBOUND_DENIED");
    return originalFetch(input,init);
  }) as typeof fetch;
  let checks=0;const check=(value:unknown)=>{assert(value);checks++;};
  const fixture=oauthFixture();
  check(authenticateOAuth(fixture.token(),fixture.config).entityId===fixture.config.entityId);
  const now=Math.floor(Date.now()/1000);
  for(const change of [{iss:"https://wrong.invalid"},{aud:"https://wrong.invalid/mcp"},{sub:"another"},
    {client_id:"another"},{org_id:randomUUID()},{legal_entity_id:randomUUID()},{pilot_run_id:randomUUID()},
    {exp:now-1},{iat:now+30},{exp:now+7200},{nbf:now+30},{scope:""},
    {scope:"sam:synthetic:read admin"},{scope:"sam:synthetic:read sam:synthetic:read"}]){
    assert.throws(()=>authenticateOAuth(fixture.token(change),fixture.config));checks++;
  }
  for(const change of [{alg:"none"},{typ:"JWT"},{kid:"untrusted"},{jku:"https://wrong.invalid/keys"},{crit:["custom"]}]){
    assert.throws(()=>authenticateOAuth(fixture.token({},change),fixture.config));checks++;
  }
  assert.throws(()=>authenticateOAuth(fixture.token().slice(0,-8)+"invalid",fixture.config));checks++;
  for(const change of [{SAM_MCP_OAUTH_APPROVED:"0"},{SAM_MCP_OAUTH_RESOURCE:"http://pilot.example.invalid/mcp"},
    {SAM_MCP_OAUTH_PUBLIC_JWKS:"{}"},{SAM_MCP_OAUTH_PUBLIC_JWKS:JSON.stringify({keys:[{kty:"RSA",d:"private"}]})},
    {SAM_PILOT_EXPIRES_AT:new Date(Date.now()-1000).toISOString()}]){
    assert.throws(()=>oauthResourceConfig({...fixture.env,...change}));checks++;
  }
  const records=new Map<string,any>();let receipt:any[]=[];let touches=0;
  const originalConnect=pool.connect;
  (pool as any).connect=async()=>({release(){},query:async(sql:string,args:any[]=[])=>{
    touches++;
    if(sql.includes("count(*)::int n FROM audit_log"))
      return {rows:[{n:[...records.values()].filter(r=>r.actor===args[0]).length}]};
    if(sql.includes("SELECT g.id,g.state")){
      const record=records.get(args[0]);
      return {rows:record&&record.entity===args[1]&&record.org===args[2]&&record.actor===args[3]?[record]:[]};
    }
    if(sql.includes("FROM executions e JOIN verifications"))return {rows:receipt};
    if(sql.includes("SELECT id,org_id FROM legal_entities"))return {rowCount:1,rows:[{id:fixture.config.entityId,org_id:fixture.config.orgId}]};
    if(sql.includes("next_business_id"))return {rows:[{business_id:"SYNTHETIC-ONLY"}]};
    if(sql.includes("INSERT INTO goals")){
      const goal={id:args[7],state:"NEW",entity:args[1],org:fixture.config.orgId,
        domain:args[2],objective:args[3],completion_definition:args[6]};
      records.set(goal.id,goal);return {rows:[goal]};
    }
    if(sql.includes("INSERT INTO audit_log"))records.get(args[0]).actor=args[3];
    return {rows:[]};
  }});
  let session:Awaited<ReturnType<typeof syntheticMcpClient>>|undefined;
  try{
    // Use identical bindings for fake SQL and signed protocol credentials.
    session=await syntheticMcpClient(fixture.env);
    const listed=await session.client.listTools();
    check(listed.tools.map(t=>t.name).sort().join(",")==="sam_get_goal_result,sam_get_goal_status,sam_submit_synthetic_goal");
    check(listed.tools.every(t=>(t._meta as any)?.securitySchemes?.[0]?.type==="oauth2"));
    const metadata=await fetch(new URL("/.well-known/oauth-protected-resource/mcp",session.url));
    check(metadata.status===200);check((await metadata.json()).authorization_servers[0]===fixture.config.issuer);
    for(const bearer of ["", "not-a-shared-token",session.token({legal_entity_id:randomUUID()}),session.token({scope:"company:read"})]){
      const before=touches;
      const denied=await fetch(session.url,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+bearer},body:"{}"});
      check(denied.status===401&&denied.headers.get("www-authenticate")?.includes("resource_metadata="));
      check(touches===before);
    }
    const input={request_id:randomUUID(),operation:"sum",values:[7,3,-2],expected_result:8};
    const submitted=decodeMcp(await session.client.callTool({name:"sam_submit_synthetic_goal",arguments:input}));
    check(submitted.ok&&submitted.data.state==="NEW");check(records.size===1);
    const replay=decodeMcp(await session.client.callTool({name:"sam_submit_synthetic_goal",arguments:input}));
    check(replay.ok&&replay.data.replayed&&replay.data.goal_id===submitted.data.goal_id&&records.size===1);
    check((await session.client.callTool({name:"sam_submit_synthetic_goal",
      arguments:{...input,request_id:randomUUID()}})).isError);
    for(const args of [{...input,expected_result:9},{...input,company_scope:randomUUID()},
      {...input,values:["not-a-real-secret"]},{...input,operation:"mean"},{...input,objective:"business data"}]){
      const response=await session.client.callTool({name:"sam_submit_synthetic_goal",arguments:args});
      check(response.isError);check(!JSON.stringify(response).includes("not-a-real-secret"));
    }
    for(const name of ["sam_execute","sam_list_users","sam_get_memory","sam_finance_overview"]){
      check((await session.client.callTool({name,arguments:{}})).isError);
    }
    check((await session.client.callTool({name:"sam_get_goal_status",arguments:{goal_id:randomUUID()}})).isError);
    const goal=records.get(submitted.data.goal_id);
    const beforeDone=decodeMcp(await session.client.callTool({name:"sam_get_goal_result",arguments:{goal_id:goal.id}}));
    check(beforeDone.ok&&!beforeDone.data.verified);
    goal.state="COMPLETED";
    goal.current_plan_id=randomUUID();
    check((await session.client.callTool({name:"sam_get_goal_result",arguments:{goal_id:goal.id}})).isError);
    receipt=[{id:randomUUID(),verification_id:randomUUID(),capability_id:"local.calculate",
      params:{operation:"sum",values:[7,3,-2]},result:{value:8,secret:"not-a-real-secret"},
      plan_hash:"a".repeat(64),execution_hash:"b".repeat(64)}];
    const verified=await session.client.callTool({name:"sam_get_goal_result",arguments:{goal_id:goal.id}});
    check(decodeMcp(verified).data.verified&&decodeMcp(verified).data.value===8);
    check(!JSON.stringify(verified).includes("not-a-real-secret"));
    receipt[0].result.value=9;
    check((await session.client.callTool({name:"sam_get_goal_result",arguments:{goal_id:goal.id}})).isError);
    // The same client/session must not retain its earlier, broader authority.
    session.headers.Authorization="Bearer "+session.token({scope:"sam:synthetic:read"});
    const beforeScoped=touches;
    const refused=await session.client.callTool({name:"sam_submit_synthetic_goal",arguments:input});
    check(refused.isError);
    check((refused._meta as any)?.["mcp/www_authenticate"]?.includes('scope="sam:synthetic:submit"'));
    check(touches===beforeScoped);
    await session.close();session=undefined;
  }finally{
    if(session)await session.close();
    pool.connect=originalConnect;
    await pool.end();
  }
  const {validateRelease,childEnvironment}=createRequire(import.meta.url)("../../scripts/release/contract.cjs");
  const {startSupervisor}=createRequire(import.meta.url)("../../scripts/release/supervisor.cjs");
  const env={...fixture.env,SAM_RELEASE_ENABLE_MCP:"1",SAM_RELEASE_SYNTHETIC_PLANNER:"1",
    SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED:"1",SAM_PILOT_PRICE_REVIEWED_AT:new Date().toISOString(),
    SAM_PILOT_INPUT_USD_PER_1K:"0.0001",SAM_PILOT_OUTPUT_USD_PER_1K:"0.001",SAM_PILOT_MAX_REQUESTS:"1",
    SAM_PILOT_MAX_COST_USD:"0.01",DEEPSEEK_API_KEY:"LOCAL-MOCK-NOT-A-KEY",
    DATABASE_URL:"postgresql://sam_app@database.invalid/release?sslmode=verify-full",
    SAM_DB_APP_ROLE:"sam_app",SAM_DB_SCHEMA:"sam",SAM_COMMAND_CENTER_BEARER_TOKEN:"synthetic-internal-owner-control-only",
    SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://pilot.example.invalid",
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/syntheticPilotBundleModule.ts",
    SAM_RELEASE_CAPABILITIES:"local.calculate,local.statistics"};
  const config=validateRelease(env);
  check(config.mcpOnly);
  for(const service of ["mcp","command-center"]){
    const child=childEnvironment(env,config,service);
    check(!("DEEPSEEK_API_KEY" in child)&&!("SAM_PRODUCTION_BUNDLE_MODULE" in child));
    if(service==="mcp")check(!("SAM_MCP_BEARER_TOKEN" in child));
  }
  check(childEnvironment(env,config,"worker").DEEPSEEK_API_KEY==="LOCAL-MOCK-NOT-A-KEY");
  for(const change of [{SAM_MCP_OAUTH_APPROVED:"0"},{SAM_MCP_SYNTHETIC_TOOLS:"0"},{SAM_MCP_OAUTH_SUBJECT:""},
    {SAM_RELEASE_ENABLE_MCP:"0"}]){
    assert.throws(()=>validateRelease({...env,...change}));checks++;
  }
  check(validateRelease({...env,SAM_RELEASE_ENABLE_MCP:"0",SAM_MCP_SYNTHETIC_TOOLS:"0"}).mcpOnly);
  const backend=createServer((req,res)=>{res.setHeader("content-type","application/json");res.end(JSON.stringify({path:req.url}));});
  backend.listen(0,"127.0.0.1");await once(backend,"listening");
  const port=(backend.address() as any).port;
  const supervisor=startSupervisor({...config,port:0,mcpPort:port,commandPort:port,workerPort:port},env,[]);
  try{
    await supervisor.ready;
    const base=`http://127.0.0.1:${supervisor.server.address().port}`;
    for(const path of ["/","/api/goals","/api/finance","/_sam/status","/oauth/authorize"])
      check((await fetch(base+path)).status===404);
    for(const path of ["/mcp","/.well-known/oauth-protected-resource/mcp"])
      check((await (await fetch(base+path)).json()).path===path);
  }finally{await supervisor.stop();await new Promise<void>(r=>backend.close(()=>r()));}
  console.log(JSON.stringify({status:"PASS",checks,classification:"LOCAL_PROTOCOL_AND_UNIT_MOCK_SQL",
    externalCalls:0,providerCalls:0}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(()=>{console.error("MCP_SYNTHETIC_LOCAL_TEST_FAILED_DETAILS_WITHHELD");process.exitCode=1;});
}
