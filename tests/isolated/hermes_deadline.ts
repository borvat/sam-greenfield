import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HermesClient,type HermesTask,type Receipt,type ReceiptStore} from '../../packages/hermes/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';

// Existing Hermes transport/store seams; no DB, server, model or external fetch.
const epoch=Date.parse('2026-10-27T02:10:37.215Z');
const task=(timeout=120000):HermesTask=>({task_id:'18705143-069f-4f4e-aa82-84b8b26da3d2',
 goal_id:'b78eda44-9ec2-4643-b1f0-061c1b4cb355',agent_role:'data_analyst',instructions:'Synthetic candidate only',
 allowed_tools:[],repository_scope:[],execution_budget:{max_cost_usd:0,max_concurrency:1},timeout,created_at:new Date(epoch).toISOString()});
function receiptStore(initial?:Receipt){
 let current=initial&&structuredClone(initial);const history:Receipt[]=[];
 const store:ReceiptStore={load:async()=>current,save:async r=>{current=structuredClone(r);history.push(current);},assertActive:async()=>{}};
 return {store,history,read:()=>current};
}
const caps={auth:{required:true,type:'bearer'},features:{run_submission:true,run_status:true,run_stop:true,
 runs_idempotency:{durable:true,retention_seconds:86400}}};
function fixture(input:{clock:()=>number;route:(path:string,init:RequestInit)=>Promise<Response>}){
 const calls:{path:string;method:string;body?:string;key?:string}[]=[];
 const client=new HermesClient({baseUrl:'https://synthetic.invalid',apiKey:'synthetic-key-with-no-live-authority',
  assertServerPolicy:async()=>{},clock:input.clock,pollMs:1,transport:async(url,init={})=>{
   const path=new URL(String(url)).pathname;calls.push({path,method:init.method??'GET',body:init.body as string|undefined,
    key:(init.headers as Record<string,string>)?.['Idempotency-Key']});
   if(path==='/v1/capabilities')return Response.json(caps);
   if(path==='/v1/toolsets')return Response.json({data:[]});
   if(path.endsWith('/stop'))return Response.json({status:'cancelled'});
   return input.route(path,init);
  }});
 return {client,calls};
}

test('deadline: completion arriving after the original task deadline is never accepted',async()=>{
 const input=task(1000),s=receiptStore();let now=epoch;
 const f=fixture({clock:()=>now,route:async(path)=>{
  if(path==='/v1/runs')return Response.json({run_id:'run_synthetic_late',status:'running'});
  now=epoch+1001;return Response.json({run_id:'run_synthetic_late',status:'completed',output:'late candidate'});
 }});
 await assert.rejects(f.client.execute(input,s.store),/HERMES_TASK_TIMEOUT/);
 assert.equal(s.read()?.status,'TIMEOUT_UNCONFIRMED');
 assert(!s.history.some(r=>r.status==='completed'));
 assert.equal(f.calls.filter(c=>c.path==='/v1/runs').length,1);
 assert.equal(f.calls.filter(c=>c.path.endsWith('/stop')).length,1);
});

test('deadline: a status read uses remaining task time, not a fresh ten-second allowance',async()=>{
 const input=task(1000),s=receiptStore({taskHash:sha256Hex(input),runId:'run_synthetic_budget',status:'running'});
 let now=epoch+975,abortedWithinGrace=false;
 const f=fixture({clock:()=>now,route:async(_path,init)=>{
  const signal=init.signal!;
  await new Promise<void>(resolve=>{
   const grace=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve();},100);
   const onAbort=()=>{abortedWithinGrace=true;clearTimeout(grace);resolve();};
   signal.addEventListener('abort',onAbort,{once:true});if(signal.aborted)onAbort();
  });
  now=epoch+1001;
  if(signal.aborted)throw Error('synthetic deadline abort');
  return Response.json({run_id:'run_synthetic_budget',status:'completed',output:'late candidate'});
 }});
 await assert.rejects(f.client.execute(input,s.store),/HERMES_TASK_TIMEOUT/);
 assert.equal(abortedWithinGrace,true,'Only 25ms remained at poll start');
 assert.equal(s.read()?.status,'TIMEOUT_UNCONFIRMED');
 assert.equal(f.calls.filter(c=>c.path==='/v1/runs').length,0);
});

test('deadline: queue age and reconstruction keep the same absolute expiry and run identity',async()=>{
 const input=task(),hash=sha256Hex(input),s=receiptStore({taskHash:hash,runId:'run_synthetic_resume',status:'running'});
 let now=epoch+18749;
 const route=async()=>{now=epoch+120000;return Response.json({run_id:'run_synthetic_resume',status:'running'});};
 const first=fixture({clock:()=>now,route});
 await assert.rejects(first.client.execute(input,s.store),/HERMES_TASK_TIMEOUT/);
 assert.equal(now,epoch+120000,'Do not add queue age or reset time at remote acceptance');
 now++;const resumed=fixture({clock:()=>now,route});
 await assert.rejects(resumed.client.execute(input,s.store),/HERMES_TASK_TIMEOUT/);
 assert.equal([...first.calls,...resumed.calls].filter(c=>c.path==='/v1/runs').length,0);
 assert.equal(s.read()?.taskHash,hash);assert.equal(s.read()?.runId,'run_synthetic_resume');
 assert.equal(input.timeout,120000);assert.equal(input.created_at,new Date(epoch).toISOString());
});

test('deadline: lost submission acknowledgement keeps one durable run and unchanged task binding',async()=>{
 const input=task(),s=receiptStore(),bodies=new Map<string,string>();let now=epoch,attempts=0,executions=0;
 const f=fixture({clock:()=>now,route:async(path,init)=>{
  if(path==='/v1/runs'){
   attempts++;const key=(init.headers as Record<string,string>)['Idempotency-Key'],body=String(init.body);
   if(!bodies.has(key)){bodies.set(key,body);executions++;}else assert.equal(bodies.get(key),body);
   if(attempts===1)throw Error('synthetic lost acknowledgement');
   return Response.json({run_id:'run_synthetic_once',status:'running'});
  }
  return Response.json({run_id:'run_synthetic_once',status:'completed',output:'candidate'});
 }});
 const result=await f.client.execute(input,s.store);assert.equal(result.status,'completed');
 assert.equal(attempts,2);assert.equal(executions,1);assert.equal(result.taskHash,sha256Hex(input));
 const posts=f.calls.filter(c=>c.path==='/v1/runs');assert.equal(posts[0].key,posts[1].key);assert.equal(posts[0].body,posts[1].body);
 const before=f.calls.length;now=epoch+48*3600000;
 assert.deepEqual(await f.client.execute(input,s.store),result);assert.equal(f.calls.length,before);
 await assert.rejects(f.client.execute({...input,goal_id:'00000000-0000-4000-8000-000000000002'},s.store),/HERMES_TASK_ID_CONFLICT/);
 assert.equal(f.calls.length,before);
});
