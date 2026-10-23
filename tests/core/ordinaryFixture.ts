import {pool} from '../../packages/db/src/client';
import assert from 'node:assert/strict';
import {OpenAICompatibleChatAdapter} from '../../packages/model-providers/src/openaiCompatible';
import {frozenSharedGoalEvaluationBundle} from '../../apps/production/src/frozenSharedGoalEvaluationBundle';
import {ordinaryGoalBundle} from '../../apps/production/src/ordinaryGoalComposition';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
export const objectives=['Compare January and February supplied ledger amounts in net EUR, with citations and limits.','Compare supplier promises against delivery dates for the supplied delivery records.','Inventory duplicate supplied documents by content hash without deleting anything.'];
const info=(objective:string)=>objective===objectives[0]?{query:'ledger',field:'total',units:'EUR',vat:'net'}:objective===objectives[1]?{query:'delivery',field:'delay',units:'calendar_day',vat:'UNKNOWN'}:{query:'document',field:'count',units:'count',vat:'UNKNOWN'};
// Scripted decisions test wiring only, never model autonomy. Fixture transport
// replaces network and uses invented sources; no evaluation authority is opened.
export default function build(){let calls=0;
 const adapter=new OpenAICompatibleChatAdapter('deepseek',{apiKey:'isolated-fixture-not-a-credential',baseUrl:'https://api.deepseek.com',transport:async(_url,request)=>{
  const task=JSON.parse(String(request.body));assert.equal(task.max_tokens,4000);assert.equal(request.redirect,'error');assert(!('max_completion_tokens'in task));
  assert(Buffer.byteLength(String(request.body))<=24000,'wire input must fit fixed input ceiling');
  calls++;if(process.env.FIXTURE_CRASH_ON_MODEL==='1'&&calls===1){console.log('ORDINARY_RESERVED_MODEL_CRASH_BARRIER');await new Promise(()=>{});}
  const input=JSON.parse(task.messages[1].content),objective=input.objective,{query,field,units,vat}=info(objective);
  let output:any;
  if(input.agent){
   const evidence=input.verifiedContext.evidence,derived=evidence.find((e:any)=>e.capabilityId==='derive_verified_evidence'),reads=evidence.filter((e:any)=>e.capabilityId==='records.search');
   const dispatch=(capabilityId:string,params:any)=>({action:'dispatch',understanding:objective,plan:['Collect requested records','Derive and verify','Cite bounded findings'],reason:'Resolve remaining evidence',tasks:[{capabilityId,objective,params}]});
   if(input.agent.id==='research-coordinator'&&!reads.length)output=dispatch('reason.records',{objective});
   else if(!reads.length)output=dispatch('records.search',{query});
   else if(reads.at(-1).result.next)output=dispatch('records.search',{query,cursor:reads.at(-1).result.next});
   else if(!derived){
    const sources=Object.fromEntries(reads.map((e:any,i:number)=>['s'+i,{executionId:e.id,contractId:'fixture-records-v1'}]));
    const operations:any[]=reads.slice(1).map((_:any,i:number)=>({op:'union',right:'s'+(i+1)}));
    operations.push(...(query==='ledger'?[{op:'group',keys:['period'],aggregates:[{fn:'sum',field:'amount',as:'total'}]}]:query==='delivery'?[{op:'derive',as:'delay',left:'delivered',right:'promised',operator:'subtract'},{op:'select',fields:{supplier:'supplier',promised:'promised',delivered:'delivered',delay:'delay'}}]:[{op:'group',keys:['digest'],aggregates:[{fn:'count',as:'count'}]}]));
    // Adversarial decision fixture: the same engine must recover from a rejected
    // transform using its verified records, without replaying source reads.
    if(query==='ledger'&&!input.verifiedContext.tasks.some((task:any)=>['FAILED','REPLANNING'].includes(task.state)))operations[0].aggregates[0].field='unobserved';
    output=dispatch('derive_verified_evidence',{sources,plan:{version:1,source:'s0',operations}});
   }else {const value=derived.result.derivedEvidence.output.dataset.rows[0].values[field];output={action:'report',understanding:objective,plan:['Cite verified derivation'],summary:'Bounded fixture comparison',claims:[{topic:field,value,path:['derivedEvidence','output','dataset','rows','0','values',field],evidenceIds:[derived.id]}],uncertainties:['Synthetic source coverage only'],completionCriteria:['Requested records accounted for']};}
  }else if(input.proposedReport){
   if(process.env.FIXTURE_REVOKE_ON_REVIEW==='1'){const raw=input.verifiedObservations.find((s:any)=>s.capabilityId==='records.search');await pool.query("INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at) SELECT execution_id,'isolated-revocation','db_query',contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications WHERE execution_id=$1 ORDER BY checked_at DESC LIMIT 1",[raw.id]);}
   output={accepted:true,missing:[]};
  }
  else if(input.verifiedObservations){
   const source=input.verifiedObservations.find((s:any)=>s.derivedEvidence);assert(source,'shared review must see descendant derivation');
   const quoteLines=source.citableLines.filter((i:number)=>{try{return JSON.parse(source.lines[i]).field===field;}catch{return false;}});assert(quoteLines.length>0);
   const findings=quoteLines.map((quoteLine:number)=>{const cell=JSON.parse(source.lines[quoteLine]);return {text:'Derived '+field+' = '+cell.value,executionId:source.id,quoteLine,derivedClaim:{row:cell.row,field,value:cell.value}};});const raw=input.verifiedObservations.find((s:any)=>s.capabilityId==='records.search');const rawLine=raw.citableLines.find((i:number)=>raw.lines[i].includes('\"id\"'));assert.notEqual(rawLine,undefined);findings.push({text:'Verified source identity',executionId:raw.id,quoteLine:rawLine} as any);output={status:'complete',summary:'Requested bounded fixture analysis',requirements:[{obligationId:'analysis',requirement:objective,fulfilled:true,evidenceIds:[source.id]}],findings,limitations:['Synthetic fixtures, not live evidence'],steps:[]};
  }else output={assumptions:{goalObligations:{version:1,deliverables:[{id:'analysis',description:objective,fields:[field],scope:{kind:'population',filter:query,query:{capabilityId:'records.search',params:{query}}},units,vat,period:'UNKNOWN',timeZone:'UTC'}],unresolved:[]}},steps:[{capabilityId:'reason.research',params:{objective}}]};
  if(process.env.FIXTURE_CANCEL_ON_RETURN==='1')await pool.query("UPDATE goals SET state='CANCELLED' WHERE objective=$1 AND parent_goal_id IS NULL",[objective]);
  return {model:'deepseek-flash',usage:{prompt_tokens:5,completion_tokens:20},choices:[{message:{content:JSON.stringify(output)}}]};
 }});

 const original=frozenSharedGoalEvaluationBundle(process.env.FIXTURE_ENTITY!);
 const keep=(id:string)=>id!=='derive_verified_evidence'&&id!=='reason.records';
 const base={...original,descendantEvidencePolicy:undefined,requireGoalObligations:undefined,verifiedEvidenceContracts:undefined,
  capabilities:original.capabilities.filter(c=>keep(c.capabilityId)),toolDefinitions:original.toolDefinitions.filter(c=>keep(c.capabilityId)),
  toolAdapters:original.toolAdapters.filter(c=>keep(c.capabilityId)),verificationAdapters:original.verificationAdapters?.filter(c=>keep(c.capabilityId)),
  modelAdapters:[adapter],modelProviderConfigs:[{providerId:'deepseek',models:['deepseek-flash'],capabilities:['planning','specialist_reasoning'],privacyClasses:['INTERNAL' as const],health:'HEALTHY' as const,costPer1kInput:0.001,costPer1kOutput:0.001}]};
 const contracts=structuredClone(original.verifiedEvidenceContracts!);if(process.env.FIXTURE_UNKNOWN_UNIT==='1')contracts[0].extraction.columns.amount.unit='UNKNOWN';
 return ordinaryGoalBundle(base,contracts,{limits:{...ceiling,models:12,maxOutputTokens:4000,...(process.env.FIXTURE_ZERO_TOOLS==='1'?{tools:0}:{})},specialists:[{capabilityId:'reason.research',agentId:'research-coordinator',purpose:'Delegate evidence investigation and independently substantiate the requested findings.',allowedCapabilities:['reason.records'],limits:{...ceiling,models:12,maxOutputTokens:4000}},{capabilityId:'reason.records',agentId:'records-analyst',purpose:'Discover authorized records, request missing pages, derive bounded comparisons and cite exact verified fields.',allowedCapabilities:['records.search','derive_verified_evidence'],limits:{...ceiling,models:10,maxOutputTokens:4000}}]},process.env.FIXTURE_ENTITY!);
}
