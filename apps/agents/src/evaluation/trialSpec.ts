import {sharedCorpus,sharedCorpusHash} from './sharedCorpus';
import {contentHash} from './harness';
import {validatePrices,type EvaluationPrice} from '../../../../packages/model-gateway/src/evaluationPermit';
import {validateLimits,type Limits} from '../intelligence/contracts';
import {commercialScenario,commercialCorpusHash} from './scenarios';
import {publicCases,evaluationCases} from './cases';
export const zero=()=>({models:0,tools:0,iterations:0,tokens:0,costUsd:0,delegations:0});
export type Counters=ReturnType<typeof zero>;
export interface TrialSpec {version:1;mode:'fixture'|'live';liveEndpoint?:string;syntheticOnly:true;commit:string;caseId:string;corpusHash:string;companyId:string;rootCapabilityId:string;
 limits:Limits;agents:Record<string,Limits>;prices:EvaluationPrice[];capabilityHash:string}
export function validateTrialSpec(s:TrialSpec){
 if(s.version!==1||!['fixture','live'].includes(s.mode)||s.syntheticOnly!==true||!/^[0-9a-f]{40}$/.test(s.commit)||(!evaluationCases.some(c=>c.id===s.caseId)&&!commercialScenario(s.caseId)&&s.caseId!==sharedCorpus.id)||
  s.corpusHash!==(s.caseId===sharedCorpus.id?sharedCorpusHash():commercialScenario(s.caseId)?commercialCorpusHash():contentHash(publicCases()))||!/^[0-9a-f-]{36}$/.test(s.companyId)||!s.rootCapabilityId||!/^[0-9a-f]{64}$/.test(s.capabilityHash)||!s.agents['executive-bootstrap']||Object.keys(s.agents).length>8)throw Error('EVALUATION_SPEC_INVALID');
 if(Object.keys(s.agents).some(a=>!/^[-a-zA-Z0-9_.]{1,150}$/.test(a)||['__proto__','constructor','prototype'].includes(a)))throw Error('EVALUATION_AGENT_INVALID');
 validateLimits(s.limits);for(const l of Object.values(s.agents))validateLimits(l);validatePrices(s.prices,s.mode==='live');
 if(s.mode==='live'){const url=new URL(s.liveEndpoint??'');if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('EVALUATION_ENDPOINT_DENIED');}
 return JSON.parse(JSON.stringify(s)) as TrialSpec;
}
