import {pool} from "../../../packages/db/src/client";
import {loadProductionBundle} from "../../production/src/loadBundle";
import {createProductionComposition} from "../../production/src/composition";
import {assertReleaseDatabaseSafety} from "../../../packages/db/src/releaseSafety";
import {pilotEnabled,pilotConfiguration} from "../../production/src/syntheticPilotScope";

// No DDL, migration, GRANT, registry mutation, or external operational loop here.
export default (async()=>{
await assertReleaseDatabaseSafety(pool);
const bundle=await loadProductionBundle(process.env.SAM_PRODUCTION_BUNDLE_MODULE??"");
const approved=new Set((process.env.SAM_RELEASE_CAPABILITIES??"").split(","));
const pilot=pilotEnabled()?pilotConfiguration():undefined;
if(bundle.raw.capabilities.some(c=>!approved.has(c.capabilityId))||
  bundle.raw.toolDefinitions.some(t=>t.sideEffect)||
  (!pilot&&(bundle.raw.modelAdapters?.length??0)>0)||
  (pilot&&((bundle.raw.modelAdapters?.length??0)!==1||bundle.raw.modelAdapters![0].providerId!=="deepseek"))){
  throw new Error("RELEASE_UNAPPROVED_CAPABILITY_OR_MODEL");
}
const composition=createProductionComposition({bundle,workerId:process.env.SAM_WORKER_ID??"sam-release-worker"});
composition.supervisorOptions={monitorSideEffects:false};
return composition;
})();
