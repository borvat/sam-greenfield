import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {replayTransform,type Column,type Dataset,type TransformPlan} from './transforms';
export type ExtractionContract={version:string;rowsPath:string[];columns:Record<string,Column>;coveragePath:string[];timeZonePath:string[];limitationsPath:string[]};
const at=(v:any,path:string[])=>{if(!Array.isArray(path)||path.length>8||path.some(k=>typeof k!=='string'||['__proto__','constructor','prototype'].includes(k)))throw Error('EVIDENCE_PATH_INVALID');for(const k of path){if(v===null||typeof v!=='object'||!Object.hasOwn(v,k))return undefined;v=v[k];}return v;};
/** Internal API only. Contract registry is trusted application configuration,
 * never model parameters. No production capability/registry is installed here. */
export async function transformVerifiedSources(client:any,input:{goalId:string;legalEntityId:string;sources:Record<string,string>;plan:TransformPlan},contracts:Readonly<Record<string,ExtractionContract>>){
 const ids=Object.values(input.sources);if(!ids.length||ids.length>8||new Set(ids).size!==ids.length)throw Error('EVIDENCE_SOURCE_LIMIT');
 if([input.goalId,input.legalEntityId,...ids].some(id=>! /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)))throw Error('EVIDENCE_ID_INVALID');
 // Single snapshot query; tenant RLS remains in force in addition to exact scope.
 const rows=(await client.query(`SELECT e.*,v.id verification_id,v.result verification_result,v.execution_hash verified_hash,v.plan_hash verified_plan_hash
  FROM executions e JOIN goals g ON g.id=e.goal_id
  JOIN LATERAL(SELECT id,result,execution_hash,plan_hash FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
  WHERE e.id=ANY($1::uuid[]) AND e.goal_id=$2 AND g.company_scope=$3`,[ids,input.goalId,input.legalEntityId])).rows;
 if(rows.length!==ids.length||rows.some((r:any)=>r.verification_result!=='VERIFIED'||r.execution_hash!==r.verified_hash))throw Error('EVIDENCE_VERIFIED_SCOPE_REQUIRED');
 const sources:Record<string,Dataset>={},bindings:Record<string,unknown>={};
 for(const [alias,id] of Object.entries(input.sources)){
  if(!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(alias)||['constructor','prototype','__proto__'].includes(alias))throw Error('EVIDENCE_ALIAS_INVALID');
  const row=rows.find((r:any)=>r.id===id),contract=contracts[row.capability_id];if(!contract?.version)throw Error('EVIDENCE_OUTPUT_SCHEMA_UNKNOWN');
  const records=at(row.result,contract.rowsPath);if(!Array.isArray(records)||records.length>500)throw Error('EVIDENCE_RECORDS_INVALID');
  const coverage=at(row.result,contract.coveragePath),timeZone=at(row.result,contract.timeZonePath),limitations=at(row.result,contract.limitationsPath);
  const executionHash=sha256Hex({queue_id:row.queue_id,goal_id:row.goal_id,plan_id:row.plan_id,plan_hash:row.plan_hash,capability_id:row.capability_id,
   params:row.params??{},result:row.result,evidence:row.evidence,fencing_token:Number(row.fencing_token),operation_key_ref:row.operation_key_ref??null});
  if(executionHash!==row.execution_hash||row.plan_hash!==row.verified_plan_hash)throw Error('EVIDENCE_HASH_MISMATCH');
  const sourceHash=sha256Hex(row.result);
  sources[alias]={columns:contract.columns,rows:records.map((record:any,index:number)=>{
   if(!record||typeof record!=='object'||Array.isArray(record))throw Error('EVIDENCE_RECORD_INVALID');
   return {values:Object.fromEntries(Object.keys(contract.columns).map(k=>[k,Object.hasOwn(record,k)?record[k]:null])),citations:[{executionId:id,verificationId:row.verification_id,row:index,sourceHash}]};
  }),coverage:['complete','partial'].includes(coverage)?coverage:'unknown',timeZone:typeof timeZone==='string'?timeZone:null,
   limitations:[...(Array.isArray(limitations)?limitations.filter(x=>typeof x==='string'):[]),'Source metadata is attributed verified-read evidence, not independent business truth']};
  bindings[alias]={executionId:id,verificationId:row.verification_id,executionHash:row.execution_hash,sourceHash,contractHash:sha256Hex(contract)};
 }
 const result=replayTransform(input.plan,sources);
 return {...result,bindings,provenanceHash:sha256Hex({bindings,planHash:result.planHash,outputHash:result.outputHash})};
}
