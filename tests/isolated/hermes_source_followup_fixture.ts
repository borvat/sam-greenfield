/** Offline integration fixture: actual SAM SQL/functions, PGlite, synthetic Hermes HTTP only. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {pool} from '../../packages/db/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {HermesClient,DEEPSEEK_RUNTIME} from '../../packages/hermes/src/client';
import {ANALYST,SOURCE} from '../../apps/production/src/dataAnalysisContract';
import {withHermesDataAnalysis} from '../../apps/production/src/hermesDataAnalysis';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import type {ProductionBundle} from '../../apps/production/src/types';
import {createKernelProductionDispatcher} from '../../apps/production/src/dispatcher';
import {createChatGPTToolSurface} from '../../apps/chatgpt-tools/src/surface';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
const {PGlite}=require(process.env.SAM_TEST_PGLITE_MODULE??'@electric-sql/pglite');

export const ENTITY='00000000-0000-4000-8000-00000000000a',OTHER='00000000-0000-4000-8000-00000000000b';
const ORIGINAL_GOAL='c0000000-0000-4000-8000-000000000010',ORIGINAL_PLAN='d0000000-0000-4000-8000-000000000011';
const SOURCE_WORK='00000000-0000-4000-8000-000000000012',ORIGINAL_ANALYSIS='00000000-0000-4000-8000-000000000013';
const SOURCE_EXECUTION='a0000000-0000-4000-8000-000000000014',SOURCE_VERIFICATION='b0000000-0000-4000-8000-000000000015';
export const SOURCE_CONTRACT='00000000-0000-4000-8000-000000000016',ANALYST_CONTRACT='00000000-0000-4000-8000-000000000017';
const RESERVATION='00000000-0000-4000-8000-000000000018';
export const owner={actor:'synthetic-system-owner',systemOwner:true};
export const answer=JSON.stringify({summary:'قراءة المصدر المحفوظ مع مراعاة البيانات المجهولة',observations:[{reference:'totals.netOrdered',comment:'الكمية لا تتضمن أثر المرتجعات'}]});
export function originalPlanHash(plan:any){return sha256Hex({goal_id:plan.goal_id,version:Number(plan.version),assumptions:plan.goal_assumptions??{},constraints:plan.constraints??{},dependencies:plan.dependencies??{},steps:plan.steps});}
export function originalExecutionHash(execution:any){return sha256Hex({queue_id:execution.queue_id,goal_id:execution.goal_id,plan_id:execution.plan_id,plan_hash:execution.plan_hash,capability_id:execution.capability_id,
 params:execution.params??{},result:execution.result,evidence:execution.evidence,fencing_token:Number(execution.fencing_token),operation_key_ref:execution.operation_key_ref??null});}
export async function readStrictPrivateFixture(timelinePath:string){
 const names=['SAM_HERMES_REUSE_BINDING_FILE','SAM_HERMES_REUSE_CONTRACTS_FILE','SAM_HERMES_REUSE_RESERVATION_FILE','SAM_HERMES_REUSE_PREPARED_REQUEST_FILE'] as const;
 for(const name of names)assert.ok(process.env[name],`Private fixture requires ${name}; no synthetic fallback is allowed`);
 const [saved,expectedBinding,contracts,reservations,preparedRequest]=await Promise.all([timelinePath,...names.map(name=>process.env[name]!)]).then(paths=>Promise.all(paths.map(async p=>JSON.parse(await readFile(p,'utf8')))));
 const data=saved.data??saved;
 assert.equal(expectedBinding.sourceExecutionId,'978e79f3-8f0c-4a0b-8482-b22b6f601f0a','Private fixture must target the explicitly approved source');
 assert.ok(data.goal&&Array.isArray(data.plans)&&Array.isArray(data.work)&&Array.isArray(data.executions)&&Array.isArray(data.verifications),'Private timeline is incomplete');
 assert.equal(data.goal.id,expectedBinding.sourceGoalId);assert.equal(data.goal.company_scope,expectedBinding.legalEntityId);assert.equal(data.goal.state,'FAILED');
 const source=data.executions.find((e:any)=>e.id===expectedBinding.sourceExecutionId),plan=data.plans.find((p:any)=>p.id===expectedBinding.sourcePlanId),proof=data.verifications.find((v:any)=>v.id===expectedBinding.sourceVerificationId);
 assert.ok(source&&plan&&proof,'Missing exact private source, plan or verification; never use synthetic defaults');
 const sourceWork=data.work.find((w:any)=>w.id===source.queue_id),oldAnalysis=data.work.find((w:any)=>w.capability_id===ANALYST);
 assert.ok(sourceWork&&oldAnalysis?.handoff?.hermes,'Private source work or original receipt is missing');
 assert.equal(source.capability_id,SOURCE);assert.equal(source.goal_id,expectedBinding.sourceGoalId);assert.equal(source.plan_id,expectedBinding.sourcePlanId);
 assert.equal(source.execution_hash,expectedBinding.sourceExecutionHash);assert.equal(source.plan_hash,expectedBinding.sourcePlanHash);assert.equal(source.evidence.reportHash,expectedBinding.sourceHash);
 assert.equal(sha256Hex(source.result.report),expectedBinding.sourceHash);assert.equal(originalPlanHash(plan),expectedBinding.sourcePlanHash);assert.equal(originalExecutionHash(source),expectedBinding.sourceExecutionHash);
 assert.equal(proof.execution_id,source.id);assert.equal(proof.result,'VERIFIED');assert.equal(proof.execution_hash,source.execution_hash);assert.equal(proof.plan_hash,source.plan_hash);
 assert.equal(source.result.startDate,expectedBinding.startDate);assert.equal(source.result.endDate,expectedBinding.endDate);assert.equal(source.result.timeZone,expectedBinding.timeZone);
 assert.ok(Array.isArray(contracts)&&contracts.some((c:any)=>c.id===proof.contract_id&&c.capability_id===SOURCE),'Original verification contract must be captured');
 assert.ok(contracts.some((c:any)=>c.capability_id===ANALYST),'Analyst verification contract is required');
 assert.ok(Array.isArray(reservations)&&reservations.length===1&&reservations[0].task==='hermes:'+oldAnalysis.id,'Exact old reservation snapshot required');
 assert.equal(reservations[0].verification_result,'RESERVED_USAGE_UNKNOWN');
 assert.equal(preparedRequest.name,'sam_submit_analysis_followup');assert.deepEqual(preparedRequest.arguments.source_binding,expectedBinding);assert.equal(preparedRequest.arguments.legal_entity_id,expectedBinding.legalEntityId);
 assert.ok(typeof preparedRequest.arguments.objective==='string'&&preparedRequest.arguments.objective.trim());
 return {data,expectedBinding,contracts,reservation:reservations[0],preparedRequest,source,plan,proof,sourceWork,oldAnalysis};
}
export function report(){return {account:{retailerId:'synthetic-retailer'},period:{startDate:'2026-10-26',endDate:'2026-10-26',timeZone:'Europe/Amsterdam',days:1},
 coverage:{pagination:'every requested collection reached an empty terminal page'},includedOrders:2,orderItems:3,
 totals:{ordered:3,cancelled:0,shipped:2,netOrdered:3},values:{orderedPriceCents:2997,afterCancellationPriceCents:2997,pricedOrderedUnits:3,unpricedOrderedUnits:0,commissions:null,returns:null,netProfit:null,currency:null,taxBasis:null},
 products:[{ean:'synthetic-public-product',fulfilment:'FBR',ordered:3,cancelled:0,shipped:2,netOrdered:3,stock:5,orderedPriceCents:2997,afterCancellationPriceCents:2997}],limitations:['Synthetic local source; no live collection.']};}

export async function followupFixture(privateTimeline?:string,candidate:string=answer,syntheticOptions:{sourceReport?:any;objective?:string}={}){
 const privateData=privateTimeline?await readStrictPrivateFixture(privateTimeline):undefined;
 assert.ok(!privateData||!Object.keys(syntheticOptions).length,'Private replay must not override captured evidence');
 const sql=new PGlite();
 await sql.exec(`CREATE SEQUENCE ids;
 CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE sql AS $$SELECT '00000000-0000-4000-8000-000000000099'::uuid$$;
 CREATE FUNCTION next_business_id(text,uuid) RETURNS text LANGUAGE sql AS $$SELECT 'SYNTHETIC-G'||nextval('ids')::text$$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY);
 CREATE TABLE goals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id text,company_scope uuid,domain text,objective text,state text,authority_ceiling text,completion_definition text,current_plan_id uuid,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),replan_attempts int DEFAULT 0);
 CREATE TABLE audit_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor text,goal_id uuid,action text,entity_type text,entity_id uuid,after_ref jsonb,source text,authority_class text,result text,timestamp timestamptz DEFAULT now());
 CREATE TABLE plans(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid,version int,goal_assumptions jsonb,constraints jsonb,dependencies jsonb,steps jsonb,plan_hash text,created_at timestamptz DEFAULT now());
 CREATE TABLE work_queue(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid,plan_id uuid,step_id uuid,capability_id text,params jsonb,priority int DEFAULT 0,due_at timestamptz,idempotency_key text,operation_key_ref text,step_key text,depends_on uuid[] DEFAULT '{}',result_refs jsonb DEFAULT '{}',status text DEFAULT 'QUEUED',handoff jsonb,fencing_token bigint DEFAULT 1,lease_expiry timestamptz,lease_owner text,lease_timestamp timestamptz,attempt int DEFAULT 0,queued_at timestamptz DEFAULT now(),created_at timestamptz DEFAULT now());
 CREATE TABLE outbox_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),aggregate_type text,aggregate_id uuid,event_type text,payload jsonb,created_at timestamptz DEFAULT now());
 CREATE TABLE executions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),queue_id uuid,goal_id uuid,plan_id uuid,capability_id text,params jsonb,result jsonb,evidence jsonb,execution_hash text,plan_hash text,actor text,status text DEFAULT 'EXECUTED',fencing_token bigint,operation_key_ref text,started_at timestamptz DEFAULT now(),finished_at timestamptz DEFAULT now());
 CREATE TABLE verification_contracts(id uuid PRIMARY KEY,capability_id text,verification_method text,required_evidence_fields jsonb,independent_query_template jsonb,must_not_trust_execution_result boolean);
 CREATE TABLE verifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),execution_id uuid,verifier text,method text,contract_id uuid,execution_hash text,plan_hash text,independent_evidence jsonb,result text,checked_at timestamptz DEFAULT now());
 CREATE TABLE model_calls(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),task text,provider text,model text,reason_selected text,tokens int,cost float,latency_ms int,retry_count int,success boolean,verification_result text,data_classification text,created_at timestamptz DEFAULT now());`);
 await sql.exec(`ALTER TABLE goals ADD COLUMN owner_id uuid,ADD COLUMN priority int DEFAULT 0,ADD COLUMN next_wake_at timestamptz,ADD COLUMN world_model_version uuid,ADD COLUMN parent_goal_id uuid,ADD COLUMN replan_reason text,ADD COLUMN planning_attempts int DEFAULT 0,ADD COLUMN last_planning_at timestamptz,ADD COLUMN planning_retry_at timestamptz,ADD COLUMN planning_failure jsonb;
 ALTER TABLE work_queue ADD COLUMN worker_version text,ADD COLUMN wake_reason text;
 ALTER TABLE verifications ADD COLUMN operation_key_ref text;
 ALTER TABLE verification_contracts ADD COLUMN description text,ADD COLUMN created_at timestamptz DEFAULT now(),ADD COLUMN capability_pattern text;
 ALTER TABLE model_calls ADD COLUMN model_version text,ADD COLUMN legal_entity_id uuid;`);
 await sql.exec(await readFile(new URL('../../packages/db/integration-migrations/00101_goal_read_reviews.sql',import.meta.url),'utf8'));
 const migration=await readFile(new URL('../../packages/db/migrations/00004_outbox_and_side_effect.sql',import.meta.url),'utf8');
 await sql.exec(migration.slice(migration.indexOf('CREATE OR REPLACE FUNCTION acquire_lease')));
 const queries:string[]=[],wire:any[]=[];
 let beforeQuery:((text:string,args:any[])=>Promise<void>)|undefined;
 let transactionTail=Promise.resolve();
 const rawQuery=async(text:string,args:any[]=[])=>{const r=await sql.query(text,args);return {...r,rowCount:Math.max(r.affectedRows??0,r.rows.length)};};
 const query=async(text:string,args:any[]=[])=>{queries.push(text);await beforeQuery?.(text,args);return rawQuery(text,args);};
 const originalConnect=pool.connect,originalQuery=pool.query;
 (pool as any).connect=async()=>{
  let releaseTransaction:(()=>void)|undefined;
  return {query:async(text:string,args:any[]=[])=>{
   if(text==='BEGIN'){
    const previous=transactionTail;transactionTail=new Promise<void>(resolve=>{releaseTransaction=resolve;});await previous;
   }
   try{return await query(text,args);}finally{if(text==='COMMIT'||text==='ROLLBACK'){releaseTransaction?.();releaseTransaction=undefined;}}
  },release(){releaseTransaction?.();}};
 };
 (pool as any).query=query;
 const data=privateData?.data;
 const entity=privateData?data.goal.company_scope:ENTITY,oldGoal=privateData?data.goal.id:ORIGINAL_GOAL,oldPlan=privateData?privateData.plan.id:ORIGINAL_PLAN;
 const sourceReport=privateData?privateData.source.result.report:(syntheticOptions.sourceReport??report());
 const params={startDate:'2026-10-26',endDate:'2026-10-26'};
 const now=new Date(Date.now()-3600000).toISOString();
 const plan=privateData?privateData.plan:{id:oldPlan,goal_id:oldGoal,version:1,goal_assumptions:{source:'synthetic-preexisting-source'},constraints:{},dependencies:{},steps:[
  {index:0,step_key:'source',depends_on:[],result_refs:{},capability_id:SOURCE,params,priority:0,due_at:null,idempotency_key:null,operation_key_ref:null},
  {index:1,step_key:'analysis',depends_on:['source'],result_refs:{},capability_id:ANALYST,params:{agent_role:'data_analyst',instructions:'SAM_VERIFIED_DATA_ANALYSIS_V1'},priority:0,due_at:null,idempotency_key:null,operation_key_ref:null}],plan_hash:'',created_at:now};
 if(!privateData)plan.plan_hash=originalPlanHash(plan);
 const source=privateData?privateData.source:{id:SOURCE_EXECUTION,queue_id:SOURCE_WORK,goal_id:oldGoal,plan_id:oldPlan,capability_id:SOURCE,params,
  result:{report:sourceReport,coverageComplete:true,startDate:params.startDate,endDate:params.endDate,timeZone:'Europe/Amsterdam'},evidence:{reportHash:sha256Hex(sourceReport),sourceReadback:'synthetic-verified'},
  plan_hash:plan.plan_hash,execution_hash:'',fencing_token:1,operation_key_ref:null,actor:'synthetic-source-collector',status:'EXECUTED',started_at:now,finished_at:now};
 if(!privateData)source.execution_hash=originalExecutionHash(source);
 const proof=privateData?privateData.proof:{id:SOURCE_VERIFICATION,execution_id:source.id,verifier:'synthetic-source-reader',method:'api_readback',contract_id:SOURCE_CONTRACT,
  execution_hash:source.execution_hash,plan_hash:source.plan_hash,independent_evidence:{reportHash:sha256Hex(sourceReport),matches:true},result:'VERIFIED',checked_at:now,operation_key_ref:null};
 const sourceWork=privateData?privateData.sourceWork:{id:SOURCE_WORK,goal_id:oldGoal,plan_id:oldPlan,capability_id:SOURCE,step_key:'source',status:'EXECUTED',params,fencing_token:1,created_at:now,queued_at:now};
 const oldAnalysis=privateData?privateData.oldAnalysis:{id:ORIGINAL_ANALYSIS,goal_id:oldGoal,plan_id:oldPlan,capability_id:ANALYST,step_key:'analysis',status:'FAILED',params:{agent_role:'data_analyst',instructions:'SAM_VERIFIED_DATA_ANALYSIS_V1'},
  handoff:{hermes:{taskHash:sha256Hex('original-failed-task'),runId:'run_original_failed',status:'completed',output:'original rejected output'}},created_at:now,queued_at:now};
 const reservation=privateData?privateData.reservation:{id:RESERVATION,task:'hermes:'+oldAnalysis.id,provider:'deepseek',model:'deepseek-flash',cost:0.15,retry_count:0,success:false,verification_result:'RESERVED_USAGE_UNKNOWN',data_classification:'INTERNAL',created_at:now};
 const binding={sourceExecutionId:source.id,sourceGoalId:oldGoal,sourcePlanId:oldPlan,sourceVerificationId:proof.id,sourceHash:sha256Hex(sourceReport),sourceExecutionHash:source.execution_hash,sourcePlanHash:source.plan_hash,
  legalEntityId:entity,startDate:source.result.startDate,endDate:source.result.endDate,timeZone:'Europe/Amsterdam'};
 if(privateData)assert.deepEqual(binding,privateData.expectedBinding,'Private binding must match the approved exact binding');
 const jsonColumns=new Set(['goal_assumptions','constraints','dependencies','steps','params','result','evidence','independent_evidence','handoff','planning_failure','required_evidence_fields','independent_query_template']);
 const seed=async(table:string,row:Record<string,any>)=>{
  const columns=(await sql.query('SELECT column_name FROM information_schema.columns WHERE table_name=$1',[table])).rows.map((r:any)=>r.column_name);
  const keys=Object.keys(row).filter(k=>columns.includes(k));
  assert.equal(keys.length,Object.keys(row).length,'The local common-column projection must not silently drop '+table+' fields');
  await query('INSERT INTO '+table+' ('+keys.join(',')+') VALUES('+keys.map((_,i)=>'$'+(i+1)).join(',')+')',keys.map(k=>jsonColumns.has(k)&&!(k==='result'&&table!=='executions')&&row[k]!==null?JSON.stringify(row[k]):row[k]));
 };
 await query('INSERT INTO legal_entities VALUES($1),($2)',[entity,OTHER]);
 await seed('goals',privateData?data.goal:{id:oldGoal,business_id:'SYNTHETIC-ORIGINAL',company_scope:entity,domain:'hermes_data_analysis',objective:'Original failed analysis',state:'FAILED',authority_ceiling:'GREEN',completion_definition:'original-fixed-acceptance',current_plan_id:oldPlan,created_at:now,updated_at:now});
 await seed('plans',plan);await seed('work_queue',sourceWork);await seed('work_queue',oldAnalysis);await seed('executions',source);
 const contracts=privateData?privateData.contracts:[{id:SOURCE_CONTRACT,capability_id:SOURCE,verification_method:'api_readback',required_evidence_fields:{reportHash:'string'},independent_query_template:{},must_not_trust_execution_result:true},
  {id:ANALYST_CONTRACT,capability_id:ANALYST,verification_method:'external_event',required_evidence_fields:{candidateHash:'string',independentCheck:'string'},independent_query_template:{},must_not_trust_execution_result:true}];
 for(const contract of contracts)await seed('verification_contracts',contract);
 await seed('verifications',proof);await seed('model_calls',reservation);
 const original=async()=>({goal:(await query('SELECT * FROM goals WHERE id=$1',[oldGoal])).rows,plan:(await query('SELECT * FROM plans WHERE id=$1',[oldPlan])).rows,
  work:(await query('SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY id',[oldGoal])).rows,executions:(await query('SELECT * FROM executions WHERE goal_id=$1',[oldGoal])).rows,
  verifications:(await query('SELECT * FROM verifications WHERE execution_id=$1',[binding.sourceExecutionId])).rows,reservation:(await query('SELECT * FROM model_calls WHERE id=$1',[reservation.id])).rows});
 const originalHash=sha256Hex(await original());
 const addSecondSource=async()=>{
  const secondGoal=randomUUID(),secondPlan=randomUUID(),secondQueue=randomUUID(),secondExecution=randomUUID(),secondVerification=randomUUID();
  const g={...(await query('SELECT * FROM goals WHERE id=$1',[oldGoal])).rows[0],id:secondGoal,business_id:'SYNTHETIC-SECOND-ORIGINAL',current_plan_id:secondPlan};
  const p=structuredClone({...plan,id:secondPlan,goal_id:secondGoal});p.plan_hash=originalPlanHash(p);
  const w={...sourceWork,id:secondQueue,goal_id:secondGoal,plan_id:secondPlan};
  const e=structuredClone({...source,id:secondExecution,queue_id:secondQueue,goal_id:secondGoal,plan_id:secondPlan,plan_hash:p.plan_hash});e.execution_hash=originalExecutionHash(e);
  const v={...proof,id:secondVerification,execution_id:secondExecution,execution_hash:e.execution_hash,plan_hash:p.plan_hash};
  await seed('goals',g);await seed('plans',p);await seed('work_queue',w);await seed('executions',e);await seed('verifications',v);
  return {...binding,sourceExecutionId:secondExecution,sourceGoalId:secondGoal,sourcePlanId:secondPlan,sourceVerificationId:secondVerification,sourceExecutionHash:e.execution_hash,sourcePlanHash:p.plan_hash};
 };
 const policy={legalEntityId:entity,activatedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+20*60000).toISOString()};
 let sourceCalls=0;
 const client=new HermesClient({baseUrl:'https://synthetic-hermes.invalid',apiKey:'synthetic-key-with-no-real-authority',runtimePolicy:DEEPSEEK_RUNTIME,requireNativeModelLock:true,assertServerPolicy:async()=>{},pollMs:1,transport:async(url:any,init:any)=>{
  const path=new URL(url).pathname,body=init?.body?JSON.parse(init.body):undefined;wire.push({path,body});
  if(path==='/v1/capabilities')return Response.json({auth:{required:true,type:'bearer'},features:{run_submission:true,run_status:true,run_stop:true,runs_idempotency:{durable:true,retention_seconds:86400}}});
  if(path==='/v1/toolsets')return Response.json({data:[]});
  if(path==='/api/sessions')return Response.json({}, {status:201});
  if(path.endsWith('/model'))return Response.json({session_id:path.split('/')[3],runtime:{model:DEEPSEEK_RUNTIME.model,provider:'deepseek',model_lock:'accepted'}});
  if(path==='/v1/runs')return Response.json({run_id:'run_synthetic_followup',status:'running'});
  if(path==='/v1/runs/run_synthetic_followup')return Response.json({run_id:'run_synthetic_followup',status:'completed',output:candidate,runtime:{model:DEEPSEEK_RUNTIME.model,provider:'deepseek',model_lock:'confirmed'}});
  throw Error('Unexpected synthetic route '+path);
 }});
 const makeBundle=(activePolicy:NonNullable<ProductionBundle['hermesDataAnalysis']>=policy)=>validateProductionBundle(withHermesDataAnalysis({capabilities:[{capabilityId:SOURCE,authorityClass:'GREEN',specialistAgentId:'marketplace',specialistVersion:'1'}],toolDefinitions:[{capabilityId:SOURCE,authorityClass:'GREEN',sideEffect:false}],toolAdapters:[{capabilityId:SOURCE,async execute(){sourceCalls++;throw Error('Source collection forbidden');}}]},
  {client,policy:activePolicy,db:{query},runtimePolicy:DEEPSEEK_RUNTIME}));
 const bundle=makeBundle(),dispatcher=createKernelProductionDispatcher(bundle),surface=createChatGPTToolSurface({dispatcher});
 const objective=privateData?privateData.preparedRequest.arguments.objective:(syntheticOptions.objective??'Interpret the already verified source');
 const submit=async(overrides:any={},targetSurface=surface)=>{
  const response=await targetSurface.invoke('sam_submit_analysis_followup',{objective,legal_entity_id:entity,source_binding:binding,...overrides},owner);
  assert.equal(response.ok,true,JSON.stringify(response));return response.data as any;
 };
 const prepare=async(admission:any)=>{
  const queueId=admission.queueIds[0],lease=await leaseWorkAtomic(queueId,'synthetic-followup-worker',300);
  const request={capabilityId:ANALYST,idempotencyKey:queueId,params:lease.work.params,executionContext:{queueId,fencingToken:lease.token}};
  return request;
 };
 const execute=async(admission:any)=>{
  const request=await prepare(admission),{queueId,fencingToken}=request.executionContext;
  const outcome=await bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute(request);
  return {request,outcome,record:()=>recordExecutionAndRequestVerificationAtomic({queueId,fencingToken,actor:'synthetic-followup-worker',...outcome})};
 };
 return {sql,query,rawQuery,queries,wire,binding,entity,oldGoal,oldPlan,originalHash,original,sourceReport,objective,addSecondSource,policy,bundle,surface,submit,prepare,execute,makeBundle,
  get sourceCalls(){return sourceCalls;},setBeforeQuery(value:typeof beforeQuery){beforeQuery=value;},async close(){pool.connect=originalConnect;pool.query=originalQuery;await sql.close();}};
}
