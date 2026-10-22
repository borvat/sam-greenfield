// Generic ACT interruption harness, TEST ONLY. Executes SAM's real local adapter
// and native delegation, then waits so the parent can kill this actual process.
import {createToolExecutors} from "../../apps/tools/src/executorFactory";
import {runCatalogSpecialistTick} from "../../apps/agents/src/executiveFlow";
import {localCapabilityBundle} from "../../apps/development/src/localCapabilities";
import {verifyNextExecution} from "../../apps/production/src/verifier";
const bundle=localCapabilityBundle({providerId:"deepseek",async invoke(){throw new Error("UNIT_MODEL_DISABLED");}} as any);
const native=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
const phase=process.env.SAM_TEST_CRASH_PHASE??"ACT_ARTIFACT_COMMITTED";
async function pause(event:string,work:any){
  process.send?.({event,queueId:work.queueId,token:work.fencingToken});
  await new Promise(()=>{});
}
const wrapped=Object.fromEntries(Object.entries(native).map(([id,execute])=>[id,async(work:any)=>{
  if(phase==="BEFORE_ACT")await pause(phase,work);
  const result=await execute(work);
  if(phase==="ACT_ARTIFACT_COMMITTED")await pause(phase,work);
  return result;
}]));
async function run(){
  if(phase==="DURING_VERIFY_READ"){
    for(const verifier of bundle.verifiers.values()){
      const verify=verifier.verify.bind(verifier);
      verifier.verify=async(input)=>{
        const result=await verify(input);await pause(phase,{queueId:input.execution.id});return result;
      };
    }
    await verifyNextExecution(bundle);
  }else if(phase==="AFTER_VERIFY_COMMIT"){
    await verifyNextExecution(bundle);await pause(phase,{});
  }else{
    const result=await runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:"unit-act-crash",ttlSeconds:1,executors:wrapped});
    if(phase==="AFTER_EXECUTION_COMMIT")await pause(phase,result);
  }
}
run()
  .catch(()=>{console.error("ACT_CRASH_CHILD_FAILED");process.exit(1);});
