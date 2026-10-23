import {assessCollection} from '../../apps/brain/src/evidence/collectionReceipts';
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {reviewFixture} from './reviewFixture';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {transformVerifiedSources,type ExtractionContract} from '../../apps/brain/src/evidence/verifiedSources';
import {replayTransform,exactDecimal,assessDeliverables,type Dataset,type TransformPlan} from '../../apps/brain/src/evidence/transforms';
import {CapabilityCatalog} from '../../apps/agents/src/capabilityCatalog';
import {proposePlan} from '../../apps/brain/src/planner';
async function main(){
 const f=await reviewFixture();
 const contract=(await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
 VALUES('review_echo','Synthetic independent readback','db_query','{"readback":"boolean"}','{}') RETURNING id`)).rows[0].id;
 async function evidence(payloads:any[]){
  const goalId=await f.goal('Synthetic isolated evidence','PLANNING');
  const plan=await persistPlanAndDelegateAtomic({goalId,steps:payloads.map((_,i)=>({capabilityId:'review_echo',params:{index:i}}))});
  const ids:string[]=[];
  for(const [i,result] of payloads.entries()){
   const lease=await leaseWorkAtomic(plan.queueIds[i],'fixture',60);
   const e=await recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[i],fencingToken:lease.token,actor:'fixture',result,evidence:{readback:true}});
   await recordIndependentVerificationAtomic({executionId:e.executionId,verifier:'independent-fixture',contractId:contract,independentEvidence:{readback:true},result:'VERIFIED'});ids.push(e.executionId);
  }return {goalId,ids};
 }
 const schema=(columns:ExtractionContract['columns']):ExtractionContract=>({version:'fixture-v1',rowsPath:['records'],columns,coveragePath:['coverage'],timeZonePath:['timeZone'],limitationsPath:['limitations']});
 const payload=(records:any[],coverage='complete')=>({records,coverage,timeZone:'Europe/Amsterdam',limitations:coverage==='complete'?[]:['Next page unavailable; not full population']});
 const collected=await evidence([{...payload([{identity:'bounded-id'}],'unknown'),page:{next:null}}]);
 const collectedInput={goalId:collected.goalId,legalEntityId:f.entity,sources:{page:collected.ids[0]},plan:{version:1 as const,source:'page',operations:[]}};
 const collectedResult=await transformVerifiedSources(pool,collectedInput,{review_echo:{...schema({identity:{kind:'text'}}),collection:{cursorParameter:'cursor',nextCursorPath:['page','next'],identityPath:['identity']}}});
 const receipt=collectedResult.dataset.sourceContexts![0].collection!;
 assert.equal(receipt.executionId,collected.ids[0]);assert.equal(assessCollection([receipt]).complete,true);
 assert.equal(collectedResult.dataset.coverage,'unknown','query receipts do not silently promote objective coverage');
 await assert.rejects(transformVerifiedSources(pool,collectedInput,{review_echo:{...schema({identity:{kind:'text'}}),collection:{cursorParameter:'cursor',nextCursorPath:['invented'],identityPath:['identity']}}}),/METADATA_MISSING/);
 const catalog=new CapabilityCatalog([
  ...['bol_sales_stock_report','read_records','read_documents'].map(capabilityId=>({capabilityId,authorityClass:'GREEN' as const,specialistAgentId:'fixture',specialistVersion:'1',sideEffect:false})),
  {capabilityId:'delete_records',authorityClass:'RED',specialistAgentId:'writer',specialistVersion:'1',sideEffect:true}
 ]);
 assert(catalog.planningDescriptors().every(d=>d.output.schemaStatus==='UNKNOWN'));
 // Held-out natural-language goal texts contain neither tool names nor a plan.
 // Decisions below are deliberately TEST DOUBLES, not model-quality evidence.
 const goals=[
  'Read-only: compare revenue in the two supplied periods, explain the change and any tax or coverage gaps.',
  'Read-only: compare supplier promises with delivery documents and identify unmatched or late deliveries.',
  'Read-only: inventory duplicate documents by their content, cite each group, and do not delete anything.'
 ];
 for(const objective of [...goals,'Read-only bol.com sales stock report']){
  await proposePlan({goalId:'fixture',objective,context:{},dataClassification:'INTERNAL',maxCostUsd:.1,availableCapabilities:catalog.planningDescriptors(),gateway:{async invoke(task:any){
   assert.deepEqual(task.input.capabilities.map((c:any)=>c.capabilityId).sort(),['bol_sales_stock_report','read_documents','read_records']);
   assert(task.input.contract.rulesForSteps.some((s:string)=>s.includes('evidenceRequirements')));
   return {result:{output:{assumptions:{evidenceRequirements:[{deliverable:objective,gaps:['Unknown output schema until verified evidence is inspected']}]},steps:[{capabilityId:'read_records',params:{}}]}}};
  }} as any});
 }
 const money=schema({sku:{kind:'text'},period:{kind:'text'},amount:{kind:'decimal',unit:'EUR',vat:'unknown'}});
 for(const suffix of ['A17','Z92']){
  const raw=payload([{sku:suffix,period:'earlier',amount:'0.10'},{sku:suffix,period:'earlier',amount:'0.20'},{sku:suffix,period:'later',amount:'1.05'}]);
  const e=await evidence([raw]);
  const plan:TransformPlan={version:1,source:'sales',operations:[{op:'group',keys:['period'],aggregates:[{as:'amount',field:'amount',fn:'sum'}]}]};
  const input={goalId:e.goalId,legalEntityId:f.entity,sources:{sales:e.ids[0]},plan};
  const result=await transformVerifiedSources(pool,input,{review_echo:money});
  assert.deepEqual(result.dataset.rows.map(r=>r.values.amount),['0.3','1.05']);
  assert.equal(exactDecimal(result.dataset.rows[1].values.amount!,result.dataset.rows[0].values.amount!,'subtract'),'0.75');
  assert.deepEqual(await transformVerifiedSources(pool,input,{review_echo:money}),result,'exact deterministic replay');
  const comparison=await transformVerifiedSources(pool,{...input,plan:{version:1,source:'sales',operations:[
   {op:'filter',field:'period',compare:'eq',value:'earlier'},
   {op:'group',keys:['sku'],aggregates:[{as:'amount',field:'amount',fn:'sum'}]},{op:'save',as:'earlier'},
   {op:'from',source:'sales'},{op:'filter',field:'period',compare:'eq',value:'later'},
   {op:'group',keys:['sku'],aggregates:[{as:'amount',field:'amount',fn:'sum'}]},
   {op:'join',right:'earlier',leftKey:'sku',rightKey:'sku',kind:'left'},
   {op:'derive',as:'difference',left:'amount',right:'right_amount',operator:'subtract'}]}},{review_echo:money});
  assert.equal(comparison.dataset.rows[0].values.difference,'0.75');assert.equal(comparison.dataset.rows[0].citations.length,3);

  assert(result.dataset.rows.every(r=>r.citations.every(c=>c.executionId===e.ids[0]&&c.sourceHash.length===64)));
  assert.equal(assessDeliverables(result.dataset,[{id:suffix,description:goals[0],fields:['amount'],monetaryFields:['amount'],completeCoverage:true,knownTimeZone:true}])[0].structurallyReady,false,'unknown VAT remains unknown');
  await assert.rejects(transformVerifiedSources(pool,{...input,legalEntityId:crypto.randomUUID()},{review_echo:money}),/VERIFIED_SCOPE/);
  await assert.rejects(transformVerifiedSources(pool,{...input,goalId:crypto.randomUUID()},{review_echo:money}),/VERIFIED_SCOPE/);
  await assert.rejects(transformVerifiedSources(pool,input,{}),/OUTPUT_SCHEMA_UNKNOWN/);
  await assert.rejects(transformVerifiedSources(pool,input,{review_echo:{...money,rowsPath:['__proto__']}}),/PATH_INVALID/);
  await pool.query('UPDATE executions SET result=$2::jsonb WHERE id=$1',[e.ids[0],JSON.stringify({...raw,records:[]})]);
  await assert.rejects(transformVerifiedSources(pool,input,{review_echo:money}),/HASH_MISMATCH/);
  await pool.query('UPDATE executions SET result=$2::jsonb WHERE id=$1',[e.ids[0],JSON.stringify(raw)]);
  await pool.query(`INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at)
    SELECT execution_id,'revocation','db_query',contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications WHERE execution_id=$1`,[e.ids[0]]);
  await assert.rejects(transformVerifiedSources(pool,input,{review_echo:money}),/VERIFIED_SCOPE/);
 }
 // Same generic join/filter operators, with changing references and unavailable page.
 const oversized=await evidence([{...payload([{period:'x',amount:'1',sku:'x'}]),unused:'x'.repeat(250001)}]);
 await assert.rejects(transformVerifiedSources(pool,{goalId:oversized.goalId,legalEntityId:f.entity,sources:{s:oversized.ids[0]},plan:{version:1,source:'s',operations:[]}},{review_echo:money}),/VERIFIED_SCOPE/);
 const deliverySchema=schema({reference:{kind:'text'},date:{kind:'date'}});
 for(const ref of ['X-93','K-42']){
  const e=await evidence([payload([{reference:ref,date:'2026-10-21'},{reference:'missing',date:'2026-10-22'}]),payload([{reference:ref,date:'2026-10-23'}],'partial')]);
  const result=await transformVerifiedSources(pool,{goalId:e.goalId,legalEntityId:f.entity,sources:{promises:e.ids[0],deliveries:e.ids[1]},plan:{version:1,source:'promises',operations:[{op:'join',right:'deliveries',leftKey:'reference',rightKey:'reference',kind:'left'},{op:'derive',as:'delay',left:'right_date',right:'date',operator:'subtract'}]}},{review_echo:deliverySchema});
  assert.equal(result.dataset.rows.length,2);assert.equal(result.dataset.rows[0].values.right_date,'2026-10-23');assert.equal(result.dataset.rows[1].values.right_date,null);assert.equal(result.dataset.rows[0].values.delay,'2');assert.equal(result.dataset.rows[1].values.delay,null);
  assert.equal(result.dataset.rows[0].citations.length,2);assert.equal(result.dataset.coverage,'partial');
  assert(assessDeliverables(result.dataset,[{id:'delivery',description:goals[1],fields:['right_date'],completeCoverage:true,knownTimeZone:true}])[0].gaps.includes('COVERAGE_PARTIAL'));
 }
 const docsSchema=schema({document:{kind:'text'},hash:{kind:'text'}});
 for(const coverage of ['complete','partial']){
  const e=await evidence([payload([{document:crypto.randomUUID(),hash:'same'},{document:crypto.randomUUID(),hash:'same'},{document:crypto.randomUUID(),hash:'other'}],coverage)]);
  const result=await transformVerifiedSources(pool,{goalId:e.goalId,legalEntityId:f.entity,sources:{docs:e.ids[0]},plan:{version:1,source:'docs',operations:[{op:'group',keys:['hash'],aggregates:[{as:'copies',fn:'count'}]},{op:'filter',field:'copies',compare:'gt',value:'1'}]}},{review_echo:docsSchema});
  assert.equal(result.dataset.rows.length,1);assert.equal(result.dataset.rows[0].values.copies,'2');assert.equal(result.dataset.rows[0].citations.length,2);
  assert.equal(result.dataset.coverage,coverage);assert.equal((await pool.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,0);
 }
 assert.equal(exactDecimal('0.1','0.2','add'),'0.3');assert.equal(exactDecimal('1','8','divide'),'0.125');
 assert.throws(()=>exactDecimal('1','3','divide'),/ROUNDING_REQUIRED/);assert.throws(()=>exactDecimal('1','0','divide'),/DIVIDE_BY_ZERO/);
 assert.throws(()=>exactDecimal('1e9','1','add'),/DECIMAL_INVALID/);
 const d:Dataset={columns:{k:{kind:'text'},a:{kind:'decimal',unit:'EUR',vat:'unknown'},b:{kind:'decimal',unit:'USD',vat:'unknown'}},rows:[{values:{k:'a',a:'1',b:'2'},citations:[{executionId:'fixture',verificationId:'fixture',row:0,sourceHash:'fixture'}]}],coverage:'unknown',timeZone:null,limitations:[]};
 assert.throws(()=>replayTransform({version:1,source:'s',operations:[{op:'derive',as:'c',left:'a',right:'b',operator:'add'}]},{s:d}),/UNIT_OR_SEMANTICS_UNKNOWN/);
 assert.throws(()=>replayTransform({version:1,source:'s',operations:[{op:'eval',code:'process.env'} as any]},{s:d}),/OPERATION_UNSUPPORTED/);
 assert.throws(()=>replayTransform({version:1,source:'s',operations:Array(13).fill({op:'select',fields:{k:'k'}})},{s:d}),/PLAN_LIMIT/);
 const many={...d,rows:Array.from({length:100},()=>d.rows[0])};
 assert.throws(()=>replayTransform({version:1,source:'s',operations:[{op:'join',right:'t',leftKey:'k',rightKey:'k',kind:'inner'}]},{s:many,t:many}),/ROW_OR_COLUMN_LIMIT/);
 const unknownUnit={...d,columns:{...d.columns,a:{kind:'decimal' as const,unit:'UNKNOWN'}}};
 assert.throws(()=>replayTransform({version:1,source:'s',operations:[{op:'group',keys:['k'],aggregates:[{as:'total',fn:'sum',field:'a'}]}]},{s:unknownUnit}),/UNIT_OR_SEMANTICS_UNKNOWN/);
 assert.equal(assessDeliverables({...d,columns:{...d.columns,a:{kind:'decimal',unit:'EUR',vat:'UNKNOWN'}}},[{id:'money',description:'Money',fields:['a'],monetaryFields:['a'],completeCoverage:false,knownTimeZone:false}])[0].structurallyReady,false);
 assert.throws(()=>replayTransform({version:1,source:'s',operations:[]},{s:{...d,timeZone:'UNKNOWN'}}),/TIME_ZONE_UNKNOWN/);
 // Numeric durations are decimal arithmetic, even when their unit is calendar_day.
 const durations:Dataset={...d,columns:{a:{kind:'decimal',unit:'calendar_day'},b:{kind:'decimal',unit:'calendar_day'}},rows:[{...d.rows[0],values:{a:'2',b:'3'}}]};
 for(const [operator,expected] of [['add','5'],['subtract','-1']] as const){
  assert.equal(replayTransform({version:1,source:'s',operations:[{op:'derive',as:'days',left:'a',right:'b',operator}]},{s:durations}).dataset.rows[0].values.days,expected);
 }
 // Unknown VAT must survive a dimensionless ratio and subsequent monetary scaling.
 const amounts:Dataset={...d,columns:{a:{kind:'decimal',unit:'EUR',vat:'unknown'},b:{kind:'decimal',unit:'EUR',vat:'unknown'},net:{kind:'decimal',unit:'EUR',vat:'net'}},rows:[{...d.rows[0],values:{a:'2',b:'4',net:'10'}}]};
 for(const vat of ['unknown',undefined])for(const [left,right] of [['ratio','net'],['net','ratio']]){
  amounts.columns.a.vat=vat;amounts.columns.b.vat=vat;
  const scaled=replayTransform({version:1,source:'s',operations:[{op:'derive',as:'ratio',left:'a',right:'b',operator:'divide'},{op:'derive',as:'scaled',left,right,operator:'multiply'}]},{s:amounts}).dataset;
  assert.equal(scaled.rows[0].values.scaled,'5');assert.equal(scaled.columns.ratio.semanticUncertainty,true);
  assert(assessDeliverables(scaled,[{id:'scaled',description:'Scaled amount',fields:['scaled'],monetaryFields:['scaled'],completeCoverage:false,knownTimeZone:false}])[0].gaps.includes('MONETARY_SEMANTICS_UNKNOWN:scaled'));
 }
 // Complete input populations do not make an inner-join subset population-complete.
 const population:Dataset={...d,columns:{k:{kind:'text'}},rows:['matched','missing'].map(k=>({...d.rows[0],values:{k}})),coverage:'complete'};
 const joined=replayTransform({version:1,source:'s',operations:[{op:'join',right:'t',leftKey:'k',rightKey:'k',kind:'inner'}]},{s:population,t:{...population,rows:population.rows.slice(0,1)}}).dataset;
 assert.equal(joined.rows.length,1);assert(joined.limitations.some(x=>x.includes('1 unmatched left records')));
 assert(assessDeliverables(joined,[{id:'population',description:'Full population',fields:['k'],completeCoverage:true,knownTimeZone:false}])[0].gaps.includes('FILTERED_SCOPE_REQUIRES_REVIEW'));
 assert.equal(f.counters().sends,0);
 console.log(JSON.stringify({status:'PASS',goals,classification:'SYNTHETIC_SCRIPTED_DECISIONS_NOT_AUTONOMOUS_MODEL_QUALITY',liveModelCalls:0,productionRegistration:false,coverage:['generic catalog alternatives','decimal replay','provenance','period grouping','partial pagination','unmatched joins','duplicate inventory without deletion','cross-tenant/goal refusal','revocation','limits']}));
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
