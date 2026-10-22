import {createProductionComposition} from '../../../production/src/composition';
import {createSpecialistIntelligence} from './engine';
import {assertEvaluationTrial} from '../evaluation/trial';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {assertFrozenEvaluationSources} from '../evaluation/frozenSources';
/** Opt-in adapter around the existing production engine, never a second engine. */
export async function createIntelligentComposition(input:Parameters<typeof createProductionComposition>[0]&{
 intelligence:Parameters<typeof createSpecialistIntelligence>[0];concurrency?:number;
}){
 if(input.executeTool)throw Error('SPECIALIST_EXECUTOR_OVERRIDE_DENIED');
 const trial=input.intelligence.trial;
 if(trial){
  assertEvaluationTrial(trial);
  const reasoning=new Set(input.intelligence.configs.map(c=>c.capabilityId));
  if(Object.keys(input.bundle.catalog.authorityPolicies()).some(id=>id!=='source.read'&&!reasoning.has(id))||input.operationalTick||input.authorizeWork||input.bundle.raw.verifiedLearning)throw Error('EVALUATION_BUSINESS_CALLBACK_DENIED');
  assertFrozenEvaluationSources(input.bundle.tools.adapter('source.read'),input.bundle.verifiers.get('source.read'),trial.spec.caseId);
  const hash=sha256Hex({catalog:input.bundle.catalog.planningDescriptors(),tools:Object.keys(input.bundle.catalog.authorityPolicies()).map(id=>input.bundle.tools.definition(id))});
  if(hash!==trial.spec.capabilityHash)throw Error('EVALUATION_CAPABILITY_PIN_MISMATCH');
 }
 if(input.bundle.raw.plannerGateway||(input.bundle.raw.modelAdapters??[]).some(a=>a.executionMode!==(trial?'evaluation-'+trial.permit.mode:'synthetic')||a.supportsUsageLimits!==true))throw Error('SPECIALIST_SYNTHETIC_PLANNER_REQUIRED');
 if(trial&&(input.planning||input.specialistScopeGoalId))throw Error('EVALUATION_SCOPE_OVERRIDE_DENIED');
 if(input.intelligence.catalog!==input.bundle.catalog||input.intelligence.tools!==input.bundle.tools)throw Error('SPECIALIST_BUNDLE_MISMATCH');
 const engine=await createSpecialistIntelligence(input.intelligence);
 const verifiers=new Map(input.bundle.verifiers);
 for(const [id,verifier]of input.bundle.verifiers)verifiers.set(id,{capabilityId:id,
  verify:args=>engine.verifyRead(args.execution.id,()=>verifier.verify(args))});
 for(const cfg of input.intelligence.configs){
  if(verifiers.has(cfg.capabilityId))throw Error('SPECIALIST_VERIFIER_OVERRIDE_DENIED');
  verifiers.set(cfg.capabilityId,{capabilityId:cfg.capabilityId,async verify({execution}){
   const grounded=await engine.verifyReport(execution.result??{},String(execution.evidence.specialist_session??''));
   return {result:grounded?'VERIFIED':'INCONCLUSIVE',evidence:{grounded},verifier:'specialist-evidence-validator-v1'};
  }});
 }
 const composition=createProductionComposition({...input,bundle:{...input.bundle,verifiers},specialistAdvancers:engine.advancers,excludeDelegatedSpecialistPlanning:true,specialistConcurrency:input.concurrency??4,
  ...(trial?{specialistScopeGoalId:trial.rootGoalId,planning:{goalId:trial.rootGoalId,gatewayForGoal:id=>trial.gateway(input.intelligence.gateway,id,'executive-bootstrap')}}:{}),
  executeTool:engine.executeRead,
  operationalTick:async()=>{const learning=await engine.learnNextReport();return {learning,other:input.operationalTick?await input.operationalTick():null};},
  authorizeWork:async w=>{if(input.authorizeWork)await input.authorizeWork(w);await engine.beforeTool(w);}});
 return {engine,composition};
}
