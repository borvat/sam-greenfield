import assert from "node:assert/strict";
import test from "node:test";
import { Client,StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";
import type { ProductionActionDispatcher } from "../../apps/chatgpt-tools/src/types";
import { startMcpHttpServer } from "../../apps/mcp/src/http";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { createKernelProductionDispatcher } from "../../apps/production/src/dispatcher";

test("sam_submit_goal is exposed only when a planner is configured and forwards the whole objective",async()=>{
  let received:any;
  const dispatcher:ProductionActionDispatcher={
    canPlanGoals(){return true;},
    async submitGoal(input){received=input;return {status:"SUBMITTED",goalId:"goal-test"};},
    manifest(){return [];},
    async execute(){throw new Error("not used");}
  };
  const surface=createChatGPTToolSurface({dispatcher});
  assert.equal(surface.definition("sam_submit_goal").availability,"AVAILABLE");

  const server=await startMcpHttpServer({
    surface,actor:"phase22-mcp-test",port:0,host:"127.0.0.1",
    bearerToken:"phase22-test-token",allowedHosts:["127.0.0.1"]
  });
  const address=server.server.address();
  assert.ok(address&&typeof address!=="string");
  const client=new Client({name:"phase22-test",version:"1.0.0"},{versionNegotiation:{mode:"auto"}});
  try{
    await client.connect(new StreamableHTTPClientTransport(
      new URL(`http://127.0.0.1:${address.port}/mcp`),
      {requestInit:{headers:{Authorization:"Bearer phase22-test-token"}}}
    ));
    const listed=await client.listTools();
    assert.ok(listed.tools.some(tool=>tool.name==="sam_submit_goal"));
    const response=await client.callTool({name:"sam_submit_goal",arguments:{
      objective:"Read QNAN bol sales and stock, combine, verify, and report. Do not make external changes.",
      legal_entity_id:"00000000-0000-0000-0000-000000000001"
    }});
    assert.equal(response.isError??false,false);
    assert.deepEqual(received,{
      objective:"Read QNAN bol sales and stock, combine, verify, and report. Do not make external changes.",
      legalEntityId:"00000000-0000-0000-0000-000000000001",
      actor:"phase22-mcp-test"
    });
  }finally{
    await client.close();
    await server.close();
  }

  const disabled=createChatGPTToolSurface({dispatcher:{
    ...dispatcher,
    canPlanGoals(){return false;}
  }});
  assert.equal(disabled.definition("sam_submit_goal").availability,"AVAILABLE");
  const unavailable=await disabled.invoke("sam_submit_goal",{
    objective:"Do not create a goal when no planner is configured",
    legal_entity_id:"00000000-0000-0000-0000-000000000001"
  },{actor:"phase22-test",systemOwner:true});
  assert.equal(unavailable.ok,false);
  assert.equal(unavailable.unavailable,true);

  const unconfigured=validateProductionBundle({
    capabilities:[{capabilityId:"read_only_probe",authorityClass:"GREEN",specialistAgentId:"test",specialistVersion:"1"}],
    toolDefinitions:[{capabilityId:"read_only_probe",authorityClass:"GREEN",sideEffect:false}],
    toolAdapters:[{capabilityId:"read_only_probe",async execute(){return {result:{},evidence:{}};}}]
  });
  const realDispatcher=createKernelProductionDispatcher(unconfigured);
  assert.equal(realDispatcher.canPlanGoals?.(),false);
  const noProvider=await realDispatcher.submitGoal?.({
    objective:"No provider means no persistent goal should be created",
    legalEntityId:"00000000-0000-0000-0000-000000000001",
    actor:"phase22-test"
  });
  assert.equal((noProvider as any).status,"UNAVAILABLE");
  assert.equal((noProvider as any).reason,"MODEL_PROVIDER_NOT_CONFIGURED");
});
