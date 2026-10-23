import type { CapabilityExecutor } from "../../kernel/src/workerRuntime";
import { runOneSpecialistWork } from "./runtime";
import type { CapabilityCatalog } from "./capabilityCatalog";

export async function runSpecialistSupervisorTick(input:{
  catalog:CapabilityCatalog;
  workerInstanceId:string;
  ttlSeconds:number;
  executors:Record<string,CapabilityExecutor>;
  maxConcurrency?:number;
  rootGoalId?:string;
  advancers?:Parameters<typeof runOneSpecialistWork>[0]['advancers'];
}):Promise<{
  processed:boolean;
  agentId?:string;
  queueId?:string;
  executionId?:string;
}>{
  const concurrency=input.maxConcurrency??1;
  if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw Error('SPECIALIST_CONCURRENCY_INVALID');
  const ids=[...new Set(Object.keys(input.executors).map(id=>input.catalog.get(id).specialistAgentId))];
  let deferred=false;
  for(let i=0;i<ids.length;i+=concurrency){
    const settled=await Promise.allSettled(ids.slice(i,i+concurrency).map(async agentId=>{
      const result=await runOneSpecialistWork({agent:input.catalog.specialists.getAgent(agentId),workerInstanceId:input.workerInstanceId,
        ttlSeconds:input.ttlSeconds,executors:input.executors,advancers:input.advancers,rootGoalId:input.rootGoalId});
      return {...result,agentId};
    }));
    const failure=settled.find(r=>r.status==='rejected');
    if(failure?.status==='rejected')throw failure.reason;
    const results=settled.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);
    deferred ||= results.some(r=>r.deferred===true);
    const done=results.find(r=>r.processed&&!r.deferred);
    if(done)return done;
  }
  return {processed:deferred};
}
