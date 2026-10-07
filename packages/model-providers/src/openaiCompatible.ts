import type { ModelProviderAdapter,ModelTask,ProviderResult } from "../../model-gateway/src/types";
import { fetchJson,result,taskPrompt } from "./common";

export class OpenAICompatibleChatAdapter implements ModelProviderAdapter{
  constructor(
    readonly providerId:string,
    private readonly options:{
      apiKey:string;
      baseUrl:string;
      timeoutMs?:number;
      extraHeaders?:Record<string,string>;
    }
  ){}

  async invoke(task:ModelTask,model:string):Promise<ProviderResult>{
    const body=await fetchJson(
      `${this.options.baseUrl.replace(/\/$/,"")}/chat/completions`,
      {
        method:"POST",
        headers:{
          authorization:`Bearer ${this.options.apiKey}`,
          "content-type":"application/json",
          ...(this.options.extraHeaders??{})
        },
        body:JSON.stringify({
          model,
          messages:[{
            role:"user",
            content:taskPrompt(task)
          }]
        })
      },
      this.options.timeoutMs
    );

    const text=body?.choices?.[0]?.message?.content;
    if(typeof text!=="string"){
      throw new Error(`${this.providerId} response missing choices[0].message.content`);
    }

    return result(
      text,
      body?.model??model,
      {
        inputTokens:body?.usage?.prompt_tokens,
        outputTokens:body?.usage?.completion_tokens
      },
      body?.model
    );
  }
}
