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
const candidate=()=>({summary:'تحليل المصدر مع مراعاة المجهول',observations:[{reference:'totals.netOrdered',comment:'الكمية لا تعكس أثر المرتجعات'}]});
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

test('actual adapter sends strict aggregate-specific schema and verifier binds the same prompt',async()=>{
 const {prompt,instructions,aggregate,outcome}=await sentPrompt(),schema=prompt.outputSchema;
 assert.ok(instructions.length<=16000,'Full thirty-product prompt must retain the existing ceiling');
 assert.match(prompt.observationRules,/substantive/);
 assert.match(prompt.observationRules,/analysisCoverage/);
 assert.equal(prompt.formatExample.label,'FORMAT ONLY; never copy as actual analysis');
 assert.doesNotThrow(()=>validateInterpretation(JSON.stringify(prompt.formatExample.output),aggregate));
 assert.notDeepEqual(outcome.result.report.interpretation.summary,prompt.formatExample.output.summary);
 assert.equal(schema.additionalProperties,false);assert.deepEqual(schema.required,['summary','observations']);
 assert.equal(schema.properties.summary.minLength,1);assert.equal(schema.properties.summary.maxLength,1800);
 assert.equal(schema.properties.observations.minItems,1);assert.equal(schema.properties.observations.maxItems,8);
 const observation=schema.properties.observations.items;
 assert.equal(observation.additionalProperties,false);assert.equal(observation.properties.comment.maxLength,800);
 assert.equal(observation.properties.reference.allOf[0].maxLength,100);
 const allowed=observation.properties.reference.allOf[1].enum as string[];
 assert.ok(allowed.includes('includedOrders'));assert.ok(allowed.includes('orderItems'));assert.ok(allowed.includes('values.commissions'));
 assert.ok(allowed.includes('products.29.stock'));assert.ok(!allowed.includes('products.30.stock'));
 for(const path of ['analysisCoverage.sentProducts','account.retailerId','period.days','totals','products.0'])assert.ok(!allowed.includes(path));
 assert.equal(outcome.result.report.interpretation.classification,'MODEL_INFERENCE');
 assert.equal(outcome.result.report.interpretation.observations[0].value,aggregate.totals.netOrdered);
 const unknown={...candidate(),observations:[{reference:'values.commissions',comment:'القيمة غير معروفة'}]};
 assert.equal(validateInterpretation(JSON.stringify(unknown),aggregate).observations[0].value,null);
 console.log(JSON.stringify({kind:'SYNTHETIC_OUTPUT_CONTRACT',promptCharacters:instructions.length,referenceCount:allowed.length}));
});

