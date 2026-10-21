import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {withCompanyAccountingReads} from '../../apps/production/src/companyBusinessBundle';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {safePerceptionTick,runPerceptionTick} from '../../apps/perception/src/monitor';
import {lab} from './lab';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';

test('accounting uses existing real client against local HTTP API; company scope, identical fresh reads and changed-source rejection',async()=>{
 let reads=0,amount=20,mutationWrites=0,sessions=0;
 const server=createServer(async(req,res)=>{
  res.setHeader('content-type','application/json');
  if(req.url==='/v1/session'&&req.method==='POST'){
   sessions++;const chunks=[];for await(const part of req)chunks.push(part);
   const body=JSON.parse(Buffer.concat(chunks).toString());assert.equal(body.accessToken,'isolated-fixture-token');
   res.end(JSON.stringify({token:'fixture-session',expiresIn:3600}));return;
  }
  if(req.method!=='GET'){mutationWrites++;res.writeHead(405).end('{}');return}
  assert.equal(req.headers.authorization,'fixture-session');reads++;
  res.end(JSON.stringify({items:[{id:1,amount}],count:1}));
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${(server.address() as any).port}`;
 try{
  const bundle=validateProductionBundle(withCompanyAccountingReads({capabilities:[],toolDefinitions:[],toolAdapters:[]},A,{EBOEKHOUDEN_API_TOKEN:'isolated-fixture-token',EBOEKHOUDEN_API_BASE_URL:url}));
  const cap='eboekhouden_list_mutations',adapter=bundle.tools.adapter(cap),verifier=bundle.verifiers.get(cap)!;
  assert.equal(bundle.raw.capabilities.length,4);assert.ok(bundle.raw.toolDefinitions.every(d=>!d.sideEffect));
  await assert.rejects(adapter.execute({capabilityId:cap,legalEntityId:B,params:{limit:2},idempotencyKey:'deny'}),/COMPANY_DENIED/);assert.equal(reads,0);
  const result=await adapter.execute({capabilityId:cap,legalEntityId:A,params:{limit:2},idempotencyKey:'read'});
  const input:any={execution:{id:'fixture',legalEntityId:A,capabilityId:cap,params:{limit:2},evidence:result.evidence,result:result.result},contract:{method:'api_readback'}};
  assert.equal((await verifier.verify(input)).result,'VERIFIED');
  amount=99;assert.equal((await verifier.verify(input)).result,'INCONCLUSIVE');
  const count=reads;assert.equal((await verifier.verify({...input,execution:{...input.execution,legalEntityId:B}})).result,'INCONCLUSIVE');assert.equal(reads,count);
  assert.equal(mutationWrites,0);assert.equal(sessions,1);
  assert.throws(()=>withCompanyAccountingReads({capabilities:[],toolDefinitions:[],toolAdapters:[]},A,{}),/RUNTIME_AUTH_REQUIRED/);
 }finally{await new Promise<void>(resolve=>{server.close(()=>resolve());server.closeAllConnections()})}
});

test('monitor is inert while off and fails closed for write sources and wrong-company OSS sources',async()=>{
 delete process.env.SAM_PERCEPTION_ACTION_ENABLED;
 assert.deepEqual(await runPerceptionTick({} as any),{enabled:false,queued:0,observations:0});
 const l=await lab();process.env.SAM_PERCEPTION_ACTION_ENABLED='true';
 try{
  const cap='research_mcp_fixture_read';
  await l.db.query('INSERT INTO entity_capability_bindings VALUES($1,$2,true,false)',[l.entity,cap]);
  await l.db.query("INSERT INTO perception_sources(legal_entity_id,provider,capability_id,params,enabled) VALUES($1,'OSS',$2,'{}',true)",[l.entity,cap]);
  const source:any={tools:{definition:()=>({capabilityId:cap,sideEffect:false,authorityClass:'GREEN',companyScopes:[l.other]})},verifiers:new Map([[cap,{}]])};
  await assert.rejects(runPerceptionTick(source),/READ_SOURCE_DENIED/);
  assert.equal((await safePerceptionTick(source)).errorCode,'PERCEPTION_TICK_FAILED');
  assert.equal((await l.db.query("SELECT * FROM audit_log WHERE action='PERCEPTION_TICK_FAILED'")).rows.length,1);
  source.tools.definition=()=>({capabilityId:cap,sideEffect:true,authorityClass:'YELLOW',companyScopes:[l.entity]});
  await assert.rejects(runPerceptionTick(source),/READ_SOURCE_DENIED/);
  assert.equal((await l.db.query('SELECT * FROM perception_polls')).rows.length,0);
 }finally{delete process.env.SAM_PERCEPTION_ACTION_ENABLED;await l.close()}
});
