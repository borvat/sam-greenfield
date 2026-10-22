/** Development-only adapters. Deliberately absent from runtime/default catalogs. */
import {z} from 'zod';
import type {ToolAdapter,ToolDefinition,ToolExecutionResult} from '../../tool-gateway/src/types';
import type {CapabilityDefinition} from '../../../apps/agents/src/capabilityCatalog';

const currency=z.string().trim().regex(/^[A-Za-z]{3}$/).transform(s=>s.toUpperCase());
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s);
export const currencyInput=z.object({base:currency,quote:currency,date:day.optional()}).strict();
const countries=['AT','BE','BG','CY','CZ','DE','DK','EE','EL','ES','FI','FR','HR','HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK','XI'];
export const vatInput=z.object({country:z.string().trim().toUpperCase().transform(s=>s==='GR'?'EL':s).refine(s=>countries.includes(s)),
  number:z.string().min(1).max(32).regex(/^[A-Za-z0-9 -]+$/).transform(s=>s.replace(/[ -]/g,'').toUpperCase())}).strict();
export type CurrencyInput=z.input<typeof currencyInput>;
export type VatInput=z.input<typeof vatInput>;
export const ids={currency:'public_currency_reference',vat:'public_eu_vat_lookup'} as const;
const descriptions={
  currency:'Read one daily or historical Frankfurter blended reference rate. Never an executable bank quote. Missing/stale rates remain explicit.',
  vat:'Explicitly requested EU/XI VAT lookup through VATComply/VIES. Valid, invalid or unknown; not counterparty trust or tax-treatment authorization. Never automatically enrich customer/supplier records.'
};
export const definitions:ToolDefinition[]=[ids.currency,ids.vat].map(capabilityId=>({capabilityId,authorityClass:capabilityId===ids.vat?'YELLOW':'GREEN',sideEffect:false,costUpperBoundUsd:0}));
export const capabilities:CapabilityDefinition[]=definitions.map(d=>({...d,specialistAgentId:'public-reference-development',specialistVersion:'1.0.0',
  description:d.capabilityId===ids.currency?descriptions.currency:descriptions.vat,
  parameters:d.capabilityId===ids.currency?{type:'object',additionalProperties:false,required:['base','quote'],properties:{base:{type:'string',minLength:3,maxLength:3},quote:{type:'string',minLength:3,maxLength:3},date:{type:'string',minLength:10,maxLength:10}}}:
  {type:'object',additionalProperties:false,required:['country','number'],properties:{country:{type:'string',minLength:2,maxLength:2},number:{type:'string',minLength:1,maxLength:32}}}}));

const rateResponse=z.object({base:z.string(),quote:z.string(),date:day,rate:z.number().finite().positive(),providers:z.array(z.string().regex(/^[a-z0-9_-]{1,80}$/)).max(120).optional()});
const vatResponse=z.object({valid:z.boolean(),country_code:z.string(),vat_number:z.string(),error:z.never().optional(),detail:z.never().optional()});
const FX='https://api.frankfurter.dev/v2/rates';
const VAT='https://api.vatcomply.com/vat';
const warning='VAT lookup is not proof of counterparty trust or authorization for tax treatment.';
type Failure='timeout'|'provider_failure'|'rate_limited'|'missing'|'invalid_response'|'response_too_large';
class LookupFailure extends Error {constructor(readonly reason:Failure){super(reason);}}
export type LookupDependencies={fetch:typeof fetch;now?:()=>number};
/** No default transport, environment activation switch, credentials or runtime registration.
 * Caller is trusted development/test composition, never planner-supplied configuration.
 * One instance per egress IP is required; distributed coordination is an activation blocker.
 */
