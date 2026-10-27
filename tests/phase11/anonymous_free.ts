import assert from "node:assert/strict";
import {test} from "node:test";
import {AnonymousFreeChatAdapter, FREE_PROVIDERS} from "../../packages/model-providers/src/anonymousFree";
import {buildStandardModelProvidersFromEnv} from "../../packages/model-providers/src/env";
import {routeModel} from "../../packages/model-gateway/src/router";
import type {ModelTask, ProviderConfig} from "../../packages/model-gateway/src/types";
import {ProviderHttpError} from "../../packages/model-providers/src/common";

const env={SAM_FREE_OVH_ENABLED:"1",SAM_FREE_KILO_ENABLED:"1"};
const task:ModelTask={task:"public_text",capability:"public_free",dataClassification:"PUBLIC",
  input:{objective:"Synthetic example only: return JSON with answer=42"},
  maxCostUsd:0,allowedProviders:["ovh-free","kilo-free"]};
let time=10_000_000_000_000;
function fixture(id:"ovh-free"|"kilo-free"="ovh-free",override:any={}) {
  time+=1_000_000;
  const seen:{url:string;init:RequestInit}[]=[];
  const waits:number[]=[];
  const clock=time;
  const adapter=new AnonymousFreeChatAdapter(id,{now:()=>clock,wait:async(ms)=>{waits.push(ms);},
    transport:async(url,init)=>{seen.push({url,init});
      const request=JSON.parse(init.body as string);
      return {id:"synthetic-response",model:request.model,choices:[{finish_reason:"stop",message:{content:'{"answer":42}'}}],
        usage:{prompt_tokens:12,completion_tokens:5,cost:0},...override};}});
  return {adapter,seen,waits,model:FREE_PROVIDERS[id].models[0]};
}

test("free providers are opt-in and preserve existing provider identity and privacy",()=>{
  assert.deepEqual(buildStandardModelProvidersFromEnv({}),{adapters:[],configs:[]});
  const ordinary={DEEPSEEK_API_KEY:"fixture",DEEPSEEK_MODEL:"deepseek-existing"};
  const before=buildStandardModelProvidersFromEnv(ordinary);
  const after=buildStandardModelProvidersFromEnv({...ordinary,...env});
  assert.deepEqual(after.configs[0],before.configs[0]);
  assert.deepEqual(after.configs.slice(1).map(p=>p.providerId),["ovh-free","kilo-free"]);
  assert.deepEqual(after.configs.slice(1).flatMap(p=>p.models),
    ["Qwen3.5-397B-A17B","Qwen3.5-9B","liquid/lfm-2.5-2.6b:free"]);
  assert(after.configs.slice(1).every(p=>p.privacyClasses.join()==="PUBLIC" && p.capabilities.join()==="public_free"));
  assert.equal(after.configs[2].health,"DEGRADED");
});

test("ordinary planning never selects anonymous providers",()=>{
  const providers=buildStandardModelProvidersFromEnv(env).configs;
  assert.deepEqual(routeModel({...task,capability:"planning"},providers),[]);
  assert.deepEqual(routeModel({...task,dataClassification:"INTERNAL"},providers),[]);
});

test("hard provider selection excludes paid fallback even with misleading zero metadata",()=>{
  const providers=buildStandardModelProvidersFromEnv(env).configs;
  const paid:ProviderConfig={...providers[0],providerId:"paid-fixture",models:["paid"],costPer1kInput:0};
  const candidates=routeModel(task,[paid,...providers]);
  assert.deepEqual([...new Set(candidates.map(c=>c.providerId))],["ovh-free","kilo-free"]);
  assert.equal(candidates[0].model,"Qwen3.5-397B-A17B");
  assert.deepEqual(routeModel({...task,allowedProviders:[]},[paid,...providers]),[]);
  assert.equal(routeModel({...task,allowedProviders:undefined},[paid]).length,1);
});

test("both anonymous endpoints use real chat protocol without any authorization header",async()=>{
  for(const id of ["ovh-free","kilo-free"] as const){
    const f=fixture(id);
    const response=await f.adapter.invoke(task,f.model);
    assert.deepEqual(response.output,{answer:42});
    assert.deepEqual(response.usage,{inputTokens:12,outputTokens:5});
    assert.equal(response.model,f.model);
    assert.equal(response.providerRequestId,"synthetic-response");
    assert.equal(f.seen[0].url,`${FREE_PROVIDERS[id].baseUrl}/chat/completions`);
    assert.deepEqual(f.seen[0].init.headers,{"content-type":"application/json"});
    assert.equal(f.seen[0].init.redirect,"error");
    assert.equal(JSON.parse(f.seen[0].init.body as string).max_tokens,2048);
  }
});

