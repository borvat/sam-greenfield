import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HermesClient,DEEPSEEK_RUNTIME,type HermesTask,type Receipt} from '../../packages/hermes/src/client';

const input:HermesTask={task_id:'00000000-0000-4000-8000-000000000001',goal_id:'00000000-0000-4000-8000-000000000002',
 agent_role:'data_analyst',instructions:'synthetic',allowed_tools:[],repository_scope:[],
 execution_budget:{max_cost_usd:.15,max_concurrency:1},timeout:120000,created_at:new Date().toISOString()};
const caps={auth:{required:true,type:'bearer'},features:{run_submission:true,run_status:true,run_stop:true,runs_idempotency:{durable:true,retention_seconds:86400}}};
function fixture(lockProvider='deepseek'){
 let saved:Receipt|undefined,posts=0;const bodies:any[]=[];
 const client=new HermesClient({baseUrl:'https://synthetic.invalid',apiKey:'synthetic-not-a-real-key-or-authority',runtimePolicy:DEEPSEEK_RUNTIME,
  requireNativeModelLock:true,assertServerPolicy:async()=>{},transport:async(url,init={})=>{
   const path=new URL(String(url)).pathname;
   if(path==='/v1/capabilities')return Response.json(caps);
   if(path==='/v1/toolsets')return Response.json({data:[]});
   if(init.method==='POST')bodies.push({path,body:JSON.parse(String(init.body)),key:(init.headers as any)['Idempotency-Key']});
   if(path==='/api/sessions')return Response.json({});
   if(path.endsWith('/model'))return Response.json({session_id:`sam_${input.task_id}`,runtime:{provider:lockProvider,model:'deepseek-flash',model_lock:'accepted'}});
   if(path==='/v1/runs'){posts++;return Response.json({run_id:'run_synthetic_deepseek',status:'running'});}
   return Response.json({run_id:'run_synthetic_deepseek',status:'completed',output:'synthetic',runtime:{provider:'deepseek',model:'deepseek-flash'}});
  }});
 const store={assertActive:async()=>{},load:async()=>saved,save:async(r:Receipt)=>{saved=r;}};
 return {client,store,bodies,posts:()=>posts};
}
test('deepseek: exact approved pair and budget preserve task identity, receipt and no duplicate run',async()=>{
 const f=fixture(),r=await f.client.execute(input,f.store);assert.equal(r.runId,'run_synthetic_deepseek');
 for(const b of f.bodies){assert.equal(b.body.provider,'deepseek');assert.equal(b.body.model,'deepseek-flash');}
 assert.equal(f.bodies.find(b=>b.path==='/v1/runs').key,`sam-hermes:${input.task_id}`);
 assert.deepEqual(await f.client.execute(input,f.store),r);assert.equal(f.posts(),1);
});
test('deepseek: old provider lock or zero/free budget cannot silently fall back or submit a run',async()=>{
 const f=fixture('nous');await assert.rejects(f.client.execute(input,f.store),/MODEL_LOCK_DENIED/);assert.equal(f.posts(),0);
 const g=fixture();await assert.rejects(g.client.execute({...input,execution_budget:{max_cost_usd:0,max_concurrency:1}},g.store),/TASK_BUDGET_DENIED/);
 assert.equal(g.bodies.length,0);
});
