import {readFile} from "node:fs/promises";
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
      for(const [name,port] of [["worker",Number(process.env.PORT)],["command-center",Number(process.env.SAM_COMMAND_CENTER_PORT)]] as const){
        if(!Number.isInteger(port)||port<1||port>65535){result[name]="UNAVAILABLE";continue;}
        try{
          const r=await fetch(`http://127.0.0.1:${port}/${name==="worker"?"readyz":"livez"}`,
            {signal:AbortSignal.timeout(1000),redirect:"error"});
          result[name]=r.status===200?"READY":"NOT_READY";
        }catch{result[name]="UNAVAILABLE";}
      }
      return result;
    }),
    tool("sam_release_test_results",async()=>{
      // Fixed repository-relative evidence file; no model-controlled file paths.
      const data=JSON.parse(await readFile(new URL("../../../docs/release/test-summary.json",import.meta.url),"utf8"));
      const count=(v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<=100000?v:null;
      return {status:["PASS","FAIL","NOT_RUN"].includes(data.status)?data.status:"NOT_RUN",
        passedSuites:count(data.passedSuites),failedSuites:count(data.failedSuites),
        classification:"LOCAL_REGRESSION_NOT_LIVE_MODEL"};
    })
  ],{redactedErrors:true});
}
