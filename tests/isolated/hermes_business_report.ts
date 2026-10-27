/** Local acceptance: real SAM handlers + local SQL engine; bol/Hermes HTTP are synthetic. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID} from 'node:crypto';
const {PGlite}=require(process.env.SAM_TEST_PGLITE_MODULE??'@electric-sql/pglite');
import {pool} from '../../packages/db/src/client';
import {createKernelProductionDispatcher} from '../../apps/production/src/dispatcher';
import {createChatGPTToolSurface} from '../../apps/chatgpt-tools/src/surface';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {dataAnalysisAcceptance,ANALYST,SOURCE,ANALYSIS_MARKER,assertAnalysisWindow,ANALYSIS_SUBMIT_TOOL,ANALYSIS_SUBMISSION,prepareDataAnalysisCall,assertDataAnalysisSubmission} from '../../apps/production/src/dataAnalysisContract';
import {withHermesDataAnalysis,withHermesDataAnalysisFromEnv,aggregateForHermes,validateInterpretation} from '../../apps/production/src/hermesDataAnalysis';
import {buildBolAnalysis} from '../../apps/production/src/bolAnalysis';
import {checkGoalAcceptance,ACCEPTANCE_PREFIX} from '../../apps/kernel/src/goalAcceptance';
import {HermesClient,FREE_MODEL,FREE_RUNTIME,DEEPSEEK_RUNTIME,type HermesRuntimePolicy} from '../../packages/hermes/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const ENTITY='00000000-0000-4000-8000-000000000001',OTHER='00000000-0000-4000-8000-000000000002';
const request={sourceCapabilityId:SOURCE,startDate:'2026-10-26',endDate:'2026-10-26'} as const;
const policy=()=>({legalEntityId:ENTITY,activatedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+600000).toISOString()});
const context={actor:'authenticated-synthetic-owner',systemOwner:true};
const base=()=>({capabilities:[{capabilityId:SOURCE,authorityClass:'GREEN' as const,specialistAgentId:'marketplace',specialistVersion:'1.0.0'}],
 toolDefinitions:[{capabilityId:SOURCE,authorityClass:'GREEN' as const,sideEffect:false}],
 toolAdapters:[{capabilityId:SOURCE,async execute(){throw Error('use the existing collector in the fixture');}}]});
async function fixture(onQuery?:(text:string)=>void){
 const sql=new PGlite();
 await sql.exec(`CREATE SEQUENCE ids;
 CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE sql AS $$SELECT '00000000-0000-4000-8000-000000000099'::uuid$$;
 CREATE FUNCTION next_business_id(text,uuid) RETURNS text LANGUAGE sql AS $$SELECT 'SYNTHETIC-G'||nextval('ids')::text$$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY);
 CREATE TABLE model_providers(provider_id text,health text,capabilities jsonb,privacy_class_allowed jsonb);
 CREATE TABLE goals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id text,company_scope uuid,domain text,objective text,state text,authority_ceiling text,completion_definition text,current_plan_id uuid,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
 CREATE TABLE audit_log(actor text,goal_id uuid,action text,entity_type text,entity_id uuid,after_ref jsonb,source text,authority_class text,result text);
 CREATE TABLE plans(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid,version int,goal_assumptions jsonb,constraints jsonb,dependencies jsonb,steps jsonb,plan_hash text);
 CREATE TABLE work_queue(id uuid PRIMARY KEY,goal_id uuid,plan_id uuid,step_id uuid,capability_id text,params jsonb,priority int,due_at timestamptz,idempotency_key text,operation_key_ref text,step_key text,depends_on uuid[],result_refs jsonb,status text DEFAULT 'QUEUED',handoff jsonb,fencing_token int DEFAULT 1,lease_expiry timestamptz DEFAULT now()+interval '10 minutes',created_at timestamptz DEFAULT now());
 CREATE TABLE outbox_events(id uuid DEFAULT gen_random_uuid(),aggregate_type text,aggregate_id uuid,event_type text,payload jsonb);
 CREATE TABLE executions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),queue_id uuid,goal_id uuid,plan_id uuid,capability_id text,result jsonb,evidence jsonb,execution_hash text DEFAULT 'synthetic-execution-hash',plan_hash text DEFAULT 'synthetic-plan-hash',finished_at timestamptz DEFAULT now());
 CREATE TABLE verifications(execution_id uuid,execution_hash text,plan_hash text,result text);
 INSERT INTO legal_entities VALUES('${ENTITY}');
 INSERT INTO model_providers VALUES('synthetic','HEALTHY','["planning"]','["INTERNAL"]');`);
 const query=async(text:string,args:any[]=[])=>{onQuery?.(text);const r=await sql.query(text,args);return {...r,rowCount:Math.max(r.affectedRows??0,r.rows.length)};};
 const originalConnect=pool.connect,originalQuery=pool.query;
 (pool as any).connect=async()=>({query,release(){}});(pool as any).query=query;
 return {sql,query,async close(){pool.connect=originalConnect;pool.query=originalQuery;await sql.close();}};
}
async function collected(missing=false){
 const order={orderId:'synthetic-order',orderPlacedDateTime:'2026-10-26T11:00:00+01:00',shipmentDetails:{firstName:'PRIVATE CUSTOMER CANARY',email:'private@example.invalid'},orderItems:[
  {orderItemId:'synthetic-item',product:{ean:'1234567890123',title:'Public product'},fulfilment:{method:'FBB'},quantity:3,quantityCancelled:1,quantityShipped:2,...(missing?{}:{unitPrice:9.99})}]};
 return buildBolAnalysis(request,async(name,args)=>{
  if(name==='get_retailer_information')return {retailerId:'synthetic-qnan',companyName:'QNAN fixture'};
  if(name==='list_orders')return {orders:args.page===1&&args.latestChangeDate==='2026-10-26'?[order]:[]};
  if(name==='get_order')return order;
  if(name==='get_inventory')return {inventory:args.page===1?[{ean:'1234567890123',regularStock:5}]:[]};
  throw Error('unexpected read');
 },new Date('2026-10-27T10:00:00Z'));
}
function clientFixture(selected:HermesRuntimePolicy=FREE_RUNTIME){
 const bodies:any[]=[],answer=JSON.stringify({version:'sam.analysis_selection.v2',references:['totals.netOrdered']});
 const client=new HermesClient({baseUrl:'https://hermes.synthetic.invalid',apiKey:'synthetic-key-with-no-real-authority',requireNativeModelLock:true,runtimePolicy:selected,assertServerPolicy:async()=>{},pollMs:1,
 transport:async(url:any,init:any)=>{
  const path=new URL(url).pathname,body=init?.body?JSON.parse(init.body):undefined;bodies.push({path,body});
  if(path==='/v1/capabilities')return Response.json({auth:{required:true,type:'bearer'},features:{run_submission:true,run_status:true,run_stop:true,runs_idempotency:{durable:true,retention_seconds:86400}}});
  if(path==='/v1/toolsets')return Response.json({data:[]});
  if(path==='/api/sessions')return Response.json({}, {status:201});
  if(path.endsWith('/model'))return Response.json({session_id:path.split('/')[3],runtime:{model:selected.model,provider:selected.provider,model_lock:'accepted'}});
  if(path==='/v1/runs')return Response.json({run_id:'run_synthetic_business',status:'running'});
  if(path==='/v1/runs/run_synthetic_business')return Response.json({run_id:'run_synthetic_business',status:'completed',output:answer,runtime:{model:selected.model,provider:selected.provider}});
  throw Error('unexpected Hermes route');
 }});
 return {client,bodies,answer};
}

test('intake: an analyst contract without analysis_request cannot fall through to general planning',async()=>{
 const queries:string[]=[],f=await fixture(q=>queries.push(q));
 try{
  const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(validateProductionBundle(base()))});
  const response=await surface.invoke('sam_submit_goal',{objective:'Limited analysis',legal_entity_id:ENTITY,acceptance_contract:dataAnalysisAcceptance(ENTITY,request)},context)
   .catch(error=>({ok:false,error:String(error)}));
  const queryCount=queries.length;
  const goals=(await f.query('SELECT domain,completion_definition FROM goals')).rows;
  console.log(JSON.stringify({case:'missing-analysis-request',response,queryCount,goals}));
  assert.equal(response.ok,false,'The incomplete typed request must be refused, not submitted to the general planner');
  assert.equal(queryCount,0,'Rejection must happen before any database/model-provider access');
  assert.equal(goals.length,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM work_queue')).rows[0].n,0);
 }finally{await f.close();}
});

test('intake: actual MCP wire, handler, dispatcher and stored goal retain both fields and owner/company',async()=>{
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {startMcpHttpServer}=await import('../../apps/mcp/src/http');
 for(const name of [ANALYSIS_SUBMIT_TOOL,'sam_submit_goal']){
  const queries:string[]=[],f=await fixture(q=>queries.push(q)),hermes=clientFixture(),wire:any[]=[],handled:any[]=[],dispatched:any[]=[];
  const real=createKernelProductionDispatcher(validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query}})));
  const surface=createChatGPTToolSurface({dispatcher:{...real,async submitGoal(input){dispatched.push(structuredClone(input));return real.submitGoal!(input);}}});
  const invoke=surface.invoke.bind(surface);
  surface.invoke=async(tool,args,ctx)=>{handled.push({tool,args:structuredClone(args),context:ctx});return invoke(tool,args,ctx);};
  const server=await startMcpHttpServer({surface,actor:context.actor,port:0,host:'127.0.0.1',bearerToken:'synthetic-mcp-token',allowedHosts:['127.0.0.1']});
  const address=server.server.address() as any,client=new Client({name:'intake-test',version:'1'},{versionNegotiation:{mode:'auto'}});
  try{
   await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`),{
    requestInit:{headers:{Authorization:'Bearer synthetic-mcp-token'}},fetch:async(url,init)=>{
     if(typeof init?.body==='string'){const rpc=JSON.parse(init.body);if(rpc.method==='tools/call')wire.push(rpc.params);}
     return fetch(url,init);
    }}));
   const catalog=await client.listTools(),call=prepareDataAnalysisCall(catalog.tools,'Synthetic bounded report',ENTITY,request);
   const contract=structuredClone(call.arguments.acceptance_contract),args=structuredClone(call.arguments);
   const response=await client.callTool({...call,name});
   assert.equal(response.isError??false,false,JSON.stringify(response));
   const result=JSON.parse((response.content as any)[0].text).data;
   assert.equal(result.status,'QUEUED');assert.equal(result.planning,'TRUSTED_DATA_DEPENDENCY_PLAN');
   assert.equal(wire.length,1);assert.equal(wire[0].name,name);assert.deepEqual(wire[0].arguments,args);assert.deepEqual(handled[0].args,args);
   assert.deepEqual(dispatched[0],{objective:args.objective,legalEntityId:ENTITY,actor:context.actor,
    submissionKind:ANALYSIS_SUBMISSION,acceptanceContract:contract,analysisRequest:request});
   assert.deepEqual(call.arguments,args);assert.equal(handled[0].context.systemOwner,true);
   const goal=(await f.query('SELECT * FROM goals')).rows[0] as any;
   assert.equal(goal.domain,'hermes_data_analysis');assert.equal(goal.company_scope,ENTITY);
   assert.equal(goal.completion_definition,ACCEPTANCE_PREFIX+JSON.stringify(contract));
   assert.equal((await f.query('SELECT actor FROM audit_log')).rows[0].actor,context.actor);
   const rows=(await f.query('SELECT * FROM work_queue')).rows as any[];
   assert.equal(rows.length,2);assert.deepEqual(rows.find(r=>r.step_key==='source').params,{startDate:request.startDate,endDate:request.endDate});
   assert.equal(hermes.bodies.length,0,'Admission must not invoke Hermes or a planner');
   assert.equal(queries.some(q=>q.includes('model_providers')),false,'No general-planner provider lookup');
   console.log(JSON.stringify({kind:'INTAKE_FIELD_TRACE',tool:name,catalogProperties:Object.keys(catalog.tools.find(t=>t.name===name)!.inputSchema.properties??{}),
    contractHashes:{prepared:sha256Hex(contract),wire:sha256Hex(wire[0].arguments.acceptance_contract),handler:sha256Hex(handled[0].args.acceptance_contract),dispatcher:sha256Hex(dispatched[0].acceptanceContract),stored:sha256Hex(JSON.parse(goal.completion_definition.slice(ACCEPTANCE_PREFIX.length)))},
    requestHashes:{prepared:sha256Hex(request),wire:sha256Hex(wire[0].arguments.analysis_request),handler:sha256Hex(handled[0].args.analysis_request),dispatcher:sha256Hex(dispatched[0].analysisRequest)},
    domain:goal.domain,company:goal.company_scope,actor:context.actor,constraints:contract.constraints.length,modelCalls:hermes.bodies.length}));
  }finally{await client.close();await server.close();await f.close();}
 }
});

test('intake: missing either required field or both fails over MCP and direct handler before any DB or model access',async()=>{
 const queries:string[]=[],f=await fixture(q=>queries.push(q)),hermes=clientFixture();
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {startMcpHttpServer}=await import('../../apps/mcp/src/http');
 const dispatcher=createKernelProductionDispatcher(validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query}})));
 const surface=createChatGPTToolSurface({dispatcher}),args:any={objective:'Limited analysis',legal_entity_id:ENTITY,
  acceptance_contract:dataAnalysisAcceptance(ENTITY,request),analysis_request:request};
 const server=await startMcpHttpServer({surface,actor:context.actor,port:0,host:'127.0.0.1',bearerToken:'synthetic-mcp-token',allowedHosts:['127.0.0.1']});
 const client=new Client({name:'intake-missing-test',version:'1'},{versionNegotiation:{mode:'auto'}}),address=server.server.address() as any;
 let strip:string[]=[];const wire:any[]=[];
 try{
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`),{
   requestInit:{headers:{Authorization:'Bearer synthetic-mcp-token'}},fetch:async(url,init)=>{
    if(typeof init?.body==='string'){
     const rpc=JSON.parse(init.body);
     if(rpc.method==='tools/call'){
      // Model argument loss on the WIRE after client validation, not a mock
      // handler denial. The historical ChatGPT ingress body was not captured.
      for(const key of strip)delete rpc.params.arguments[key];wire.push(structuredClone(rpc.params.arguments));
      return fetch(url,{...init,body:JSON.stringify(rpc)});
     }
    }
    return fetch(url,init);
   }}));
  for(const missing of [['acceptance_contract'],['analysis_request'],['acceptance_contract','analysis_request'],['legal_entity_id'],['objective']]){
   strip=missing;
   const incomplete=structuredClone(args);for(const key of missing)delete incomplete[key];
   const response=await client.callTool({name:ANALYSIS_SUBMIT_TOOL,arguments:args}).catch(error=>({isError:true,content:[{type:'text',text:String(error)}]}));
   assert.deepEqual(wire.at(-1),incomplete,'The recorded actual MCP body must contain the field loss');
   assert.equal(response.isError,true,missing.join(','));
   assert.match(JSON.stringify(response),/validation|invalid|required/i,'The failure must be input rejection, not a transport/auth failure');
   const local=await surface.invoke(ANALYSIS_SUBMIT_TOOL,incomplete,context).catch(error=>({ok:false,error:String(error)}));
   assert.equal(local.ok,false,missing.join(','));assert.equal(queries.length,0);
   console.log(JSON.stringify({kind:'INTAKE_REJECTION',missing,wireProperties:Object.keys(wire.at(-1)),stage:'ACTUAL_MCP_WIRE_AND_DIRECT_HANDLER',dbQueries:0,modelCalls:0}));
  }
  for(const field of ['acceptanceContract','analysisRequest','both']){
   const input:any={objective:'Limited analysis',actor:context.actor,legalEntityId:ENTITY,submissionKind:ANALYSIS_SUBMISSION,
    acceptanceContract:args.acceptance_contract,analysisRequest:request};
   if(field==='both'){delete input.acceptanceContract;delete input.analysisRequest;}else delete input[field];
   await assert.rejects(dispatcher.submitGoal!(input),/ANALYSIS_REQUIRED_FIELDS_MISSING/);assert.equal(queries.length,0);
  }
  // The compatible old entry also refuses a partial typed request.
  await assert.rejects(surface.invoke('sam_submit_goal',{...args,acceptance_contract:undefined},context),/REQUIRED_FIELDS/);
  assert.equal(queries.length,0);assert.equal(hermes.bodies.length,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM work_queue')).rows[0].n,0);
 }finally{await client.close();await server.close();await f.close();}
});

test('intake: stale connector catalog refuses bounded preparation without generic fallback',()=>{
 const capturedLegacyCatalog=[{name:'sam_submit_goal',inputSchema:{properties:{objective:{type:'string'},legal_entity_id:{type:'string'}},required:['objective']}}];
 assert.throws(()=>prepareDataAnalysisCall(capturedLegacyCatalog,'Limited analysis',ENTITY,request),/CONNECTOR_SCHEMA_STALE/);
 const partialNewCatalog=[{...capturedLegacyCatalog[0],name:ANALYSIS_SUBMIT_TOOL}];
 assert.throws(()=>prepareDataAnalysisCall(partialNewCatalog,'Limited analysis',ENTITY,request),/CONNECTOR_SCHEMA_STALE/);
 assert.equal(assertDataAnalysisSubmission({}),false,'Ordinary SAM objectives retain their existing route');
 assert.equal(assertDataAnalysisSubmission({acceptanceContract:{version:1,constraints:[{
  capabilityId:ANALYST,params:{agent_role:'programmer',instructions:'unrelated existing task'},result:{field:'status',equals:'IMPLEMENTED'}}]}}),false,
  'Other Hermes roles are not reclassified as bounded data analysis');
});

test('intake: owner denial, company denial and original contract mismatch remain fail closed',async()=>{
 const queries:string[]=[],f=await fixture(q=>queries.push(q)),hermes=clientFixture();
 try{
  const dispatcher=createKernelProductionDispatcher(validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query}}))),surface=createChatGPTToolSurface({dispatcher});
  const args={objective:'Limited analysis',legal_entity_id:ENTITY,acceptance_contract:dataAnalysisAcceptance(ENTITY,request),analysis_request:request};
  assert.equal((await surface.invoke(ANALYSIS_SUBMIT_TOOL,args,{...context,systemOwner:false})).ok,false);
  await assert.rejects(surface.invoke(ANALYSIS_SUBMIT_TOOL,{...args,legal_entity_id:OTHER},context),/SCOPE/);
  const changed=structuredClone(args);changed.acceptance_contract.constraints[0].result.equals='2026-10-25';
  await assert.rejects(surface.invoke(ANALYSIS_SUBMIT_TOOL,changed,context),/ACCEPTANCE_MISMATCH/);
  assert.equal(queries.length,0);assert.equal(hermes.bodies.length,0);
 }finally{await f.close();}
});

test('MCP schema and actual HTTP handler pass and persist the original nonempty acceptance with actor and company',async()=>{
 const f=await fixture();
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {startMcpHttpServer}=await import('../../apps/mcp/src/http');
 const bundle=validateProductionBundle(base()),surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(bundle)});
 const contract={version:1 as const,constraints:[dataAnalysisAcceptance(ENTITY,request).constraints[0]]};
 const server=await startMcpHttpServer({surface,actor:context.actor,port:0,host:'127.0.0.1',bearerToken:'synthetic-mcp-token',allowedHosts:['127.0.0.1']});
 const address=server.server.address() as any,client=new Client({name:'bounded-test',version:'1'},{versionNegotiation:{mode:'auto'}});
 try{
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`),{requestInit:{headers:{Authorization:'Bearer synthetic-mcp-token'}}}));
  const tools=await client.listTools();assert.ok((tools.tools.find(t=>t.name==='sam_submit_goal')!.inputSchema.properties as any).acceptance_contract);
  const response=await client.callTool({name:'sam_submit_goal',arguments:{objective:'Fixed-period source-grounded report',legal_entity_id:ENTITY,acceptance_contract:contract}});
  assert.equal(response.isError??false,false,JSON.stringify(response));
  const row=(await f.query('SELECT * FROM goals')).rows[0] as any;
  assert.equal(row.company_scope,ENTITY);assert.equal(row.completion_definition,ACCEPTANCE_PREFIX+JSON.stringify(contract));
  assert.equal((await f.query('SELECT actor FROM audit_log')).rows[0].actor,context.actor);
 }finally{await client.close();await server.close();await f.close();}
});

test('invalid contracts and unauthorized owner context are rejected before any goal is persisted',async()=>{
 const f=await fixture();try{
  const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(validateProductionBundle(base()))});
  for(const contract of [{},{version:1,constraints:[]},{version:1,constraints:[{capabilityId:SOURCE,params:{},result:{field:'constructor',equals:true}}]}])
   await assert.rejects(surface.invoke('sam_submit_goal',{objective:'report',legal_entity_id:ENTITY,acceptance_contract:contract},context),/GOAL_CONTRACT_INVALID/);
  assert.equal((await surface.invoke('sam_submit_goal',{objective:'report',legal_entity_id:ENTITY},{...context,systemOwner:false})).ok,false);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,0);
 }finally{await f.close();}
});

test('bounded source→Hermes plan is atomic, preserves the supplied substantive contract, has a task ceiling and denies a different company',async()=>{
 const f=await fixture();try{
  const hermes=clientFixture(),bundle=validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query}}));
  const dispatcher=createKernelProductionDispatcher(bundle);
  await assert.rejects(dispatcher.submitGoal!({objective:'report',legalEntityId:OTHER,actor:context.actor,analysisRequest:request,acceptanceContract:dataAnalysisAcceptance(OTHER,request)}),/SCOPE/);
  const submitted:any=await dispatcher.submitGoal!({objective:'report',legalEntityId:ENTITY,actor:context.actor,analysisRequest:request,acceptanceContract:dataAnalysisAcceptance(ENTITY,request)});
  assert.equal(submitted.status,'QUEUED');assert.equal(submitted.acceptanceContract.constraints.length,9);
  const goal=(await f.query('SELECT * FROM goals')).rows[0] as any;assert.equal(goal.state,'EXECUTING');
  const rows=(await f.query('SELECT * FROM work_queue ORDER BY step_key')).rows as any[];
  assert.deepEqual(rows.find(x=>x.step_key==='analysis').depends_on,[rows.find(x=>x.step_key==='source').id]);
  await assert.rejects(dispatcher.submitGoal!({objective:'again',legalEntityId:ENTITY,actor:context.actor,analysisRequest:request,acceptanceContract:dataAnalysisAcceptance(ENTITY,request)}),/TASK_CEILING/);
  assert.equal(hermes.bodies.length,0); // Admission invokes neither planner nor Hermes.
 }finally{await f.close();}
});

test('existing bol collector retains full pagination, exact decimal arithmetic, privacy and unknown-value limits',async()=>{
 const output=await collected();
 assert.deepEqual(output.result.report.totals,{ordered:3,cancelled:1,shipped:2,netOrdered:2});
 assert.equal(output.result.report.values.orderedPriceCents,2997);assert.equal(output.result.report.values.afterCancellationPriceCents,1998);
 assert.equal(output.result.coverageComplete,true);assert.equal(output.result.startDate,'2026-10-26');
 assert.ok(!JSON.stringify(output).includes('PRIVATE CUSTOMER'));assert.ok(!JSON.stringify(output).includes('private@example'));
 for(const key of ['commissions','returns','taxBasis','currency','netProfit'])assert.equal((output.result.report.values as any)[key],null);
 const missing=await collected(true);assert.equal(missing.result.report.values.orderedPriceCents,null);assert.equal(missing.result.report.values.unpricedOrderedUnits,3);
});

test('SAM verified source→existing Hermes client→same-task saved report; forged receipts or source are rejected',async()=>{
 const f=await fixture();try{
  const hermes=clientFixture(),bundle=validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query}}));
  const submitted:any=await createKernelProductionDispatcher(bundle).submitGoal!({objective:'report',legalEntityId:ENTITY,actor:context.actor,analysisRequest:request,acceptanceContract:dataAnalysisAcceptance(ENTITY,request)});
  const rows=(await f.query('SELECT * FROM work_queue')).rows as any[],sourceWork=rows.find(r=>r.step_key==='source'),analysisWork=rows.find(r=>r.step_key==='analysis');
  const source=await collected();
  const inserted=(await f.query('INSERT INTO executions(queue_id,goal_id,plan_id,capability_id,result,evidence) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
   [sourceWork.id,submitted.goalId,submitted.planId,SOURCE,JSON.stringify(source.result),JSON.stringify(source.evidence)])).rows[0];
  await f.query("UPDATE work_queue SET status=CASE WHEN step_key='source' THEN 'EXECUTED' ELSE 'LEASED' END");
  // No independent source receipt means no model submission.
  const adapter=bundle.tools.adapter(ANALYST),task={capabilityId:ANALYST,params:{agent_role:'data_analyst',instructions:ANALYSIS_MARKER},idempotencyKey:'synthetic',executionContext:{queueId:analysisWork.id,fencingToken:1}};
  await assert.rejects(adapter.execute(task),/VERIFIED_SOURCE_REQUIRED/);assert.equal(hermes.bodies.length,0);
  await f.query("INSERT INTO verifications VALUES($1,'synthetic-execution-hash','synthetic-plan-hash','VERIFIED')",[inserted.id]);
  const outcome=await adapter.execute(task);
  assert.equal(outcome.result.goal_id,submitted.goalId);assert.equal((outcome.result.report as any).hermesRunId,'run_synthetic_business');
  const prompt=JSON.stringify(hermes.bodies);assert.ok(!prompt.includes('PRIVATE CUSTOMER'));assert.ok(!prompt.includes('private@example'));assert.ok(!prompt.includes('synthetic-order'));
  const ai=(await f.query('INSERT INTO executions(queue_id,goal_id,plan_id,capability_id,result,evidence) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
   [analysisWork.id,submitted.goalId,submitted.planId,ANALYST,JSON.stringify(outcome.result),JSON.stringify(outcome.evidence)])).rows[0];
  const verifier=bundle.verifiers.get(ANALYST)!,input:any={execution:{id:ai.id,capabilityId:ANALYST,params:task.params,...outcome,operationKeyRef:null},contract:{}};
  assert.equal((await verifier.verify(input)).result,'VERIFIED');
  const definition=(await f.query('SELECT completion_definition FROM goals WHERE id=$1',[submitted.goalId])).rows[0].completion_definition as string;
  assert.equal(checkGoalAcceptance(definition,[{capability_id:SOURCE,params:request,result:source.result},{capability_id:ANALYST,params:task.params,result:outcome.result}]).passed,true);
  assert.equal((await f.query('SELECT result FROM executions WHERE id=$1',[ai.id])).rows[0].result.report.sourceExecutionId,inserted.id);
  const forged=structuredClone(input);forged.execution.evidence.run_id='run_forged';assert.equal((await verifier.verify(forged)).result,'FAILED');
  const wrong=structuredClone(input);wrong.execution.result.report.sourceHash='0'.repeat(64);assert.equal((await verifier.verify(wrong)).result,'FAILED');
  await f.query("UPDATE work_queue SET handoff=jsonb_set(handoff,'{hermes,taskHash}',to_jsonb($2::text)) WHERE id=$1",[analysisWork.id,'0'.repeat(64)]);
  assert.equal((await verifier.verify(input)).result,'FAILED');
  await f.query("UPDATE work_queue SET handoff=jsonb_set(handoff,'{hermes,status}','\"unknown\"') WHERE id=$1",[analysisWork.id]);
  assert.equal((await verifier.verify(input)).result,'FAILED');
 }finally{await f.close();}
});

test('deepseek analysis: original source acceptance and selected receipt binding persist, reservation survives replay',async()=>{
 const f=await fixture();try{
  await f.query(`CREATE TABLE model_calls(task text,provider text,model text,reason_selected text,tokens int,cost numeric,latency_ms int,retry_count int,success boolean,verification_result text,data_classification text)`);
  const hermes=clientFixture(DEEPSEEK_RUNTIME),bundle=validateProductionBundle(withHermesDataAnalysis(base(),{client:hermes.client,policy:policy(),db:{query:f.query},runtimePolicy:DEEPSEEK_RUNTIME}));
  const submitted:any=await createKernelProductionDispatcher(bundle).submitGoal!({objective:'report',legalEntityId:ENTITY,actor:context.actor,analysisRequest:request,acceptanceContract:dataAnalysisAcceptance(ENTITY,request)});
  const rows=(await f.query('SELECT * FROM work_queue')).rows as any[],sw=rows.find(r=>r.step_key==='source'),aw=rows.find(r=>r.step_key==='analysis'),source=await collected();
  const se=(await f.query('INSERT INTO executions(queue_id,goal_id,plan_id,capability_id,result,evidence) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
   [sw.id,submitted.goalId,submitted.planId,SOURCE,JSON.stringify(source.result),JSON.stringify(source.evidence)])).rows[0];
  await f.query("UPDATE work_queue SET status=CASE WHEN step_key='source' THEN 'EXECUTED' ELSE 'LEASED' END");
  await f.query("INSERT INTO verifications VALUES($1,'synthetic-execution-hash','synthetic-plan-hash','VERIFIED')",[se.id]);
  const task={capabilityId:ANALYST,params:{agent_role:'data_analyst',instructions:ANALYSIS_MARKER},idempotencyKey:'synthetic',executionContext:{queueId:aw.id,fencingToken:1}},adapter=bundle.tools.adapter(ANALYST);
  const outcome=await adapter.execute(task),again=await adapter.execute(task);
  assert.deepEqual(again,outcome);assert.equal(hermes.bodies.filter(b=>b.path==='/v1/runs').length,1);
  const reserved=(await f.query('SELECT * FROM model_calls')).rows;assert.equal(reserved.length,1);assert.equal(Number(reserved[0].cost),.15);assert.equal(reserved[0].provider,'deepseek');
  const ai=(await f.query('INSERT INTO executions(queue_id,goal_id,plan_id,capability_id,result,evidence) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
   [aw.id,submitted.goalId,submitted.planId,ANALYST,JSON.stringify(outcome.result),JSON.stringify(outcome.evidence)])).rows[0];
  const verify=bundle.verifiers.get(ANALYST)!,input:any={execution:{id:ai.id,capabilityId:ANALYST,params:task.params,...outcome,operationKeyRef:null},contract:{}};
  assert.equal((await verify.verify(input)).result,'VERIFIED');
  const saved=(await f.query('SELECT result FROM executions WHERE id=$1',[ai.id])).rows[0].result;
  assert.equal(saved.report.sourceExecutionId,se.id);assert.equal(saved.report.hermesRunId,'run_synthetic_business');
  await f.query("UPDATE work_queue SET handoff=jsonb_set(handoff,'{hermes,runtime,provider}','\"nous\"') WHERE id=$1",[aw.id]);
  assert.equal((await verify.verify(input)).result,'FAILED');
 }finally{await f.close();}
});

test('unsupported numeric narrative, invented metric references, malformed output and expired admission are denied',async()=>{
 const aggregate=aggregateForHermes((await collected()).result.report);
 assert.throws(()=>validateInterpretation(JSON.stringify({summary:'profit 999',observations:[{reference:'totals.netOrdered',comment:'ok'}]}),aggregate));
 assert.throws(()=>validateInterpretation(JSON.stringify({summary:'تحليل',observations:[{reference:'invented.profit',comment:'غير مسند'}]}),aggregate));
 assert.throws(()=>validateInterpretation('{}',aggregate));
 assert.throws(()=>assertAnalysisWindow({...policy(),expiresAt:new Date(Date.now()-1).toISOString()},ENTITY),/WINDOW/);
});

test('an expired or disabled analysis feature preserves the ordinary SAM bundle without reading credentials',async()=>{
 const b=base();assert.equal(await withHermesDataAnalysisFromEnv(b,{}),b);
 assert.equal(await withHermesDataAnalysisFromEnv(b,{SAM_HERMES_DATA_ANALYSIS_ENABLED:'1',SAM_HERMES_DATA_ANALYSIS_ENTITY_ID:ENTITY,
  SAM_HERMES_DATA_ANALYSIS_ACTIVATED_AT:new Date(Date.now()-10000).toISOString(),SAM_HERMES_DATA_ANALYSIS_EXPIRES_AT:new Date(Date.now()-1).toISOString()}),b);
});

test('MCP dispatch-only registration exposes the same bounded request without requiring a Hermes credential file',async()=>{
 const p=policy(),b=await withHermesDataAnalysisFromEnv(base(),{SAM_HERMES_DATA_ANALYSIS_ENABLED:'1',SAM_HERMES_DATA_ANALYSIS_MODE:'dispatch-only',
  SAM_HERMES_DATA_ANALYSIS_ENTITY_ID:p.legalEntityId,SAM_HERMES_DATA_ANALYSIS_ACTIVATED_AT:p.activatedAt,SAM_HERMES_DATA_ANALYSIS_EXPIRES_AT:p.expiresAt});
 assert.ok(b.capabilities.some(c=>c.capabilityId===ANALYST));assert.deepEqual(b.hermesDataAnalysis,p);
});