test('sent schema and local parser agree on bounds, forbidden paths, numeric narrative and strict objects',async()=>{
 const {prompt,aggregate}=await sentPrompt(),ajv=new Ajv2020({strict:false});
 ajv.addKeyword({keyword:'x-sam-max-utf16-code-units',type:'string',schemaType:'number',
  validate:(max:number,value:string)=>value.length<=max,errors:false});
 const jsonSchema=ajv.compile(prompt.outputSchema);
 assert.match(prompt.schemaExtensions['x-sam-max-utf16-code-units'],/Mandatory assertion/);
 assert.equal(prompt.outputSchema.properties.summary['x-sam-max-utf16-code-units'],1800);
 assert.equal(prompt.outputSchema.properties.observations.items.properties.comment['x-sam-max-utf16-code-units'],800);
 assert.equal(prompt.outputSchema.properties.observations.items.properties.reference.allOf[0]['x-sam-max-utf16-code-units'],100);
 const cases:[string,any,boolean][]=[['minimal',candidate(),true],
  ['upper bounds',{summary:'ت'.repeat(1800),observations:Array.from({length:8},()=>({reference:'totals.netOrdered',comment:'ت'.repeat(800)}))},true],
  ['empty summary',{...candidate(),summary:''},false],['whitespace summary',{...candidate(),summary:' \n\t\u00a0'},false],['long summary',{...candidate(),summary:'ت'.repeat(1801)},false],
  ['no observations',{...candidate(),observations:[]},false],['nine observations',{...candidate(),observations:Array.from({length:9},()=>candidate().observations[0])},false],
  ['astral summary at limit',{...candidate(),summary:'😀'.repeat(900)},true],
  ['astral summary over limit',{...candidate(),summary:'😀'.repeat(901)},false],
  ['astral comment at limit',{...candidate(),observations:[{reference:'totals.netOrdered',comment:'😀'.repeat(400)}]},true],
  ['astral comment over limit',{...candidate(),observations:[{reference:'totals.netOrdered',comment:'😀'.repeat(401)}]},false],
  ['extra root',{...candidate(),extra:'no'},false]];
 for(const reference of ['', 'x'.repeat(101),'analysisCoverage.sentProducts','period.days','account.retailerId','totals','products.0','products.30.stock','products.0.unknown','totals.invented','includedOrdersSuffix'])
  cases.push(['reference '+reference,{...candidate(),observations:[{reference,comment:'تفسير'}]},false]);
 for(const comment of ['', ' \n\t\u00a0', 'ت'.repeat(801),'عدد 1','عدد ١','عدد ۱'])cases.push(['comment '+comment.length,{...candidate(),observations:[{reference:'totals.netOrdered',comment}]},false]);
 for(const summary of ['عدد 1','عدد ١','عدد ۱'])cases.push(['numeric summary',{...candidate(),summary},false]);
 cases.push(['extra observation',{...candidate(),observations:[{...candidate().observations[0],value:76}]},false]);
 for(const [name,value,accepted] of cases){
  assert.equal(jsonSchema(value),accepted,'sent schema: '+name);
  if(accepted)assert.doesNotThrow(()=>validateInterpretation(JSON.stringify(value),aggregate),name);
  else assert.throws(()=>validateInterpretation(JSON.stringify(value),aggregate),name);
 }
 assert.throws(()=>validateInterpretation('not JSON',aggregate));
 // The mandatory extension preserves the existing UTF-16 bounds; standard
 // JSON Schema maxLength alone would count astral characters differently.
 assert.match(prompt.outputSchema.properties.summary.description,/1800 UTF-16 code units/);
 assert.match(prompt.outputSchema.properties.observations.items.properties.comment.description,/800 UTF-16 code units/);
});

if(process.env.SAM_HERMES_SOURCE_REPORT_FILE)test('preserved verified source fits the unchanged prompt ceiling through the actual adapter',async()=>{
 const path=process.env.SAM_HERMES_SOURCE_REPORT_FILE!,before=await readFile(path),report=JSON.parse(before.toString('utf8'));
 const {instructions,prompt}=await sentPrompt(report);
 assert.ok(instructions.length<=16000);assert.equal(prompt.aggregate.products.length,30);
 assert.deepEqual(await readFile(path),before,'Source evidence must remain unchanged');
 console.log(JSON.stringify({kind:'PRESERVED_SOURCE_PROMPT',sourceProducts:report.products.length,sentProducts:prompt.aggregate.products.length,promptCharacters:instructions.length}));
});

if(process.env.SAM_HERMES_REJECTED_OUTPUT_FILE)test('original privately preserved Hermes output remains rejected and byte-identical',async()=>{
 const path=process.env.SAM_HERMES_REJECTED_OUTPUT_FILE!,bytes=await readFile(path),original=JSON.parse(bytes.toString('utf8'));
 const expected=['a26a742581a2bc61f82ab755998851948258a50ee6befbd97cfef537155ef604','7b956f6fb14c67214076dc75516804c847eff711c7f4c7297f00cedb1c6efa2e'];
 const {createHash}=await import('node:crypto'),hash=(input:Buffer)=>createHash('sha256').update(input).digest('hex');
 const originalHash=hash(bytes);
 assert.ok(expected.includes(originalHash),'Use exact saved original bytes, not a shortened or repaired response');
 if(originalHash===expected[0]){
  assert.equal(original.observations.length,7);assert.ok(original.observations.every((o:any)=>o.comment===''));assert.equal(original.observations[0].reference,'analysisCoverage');
  assert.throws(()=>validateInterpretation(bytes.toString('utf8'),aggregateForHermes(sourceReport())),/ANALYSIS_UNSUPPORTED_CLAIM|Too small|too_small/);
 }else{
  assert.equal(original.observations.length,14);assert.ok(original.observations.some((o:any)=>o.reference==='analysisCoverage.sentProducts'));
  assert.throws(()=>validateInterpretation(bytes.toString('utf8'),aggregateForHermes(sourceReport())),/Too big|too_big/);
 }
 assert.equal(hash(await readFile(path)),originalHash,'Validation must not mutate the original evidence');
});
