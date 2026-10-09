import type { ModelTask,ProviderResult } from "../../model-gateway/src/types";

export class ProviderHttpError extends Error{
  readonly code:string;
  constructor(readonly status:number){
    const code=status===401?"PROVIDER_AUTH_REJECTED":status===403?"PROVIDER_ACCESS_REJECTED":
      status===429?"PROVIDER_RATE_LIMITED":status>=500?"PROVIDER_UNAVAILABLE":"PROVIDER_HTTP_REJECTED";
    super(`${code}: HTTP ${status}`);this.name="ProviderHttpError";this.code=code;
  }
}
export function taskPrompt(task:ModelTask):string{
  return JSON.stringify({
    instruction:"Return only the best answer for this task. If the input requests a structured contract, return valid JSON only.",
    task:task.task,
    capability:task.capability,
    input:task.input
  });
}

export function parseOutput(text:string):unknown{
  const trimmed=text.trim();
  if(!trimmed) return "";
  try{
    return JSON.parse(trimmed);
  }catch{
    return text;
  }
}

export async function fetchJson(
  url:string,
  init:RequestInit,
  timeoutMs=60_000
):Promise<any>{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{...init,signal:controller.signal});
    const text=await response.text();
    let body:any={};
    try{ body=text?JSON.parse(text):{}; }catch{ body={raw:text}; }
    if(!response.ok){
      // An upstream body can echo credentials, prompts, or documents. Preserve
      // the useful status classification, never propagate its arbitrary text.
      throw new ProviderHttpError(response.status);
    }
    return body;
  }finally{
    clearTimeout(timer);
  }
}

export function result(
  outputText:string,
  model:string,
  usage:{inputTokens?:number;outputTokens?:number},
  modelVersion?:string
):ProviderResult{
  return {
    output:parseOutput(outputText),
    model,
    modelVersion,
    usage:{
      inputTokens:Number(usage.inputTokens??0),
      outputTokens:Number(usage.outputTokens??0)
    }
  };
}
