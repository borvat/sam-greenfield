import type {ProductionBundle,VerificationAdapter} from './types';
import type {ToolExecutionRequest} from '../../../packages/tool-gateway/src/types';
import type {VerificationContractSpec} from './verificationContracts';

export const EXECUTIVE_BRIEF_CAPABILITY='executive_brief';
export const EXECUTIVE_BRIEF_CONTRACT_ID='executive_brief';

const parameters={
  type:'object',
  properties:{lang:{type:'string',enum:['ar','en'],description:'Language of the brief.'}},
  additionalProperties:false
} as const;

/** The contract is owned by this code, so provisioning it is an idempotent UPSERT, not a
 *  free-form migration. Production still requires the explicit enable flag below. */
export const EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS:VerificationContractSpec[]=[{
  capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
  description:'An executive brief is verified only when its trace id names a stored model_calls row for this company, that call succeeded with billed tokens, and the stored brief keeps the same facts hash.',
  verificationMethod:'db_query',
  // The kernel only accepts plain JSON types here; 'uuid' or 'integer' fail its check.
  requiredEvidenceFields:{callId:'string',factsHash:'string',provider:'string',model:'string'},
  // The trace id is not model_calls.id: the engine records it inside task as
  // executive_briefing:<callId>:<attempt>. Binding on task is the correct join.
  independentQueryTemplate:{query:"select id,provider,model,tokens,cost,success,legal_entity_id from model_calls where task like ('executive_briefing:'||$1||':%') order by created_at desc limit 1"}
}];

const verification:VerificationAdapter={
  capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
  async verify(input){
   try{
    const evidence:any=input.execution.evidence??{};
    const callId=typeof evidence.callId==='string'?evidence.callId:'';
    const factsHash=typeof evidence.factsHash==='string'?evidence.factsHash:'';
    const fail=(reason:string)=>({result:'FAILED' as const,evidence:{callId:callId||null,reason},verifier:'executive-brief-attribution'});
    if(!callId||!factsHash)return fail('EVIDENCE_INCOMPLETE');
    const {pool}=await import('../../../packages/db/src/client');
    const client=await pool.connect();
    try{
      const entity=(await client.query('select current_legal_entity_id()::text as entity')).rows[0]?.entity as string|undefined;
      if(!entity)return fail('TENANT_CONTEXT_MISSING');
      // The trace id lives in task, not in model_calls.id.
      const call=(await client.query(
        "select id,provider,model,tokens,cost,success,legal_entity_id::text as entity from model_calls where task like $1 order by created_at desc limit 1",
        [`executive_briefing:${callId}:%`],
      )).rows[0];
      if(!call)return fail('CALL_NOT_FOUND');
      if(call.entity!==entity)return fail('CALL_FOREIGN_TENANT');
      if(call.success!==true)return fail('CALL_NOT_SUCCESSFUL');
      if(Number(call.tokens)<=0)return fail('CALL_BILLED_ZERO_TOKENS');
      // The stored brief must carry the same facts hash, so the answer is bound to saved evidence.
      const stored=(await client.query(
        `select 1 from audit_log
          where action='EXECUTIVE_BRIEF_V1' and entity_type='legal_entity' and entity_id=$1
            and after_ref->'receipt'->>'callId'=$2 and after_ref->'receipt'->>'factsHash'=$3
          limit 1`,
        [entity,callId,factsHash],
      )).rowCount;
      if(!stored)return fail('FACTS_HASH_NOT_STORED');
      return {result:'VERIFIED',evidence:{callId,callRowId:call.id,provider:call.provider,model:call.model,tokens:Number(call.tokens),cost:Number(call.cost),factsHash},verifier:'executive-brief-attribution'};
    }catch(error:any){
      // A broken check must become a visible verdict, not an execution that never verifies.
      return {result:'FAILED' as const, evidence:{reason:'VERIFIER_ERROR', code:String(error?.code??'').slice(0,40), message:String(error?.message??'').slice(0,140)}, verifier:'executive-brief-attribution'};
    }finally{client.release();}
   }catch(error:any){
     return {result:'FAILED' as const, evidence:{reason:'VERIFIER_UNAVAILABLE', code:String(error?.code??'').slice(0,40), message:String(error?.message??'').slice(0,140)}, verifier:'executive-brief-attribution'};
   }
  }
};

