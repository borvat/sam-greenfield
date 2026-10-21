import {withEBoekhoudenFromEnv} from './eboekhoudenBundle';
import type {ProductionBundle} from './types';

/** Explicit staging entry point; does not source credentials from ChatGPT. */
export function withCompanyAccountingReads(base:ProductionBundle,companyId:string,env:NodeJS.ProcessEnv){
 if(!/^[0-9a-f-]{36}$/i.test(companyId)||!env.EBOEKHOUDEN_API_TOKEN?.trim())throw new Error('ACCOUNTING_SCOPE_AND_RUNTIME_AUTH_REQUIRED');
 const built=withEBoekhoudenFromEnv(base,env);
 const prior=new Set(base.capabilities.map(c=>c.capabilityId));
 const added=new Set(built.capabilities.filter(c=>!prior.has(c.capabilityId)).map(c=>c.capabilityId));
 if(added.size!==4)throw new Error('ACCOUNTING_READ_BINDING_INCOMPLETE');
 return {...built,
 capabilities:built.capabilities.map(c=>added.has(c.capabilityId)?{...c,companyScopes:[companyId]}:c),
 toolDefinitions:built.toolDefinitions.map(d=>added.has(d.capabilityId)?{...d,companyScopes:[companyId]}:d),
 toolAdapters:built.toolAdapters.map(adapter=>!added.has(adapter.capabilityId)?adapter:{capabilityId:adapter.capabilityId,async execute(request){
  if(request.legalEntityId!==companyId)throw new Error('ACCOUNTING_COMPANY_DENIED');
  try{const r=await adapter.execute(request);return {...r,evidence:{...r.evidence,companyId}}}catch{throw new Error('ACCOUNTING_READ_FAILED')}
 }}),
 verificationAdapters:built.verificationAdapters?.map(v=>!added.has(v.capabilityId)?v:{capabilityId:v.capabilityId,async verify(input){
  if(input.execution.legalEntityId!==companyId||input.execution.evidence?.companyId!==companyId)return {result:'INCONCLUSIVE' as const,evidence:{reason:'company_mismatch'},verifier:'accounting-readback'};
  try{return await v.verify(input)}catch{return {result:'INCONCLUSIVE' as const,evidence:{reason:'readback_unavailable'},verifier:'accounting-readback'}}
 }})
 } as ProductionBundle;
}
