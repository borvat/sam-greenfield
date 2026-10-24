import {scoreGoalFamilyCapture} from '../../apps/agents/src/evaluation/goalFamilyScore';
import {fixtureDiagnostics} from './fixtureDiagnostics';
import {sealGoalFamilyEvaluation} from '../../apps/agents/src/evaluation/goalFamilyCapture';
import {startRuntimeService} from '../../apps/runtime/src/service';
import {ingestEvent} from '../../apps/event-fabric/src/index';
import {insertOutboxEvent} from '../../packages/db/src/outbox';
import {prepareBoundedEvaluationComposition} from '../../apps/production/src/boundedEvaluationBootstrap';
import {Client} from 'pg';
import {frozenEvaluationSources} from '../../apps/agents/src/evaluation/frozenSources';
import {createGoalEvaluationComposition,admitEvaluationSource} from '../../apps/production/src/goalEvaluationComposition';
import type {ProductionBundle} from '../../apps/production/src/types';
import {withGoalEvaluation,evaluationBundleHash} from '../../apps/production/src/goalEvaluationBundle';
import {contentHash} from '../../apps/agents/src/evaluation/harness';
import assert from 'node:assert/strict';
import {randomUUID,generateKeyPairSync} from 'node:crypto';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {pool,withTransaction} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
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
import {scoreAuthenticatedEvaluation,verifyEvaluationTrace} from '../../apps/agents/src/evaluation/trace';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
const task={task:'executive_planning',capability:'planning',dataClassification:'INTERNAL' as const,input:{objective:'Synthetic bounded objective'}};
const reply=()=>({model:'fixture',usage:{inputTokens:5,outputTokens:10},output:{steps:[{capabilityId:'specialist.executive',params:{objective:'Synthetic bounded objective'}}]}});
function runtimeFixtureBundle(adapter:any):ProductionBundle{
 const frozen=frozenEvaluationSources('industrial-refrigeration',{record:'corrective-register'});
 return {capabilities:[{capabilityId:'source.read',authorityClass:'GREEN',specialistAgentId:'fixture',specialistVersion:'1'}],
 toolDefinitions:[{capabilityId:'source.read',authorityClass:'GREEN',sideEffect:false,inputSchema:{type:'object',properties:{channel:{type:'string',enum:['record']}},required:['channel'],additionalProperties:false}}],
 toolAdapters:[frozen.adapter],verificationAdapters:[frozen.verifier],modelAdapters:adapter?[adapter]:[],
 modelProviderConfigs:adapter?[{providerId:adapter.providerId,models:['fixture'],capabilities:['planning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:0.001,costPer1kOutput:0.001}]:[]};}
async function worker(){
 fixtureDiagnostics('SOURCE');
 const trials=JSON.parse(process.env.FIXTURE_TRIALS!);let calls=0;
 const good=fixtureEvaluationAdapter('eval-a',async()=>{calls++;return reply();});
 const gateway=new ModelGateway({'eval-a':good});
 const run=async(name:string)=>{const t=await openEvaluationTrial(trials[name].id);return {t,call:()=>t.gateway(gateway,t.rootGoalId,'executive-bootstrap').invoke(task)};};
 const genericBundle={capabilities:[],toolDefinitions:[],toolAdapters:[],modelAdapters:[good]};
 const generic=async(name:string)=>{const t=await openEvaluationTrial(trials[name].id);return withGoalEvaluation(genericBundle,t,t.spec.commit);};
 if(process.argv[2]==='source-crash'){
  const t=await openEvaluationTrial(trials['goal-runtime-source-crash'].id);
  console.log('SOURCE_TRIAL_OPEN');
  const adapter=fixtureEvaluationAdapter('eval-a',async()=>({model:'fixture',usage:{inputTokens:5,outputTokens:10},output:{steps:[{capabilityId:'source.read',params:{channel:'record'}}]}}));
  const original=Client.prototype.query;
  (Client.prototype as any).query=async function(...args:any[]){if(/INSERT INTO executions\b/.test(String(args[0]))){console.log('SOURCE_CALLBACK_FINISHED_BEFORE_PERSISTENCE');return new Promise(()=>{});}return (original as any).apply(this,args);};
  const composition=createGoalEvaluationComposition({bundle:runtimeFixtureBundle(adapter),trial:t,expectedCommit:t.spec.commit,workerId:'source-crash'});
  console.log('SOURCE_COMPOSITION_PREPARED');
  for(let i=0;i<12;i++){await composition.runWorkTick();console.log('SOURCE_RUNTIME_TICK',i+1);}return;
 }
 if(process.argv[2]==='goal-crash'){
  const t=await openEvaluationTrial(trials['goal-crash'].id);
  const hanging=fixtureEvaluationAdapter('eval-b',async()=>{console.log('TRIAL_ATTEMPT_RESERVED');return new Promise(()=>{});});
  const b=withGoalEvaluation({...genericBundle,modelAdapters:[hanging]},t,t.spec.commit);
  await b.modelGatewayForGoal!(trials['goal-crash'].goals[0]).invoke({...task,preferredProviders:['eval-b']});return;
 }
 if(process.argv[2]==='goal-recover'){
  const t=await openEvaluationTrial(trials['goal-crash'].id);const b=withGoalEvaluation({...genericBundle,modelAdapters:[fixtureEvaluationAdapter('eval-b',async()=>{calls++;return reply();})]},t,t.spec.commit);await assert.rejects(()=>b.modelGatewayForGoal!(trials['goal-crash'].goals[0]).invoke({...task,preferredProviders:['eval-b']}),/BUDGET_EXHAUSTED/);
  assert.equal(calls,0);console.log('PASS goal evaluation reopen cannot refund SIGKILL reservation');return;
 }
 if(process.argv[2]==='admission'){await assert.rejects(()=>openEvaluationTrial(trials.scope.id),/MIGRATION_REQUIRED|FIXED_POLICY_REQUIRED/);console.log('PASS evaluation profile receipt/fence admission fails closed');return;}
 if(process.argv[2]==='report-admission'){
  const t=await openEvaluationTrial(trials['goal-runtime-zero-tools'].id);
  await assert.rejects(()=>prepareBoundedEvaluationComposition({sourceBundle:runtimeFixtureBundle(good),trial:t,expectedCommit:t.spec.commit,workerId:'denied-report-access'}),/REPORT_ACCESS_REQUIRED/);
  assert.equal(calls,0);console.log('PASS bootstrap denies missing report privilege before model/source access');return;
 }
 if(process.argv[2]==='crash'){
  const {t}=await run('crash');const hanging=fixtureEvaluationAdapter('eval-b',async()=>{console.log('TRIAL_ATTEMPT_RESERVED');return new Promise(()=>{});});
  await t.gateway(new ModelGateway({'eval-b':hanging}),t.rootGoalId,'executive-bootstrap').invoke({...task,preferredProviders:['eval-b']});return;
 }
 if(process.argv[2]==='recover'){
  const {t}=await run('crash');await assert.rejects(()=>t.gateway(new ModelGateway({'eval-b':fixtureEvaluationAdapter('eval-b',async()=>{calls++;return reply();})}),t.rootGoalId,'executive-bootstrap').invoke({...task,preferredProviders:['eval-b']}),/BUDGET_EXHAUSTED/);assert.equal(calls,0);console.log('PASS restart cannot reset uncertain bootstrap reservation');return;
 }
 const gt=await openEvaluationTrial(trials['three-goals'].id);
 const gb=withGoalEvaluation(genericBundle,gt,gt.spec.commit),goalIds=trials['three-goals'].goals;
 assert.throws(()=>withGoalEvaluation(genericBundle,gt,'0'.repeat(40)),/COMPOSITION_DENIED/);
 assert.throws(()=>withGoalEvaluation({...genericBundle,toolDefinitions:[{capabilityId:'different'} as any]},gt,gt.spec.commit),/COMPOSITION_DENIED/);
 assert.throws(()=>gb.modelGatewayForGoal!(trials.model.goal),/NOT_ENROLLED/);
 assert.throws(()=>gb.modelGatewayForGoal!(goalIds[0]).invoke({...task,boundedSynthetic:{} as any}),/OVERRIDE_DENIED/);
 const ga=fixtureEvaluationAdapter('eval-a',async()=>{calls++;throw Error('fixture failure');});
 const gfb=withGoalEvaluation({...genericBundle,modelAdapters:[ga,fixtureEvaluationAdapter('eval-b',async()=>{calls++;return reply();})]},gt,gt.spec.commit);
 const beforeGoals=calls;await gfb.modelGatewayForGoal!(goalIds[0]).invoke(task);
 for(let i=0;i<3;i++){for(let n=0;n<(i===0?6:8);n++)await gb.modelGatewayForGoal!(goalIds[i]).invoke(task);await assert.rejects(()=>gb.modelGatewayForGoal!(goalIds[i]).invoke(task),/BUDGET_EXHAUSTED/);}
 assert.equal(calls-beforeGoals,24,'fallback plus retries share exactly 24 durable provider attempts');
 const reopenedGoals=await generic('three-goals');
 for(const id of goalIds)await assert.rejects(()=>reopenedGoals.modelGatewayForGoal!(id).invoke(task),/BUDGET_EXHAUSTED/);
 assert.equal(calls-beforeGoals,24);
 const used=(await pool.query('SELECT used,agent_used FROM evaluation_trials WHERE id=$1',[gt.id])).rows[0];
 assert.equal(used.used.models,24);for(const id of goalIds)assert.equal(used.agent_used['goal.'+id].models,8);
 for(const name of ['goal-tokens','goal-money']){const b=await generic(name);if(name==='goal-money')await b.modelGatewayForGoal!(trials[name].goals[0]).invoke(task);const before=calls;await assert.rejects(()=>b.modelGatewayForGoal!(trials[name].goals[0]).invoke(task),/BUDGET_EXHAUSTED/);assert.equal(calls,before);}
 console.log('PASS three fixed goals / 24 attempts / per-goal 8 / fallback and retry charging / reopen / token and dollar denial');
 calls=0;
 const expireAgent=async(t:Awaited<ReturnType<typeof openEvaluationTrial>>,id:string)=>{
  const deadline=(await pool.query('SELECT agent_deadlines->$2 AS deadline FROM evaluation_trials WHERE id=$1',[t.id,'goal.'+id])).rows[0].deadline;
  assert(deadline);await new Promise(r=>setTimeout(r,Math.max(0,Date.parse(deadline)-Date.now())+20));
 };
 const recoveryTrial=await openEvaluationTrial(trials['goal-runtime-recovery-expire'].id);
 const recoveryGoal=trials['goal-runtime-recovery-expire'].goals[0];
 await withTransaction(c=>recoveryTrial.reserve(c,{goalId:recoveryGoal,agentId:'goal.'+recoveryGoal,kind:'iteration',delta:{iterations:1}}));
 await pool.query("UPDATE goals SET state='COMPLETED' WHERE id=$1",[recoveryGoal]);
 await expireAgent(recoveryTrial,recoveryGoal);
 const recoveryComposition=createGoalEvaluationComposition({bundle:runtimeFixtureBundle(good),trial:recoveryTrial,expectedCommit:recoveryTrial.spec.commit,workerId:'recovery-fixture'});
 await recoveryComposition.recover();
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[recoveryGoal])).rows[0].state,'COMPLETED');
 const activeExpired=trials['goal-runtime-recovery-expire'].goals[1];
 await withTransaction(c=>recoveryTrial.reserve(c,{goalId:activeExpired,agentId:'goal.'+activeExpired,kind:'iteration',delta:{iterations:1}}));
 await expireAgent(recoveryTrial,activeExpired);await recoveryComposition.recover();
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[activeExpired])).rows[0].state,'FAILED');
 assert.equal((await pool.query('SELECT agent_used->$2 AS used FROM evaluation_trials WHERE id=$1',[recoveryTrial.id,'goal.'+activeExpired])).rows[0].used.iterations,1);
 console.log('PASS completed expired child does not prevent sibling startup recovery');
 const runtimeTrial=await openEvaluationTrial(trials['goal-runtime'].id);let runtimeCalls=0;
 const runtimeAdapter=fixtureEvaluationAdapter('eval-a',async request=>{
  runtimeCalls++;const prompt=JSON.parse(request.messages[1].content);let output:any;
  if(prompt.proposedReport)output={accepted:true,missing:[]};
  else if(prompt.verifiedObservations){const source=prompt.verifiedObservations[0];output={status:'complete',summary:'Read verified fixture',requirements:[{requirement:prompt.objective,fulfilled:true,evidenceIds:[source.id]}],findings:[{text:'Fixture returns ok',executionId:source.id,quoteLine:source.lines.findIndex((x:string)=>x.includes('corrective-register'))}],limitations:[],steps:[]};}
  else output={steps:[{capabilityId:'source.read',params:{channel:'record'}}]};
  return {model:'fixture',usage:{inputTokens:5,outputTokens:10},output};
 });
 await assert.rejects(()=>prepareBoundedEvaluationComposition({sourceBundle:runtimeFixtureBundle(runtimeAdapter),trial:runtimeTrial,expectedCommit:'0'.repeat(40),workerId:'denied'}),/COMMIT_MISMATCH/);
 const unrelated=trials['goal-runtime-unrelated'],other=unrelated.goals[0];
 await pool.query("UPDATE goals SET state='WAITING_EXTERNAL',next_wake_at=now()-interval '1 second' WHERE id=$1",[other]);
 await pool.query('UPDATE evaluation_trials SET cancelled=true WHERE id=$1',[unrelated.id]);
 const foreignOutbox=await withTransaction(c=>insertOutboxEvent(c,{aggregateType:'goal',aggregateId:other,eventType:'GOAL_CONTINUATION_DUE',payload:{goal_id:other}}));
 const foreignEvent=await withTransaction(c=>ingestEvent(c,{source:'fixture',sourceEventId:randomUUID(),eventType:'EXTERNAL_REPLY',occurredAt:new Date(),payload:{goal_id:other},dedupKey:'unrelated-'+other,provenance:{}}));
 const composition=await prepareBoundedEvaluationComposition({sourceBundle:runtimeFixtureBundle(runtimeAdapter),trial:runtimeTrial,expectedCommit:runtimeTrial.spec.commit,workerId:'evaluation-fixture'});
 const service=await startRuntimeService({port:0,host:'127.0.0.1',tickIntervalMs:10,composition});
 try{for(let i=0;i<300;i++){await new Promise(r=>setTimeout(r,20));const done=(await pool.query("SELECT count(*)::int n FROM goals WHERE id=ANY($1::uuid[]) AND state='COMPLETED'",[trials['goal-runtime'].goals])).rows[0].n;if(done===3)break;}}finally{await service.stop();}
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[other])).rows[0].state,'WAITING_EXTERNAL');
 assert.equal((await pool.query("SELECT status FROM outbox_events WHERE aggregate_id=$1 AND event_type='GOAL_CONTINUATION_DUE'",[other])).rows[0].status,'PENDING');
 assert.equal((await pool.query('SELECT count(*)::int n FROM inbox_events WHERE dedup_key=$1',['unrelated-'+other])).rows[0].n,0);
 const states=(await pool.query('SELECT id,state,planning_attempts FROM goals WHERE id=ANY($1::uuid[])',[trials['goal-runtime'].goals])).rows;
 assert(states.every(x=>x.state==='COMPLETED'),JSON.stringify(states));
 const coordinator=(await pool.query('SELECT state,planning_attempts FROM goals WHERE id=$1',[runtimeTrial.rootGoalId])).rows[0];assert.equal(coordinator.state,'NEW');assert.equal(coordinator.planning_attempts,0);
 const runtimeUsed=(await pool.query('SELECT used,agent_used FROM evaluation_trials WHERE id=$1',[runtimeTrial.id])).rows[0];assert.equal(runtimeUsed.used.models,runtimeCalls);assert.equal(runtimeUsed.used.iterations,runtimeCalls);assert.equal(runtimeUsed.used.tools,6);assert(runtimeCalls>=6&&runtimeCalls<=24);for(const id of trials['goal-runtime'].goals)assert(runtimeUsed.agent_used['goal.'+id].models<=8);
 assert.equal((await pool.query('SELECT count(*)::int n FROM goal_read_reviews WHERE goal_id=ANY($1::uuid[])',[trials['goal-runtime'].goals])).rows[0].n,3);
 console.log('PASS actual trial + ordinary planner + source execution + verification + review; three completed fixture children, NEW coordinator untouched, shared accounting');
 for(const suffix of ['zero-tools','zero-iterations','readback-cap']){
  const name='goal-runtime-'+suffix,t=await openEvaluationTrial(trials[name].id);let dispatches=0,readbacks=0,decisions=0;
  const model=fixtureEvaluationAdapter('eval-a',async request=>{decisions++;return runtimeAdapter.invoke({...task,input:JSON.parse(request.messages[1].content),boundedEvaluation:{permit:t.permit,maxInputTokens:24000,maxOutputTokens:4000,async reserveAttempt(){return randomUUID();}}},'fixture');});
  const bundle=runtimeFixtureBundle(model),read=bundle.toolAdapters[0].execute,verify=bundle.verificationAdapters![0].verify;
  bundle.toolAdapters[0].execute=async request=>{dispatches++;return read(request);};
  bundle.verificationAdapters![0].verify=async request=>{readbacks++;return verify(request);};
  const composition=createGoalEvaluationComposition({bundle,trial:t,expectedCommit:t.spec.commit,workerId:'zero-budget'});
  for(let i=0;i<3;i++)await composition.runWorkTick();
  assert.equal(readbacks,0,suffix+' prevents verifier callback');
  assert.equal(dispatches,suffix==='readback-cap'?3:0,suffix+' prevents unreserved source callback');
  if(suffix==='zero-iterations')assert.equal(decisions,0,'zero decision allowance prevents model callback');
  const used=(await pool.query('SELECT used FROM evaluation_trials WHERE id=$1',[t.id])).rows[0].used;
  const terminalStates=(await pool.query('SELECT state FROM goals WHERE id=ANY($1::uuid[])',[trials[name].goals])).rows;
  assert(terminalStates.every(g=>g.state==='FAILED'),JSON.stringify(terminalStates));
  assert.equal(used.tools,dispatches);if(suffix==='zero-iterations')assert.equal(used.models,0);
 }
 console.log('PASS actual composition zero tools/iterations and separately charged readback deny callbacks');
 // Barriers occur after the SQL insert and after model acceptance, before COMMIT.
 for(const phase of ['plan','review'])for(const reason of ['cancel','expire']){
  const name='goal-runtime-'+phase+'-'+reason,t=await openEvaluationTrial(trials[name].id),id=trials[name].goals[0];
  const c=createGoalEvaluationComposition({bundle:runtimeFixtureBundle(runtimeAdapter),trial:t,expectedCommit:t.spec.commit,workerId:'guard-fixture'});
  const original=Client.prototype.query;let barrier=false;
  (Client.prototype as any).query=async function(...args:any[]){const result=await (original as any).apply(this,args);
   if(!barrier&&String(args[0]).includes(phase==='plan'?'INSERT INTO plans(':'INSERT INTO goal_read_reviews(')&&args[1]?.[0]===id){barrier=true;
    if(reason==='cancel')await pool.query('UPDATE evaluation_trials SET cancelled=true WHERE id=$1',[t.id]);else await expireAgent(t,id);
   }return result;};
  try{for(let i=0;i<12&&!barrier;i++)await c.runWorkTick();}finally{Client.prototype.query=original;}
  assert(barrier,name+' reached post-model insert barrier');
  assert.equal((await pool.query('SELECT count(*)::int n FROM '+(phase==='plan'?'plans':'goal_read_reviews')+' WHERE goal_id=$1',[id])).rows[0].n,0,name+' rolls back child commit');
  assert.notEqual((await pool.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state,'COMPLETED');
 }
 for(const reason of ['cancel','expire']){
  const name='goal-runtime-dispatch-'+reason,t=await openEvaluationTrial(trials[name].id),id=trials[name].goals[0];let dispatched=0;
  await withTransaction(c=>t.reserve(c,{goalId:id,agentId:'goal.'+id,kind:'iteration',delta:{iterations:1}}));
  if(reason==='cancel')await t.cancel();else await expireAgent(t,id);
  await assert.rejects(()=>admitEvaluationSource(t,id,async()=>{dispatched++;return {};}),/CANCELLED_OR_EXPIRED|AGENT_TIME_EXHAUSTED/);assert.equal(dispatched,0);
 }
 const untrusted=runtimeFixtureBundle(runtimeAdapter);untrusted.toolAdapters=[{capabilityId:'source.read',async execute(){throw Error('must never invoke unregistered transport');}}];
 assert.throws(()=>createGoalEvaluationComposition({bundle:untrusted,trial:runtimeTrial,expectedCommit:runtimeTrial.spec.commit,workerId:'denied'}),/FROZEN_ADAPTER_REQUIRED/);
 console.log('PASS cancellation/expiry after model return and before child plan/report COMMIT; before source dispatch; unregistered source transport refused');
 const cap=await run('model');await cap.call();await assert.rejects(cap.call,/BUDGET_EXHAUSTED/);assert.equal(calls,1);
 await pool.query("UPDATE goals SET state='REPLANNING',planning_attempts=0 WHERE id=$1",[cap.t.rootGoalId]);
 const reopened=await run('model');await assert.rejects(reopened.call,/BUDGET_EXHAUSTED/);assert.equal(calls,1);
 await assert.rejects(()=>withTransaction(async c=>{
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s;
  await c.query('CREATE TEMP TABLE evaluation_trials AS SELECT * FROM evaluation_trials WHERE false');
  await c.query("SELECT set_config('search_path',$1,true)",['pg_temp,'+schema+',public']);
  await cap.t.reserve(c,{goalId:cap.t.rootGoalId,agentId:'executive-bootstrap',delta:{models:1},kind:'model'});
 }),/BUDGET_EXHAUSTED/,'temporary shadow table must not replace the real exhausted ledger');
 const admissionRace=await run('admission-race');
 const expiredTicket=await withTransaction(c=>admissionRace.t.reserve(c,{goalId:admissionRace.t.rootGoalId,agentId:'executive-bootstrap',delta:{models:1,tokens:100,costUsd:0.001},kind:'model',metadata:{providerId:'eval-a',model:'fixture'}}));
 await new Promise(r=>setTimeout(r,100));
 await assert.rejects(()=>admissionRace.t.begin(expiredTicket,{kind:'model',agentId:'executive-bootstrap',providerId:'eval-a',model:'fixture'}),/AGENT_TIME_EXHAUSTED/,'agent deadline must be rechecked immediately before execution');
 const finishedAdmission=await run('finished-admission');
 const finishedTicket=await withTransaction(c=>finishedAdmission.t.reserve(c,{goalId:finishedAdmission.t.rootGoalId,agentId:'executive-bootstrap',delta:{models:1,tokens:100,costUsd:0.001},kind:'model',metadata:{providerId:'eval-a',model:'fixture'}}));
 await assert.rejects(()=>finishedAdmission.t.finish(finishedTicket,{status:'success'}),/INVOCATION_REQUIRED/);
 await assert.rejects(()=>finishedAdmission.t.begin(finishedTicket,{kind:'model',providerId:'eval-b'}),/RESERVATION_MISMATCH/);
 await assert.rejects(()=>finishedAdmission.t.begin(finishedTicket,{kind:'model',model:'other'}),/RESERVATION_MISMATCH/);
 await finishedAdmission.t.finish(finishedTicket,{status:'failure'});
 await assert.rejects(()=>finishedAdmission.t.begin(finishedTicket,{kind:'model'}),/ATTEMPT_ALREADY_FINISHED/);
 const modelRace=await run('model-race'),raceBefore=calls;const modelOutcomes=await Promise.allSettled([modelRace.call(),modelRace.call()]);
 assert.equal(modelOutcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(calls-raceBefore,1,'concurrent model admission must consume the shared cap once');
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
 console.log(JSON.stringify({suite:'whole-trial-budget-runtime',status:'PASS',checks:['bootstrap admission','reopen no reset','tokens/cost/iterations/agent/deadline','cancel before call','fallback attempts charged','uncertain first call retained','atomic tool race and readback','one invocation per reservation','agent deadline at execution admission','provider/model ticket binding','no success without invocation','no invocation after completion','delegation cap','tool cost cap','goal scope','populated foreign-company RLS','immutable limits/counters/trace','late response rejected','live authorization absent'],providerCalls:'FIXTURES_ONLY'}));
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
  await c.query('BEGIN');try{await provisionIntegrationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
   VALUES('eval-a','["fixture"]','["planning"]','["INTERNAL"]','HEALTHY',0.001,0.001),('eval-b','["fixture"]','["planning"]','["INTERNAL"]','HEALTHY',0.002,0.002)`);
  const limits={...ceiling,models:4,tools:4,iterations:8,tokens:10000,costUsd:0.1,elapsedMs:120000,maxInputTokens:1000,maxOutputTokens:1000};
  const prices=[{providerId:'eval-a',model:'fixture',inputPer1k:0.001,outputPer1k:0.001},{providerId:'eval-b',model:'fixture',inputPer1k:0.002,outputPer1k:0.002}];
  const trials:Record<string,any>={};
  for(const name of ['model','tokens','cost','iterations','agent','agent-time','admission-race','finished-admission','model-race','expired','cancel','fallback','fallback-exhausted','tools','delegation','tool-money','scope','foreign','crash','late','live']){
   const tenant=name==='foreign'?foreign:entity,goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Synthetic trial','NEW','GREEN') RETURNING id",[randomUUID(),tenant])).rows[0].id;
   const l={...limits,...(name==='model'||name==='model-race'||name==='fallback-exhausted'||name==='crash'?{models:1}:{}),...(name==='tokens'?{tokens:100}:{}),...(name==='cost'?{costUsd:0}:{}),...(name==='iterations'?{iterations:0}:{}),...(name==='expired'?{elapsedMs:1}:{}),...(name==='tools'?{tools:1}:{}),...(name==='delegation'?{delegations:1}: {})};
   const spec:TrialSpec={version:1,mode:name==='live'?'live':'fixture',...(name==='live'?{liveEndpoint:'https://example.invalid/chat/completions'}:{}),syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:'industrial-refrigeration',corpusHash:contentHash(publicCases()),companyId:tenant,rootCapabilityId:'specialist.executive',limits:l,agents:{'executive-bootstrap':{...limits,...(name==='agent'?{models:0}:{}),...(['agent-time','admission-race'].includes(name)?{elapsedMs:50}:{})}},prices,capabilityHash:'f'.repeat(64)};
   trials[name]={id:await createEvaluationTrial(c,{rootGoalId:goal,spec}),goal,entity:tenant};
  }
  for(const name of ['three-goals','goal-crash','goal-tokens','goal-money','goal-runtime','goal-runtime-plan-cancel','goal-runtime-plan-expire','goal-runtime-review-cancel','goal-runtime-review-expire','goal-runtime-dispatch-cancel','goal-runtime-dispatch-expire','goal-runtime-zero-tools','goal-runtime-zero-iterations','goal-runtime-readback-cap','goal-runtime-unrelated','goal-runtime-recovery-expire','goal-runtime-source-crash']){
   const root=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Synthetic evaluation root','NEW','GREEN') RETURNING id",[randomUUID(),entity])).rows[0].id;
   const goals:string[]=[];for(let i=0;i<3;i++)goals.push((await c.query("INSERT INTO goals(business_id,company_scope,parent_goal_id,objective,state,authority_ceiling) VALUES($1,$2,$3,$4,'NEW','GREEN') RETURNING id",[randomUUID(),entity,root,['Compare supplied periods','Compare promises and deliveries','Inventory duplicate records'][i]])).rows[0].id);
   const l={...limits,iterations:32,models:name==='goal-crash'?1:24,tokens:name==='goal-tokens'?1:100000,costUsd:name==='goal-money'?0.003:1,...(name.startsWith('goal-runtime')?{tools:6,maxInputTokens:24000,maxOutputTokens:4000,tokens:672000}: {})};
   const per={...l,models:Math.min(l.models,8),...(name.endsWith('zero-tools')?{tools:0}:{}),...(name.endsWith('zero-iterations')?{iterations:0}:{}),...(name.endsWith('readback-cap')?{tools:1}:{}),...(name.endsWith('-expire')?{elapsedMs:5000}: {})};
   const spec:TrialSpec={version:1,mode:'fixture',syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:'industrial-refrigeration',corpusHash:contentHash(publicCases()),companyId:entity,rootCapabilityId:'specialist.executive',limits:l,agents:{'executive-bootstrap':{...l,models:0},...Object.fromEntries(goals.map(id=>['goal.'+id,per]))},prices,capabilityHash:evaluationBundleHash(name.startsWith('goal-runtime')?runtimeFixtureBundle(null):{capabilities:[],toolDefinitions:[],toolAdapters:[]})};
   if(name.startsWith('goal-runtime'))await c.query("UPDATE goals SET completion_definition='sam.read_report.v1',objective='Read and verify supplied fixture record' WHERE id=ANY($1::uuid[])",[goals]);
   trials[name]={id:await createEvaluationTrial(c,{rootGoalId:root,spec}),goal:root,entity,goals};
  }
  await c.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES('source.read','Fixture readback','db_query','{\"readback\":\"boolean\"}','{}')");
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='fixture-evaluation-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const env={PATH:process.env.PATH,DATABASE_URL:target.href,FIXTURE_TRIALS:JSON.stringify(trials)};
  const run=(mode:string)=>{const r=spawnSync(process.execPath,['--import','tsx','tests/evaluation/budgets.ts',mode],{env,encoding:'utf8',timeout:75000});process.stdout.write(r.stdout+r.stderr);assert.equal(r.status,0,mode);};
  const sourceChild=spawn(process.execPath,['--import','tsx','tests/evaluation/budgets.ts','source-crash'],{env,stdio:['ignore','pipe','pipe']});let sourceOutput='';sourceChild.stdout.on('data',x=>sourceOutput+=x);sourceChild.stderr.on('data',x=>sourceOutput+=x);
  const sourceStarted=Date.now();while(!sourceOutput.includes('SOURCE_CALLBACK_FINISHED_BEFORE_PERSISTENCE')&&Date.now()-sourceStarted<8000)await new Promise(r=>setTimeout(r,25));
  if(!sourceOutput.includes('SOURCE_CALLBACK_FINISHED_BEFORE_PERSISTENCE')){sourceChild.kill('SIGKILL');throw Error('SOURCE_PERSISTENCE_BARRIER_NOT_REACHED:'+sourceOutput);}
  const sourceClosed=new Promise(r=>sourceChild.once('close',r));sourceChild.kill('SIGKILL');await sourceClosed;
  const sourceTrial=trials['goal-runtime-source-crash'];
  assert.equal((await c.query('SELECT count(*)::int n FROM executions WHERE goal_id=ANY($1::uuid[])',[sourceTrial.goals])).rows[0].n,0);
  assert.equal((await c.query("SELECT used->>'tools' n FROM evaluation_trials WHERE id=$1",[sourceTrial.id])).rows[0].n,'1');
  // Synthetic operator disposition after the killed fixture; no successful goal claim.
  await c.query("UPDATE goals SET state='FAILED' WHERE id=ANY($1::uuid[])",[sourceTrial.goals]);
  await assert.rejects(()=>sealGoalFamilyEvaluation(c,sourceTrial.id,runtimeFixtureBundle(null)),/OPERATION_PERSISTENCE_UNCONFIRMED/);
  const sourceKey=generateKeyPairSync('ed25519'),sourceTrace=await exportEvaluationTrace(c,sourceTrial.id,sourceKey.privateKey,{incomplete:true});
  if(process.env.SAM_EVALUATION_ARTIFACT_DIR){writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'source-persistence-crash-trace.json'),JSON.stringify(sourceTrace));writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'source-persistence-crash-public.pem'),sourceKey.publicKey.export({format:'pem',type:'spki'}));}
  console.log('PASS actual SIGKILL after successful source callback preserves charge and refuses complete capture without execution persistence');
  run('worker');
  const lateId=randomUUID();let insertedLate=false;
  const barrier={query:async(sql:string,params?:any[])=>{
   const result=await c.query(sql,params);
   if(!insertedLate&&sql.includes('SELECT * FROM executions')&&sql.includes('FOR UPDATE')){
    insertedLate=true;
    // Separate connection commits after the capture's initial execution lock set.
    await pool.query("INSERT INTO executions SELECT (jsonb_populate_record(NULL::executions,to_jsonb(e)||jsonb_build_object('id',$2::text))).* FROM executions e WHERE id=$1",[result.rows[0].id,lateId]);
   }
   return result;
  }};
  try{await assert.rejects(()=>sealGoalFamilyEvaluation(barrier as any,trials['goal-runtime'].id,runtimeFixtureBundle(null)),/CAPTURE_SOURCE_SET_CHANGED/);assert(insertedLate);}
  finally{await pool.query('DELETE FROM executions WHERE id=$1',[lateId]);}
  assert.equal((await c.query('SELECT sealed FROM evaluation_trials WHERE id=$1',[trials['goal-runtime'].id])).rows[0].sealed,false);
  console.log('PASS concurrent execution-set change refuses capture and leaves trial unsealed');
  await sealGoalFamilyEvaluation(c,trials['goal-runtime'].id,runtimeFixtureBundle(null));
  const familyKey=generateKeyPairSync('ed25519');
  const familyTrace=await exportEvaluationTrace(c,trials['goal-runtime'].id,familyKey.privateKey);
  const familyScore=scoreAuthenticatedEvaluation(familyTrace,familyKey.publicKey,familyTrace.payload.trial.spec.commit);
  assert.equal(familyScore.classification,'AUTHENTICATED_GOAL_FAMILY_FIXTURE');assert.equal(familyScore.liveReasoningValidated,false);
  assert.equal((familyScore as any).declaredCompletedGoals,3);
  const checked=verifyEvaluationTrace(familyTrace,familyKey.publicKey);
  const unlinked=structuredClone(checked);delete unlinked.events.at(-1).payload.sources[0].evidence.evaluationReservation;
  assert.throws(()=>scoreGoalFamilyCapture(unlinked),/OPERATION_PERSISTENCE_UNCONFIRMED/);
  const orphan=structuredClone(checked);orphan.events.at(-1).payload.sources=[];
  assert.throws(()=>scoreGoalFamilyCapture(orphan),/OPERATION_PERSISTENCE_UNCONFIRMED/,'successful callbacks cannot disappear from capture after a persistence crash');
  const nonterminal=structuredClone(checked);nonterminal.events.at(-1).payload.goals[0].state='NEW';
  assert.throws(()=>scoreGoalFamilyCapture(nonterminal),/GOAL_CAPTURE_INVALID/);
  const uncited=structuredClone(checked);uncited.events.at(-1).payload.reports[0].decision.requirements[0].evidenceIds=[randomUUID()];
  uncited.events.at(-1).payload.reports[0].report_hash=sha256Hex(uncited.events.at(-1).payload.reports[0].decision);
  assert.throws(()=>scoreGoalFamilyCapture(uncited),/EVIDENCE_REVOKED/);
  const altered=structuredClone(familyTrace);altered.payload.events.at(-1).payload.root.state='COMPLETED';
  assert.throws(()=>scoreAuthenticatedEvaluation(altered,familyKey.publicKey,altered.payload.trial.spec.commit),/AUTHENTICATION_FAILED/);
  if(process.env.SAM_EVALUATION_ARTIFACT_DIR){writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'goal-family-trace.json'),JSON.stringify(familyTrace));writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'goal-family-public.pem'),familyKey.publicKey.export({format:'pem',type:'spki'}));}
  for(const suffix of ['zero-tools','zero-iterations','readback-cap']){const snapshot=await sealGoalFamilyEvaluation(c,trials['goal-runtime-'+suffix].id,runtimeFixtureBundle(null));assert(snapshot.goals.every(g=>g.state==='FAILED'));}
  console.log('PASS actual service child reports seal/export/authenticate with coordinator NEW; no live-quality claim');
  await c.query('REVOKE INSERT ON goal_read_reviews FROM '+role);run('report-admission');await c.query('GRANT INSERT ON goal_read_reviews TO '+role);
  const child=spawn(process.execPath,['--import','tsx','tests/evaluation/budgets.ts','crash'],{env,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
  const started=Date.now();while(!output.includes('TRIAL_ATTEMPT_RESERVED')&&Date.now()-started<8000)await new Promise(r=>setTimeout(r,25));
  assert.match(output,/TRIAL_ATTEMPT_RESERVED/);const closed=new Promise(r=>child.once('close',r));child.kill('SIGKILL');await closed;
  assert.equal((await c.query('SELECT used->>\'models\' n FROM evaluation_trials WHERE id=$1',[trials.crash.id])).rows[0].n,'1');run('recover');
  const goalChild=spawn(process.execPath,['--import','tsx','tests/evaluation/budgets.ts','goal-crash'],{env,stdio:['ignore','pipe','pipe']});let goalOutput='';goalChild.stdout.on('data',x=>goalOutput+=x);goalChild.stderr.on('data',x=>goalOutput+=x);
  const goalStarted=Date.now();while(!goalOutput.includes('TRIAL_ATTEMPT_RESERVED')&&Date.now()-goalStarted<8000)await new Promise(r=>setTimeout(r,25));
  assert.match(goalOutput,/TRIAL_ATTEMPT_RESERVED/);const goalClosed=new Promise(r=>goalChild.once('close',r));goalChild.kill('SIGKILL');await goalClosed;run('goal-recover');
  assert.equal((await c.query("SELECT used->>'models' n FROM evaluation_trials WHERE id=$1",[trials['goal-crash'].id])).rows[0].n,'1');
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
