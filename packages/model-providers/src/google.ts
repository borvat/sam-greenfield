import type { ModelProviderAdapter,ModelTask,ProviderResult } from "../../model-gateway/src/types";
import { fetchJson,result,taskPrompt } from "./common";

export class GoogleGeminiAdapter implements ModelProviderAdapter{
  readonly providerId="google";
  constructor(private readonly options:{
    apiKey:string;
    baseUrl?:string;
    timeoutMs?:number;
  }){}

  async invoke(task:ModelTask,model:string):Promise<ProviderResult>{
    const base=(this.options.baseUrl??"https://generativelanguage.googleapis.com/v1beta/models").replace(/\/$/,"");
    const body=await fetchJson(
      `${base}/${encodeURIComponent(model)}:generateContent`,
      {
        method:"POST",
        headers:{
          "x-goog-api-key":this.options.apiKey,
          "content-type":"application/json"
        },
        body:JSON.stringify({
          contents:[{
            role:"user",
            parts:[{text:taskPrompt(task)}]
          }]
        })
      },
      this.options.timeoutMs
    );

    const text=(body?.candidates?.[0]?.content?.parts??[])
      .filter((part:any)=>typeof part?.text==="string")
      .map((part:any)=>part.text)
      .join("\n");

    return result(
      text,
      model,
      {
        inputTokens:body?.usageMetadata?.promptTokenCount,
        outputTokens:body?.usageMetadata?.candidatesTokenCount
      },
      body?.modelVersion
    );
  }
}
