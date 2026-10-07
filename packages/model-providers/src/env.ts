import type { DataClassification,ProviderConfig,ModelProviderAdapter } from "../../model-gateway/src/types";
import { OpenAIResponsesAdapter } from "./openai";
import { AnthropicMessagesAdapter } from "./anthropic";
import { GoogleGeminiAdapter } from "./google";
import { OpenAICompatibleChatAdapter } from "./openaiCompatible";

function list(value:string|undefined,fallback:string[]):string[]{
  const parsed=(value??"").split(",").map((v)=>v.trim()).filter(Boolean);
  return parsed.length?parsed:fallback;
}

function numberValue(value:string|undefined,fallback=0):number{
  if(value===undefined||value==="") return fallback;
  const n=Number(value);
  if(!Number.isFinite(n)||n<0) throw new Error("Provider cost must be a non-negative number");
  return n;
}

function privacy(value:string|undefined):DataClassification[]{
  const allowed=new Set<DataClassification>(["PUBLIC","INTERNAL","CONFIDENTIAL","RESTRICTED"]);
  const values=list(value,["PUBLIC","INTERNAL"]) as DataClassification[];
  for(const item of values){
    if(!allowed.has(item)) throw new Error(`Invalid privacy class: ${item}`);
  }
  return values;
}

function config(input:{
  providerId:string;
  model:string;
  env:NodeJS.ProcessEnv;
  prefix:string;
}):ProviderConfig{
  return {
    providerId:input.providerId,
    models:[input.model],
    capabilities:list(input.env[`${input.prefix}_CAPABILITIES`],["planning"]),
    privacyClasses:privacy(input.env[`${input.prefix}_PRIVACY_CLASSES`]),
    health:"HEALTHY",
    costPer1kInput:numberValue(input.env[`${input.prefix}_COST_PER_1K_INPUT`]),
    costPer1kOutput:numberValue(input.env[`${input.prefix}_COST_PER_1K_OUTPUT`])
  };
}

export function buildStandardModelProvidersFromEnv(
  env:NodeJS.ProcessEnv=process.env
):{adapters:ModelProviderAdapter[];configs:ProviderConfig[]}{
  const adapters:ModelProviderAdapter[]=[];
  const configs:ProviderConfig[]=[];

  const add=(adapter:ModelProviderAdapter,model:string,prefix:string)=>{
    adapters.push(adapter);
    configs.push(config({providerId:adapter.providerId,model,env,prefix}));
  };

  if(env.OPENAI_API_KEY&&env.OPENAI_MODEL){
    add(new OpenAIResponsesAdapter({
      apiKey:env.OPENAI_API_KEY,
      baseUrl:env.OPENAI_BASE_URL
    }),env.OPENAI_MODEL,"OPENAI");
  }

  if(env.ANTHROPIC_API_KEY&&env.ANTHROPIC_MODEL){
    add(new AnthropicMessagesAdapter({
      apiKey:env.ANTHROPIC_API_KEY,
      baseUrl:env.ANTHROPIC_BASE_URL
    }),env.ANTHROPIC_MODEL,"ANTHROPIC");
  }

  if(env.GOOGLE_API_KEY&&env.GOOGLE_MODEL){
    add(new GoogleGeminiAdapter({
      apiKey:env.GOOGLE_API_KEY,
      baseUrl:env.GOOGLE_BASE_URL
    }),env.GOOGLE_MODEL,"GOOGLE");
  }

  if(env.DEEPSEEK_API_KEY&&env.DEEPSEEK_MODEL){
    add(new OpenAICompatibleChatAdapter("deepseek",{
      apiKey:env.DEEPSEEK_API_KEY,
      baseUrl:env.DEEPSEEK_BASE_URL||"https://api.deepseek.com"
    }),env.DEEPSEEK_MODEL,"DEEPSEEK");
  }

  if(env.QWEN_API_KEY&&env.QWEN_MODEL&&env.QWEN_BASE_URL){
    add(new OpenAICompatibleChatAdapter("qwen",{
      apiKey:env.QWEN_API_KEY,
      baseUrl:env.QWEN_BASE_URL
    }),env.QWEN_MODEL,"QWEN");
  }

  return {adapters,configs};
}
