import {createProductionComposition} from '../../../production/src/composition';
import {createSpecialistIntelligence} from './engine';
/** Opt-in adapter around the existing production engine, never a second engine. */
export async function createIntelligentComposition(input:Parameters<typeof createProductionComposition>[0]&{
 intelligence:Parameters<typeof createSpecialistIntelligence>[0];concurrency?:number;
}){
 if(input.executeTool)throw Error('SPECIALIST_EXECUTOR_OVERRIDE_DENIED');
 if(input.bundle.raw.plannerGateway||(input.bundle.raw.modelAdapters??[]).some(a=>a.executionMode!=='synthetic'||a.supportsUsageLimits!==true))throw Error('SPECIALIST_SYNTHETIC_PLANNER_REQUIRED');
 if(input.intelligence.catalog!==input.bundle.catalog||input.intelligence.tools!==input.bundle.tools)throw Error('SPECIALIST_BUNDLE_MISMATCH');
 const engine=await createSpecialistIntelligence(input.intelligence);
 const verifiers=new Map(input.bundle.verifiers);
 for(const cfg of input.intelligence.configs){
  if(verifiers.has(cfg.capabilityId))throw Error('SPECIALIST_VERIFIER_OVERRIDE_DENIED');
  verifiers.set(cfg.capabilityId,{capabilityId:cfg.capabilityId,async verify({execution}){
   const grounded=await engine.verifyReport(execution.result??{},String(execution.evidence.specialist_session??''));
   return {result:grounded?'VERIFIED':'INCONCLUSIVE',evidence:{grounded},verifier:'specialist-evidence-validator-v1'};
  }});
 }
 const composition=createProductionComposition({...input,bundle:{...input.bundle,verifiers},specialistAdvancers:engine.advancers,excludeDelegatedSpecialistPlanning:true,specialistConcurrency:input.concurrency??4,
  executeTool:engine.executeRead,
  operationalTick:async()=>{const learning=await engine.learnNextReport();return {learning,other:input.operationalTick?await input.operationalTick():null};},
  authorizeWork:async w=>{if(input.authorizeWork)await input.authorizeWork(w);await engine.beforeTool(w);}});
 return {engine,composition};
}
