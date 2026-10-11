// Disposable real PostgreSQL only. Never points to a deployment database.
const assert=require('node:assert/strict');
const {Client}=require('pg');
const {createServer}=require('node:http');
const {generateKeyPairSync,sign,randomUUID}=require('node:crypto');
const {spawn}=require('node:child_process');
const {initialize,apply}=require('../../scripts/direct/provision.cjs');
const adminUrl=process.env.SAM_TEST_PG_ADMIN_URL;
if(!adminUrl)throw new Error('SAM_TEST_PG_ADMIN_URL required: isolated disposable PostgreSQL');
const admin=new URL(adminUrl);
if(!['localhost','127.0.0.1'].includes(admin.hostname))throw new Error('Local fixture only');
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const key={...publicKey.export({format:'jwk'}),kid:'fixture',alg:'RS256',use:'sig'};
const suffix=randomUUID().replaceAll('-','').slice(0,12);
const fixture={SAM_RELEASE_ORG_ID:randomUUID(),SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:randomUUID(),
 SAM_DB_SCHEMA:'sam_test_'+suffix,SAM_DB_APP_ROLE:'sam_test_role_'+suffix,
 SAM_DIRECT_GOALS_PER_DAY:'4',SAM_DIRECT_MODEL_CALLS_PER_DAY:'6',SAM_DIRECT_PLAN_BUDGET_USD:'0.1',
 SAM_RELEASE_CAPABILITIES:'local.calculate,local.statistics,drive_search',
 SAM_MODEL_REGISTRY_JSON:JSON.stringify([{providerId:'deepseek',models:['fixture-model'],privacyClasses:['PUBLIC','INTERNAL'],costPer1kInput:0.001,costPer1kOutput:0.001}])};
