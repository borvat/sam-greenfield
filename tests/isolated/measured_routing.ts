import assert from 'node:assert/strict';
import {test} from 'node:test';
import {routeModel} from '../../packages/model-gateway/src/router';
import {rankMeasured,type MeasuredRoutingPolicy} from '../../packages/model-gateway/src/measuredRouting';
import {openRouterModelConfig} from '../../packages/model-providers/src/openrouterCatalog';
const now=Date.now(),date=new Date(now).toISOString();
const providers=['small','large','unknown'].map((providerId,i)=>({providerId,models:['test'],capabilities:['planning'],privacyClasses:['PUBLIC' as const],health:'HEALTHY' as const,costPer1kInput:[.01,.1,.001][i],costPer1kOutput:0}));
const policy:MeasuredRoutingPolicy={version:1,taskClass:'executive_planning',evaluationSet:'held-out-v1',minimumSamples:10,minimumScore:.8,equivalenceMargin:.02,maximumAgeMs:3600000,
 observations:[{providerId:'small',model:'test',taskClass:'executive_planning',evaluationSet:'held-out-v1',score:.91,samples:20,observedAt:date,evidenceHash:'a'.repeat(64)},
 {providerId:'large',model:'test',taskClass:'executive_planning',evaluationSet:'held-out-v1',score:.92,samples:20,observedAt:date,evidenceHash:'b'.repeat(64)}]};
const task={task:'executive_planning',capability:'planning',dataClassification:'PUBLIC' as const,input:{},preferredProviders:['large']};
test('equivalent measured quality chooses cheaper despite provider preference; unknown quality is excluded',()=>{
 const r=routeModel(task,providers,{},policy);assert.deepEqual(r.map(c=>c.providerId),['small','large']);assert.match(r[0].reason,/quality=measured/);
});
test('materially stronger measured quality ranks above price; no model name guessing',()=>{
 const p=structuredClone(policy);p.observations[0].score=.85;assert.equal(routeModel(task,providers,{},p)[0].providerId,'large');
});
test('stale, future, wrong-suite and insufficient samples never become measured eligibility',()=>{
 const base=routeModel(task,providers);
 for(const change of [{observedAt:new Date(now-3600001).toISOString()},{observedAt:new Date(now+10000).toISOString()},{evaluationSet:'other'},{samples:1}]){
  const p=structuredClone(policy);p.observations=p.observations.map(o=>({...o,...change}));assert.deepEqual(rankMeasured(base,providers,p,now),[]);
 }
});
test('invalid costs and duplicate quality observations fail safely',()=>{
 assert.equal(routeModel(task,[{...providers[0],costPer1kInput:NaN}]).length,0);
 const p=structuredClone(policy);p.observations.push(p.observations[0]);assert.throws(()=>routeModel(task,providers,{},p),/OBSERVATION_INVALID/);
});
const catalog={data:[{id:'vendor/test-model',context_length:8192,supported_parameters:['max_tokens','response_format'],pricing:{prompt:'0.000001',completion:'0.000002',request:'0'}}]};
const options={retrievedAt:date,now,capabilities:['planning'],privacyClasses:['PUBLIC' as const]};
test('OpenRouter per-token catalog rates convert to per-1000 rates',()=>{
 const c=openRouterModelConfig(catalog,'vendor/test-model',options);assert.equal(c.costPer1kInput,.001);assert.equal(c.costPer1kOutput,.002);
});
test('OpenRouter stale or incomplete pricing is not a zero-cost fallback',()=>{
 assert.throws(()=>openRouterModelConfig(catalog,'missing',options),/EXACT_MODEL_REQUIRED/);
 assert.throws(()=>openRouterModelConfig(catalog,'vendor/test-model',{...options,retrievedAt:new Date(now-86400001).toISOString()}),/CATALOG_STALE/);
 for(const pricing of [{...catalog.data[0].pricing,request:'.1'},{...catalog.data[0].pricing,overrides:[{prompt:'1'}]},{prompt:null,completion:'0'}]){
  assert.throws(()=>openRouterModelConfig({data:[{...catalog.data[0],pricing}]},'vendor/test-model',options));
 }
});
test('context and native tool requirements fail closed when metadata is absent or insufficient',()=>{
 assert.equal(routeModel({...task,requiresToolCalling:true},providers).length,0);
 assert.equal(routeModel({...task,requiredContextTokens:8192},providers).length,0);
 const p={...providers[0],supportsToolCalling:true,contextWindowTokens:8192,maxOutputTokens:2048};
 assert.equal(routeModel({...task,requiresToolCalling:true,requiredContextTokens:8192},[p]).length,1);
 assert.equal(routeModel(task,[p],{inputTokens:8192,outputTokens:1}).length,0);
 assert.equal(routeModel(task,[p],{outputTokens:2049}).length,0);
 assert.throws(()=>routeModel(task,[p],{inputTokens:-1}));
});

test('unconfigured registry pricing is excluded instead of becoming a free model',async()=>{
 const {loadProviderRegistry}=await import('../../packages/model-gateway/src/registry');
 const row={provider_id:'missing-price',models:['m'],capabilities:['planning'],privacy_class_allowed:['INTERNAL'],health:'HEALTHY',cost_per_1k_input:null,cost_per_1k_output:null};
 const providers=await loadProviderRegistry({query:async()=>({rows:[row]})});
 assert(Number.isNaN(providers[0].costPer1kInput));
 assert.deepEqual(routeModel({task:'plan',capability:'planning',dataClassification:'INTERNAL',input:{}},providers),[]);
 const free=await loadProviderRegistry({query:async()=>({rows:[{...row,cost_per_1k_input:0,cost_per_1k_output:0}]})});
 assert.equal(routeModel({task:'plan',capability:'planning',dataClassification:'INTERNAL',input:{}},free)[0].estimatedCostUsd,0);
});
