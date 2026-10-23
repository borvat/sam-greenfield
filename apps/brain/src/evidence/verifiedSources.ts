import {evidenceFamily,sourceDelegationHash,assertAssignedExecution,type DelegationPolicy} from './delegationScope';
import {collectionReceipt,type CollectionContract} from './collectionReceipts';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {replayTransform,knownTimeZone,type Column,type Dataset,type TransformPlan} from './transforms';
export type ExtractionContract={collection?:CollectionContract;version:string;rowsPath:string[];columns:Record<string,Column>;coveragePath:string[];timeZonePath:string[];limitationsPath:string[];rowsMode?:'array'|'single';fields?:Record<string,{path:string[];from?:'record'|'root';encoding?:'safe-integer'}>;requiredFields?:string[];sourceLimitations?:string[];periodPath?:string[];identityPath?:string[];evidenceBinding?:{path:string[];fields:string[]}};
const at=(v:any,path:string[])=>{if(!Array.isArray(path)||path.length>8||path.some(k=>typeof k!=='string'||['__proto__','constructor','prototype'].includes(k)))throw Error('EVIDENCE_PATH_INVALID');for(const k of path){if(v===null||typeof v!=='object'||!Object.hasOwn(v,k))return undefined;v=v[k];}return v;};
/** Internal API only. Contract registry is trusted application configuration,
 * never model parameters. No production capability/registry is installed here. */
export async function transformVerifiedSources(client:any,input:{goalId:string;legalEntityId:string;sources:Record<string,string>;plan:TransformPlan},contracts:Readonly<Record<string,ExtractionContract>>,delegationPolicy?:DelegationPolicy){
 const ids=Object.values(input.sources);if(!ids.length||ids.length>8||new Set(ids).size!==ids.length)throw Error('EVIDENCE_SOURCE_LIMIT');
 if([input.goalId,input.legalEntityId,...ids].some(id=>! /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)))throw Error('EVIDENCE_ID_INVALID');
 const family=delegationPolicy?await evidenceFamily(client,input.goalId,input.legalEntityId,delegationPolicy):undefined;
 const goalIds=family?.goalIds??[input.goalId];
 // Single snapshot query; tenant RLS remains in force in addition to exact scope.
 const rows=(await client.query(`SELECT e.*,v.id verification_id,v.result verification_result,v.execution_hash verified_hash,v.plan_hash verified_plan_hash
  FROM executions e JOIN goals g ON g.id=e.goal_id
  JOIN LATERAL(SELECT id,result,execution_hash,plan_hash FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
  WHERE e.id=ANY($1::uuid[]) AND e.goal_id=ANY($2::uuid[]) AND g.company_scope=$3
  AND octet_length(e.result::text)<=250000 AND octet_length(e.params::text)<=16000 AND octet_length(e.evidence::text)<=16000`,[ids,goalIds,input.legalEntityId])).rows;
 if(rows.length!==ids.length||rows.some((r:any)=>r.verification_result!=='VERIFIED'||r.execution_hash!==r.verified_hash))throw Error('EVIDENCE_VERIFIED_SCOPE_REQUIRED');
 const sources:Record<string,Dataset>={},bindings:Record<string,unknown>={};
 for(const [alias,id] of Object.entries(input.sources)){
  if(!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(alias)||['constructor','prototype','__proto__'].includes(alias))throw Error('EVIDENCE_ALIAS_INVALID');
  const row=rows.find((r:any)=>r.id===id),contract=contracts[row.capability_id];if(!contract?.version)throw Error('EVIDENCE_OUTPUT_SCHEMA_UNKNOWN');
  if(family)await assertAssignedExecution(client,row,family);
  const selected=at(row.result,contract.rowsPath),records=contract.rowsMode==='single'?[selected]:selected;if(!Array.isArray(records)||records.length>500)throw Error('EVIDENCE_RECORDS_INVALID');
  if(contract.evidenceBinding){
   const binding=contract.evidenceBinding,receipts=at(row.evidence,binding.path);
   if(!Array.isArray(receipts)||receipts.length!==records.length||!binding.fields.length||binding.fields.some(k=>!Object.hasOwn(contract.columns,k))||
    records.some((record:any,i:number)=>binding.fields.some(k=>!record||!receipts[i]||!Object.hasOwn(record,k)||!Object.hasOwn(receipts[i],k)||sha256Hex(record[k])!==sha256Hex(receipts[i][k]))))
    throw Error('EVIDENCE_METADATA_BINDING_INVALID');
  }
  const coverage=at(row.result,contract.coveragePath),timeZone=at(row.result,contract.timeZonePath),limitations=at(row.result,contract.limitationsPath);
  assertExecutionIntegrity(row);
  const sourceHash=sha256Hex(row.result);
  sources[alias]={columns:contract.columns,rows:records.map((record:any,index:number)=>{
   if(!record||typeof record!=='object'||Array.isArray(record))throw Error('EVIDENCE_RECORD_INVALID');
   const values=Object.fromEntries(Object.keys(contract.columns).map(k=>{
    const mapping=contract.fields?.[k];let value=mapping?at(mapping.from==='root'?row.result:record,mapping.path):(Object.hasOwn(record,k)?record[k]:null);
    if(value===undefined)value=null;
    if(value===null&&(contract.requiredFields??[]).includes(k))throw Error('EVIDENCE_REQUIRED_FIELD_MISSING');
    if(value!==null&&mapping?.encoding==='safe-integer'){
     if(contract.columns[k].kind!=='decimal'||typeof value!=='number'||!Number.isSafeInteger(value))throw Error('EVIDENCE_INTEGER_ENCODING_INVALID');
     value=String(value);
    }
    return [k,value];
   }));
   return {values,citations:[{executionId:id,verificationId:row.verification_id,row:index,sourceHash}]};
  }),coverage:['complete','partial'].includes(coverage)?coverage:'unknown',timeZone:knownTimeZone(timeZone)?timeZone:null,
   sourceContexts:[{sourceHash,...(contract.collection?{collection:collectionReceipt(row,records,contract.collection)}:{}),...(contract.periodPath?{period:at(row.result,contract.periodPath)??null}:{}),...(contract.identityPath?{identity:at(row.result,contract.identityPath)??null}:{})}],
   limitations:[...(contract.sourceLimitations??[]),...(Array.isArray(limitations)?limitations.filter(x=>typeof x==='string'):[]),'Source metadata is attributed verified-read evidence, not independent business truth']};
  bindings[alias]={...(family?{delegationHash:sourceDelegationHash(family,row.goal_id,delegationPolicy!),sourceGoalId:row.goal_id}:{}),executionId:id,verificationId:row.verification_id,executionHash:row.execution_hash,sourceHash,contractHash:sha256Hex(contract)};
 }
 const result=replayTransform(input.plan,sources);
 return {...result,bindings,provenanceHash:sha256Hex({bindings,planHash:result.planHash,outputHash:result.outputHash})};
}

export function assertExecutionIntegrity(row:any){
  const executionHash=sha256Hex({queue_id:row.queue_id,goal_id:row.goal_id,plan_id:row.plan_id,plan_hash:row.plan_hash,capability_id:row.capability_id,
   params:row.params??{},result:row.result,evidence:row.evidence,fencing_token:Number(row.fencing_token),operation_key_ref:row.operation_key_ref??null});
  if(executionHash!==row.execution_hash||(row.verified_plan_hash!==undefined&&row.plan_hash!==row.verified_plan_hash))throw Error('EVIDENCE_HASH_MISMATCH');
}
