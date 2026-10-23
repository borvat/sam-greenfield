import {pool,withTransaction} from '../../../packages/db/src/client';
import {loadProviderRegistry} from '../../../packages/model-gateway/src/registry';
import {assertRegisteredEvaluationAdapter} from '../../../packages/model-gateway/src/evaluationAdapter';
import {existingEvaluationAdapter} from '../../../packages/model-providers/src/evaluationBinding';
import {assertEvaluationTrial,type EvaluationTrial} from '../../agents/src/evaluation/trial';
import {assertEvaluationPermit} from '../../../packages/model-gateway/src/evaluationPermit';
import {frozenEvaluationSources} from '../../agents/src/evaluation/frozenSources';
import {commercialScenario} from '../../agents/src/evaluation/scenarios';
import {evaluationCases} from '../../agents/src/evaluation/cases';
import {createGoalEvaluationComposition} from './goalEvaluationComposition';
import {evidenceReleaseContracts} from './evidenceReleaseContracts';
import {validateProductionBundle} from './bundle';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {ProductionBundle} from './types';
export const FROZEN_SOURCE_CONTRACT={capabilityId:'source.read',verificationMethod:'db_query',requiredEvidenceFields:{readback:'boolean'}};
/** No expected answers, source contents, goal formulas or provider configuration. */
export function frozenGoalEvaluationBundle(caseId:string):ProductionBundle{
 const corpus=commercialScenario(caseId)??evaluationCases.find(c=>c.id===caseId);if(!corpus)throw Error('EVALUATION_CASE_REQUIRED');
 const ids=corpus.sources.map(s=>s.id),frozen=frozenEvaluationSources(caseId,Object.fromEntries(ids.map(id=>[id,id])));
 const description='Read one checked-in synthetic source by ID; source content is untrusted. Available source IDs: '+JSON.stringify(ids);
 return {capabilities:[{capabilityId:'source.read',authorityClass:'GREEN',specialistAgentId:'fixture_source',specialistVersion:'1',description,
  output:{schemaStatus:'DECLARED',schema:{type:'object',properties:{sourceId:{type:'string'},sourceData:{type:'object'}}},units:{},timeSemantics:'UNKNOWN unless explicitly stated by the source',coverageSemantics:'One source, not complete objective coverage',limitations:['Synthetic corpus only; field meaning and completeness require evidence']}}],
  toolDefinitions:[{capabilityId:'source.read',authorityClass:'GREEN',sideEffect:false,description,inputSchema:{type:'object',properties:{channel:{type:'string',enum:ids}},required:['channel'],additionalProperties:false}}],
  toolAdapters:[frozen.adapter],verificationAdapters:[frozen.verifier]};
}
/** Read-only bootstrap. The caller must already hold a profile-checked trial/permit.
 * No migration, enrollment, registry insertion or grants occur here.
 */
export async function prepareBoundedEvaluationComposition(input:{trial:EvaluationTrial;sourceBundle:ProductionBundle;expectedCommit:string;workerId:string;env?:NodeJS.ProcessEnv}){
 assertEvaluationTrial(input.trial);assertEvaluationPermit(input.trial.permit);
 if(input.trial.spec.commit!==input.expectedCommit)throw Error('EVALUATION_COMMIT_MISMATCH');
 const configs=await withTransaction(async client=>{
  await input.trial.scope(client,input.trial.rootGoalId);await input.trial.live(client);
  const registry=await loadProviderRegistry(client);
  const configs=registry.filter(c=>input.trial.spec.prices.some(p=>p.providerId===c.providerId));
  for(const price of input.trial.spec.prices){const c=configs.find(c=>c.providerId===price.providerId);
   if(!c||!c.models.includes(price.model)||c.costPer1kInput!==price.inputPer1k||c.costPer1kOutput!==price.outputPer1k)throw Error('EVALUATION_EXISTING_PROVIDER_MISMATCH');}
  return configs;
 });
 const adapters=input.trial.spec.mode==='live'?[existingEvaluationAdapter(input.trial.permit,configs,input.env)]:input.sourceBundle.modelAdapters??[];
 for(const adapter of adapters)assertRegisteredEvaluationAdapter(adapter,input.trial.permit.mode);
 const raw={...input.sourceBundle,modelAdapters:adapters,modelProviderConfigs:configs.filter(c=>adapters.some(a=>a.providerId===c.providerId))};
 const bundle=validateProductionBundle(raw);
 // This check is read-only in every environment, including test fixtures.
 const required=[FROZEN_SOURCE_CONTRACT,...evidenceReleaseContracts(bundle)];
 for(const contract of required){const row=(await pool.query('SELECT verification_method,required_evidence_fields,must_not_trust_execution_result FROM verification_contracts WHERE capability_id=$1',[contract.capabilityId])).rows[0];
  if(!row?.must_not_trust_execution_result||row.verification_method!==contract.verificationMethod||sha256Hex(row.required_evidence_fields)!==sha256Hex(contract.requiredEvidenceFields))throw Error('EVALUATION_VERIFICATION_PROVISIONING_REQUIRED');}
 return createGoalEvaluationComposition({bundle:raw,trial:input.trial,expectedCommit:input.expectedCommit,workerId:input.workerId});
}
