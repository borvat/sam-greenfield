import {sha256Hex} from '../../packages/shared/src/stableJson';
import {provisionRuntimeAccess} from '../../packages/db/src/runtimeAccess';
import assert from 'node:assert/strict';
import {Client} from 'pg';
import {pool,withTransaction} from '../../packages/db/src/client';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {planNextNewGoal} from '../../apps/production/src/planner';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {runOneSpecialistWork,claimNextWorkForSpecialistAtomic} from '../../apps/agents/src/runtime';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {recoverKernelAfterRestart} from '../../apps/kernel/src/recovery';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {reconcilePendingSideEffects} from '../../apps/tools/src/reconciler';
import {compareReadback} from '../../apps/production/src/contentVerification';
import {validateCandidatePlan} from '../../apps/brain/src/planner';
import {validateEvidence} from '../../apps/kernel/src/verificationEvidence';
import {validateParameters} from '../../packages/tool-gateway/src/validation';
import {GoogleRefreshTokenProvider} from '../../packages/google-auth/src/refreshToken';
import {verifyGmailContent} from '../../apps/production/src/gmailVerifier';
import {deterministicMessageId} from '../../packages/gmail/src/mime';
import {createProductionComposition} from '../../apps/production/src/composition';
import {reconcileBlockedDependencies} from '../../apps/kernel/src/dependencies';
import {beginReplanAtomic} from '../../apps/kernel/src/replanning';

let count=0;function pass(name:string){count++;console.log('PASS',name);}
async function one(sql:string,values:any[]=[]){return (await pool.query(sql,values)).rows[0];}
async function goal(entity:string,objective:string,state='NEW',priority=50){return (await one(`INSERT INTO goals(business_id,company_scope,objective,state,priority,authority_ceiling)
 VALUES($1,$2,$3,$4,$5,'GREEN') RETURNING id`,['core-'+crypto.randomUUID(),entity,objective,state,priority])).id;}
