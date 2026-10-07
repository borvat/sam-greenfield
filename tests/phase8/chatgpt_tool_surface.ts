import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";
import type { ProductionActionDispatcher } from "../../apps/chatgpt-tools/src/types";

async function main(){
  const noActions=createChatGPTToolSurface();
  const defs=noActions.definitions();

  assert.ok(defs.length>=30);
  assert.ok(defs.some((d)=>d.name==="sam_system_status"));
  assert.ok(defs.some((d)=>d.name==="sam_get_goal_timeline"));
  assert.ok(defs.some((d)=>d.name==="sam_list_memory"));
  assert.ok(defs.some((d)=>d.name==="sam_list_financial_documents"));
  assert.equal(noActions.definition("sam_execute").availability,"UNAVAILABLE");

  const denied=await noActions.invoke("sam_system_status",{},{
    actor:"chatgpt-test",
    systemOwner:false
  });
  assert.equal(denied.ok,false);

  const status=await noActions.invoke("sam_system_status",{},{
    actor:"chatgpt-test",
    systemOwner:true
  });
  assert.equal(status.ok,true);

  const unavailable=await noActions.invoke("sam_execute",{
    capability_id:"anything",
    params:{}
  },{
    actor:"chatgpt-test",
    systemOwner:true
  });
  assert.equal(unavailable.ok,false);
  assert.equal(unavailable.unavailable,true);

  let executed=0;
  const dispatcher:ProductionActionDispatcher={
    manifest(){
      return [{
        capabilityId:"phase8_safe_action",
        authorityClass:"GREEN",
        specialistAgentId:"ops",
        specialistVersion:"8.0.0",
        availability:"AVAILABLE",
        sideEffect:false,
        description:"Synthetic acceptance capability"
      }];
    },
    async execute(input){
      executed+=1;
      return {accepted:true,capability_id:input.capabilityId,params:input.params};
    }
  };

  const withActions=createChatGPTToolSurface({dispatcher});
  assert.equal(withActions.definition("sam_execute").availability,"AVAILABLE");

  const manifest=await withActions.invoke("sam_capability_manifest",{},{
    actor:"chatgpt-test",
    systemOwner:true
  });
  assert.equal(manifest.ok,true);

  const result=await withActions.invoke("sam_execute",{
    capability_id:"phase8_safe_action",
    params:{x:1}
  },{
    actor:"chatgpt-test",
    systemOwner:true
  });
  assert.equal(result.ok,true);
  assert.equal(executed,1);

  const unknown=await withActions.invoke("sam_execute",{
    capability_id:"does_not_exist",
    params:{}
  },{
    actor:"chatgpt-test",
    systemOwner:true
  });
  assert.equal(unknown.ok,false);
  assert.equal(executed,1);

  console.log(`PHASE8_CHATGPT_TOOL_SURFACE PASS tools=${defs.length}`);
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