test("private input, arbitrary models, implicit selection and unapproved modes fail before HTTP",async()=>{
  const f=fixture();
  for(const dataClassification of ["INTERNAL","CONFIDENTIAL","RESTRICTED"] as const)
    await assert.rejects(()=>f.adapter.invoke({...task,dataClassification},f.model),/PUBLIC_ONLY/);
  await assert.rejects(()=>f.adapter.invoke(task,"paid-model"),/MODEL_DENIED/);
  await assert.rejects(()=>f.adapter.invoke({...task,allowedProviders:undefined},f.model),/EXPLICIT_SELECTION/);
  await assert.rejects(()=>f.adapter.invoke({...task,allowedProviders:["ovh-free","paid"]},f.model),/EXPLICIT_SELECTION/);
  await assert.rejects(()=>f.adapter.invoke({...task,allowedProviders:["ovh-free","__proto__"]},f.model),/EXPLICIT_SELECTION/);
  await assert.rejects(()=>f.adapter.invoke({...task,capability:"planning"},f.model),/EXPLICIT_SELECTION/);
  await assert.rejects(()=>f.adapter.invoke({...task,input:"x".repeat(33_000)},f.model),/INPUT_TOO_LARGE/);
  await assert.rejects(()=>f.adapter.invoke({...task,boundedSynthetic:{} as any},f.model),/PERMIT_UNSUPPORTED/);
  assert.equal(f.seen.length,0);
});

test("small Qwen uses only the gateway-compatible request fields",async()=>{
  const f=fixture();
  await f.adapter.invoke(task,"Qwen3.5-9B");
  assert.deepEqual(Object.keys(JSON.parse(f.seen[0].init.body as string)).sort(),["max_tokens","messages","model","stream"]);
});

test("local quota spaces calls and rejects an unbounded queue",async()=>{
  const f=fixture();
  await f.adapter.invoke(task,f.model);
  await f.adapter.invoke(task,f.model);
  assert.deepEqual(f.waits,[31_000]);
  await assert.rejects(()=>f.adapter.invoke(task,f.model),/QUEUE_FULL/);
  assert.equal(f.seen.length,2);
});

test("cancellation prevents HTTP, including while waiting for a quota slot",async()=>{
  const f=fixture();const controller=new AbortController();controller.abort();
  await assert.rejects(()=>f.adapter.invoke({...task,signal:controller.signal},f.model),{name:"AbortError"});
  assert.equal(f.seen.length,0);
  const second=new AbortController();
  const a=new AnonymousFreeChatAdapter("ovh-free",{now:()=>time,
    wait:async()=>{second.abort();},transport:async()=>{throw Error("HTTP_MUST_NOT_RUN");}});
  await f.adapter.invoke(task,f.model);
  await assert.rejects(()=>a.invoke({...task,signal:second.signal},f.model),{name:"AbortError"});
});

test("HTTP 429 is typed, redacted and never retried inside the adapter",async()=>{
  let calls=0;time+=1_000_000;
  const a=new AnonymousFreeChatAdapter("kilo-free",{now:()=>time,transport:async()=>{
    calls++;throw new ProviderHttpError(429);
  }});
  await assert.rejects(()=>a.invoke(task,"liquid/lfm-2.5-2.6b:free"),e=>e instanceof ProviderHttpError&&e.status===429);
  assert.equal(calls,1);
});

test("model substitution, partial output and invalid or nonzero usage are rejected",async()=>{
  const overrides=[{model:"unexpected-paid-model"},{choices:[{finish_reason:"length",message:{content:"partial"}}]},
    {choices:[{finish_reason:"stop",message:{content:""}}]},{usage:{prompt_tokens:12,completion_tokens:5,cost:0.1}},
    {usage:{prompt_tokens:-1,completion_tokens:5}},{usage:{prompt_tokens:12,completion_tokens:NaN}},
    {usage:{prompt_tokens:12}}];
  for(const override of overrides){const f=fixture("ovh-free",override);
    await assert.rejects(()=>f.adapter.invoke(task,f.model),/RESPONSE_REJECTED|USAGE_REJECTED/);}
});
