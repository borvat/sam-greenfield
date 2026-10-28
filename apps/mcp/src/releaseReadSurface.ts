import {buildRevision} from '../../../packages/shared/src/buildRevision';
import {ChatGPTToolRegistry} from "../../chatgpt-tools/src/registry";
import type {RegisteredChatGPTTool} from "../../chatgpt-tools/src/types";

export function createReleaseReadSurface(){
  const tool=(name:string,read:()=>Promise<unknown>):RegisteredChatGPTTool=>({
    definition:{name,description:"Read sanitized release service/test status only. No business data.",
      risk:"READ",availability:"READ_ONLY",inputSchema:{type:"object",properties:{},additionalProperties:false}},
    handler:async args=>{
      if(Object.keys(args).length)return {ok:false,error:"Arguments are not permitted."};
      return {ok:true,data:await read()};
    }
  });
  return new ChatGPTToolRegistry([
    tool("sam_service_status",async()=>{
      const result:Record<string,string>={};
      for(const [name,port] of [["worker",Number(process.env.SAM_RUNTIME_PORT??process.env.PORT)],["command-center",Number(process.env.SAM_COMMAND_CENTER_PORT)]] as const){
        if(!Number.isInteger(port)||port<1||port>65535){result[name]="UNAVAILABLE";continue;}
        try{
          const r=await fetch(`http://127.0.0.1:${port}/${name==="worker"?"readyz":"livez"}`,
            {signal:AbortSignal.timeout(1000),redirect:"error"});
          result[name]=r.status===200?"READY":"NOT_READY";
        }catch{result[name]="UNAVAILABLE";}
      }
      return {...result,...buildRevision(),discovery:"SERVER_LIST_ONLY_CLIENT_CACHED_DISCOVERY_MAY_DIFFER"};
    }),
    tool("sam_release_test_results",async()=>{
      // Archived summaries do not attest this image and are not runtime assets.
      return {status:"NOT_RUN",passedSuites:null,failedSuites:null,
        classification:"CURRENT_CANDIDATE_REQUIRES_HASHED_INDEPENDENT_REPORT"};
    })
  ],{redactedErrors:true});
}