async function main(){
 const org=(await one("INSERT INTO organizations(name) VALUES('Core fixture') RETURNING id")).id;
 const entity=(await one("INSERT INTO legal_entities(org_id,name) VALUES($1,'Tenant A') RETURNING id",[org])).id;
 const other=(await one("INSERT INTO legal_entities(org_id,name) VALUES($1,'Tenant B') RETURNING id",[org])).id;
 await pool.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
 VALUES('fixture','["fixture"]','["planning"]','["INTERNAL"]','HEALTHY',0,0)`);
 await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
 VALUES('echo','Fixture content check','db_query','{"readback":"boolean","value":"number"}','{}')`);
 const prompts:any[]=[];
 let lateResolve:(v:any)=>void=()=>{};
 const adapter={providerId:'fixture',async invoke(task:any){
   prompts.push(task.input);
   if(task.input.objective==='hang')return new Promise<any>(r=>{lateResolve=r;});
   if(task.input.objective==='bad')throw Error('PRIVATE_PROVIDER_TEXT');
   return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{steps:[{capabilityId:'echo',params:{value:1}}]}};
 }};
 const bundle=validateProductionBundle({capabilities:[{capabilityId:'echo',authorityClass:'GREEN',specialistAgentId:'local',specialistVersion:'1',parameters:{type:'object',properties:{value:{type:'number'}},required:['value'],additionalProperties:false}}],
  toolDefinitions:[{capabilityId:'echo',authorityClass:'GREEN',sideEffect:false}],toolAdapters:[{capabilityId:'echo',async execute(r){return {result:{value:r.params.value},evidence:{readback:true}};}}],
  modelAdapters:[adapter],modelProviderConfigs:[{providerId:'fixture',models:['fixture'],capabilities:['planning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:0,costPer1kOutput:0}],
  verificationAdapters:[{capabilityId:'echo',async verify(r){const value=Number(r.execution.result?.value);return {result:value===Number(r.execution.params.value)?'VERIFIED':'FAILED',evidence:{readback:true,value},verifier:'independent'};}}]});
 const bad=await goal(entity,'bad','NEW',100),good=await goal(entity,'good','NEW',1);
 assert.equal((await planNextNewGoal(bundle)).failed,true);
 assert.equal((await planNextNewGoal(bundle)).goalId,good);
 assert.equal((await one('SELECT state FROM goals WHERE id=$1',[good])).state,'EXECUTING');
 const failure=await one('SELECT planning_failure,planning_retry_at>now() delayed FROM goals WHERE id=$1',[bad]);
 assert(failure.delayed);assert(!JSON.stringify(failure).includes('PRIVATE'));pass('planning failure isolation, fairness, persisted backoff and redaction');
 await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=ANY($1::uuid[])",[[bad,good]]);
 const hanging=await goal(entity,'hang');
 assert.equal((await planNextNewGoal(bundle,{deadlineMs:20})).reason,'PLANNING_DEADLINE_EXCEEDED');
 lateResolve({model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{steps:[{capabilityId:'echo',params:{value:9}}]}});
 await new Promise(r=>setTimeout(r,20));assert.equal((await one('SELECT count(*)::int n FROM plans WHERE goal_id=$1',[hanging])).n,0);pass('deadline prevents late plan persistence');
 await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[hanging]);
 const exhausted=await goal(entity,'bad');await planNextNewGoal(bundle,{maxAttempts:1});assert.equal((await one('SELECT state FROM goals WHERE id=$1',[exhausted])).state,'FAILED');pass('planning retry budget');
 assert.throws(()=>validateCandidatePlan({steps:[{capabilityId:'echo',params:7}]}));
 assert.throws(()=>validateCandidatePlan({steps:[{stepKey:'a',capabilityId:'echo',dependsOn:['b']},{stepKey:'b',capabilityId:'echo',dependsOn:['a']}]}));
 assert.throws(()=>validateParameters(bundle.catalog.get('echo').parameters,{value:'wrong'}));pass('malformed parameters and dependency cycles rejected');
 const dag=await goal(entity,'ordered','PLANNING');
 const plan=await persistPlanAndDelegateAtomic({goalId:dag,steps:[{stepKey:'research',capabilityId:'echo',params:{value:7}},
  {stepKey:'analysis',capabilityId:'echo',params:{},dependsOn:['research'],resultRefs:{value:{step:'research',path:['value'],type:'number'}}},
  {stepKey:'verify',capabilityId:'echo',params:{},dependsOn:['analysis'],resultRefs:{value:{step:'analysis',path:['value'],type:'number'}}}]});
 const agent=bundle.catalog.specialists.getAgent('local'),executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
 const first=await runOneSpecialistWork({agent,workerInstanceId:'before-restart',ttlSeconds:1,executors});
 assert.equal(first.queueId,plan.queueIds[0]);assert.equal(await claimNextWorkForSpecialistAtomic(agent,'blocked',1),null);
 await verifyNextExecution(bundle);await recoverKernelAfterRestart();
 for(let i=1;i<3;i++){const next=await runOneSpecialistWork({agent,workerInstanceId:'after-restart',ttlSeconds:1,executors});assert.equal(next.queueId,plan.queueIds[i]);await verifyNextExecution(bundle);}
 assert.equal((await one('SELECT state FROM goals WHERE id=$1',[dag])).state,'COMPLETED');
 assert.equal((await one("SELECT count(*)::int n FROM executions WHERE goal_id=$1 AND params->>'value'='7'",[dag])).n,3);pass('dependency ordering, independent verification, typed propagation and restart');
 const invalid=await goal(entity,'invalid-reference','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:invalid,steps:[{stepKey:'source',capabilityId:'echo',params:{value:2}},
   {stepKey:'consumer',capabilityId:'echo',dependsOn:['source'],resultRefs:{value:{step:'source',path:['value'],type:'string'}}}]});
 await runOneSpecialistWork({agent,workerInstanceId:'source',ttlSeconds:10,executors});await verifyNextExecution(bundle);
 assert.equal(await claimNextWorkForSpecialistAtomic(agent,'bad-type',10),null);
 assert.equal((await one('SELECT state FROM goals WHERE id=$1',[invalid])).state,'FAILED');
 const cancelled=await goal(entity,'cancelled-prerequisite','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:cancelled,steps:[{stepKey:'a',capabilityId:'echo',params:{value:1}},{stepKey:'b',capabilityId:'echo',dependsOn:['a'],params:{value:2}}]});
 await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[cancelled]);await reconcileBlockedDependencies();
 assert.equal(await claimNextWorkForSpecialistAtomic(agent,'cancelled',10),null);
 assert.equal((await one("SELECT count(*)::int n FROM work_queue WHERE goal_id=$1 AND status='FAILED'",[cancelled])).n,2);
 pass('invalid result types fail durably; cancelled prerequisites never execute');
 const replan=await goal(entity,'replan-evidence','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:replan,steps:[{capabilityId:'echo',params:{value:5}}]});
 await runOneSpecialistWork({agent,workerInstanceId:'wrong',ttlSeconds:10,executors:{echo:async()=>({result:{value:999},evidence:{readback:true}})}});
 await verifyNextExecution(bundle);await planNextNewGoal(bundle);
 const latest=prompts.at(-1);assert(latest.context.previousPlan);assert.equal(latest.context.executionEvidence[0].verification_result,'FAILED');
 await pool.query("UPDATE goals SET state='REPLANNING',replan_attempts=2 WHERE id=$1",[replan]);
 assert.equal(await beginReplanAtomic(replan,'budget-test'),'FAILED');await reconcileBlockedDependencies();
 pass('replanner receives prior plan/failure evidence; replan budget enforced');
 assert.equal(compareReadback({value:1},{value:2},'independent').result,'FAILED');
 assert.equal(compareReadback(undefined,{value:1},'independent').result,'INCONCLUSIVE');
 assert.throws(()=>validateEvidence({readback:'boolean',value:'number'},{readback:true}));
 assert.throws(()=>validateEvidence({readback:'boolean'},{readback:false}));pass('HTTP/readback success is insufficient; typed and contradictory evidence rejected');
 const key='test-operation',params={to:'owner@example.test',subject:'Result',text:'correct'};
 const message={labelIds:['SENT'],payload:{mimeType:'text/plain',headers:[{name:'To',value:params.to},{name:'Subject',value:params.subject},{name:'Message-ID',value:deterministicMessageId(key)},{name:'X-SAM-Operation-Key',value:key}],body:{data:Buffer.from('wrong').toString('base64url')}}};
 assert.equal(verifyGmailContent(message,params,key).result,'FAILED');message.payload.body.data=Buffer.from('correct').toString('base64url');assert.equal(verifyGmailContent(message,params,key).result,'VERIFIED');pass('Gmail verifies intended content, not message existence');
 // A process boundary after ACT is covered by crashChild below; provider fixture
 // persists its send count in PostgreSQL before terminating without a receipt.
 const sideGoal=await goal(entity,'uncertain','PLANNING');
 const sideBundle=validateProductionBundle({capabilities:[{capabilityId:'side',authorityClass:'YELLOW',specialistAgentId:'side-agent',specialistVersion:'1'}],toolDefinitions:[{capabilityId:'side',authorityClass:'YELLOW',sideEffect:true}],toolAdapters:[{capabilityId:'side',async execute(){throw Error('unreachable');},async reconcile(){return {result:'CONFIRMED',evidence:{provider_message_id:'fixture-provider'}};}} as any]});
 await pool.query("UPDATE goals SET authority_ceiling='YELLOW' WHERE id=$1",[sideGoal]);
 await pool.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,max_uses,authority_class,status)
  VALUES($1,'side',$2,$3,now()+interval '1 hour',1,'YELLOW','APPROVED')`,[sideGoal,sha256Hex({value:1}),entity]);
 const sidePlan=await persistPlanAndDelegateAtomic({goalId:sideGoal,steps:[{capabilityId:'side',params:{value:1}}]});
 const {spawnSync}=await import('node:child_process');
 const child=spawnSync(process.execPath,['--import','tsx','tests/core/crashChild.ts'],{env:{PATH:process.env.PATH,DATABASE_URL:process.env.DATABASE_URL!,TEST_GOAL_ID:sideGoal},encoding:'utf8'});
 assert.equal(child.status,72,child.stderr);
 assert.equal((await one('SELECT used_count FROM approvals WHERE goal_id=$1',[sideGoal])).used_count,1);
 await new Promise(r=>setTimeout(r,1100));await recoverKernelAfterRestart();
 assert.equal((await reconcilePendingSideEffects({tools:sideBundle.tools})).confirmed,1);
 const sideExecutors=createToolExecutors({catalog:sideBundle.catalog,tools:sideBundle.tools});
 await runOneSpecialistWork({agent:sideBundle.catalog.specialists.getAgent('side-agent'),workerInstanceId:'recovered',ttlSeconds:10,executors:sideExecutors});
 assert.equal((await one("SELECT count(*)::int n FROM audit_log WHERE action='FIXTURE_PROVIDER_SENT' AND goal_id=$1",[sideGoal])).n,1);
 assert.equal((await one('SELECT count(*)::int n FROM executions WHERE goal_id=$1',[sideGoal])).n,1);
 // New plan of the same business intent must reuse the ledger key.
 await pool.query("UPDATE goals SET state='PLANNING' WHERE id=$1",[sideGoal]);
 await persistPlanAndDelegateAtomic({goalId:sideGoal,steps:[{capabilityId:'side',params:{value:1}}]});
 await runOneSpecialistWork({agent:sideBundle.catalog.specialists.getAgent('side-agent'),workerInstanceId:'replanned',ttlSeconds:10,executors:sideExecutors});
 assert.equal((await one('SELECT count(*)::int n FROM side_effect_operations WHERE goal_id=$1',[sideGoal])).n,1);pass('real process crash after ACT, reconciliation, no resend across restart/replan');
 const uncertain=await goal(entity,'unknown-outcome','PLANNING');
 await pool.query("UPDATE goals SET authority_ceiling='YELLOW' WHERE id=$1",[uncertain]);
 await pool.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,max_uses,authority_class,status)
  VALUES($1,'side',$2,$3,now()+interval '1 hour',1,'YELLOW','APPROVED')`,[uncertain,sha256Hex({value:2}),entity]);
 await persistPlanAndDelegateAtomic({goalId:uncertain,steps:[{capabilityId:'side',params:{value:2}}]});
 let sends=0;
 const unknownBundle=validateProductionBundle({...sideBundle.raw,toolAdapters:[{capabilityId:'side',async execute(){sends++;throw Error('simulated lost receipt');},async reconcile(){return {result:'NOT_FOUND',evidence:{reason:'provider_cannot_determine'}};}} as any]});
 const unknownExecutors=createToolExecutors({catalog:unknownBundle.catalog,tools:unknownBundle.tools});
 await assert.rejects(()=>runOneSpecialistWork({agent:unknownBundle.catalog.specialists.getAgent('side-agent'),workerInstanceId:'unknown',ttlSeconds:1,executors:unknownExecutors}));
 await new Promise(r=>setTimeout(r,1100));await recoverKernelAfterRestart();await reconcilePendingSideEffects({tools:unknownBundle.tools});
 assert.equal((await one('SELECT state FROM goals WHERE id=$1',[uncertain])).state,'WAITING_OWNER');
 assert.equal((await runOneSpecialistWork({agent:unknownBundle.catalog.specialists.getAgent('side-agent'),workerInstanceId:'no-resend',ttlSeconds:10,executors:unknownExecutors})).processed,false);assert.equal(sends,1);
 pass('unknown side effects escalate to owner without resending');
 const composition=createProductionComposition({bundle,workerId:'event-test'});await composition.runWorkTick();
 assert.equal((await one("SELECT count(*)::int n FROM outbox_events WHERE status='PENDING'")).n,0);pass('production outbox relay and event consumption');
 // Database identities are disposable fixtures, never production bindings.
 const role='sam_core_app_'+process.pid,schema=(await one('SELECT current_schema() s')).s;
 assert(/^core_[0-9_]+$/.test(schema));assert(/^sam_core_app_[0-9]+$/.test(role));
 await pool.query(`CREATE ROLE ${role} LOGIN PASSWORD 'local-fixture-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);
 let app:Client|undefined;
 try{
  await withTransaction(client=>provisionRuntimeAccess(client,{schema,role,orgId:org,legalEntityId:entity}));
  const foreign=await goal(other,'foreign');
  const uri=new URL(process.env.DATABASE_URL!);uri.username=role;uri.password='local-fixture-only';
  app=new Client({connectionString:uri.href});await app.connect();
  await app.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[org,entity]);
  assert.equal((await app.query('SELECT * FROM goals WHERE id=$1',[foreign])).rowCount,0);
  assert.equal((await app.query('SELECT * FROM legal_entities WHERE id=$1',[other])).rowCount,0);
  assert.equal((await app.query('SELECT * FROM goals WHERE id=$1',[dag])).rowCount,1);
  await assert.rejects(()=>app!.query("UPDATE goals SET company_scope=$1 WHERE id=$2",[other,dag]));
  const scoped=new URL(uri);scoped.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const restricted=spawnSync(process.execPath,['--import','tsx','tests/core/restrictedChild.ts'],{env:{PATH:process.env.PATH,DATABASE_URL:scoped.href,NODE_ENV:'test'},encoding:'utf8'});
  assert.equal(restricted.status,0,restricted.stderr);
  await app.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[other]);assert.equal((await app.query('SELECT * FROM goals')).rowCount,0);
  await app.query("SELECT set_config('app.current_legal_entity_id','',false)");assert.equal((await app.query('SELECT * FROM work_queue')).rowCount,0);
  await assert.rejects(()=>app!.query('UPDATE model_providers SET health=\'DOWN\''));
  const attrs=(await app.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];assert.equal(attrs.rolsuper,false);assert.equal(attrs.rolbypassrls,false);
  pass('separate app identity, negative tenant/missing/spoofed-context tests and protected registry writes');
 }finally{await app?.end();await pool.query(`DROP OWNED BY ${role}`);await pool.query(`DROP ROLE ${role}`);}
 const revoked=await goal(entity,'lease-limit','PLANNING');const limited=await persistPlanAndDelegateAtomic({goalId:revoked,steps:[{capabilityId:'echo',params:{value:1}}]});
 process.env.SAM_WORK_LEASE_MAX_ATTEMPTS='1';await claimNextWorkForSpecialistAtomic(agent,'crash',1);await new Promise(r=>setTimeout(r,1100));await recoverKernelAfterRestart();assert.equal((await one('SELECT status FROM work_queue WHERE id=$1',[limited.queueIds[0]])).status,'FAILED');delete process.env.SAM_WORK_LEASE_MAX_ATTEMPTS;pass('specialist lease attempt exhaustion');
 await assert.rejects(()=>new GoogleRefreshTokenProvider({clientId:'fixture',clientSecret:'fixture',refreshToken:'fixture',timeoutMs:10,fetchImpl:async(_u,init)=>new Promise((_r,reject)=>init!.signal!.addEventListener('abort',()=>reject(new Error('aborted'))))}).getAccessToken());pass('external OAuth request deadline');
 console.log('CORE_RELIABILITY',count,'checks passed; fixtures only; zero external provider calls');
}
main().then(()=>pool.end()).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
