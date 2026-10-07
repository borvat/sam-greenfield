import assert from "node:assert/strict";
import { Client,StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { pool } from "../../packages/db/src/client";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";
import type { ProductionActionDispatcher } from "../../apps/chatgpt-tools/src/types";
import { startMcpHttpServer } from "../../apps/mcp/src/http";

async function listenPort(server:any):Promise<number>{
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("MCP server address unavailable");
  return address.port;
}

async function main(){
  const token="phase10-secret";
  const readSurface=createChatGPTToolSurface();
  const readService=await startMcpHttpServer({
    surface:readSurface,
    actor:"phase10-mcp",
    port:0,
    host:"127.0.0.1",
    bearerToken:token,
    allowedHosts:["127.0.0.1"]
  });
  const readPort=await listenPort(readService.server);
  const url=new URL(`http://127.0.0.1:${readPort}/mcp`);

  const denied=await fetch(url,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:"{}"
  });
  assert.equal(denied.status,401);

  const client=new Client(
    {name:"phase10-client",version:"1.0.0"},
    {versionNegotiation:{mode:"auto"}}
  );
  const transport=new StreamableHTTPClientTransport(url,{
    requestInit:{headers:{Authorization:`Bearer ${token}`}}
  });
  await client.connect(transport);

  const listed=await client.listTools();
  assert.ok(listed.tools.length>=25);
  assert.ok(listed.tools.some((t)=>t.name==="sam_system_status"));
  assert.ok(!listed.tools.some((t)=>t.name==="sam_execute"));

  const status=await client.callTool({
    name:"sam_system_status",
    arguments:{}
  });
  assert.equal(status.isError??false,false);
  const text=status.content?.[0]?.type==="text"?status.content[0].text:"{}";
  const parsed=JSON.parse(text);
  assert.equal(parsed.ok,true);

  await client.close();
  await readService.close();

  let executed=0;
  const dispatcher:ProductionActionDispatcher={
    manifest(){
      return [{
        capabilityId:"phase10_action",
        authorityClass:"GREEN",
        specialistAgentId:"ops",
        specialistVersion:"10.0.0",
        availability:"AVAILABLE",
        sideEffect:false
      }];
    },
    async execute(input){
      executed+=1;
      return {
        accepted:true,
        capabilityId:input.capabilityId,
        legalEntityId:input.legalEntityId
      };
    }
  };

  const actionService=await startMcpHttpServer({
    surface:createChatGPTToolSurface({dispatcher}),
    actor:"phase10-mcp",
    port:0,
    host:"127.0.0.1",
    bearerToken:token,
    allowedHosts:["127.0.0.1"]
  });
  const actionPort=await listenPort(actionService.server);
  const actionUrl=new URL(`http://127.0.0.1:${actionPort}/mcp`);

  const actionClient=new Client(
    {name:"phase10-action-client",version:"1.0.0"},
    {versionNegotiation:{mode:"auto"}}
  );
  await actionClient.connect(new StreamableHTTPClientTransport(actionUrl,{
    requestInit:{headers:{Authorization:`Bearer ${token}`}}
  }));

  const actionTools=await actionClient.listTools();
  assert.ok(actionTools.tools.some((t)=>t.name==="sam_execute"));

  const result=await actionClient.callTool({
    name:"sam_execute",
    arguments:{
      capability_id:"phase10_action",
      legal_entity_id:"00000000-0000-0000-0000-000000000001",
      params:{value:10}
    }
  });
  assert.equal(result.isError??false,false);
  assert.equal(executed,1);

  await actionClient.close();
  await actionService.close();

  console.log(`PHASE10_MCP_TRANSPORT PASS read_tools=${listed.tools.length} action_tools=${actionTools.tools.length}`);
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