export function withExecutiveBrief(bundle:ProductionBundle):ProductionBundle{
  if(bundle.capabilities.some(c=>c.capabilityId===EXECUTIVE_BRIEF_CAPABILITY))return bundle;
  return {
    ...bundle,
    capabilities:[...bundle.capabilities,{
      capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
      authorityClass:'GREEN',
      specialistAgentId:'executive-briefer',
      specialistVersion:'sam-v1',
      description:'Read the company facts and produce the executive brief through the shared budgeted model gateway. Read-only: proposes nothing and executes nothing.',
      parameters
    }],
    toolDefinitions:[...bundle.toolDefinitions,{
      capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
      authorityClass:'GREEN',
      sideEffect:false,
      description:'Executive brief over stored SAM facts; evidence and cost are recorded on every accepted answer.',
      inputSchema:parameters,
      costUpperBoundUsd:Number(process.env.SAM_BRIEFING_BUDGET_USD||0.006)
    }],
    toolAdapters:[...bundle.toolAdapters,{
      capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
      async execute(request:ToolExecutionRequest){
        const allowed=Object.keys(request.params??{});
        if(allowed.some(k=>k!=='lang'))throw new Error('EXECUTIVE_BRIEF_PARAMS_DENIED');
        const lang=request.params?.lang==='en'?'en':'ar';
        // The company is the one bound to this database session, never a caller argument.
        const {withTransaction}=await import('../../../packages/db/src/client');
        const entity=(await withTransaction(async(client)=>{
          const row=(await client.query('SELECT current_legal_entity_id()::text AS entity')).rows[0];
          return row?.entity as string|undefined;
        }))??'';
        if(!entity)throw new Error('EXECUTIVE_BRIEF_TENANT_REQUIRED');
        const {generateBriefing}=await import('../../../packages/executive-brief/src/briefing');
        const brief=await generateBriefing(entity,{lang});
        if(brief.mode==='MODEL'&&brief.receipt){
          // The verifier binds the answer to a stored brief, so persistence is awaited here.
          const {saveBrief}=await import('../../../packages/executive-brief/src/briefStore');
          await saveBrief(entity,lang,{analysis:brief.analysis,receipt:brief.receipt,facts:brief.facts}).catch(()=>{});
        }
        return {
          result:{
            mode:brief.mode,
            reason:brief.reason??null,
            analysis:brief.analysis,
            generatedAt:brief.receipt?.generatedAt??null,
            fromStore:brief.fromStore===true
          },
          evidence:{
            callId:brief.receipt?.callId??null,
            attribution:brief.receipt?.attribution??'MISSING',
            factsHash:brief.receipt?.factsHash??null,
            provider:brief.receipt?.provider??null,
            model:brief.receipt?.model??null,
            inputTokens:brief.receipt?.inputTokens??null,
            outputTokens:brief.receipt?.outputTokens??null,
            fromStore:brief.fromStore===true,
            costUsd:brief.receipt?.costUsd??null
          }
        };
      }
    }],
    verificationAdapters:[...(bundle.verificationAdapters??[]),verification]
  };
}

/** One-time idempotent provisioning of this capability's contract. Called only when the
 *  capability is explicitly enabled, so enabling it is the single decision that creates it. */
export async function provisionExecutiveBriefContract():Promise<void>{
  const {withTransaction}=await import('../../../packages/db/src/client');
  await withTransaction(async(client)=>{
    await client.query(
      `INSERT INTO verification_contracts
        (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
       VALUES($1,$2,$3,$4::jsonb,$5::jsonb,true)
       ON CONFLICT(capability_id) DO UPDATE SET
         description=EXCLUDED.description`,
      [EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].capabilityId,
       EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].description,
       EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].verificationMethod,
       JSON.stringify(EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].requiredEvidenceFields),
       JSON.stringify(EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].independentQueryTemplate)]
    );
  });
}
