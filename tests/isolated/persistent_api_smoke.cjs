const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {runApiSmoke}=require('../../deploy/render-test/api-smoke.cjs');
const id='11111111-1111-4111-8111-111111111111';
const plan='22222222-2222-4222-8222-222222222222';
const scope={schema:'sam_eval_probe',role:'sam_eval_runtime_probe'};
const databaseUrl='postgres://sam_eval_runtime_probe:unused-local-fixture@127.0.0.1/sam_core_test';
async function fixture(run,{missing=false,drift=false}={}){
 const goal={id,state:'WAITING_EXTERNAL',current_plan_id:plan};
 const budget={used:{costUsd:0.07,models:1},reserved:{costUsd:0.02}};
 const retained={goal,budget,goalCount:1,auditCount:3};const before=structuredClone(retained);
 const methods=[];let reads=0;
 const server=createServer((req,res)=>{
  methods.push(req.method);res.setHeader('content-type','application/json');
  if(req.method!=='GET'){res.writeHead(405);res.end('{}');return;}
  if(req.url==='/readyz'){res.end('{"ready":true}');return;}
  if(req.url==='/'){res.setHeader('content-type','text/html');res.end('<body data-read-only-stage="true" data-development-safe="true">');return;}
  if(req.headers.authorization!=='Bearer local-fixture'){res.writeHead(401);res.end('{}');return;}
  if(req.url==='/api/goals/'+id+'/timeline'){
   res.end(JSON.stringify({data:{goal,budget,progress:{displayState:'WAITING_EXTERNAL',reportVerified:false}}}));return;
  }
  res.writeHead(404);res.end('{}');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const options={port:server.address().port,token:'local-fixture',databaseUrl,expectedScope:scope,existingGoalId:id,
  // Only database access is injected. Requests traverse an actual HTTP server;
  // this is fixture evidence, not a PostgreSQL or hosted-container acceptance.
  clientFactory:()=>({async connect(){},async end(){},async query(sql,params){
   assert.match(sql,/^SELECT /);
   if(sql.includes('current_schema()'))return {rows:[scope]};
   assert.deepEqual(params,[id]);reads++;
   return {rows:missing?[]:[{...goal,...(drift&&reads===2?{current_plan_id:null}:{})}]};
  }})};
 try{await run({options,methods,retained,before,get reads(){return reads;}});}finally{await new Promise(resolve=>server.close(resolve));}
}
test('persistent startup twice reads the same planned goal without new goals, audit writes or budget resets',async()=>{
 await fixture(async({options,methods,retained,before})=>{
  for(let n=0;n<2;n++){
   const result=await runApiSmoke(options);assert.equal(result.status,'PASS');
   assert(result.checks.includes('no_startup_goal_creation'));assert.equal(result.liveReasoningValidated,false);
  }
  assert(methods.length>0);assert(methods.every(m=>m==='GET'));assert.deepEqual(retained,before);
 });
});
test('missing persistent goal ID is refused before HTTP or database access',async()=>{
 await fixture(async({options,methods,reads})=>{
  await assert.rejects(runApiSmoke({...options,existingGoalId:undefined}),/PERSISTENT_SMOKE_GOAL_REQUIRED/);
  assert.equal(methods.length,0);assert.equal(reads,0);
 });
});
test('missing migrated goal fails rather than creating a replacement',async()=>{
 await fixture(async({options,methods})=>{
  const result=await runApiSmoke(options);assert.equal(result.status,'FAIL');assert.equal(result.phase,'EXISTING_GOAL_BASELINE');
  assert(methods.every(m=>m==='GET'));
 },{missing:true});
});
test('changed plan on independent database readback fails without mutation',async()=>{
 await fixture(async({options,methods})=>{
  const result=await runApiSmoke(options);assert.equal(result.status,'FAIL');assert.equal(result.phase,'DATABASE_READBACK');
  assert(methods.every(m=>m==='GET'));
 },{drift:true});
});
