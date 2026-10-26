import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {HermesClient,HermesError,type HermesTask,type Receipt,type ReceiptStore} from '../../packages/hermes/src/client';

const task=():HermesTask=>({task_id:randomUUID(),goal_id:randomUUID(),agent_role:'tester',instructions:'Return a candidate only',
  allowed_tools:[],repository_scope:[],execution_budget:{max_cost_usd:0,max_concurrency:1},timeout:3000,created_at:new Date().toISOString()});
const store=()=>{let receipt:Receipt|undefined;return {load:async()=>receipt,save:async(r:Receipt)=>{receipt=structuredClone(r);},assertActive:async()=>{}} satisfies ReceiptStore;};
const caps={auth:{type:'bearer',required:true},features:{run_submission:true,run_status:true,run_stop:true,runs_idempotency:{durable:true,retention_seconds:86400}}};
async function fixture(t:any,overrides?:{tools?:any[];lost?:boolean;running?:boolean;wrongId?:boolean;reject?:number;modelLock?:boolean;wrongLock?:boolean}){
  const requests:{path:string;method:string;key?:string;body:any}[]=[],keys=new Map<string,string>();let executions=0,stops=0;
  const send=(r:ServerResponse,status:number,body:any)=>{r.writeHead(status,{'content-type':'application/json'});r.end(JSON.stringify(body));};
  const server=createServer(async(req:IncomingMessage,res:ServerResponse)=>{
    assert.equal(req.headers.authorization,'Bearer '+'x'.repeat(32));let text='';for await(const c of req)text+=c;
    const record={path:req.url!,method:req.method!,key:req.headers['idempotency-key'] as string|undefined,body:text?JSON.parse(text):undefined};requests.push(record);
    if(req.url==='/v1/capabilities')return send(res,200,caps);
    if(req.url==='/v1/toolsets')return send(res,200,{data:overrides?.tools??[]});
    if(req.url==='/api/sessions')return send(res,409,{});
    if(req.url?.endsWith('/model'))return send(res,200,{session_id:req.url.split('/')[3],runtime:{provider:overrides?.wrongLock?'paid':'nous',model:'poolside/laguna-s-2.1:free',model_lock:'accepted'}});
    if(req.url==='/v1/runs'&&req.method==='POST'){
      if(overrides?.reject)return send(res,overrides.reject,{error:'REDACTED secret must not propagate'});
      const prior=keys.get(record.key!);if(prior&&prior!==text)return send(res,409,{});
      if(!prior){keys.set(record.key!,text);executions++;if(overrides?.lost){req.socket.destroy();return;}}
      return send(res,202,{run_id:'run_fixture',status:'started'});
    }
    if(req.url==='/v1/runs/run_fixture/stop'){stops++;return send(res,200,{status:'cancelled'});}
    if(req.url==='/v1/runs/run_fixture')return send(res,200,{run_id:overrides?.wrongId?'run_wrong':'run_fixture',status:overrides?.running?'running':'completed',output:'candidate',runtime:{provider:'nous',model:'poolside/laguna-s-2.1:free'}});
    send(res,404,{});
  });
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r());}));
  const address=server.address() as any;
  return {requests,executions:()=>executions,stops:()=>stops,client:new HermesClient({baseUrl:`http://127.0.0.1:${address.port}`,apiKey:'x'.repeat(32),pollMs:1,assertServerPolicy:async()=>{},requireNativeModelLock:overrides?.modelLock})};
}
test('real HTTP stub: lost acceptance response retries exactly one durable remote execution',async t=>{
  const f=await fixture(t,{lost:true}),s=store(),input=task();const result=await f.client.execute(input,s);
  assert.equal(result.status,'completed');assert.equal(f.executions(),1);
  const posts=f.requests.filter(r=>r.path==='/v1/runs');assert.equal(posts.length,2);assert.equal(posts[0].key,posts[1].key);assert.deepEqual(posts[0].body,posts[1].body);
  assert.equal(posts[0].body.provider,'nous');assert.equal(posts[0].body.model,'poolside/laguna-s-2.1:free');
  const again=await f.client.execute(input,s);assert.deepEqual(again,result);assert.equal(f.executions(),1);
});
test('client reconstruction after simulated crash reads stored run instead of creating another',async t=>{
  const f=await fixture(t,{running:true}),s=store(),input=task();
  const saved=s.save;let polls=0;
  s.save=async r=>{await saved(r);if(r.runId&&++polls===1)throw Error('simulated SAM crash after receipt persistence');};
  await assert.rejects(f.client.execute(input,s),/HERMES_WORK_NO_LONGER_AUTHORIZED/);assert.equal(f.stops(),1);s.save=saved;
  const receipt=await s.load();assert.equal(receipt?.runId,'run_fixture');
  const second=await fixture(t);await second.client.execute(input,s);
  assert.equal(second.requests.filter(r=>r.method==='POST').length,0);assert.equal(f.executions(),1);
});
test('deny caller tools, repositories, paid budget and injected permission fields before any network call',async t=>{
  const f=await fixture(t);
  for(const delta of [{allowed_tools:['terminal']},{repository_scope:['borvat/private']},{execution_budget:{max_cost_usd:1,max_concurrency:1}},{model:'paid'},{permissions:'admin'}])
    await assert.rejects(f.client.execute({...task(),...delta} as any,store()),/HERMES_TASK_SCOPE_DENIED/);
  assert.equal(f.requests.length,0);
});
test('reject excessive server tools before dispatch even if task asks for no tools',async t=>{
  const f=await fixture(t,{tools:[{name:'terminal',enabled:true}]});await assert.rejects(f.client.execute(task(),store()),/HERMES_SERVER_TOOL_SCOPE_EXCESSIVE/);
  assert.equal(f.executions(),0);
});
test('server policy rejection cannot be overridden by model or task text',async()=>{
  let calls=0;const client=new HermesClient({baseUrl:'https://hermes.invalid',apiKey:'x'.repeat(32),assertServerPolicy:async()=>{throw new HermesError('HERMES_FREE_PROFILE_NOT_ATTESTED');},transport:async()=>{calls++;throw Error('no');}});
  await assert.rejects(client.execute(task(),store()),/HERMES_FREE_PROFILE_NOT_ATTESTED/);assert.equal(calls,0);
});
test('mismatched task replay is refused without any fresh remote execution',async t=>{
  const f=await fixture(t),input=task(),s=store();await f.client.execute(input,s);
  await assert.rejects(f.client.execute({...input,instructions:'different'},s),/HERMES_TASK_ID_CONFLICT/);assert.equal(f.executions(),1);
});
test('timeout requests safe stop and persists uncertainty rather than success',async t=>{
  const f=await fixture(t,{running:true}),input=task(),s=store();input.timeout=1000;
  await assert.rejects(f.client.execute(input,s),/HERMES_TASK_TIMEOUT/);assert.equal(f.stops(),1);assert.equal((await s.load())?.status,'TIMEOUT_UNCONFIRMED');
});
test('revoked work requests cancellation and cannot become completed',async t=>{
  const f=await fixture(t),s=store();let active=0;
  s.assertActive=async()=>{if(++active>=3)throw Error('goal cancelled');};
  await assert.rejects(f.client.execute(task(),s),/HERMES_WORK_NO_LONGER_AUTHORIZED/);assert.equal(f.stops(),1);
});
test('run identity mismatch and HTTP denial never expose server errors as success',async t=>{
  const wrong=await fixture(t,{wrongId:true});await assert.rejects(wrong.client.execute(task(),store()),/HERMES_RUN_ID_MISMATCH/);
  const denied=await fixture(t,{reject:403});await assert.rejects(denied.client.execute(task(),store()),e=>e instanceof HermesError&&e.message==='HERMES_HTTP_403');assert.equal(denied.executions(),0);
});
test('expired idempotency retention cannot silently create a new task',async t=>{
  const f=await fixture(t),input=task();input.created_at=new Date(Date.now()-24*3600000).toISOString();
  await assert.rejects(f.client.execute(input,store()),/HERMES_REPLAY_WINDOW_CLOSED/);assert.equal(f.requests.length,0);
});
test('completed receipt remains readable after replay window without resubmission',async t=>{
  const f=await fixture(t),input=task(),s=store();const receipt=await f.client.execute(input,s);
  const future=new HermesClient({baseUrl:'https://unused.invalid',apiKey:'x'.repeat(32),clock:()=>Date.now()+48*3600000,
    assertServerPolicy:async()=>{throw Error('network must not be used');}});
  assert.deepEqual(await future.execute(input,s),receipt);assert.equal(f.executions(),1);
});

test('native model lock is acknowledged before dispatch with stable session identity',async t=>{
  const f=await fixture(t,{modelLock:true}),input=task();await f.client.execute(input,store());
  const post=f.requests.find(r=>r.path==='/v1/runs')!;
  assert.equal(post.body.session_id,'sam_'+input.task_id);
  assert.equal(f.requests.filter(r=>r.path.endsWith('/model')).length,1);
  assert(f.requests.findIndex(r=>r.path.endsWith('/model'))<f.requests.indexOf(post));
});
test('native model lock mismatch refuses dispatch',async t=>{
  const f=await fixture(t,{modelLock:true,wrongLock:true});await assert.rejects(f.client.execute(task(),store()),/HERMES_MODEL_LOCK_DENIED/);assert.equal(f.executions(),0);
});
