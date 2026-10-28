/** Local contract regression. No external model, source read or production mutation. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import Ajv2020 from 'ajv/dist/2020';
import {pool} from '../../packages/db/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {FREE_RUNTIME,type HermesTask,type Receipt} from '../../packages/hermes/src/client';
import {ANALYST,SOURCE,ANALYSIS_MARKER} from '../../apps/production/src/dataAnalysisContract';
import {withHermesDataAnalysis,aggregateForHermes,validateInterpretation} from '../../apps/production/src/hermesDataAnalysis';

const ENTITY='00000000-0000-4000-8000-000000000001',GOAL='00000000-0000-4000-8000-000000000002',QUEUE='00000000-0000-4000-8000-000000000003';
const candidate=()=>({version:'sam.analysis_selection.v2',references:['totals.netOrdered']});
function sourceReport(){
 return {account:{retailerId:'synthetic-retailer'},period:{startDate:'2026-10-26',endDate:'2026-10-26',timeZone:'Europe/Amsterdam',days:1},
  coverage:{pagination:'every requested collection reached an empty terminal page'},includedOrders:65,orderItems:76,
  totals:{ordered:76,cancelled:0,shipped:54,netOrdered:76},
  values:{orderedPriceCents:137672,afterCancellationPriceCents:137672,pricedOrderedUnits:76,unpricedOrderedUnits:0,commissions:null,returns:null,netProfit:null,currency:null,taxBasis:null},
  products:Array.from({length:30},(_,i)=>({ean:`synthetic-product-${i}`,fulfilment:'FBR',ordered:1,cancelled:0,shipped:1,netOrdered:1,stock:500,orderedPriceCents:1999,afterCancellationPriceCents:1999})),limitations:['Synthetic source; unknown values remain unknown.']};
}
async function sentPrompt(report=sourceReport()){
 const source={id:'synthetic-source-execution',result:{report,coverageComplete:true,startDate:'2026-10-26',endDate:'2026-10-26'},evidence:{reportHash:sha256Hex(report)}};
 const work:{goal_id:string;created_at:string;handoff:{hermes?:Receipt}}={goal_id:GOAL,created_at:new Date().toISOString(),handoff:{}};
 let sent:HermesTask|undefined,outcome:any;
 const db={async query(sql:string){
  if(sql.includes('pg_try_advisory_lock'))return {rowCount:1,rows:[{locked:true}]};
  if(sql.includes('pg_advisory_unlock'))return {rowCount:1,rows:[]};
  if(sql.includes('SELECT queue_id,goal_id FROM executions'))return {rowCount:1,rows:[{queue_id:QUEUE,goal_id:GOAL}]};
  if(sql.includes('FROM executions e JOIN work_queue'))return {rowCount:1,rows:[source]};
  if(sql.includes('g.company_scope'))return {rowCount:1,rows:[{...work,plan_id:'synthetic-plan',company_scope:ENTITY}]};
  if(sql.includes('SELECT w.goal_id,w.created_at,w.handoff'))return {rowCount:1,rows:[work]};
  throw Error('Unexpected synthetic SQL: '+sql);
 }};
 const connect=pool.connect;
 (pool as any).connect=async()=>({...db,release(){}});
 try{
  const bundle=withHermesDataAnalysis({capabilities:[{capabilityId:SOURCE,authorityClass:'GREEN',specialistAgentId:'marketplace',specialistVersion:'1'}],toolDefinitions:[],toolAdapters:[]},
   {policy:{legalEntityId:ENTITY,activatedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+600000).toISOString()},db,
    client:{async execute(task,store){
     sent=structuredClone(task);const receipt:Receipt={taskHash:sha256Hex(task),status:'completed',runId:'run_synthetic_contract',output:JSON.stringify(candidate()),runtime:FREE_RUNTIME};
     // The transport is synthetic; retain the exact submitted task/receipt binding.
     work.handoff.hermes=receipt;return receipt;
    }}});
  outcome=await bundle.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute({capabilityId:ANALYST,idempotencyKey:'synthetic-contract',
   params:{agent_role:'data_analyst',instructions:ANALYSIS_MARKER},executionContext:{queueId:QUEUE,fencingToken:1}});
  assert.ok(sent);assert.equal(sent.timeout,120000);assert.deepEqual(sent.allowed_tools,[]);assert.deepEqual(sent.repository_scope,[]);
  const verifier=bundle.verificationAdapters!.find(v=>v.capabilityId===ANALYST)!,input:any={execution:{id:'synthetic-analysis-execution',capabilityId:ANALYST,...outcome},contract:{}};
  assert.equal((await verifier.verify(input)).result,'VERIFIED','Verifier must recreate the exact prompt submitted through the adapter');
  work.handoff.hermes!.taskHash=sha256Hex({...sent,instructions:sent.instructions+' '});
  assert.equal((await verifier.verify(input)).result,'FAILED','Changed instructions must invalidate the saved task binding');
  return {prompt:JSON.parse(sent.instructions),instructions:sent.instructions,aggregate:aggregateForHermes(report),outcome};
 }finally{pool.connect=connect;}
}

test('synthetic V2 reference-only contract derives facts and exposes full-source versus subset coverage',async()=>{
 const report=sourceReport();report.products.push(...Array.from({length:13},(_,i)=>({...report.products[0],ean:`extra-${i}`})));
 const {prompt,instructions,aggregate,outcome}=await sentPrompt(report),schema=prompt.outputSchema;
 assert.ok(instructions.length<=16000);assert.match(prompt.observationRules,/one to eight distinct scalar/);
 assert.match(prompt.limitations[0],/tax basis/);assert.doesNotMatch(prompt.limitations[0],/Prices exclude/);
 assert.equal(schema.additionalProperties,false);assert.deepEqual(schema.required,['version','references']);
 assert.equal(schema.properties.references.minItems,1);assert.equal(schema.properties.references.maxItems,8);
 const allowed=schema.properties.references.items.allOf[1].enum as string[];
 assert.ok(allowed.includes('products.29.stock'));assert.ok(!allowed.includes('products.30.stock'));
 assert.ok(allowed.includes('values.commissions'));assert.ok(!allowed.includes('analysisCoverage.sentProducts'));
 const result=outcome.result.report;
 assert.equal(result.source.products.length,43);assert.equal(result.analysisCoverage.sentProducts,30);
 assert.match(result.interpretation.summary,/30 منتجاً من أصل 43 منتجاً/);
 assert.match(result.interpretation.summary,/إجماليات المصدر الكامل/);assert.match(result.interpretation.summary,/الملغى=0/);assert.match(result.interpretation.summary,/العملة=غير معروف، وليس صفراً؛ الأساس الضريبي=غير معروف، وليس صفراً/);
 assert.equal(result.interpretation.classification,'SOURCE_DERIVED');
 assert.equal(result.interpretation.observations[0].value,aggregate.totals.netOrdered);
 const unknown=validateInterpretation(JSON.stringify({...candidate(),references:['values.commissions']}),aggregate);
 assert.equal(unknown.observations[0].value,null);assert.match(unknown.observations[0].comment,/غير معروف، وليس صفراً/);
 assert.equal(result.semanticPolicy,'sam.source_derived_semantics.v2');
});

test('synthetic schema and parser reject arbitrary narrative, invalid references and overflow before persistence',async()=>{
 const {prompt,aggregate}=await sentPrompt(),ajv=new Ajv2020({strict:false});const validate=ajv.compile(prompt.outputSchema);
 const cases:[string,any,boolean][]=[['minimal',candidate(),true],
 ['eight references',{...candidate(),references:['includedOrders','orderItems','totals.ordered','totals.cancelled','totals.shipped','totals.netOrdered','values.currency','values.commissions']},true],
 ['summary',{...candidate(),summary:'Profit is healthy'},false],['comment',{...candidate(),comment:'Shipping caused profit'},false],
 ['V1',{summary:'تحليل',observations:[{reference:'totals.netOrdered',comment:'ارتفاع الربح'}]},false],
 ['duplicate',{...candidate(),references:['totals.netOrdered','totals.netOrdered']},false],['wrong version',{...candidate(),version:'v1'},false],['empty',{...candidate(),references:[]},false],
 ['nine',{...candidate(),references:Array.from({length:9},()=> 'totals.netOrdered')},false]];
 for(const reference of ['', 'x'.repeat(101),'analysisCoverage.sentProducts','period.days','account.retailerId','totals','products.0','products.30.stock','totals.invented'])cases.push([reference,{...candidate(),references:[reference]},false]);
 for(const [name,value,accepted]of cases){assert.equal(validate(value),accepted,name);if(accepted)assert.doesNotThrow(()=>validateInterpretation(JSON.stringify(value),aggregate),name);else assert.throws(()=>validateInterpretation(JSON.stringify(value),aggregate),name);}
 assert.throws(()=>validateInterpretation(JSON.stringify({...candidate(),references:['totals.netOrdered','totals.netOrdered']}),aggregate),/DUPLICATE/);
 assert.throws(()=>validateInterpretation('not JSON',aggregate));assert.throws(()=>validateInterpretation(' '.repeat(2049),aggregate),/TOO_LARGE/);
});

if(process.env.SAM_HERMES_SOURCE_REPORT_FILE)test('preserved source remains byte-identical under V2',async()=>{
 const path=process.env.SAM_HERMES_SOURCE_REPORT_FILE!,before=await readFile(path),report=JSON.parse(before.toString('utf8'));
 const {instructions,prompt}=await sentPrompt(report);assert.ok(instructions.length<=16000);assert.equal(prompt.aggregate.products.length,30);assert.deepEqual(await readFile(path),before);
});
if(process.env.SAM_HERMES_REJECTED_OUTPUT_FILE)test('privately preserved original output remains rejected and unchanged',async()=>{
 const path=process.env.SAM_HERMES_REJECTED_OUTPUT_FILE!,before=await readFile(path);const {createHash}=await import('node:crypto');assert.ok(['a26a742581a2bc61f82ab755998851948258a50ee6befbd97cfef537155ef604','7b956f6fb14c67214076dc75516804c847eff711c7f4c7297f00cedb1c6efa2e'].includes(createHash('sha256').update(before).digest('hex')),'Use exact preserved original bytes');assert.throws(()=>validateInterpretation(before.toString('utf8'),aggregateForHermes(sourceReport())));assert.deepEqual(await readFile(path),before);
});
