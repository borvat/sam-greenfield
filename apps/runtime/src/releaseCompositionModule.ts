import {pool} from "../../../packages/db/src/client";
import {loadProductionBundle} from "../../production/src/loadBundle";
import {createProductionComposition} from "../../production/src/composition";
import {assertReleaseDatabaseSafety} from "../../../packages/db/src/releaseSafety";

// No DDL, migration, GRANT, registry mutation, or external operational loop here.
export default (async()=>{
await assertReleaseDatabaseSafety(pool);
const bundle=await loadProductionBundle(process.env.SAM_PRODUCTION_BUNDLE_MODULE??"");
const approved=new Set((process.env.SAM_RELEASE_CAPABILITIES??"").split(","));
if(bundle.raw.capabilities.some(c=>!approved.has(c.capabilityId))||
  bundle.raw.toolDefinitions.some(t=>t.sideEffect)||
  (bundle.raw.modelAdapters?.length??0)>0){
  throw new Error("RELEASE_UNAPPROVED_CAPABILITY_OR_MODEL");
}
const composition=createProductionComposition({bundle,workerId:process.env.SAM_WORKER_ID??"sam-release-worker"});
composition.supervisorOptions={monitorSideEffects:false};
return composition;
})();
