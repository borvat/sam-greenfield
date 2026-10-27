import {validateGoalAcceptance,type GoalAcceptance} from '../../kernel/src/goalAcceptance';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
export const SOURCE='bol_sales_stock_report',ANALYST='hermes.generate_candidate';
export const ANALYSIS_MARKER='SAM_VERIFIED_DATA_ANALYSIS_V1';
export const ANALYSIS_SUBMISSION='bounded_data_analysis';
export const ANALYSIS_SUBMIT_TOOL='sam_submit_data_analysis';

/** Tool identity survives argument loss. A generic objective with BOTH optional
 * fields removed is indistinguishable from an ordinary SAM goal; do not guess
 * intent from prose. Bounded callers use ANALYSIS_SUBMIT_TOOL, never a fallback. */
export function assertDataAnalysisSubmission(input:{submissionKind?:string;analysisRequest?:unknown;acceptanceContract?:unknown}):boolean{
 if(input.submissionKind!==undefined&&input.submissionKind!==ANALYSIS_SUBMISSION)throw Error('ANALYSIS_SUBMISSION_KIND_DENIED');
 const contract=input.acceptanceContract as {constraints?:{capabilityId?:string;params?:Record<string,unknown>}[]}|undefined;
 const analystContract=Array.isArray(contract?.constraints)&&contract.constraints.some(c=>c?.capabilityId===ANALYST&&c.params?.agent_role==='data_analyst');
 const bounded=input.submissionKind===ANALYSIS_SUBMISSION||input.analysisRequest!==undefined||analystContract;
 if(bounded&&(input.analysisRequest===undefined||input.acceptanceContract===undefined))throw Error('ANALYSIS_REQUIRED_FIELDS_MISSING');
 return bounded;
}
export const ANALYSIS_REQUEST_SCHEMA={type:'object',additionalProperties:false,required:['sourceCapabilityId','startDate','endDate'],properties:{
 sourceCapabilityId:{const:SOURCE},startDate:{type:'string',format:'date'},endDate:{type:'string',format:'date'}}};
export function validateAnalysisRequest(x:any):{sourceCapabilityId:typeof SOURCE;startDate:string;endDate:string}{
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join(',')!=='endDate,sourceCapabilityId,startDate'||x.sourceCapabilityId!==SOURCE)throw Error('ANALYSIS_REQUEST_DENIED');
 for(const key of ['startDate','endDate'])if(typeof x[key]!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x[key])||new Date(x[key]+'T00:00:00Z').toISOString().slice(0,10)!==x[key])throw Error('ANALYSIS_DATE_DENIED');
 if(x.startDate>x.endDate)throw Error('ANALYSIS_DATE_DENIED');return x;
}
export function dataAnalysisAcceptance(entity:string,request:ReturnType<typeof validateAnalysisRequest>):GoalAcceptance{
 const p={startDate:request.startDate,endDate:request.endDate};
 return validateGoalAcceptance({version:1,constraints:[
  ...Object.entries({...p,timeZone:'Europe/Amsterdam',coverageComplete:true}).map(([field,equals])=>({capabilityId:SOURCE,params:p,result:{field,equals}})),
  ...Object.entries({legalEntityId:entity,sourceStartDate:p.startDate,sourceEndDate:p.endDate,sourceLinked:true,analysisValid:true}).map(([field,equals])=>({capabilityId:ANALYST,params:{agent_role:'data_analyst',instructions:ANALYSIS_MARKER},result:{field,equals}}))]});
}
export function prepareDataAnalysisCall(catalog:readonly {name:string;inputSchema:{properties?:Record<string,unknown>;required?:string[]}}[],objective:string,entity:string,raw:unknown){
 const tool=catalog.find(t=>t.name===ANALYSIS_SUBMIT_TOOL),fields=['objective','legal_entity_id','acceptance_contract','analysis_request'];
 if(!tool||fields.some(key=>!Object.hasOwn(tool.inputSchema.properties??{},key)||!tool.inputSchema.required?.includes(key)))
  throw Error('ANALYSIS_CONNECTOR_SCHEMA_STALE');
 const request=validateAnalysisRequest(raw);
 return {name:ANALYSIS_SUBMIT_TOOL,arguments:{objective,legal_entity_id:entity,
  acceptance_contract:dataAnalysisAcceptance(entity,request),analysis_request:request}};
}
export function admitDataAnalysisContract(entity:string,request:ReturnType<typeof validateAnalysisRequest>,supplied?:unknown){
 const expected=dataAnalysisAcceptance(entity,request);
 if(supplied!==undefined&&sha256Hex(validateGoalAcceptance(supplied))!==sha256Hex(expected))throw Error('ANALYSIS_ACCEPTANCE_MISMATCH');
 return expected;
}
export function assertAnalysisWindow(policy:{legalEntityId:string;activatedAt:string;expiresAt:string},entity:string,now=Date.now()){
 const a=Date.parse(policy.activatedAt),e=Date.parse(policy.expiresAt);
 if(entity!==policy.legalEntityId||!Number.isFinite(a)||!Number.isFinite(e)||a>now||e<=now||e-a>3600000||e<=a)throw Error('ANALYSIS_SCOPE_OR_WINDOW_DENIED');
}
