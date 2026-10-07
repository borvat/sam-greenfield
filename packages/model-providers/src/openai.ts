import type { ModelProviderAdapter,ModelTask,ProviderResult } from "../../model-gateway/src/types";
import { fetchJson,result,taskPrompt } from "./common";

function responseText(body:any):string{
  if(typeof body?.output_text==="string") return body.output_text;
  const parts:string[]=[];
  for(const item of body?.output??[]){
    for(const content of item?.content??[]){
      if(typeof content?.text==="string") parts.push(content.text);
    }
  }
  return parts.join("\n");
}

export class OpenAIResponsesAdapter implements ModelProviderAdapter{
  readonly providerId="openai";
  constructor(private readonly options:{
    apiKey:string;
    baseUrl?:string;
    timeoutMs?:number;
  }){}

  async invoke(task:ModelTask,model:string):Promise<ProviderResult>{
    const body=await fetchJson(
      `${(this.options.baseUrl??"https://api.openai.com/v1").replace(/\/$/,"")}/responses`,
      {
        method:"POST",
        headers:{
          authorization:`Bearer ${this.options.apiKey}`,
          "content-type":"application/json"
        },
        body:JSON.stringify({
          model,
          input:taskPrompt(task)
        })
      },
      this.options.timeoutMs
    );

    return result(
      responseText(body),
      body?.model??model,
      {
        inputTokens:body?.usage?.input_tokens,
        outputTokens:body?.usage?.output_tokens
      },
      body?.model
    );
  }
}
