import {pool} from '../../../packages/db/src/client';
import {HermesClient,HermesError,type Receipt,type ReceiptStore} from '../../../packages/hermes/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {ProductionBundle,VerificationAdapter} from './types';
import type {ToolExecutionRequest} from '../../../packages/tool-gateway/src/types';

export const HERMES_CAPABILITY='hermes.generate_candidate';
export const HERMES_VERIFICATION_CONTRACTS=[{
  capabilityId:HERMES_CAPABILITY,description:'Independent validation of the exact Hermes candidate; remote success alone is insufficient',
  verificationMethod:'external_event' as const,requiredEvidenceFields:{candidateHash:'string',independentCheck:'string'},
  independentQueryTemplate:{method:'operator_registered_independent_checker'}
}];
const parameters={type:'object',additionalProperties:false,required:['instructions','agent_role'],properties:{
  instructions:{type:'string',minLength:1,maxLength:16000},
  agent_role:{type:'string',enum:['programmer','code_reviewer','researcher','data_analyst','tester']}
}};

/** Explicit composition only. No default bundle, production startup, UI, authority,
 * schema, live-release gate, credentials, or deployment is changed by importing this. */
export function withHermesCandidate(bundle:ProductionBundle,options:{client:HermesClient;verifier:VerificationAdapter}):ProductionBundle{
  if(options.verifier.capabilityId!==HERMES_CAPABILITY)throw new HermesError('HERMES_VERIFIER_CAPABILITY_MISMATCH');
  return {...bundle,
    capabilities:[...bundle.capabilities,{capabilityId:HERMES_CAPABILITY,authorityClass:'GREEN',specialistAgentId:'hermes',
      specialistVersion:'sam-adapter-v1',description:'Ask a tool-free Hermes profile for an unverified candidate. No repository access.',parameters}],
    toolDefinitions:[...bundle.toolDefinitions,{capabilityId:HERMES_CAPABILITY,authorityClass:'GREEN',sideEffect:false,costUpperBoundUsd:0,inputSchema:parameters}],
    toolAdapters:[...bundle.toolAdapters,{capabilityId:HERMES_CAPABILITY,async execute(request:ToolExecutionRequest){
      if(!request.executionContext)throw new HermesError('HERMES_TRUSTED_WORK_CONTEXT_REQUIRED');
      if(Object.keys(request.params).sort().join(',')!=='agent_role,instructions')throw new HermesError('HERMES_TASK_SCOPE_DENIED');
      const {queueId,fencingToken}=request.executionContext;
      const db=await pool.connect();let locked=false;
      try{
        // One remote task across every worker sharing this SAM database. Do not
        // hold a SQL transaction open while waiting on an external agent.
        locked=(await db.query("SELECT pg_try_advisory_lock(hashtext('sam-hermes-single-flight')) AS locked")).rows[0].locked;
        if(!locked)throw new HermesError('HERMES_BUSY');
        const active=async()=>{
          const r=await db.query(`SELECT w.goal_id,w.created_at,w.handoff FROM work_queue w JOIN goals g ON g.id=w.goal_id
            WHERE w.id=$1 AND w.fencing_token=$2 AND w.capability_id=$3 AND w.status IN ('LEASED','EXECUTING')
              AND w.lease_expiry>now() AND g.state='EXECUTING' AND g.current_plan_id=w.plan_id`,[queueId,fencingToken,HERMES_CAPABILITY]);
          if(r.rowCount!==1)throw new HermesError('HERMES_WORK_NO_LONGER_AUTHORIZED');return r.rows[0];
        };
        const work=await active();
        const store:ReceiptStore={assertActive:async()=>{await active();},load:async()=>(await active()).handoff?.hermes,
          save:async(receipt:Receipt)=>{
            await active();
            const saved=await db.query(`UPDATE work_queue w SET handoff=jsonb_set(COALESCE(w.handoff,'{}'::jsonb),'{hermes}',$3::jsonb,true)
              FROM goals g WHERE w.id=$1 AND w.fencing_token=$2 AND w.status IN ('LEASED','EXECUTING') AND w.lease_expiry>now()
              AND g.id=w.goal_id AND g.state='EXECUTING' AND g.current_plan_id=w.plan_id`,[queueId,fencingToken,JSON.stringify(receipt)]);
            if(saved.rowCount!==1)throw new HermesError('HERMES_RECEIPT_FENCE_LOST');
          }};
        const receipt=await options.client.execute({task_id:queueId,goal_id:work.goal_id,agent_role:request.params.agent_role as any,
          instructions:request.params.instructions as string,allowed_tools:[],repository_scope:[],
          execution_budget:{max_cost_usd:0,max_concurrency:1},timeout:120000,created_at:new Date(work.created_at).toISOString()},store);
        if(receipt.status!=='completed')throw new HermesError('HERMES_REMOTE_'+receipt.status.toUpperCase());
        const runtime=receipt.runtime as any;
        if(runtime?.provider!=='nous'||runtime.model!=='poolside/laguna-s-2.1:free')throw new HermesError('HERMES_SERVED_MODEL_MISMATCH');
        if(typeof receipt.output!=='string')throw new HermesError('HERMES_CANDIDATE_MISSING');
        return {result:{task_id:queueId,goal_id:work.goal_id,status:'IMPLEMENTED',candidate:receipt.output},
          evidence:{task_id:queueId,goal_id:work.goal_id,run_id:receipt.runId,candidateHash:sha256Hex(receipt.output),
            remoteStatus:receipt.status,verification:'PENDING_INDEPENDENT_CHECK',configuredCostCeilingUsd:0,actualBilling:'UNKNOWN'}};
      }finally{try{if(locked)await db.query("SELECT pg_advisory_unlock(hashtext('sam-hermes-single-flight'))");}finally{db.release();}}
    }}],verificationAdapters:[...(bundle.verificationAdapters??[]),{capabilityId:HERMES_CAPABILITY,async verify(input){
      const candidate=input.execution.result?.candidate;
      if(typeof candidate!=='string'||input.execution.evidence.candidateHash!==sha256Hex(candidate))
        return {result:'FAILED',verifier:'sam-hermes-candidate-binding',evidence:{reason:'HERMES_CANDIDATE_BINDING_MISMATCH'}};
      // This checker must establish task semantics independently. Re-reading
      // Hermes' run or hashing its answer is NOT an independent success proof.
      return options.verifier.verify(input);
    }}]
  };
}
