import assert from "node:assert/strict";
import {test} from "node:test";
import {Client,StreamableHTTPClientTransport} from "@modelcontextprotocol/client";
import {startMcpHttpServer} from "../../apps/mcp/src/http";
import {ChatGPTToolRegistry} from "../../apps/chatgpt-tools/src/registry";
import {googleConnectionTools} from "../../apps/mcp/src/googleOauth";

test("Google HTTP routes protect start/status, publish exact CIMD, sanitize errors and bind callback",async()=>{
 let starts=0,callbacks=0;
 const connection:any={config:{publicOrigin:"https://sam.example.com",clientId:"https://sam.example.com/google/oauth/client.json",redirectUri:"https://sam.example.com/google/oauth/callback"},
 begin:async()=>{starts++;return "https://sam-google-workspace-mcp.onrender.com/authorize?state=opaque"},
 status:async()=>({authorizationStored:false}),finish:async(input:any)=>{callbacks++;assert.equal(input.issuer,"https://sam-google-workspace-mcp.onrender.com/");if(input.state!=="valid")throw Error("secret-provider-code");}};
 const surface=new ChatGPTToolRegistry(googleConnectionTools(connection));
 const service=await startMcpHttpServer({surface,googleConnection:connection,actor:"owner",port:0,host:"127.0.0.1",bearerToken:"test-owner-token",allowedHosts:["127.0.0.1"],allowedOrigins:["https://sam.example.com"]});
 const addr=service.server.address() as any,base=`http://127.0.0.1:${addr.port}`;
 try{
  assert.equal((await fetch(base+"/google/oauth/start",{method:"POST"})).status,401);
  assert.equal(starts,0);
  assert.equal((await fetch(base+"/google/status")).status,401);
  assert.equal((await fetch(base+"/google/oauth/start",{method:"POST",headers:{authorization:"Bearer test-owner-token",origin:"https://attacker.example"}})).status,403);
  const start=await fetch(base+"/google/oauth/start",{method:"POST",headers:{authorization:"Bearer test-owner-token"}});
  assert.equal(start.status,200);assert.equal(starts,1);
  const metadata=await (await fetch(base+"/google/oauth/client.json")).json() as any;
  assert.deepEqual(metadata.redirect_uris,[connection.config.redirectUri]);assert.equal(metadata.token_endpoint_auth_method,"none");
  const failed=await fetch(base+"/google/oauth/callback?state=bad&code=secret&iss=https%3A%2F%2Fsam-google-workspace-mcp.onrender.com%2F");
  assert.equal(failed.status,400);assert.equal((await failed.text()).includes("secret"),false);assert.equal(failed.headers.get("referrer-policy"),"no-referrer");
  const before=callbacks;
  assert.equal((await fetch(base+"/google/oauth/callback?state=valid&state=duplicate&code=x")).status,400);assert.equal(callbacks,before);
  const success=await fetch(base+"/google/oauth/callback?state=valid&code=secret&iss=https%3A%2F%2Fsam-google-workspace-mcp.onrender.com%2F",{redirect:"manual"});
  assert.equal(success.status,303);assert.equal(success.headers.get("location"),"/google/connected");
  const mcp=new Client({name:"google-test",version:"1"});
  await mcp.connect(new StreamableHTTPClientTransport(new URL(base+"/mcp"),{requestInit:{headers:{authorization:"Bearer test-owner-token"}}}));
  try{
   const listed=await mcp.listTools();assert.equal(listed.tools.length,2);
   const status=await mcp.callTool({name:"sam_google_connection_status",arguments:{}});
   assert.equal(status.isError??false,false);
   assert.equal(JSON.stringify(status).includes("authorizationStored"),true);
  }finally{await mcp.close()}
  const denied=await surface.invoke("sam_google_authorize",{},{actor:"guest",systemOwner:false});assert.equal(denied.ok,false);
 }finally{await service.close()}
});
