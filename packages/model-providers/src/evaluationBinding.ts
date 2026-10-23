import type {EvaluationPermit} from '../../model-gateway/src/evaluationPermit';
import {assertEvaluationPermit,LIVE_EVALUATION_ENABLED} from '../../model-gateway/src/evaluationPermit';
import {liveEvaluationAdapter} from '../../model-gateway/src/evaluationAdapter';
import type {ProviderConfig} from '../../model-gateway/src/types';
/** Nonsecret metadata only. Same compatible endpoint/model settings as env.ts.
 * Never reads the API key; unavailable settings fail rather than select a model.
 */
export function compatibleEvaluationBinding(providerId:string,env:NodeJS.ProcessEnv){
 if(!['deepseek','qwen'].includes(providerId))throw Error('EVALUATION_EXISTING_COMPATIBLE_PROVIDER_REQUIRED');
 const prefix=providerId.toUpperCase(),model=env[prefix+'_MODEL'];
 const base=env[prefix+'_BASE_URL']||(providerId==='deepseek'?'https://api.deepseek.com':'');
 const endpoint=base.replace(/\/$/,'')+'/chat/completions';let url:URL;try{url=new URL(endpoint);}catch{throw Error('EVALUATION_EXISTING_PROVIDER_CONFIG_REQUIRED');}
 if(!model||url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('EVALUATION_EXISTING_PROVIDER_CONFIG_REQUIRED');
 const cost=(key:string)=>{const value=env[prefix+key];const n=Number(value);if(!value||!Number.isFinite(n)||n<=0)throw Error('EVALUATION_PRICE_REQUIRED');return n;};
 return {providerId,model,endpoint,inputPer1k:cost('_COST_PER_1K_INPUT'),outputPer1k:cost('_COST_PER_1K_OUTPUT')};
}
export function existingEvaluationAdapter(permit:EvaluationPermit,configs:ProviderConfig[],env:NodeJS.ProcessEnv=process.env){
 // Before metadata or credential access; ordinary env flags cannot enable this.
 if(!LIVE_EVALUATION_ENABLED)throw Error('LIVE_EVALUATION_RELEASE_DISABLED');
 assertEvaluationPermit(permit);if(permit.mode!=='live'||permit.prices.length!==1)throw Error('EVALUATION_SINGLE_EXISTING_PROVIDER_REQUIRED');
 const price=permit.prices[0],binding=compatibleEvaluationBinding(price.providerId,env);
 const config=configs.find(c=>c.providerId===price.providerId);
 if(!config||config.models.length!==1||config.models[0]!==price.model||binding.model!==price.model||binding.endpoint!==permit.endpoint||
  binding.inputPer1k!==price.inputPer1k||binding.outputPer1k!==price.outputPer1k||config.costPer1kInput!==price.inputPer1k||config.costPer1kOutput!==price.outputPer1k)
  throw Error('EVALUATION_EXISTING_PROVIDER_MISMATCH');
 return liveEvaluationAdapter({providerId:price.providerId,endpoint:binding.endpoint,permit,credential:()=>env[price.providerId.toUpperCase()+'_API_KEY']});
}