export function createDevelopmentLookups(deps:LookupDependencies):ToolAdapter[]{
  const now=deps.now??Date.now;
  const next=new Map<string,number>();
  const cache=new Map<string,{expires:number;value:ToolExecutionResult}>();
  async function read(url:URL):Promise<unknown>{
    if(![FX,VAT].includes(url.origin+url.pathname)||url.username||url.password||url.hash)throw Error('DESTINATION_DENIED');
    const host=url.origin,t=now();
    if(t<(next.get(host)??0))throw new LookupFailure('rate_limited');
    // Fail fast instead of creating an unbounded wait queue; one request per second.
    next.set(host,t+1000);
    const controller=new AbortController();
    let timer:ReturnType<typeof setTimeout>;
    const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new LookupFailure('timeout'));},5000);});
    try{return await Promise.race([(async()=>{
      const response=await deps.fetch(url,{method:'GET',redirect:'error',credentials:'omit',referrerPolicy:'no-referrer',headers:{Accept:'application/json'},signal:controller.signal});
      if(response.status===429||response.status===503){
        const raw=response.headers.get('retry-after');
        const seconds=raw&&/^\d+$/.test(raw)?Number(raw)*1000:raw?Date.parse(raw)-now():5000;
        // No retries. Honor long Retry-After by admission refusal, not by sleeping.
        next.set(host,Math.max(next.get(host)??0,now()+Math.max(5000,Number.isFinite(seconds)?seconds:5000)));
      }
      if(!response.ok)throw new LookupFailure(response.status===429?'rate_limited':[404,422].includes(response.status)?'missing':'provider_failure');
      if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))throw new LookupFailure('invalid_response');
      const reader=response.body?.getReader();if(!reader)throw new LookupFailure('invalid_response');
      const parts:Uint8Array[]=[];let size=0;
      try{while(true){const item=await reader.read();if(item.done)break;size+=item.value.byteLength;if(size>16384)throw new LookupFailure('response_too_large');parts.push(item.value);}}
      finally{await reader.cancel().catch(()=>{});}
      try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new LookupFailure('invalid_response');}
    })(),deadline]);}
    catch(e){if(e instanceof LookupFailure)throw e;throw new LookupFailure('provider_failure');}
    finally{clearTimeout(timer!);controller.abort();}
  }
  function envelope(provider:string,sourceUrl:string,sourceDate:string|null,result:Record<string,unknown>,observedAt=new Date(now()).toISOString()):ToolExecutionResult{
    return {result,evidence:{provider,sourceUrl,sourceDate,observedAt,retrievedAt:observedAt,cached:false,classification:'UNTRUSTED_EXTERNAL_DATA'}};
  }
  return [{capabilityId:ids.currency,async execute(request){
    if(request.capabilityId!==ids.currency)throw Error('CAPABILITY_MISMATCH');
    const parsed=currencyInput.safeParse(request.params);if(!parsed.success)throw Error('LOOKUP_INPUT_INVALID');
    const p=parsed.data,today=new Date(now()).toISOString().slice(0,10);
    if(p.base===p.quote||p.date&&(p.date>today||p.date<'1948-01-01'))throw Error('LOOKUP_INPUT_INVALID');
    const url=new URL(FX);url.searchParams.set('base',p.base);url.searchParams.set('quotes',p.quote);url.searchParams.set('expand','providers');if(p.date)url.searchParams.set('date',p.date);
    const key=url.href,hit=cache.get(key);
    if(hit&&hit.expires>now()){
      const value=structuredClone(hit.value);
      const ageDays=Math.floor((Date.parse(p.date??today)-Date.parse(String(value.evidence.sourceDate)))/86400000);
      return {...value,result:{...value.result,ageDays,stale:ageDays>7},evidence:{...value.evidence,cached:true,retrievedAt:new Date(now()).toISOString()}};
    }
    const common={...p,kind:p.date?'historical_reference':'daily_reference',executableBankRate:false};
    try{
      const parsed=z.array(rateResponse).max(1).safeParse(await read(url));
      if(!parsed.success)throw new LookupFailure('invalid_response');
      if(!parsed.data.length)throw new LookupFailure('missing');
      const r=parsed.data[0];
      if(r.base!==p.base||r.quote!==p.quote||r.date>(p.date??today))throw new LookupFailure('invalid_response');
      const ageDays=Math.floor((Date.parse(p.date??today)-Date.parse(r.date))/86400000);
      const value=envelope('Frankfurter',url.href,r.date,{...common,status:'available',rate:r.rate,ageDays,stale:ageDays>7,dateMatchesRequest:p.date?r.date===p.date:null,providers:r.providers??[],attribution:r.providers?'provider_blend':'provider_unspecified_or_peg'});
      if(cache.size>=100)cache.delete(cache.keys().next().value!);
      cache.set(key,{expires:now()+3600000,value:structuredClone(value)});return value;
    }catch(e){return envelope('Frankfurter',url.href,null,{...common,status:'unavailable',reason:e instanceof LookupFailure?e.reason:'invalid_response'});}
  }},{capabilityId:ids.vat,async execute(request){
    if(request.capabilityId!==ids.vat)throw Error('CAPABILITY_MISMATCH');
    const parsed=vatInput.safeParse(request.params);if(!parsed.success)throw Error('LOOKUP_INPUT_INVALID');
    const p=parsed.data;
    // Input accepts a national number only, avoiding ambiguous removal of letter prefixes.
    if(!/^[A-Z0-9]{8,12}$/.test(p.number)||p.number.startsWith(p.country))throw Error('LOOKUP_INPUT_INVALID');
    const url=new URL(VAT);url.searchParams.set('vat_number',p.country+p.number);
    try{
      const r=vatResponse.safeParse(await read(url));
      if(!r.success||r.data.country_code!==p.country||r.data.vat_number!==p.number)throw new LookupFailure('invalid_response');
      return envelope('VATComply / VIES',VAT,null,{status:r.data.valid?'valid':'invalid',country:p.country,warning,sourceDateAvailable:false});
    }catch(e){return envelope('VATComply / VIES',VAT,null,{status:'unknown',country:p.country,reason:e instanceof LookupFailure?e.reason:'invalid_response',warning,sourceDateAvailable:false});}
  }}];
}
