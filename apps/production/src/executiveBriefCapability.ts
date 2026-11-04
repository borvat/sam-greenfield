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
  description:'An executive brief is verified only when the stored model call it cites exists for this company and the engine marked its attribution VERIFIED.',
  verificationMethod:'db_query',
  requiredEvidenceFields:{callId:'uuid',attribution:'VERIFIED',factsHash:'string'},
  independentQueryTemplate:{query:'select id,task,provider,model,tokens,cost from model_calls where id=$1'}
}];

const verification:VerificationAdapter={
  capabilityId:EXECUTIVE_BRIEF_CAPABILITY,
  async verify(input){
    const result:any=input.execution.result??{};
    const evidence:any=input.execution.evidence??{};
    const ok=result.mode==='MODEL'&&evidence.attribution==='VERIFIED'&&typeof evidence.callId==='string';
    return {
      result:ok?'VERIFIED':'FAILED',
      evidence:{callId:evidence.callId??null,attribution:evidence.attribution??'MISSING',factsHash:evidence.factsHash??null,fromStore:evidence.fromStore===true},
      verifier:'executive-brief-attribution'
    };
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
