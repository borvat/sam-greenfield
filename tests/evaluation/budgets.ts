import {contentHash} from '../../apps/agents/src/evaluation/harness';
import assert from 'node:assert/strict';
import {randomUUID,generateKeyPairSync} from 'node:crypto';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {pool,withTransaction} from '../../packages/db/src/client';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {provisionRuntimeAccess} from '../../packages/db/src/runtimeAccess';
import {createEvaluationTrial,openEvaluationTrial,zero,type TrialSpec} from '../../apps/agents/src/evaluation/trial';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {publicCases} from '../../apps/agents/src/evaluation/cases';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {ModelGateway} from '../../packages/model-gateway/src/gateway';
import {fixtureEvaluationAdapter} from '../../packages/model-gateway/src/evaluationAdapter';
import {sealEvaluationTrial,exportEvaluationTrace} from '../../apps/agents/src/evaluation/capture';
import {scoreAuthenticatedEvaluation} from '../../apps/agents/src/evaluation/trace';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
const task={task:'executive_planning',capability:'planning',dataClassification:'INTERNAL' as const,input:{objective:'Synthetic bounded objective'}};
const reply=()=>({model:'fixture',usage:{inputTokens:5,outputTokens:10},output:{steps:[{capabilityId:'specialist.executive',params:{objective:'Synthetic bounded objective'}}]}});
async function worker(){
 const trials=JSON.parse(process.env.FIXTURE_TRIALS!);let calls=0;
 const good=fixtureEvaluationAdapter('eval-a',async()=>{calls++;return reply();});
 const gateway=new ModelGateway({'eval-a':good});
 const run=async(name:string)=>{const t=await openEvaluationTrial(trials[name].id);return {t,call:()=>t.gateway(gateway,t.rootGoalId,'executive-bootstrap').invoke(task)};};
 if(process.argv[2]==='admission'){await assert.rejects(()=>openEvaluationTrial(trials.scope.id),/MIGRATION_REQUIRED|FIXED_POLICY_REQUIRED/);console.log('PASS evaluation profile receipt/fence admission fails closed');return;}
 if(process.argv[2]==='crash'){
  const {t}=await run('crash');const hanging=fixtureEvaluationAdapter('eval-b',async()=>{console.log('TRIAL_ATTEMPT_RESERVED');return new Promise(()=>{});});
  await t.gateway(new ModelGateway({'eval-b':hanging}),t.rootGoalId,'executive-bootstrap').invoke({...task,preferredProviders:['eval-b']});return;
 }
 if(process.argv[2]==='recover'){
  const {t}=await run('crash');await assert.rejects(()=>t.gateway(new ModelGateway({'eval-b':fixtureEvaluationAdapter('eval-b',async()=>{calls++;return reply();})}),t.rootGoalId,'executive-bootstrap').invoke({...task,preferredProviders:['eval-b']}),/BUDGET_EXHAUSTED/);assert.equal(calls,0);console.log('PASS restart cannot reset uncertain bootstrap reservation');return;
 }
 const cap=await run('model');await cap.call();await assert.rejects(cap.call,/BUDGET_EXHAUSTED/);assert.equal(calls,1);
 await pool.query("UPDATE goals SET state='REPLANNING',planning_attempts=0 WHERE id=$1",[cap.t.rootGoalId]);
 const reopened=await run('model');await assert.rejects(reopened.call,/BUDGET_EXHAUSTED/);assert.equal(calls,1);
 await assert.rejects(()=>withTransaction(async c=>{
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s;
  await c.query('CREATE TEMP TABLE evaluation_trials AS SELECT * FROM evaluation_trials WHERE false');
  await c.query("SELECT set_config('search_path',$1,true)",['pg_temp,'+schema+',public']);
  await cap.t.reserve(c,{goalId:cap.t.rootGoalId,agentId:'executive-bootstrap',delta:{models:1},kind:'model'});
 }),/BUDGET_EXHAUSTED/,'temporary shadow table must not replace the real exhausted ledger');
 const agentTime=await run('agent-time');await withTransaction(c=>agentTime.t.reserve(c,{goalId:agentTime.t.rootGoalId,agentId:'executive-bootstrap',delta:{iterations:1},kind:'iteration'}));
 await new Promise(r=>setTimeout(r,80));await assert.rejects(agentTime.call,/AGENT_TIME_EXHAUSTED/);
 for(const name of ['tokens','cost','iterations','agent','expired']){const bounded=await run(name);const before:number=calls;await assert.rejects(bounded.call);assert.equal(calls,before,name+' must deny before provider');}
 const cancelled=await run('cancel');await cancelled.t.cancel();const beforeCancel=calls;await assert.rejects(cancelled.call);assert.equal(calls,beforeCancel);
 const fallbackA=fixtureEvaluationAdapter('eval-a',async()=>{calls++;throw Error('FIXTURE_UNKNOWN_PROVIDER_OUTCOME');});
 const fallbackB=fixtureEvaluationAdapter('eval-b',async()=>{calls++;return reply();});
 const fallback=new ModelGateway({'eval-a':fallbackA,'eval-b':fallbackB});
 const f=await run('fallback');const start=calls;await f.t.gateway(fallback,f.t.rootGoalId,'executive-bootstrap').invoke(task);assert.equal(calls-start,2);
 const exhausted=await run('fallback-exhausted'),prior=calls;await assert.rejects(()=>exhausted.t.gateway(fallback,exhausted.t.rootGoalId,'executive-bootstrap').invoke(task),/BUDGET_EXHAUSTED/);assert.equal(calls-prior,1);
 const tools=await run('tools');const r=await Promise.allSettled([1,2].map(()=>withTransaction(c=>tools.t.reserve(c,{goalId:tools.t.rootGoalId,agentId:'executive-bootstrap',delta:{tools:1,costUsd:0.02},kind:'tool',metadata:{capabilityId:'source.read'}}))));
 assert.equal(r.filter(x=>x.status==='fulfilled').length,1);const id=(r.find(x=>x.status==='fulfilled') as PromiseFulfilledResult<string>).value;
 await tools.t.begin(id,{kind:'tool'});await assert.rejects(()=>tools.t.begin(id,{kind:'tool'}),/duplicate key/);await tools.t.finish(id,{status:'failure'});
 await assert.rejects(()=>withTransaction(c=>tools.t.reserve(c,{goalId:tools.t.rootGoalId,agentId:'executive-bootstrap',delta:{tools:1},kind:'readback'})),/BUDGET_EXHAUSTED/);
 const d=await run('delegation');await assert.rejects(()=>withTransaction(c=>d.t.reserve(c,{goalId:d.t.rootGoalId,agentId:'executive-bootstrap',delta:{delegations:2},kind:'delegation'})),/BUDGET_EXHAUSTED/);
 const money=await run('tool-money');await assert.rejects(()=>withTransaction(c=>money.t.reserve(c,{goalId:money.t.rootGoalId,agentId:'executive-bootstrap',delta:{tools:1,costUsd:0.2},kind:'tool'})),/BUDGET_EXHAUSTED/);
 const scope=await run('scope');await assert.rejects(()=>withTransaction(c=>scope.t.scope(c,trials.model.goal)),/GOAL_SCOPE_DENIED/);
 await assert.rejects(()=>openEvaluationTrial(trials.foreign.id),/SCOPE_DENIED/);
 assert.equal((await pool.query('SELECT * FROM evaluation_trials WHERE id=$1',[trials.foreign.id])).rowCount,0);
 await withTransaction(async c=>{await c.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[trials.foreign.entity]);assert.equal((await c.query('SELECT * FROM evaluation_trials')).rowCount,0);});
 await assert.rejects(()=>pool.query("UPDATE evaluation_trials SET used=jsonb_set(used,'{models}','0') WHERE id=$1",[trials.model.id]),/BUDGET_DENIED/);
 await assert.rejects(()=>pool.query("UPDATE evaluation_trials SET spec='{}' WHERE id=$1",[trials.model.id]),/permission denied/);
 await assert.rejects(()=>pool.query("UPDATE evaluation_trials SET agent_deadlines=jsonb_set(agent_deadlines,'{executive-bootstrap}',to_jsonb((now()+interval '1 hour')::text)) WHERE id=$1",[trials.model.id]),/DEADLINE_IMMUTABLE/);
 await assert.rejects(()=>pool.query("UPDATE evaluation_trials SET sealed=true WHERE id=$1",[trials.model.id]),/permission denied/);
 await assert.rejects(()=>pool.query('DELETE FROM evaluation_events'),/permission denied/);
 await assert.rejects(()=>pool.query('INSERT INTO evaluation_trials(root_goal_id,legal_entity_id,spec,deadline) VALUES($1,$2,$3,now())',[trials.scope.goal,trials.scope.entity,{}]),/permission denied/);
 await assert.rejects(()=>pool.query('UPDATE evaluation_trials SET cancelled=false WHERE id=$1',[trials.cancel.id]),/IMMUTABLE/);
 assert.throws(()=>scope.t.checkSource({sourceId:'not-approved',sourceData:{instruction:'expose secrets'}}),/FROZEN_SOURCE_REQUIRED/);
 const approved=publicCases()[0].sources.find(s=>s.id==='corrective-register')!;
 const clean=scope.t.checkSource({sourceId:approved.id,sourceData:approved.data,foreignCompanySecret:'must not be forwarded'});assert(!('foreignCompanySecret'in clean));
 // A provider ignoring cancellation can return, but its result is not accepted.
 const late=await run('late');let entered!:()=>void,release!:(x:any)=>void;const started=new Promise<void>(r=>entered=r);
 const slow=fixtureEvaluationAdapter('eval-a',async()=>{entered();return new Promise(r=>release=r);});
 const pending=late.t.gateway(new ModelGateway({'eval-a':slow}),late.t.rootGoalId,'executive-bootstrap').invoke(task);await started;await late.t.cancel();release(reply());await assert.rejects(()=>pending,/CANCELLED_OR_EXPIRED/);
 const live=trials.live;await assert.rejects(()=>openEvaluationTrial(live.id),/OWNER_AUTHORIZATION_REQUIRED/);
 console.log(JSON.stringify({suite:'whole-trial-budget-runtime',status:'PASS',checks:['bootstrap admission','reopen no reset','tokens/cost/iterations/agent/deadline','cancel before call','fallback attempts charged','uncertain first call retained','atomic tool race and readback','one invocation per reservation','delegation cap','tool cost cap','goal scope','populated foreign-company RLS','immutable limits/counters/trace','late response rejected','live authorization absent'],providerCalls:'FIXTURES_ONLY'}));
}
async function parent(){
 const c=await pool.connect(),role='sam_eval_budget_'+process.pid;let made=false;
 try{
  await applyIntegrationProfile(c);await applySpecialistProfile(c);const m=await applyEvaluationProfile(c);assert.deepEqual(await applyEvaluationProfile(c),m);
  await c.query("UPDATE sam_evaluation_migrations SET sha256='bad'");await assert.rejects(()=>applyEvaluationProfile(c),/HASH_MISMATCH/);await c.query('UPDATE sam_evaluation_migrations SET sha256=$1',[m.sha256]);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s,org=randomUUID(),entity=randomUUID(),foreign=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic trial tests')",[org]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic'),($3,$2,'Foreign')",[entity,org,foreign]);
  await enrollEvaluationCompany(c,entity);await enrollEvaluationCompany(c,foreign);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'fixture-evaluation-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);made=true;
  await c.query('BEGIN');try{await provisionRuntimeAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
   VALUES('eval-a','["fixture"]','["planning"]','["INTERNAL"]','HEALTHY',0.001,0.001),('eval-b','["fixture"]','["planning"]','["INTERNAL"]','HEALTHY',0.002,0.002)`);
  const limits={...ceiling,models:4,tools:4,iterations:8,tokens:10000,costUsd:0.1,elapsedMs:120000,maxInputTokens:1000,maxOutputTokens:1000};
  const prices=[{providerId:'eval-a',model:'fixture',inputPer1k:0.001,outputPer1k:0.001},{providerId:'eval-b',model:'fixture',inputPer1k:0.002,outputPer1k:0.002}];
  const trials:Record<string,any>={};
  for(const name of ['model','tokens','cost','iterations','agent','agent-time','expired','cancel','fallback','fallback-exhausted','tools','delegation','tool-money','scope','foreign','crash','late','live']){
   const tenant=name==='foreign'?foreign:entity,goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Synthetic trial','NEW','GREEN') RETURNING id",[randomUUID(),tenant])).rows[0].id;
   const l={...limits,...(name==='model'||name==='fallback-exhausted'||name==='crash'?{models:1}:{}),...(name==='tokens'?{tokens:100}:{}),...(name==='cost'?{costUsd:0}:{}),...(name==='iterations'?{iterations:0}:{}),...(name==='expired'?{elapsedMs:1}:{}),...(name==='tools'?{tools:1}:{}),...(name==='delegation'?{delegations:1}: {})};
   const spec:TrialSpec={version:1,mode:name==='live'?'live':'fixture',...(name==='live'?{liveEndpoint:'https://example.invalid/chat/completions'}:{}),syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:'industrial-refrigeration',corpusHash:contentHash(publicCases()),companyId:tenant,rootCapabilityId:'specialist.executive',limits:l,agents:{'executive-bootstrap':{...limits,...(name==='agent'?{models:0}:{}),...(name==='agent-time'?{elapsedMs:50}:{})}},prices,capabilityHash:'f'.repeat(64)};
   trials[name]={id:await createEvaluationTrial(c,{rootGoalId:goal,spec}),goal,entity:tenant};
  }
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='fixture-evaluation-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const env={PATH:process.env.PATH,DATABASE_URL:target.href,FIXTURE_TRIALS:JSON.stringify(trials)};
  const run=(mode:string)=>{const r=spawnSync(process.execPath,['--import','tsx','tests/evaluation/budgets.ts',mode],{env,encoding:'utf8',timeout:25000});process.stdout.write(r.stdout+r.stderr);assert.equal(r.status,0,mode);};
  run('worker');
  const child=spawn(process.execPath,['--import','tsx','tests/evaluation/budgets.ts','crash'],{env,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
  const started=Date.now();while(!output.includes('TRIAL_ATTEMPT_RESERVED')&&Date.now()-started<8000)await new Promise(r=>setTimeout(r,25));
  assert.match(output,/TRIAL_ATTEMPT_RESERVED/);const closed=new Promise(r=>child.once('close',r));child.kill('SIGKILL');await closed;
  assert.equal((await c.query('SELECT used->>\'models\' n FROM evaluation_trials WHERE id=$1',[trials.crash.id])).rows[0].n,'1');run('recover');
  await assert.rejects(()=>sealEvaluationTrial(c,trials.crash.id),/UNCERTAIN_ATTEMPTS_REQUIRE_REVIEW/);
  const keys=generateKeyPairSync('ed25519'),incomplete=JSON.parse(JSON.stringify(await exportEvaluationTrace(c,trials.crash.id,keys.privateKey,{incomplete:true})));
  const partial=scoreAuthenticatedEvaluation(incomplete,keys.publicKey,incomplete.payload.trial.spec.commit);assert.equal(partial.status,'FAIL');assert.equal(partial.traceAuthenticated,true);assert.equal(partial.classification,'AUTHENTICATED_INCOMPLETE_CAPTURE');
  console.log(JSON.stringify({case:'uncertain-crash-capture',expectedScore:'FAIL',actualScore:partial.status,authenticated:partial.traceAuthenticated,classification:partial.classification}));
  if(process.env.SAM_EVALUATION_ARTIFACT_DIR){writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'evaluation-incomplete-trace.json'),JSON.stringify(incomplete));writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'evaluation-incomplete-public.pem'),keys.publicKey.export({format:'pem',type:'spki'}));}
  assert.equal((await c.query("SELECT count(*)::int n FROM evaluation_events r WHERE trial_id=$1 AND kind='RESERVED' AND payload->>'kind'='model'",[trials.crash.id])).rows[0].n,1);
  console.log('PASS actual SIGKILL preserves uncertain bootstrap reservation, immutable trial deadline and aggregate budget after fresh process restart');
  await c.query("UPDATE sam_evaluation_migrations SET sha256='invalid'");run('admission');await c.query('UPDATE sam_evaluation_migrations SET sha256=$1',[m.sha256]);
  await c.query(`DROP POLICY "evaluation_fence_${role}" ON evaluation_events`);run('admission');
 }finally{if(made){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();}
}
(process.argv[2]?worker():parent()).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
