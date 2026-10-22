import {sha256Hex} from '../../shared/src/stableJson';
import type {ProviderConfig} from '../../model-gateway/src/types';
import type {VerificationContractSpec} from '../../../apps/production/src/verificationContracts';
type Reader={query(sql:string,values?:any[]):Promise<{rows:any[]}>};
// Read-only: no registry overwrite, health reset or provider invocation.
// The manifest must cover the complete nominated registry, not a sampled subset.
export async function assertExactRegistryParity(c:Reader,expected:{models:ProviderConfig[];contracts:VerificationContractSpec[]}){
 const models=(await c.query('SELECT provider_id,models,capabilities,privacy_class_allowed,cost_per_1k_input,cost_per_1k_output FROM model_providers ORDER BY provider_id')).rows;
 const contracts=(await c.query('SELECT capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result FROM verification_contracts ORDER BY capability_id')).rows;
 const sorted=(a:any[],key:string)=>[...a].sort((x,y)=>x[key].localeCompare(y[key]));
 const wantModels=sorted(expected.models.map(m=>({provider_id:m.providerId,models:m.models,capabilities:m.capabilities,privacy_class_allowed:m.privacyClasses,cost_per_1k_input:m.costPer1kInput,cost_per_1k_output:m.costPer1kOutput})),'provider_id');
 const wantContracts=sorted(expected.contracts.map(c=>({capability_id:c.capabilityId,description:c.description,verification_method:c.verificationMethod,required_evidence_fields:c.requiredEvidenceFields,independent_query_template:c.independentQueryTemplate,must_not_trust_execution_result:true})),'capability_id');
 if(new Set(wantModels.map(m=>m.provider_id)).size!==wantModels.length||new Set(wantContracts.map(c=>c.capability_id)).size!==wantContracts.length)throw Error('REGISTRY_MANIFEST_DUPLICATE');
 if(sha256Hex(models)!==sha256Hex(wantModels)||sha256Hex(contracts)!==sha256Hex(wantContracts))throw Error('REGISTRY_EXACT_PARITY_REQUIRED');
 return {models:models.length,contracts:contracts.length,manifestHash:sha256Hex({models:wantModels,contracts:wantContracts})};
}
