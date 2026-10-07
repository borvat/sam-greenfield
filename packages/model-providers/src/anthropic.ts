import type { ModelProviderAdapter,ModelTask,ProviderResult } from "../../model-gateway/src/types";
import { fetchJson,result,taskPrompt } from "./common";

export class AnthropicMessagesAdapter implements ModelProviderAdapter{
  readonly providerId="anthropic";
  constructor(private readonly options:{
    apiKey:string;
    baseUrl?:string;
    timeoutMs?:number;
    maxTokens?:number;
  }){}

  async invoke(task:ModelTask,model:string):Promise<ProviderResult>{
    const body=await fetchJson(
      `${(this.options.baseUrl??"https://api.anthropic.com").replace(/\/$/,"")}/v1/messages`,
      {
        method:"POST",
        headers:{
          "x-api-key":this.options.apiKey,
          "anthropic-version":"2023-06-01",
          "content-type":"application/json"
        },
        body:JSON.stringify({
          model,
          max_tokens:this.options.maxTokens??4096,
          messages:[{role:"user",content:taskPrompt(task)}]
        })
      },
      this.options.timeoutMs
    );

    const text=(body?.content??[])
      .filter((part:any)=>part?.type==="text"&&typeof part?.text==="string")
      .map((part:any)=>part.text)
      .join("\n");

    return result(
      text,
      body?.model??model,
      {
        inputTokens:body?.usage?.input_tokens,
        outputTokens:body?.usage?.output_tokens
      },
      body?.model
    );
  }
}
