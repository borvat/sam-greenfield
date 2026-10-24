import {readFileSync} from 'node:fs';
import type {ProviderConfig,RouteCandidate} from './types';

/** Operator-supplied evaluation evidence, never data taken from task.input or
 * a provider's self-description. A score is an observed benchmark result, not
 * a statistical confidence interval or a claim about unseen task quality. */
export interface MeasuredRoutingPolicy {
 version:1;taskClass:string;evaluationSet:string;minimumSamples:number;
 minimumScore:number;equivalenceMargin:number;maximumAgeMs:number;
 observations:{providerId:string;model:string;taskClass:string;evaluationSet:string;
  score:number;samples:number;observedAt:string;evidenceHash:string}[];
}
export function validateMeasuredPolicy(value:unknown):MeasuredRoutingPolicy{
 const p=value as MeasuredRoutingPolicy;
 if(!p||p.version!==1||!p.taskClass||!p.evaluationSet||
  !Number.isSafeInteger(p.minimumSamples)||p.minimumSamples<1||
  !Number.isFinite(p.minimumScore)||p.minimumScore<0||p.minimumScore>1||
  !Number.isFinite(p.equivalenceMargin)||p.equivalenceMargin<0||p.equivalenceMargin>0.1||
  !Number.isSafeInteger(p.maximumAgeMs)||p.maximumAgeMs<1||!Array.isArray(p.observations)||p.observations.length>10000)
  throw Error('MEASURED_ROUTING_POLICY_INVALID');
 const keys=new Set<string>();
 for(const o of p.observations){const key=JSON.stringify([o.providerId,o.model]);
  if(!o.providerId||!o.model||!o.taskClass||!o.evaluationSet||!Number.isFinite(o.score)||o.score<0||o.score>1||
   !Number.isSafeInteger(o.samples)||o.samples<1||!Number.isFinite(Date.parse(o.observedAt))||
   !/^[a-f0-9]{64}$/.test(o.evidenceHash)||keys.has(key))throw Error('MEASURED_ROUTING_OBSERVATION_INVALID');
  keys.add(key);
 }
 return structuredClone(p);
}
export function measuredPolicyFromEnv(env:NodeJS.ProcessEnv=process.env){
 if(!env.SAM_MODEL_ROUTING_POLICY_PATH)return undefined;
 const bytes=readFileSync(env.SAM_MODEL_ROUTING_POLICY_PATH);
 if(bytes.length>1_000_000)throw Error('MEASURED_ROUTING_POLICY_TOO_LARGE');
 return validateMeasuredPolicy(JSON.parse(bytes.toString('utf8')));
}
export function rankMeasured(candidates:RouteCandidate[],providers:ProviderConfig[],input:MeasuredRoutingPolicy,now=Date.now()){
 const p=validateMeasuredPolicy(input);
 const observed=candidates.flatMap(c=>{
  const o=p.observations.find(o=>o.providerId===c.providerId&&o.model===c.model);
  if(!o||o.taskClass!==p.taskClass||o.evaluationSet!==p.evaluationSet||o.samples<p.minimumSamples||o.score<p.minimumScore||
   Date.parse(o.observedAt)>now||now-Date.parse(o.observedAt)>p.maximumAgeMs)return [];
  return [{candidate:c,observation:o}];
 });
 if(!observed.length)return [];
 const best=Math.max(...observed.map(o=>o.observation.score));
 // Anchor equivalence to the best score; no transitive A~B~C discount chain.
 return observed.sort((a,b)=>{
  const bandA=a.observation.score>=best-p.equivalenceMargin?0:1;
  const bandB=b.observation.score>=best-p.equivalenceMargin?0:1;
  return bandA-bandB||(bandA===1?b.observation.score-a.observation.score:0)||
   a.candidate.estimatedCostUsd-b.candidate.estimatedCostUsd||
   Number(providers.find(p=>p.providerId===a.candidate.providerId)?.health==='DEGRADED')-
    Number(providers.find(p=>p.providerId===b.candidate.providerId)?.health==='DEGRADED')||
   a.candidate.providerId.localeCompare(b.candidate.providerId)||a.candidate.model.localeCompare(b.candidate.model);
 }).map(({candidate,observation})=>({...candidate,reason:candidate.reason+
  `;quality=measured;score=${observation.score};samples=${observation.samples};evidence=${observation.evidenceHash};cost_basis=estimated_token_rates`}));
}
