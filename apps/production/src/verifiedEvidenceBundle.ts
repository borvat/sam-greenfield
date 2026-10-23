import {DERIVE_PARAMETERS} from '../../brain/src/evidence/planSchema';
export {DERIVE_PARAMETERS} from '../../brain/src/evidence/planSchema';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {pool} from '../../../packages/db/src/client';
import {deriveArtifact,replayStoredArtifact,DERIVE_CAPABILITY,type DeriveRequest} from '../../brain/src/evidence/artifacts';
import {freezeOutputContracts,type OutputContracts} from '../../brain/src/evidence/contracts';
import type {ProductionBundle} from './types';
export const DERIVED_VERIFICATION_CONTRACT={capabilityId:DERIVE_CAPABILITY,description:'Deterministic replay over current same-goal latest-verified records',verificationMethod:'db_query' as const,requiredEvidenceFields:{replayed:'boolean'},independentQueryTemplate:{method:'verified-evidence-replay-v1'}};
/** Explicit opt-in composition. Not called by any production startup path. */
export function withVerifiedEvidence(bundle:ProductionBundle,entries:OutputContracts,db:any=pool):ProductionBundle{
 const registry=freezeOutputContracts(entries);
 if(!registry.length||bundle.verifiedEvidenceContracts||bundle.capabilities.some(c=>c.capabilityId===DERIVE_CAPABILITY))throw Error('EVIDENCE_REGISTRATION_INVALID');
 for(const c of registry){const tool=bundle.toolDefinitions.find(t=>t.capabilityId===c.capabilityId);if(!tool||tool.sideEffect||tool.authorityClass!=='GREEN')throw Error('EVIDENCE_CONTRACT_CAPABILITY_UNSAFE');}
 const description='Compose bounded verified records using select/filter/group/sum/count/distinct/join and exact decimal arithmetic. Input execution IDs must belong to this goal and match a listed reviewed extraction contract. No new reads, arbitrary code, writes or invented semantics. Output includes row citations, limitations and replay hashes.';
 return {...bundle,verifiedEvidenceContracts:registry,
  capabilities:[...bundle.capabilities.map(c=>({...c,...(registry.some(r=>r.capabilityId===c.capabilityId)?{output:{schemaStatus:'DECLARED' as const,units:{},timeSemantics:'Per versioned extraction contract; absent metadata stays UNKNOWN',coverageSemantics:'Verified metadata only; pagination absence is not completeness',limitations:['Only listed extraction fields have reviewed semantics; other output fields remain UNKNOWN'],extractionContracts:registry.filter(r=>r.capabilityId===c.capabilityId)}}:{})})),
   {capabilityId:DERIVE_CAPABILITY,authorityClass:'GREEN',specialistAgentId:'verified_evidence',specialistVersion:'1',description,parameters:DERIVE_PARAMETERS}],
  toolDefinitions:[...bundle.toolDefinitions,{capabilityId:DERIVE_CAPABILITY,authorityClass:'GREEN',sideEffect:false,description,inputSchema:DERIVE_PARAMETERS,costUpperBoundUsd:0}],
  toolAdapters:[...bundle.toolAdapters,{capabilityId:DERIVE_CAPABILITY,async execute(request){
   if(!request.executionContext)throw Error('EVIDENCE_WORK_CONTEXT_REQUIRED');
   const {queueId,fencingToken}=request.executionContext;
   const client=await db.connect();try{
    const row=(await client.query(`SELECT g.id goal_id,g.company_scope,w.params FROM work_queue w JOIN goals g ON g.id=w.goal_id
     WHERE w.id=$1 AND w.fencing_token=$2 AND w.capability_id=$3 AND w.status IN ('LEASED','EXECUTING')
     AND w.lease_expiry>now() AND g.state='EXECUTING' AND g.current_plan_id=w.plan_id`,[queueId,fencingToken,DERIVE_CAPABILITY])).rows[0];
    if(!row||sha256Hex(row.params)!==sha256Hex(request.params))throw Error('EVIDENCE_WORK_SCOPE_REQUIRED');
    const artifact=await deriveArtifact(client,{goalId:row.goal_id,legalEntityId:row.company_scope},request.params as DeriveRequest,registry);
    // Existing fenced execution commit is the durable artifact store. Its identity
    // is content-addressed; retries replay locally and never repeat source work.
    return {result:{derivedEvidence:artifact},evidence:{artifactId:artifact.artifactId,provenanceHash:artifact.output.provenanceHash,readOnly:true}};
   }finally{client.release();}
  }}],
  verificationAdapters:[...(bundle.verificationAdapters??[]),{capabilityId:DERIVE_CAPABILITY,async verify({execution}){
   const client=await db.connect();try{
    const row=(await client.query(`SELECT e.goal_id,g.company_scope,e.result FROM executions e JOIN goals g ON g.id=e.goal_id WHERE e.id=$1 AND e.capability_id=$2`,[execution.id,DERIVE_CAPABILITY])).rows[0];
    if(!row)throw Error('EVIDENCE_EXECUTION_SCOPE_REQUIRED');
    const artifact=await replayStoredArtifact(client,{goalId:row.goal_id,legalEntityId:row.company_scope},execution.id,registry,false);
    return {result:'VERIFIED' as const,evidence:{replayed:true,artifactId:artifact.artifactId,provenanceHash:artifact.output.provenanceHash},verifier:'verified-evidence-independent-replay-v1'};
   }catch{return {result:'FAILED' as const,evidence:{replayed:false,reason:'EVIDENCE_REPLAY_REFUSED'},verifier:'verified-evidence-independent-replay-v1'};}
   finally{client.release();}
  }}]
 };
}
