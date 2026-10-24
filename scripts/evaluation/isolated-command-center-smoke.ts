/** Existing approved sandbox only. No models, external tools, DDL or privileges.
 * Private connection stays on its original host. Output is bounded assertions,
 * never connection values, identifiers or business rows. */
import {readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Client} from 'pg';
async function main(){
 const path=process.argv[2];
 if(!path||statSync(path).mode&0o077)throw Error('PRIVATE_CONFIG_REQUIRED');
 const c=JSON.parse(readFileSync(path,'utf8'));
 if(!/^sam_eval_[a-z0-9_]+$/.test(c.schema)||!/^sam_eval_runtime_[a-z0-9_]+$/.test(c.role))throw Error('ISOLATED_SCOPE_REQUIRED');
 process.env.DATABASE_URL=c.connectionString;
 process.env.SAM_COMMAND_CENTER_READ_ONLY='1';process.env.SAM_REQUIRE_GOAL_ACCEPTANCE='1';
 const {pool}=await import('../../packages/db/src/client');
 const {startCommandCenterHttpServer}=await import('../../apps/command-center/src/http');
 let service:Awaited<ReturnType<typeof startCommandCenterHttpServer>>|undefined;
 let poolClosed=false;
 try{
  const scope=(await pool.query('SELECT current_schema() s,current_user r')).rows[0];
  assert.equal(scope.s,c.schema);assert.equal(scope.r,c.role);
  const token='isolated-local-fixture-not-an-external-credential';
  service=await startCommandCenterHttpServer({legalEntityId:c.entity,host:'127.0.0.1',port:0,bearerToken:token,allowedHosts:'127.0.0.1'});
  const address=service.server.address();assert(address&&typeof address!=='string');
  const root='http://127.0.0.1:'+address.port,headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
  assert.equal((await fetch(root+'/api/goals')).status,401);
  const html=await(await fetch(root)).text();assert(html.includes('data-read-only-stage="true"'));assert(!html.includes('<option>YELLOW</option>'));
  const denied=await fetch(root+'/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Sandbox smoke only',authority_ceiling:'YELLOW'})});assert.equal(denied.status,400);
  const created=await fetch(root+'/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Read-only sandbox intake smoke. Do not execute or call a model.'})});
  const body=await created.json() as any;
  if(created.status!==201)throw Error('ISOLATED_INTAKE_FAILED');
  const id=body.data.id;
  const timeline=await(await fetch(root+'/api/goals/'+id+'/timeline',{headers})).json() as any;
  if(!timeline.ok)throw Error('ISOLATED_TIMELINE_FAILED');
  assert.equal(timeline.data.progress.displayState,'NEW');assert.equal(timeline.data.progress.reportVerified,false);
  assert.equal(timeline.data.budget,null);assert.equal(timeline.data.goal.completion_definition,'sam.read_report.v1');
  assert.equal((await fetch(root+'/api/overview',{headers})).status,200);
  const finance=await(await fetch(root+'/api/finance/latest',{headers})).json() as any;assert.equal(finance.data,null);
  await service.close();service=undefined;await pool.end();poolClosed=true;
  const reconnect=new Client({connectionString:c.connectionString,connectionTimeoutMillis:5000});
  try{await reconnect.connect();assert.equal((await reconnect.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0]?.state,'NEW');}
  finally{await reconnect.end();}
  console.log(JSON.stringify({status:'PASS_ISOLATED_COMMAND_CENTER',scopeChecked:true,unauthorizedDenied:true,elevatedAuthorityDenied:true,
   naturalIntakePersisted:true,timelineMatchesDatabase:true,verificationNotInvented:true,budgetUnknownNotZero:true,connectionRestartPersistence:true,
   models:0,externalTools:0,goalExecutionTested:false,browserLayoutTested:false}));
 }finally{await service?.close();if(!poolClosed)await pool.end();}
}
void main().catch(()=>{console.error(JSON.stringify({status:'FAIL_ISOLATED_COMMAND_CENTER',details:'withheld; inspect locally without exporting credentials'}));process.exitCode=1;});
