import {test} from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {HermesClient,FREE_MODEL,type HermesTask,type Receipt,type ReceiptStore,type HermesMeasurement} from '../../packages/hermes/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';

const epoch=Date.parse('2026-10-27T00:00:00Z');
const task:HermesTask={task_id:'00000000-0000-4000-8000-000000000001',goal_id:'00000000-0000-4000-8000-000000000002',
 agent_role:'data_analyst',instructions:'PRIVATE_AGGREGATE_NOT_FOR_LOG',allowed_tools:[],repository_scope:[],
 execution_budget:{max_cost_usd:0,max_concurrency:1},timeout:120000,created_at:new Date(epoch).toISOString()};
const caps={auth:{required:true,type:'bearer'},features:{run_submission:true,run_status:true,run_stop:true,
 runs_idempotency:{durable:true,retention_seconds:86400}}};

async function exercise(mode:'off'|'on'|'broken',scenario:'complete'|'retry'|'late'|'resume'){
 let wall=epoch+17000,mono=30,posts=0;
 let current:Receipt|undefined=scenario==='resume'?{taskHash:sha256Hex(task),runId:'run_synthetic',status:'running'}:undefined;
 const rows:HermesMeasurement[]=[],history:Receipt[]=[],calls:any[]=[];
 const store:ReceiptStore={assertActive:async()=>{},load:async()=>current,save:async r=>{current=structuredClone(r);history.push(current);}};
 const client=new HermesClient({baseUrl:'https://synthetic.invalid',apiKey:'PRIVATE_SYNTHETIC_KEY_NOT_FOR_LOG',
  assertServerPolicy:async()=>{},clock:()=>wall,pollMs:1,requireNativeModelLock:true,
  ...(mode==='off'?{}:{measurement:{monotonic:()=>mono,write:(row:HermesMeasurement)=>{
   if(mode==='broken')throw Error('synthetic sink unavailable');rows.push(row);
  }}}),transport:async(url,init={})=>{
   const path=new URL(String(url)).pathname;
   calls.push({path,method:init.method,body:init.body,key:(init.headers as any)['Idempotency-Key']});
   if(path==='/v1/capabilities')return Response.json(caps);
   if(path==='/v1/toolsets')return Response.json({data:[]});
   if(path==='/api/sessions')return Response.json({id:`sam_${task.task_id}`});
   if(path.endsWith('/model'))return Response.json({session_id:`sam_${task.task_id}`,runtime:{provider:'nous',model:FREE_MODEL,model_lock:'accepted'}});
   if(path.endsWith('/stop')){mono+=5;return Response.json({status:'cancelled'});}
   if(path==='/v1/runs'){
    posts++;mono+=10;wall+=10;
    if(scenario==='retry'&&posts===1)throw Error('lost acknowledgement');
    return Response.json({run_id:'run_synthetic',status:'running'});
   }
   mono+=20;wall=scenario==='late'?epoch+120001:wall+20;
   return Response.json({run_id:'run_synthetic',status:'completed',output:'PRIVATE_CANDIDATE_NOT_FOR_LOG',runtime:{provider:'nous',model:FREE_MODEL}});
  }});
 let result:Receipt|undefined,error:string|undefined;
 try{result=await client.execute(task,store);}catch(e){error=(e as Error).message;}
 return {client,store,result,error,rows,history,calls,current};
}

test('measurement: metadata-only timing and identical execution with observation on, off or broken',async()=>{
 const off=await exercise('off','complete'),on=await exercise('on','complete'),broken=await exercise('broken','complete');
 for(const measured of [on,broken]){
  assert.deepEqual(measured.calls,off.calls);assert.deepEqual(measured.history,off.history);assert.deepEqual(measured.result,off.result);
 }
 assert.deepEqual(on.rows.map(r=>r.event),['sam_send','sam_accepted','sam_poll','sam_terminal']);
 assert.deepEqual(on.rows.map(r=>r.elapsed_ms),[0,10,30,30]);
 assert.equal(new Set(on.rows.map(r=>r.operation_id)).size,1);
 for(const r of on.rows){
  assert.equal(r.task_id,task.task_id);assert.equal(r.goal_id,task.goal_id);assert.equal(r.task_hash,sha256Hex(task));
  assert.equal(r.session_id,`sam_${task.task_id}`);assert.equal(r.absolute_deadline,new Date(epoch+120000).toISOString());
 }
 assert.equal(on.rows.at(-1)!.output_sha256,createHash('sha256').update('PRIVATE_CANDIDATE_NOT_FOR_LOG','utf8').digest('hex'));
 assert.ok(on.rows.slice(0,-1).every(r=>!('output_sha256' in r)));
 assert.equal(on.rows[1].run_id,'run_synthetic');assert(!JSON.stringify(on.rows).includes('PRIVATE_'));
 assert.equal(broken.rows.length,0);assert.equal(off.rows.length,0);
});

test('measurement: retry/reconstruction keep identical submission identity and no extra run',async()=>{
 for(const scenario of ['retry','resume'] as const){
  const off=await exercise('off',scenario),on=await exercise('on',scenario);
  assert.deepEqual(on.calls,off.calls);assert.deepEqual(on.history,off.history);assert.deepEqual(on.result,off.result);
  const posts=on.calls.filter(c=>c.path==='/v1/runs');
  if(scenario==='retry'){
   assert.equal(posts.length,2);assert.equal(posts[0].key,posts[1].key);assert.equal(posts[0].body,posts[1].body);
   assert.deepEqual(on.rows.filter(r=>r.event==='sam_send').map(r=>r.attempt),[1,2]);
  }else{assert.equal(posts.length,0);assert.equal(on.rows[0].event,'sam_resumed');}
  const count=on.calls.length;
  assert.deepEqual(await on.client.execute(task,on.store),on.result);assert.equal(on.calls.length,count);
  await assert.rejects(on.client.execute({...task,goal_id:'00000000-0000-4000-8000-000000000003'},on.store),/HERMES_TASK_ID_CONFLICT/);
  assert.equal(on.calls.length,count);
 }
});

test('measurement: original deadline and cancellation unchanged, late output still refused',async()=>{
 const off=await exercise('off','late');
 for(const mode of ['on','broken'] as const){
  const measured=await exercise(mode,'late');
  assert.deepEqual(measured.calls,off.calls);assert.deepEqual(measured.history,off.history);
  assert.equal(measured.error,'HERMES_TASK_TIMEOUT');assert.equal(measured.current?.status,'TIMEOUT_UNCONFIRMED');
  assert(!measured.history.some(r=>r.status==='completed'));
  assert.ok(measured.rows.every(r=>!('output_sha256' in r)),'Refused late output must not be logged as an accepted terminal output');
  if(mode==='on')assert.deepEqual(measured.rows.slice(-3).map(r=>r.event),['sam_stop_requested','sam_stop_acknowledged','sam_terminal']);
 }
});
