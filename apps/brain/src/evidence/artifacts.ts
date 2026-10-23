import {evidenceFamily,type DelegationPolicy} from './delegationScope';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {transformVerifiedSources,assertExecutionIntegrity} from './verifiedSources';
import {contractDigest,type OutputContracts} from './contracts';
export const DERIVE_CAPABILITY='derive_verified_evidence';
export type DeriveRequest={sources:Record<string,{executionId:string;contractId:string}>;plan:import('./transforms').TransformPlan};
export type EvidenceScope={goalId:string;legalEntityId:string;delegationPolicy?:DelegationPolicy};
export async function deriveArtifact(client:any,scope:EvidenceScope,request:DeriveRequest,registry:OutputContracts){
 if(!request||Object.keys(request).some(k=>!['sources','plan'].includes(k))||!request.sources||Array.isArray(request.sources)||Buffer.byteLength(JSON.stringify(request))>16000)throw Error('EVIDENCE_REQUEST_INVALID');
 const family=scope.delegationPolicy?await evidenceFamily(client,scope.goalId,scope.legalEntityId,scope.delegationPolicy):undefined;
 const goalIds=family?.goalIds??[scope.goalId];
 const entries=Object.entries(request.sources);if(!entries.length||entries.length>8)throw Error('EVIDENCE_SOURCE_LIMIT');
 const sources:Record<string,string>={},contracts:Record<string,any>={},contractBindings:Record<string,string>={};
 for(const [alias,ref] of entries){
  if(!ref||Object.keys(ref).some(k=>!['executionId','contractId'].includes(k)))throw Error('EVIDENCE_REQUEST_INVALID');
  const contract=registry.find(c=>c.id===ref.contractId);if(!contract||contract.capabilityId===DERIVE_CAPABILITY)throw Error('EVIDENCE_OUTPUT_SCHEMA_UNKNOWN');
  const row=(await client.query(`SELECT e.capability_id FROM executions e JOIN goals g ON g.id=e.goal_id WHERE e.id=$1 AND e.goal_id=ANY($2::uuid[]) AND g.company_scope=$3`,[ref.executionId,goalIds,scope.legalEntityId])).rows[0];
  if(row?.capability_id!==contract.capabilityId)throw Error('EVIDENCE_CONTRACT_SCOPE_MISMATCH');
  if(contracts[contract.capabilityId]&&sha256Hex(contracts[contract.capabilityId])!==sha256Hex(contract.extraction))throw Error('EVIDENCE_CONTRACT_CONFLICT');
  contracts[contract.capabilityId]=contract.extraction;sources[alias]=ref.executionId;contractBindings[alias]=contractDigest(contract);
 }
 const output=await transformVerifiedSources(client,{...scope,sources,plan:request.plan},contracts,scope.delegationPolicy);
 const content={version:1 as const,goalId:scope.goalId,legalEntityId:scope.legalEntityId,request,contractBindings,output};
 const artifact={...content,artifactId:sha256Hex(content)};
 if(Buffer.byteLength(JSON.stringify(artifact))>250000)throw Error('EVIDENCE_SIZE_LIMIT');
 return artifact;
}
export type DerivedArtifact=Awaited<ReturnType<typeof deriveArtifact>>;
/** Independent replay against current verification and reviewed contract versions. */
export async function replayArtifact(client:any,scope:EvidenceScope,artifact:DerivedArtifact,registry:OutputContracts){
 if(!artifact||artifact.version!==1||artifact.goalId!==scope.goalId||artifact.legalEntityId!==scope.legalEntityId)throw Error('EVIDENCE_ARTIFACT_SCOPE_MISMATCH');
 const replay=await deriveArtifact(client,scope,artifact.request,registry);
 if(sha256Hex(replay)!==sha256Hex(artifact))throw Error('EVIDENCE_ARTIFACT_REPLAY_MISMATCH');
 return replay;
}

/** Stored artifacts must retain both execution integrity and current raw lineage. */
export async function replayStoredArtifact(client:any,scope:EvidenceScope,executionId:string,registry:OutputContracts,requireVerified=true){
 const row=(await client.query(`SELECT e.*,v.result verification_result,v.execution_hash verified_hash,v.plan_hash verified_plan_hash
  FROM executions e JOIN goals g ON g.id=e.goal_id LEFT JOIN LATERAL(SELECT result,execution_hash,plan_hash FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
  WHERE e.id=$1 AND e.goal_id=$2 AND g.company_scope=$3 AND e.capability_id=$4 AND octet_length(e.result::text)<=250000`,[executionId,scope.goalId,scope.legalEntityId,DERIVE_CAPABILITY])).rows[0];
 if(!row||requireVerified&&(row.verification_result!=='VERIFIED'||row.verified_hash!==row.execution_hash||row.verified_plan_hash!==row.plan_hash))throw Error('EVIDENCE_ARTIFACT_VERIFICATION_REQUIRED');
 assertExecutionIntegrity({...row,verified_plan_hash:requireVerified?row.verified_plan_hash:undefined});
 return replayArtifact(client,scope,row.result?.derivedEvidence,registry);
}
