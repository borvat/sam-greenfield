import type {ProviderConfig} from '../../model-gateway/src/types';
/** Public catalog is capability/pricing metadata, not measured SAM quality.
 * Models with extra charges/conditional pricing are refused rather than treated
 * as if the legacy gateway's token-only estimate were a complete bill. */
export function openRouterModelConfig(payload:unknown,model:string,options:{retrievedAt:string;now?:number;capabilities:string[];privacyClasses:ProviderConfig['privacyClasses']}):ProviderConfig{
 const now=options.now??Date.now(),at=Date.parse(options.retrievedAt);
 if(!Number.isFinite(at)||at>now||now-at>86400000)throw Error('OPENROUTER_CATALOG_STALE');
 const rows=(payload as any)?.data;
 if(!Array.isArray(rows))throw Error('OPENROUTER_CATALOG_INVALID');
 const matches=rows.filter((r:any)=>r?.id===model);
 if(matches.length!==1)throw Error('OPENROUTER_EXACT_MODEL_REQUIRED');
 const r=matches[0],pricing=r.pricing;
 const rate=(v:unknown)=>{if(typeof v!=='string'||!/^\d+(?:\.\d+)?(?:e-?\d+)?$/i.test(v)||!Number.isFinite(Number(v)))throw Error('OPENROUTER_PRICE_INVALID');return Number(v);};
 if(!pricing||pricing.overrides?.length)throw Error('OPENROUTER_CONDITIONAL_PRICING_UNSUPPORTED');
 for(const [key,value]of Object.entries(pricing)){
  if(['prompt','completion','input_cache_read','input_cache_write','overrides'].includes(key))continue;
  if(rate(value)!==0)throw Error('OPENROUTER_EXTRA_CHARGE_UNSUPPORTED');
 }
 if(!Number.isSafeInteger(r.context_length)||r.context_length<1||!Array.isArray(r.supported_parameters)||
  !r.supported_parameters.includes('max_tokens')||!r.supported_parameters.includes('response_format'))throw Error('OPENROUTER_PLANNING_CONTRACT_UNSUPPORTED');
 if(r.expiration_date&&(!Number.isFinite(Date.parse(r.expiration_date))||Date.parse(r.expiration_date)<=now))throw Error('OPENROUTER_MODEL_EXPIRED');
 const maxOutput=r.top_provider?.max_completion_tokens;
 if(maxOutput!=null&&(!Number.isSafeInteger(maxOutput)||maxOutput<1))throw Error('OPENROUTER_OUTPUT_LIMIT_INVALID');
 return {providerId:'openrouter',models:[model],capabilities:options.capabilities,privacyClasses:options.privacyClasses,health:'HEALTHY',
  contextWindowTokens:r.context_length,...(maxOutput==null?{}:{maxOutputTokens:maxOutput}),supportsToolCalling:r.supported_parameters.includes('tools'),
  costPer1kInput:rate(pricing.prompt)*1000,costPer1kOutput:rate(pricing.completion)*1000};
}
