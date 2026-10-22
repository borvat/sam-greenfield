import type {ToolAdapter} from '../../../../packages/tool-gateway/src/types';
import type {VerificationAdapter} from '../../../production/src/types';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {commercialScenario,currentCommercialSource} from './scenarios';
import {evaluationCases} from './cases';
const readers=new WeakMap<object,string>(),verifiers=new WeakMap<object,string>();
/** This implementation can read ONLY checked-in synthetic corpus bytes. It has
 * no network, database, filesystem, callback or business-service dependency. */
export function frozenEvaluationSources(caseId:string,aliases:Record<string,string>,options:{fixtureRejectedChannels?:string[]}={}){
 const scenario=commercialScenario(caseId)??evaluationCases.find(c=>c.id===caseId);if(!scenario)throw Error('EVALUATION_CASE_REQUIRED');
 const mapping=Object.freeze({...aliases}),rejected=Object.freeze([...(options.fixtureRejectedChannels??[])]);
 if(Object.values(mapping).some(id=>!scenario.sources.some(s=>s.id===id)))throw Error('EVALUATION_SOURCE_ALIAS_DENIED');
 const lookup=(params:Record<string,unknown>)=>{
  const channel=String(params.channel??''),id=mapping[channel];const source=scenario.sources.find(s=>s.id===id);
  if(!source)throw Error('EVALUATION_FROZEN_SOURCE_REQUIRED');const data=JSON.parse(JSON.stringify(source.data));
  return {sourceId:source.id,sourceData:data,value:'value'in data?data.value:data.text,channel,uri:'fixture://'+caseId+'/'+source.id};
 };
 const adapter:ToolAdapter={capabilityId:'source.read',async execute({params}){return {result:lookup(params),evidence:{readback:true,source:'checked-in-synthetic-corpus'}};}};
 const verifier:VerificationAdapter={capabilityId:'source.read',async verify({execution}){
  const expected=lookup(execution.params),actual=execution.result;
  const commercial=commercialScenario(caseId);
  const eligible=!commercial||currentCommercialSource(commercial,commercial.sources.find(s=>s.id===expected.sourceId)!);
  const valid=eligible&&!!actual&&!rejected.includes(String(execution.params.channel))&&actual.sourceId===expected.sourceId&&actual.value===expected.value&&sha256Hex(actual.sourceData)===sha256Hex(expected.sourceData);
  return {result:valid?'VERIFIED':'FAILED',evidence:{readback:true,reason:valid?'frozen_corpus_readback':'synthetic_source_rejected'},verifier:'independent-frozen-corpus-readback-v1'};
 }};
 readers.set(adapter,caseId);verifiers.set(verifier,caseId);return {adapter,verifier};
}
export function assertFrozenEvaluationSources(adapter:ToolAdapter,verifier:VerificationAdapter|undefined,caseId:string){
 if(readers.get(adapter)!==caseId||!verifier||verifiers.get(verifier)!==caseId)throw Error('EVALUATION_FROZEN_ADAPTER_REQUIRED');
}
