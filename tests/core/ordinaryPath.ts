import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {createChatGPTToolSurface} from '../../apps/chatgpt-tools/src/surface';
import {createKernelProductionDispatcher} from '../../apps/production/src/dispatcher';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {startMcpHttpServer} from '../../apps/mcp/src/http';
import {startRuntimeService} from '../../apps/runtime/src/service';
import build,{objectives} from './ordinaryFixture';

async function worker(){
 const lifecycle=process.env.FIXTURE_LIFECYCLE;const bundle=build(),surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(validateProductionBundle(bundle))});
 const server=await startMcpHttpServer({surface,actor:'ordinary-fixture-owner',port:0,host:'127.0.0.1',bearerToken:'local-transport-only',allowedHosts:['127.0.0.1']});
 const address=server.server.address();assert(address&&typeof address!=='string');
 const client=new Client({name:'ordinary-path-fixture',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 let service:Awaited<ReturnType<typeof startRuntimeService>>|undefined;
 try{
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`),{requestInit:{headers:{Authorization:'Bearer local-transport-only'}}}));
  const denied:any=await client.callTool({name:'sam_submit_goal',arguments:{objective:'Read a different tenant',legal_entity_id:process.env.FIXTURE_FOREIGN_ENTITY}});
  assert(denied.isError||JSON.stringify(denied).includes('Legal entity not found'),JSON.stringify(denied));
  assert.equal((await pool.query('SELECT count(*)::int n FROM goals WHERE company_scope=$1',[process.env.FIXTURE_FOREIGN_ENTITY])).rows[0].n,0);
  const previous=(await pool.query("SELECT id FROM goals WHERE domain='chatgpt_goal_submission'")).rows;
  if(!previous.length)for(const objective of ((process.env.FIXTURE_ZERO_TOOLS==='1'||process.env.FIXTURE_CANCEL_ON_RETURN==='1'||process.env.FIXTURE_REVOKE_ON_REVIEW==='1'||process.env.FIXTURE_UNKNOWN_UNIT==='1'||Boolean(lifecycle))?objectives.slice(0,1):objectives)){const result:any=await client.callTool({name:'sam_submit_goal',arguments:{objective,legal_entity_id:process.env.FIXTURE_ENTITY}});assert(!result.isError,JSON.stringify(result));}
  const roots=(await pool.query("SELECT id,parent_goal_id,state FROM goals WHERE domain='chatgpt_goal_submission'")).rows;assert.equal(roots.length,(process.env.FIXTURE_ZERO_TOOLS==='1'||process.env.FIXTURE_CANCEL_ON_RETURN==='1'||process.env.FIXTURE_REVOKE_ON_REVIEW==='1'||process.env.FIXTURE_UNKNOWN_UNIT==='1'||Boolean(lifecycle))?1:3);assert(roots.every(g=>g.parent_goal_id===null&&(previous.length>0||g.state==='NEW')));
  // The same module selected by ordinary SAM startup; only bundle transports
  // and synthetic records differ. No EvaluationTrial or coordinator is created.
  if(process.env.FIXTURE_MISSING_REGISTRATION==='1'){await assert.rejects(import('../../apps/runtime/src/productionCompositionModule').then(m=>m.default),/ORDINARY_VERIFICATION_REGISTRATION_REQUIRED/);assert.equal((await pool.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,0);console.log('PASS ordinary startup refuses missing registration before model/source dispatch');return;}
  if(lifecycle?.startsWith('limit-')){await assert.rejects(import('../../apps/runtime/src/productionCompositionModule').then(m=>m.default),/ORDINARY_SPECIALIST_READ_LIMIT_MISMATCH/);assert.equal((await pool.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,0);console.log('PASS incompatible specialist read limits rejected before dispatch');return;}
  const composition=await (await import('../../apps/runtime/src/productionCompositionModule')).default;
  let failure:unknown,ticks=0,done=false;
  service=await startRuntimeService({port:0,host:'127.0.0.1',tickIntervalMs:10,composition:{...composition,async runWorkTick(){
   if(done)return {processed:false};try{const r=await composition.runWorkTick();if((r as any)?.processed!==false)ticks++;const rows=(await pool.query('SELECT id,state,next_wake_at FROM goals WHERE id=ANY($1::uuid[])',[roots.map(g=>g.id)])).rows;
    if(process.env.FIXTURE_CRASH_WHEN_WAITING==='1'&&rows.some(g=>g.state==='WAITING_EXTERNAL'&&g.next_wake_at)){console.log('ORDINARY_WAITING_REVIEW_CRASH_BARRIER');await new Promise(()=>{});}
    const reported=(await pool.query('SELECT goal_id FROM goal_read_reviews')).rows.map(r=>r.goal_id);
    done=rows.every(g=>['COMPLETED','FAILED','CANCELLED','BLOCKED'].includes(g.state)||g.state==='WAITING_EXTERNAL'&&reported.includes(g.id));if(ticks>(lifecycle==='planner-failure'||lifecycle==='source-failure'?12:180))throw Error('ORDINARY_FIXTURE_TICK_LIMIT');return r;
   }catch(e){failure=e;done=true;throw e;}
  }}});
  const deadline=Date.now()+160000;while(!done&&Date.now()<deadline)await new Promise(r=>setTimeout(r,25));assert(done,'ordinary service timed out');if(failure&&process.env.FIXTURE_CANCEL_ON_RETURN!=='1')throw failure;
  const rows=(await pool.query('SELECT id,state FROM goals WHERE id=ANY($1::uuid[])',[roots.map(g=>g.id)])).rows;
  if(lifecycle==='planner-failure'||lifecycle==='source-failure'||lifecycle==='review-expiry'){
   assert(rows.every(g=>g.state==='FAILED'),JSON.stringify(rows));
   assert.equal((await pool.query("SELECT count(*)::int n FROM work_queue WHERE status IN ('LEASED','EXECUTING','QUEUED','HANDBACK')")).rows[0].n,0);
   if(lifecycle==='planner-failure'){assert.equal((await pool.query('SELECT planning_attempts FROM goals WHERE id=$1',[roots[0].id])).rows[0].planning_attempts,3);assert.equal((await pool.query('SELECT count(*)::int n FROM plans')).rows[0].n,0);}
   else {const reports=(await pool.query('SELECT decision FROM goal_read_reviews WHERE goal_id=$1',[roots[0].id])).rows;assert.equal(reports.length,1);assert.equal(reports[0].decision.status,'blocked');assert(reports[0].decision.requirements.every((r:any)=>!r.fulfilled));}
   console.log('PASS ordinary lifecycle failure commits, fences work and persists honest outcome',lifecycle);return;
  }
  if(lifecycle==='review-cancel-waiting'){assert(rows.every(g=>g.state==='CANCELLED'));assert.equal((await pool.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);console.log('PASS cancellation while waiting prevents wake and report');return;}
  if(lifecycle==='review-wake'){
   assert(rows.every(g=>g.state==='COMPLETED'));assert.equal((await pool.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,1);
   assert.equal((await pool.query("SELECT count(*)::int n FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'type'='OPEN'")).rows[0].n,1);
   assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE capability_id='records.search'")).rows[0].n,1);
   assert.equal((await pool.query("SELECT count(*)::int n FROM plans WHERE goal_id=$1",[roots[0].id])).rows[0].n,1);
   console.log('PASS scheduled review continuation reuses original allowance, plan and verified reads');return;
  }
  if(process.env.FIXTURE_REVOKE_ON_REVIEW==='1'||process.env.FIXTURE_UNKNOWN_UNIT==='1'){assert(rows.every(g=>['WAITING_EXTERNAL','BLOCKED','FAILED'].includes(g.state)));const reports=(await pool.query('SELECT decision FROM goal_read_reviews')).rows;assert(reports.every(r=>r.decision.status!=='complete'));if(process.env.FIXTURE_UNKNOWN_UNIT==='1'){assert(reports.length);assert(reports.every(r=>r.decision.requirements.every((q:any)=>!q.fulfilled)));}console.log('PASS ordinary unknown semantics or revoked raw receipt cannot complete the objective');return;}
  if(process.env.FIXTURE_CANCEL_ON_RETURN==='1'){assert(rows.every(g=>g.state==='CANCELLED'));assert.equal((await pool.query('SELECT count(*)::int n FROM plans')).rows[0].n,0);assert.equal((await pool.query('SELECT count(*)::int n FROM executions')).rows[0].n,0);assert.equal((await pool.query("SELECT count(*)::int n FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'kind'='model' AND after_ref->>'type'='RESERVED'")).rows[0].n,1);console.log('PASS ordinary cancellation between model response and plan commit preserves charged reservation and prevents execution');return;}
  if(process.env.FIXTURE_ZERO_TOOLS==='1'){assert(rows.every(g=>g.state==='FAILED'),JSON.stringify(rows));assert.equal((await pool.query('SELECT count(*)::int n FROM executions')).rows[0].n,0);console.log('PASS ordinary zero tool allowance denies dispatch and terminalizes actual executing owner');return;}
  if(!rows.every(g=>g.state==='COMPLETED'))console.error('ORDINARY_REPORTS',JSON.stringify((await pool.query('SELECT goal_id,decision FROM goal_read_reviews')).rows));
  assert(rows.every(g=>g.state==='COMPLETED'),JSON.stringify(rows));
  const reports=(await pool.query("SELECT * FROM goal_read_reviews WHERE goal_id=ANY($1::uuid[]) AND decision->>'status'='complete'",[roots.map(g=>g.id)])).rows;assert.equal(reports.length,3);
  assert((await pool.query('SELECT count(*)::int n FROM specialist_delegations')).rows[0].n>=10);
  assert.equal((await pool.query('SELECT count(DISTINCT agent_id)::int n FROM specialist_sessions')).rows[0].n,2,'two reasoning specialists beyond executive planning');
  assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE capability_id NOT LIKE 'reason.%' AND NOT (evidence ? 'ordinaryAllowance')")).rows[0].n,0,'persisted tool results retain durable reservation references');
  assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE capability_id='derive_verified_evidence' AND status='EXECUTED'")).rows[0].n,3);
  assert.equal((await pool.query("SELECT count(*)::int n FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'type'='OPEN'")).rows[0].n,3);
  assert.equal((await pool.query("SELECT to_regclass('evaluation_trials') id")).rows[0].id,null);
  console.log('PASS actual ordinary startup / authenticated MCP submission / restricted role / three executing roots / delegation / derived report; fixtures do not prove autonomy');
 }finally{await service?.stop();await client.close();await server.close();}
}
async function parent(){
 const c=await pool.connect(),role='sam_ordinary_'+process.pid;let made=false;
 try{
  await applyIntegrationProfile(c);await applySpecialistProfile(c);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s,org=randomUUID(),entity=randomUUID(),foreignOrg=randomUUID(),foreignEntity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Isolated ordinary fixture')",[org]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Isolated ordinary fixture')",[entity,org]);
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Foreign isolated fixture')",[foreignOrg]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Foreign isolated fixture')",[foreignEntity,foreignOrg]);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'ordinary-fixture-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);made=true;
  await c.query('BEGIN');await provisionIntegrationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output) VALUES('deepseek','["deepseek-flash"]','["planning","specialist_reasoning"]','["INTERNAL"]','HEALTHY',0.001,0.001)`);
  for(const [id,fields,method] of [['records.search',{readback:'boolean'},{}],['derive_verified_evidence',{replayed:'boolean'},{method:'verified-evidence-replay-v1'}],['reason.records',{grounded:'boolean'},{method:'ordinary-specialist-pointer-replay-v1'}],['reason.research',{grounded:'boolean'},{method:'ordinary-specialist-pointer-replay-v1'}]] as const)
   await c.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result) VALUES($1,'Isolated registration','db_query',$2,$3,true)",[id,fields,method]);
  if(process.env.FIXTURE_MISSING_REGISTRATION==='1')await c.query("DELETE FROM verification_contracts WHERE capability_id='derive_verified_evidence'");
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='ordinary-fixture-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity} -c jit=off`);
  const untouched:string[]=[];
  if(process.env.FIXTURE_LIFECYCLE?.startsWith('review-'))for(const marked of [false,true]){
   const id=randomUUID();untouched.push(id);
   await c.query("INSERT INTO goals(id,business_id,company_scope,objective,state,authority_ceiling,completion_definition,domain,next_wake_at) VALUES($1::uuid,$1::text,$2,'Existing waiting goal','WAITING_EXTERNAL','GREEN','sam.read_report.v1','legacy_fixture',now()-interval '1 minute')",[id,entity]);
   if(marked)await c.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result,after_ref) VALUES('fixture',$1,'SAM_GOAL_SUBMITTED','sam_mcp','GREEN','CREATED','{"ordinaryGeneralAgentV1":true}')`,[id]);
  }
  const env={FIXTURE_LIFECYCLE:process.env.FIXTURE_LIFECYCLE,PATH:process.env.PATH,NODE_ENV:'test',DATABASE_URL:target.href,FIXTURE_ENTITY:entity,FIXTURE_FOREIGN_ENTITY:foreignEntity,SAM_WORKER_ID:'ordinary-fixture',SAM_ORDINARY_GENERAL_AGENT:'1',SAM_SPECIALIST_INTELLIGENCE:'ordinary',SAM_INTEGRATION_ENABLED:'1',SAM_KNOWLEDGE_ENABLED:'true',SAM_PRODUCTION_BUNDLE_MODULE:resolve('tests/core/ordinaryFixture.ts'),...(process.argv[2]==='zero-tools'||process.env.FIXTURE_ZERO_TOOLS==='1'?{FIXTURE_ZERO_TOOLS:'1'}:{}),...(process.env.FIXTURE_MISSING_REGISTRATION==='1'?{FIXTURE_MISSING_REGISTRATION:'1'}:{}),...(process.env.FIXTURE_CANCEL_ON_RETURN==='1'?{FIXTURE_CANCEL_ON_RETURN:'1'}:{}),...(process.env.FIXTURE_REVOKE_ON_REVIEW==='1'?{FIXTURE_REVOKE_ON_REVIEW:'1'}:{}),...(process.env.FIXTURE_UNKNOWN_UNIT==='1'?{FIXTURE_UNKNOWN_UNIT:'1'}:{})};
  async function run(environment:typeof env&{FIXTURE_CRASH_ON_MODEL?:string;FIXTURE_CRASH_WHEN_WAITING?:string},crash=false){
   const child=spawn(process.execPath,['--import','tsx','tests/core/ordinaryPath.ts','worker'],{env:environment,stdio:['ignore','pipe','pipe']});let log='';child.stdout.on('data',b=>{log+=b;process.stdout.write(b);});child.stderr.on('data',b=>{log+=b;process.stderr.write(b);});
   const completion=new Promise(r=>child.once('close',r));const timer=setTimeout(()=>child.kill('SIGKILL'),170000);
   if(crash){const barrier=environment.FIXTURE_CRASH_WHEN_WAITING==='1'?'ORDINARY_WAITING_REVIEW_CRASH_BARRIER':'ORDINARY_RESERVED_MODEL_CRASH_BARRIER';const until=Date.now()+100000;while(!log.includes(barrier)&&child.exitCode===null&&Date.now()<until)await new Promise(r=>setTimeout(r,20));const ready=log.includes(barrier);child.kill('SIGKILL');await completion;clearTimeout(timer);assert(ready,log);return;}
   const exit=await completion;clearTimeout(timer);assert.equal(exit,0,log);
  }
  if(['review-wake','review-cancel-waiting'].includes(process.env.FIXTURE_LIFECYCLE??'')){
   await run({...env,FIXTURE_CRASH_WHEN_WAITING:'1'},true);
   const before=(await c.query("SELECT after_ref FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'type'='OPEN'")).rows[0].after_ref;
   const charged=(await c.query("SELECT count(*)::int n FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'kind'='model'")).rows[0].n;
   if(process.env.FIXTURE_LIFECYCLE==='review-cancel-waiting')await c.query("UPDATE goals SET state='CANCELLED' WHERE domain='chatgpt_goal_submission'");
   await run(env);
   if(process.env.FIXTURE_LIFECYCLE==='review-cancel-waiting')assert.equal((await c.query("SELECT count(*)::int n FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'kind'='model'")).rows[0].n,charged);
   const after=(await c.query("SELECT after_ref FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'type'='OPEN'")).rows;assert.equal(after.length,1);assert.deepEqual(after[0].after_ref,before);
   console.log('PASS restart while review is waiting retains original deadline and allowance');
  }else if(process.env.FIXTURE_RESTART==='1'){
   await run({...env,FIXTURE_CRASH_ON_MODEL:'1'},true);
   const before=(await c.query("SELECT after_ref FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'type'='RESERVED' AND after_ref->>'kind'='model'")).rows;assert.equal(before.length,1);
   if(process.env.FIXTURE_CONCURRENT==='1')await Promise.all([run({...env,SAM_WORKER_ID:'ordinary-fixture-a'}),run({...env,SAM_WORKER_ID:'ordinary-fixture-b'})]);else await run(env);
   const surviving=(await c.query("SELECT after_ref FROM audit_log WHERE action='ORDINARY_GOAL_ALLOWANCE_V1' AND after_ref->>'ticket'=$1",[before[0].after_ref.ticket])).rows;
   assert(surviving.some(r=>r.after_ref.type==='INVOKING'));assert(!surviving.some(r=>r.after_ref.type==='FINISHED'),'killed provider remains uncertain, not refunded');
   assert.equal((await c.query('SELECT count(*)::int-count(DISTINCT queue_id)::int duplicates FROM executions')).rows[0].duplicates,0);
   console.log('PASS ordinary SIGKILL/restart preserves uncertain model reservation and creates no duplicate execution');
  }else await run(env);
  for(const id of untouched){assert.equal((await c.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state,'WAITING_EXTERNAL');assert.equal((await c.query("SELECT count(*)::int n FROM audit_log WHERE goal_id=$1 AND action='ORDINARY_GOAL_ALLOWANCE_V1'",[id])).rows[0].n,0);assert.equal((await c.query('SELECT count(*)::int n FROM plans WHERE goal_id=$1',[id])).rows[0].n,0);}
  if(untouched.length)console.log('PASS no automatic adoption of old waiting goals or waiting goals without an existing allowance');
  if(process.env.SAM_VERIFICATION_ARTIFACT_DIR==='/evidence'){
   const tables:Record<string,unknown>={};for(const table of ['goals','plans','work_queue','executions','verifications','goal_read_reviews','audit_log','model_calls','specialist_sessions','specialist_delegations','specialist_budgets'])tables[table]=(await c.query('SELECT * FROM '+table)).rows;
   const variant=process.env.FIXTURE_LIFECYCLE??(process.env.FIXTURE_RESTART==='1'?'restart-concurrent':process.env.FIXTURE_ZERO_TOOLS==='1'?'zero-tools':process.env.FIXTURE_CANCEL_ON_RETURN==='1'?'cancel':process.env.FIXTURE_REVOKE_ON_REVIEW==='1'?'revocation':process.env.FIXTURE_UNKNOWN_UNIT==='1'?'unknown':process.env.FIXTURE_MISSING_REGISTRATION==='1'?'missing-registration':'nominal');
   writeFileSync(join('/evidence','ordinary-'+variant+'.json'),JSON.stringify({classification:'ISOLATED_SYNTHETIC_TRANSPORTS_NOT_MODEL_AUTONOMY',sourceCommit:process.env.SAM_VERIFICATION_SOURCE_SHA??null,variant,tables},null,2)+'\n');
  }
 }finally{c.release();if(made){await pool.query('DROP OWNED BY '+role);await pool.query('DROP ROLE '+role);}}
}
(process.argv[2]==='worker'?worker():parent()).then(()=>pool.end()).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
