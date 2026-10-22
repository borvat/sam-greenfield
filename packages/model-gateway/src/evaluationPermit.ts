import {createPublicKey,verify} from 'node:crypto';
import {stableStringify} from '../../shared/src/stableJson';
/** Release interlock. No environment variable or manifest can enable live calls.
 * Changing this requires a reviewed release and separate signed owner approval. */
export const LIVE_EVALUATION_ENABLED=false;
export interface EvaluationPrice {providerId:string;model:string;inputPer1k:number;outputPer1k:number}
export interface EvaluationPermit {readonly mode:'fixture'|'live';readonly trialId:string;readonly prices:readonly EvaluationPrice[];readonly endpoint?:string;readonly expiresAt?:string}
const permits=new WeakSet<object>();
export function fixtureEvaluationPermit(trialId:string,prices:EvaluationPrice[]):EvaluationPermit{
 validatePrices(prices,false);const p=Object.freeze({mode:'fixture' as const,trialId,prices:Object.freeze(prices.map(p=>Object.freeze({...p})))});permits.add(p);return p;
}
export function validatePrices(prices:EvaluationPrice[],live:boolean){
 if(!Array.isArray(prices)||!prices.length||prices.length>16||new Set(prices.map(p=>p.providerId+':'+p.model)).size!==prices.length||prices.some(p=>!p.providerId||!p.model||
  !Number.isFinite(p.inputPer1k)||!Number.isFinite(p.outputPer1k)||p.inputPer1k<0||p.outputPer1k<0||live&&(p.inputPer1k===0||p.outputPer1k===0)))throw Error('EVALUATION_PRICE_REQUIRED');
}
export function authorizeLiveEvaluation(input:{payload:Record<string,unknown>;signature:string;trustedOwnerPublicKey:string;expectedPayload:Record<string,unknown>}):EvaluationPermit{
 // Validate signed scope without loading credentials or performing any transport.
 const key=createPublicKey(input.trustedOwnerPublicKey);
 if(key.asymmetricKeyType!=='ed25519'||stableStringify(input.payload)!==stableStringify(input.expectedPayload)||
  !verify(null,Buffer.from(stableStringify(input.payload)),key,Buffer.from(input.signature,'base64')))throw Error('EVALUATION_OWNER_AUTHORIZATION_INVALID');
 const p=input.payload;
 if(p.kind!=='SAM_LIVE_EVALUATION_APPROVAL'||typeof p.expiresAt!=='string'||Date.parse(p.expiresAt)<=Date.now()||!Number.isFinite(Date.parse(p.expiresAt))||
  typeof p.trialId!=='string'||typeof p.specHash!=='string'||typeof p.endpoint!=='string')throw Error('EVALUATION_OWNER_SCOPE_INVALID');
 validatePrices(p.prices as EvaluationPrice[],true);
 if(!LIVE_EVALUATION_ENABLED)throw Error('LIVE_EVALUATION_RELEASE_DISABLED');
 const permit=Object.freeze({mode:'live' as const,trialId:p.trialId,endpoint:p.endpoint,expiresAt:p.expiresAt,prices:Object.freeze((p.prices as EvaluationPrice[]).map(p=>Object.freeze({...p})))});
 permits.add(permit);return permit;
}
export function assertEvaluationPermit(p:EvaluationPermit){if(!p||!permits.has(p))throw Error('EVALUATION_AUTHORIZATION_REQUIRED');if(p.mode==='live'&&!LIVE_EVALUATION_ENABLED)throw Error('LIVE_EVALUATION_RELEASE_DISABLED');if(p.mode==='live'&&(!p.expiresAt||Date.parse(p.expiresAt)<=Date.now()))throw Error('EVALUATION_AUTHORIZATION_EXPIRED');}
export function assertEvaluationPrice(p:EvaluationPermit,providerId:string,model:string,input:number,output:number){
 assertEvaluationPermit(p);const price=p.prices.find(x=>x.providerId===providerId&&x.model===model);
 if(!price||price.inputPer1k!==input||price.outputPer1k!==output)throw Error('EVALUATION_PRICE_MISMATCH');
}
