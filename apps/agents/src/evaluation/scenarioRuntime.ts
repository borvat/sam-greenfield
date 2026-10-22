import type {ModelProviderAdapter} from '../../../../packages/model-gateway/src/types';
import {validateProductionBundle} from '../../../production/src/bundle';
import {ceiling,type SpecialistConfig} from '../intelligence/contracts';
import {frozenEvaluationSources} from './frozenSources';
import {commercialScenario} from './scenarios';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
/** Configuration for the existing executive/kernel/gateway composition. This
 * contains no model decisions, expected answers, planner or alternate engine. */
export function commercialEvaluationBundle(companyId:string,caseId:string,adapter:ModelProviderAdapter,model={name:'fixture',inputPer1k:0.001,outputPer1k:0.001}){
 const scenario=commercialScenario(caseId);if(!scenario)throw Error('UNKNOWN_COMMERCIAL_SCENARIO');
 const limits={...ceiling,models:20,tools:20,tokens:640000,costUsd:0.75,elapsedMs:120000};
 const configs:SpecialistConfig[]=[
  {capabilityId:'specialist.executive',agentId:'executive-specialist',purpose:'Develop and revise an evidence-based research plan; delegate independent work and synthesize a bounded recommendation',allowedCapabilities:['specialist.market','specialist.risk','source.read'],limits},
  {capabilityId:'specialist.market',agentId:'market-specialist',purpose:'Independently analyze commercial opportunity, evidence and assumptions',allowedCapabilities:['source.read'],limits},
  {capabilityId:'specialist.risk',agentId:'risk-specialist',purpose:'Independently challenge commercial assumptions and quantify uncertainty',allowedCapabilities:['source.read'],limits}
 ];
 const index=scenario.sources.map(({id,publisher,publishedAt,reliability})=>({id,publisher,publishedAt,reliability}));
 for(const cfg of configs)cfg.purpose+=' Frozen observation date: '+scenario.asOf+'. Source index (read for content): '+JSON.stringify(index)+'. Quotations must bind topic to sourceData.topic/value or an exact sourceData field name. Keep calculations and recommendations in the inference summary, never trusted quotations.';
 const reasoners=configs.map(c=>({capabilityId:c.capabilityId,authorityClass:'GREEN' as const,specialistAgentId:c.agentId,specialistVersion:'1',sideEffect:false,companyScopes:[companyId],parameters:{type:'object',properties:{objective:{type:'string'}},required:['objective'],additionalProperties:false}}));
 const source={capabilityId:'source.read',authorityClass:'GREEN' as const,specialistAgentId:'source-specialist',specialistVersion:'1',sideEffect:false,companyScopes:[companyId],parameters:{type:'object',properties:{channel:{type:'string',enum:scenario.sources.map(s=>s.id)}},required:['channel'],additionalProperties:false}};
 const caps=[...reasoners,source],frozen=frozenEvaluationSources(caseId,Object.fromEntries(scenario.sources.map(s=>[s.id,s.id])));
 const bundle=validateProductionBundle({capabilities:caps,toolDefinitions:caps.map(c=>({capabilityId:c.capabilityId,authorityClass:c.authorityClass,sideEffect:false,costUpperBoundUsd:0,companyScopes:[companyId]})),
  toolAdapters:[...reasoners.map(c=>({capabilityId:c.capabilityId,async execute(){throw Error('REASONING_DISPATCH_REQUIRED');}})),frozen.adapter],verificationAdapters:[frozen.verifier],modelAdapters:[adapter],
  modelProviderConfigs:[{providerId:adapter.providerId,models:[model.name],capabilities:['planning','specialist_reasoning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:model.inputPer1k,costPer1kOutput:model.outputPer1k}],replanPolicy:{recoverableEvidenceReasons:[]},workerLeaseTtlSeconds:5});
 return {bundle,configs,limits,scenario,capabilityHash:sha256Hex({catalog:bundle.catalog.planningDescriptors(),tools:Object.keys(bundle.catalog.authorityPolicies()).map(id=>bundle.tools.definition(id))})};
}
