import assert from "node:assert/strict";
import path from "node:path";
import {loadProductionBundle} from "../../apps/production/src/loadBundle";
import {createKernelProductionDispatcher} from "../../apps/production/src/dispatcher";
import {createChatGPTToolSurface} from "../../apps/chatgpt-tools/src/surface";

async function main(){
  process.env.BOL_CLIENT_ID="tool-inventory-test";
  process.env.BOL_CLIENT_SECRET="tool-inventory-test";
  process.env.SAM_GOOGLE_READ_ONLY="true";
  const bundle=await loadProductionBundle(path.resolve("apps/production/src/defaultBundleModule.ts"));
  const bol=bundle.raw.capabilities.filter((item)=>item.capabilityId.startsWith("bol_"));
  assert.equal(bol.length,76,"SAM production bundle must register all upstream bol tools");
  assert.equal(bundle.raw.toolAdapters.filter((item)=>item.capabilityId.startsWith("bol_")).length,76);
  assert.equal(bundle.verifiers.size>=76,true);
  const {BOL_VERIFICATION_CONTRACTS}=require("../../apps/production/src/bolBundle");
  assert.equal(BOL_VERIFICATION_CONTRACTS.length,76,"Verification contract catalog must cover all bol tools");
  const read=bol.filter((item)=>item.authorityClass==="GREEN");
  const approvalGated=bol.filter((item)=>item.authorityClass!=="GREEN");
  assert.equal(read.length,53,"Only the upstream explicit read-only allowlist is GREEN");
  assert.equal(approvalGated.length,23,"All remaining tools must require SAM owner approval");
  for(const item of approvalGated){
    const definition=bundle.tools.definition(item.capabilityId);
    assert.equal(definition.sideEffect,true,`${item.capabilityId} must be recorded as a side effect`);
  }
  const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(bundle)});
  const exposed=surface.definitions().filter((item)=>item.name.startsWith("bol_"));
  assert.equal(exposed.length,76,"ChatGPT-facing SAM MCP surface must expose 76 named bol tools");
  assert.ok(exposed.every((item)=>item.inputSchema.type==="object"));
  console.log("SAM_BOL_76_SURFACE PASS capabilities=76 exposed=76 green=53 approval_gated=23");
}
main().catch((error)=>{console.error(error);process.exitCode=1;});