const password='fixture-runtime-password-local-only-'+suffix;
const runtime=new URL(adminUrl);runtime.username=fixture.SAM_DB_APP_ROLE;runtime.password=password;
const org=fixture.SAM_RELEASE_ORG_ID,entity=fixture.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let processSam,logs='',providerCalls=0,sourceReads=0,sourceChanges=false;
const source=createServer((req,res)=>{res.setHeader('content-type','application/json');if(req.url==='/token')return res.end(JSON.stringify({access_token:'fixture-google-token',expires_in:3600}));assert.equal(req.headers.authorization,'Bearer fixture-google-token');sourceReads++;res.end(JSON.stringify({files:[{id:'fixture-file',name:sourceChanges?'Changed-'+sourceReads:'Business document'}]}));});
const provider=createServer(async(req,res)=>{
 let data='';for await(const chunk of req)data+=chunk;
 const body=JSON.parse(data);assert.equal(body.max_tokens,2048);providerCalls++;
 const input=JSON.parse(body.messages[0].content).input;assert.match(input.context.owner_acceptance,/^sam.acceptance\/v1:/);const objective=input.objective;
 const plan={assumptions:{},constraints:{},dependencies:{},steps:[objective.startsWith('Find')?{capabilityId:'drive_search',params:{query:'Business',limit:5}}:{capabilityId:'local.calculate',params:{operation:'sum',values:[7,-4,19]}}]};
 if(objective==='Sum 7, -4, and 19')plan.steps.push({capabilityId:'local.statistics',params:{values:[7,-4,19]}});
 res.setHeader('content-type','application/json');res.end(JSON.stringify({model:'fixture-model',choices:[{message:{content:JSON.stringify(plan)}}],usage:{prompt_tokens:100,completion_tokens:70}}));
});
function token(overrides={}){
 const now=Math.floor(Date.now()/1000);
 const claims={iss:'https://fixture-issuer.example.invalid/',sub:'fixture-owner',client_id:'fixture-client',aud:'https://localhost/mcp',iat:now,exp:now+600,scope:'sam:read sam:submit',
 'https://localhost/sam/org_id':org,'https://localhost/sam/legal_entity_id':entity,...overrides};
 const a=Buffer.from(JSON.stringify({alg:'RS256',typ:'at+jwt',kid:'fixture'})).toString('base64url');
 const b=Buffer.from(JSON.stringify(claims)).toString('base64url');
 return a+'.'+b+'.'+sign('RSA-SHA256',Buffer.from(a+'.'+b),privateKey).toString('base64url');
}
let url,baseEnv;
async function start(){
 logs='';processSam=spawn(process.execPath,['scripts/direct/main.cjs'],{env:baseEnv,stdio:['ignore','pipe','pipe']});
 processSam.stdout.on('data',b=>logs+=b);processSam.stderr.on('data',b=>logs+=b);
 for(let i=0;i<100;i++){
  if(processSam.exitCode!==null)throw new Error('Startup failed: '+logs);
  try{if((await fetch(url+'/readyz')).status===200)return;}catch{}
  await delay(100);
 }throw new Error('Startup timeout: '+logs);
}
async function stop(){if(!processSam||processSam.exitCode!==null)return;processSam.kill('SIGTERM');await new Promise((r,j)=>{const t=setTimeout(()=>{processSam.kill('SIGKILL');j(new Error('stop timeout'));},18000);processSam.once('exit',()=>{clearTimeout(t);r();});});}
let id=0;
async function rpc(method,params={},bearer=token()){
 const response=await fetch(url+'/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream',authorization:'Bearer '+bearer},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params})});
 const text=await response.text();
 let data;try{data=JSON.parse(text);}catch{const events=text.split('\n').filter(x=>x.startsWith('data:'));data=JSON.parse(events.at(-1).slice(5));}
 return {status:response.status,data};
}
async function call(name,args,bearer){const r=await rpc('tools/call',{name,arguments:args},bearer);assert.equal(r.status,200,JSON.stringify(r));return r.data.result?.structuredContent??JSON.parse(r.data.result.content[0].text);}
const contract={version:1,constraints:[{capabilityId:'local.calculate',params:{operation:'sum'},result:{field:'value',equals:22}}]};
async function submit(objective='Sum 7, -4, and 19',acceptance=contract){return call('sam_submit_goal',{request_id:randomUUID(),objective,acceptance_contract:acceptance});}
async function waitState(goal,states){for(let i=0;i<160;i++){const r=await call('sam_get_goal_status',{goal_id:goal});if(states.includes(r.data?.state))return r.data.state;await delay(100);}throw new Error('Goal timeout '+JSON.stringify(await call('sam_get_goal_status',{goal_id:goal}))+' '+logs);}
(async()=>{
 let connected=false;for(let attempt=0;attempt<50;attempt++){try{await new Promise((resolve,reject)=>{const socket=require('node:net').createConnection({host:admin.hostname,port:Number(admin.port)||5432});socket.once('connect',()=>{socket.destroy();resolve();});socket.once('error',reject);});connected=true;break;}catch{await delay(100);}}assert.equal(connected,true,'Fixture database unavailable');
 const client=new Client({connectionString:adminUrl});await client.connect();
 try{
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  assert.equal((await initialize(client,{...fixture,SAM_RUNTIME_PASSWORD:password})).status,'PROVISIONED');
  const replayProvision=await apply({adminUrl,expectedHost:admin.hostname,expectedDatabase:admin.pathname.slice(1),metadata:fixture,runtimePassword:password});assert.equal(replayProvision.status,'ALREADY_PROVISIONED');assert.equal(replayProvision.runtimeLoginVerified,true);
  await assert.rejects(initialize(client,{...fixture,SAM_RUNTIME_PASSWORD:password,SAM_DIRECT_GOALS_PER_DAY:'5'}));
  const runtimeDb=new Client({connectionString:runtime.href});await runtimeDb.connect();
  try{
   const identity=(await runtimeDb.query('SELECT current_user role,(SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) ssl')).rows[0];assert.equal(identity.role,fixture.SAM_DB_APP_ROLE);assert.equal(identity.ssl,true);
   await runtimeDb.query('SET search_path='+fixture.SAM_DB_SCHEMA+',pg_catalog,pg_temp');
   assert.equal((await runtimeDb.query('SELECT count(*)::int n FROM legal_entities')).rows[0].n,0);
   await assert.rejects(runtimeDb.query('DELETE FROM model_calls'));
   await assert.rejects(runtimeDb.query('CREATE TABLE forbidden(id int)'));
  }finally{await runtimeDb.end();}
  await new Promise(r=>provider.listen(0,'127.0.0.1',r));await new Promise(r=>source.listen(0,'127.0.0.1',r));
  const port=40000+process.pid%10000;url='http://localhost:'+port;
  baseEnv={...process.env,...fixture,NODE_ENV:'production',SAM_DATABASE_TARGET:'production',SAM_EXECUTIVE_MCP:'1',SAM_RELEASE_SETUP_MODE:'0',SAM_RELEASE_SYNTHETIC_PLANNER:'0',
   SAM_RELEASE_DATABASE_URL:runtime.href,SAM_MCP_OAUTH_RESOURCE:'https://localhost/mcp',SAM_MCP_OAUTH_ISSUER:'https://fixture-issuer.example.invalid/',SAM_MCP_OAUTH_SUBJECT:'fixture-owner',SAM_MCP_OAUTH_CLIENT_ID:'fixture-client',SAM_MCP_OAUTH_PUBLIC_JWKS:JSON.stringify({keys:[key]}),PORT:String(port),SAM_DIRECT_TICK_MS:'250',
   GOOGLE_OAUTH_CLIENT_ID:'fixture-google-client',GOOGLE_OAUTH_CLIENT_SECRET:'fixture-google-secret',GOOGLE_OAUTH_REFRESH_TOKEN:'fixture-refresh',GOOGLE_OAUTH_TOKEN_URL:'http://127.0.0.1:'+source.address().port+'/token',GOOGLE_DRIVE_API_BASE_URL:'http://127.0.0.1:'+source.address().port,
   DEEPSEEK_API_KEY:'fixture-key',DEEPSEEK_MODEL:'fixture-model',DEEPSEEK_BASE_URL:'http://127.0.0.1:'+provider.address().port,DEEPSEEK_COST_PER_1K_INPUT:'0.001',DEEPSEEK_COST_PER_1K_OUTPUT:'0.001'};
  delete baseEnv.SAM_RUNTIME_PASSWORD;delete baseEnv.SAM_PROVISION_DATABASE_URL;delete baseEnv.DATABASE_URL;
  await start();
  assert.equal((await fetch(url+'/mcp',{method:'POST'})).status,401);
  assert.equal((await rpc('tools/list',{},token({sub:'intruder'}))).status,401);
  assert.equal((await rpc('tools/list',{},token({exp:1,iat:0}))).status,401);assert.equal((await rpc('tools/list',{},token({aud:'https://unrelated.example/mcp'}))).status,401);
  const deniedSubmit=await call('sam_submit_goal',{request_id:randomUUID(),objective:'Unauthorized submission',acceptance_contract:contract},token({scope:'sam:read'}));assert.equal(deniedSubmit.ok,false);assert.equal(providerCalls,0);
  const init=await rpc('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'direct-fixture',version:'1'}});assert.equal(init.status,200);
  const list=await rpc('tools/list');assert.deepEqual(list.data.result.tools.map(t=>t.name).sort(),['sam_capabilities','sam_get_goal_result','sam_get_goal_status','sam_submit_goal']);
  assert.equal((await call('sam_capabilities',{})).ok,true);
  const request={request_id:randomUUID(),objective:'Sum 7, -4, and 19',acceptance_contract:contract};
  const goal=await call('sam_submit_goal',request);assert.equal(goal.ok,true,JSON.stringify(goal)+logs);const goalId=goal.data.goal_id;
  const replay=await call('sam_submit_goal',request);assert.equal(replay.data.goal_id,goalId);assert.equal(replay.data.replayed,true);
  assert.equal((await call('sam_submit_goal',{...request,objective:'Different objective'})).error,'DIRECT_REPLAY_CONFLICT');
  // Crash between persisted queue steps, then resume without buying a new plan.
  let interrupted=false;for(let n=0;n<200;n++){const queue=(await client.query('SELECT status FROM '+fixture.SAM_DB_SCHEMA+'.work_queue WHERE goal_id=$1',[goalId])).rows;if(queue.some(r=>r.status==='EXECUTED')&&queue.some(r=>r.status==='QUEUED')){interrupted=true;break;}await delay(10);}
  assert.equal(interrupted,true);const paidBeforeCrash=providerCalls;processSam.kill('SIGKILL');await new Promise(r=>processSam.once('exit',r));await start();
  assert.equal(await waitState(goalId,['COMPLETED','FAILED','BLOCKED']),'COMPLETED');assert.equal(providerCalls,paidBeforeCrash);
  const result=await call('sam_get_goal_result',{goal_id:goalId});assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.data.verified,true);assert.equal(result.data.results.find(r=>r.capability_id==='local.calculate').result.value,22);
  const callsBefore=providerCalls;await stop();await start();assert.equal((await call('sam_get_goal_result',{goal_id:goalId})).data.verified,true);assert.equal(providerCalls,callsBefore);
  // A durable receipt must reject result tampering even with an unchanged stored hash.
  await client.query('UPDATE '+fixture.SAM_DB_SCHEMA+'.executions SET result=$1 WHERE goal_id=$2',[{operation:'sum',value:999},goalId]);
  assert.equal((await call('sam_get_goal_result',{goal_id:goalId})).ok,false);
  const readContract={version:1,constraints:[{capabilityId:'drive_search',params:{query:'Business'},result:{field:'files',exists:true}}]};
  const read=await submit('Find Business documents in Drive',readContract);assert.equal(read.ok,true);assert.equal(await waitState(read.data.goal_id,['COMPLETED','BLOCKED','FAILED']),'COMPLETED');
  const readResult=await call('sam_get_goal_result',{goal_id:read.data.goal_id});assert.equal(readResult.data.verified,true);assert.ok(sourceReads>=2);assert.equal(readResult.data.results[0].receipt.verifier,'direct-independent-source-readback');
  const wrong={version:1,constraints:[{capabilityId:'local.calculate',params:{operation:'sum'},result:{field:'value',equals:999}}]};
  const failed=await submit('Sum 7, -4, and 19; expected contract intentionally wrong',wrong);assert.equal(failed.ok,true);
  assert.notEqual(await waitState(failed.data.goal_id,['FAILED','BLOCKED','WAITING_OWNER','COMPLETED']),'COMPLETED');
  assert.equal((await call('sam_get_goal_result',{goal_id:failed.data.goal_id})).data.verified,false);
  sourceChanges=true;const changing=await submit('Find Business documents whose source changes',readContract);assert.equal(changing.ok,true);assert.notEqual(await waitState(changing.data.goal_id,['COMPLETED','FAILED','BLOCKED','WAITING_OWNER']),'COMPLETED');
  assert.equal((await submit()).error,'DIRECT_DAILY_GOAL_LIMIT');assert.equal(providerCalls,6);
  const reservations=(await client.query('SELECT count(*)::int n FROM '+fixture.SAM_DB_SCHEMA+".model_calls WHERE task='direct_budget'")).rows[0].n;assert.equal(reservations,6);
  console.log('DIRECT_ACCEPTANCE_PASS: real TLS PostgreSQL; restricted login; atomic/idempotent provisioning; OAuth rejection; real MCP; goal/worker/independent SQL; crash between queued steps with no model replay; persisted restart receipt; tamper refusal; owner-contract refusal; connected Drive adapter and fresh source comparison; daily goal/model quota. Provider HTTP is an isolated fixture, not live OAuth/ChatGPT/business acceptance.');
 }finally{await stop();provider.close();source.close();await client.end();}
})().catch(error=>{console.error(error);process.exitCode=1;});
