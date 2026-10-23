import {assertRuntimeTenantBinding} from '../../db/src/runtimeAccess';
import {evaluationWireProfile} from './evaluationWireProfile';
import type {ModelProviderAdapter} from './types';
export interface OrdinaryModelAdmission {readonly tenant:string;readonly prices:readonly {providerId:string;model:string;inputPer1k:number;outputPer1k:number}[]}
const admissions=new WeakSet<object>();
const adapters=new WeakMap<object,{providerId:string;endpoint:string}>();
/** Called only by the existing compatible provider constructor. An evaluation
 * adapter or a claimed executionMode is not ordinary runtime authorization. */
export function registerOrdinaryCompatibleAdapter(adapter:ModelProviderAdapter,endpoint:string){adapters.set(adapter,{providerId:adapter.providerId,endpoint});}
export function assertOrdinaryAdapter(adapter:ModelProviderAdapter,model:string){
 const bound=adapters.get(adapter);if(!bound||bound.providerId!==adapter.providerId)throw Error('ORDINARY_MODEL_ADAPTER_REQUIRED');
 return evaluationWireProfile(bound.providerId,model,bound.endpoint);
}
/** Read-only admission under the existing fixed runtime identity. Does not
 * provision anything or accept evaluation credentials, profiles or signatures. */
export async function admitOrdinaryModels(db:Parameters<typeof assertRuntimeTenantBinding>[0],prices:OrdinaryModelAdmission['prices']){
 if(process.env.SAM_ORDINARY_GENERAL_AGENT!=='1')throw Error('ORDINARY_GENERAL_AGENT_DISABLED');
 const tenant=await assertRuntimeTenantBinding(db);
 if(!prices.length||prices.length>16||new Set(prices.map(p=>p.providerId+':'+p.model)).size!==prices.length)throw Error('ORDINARY_MODEL_PRICE_REQUIRED');
 for(const price of prices){
  if(!Number.isFinite(price.inputPer1k)||!Number.isFinite(price.outputPer1k)||price.inputPer1k<=0||price.outputPer1k<=0)throw Error('ORDINARY_MODEL_PRICE_REQUIRED');
  const row=(await db.query('SELECT models,cost_per_1k_input,cost_per_1k_output FROM model_providers WHERE provider_id=$1',[price.providerId])).rows[0];
  if(!row?.models?.includes(price.model)||row.cost_per_1k_input!==price.inputPer1k||row.cost_per_1k_output!==price.outputPer1k)throw Error('ORDINARY_MODEL_PRICE_MISMATCH');
 }
 const admitted=Object.freeze({tenant:tenant.entity,prices:Object.freeze(prices.map(p=>Object.freeze({...p})))});admissions.add(admitted);return admitted;
}
export function assertOrdinaryAdmission(admission:OrdinaryModelAdmission){
 if(process.env.SAM_ORDINARY_GENERAL_AGENT!=='1'||!admissions.has(admission))throw Error('ORDINARY_MODEL_ADMISSION_REQUIRED');
}
export function assertOrdinaryPrice(admission:OrdinaryModelAdmission,providerId:string,model:string,input:number,output:number){
 assertOrdinaryAdmission(admission);const price=admission.prices.find(p=>p.providerId===providerId&&p.model===model);
 if(!price||price.inputPer1k!==input||price.outputPer1k!==output)throw Error('ORDINARY_MODEL_PRICE_MISMATCH');
}
