// Child process for tests/rls/mcp_dispatch.ts: runs the REAL ChatGPT-direct dispatcher
// (goal creation, state transitions, authority check, plan + queue, approval requests)
// under the production sam_mcp database login. Prints one JSON line.
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {createKernelProductionDispatcher} from "../../apps/production/src/dispatcher";

async function main(){
  const bundle=validateProductionBundle({
    capabilities:[
      {capabilityId:"probe_read",authorityClass:"GREEN",specialistAgentId:"p",specialistVersion:"1.0.0"},
      {capabilityId:"probe_send",authorityClass:"YELLOW",specialistAgentId:"p",specialistVersion:"1.0.0"}],
    toolDefinitions:[
      {capabilityId:"probe_read",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"probe_send",authorityClass:"YELLOW",sideEffect:true}],
    toolAdapters:[
      {capabilityId:"probe_read",async execute(){return {result:{},evidence:{}};}},
      {capabilityId:"probe_send",async execute(){return {providerReference:"x",result:{},evidence:{}};}}]
  });
  const d=createKernelProductionDispatcher(bundle);
  const entity=process.env.PROBE_ENTITY!;
  const green:any=await d.execute({capabilityId:"probe_read",legalEntityId:entity,params:{a:1},objective:"probe green",actor:"chatgpt-mcp"} as any);
  const yellow:any=await d.execute({capabilityId:"probe_send",legalEntityId:entity,params:{a:2},objective:"probe yellow",actor:"chatgpt-mcp"} as any);
  process.stdout.write(JSON.stringify({green:green.status,yellow:yellow.status,approvals:(yellow as any).approvalIds?.length??0})+"\n");
  process.exit(0);
}
main().catch(e=>{process.stdout.write(JSON.stringify({error:String(e?.message??e)})+"\n");process.exit(1);});
