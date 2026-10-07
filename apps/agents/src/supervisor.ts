import type { CapabilityExecutor } from "../../kernel/src/workerRuntime";
import { runOneSpecialistWork } from "./runtime";
import type { CapabilityCatalog } from "./capabilityCatalog";

export async function runSpecialistSupervisorTick(input:{
  catalog:CapabilityCatalog;
  workerInstanceId:string;
  ttlSeconds:number;
  executors:Record<string,CapabilityExecutor>;
}):Promise<{
  processed:boolean;
  agentId?:string;
  queueId?:string;
  executionId?:string;
}>{
  const seen=new Set<string>();
  for(const capabilityId of Object.keys(input.executors)){
    const definition=input.catalog.get(capabilityId);
    if(seen.has(definition.specialistAgentId)) continue;
    seen.add(definition.specialistAgentId);

    const agent=input.catalog.specialists.getAgent(definition.specialistAgentId);
    const result=await runOneSpecialistWork({
      agent,
      workerInstanceId:input.workerInstanceId,
      ttlSeconds:input.ttlSeconds,
      executors:input.executors
    });
    if(result.processed){
      return {
        processed:true,
        agentId:agent.agentId,
        queueId:result.queueId,
        executionId:result.executionId
      };
    }
  }

  return {processed:false};
}
