// Generic ACT interruption harness, TEST ONLY. Executes SAM's real local adapter
// and native delegation, then waits so the parent can kill this actual process.
import {createToolExecutors} from "../../apps/tools/src/executorFactory";
import {runCatalogSpecialistTick} from "../../apps/agents/src/executiveFlow";
import {localCapabilityBundle} from "../../apps/development/src/localCapabilities";
const bundle=localCapabilityBundle({providerId:"deepseek",async invoke(){throw new Error("UNIT_MODEL_DISABLED");}} as any);
const native=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
const wrapped=Object.fromEntries(Object.entries(native).map(([id,execute])=>[id,async(work:any)=>{
  const result=await execute(work);
  process.send?.({event:"ACT_ARTIFACT_COMMITTED",queueId:work.queueId,token:work.fencingToken});
  await new Promise(()=>{});
  return result;
}]));
runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:"unit-act-crash",ttlSeconds:1,executors:wrapped})
  .catch(()=>{console.error("ACT_CRASH_CHILD_FAILED");process.exit(1);});
