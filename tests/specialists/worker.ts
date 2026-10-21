// Model decisions and source content are TEST DOUBLES. Gateway, executive
// planner, specialist loops, concurrent supervisor, leases, verifier and PG are real.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {pool,withTransaction} from '../../packages/db/src/client';
import {ModelGateway} from '../../packages/model-gateway/src/gateway';
import type {ModelProviderAdapter} from '../../packages/model-gateway/src/types';
import {assertSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createSpecialistIntelligence} from '../../apps/agents/src/intelligence/engine';
import {createIntelligentComposition} from '../../apps/agents/src/intelligence/composition';
import {ceiling,type Limits,type SpecialistConfig} from '../../apps/agents/src/intelligence/contracts';
import {learnVerifiedQuote,recallVerifiedLessons,proposeHypothesis,evaluateHypothesis} from '../../apps/agents/src/intelligence/learning';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {runOneSpecialistWork,claimNextWorkForSpecialistAtomic} from '../../apps/agents/src/runtime';
import {recoverKernelAfterRestart} from '../../apps/kernel/src/recovery';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
const entity=process.env.FIXTURE_ENTITY!,mode=process.argv[2],root='specialist.executive',market='specialist.market',risk='specialist.risk',read='source.read';
const one=async(q:string,v:any[]=[])=> (await pool.query(q,v)).rows[0];
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const limits={...ceiling,costUsd:0.5,elapsedMs:60_000};
const configs=(l:Limits=limits):SpecialistConfig[]=>[
 {capabilityId:root,agentId:'executive-specialist',purpose:'Synthesize delegated findings for the existing Executive Brain',allowedCapabilities:[market,risk,read],limits:l},
 {capabilityId:market,agentId:'market-specialist',purpose:'Independently research an unfamiliar industry',allowedCapabilities:[read],limits:l},
 {capabilityId:risk,agentId:'risk-specialist',purpose:'Independently assess market risk',allowedCapabilities:[read],limits:l}];
const dispatch=(cap:string,objective:string,params:Record<string,unknown>)=>({action:'dispatch',understanding:'Assess the unfamiliar aerogel packaging market with independent evidence',plan:['Acquire sources','Evaluate and revise','Report evidence and uncertainty'],reason:'Need independently verified evidence',tasks:[{capabilityId:cap,objective,params}]});
const report=(source:any,agent:string)=>({action:'report',understanding:'Use the independently verified market quotation',plan:['Acquire and verify a source','Produce a bounded conclusion'],summary:agent+' observes synthetic demand '+source.result.value,
 claims:[{topic:'aerogel-demand',value:String(source.result.value),evidenceIds:[source.id]}],uncertainties:['Synthetic source only; real market truth and live reasoning have not been evaluated'],completionCriteria:['One current independently verified quotation']});
let active=0,maxActive=0,executiveCalls=0,seen=new Set<string>(),open!:()=>void;
const barrier=new Promise<void>(r=>open=r);
const provider:ModelProviderAdapter={providerId:'specialist-fixture',executionMode:'synthetic',supportsUsageLimits:true,async invoke(task){
 if(mode==='crash'){console.log('MODEL_ATTEMPT_RESERVED');await new Promise(()=>{});}
 const p=task.input as any;
 if(task.capability==='planning'){executiveCalls++;return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{steps:[{capabilityId:root,params:{objective:p.objective}}]}};}
 assert(task.boundedSynthetic,'specialist model invocation must reserve bounded usage');
 active++;maxActive=Math.max(active,maxActive);
 try{
  const ctx=p.verifiedContext,agent=p.agent.id;
  let output:any;
  if(mode==='controls')output=dispatch('not.authorized','Escalate scope',{});
  else if(mode==='recover')output=dispatch(read,'Recover missing independent evidence',{channel:'resolve'});
  else if(agent==='executive-specialist'){
   if(!ctx.tasks.length)output={...dispatch(market,'Study aerogel packaging demand',{objective:'Study aerogel packaging demand'}),tasks:[
    {capabilityId:market,objective:'Study aerogel packaging demand',params:{objective:'Study aerogel packaging demand'}},
    {capabilityId:risk,objective:'Assess aerogel packaging risk',params:{objective:'Assess aerogel packaging risk'}}]};
   else if(ctx.conflicts.length&&!ctx.evidence.some((e:any)=>e.capabilityId===read&&e.result.channel==='resolve')){
    if(!p.prior.some((h:any)=>h.error==='SPECIALIST_CONFLICT_UNRESOLVED'))output=report(ctx.evidence.find((e:any)=>e.result.channel==='market'),agent);
    else output=dispatch(read,'Resolve contradictory aerogel demand quotations',{channel:'resolve'});
   }
   else {const source=ctx.evidence.find((e:any)=>e.capabilityId===read&&e.result.channel==='resolve');assert(source,'root must see both contradiction and corrective source');output=report(source,agent);}
  }else{
   if(!seen.has(agent)){seen.add(agent);if(seen.size===2)open();await Promise.race([barrier,sleep(2000).then(()=>{throw Error('INDEPENDENT_REASONING_NOT_CONCURRENT');})]);}
   const source=ctx.evidence.find((e:any)=>e.capabilityId===read);
   if(source)output=report(source,agent);
   else output=dispatch(read,'Acquire demand quotation',{channel:agent==='market-specialist'?(ctx.tasks.length?'market':'bad'):'risk'});
  }
  return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output};
 }finally{active--;}
}};
function bundleFor(adapter=provider){
 const caps=[root,market,risk].map((id,i)=>({capabilityId:id,authorityClass:'GREEN' as const,specialistAgentId:configs()[i].agentId,specialistVersion:'1',sideEffect:false,
  companyScopes:[entity],parameters:{type:'object',properties:{objective:{type:'string'}},required:['objective'],additionalProperties:false}}));
 const source={capabilityId:read,authorityClass:'GREEN' as const,specialistAgentId:'source-specialist',specialistVersion:'1',sideEffect:false,companyScopes:[entity],parameters:{type:'object',properties:{channel:{type:'string',enum:['bad','market','risk','resolve']}},required:['channel'],additionalProperties:false}};
 const values:Record<string,string>={bad:'0',market:'23',risk:'29',resolve:'27'};
 return validateProductionBundle({capabilities:[...caps,source],toolDefinitions:[...caps,source].map(c=>({capabilityId:c.capabilityId,authorityClass:c.authorityClass,sideEffect:false,costUpperBoundUsd:0,companyScopes:[entity]})),
  toolAdapters:[...caps.map(c=>({capabilityId:c.capabilityId,async execute(){throw Error('REASONING_DISPATCH_REQUIRED');}})),{capabilityId:read,async execute({params}){
   return {result:{value:values[String(params.channel)],channel:params.channel,uri:'fixture://aerogel/'+params.channel,sourceKind:'synthetic-primary'},evidence:{readback:true}};
  }}],verificationAdapters:[{capabilityId:read,async verify({execution}){
   const verified=execution.params.channel!=='bad'&&execution.result?.value===values[String(execution.params.channel)];
   return {result:verified?'VERIFIED':'FAILED',evidence:{readback:true,reason:verified?'source_readback':'synthetic_bad_source'},verifier:'fixture-independent-source-query'};
  }}],modelAdapters:[adapter],modelProviderConfigs:[{providerId:adapter.providerId,models:['fixture'],capabilities:['planning','specialist_reasoning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:0,costPer1kOutput:0}],
  replanPolicy:{recoverableEvidenceReasons:[]},workerLeaseTtlSeconds:5});
}
async function make(label:string){
 const g=await one("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING','GREEN') RETURNING id",['P5-'+randomUUID(),entity,label]);
 const p=await persistPlanAndDelegateAtomic({goalId:g.id,steps:[{capabilityId:root,params:{objective:label}}]});return {goal:g.id,queue:p.queueIds[0]};
}
async function main(){
 if(mode==='admission-denied'){await withTransaction(c=>assert.rejects(()=>assertSpecialistAccess(c),/FIXED_POLICY_REQUIRED/));console.log('PASS missing immutable policy refuses specialist admission');return;}
 if(mode==='recall-positive'){
  await withTransaction(async c=>assert.equal((await recallVerifiedLessons(c,entity,'27')).length,1));
  console.log('PASS cold-process verified lesson retrieval');return;
 }
 if(mode==='isolation'){
  assert.equal((await pool.query("SELECT * FROM specialist_learning WHERE statement='foreign secret'")).rowCount,0);
  assert.equal((await pool.query("SELECT * FROM specialist_sessions WHERE agent_id='foreign'")).rowCount,0);
  await withTransaction(async c=>{
   await c.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[process.env.FIXTURE_FOREIGN]);
   for(const table of ['specialist_budgets','specialist_sessions','specialist_learning','specialist_delegations'])assert.equal((await c.query('SELECT * FROM '+table)).rowCount,0);
  });
  await assert.rejects(()=>pool.query("UPDATE specialist_budgets SET limits='{}'"),/permission denied/);
  await assert.rejects(()=>pool.query("UPDATE specialist_learning SET statement='forged fact'"),/permission denied/);
  console.log('PASS populated same-org and cross-org isolation, spoofed GUC cannot switch company, immutable limits/learning');return;
 }
 const bundle=bundleFor(),gateway=new ModelGateway({[provider.providerId]:provider});
 if(mode==='collaboration'){
  const goal=await one("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Investigate unfamiliar aerogel packaging demand and reconcile specialist findings','NEW','GREEN') RETURNING id",['P5-'+randomUUID(),entity]);
  const {composition,engine}=await createIntelligentComposition({bundle,workerId:'phase5-acceptance',intelligence:{configs:configs(),catalog:bundle.catalog,tools:bundle.tools,gateway,diagnostic:console.error}});
  const begin=Date.now();
  while(Date.now()-begin<25000){await composition.runWorkTick();if((await one('SELECT state FROM goals WHERE id=$1',[goal.id])).state==='COMPLETED')break;await sleep(110);}
  const g=await one('SELECT state,current_plan_id FROM goals WHERE id=$1',[goal.id]);
  if(g.state!=='COMPLETED')console.log(JSON.stringify((await pool.query("SELECT agent_id,state->>'phase' phase,state->>'reason' reason,state->'history' history FROM specialist_sessions WHERE agent_id='executive-specialist'")).rows));
  assert.equal(g.state,'COMPLETED');assert(maxActive>=2,'specialists independently invoke models concurrently');assert.equal(executiveCalls,1,'delegated failures must replan through the budgeted parent, not the executive planner');
  const final=await one('SELECT result,evidence FROM executions WHERE goal_id=$1',[goal.id]);
  assert.equal(final.result.report.claims[0].value,'27');assert.equal(final.result.report.classification,'MODEL_INFERENCE');
  assert.equal((await one('SELECT count(*)::int n FROM executions WHERE goal_id=$1',[goal.id])).n,1);
  const sessions=(await pool.query('SELECT * FROM specialist_sessions')).rows;
  const executive=sessions.find(s=>s.agent_id==='executive-specialist');assert(executive.state.history.some((h:any)=>h.error==='SPECIALIST_CONFLICT_UNRESOLVED'));assert(executive.state.history.filter((h:any)=>h.decision?.action==='dispatch').length>=2);
  assert(sessions.find(s=>s.agent_id==='market-specialist').state.history.filter((h:any)=>h.decision?.action==='dispatch').length>=2,'specialist replans after independently rejected source');
  assert.equal((await one('SELECT count(*)::int n FROM side_effect_operations')).n,0);
  const source=final.result.report.evidence.find((e:any)=>e.capabilityId===read&&e.result.channel==='resolve');
  await withTransaction(async c=>{
   await assert.rejects(()=>learnVerifiedQuote(c,{entityId:entity,goalId:goal.id,sourceGoalId:source.goalId,executionId:source.id,statement:'unverified fabricated causal lesson'}),/VERIFIED_VALUE_REQUIRED/);
   const learned=await learnVerifiedQuote(c,{entityId:entity,goalId:goal.id,sourceGoalId:source.goalId,executionId:source.id,statement:'27'});
   const hypothesis=await proposeHypothesis(c,{entityId:entity,goalId:goal.id,observationId:learned.observation,statement:'unconfirmed demand forecast'});
   const evaluation=await evaluateHypothesis(c,{hypothesisId:hypothesis,sourceGoalId:source.goalId,executionId:source.id});assert.equal(evaluation.supported,false);
  });
  await withTransaction(async c=>{assert.equal((await recallVerifiedLessons(c,entity,'27')).length,1);});
  const unrelated=await make('unrelated-task');
  await assert.rejects(()=>withTransaction(c=>learnVerifiedQuote(c,{entityId:entity,goalId:unrelated.goal,sourceGoalId:source.goalId,executionId:source.id,statement:'27'})),/VERIFIED_QUOTE_REQUIRED/);
  await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[unrelated.queue]);await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[unrelated.goal]);
  const cold=spawnSync(process.execPath,['--import','tsx','tests/specialists/worker.ts','recall-positive'],{
   env:{PATH:process.env.PATH,DATABASE_URL:process.env.DATABASE_URL!,FIXTURE_ENTITY:entity},encoding:'utf8',timeout:5000});
  process.stdout.write(cold.stdout+cold.stderr);assert.equal(cold.status,0);
  await pool.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,expires_at) VALUES($1,$2,'MODEL_INFERENCE','untrusted inference',now()+interval '1 day'),($1,$2,'HYPOTHESIS','unverified hypothesis',now()+interval '1 day')`,[entity,goal.id]);
  await withTransaction(async c=>assert.equal((await recallVerifiedLessons(c,entity,'unverified')).length,0));
  await assert.rejects(()=>pool.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,expires_at) VALUES($1,$2,'VERIFIED_LESSON','fake lesson',now()+interval '1 day')`,[entity,goal.id]),/VERIFIED_QUOTE_REQUIRED/);
  await pool.query(`INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at)
   SELECT execution_id,'fixture-revocation',method,contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications WHERE id=$1`,[source.verificationId]);
  await withTransaction(async c=>assert.equal((await recallVerifiedLessons(c,entity,'27')).length,0));
  assert.equal(await engine.verifyReport(final.result,String(final.evidence.specialist_session)),false);
  console.log(JSON.stringify({test:'collaboration',status:'PASS',maxConcurrentReasoning:maxActive,agents:sessions.map(s=>s.agent_id),rootQueue:executive.queue_id,
   learning:'observation->hypothesis->evaluation->verified lesson; inference excluded; revocation hides memory and invalidates report',classification:'SYNTHETIC_MODEL_ARCHITECTURE'}));return;
 }
 if(mode==='crash'||mode==='recover'){
  const engine=await createSpecialistIntelligence({configs:configs(),catalog:bundle.catalog,tools:bundle.tools,gateway});
  if(mode==='recover')await recoverKernelAfterRestart();
  const work=await claimNextWorkForSpecialistAtomic(bundle.catalog.specialists.getAgent('executive-specialist'),'crash-recovery',5);assert.equal(work?.queueId,process.env.FIXTURE_QUEUE);
  await engine.advancers[root](work!);
  if(mode==='recover'){
   const row=await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[work!.queueId]);assert.equal(row.state.phase,'WAITING');
   assert(row.state.history.some((h:any)=>h.event==='UNCERTAIN_MODEL_RESPONSE_AFTER_RECOVERY'));
   const budget=await one('SELECT used FROM specialist_budgets WHERE root_queue_id=$1',[work!.queueId]);assert.equal(budget.used.models,2);
   assert.equal((await one('SELECT count(*)::int n FROM specialist_delegations WHERE parent_queue_id=$1',[work!.queueId])).n,1);
   console.log('PASS real SIGKILL model reservation retained, kernel lease recovery, fenced resumed reasoning, single child dispatch');
   // Retire this synthetic recovery scenario so subsequent controls remain isolated.
   await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1 OR id IN(SELECT goal_id FROM specialist_delegations WHERE root_queue_id=$2)",[process.env.FIXTURE_GOAL,work!.queueId]);
   await pool.query("UPDATE work_queue SET status='FAILED' WHERE goal_id IN(SELECT id FROM goals WHERE state='CANCELLED')");
  }return;
 }
 if(mode==='controls'){
  const direct=async(engine:Awaited<ReturnType<typeof createSpecialistIntelligence>>)=>runOneSpecialistWork({agent:bundle.catalog.specialists.getAgent('executive-specialist'),workerInstanceId:'controls',ttlSeconds:5,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools}),advancers:engine.advancers});
  const normal={configs:configs(),catalog:bundle.catalog,tools:bundle.tools,gateway};
  // Each dimension is exhausted before a provider or child can cross it.
  for(const key of ['models','tokens','costUsd','iterations'] as const){
   const g=await make('budget-'+key),l={...limits,[key]:0};
   const localGateway=key==='costUsd'?new ModelGateway({[provider.providerId]:provider}):gateway;
   const e=await createSpecialistIntelligence({...normal,configs:configs(l),gateway:localGateway});
   await direct(e);await sleep(110);await direct(e);await sleep(110);await direct(e);
   const s=await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[g.queue]);assert.equal(s.state.phase,'BLOCKED',key);
   assert.equal((await one('SELECT count(*)::int n FROM specialist_delegations WHERE parent_queue_id=$1',[g.queue])).n,0);console.log('PASS budget',key);
  }
  const e=await createSpecialistIntelligence(normal),cancel=await make('cancel');await direct(e);await e.cancel(cancel.queue);await sleep(110);await direct(e);
  assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[cancel.queue])).state.reason,'SPECIALIST_CANCELLED');
  const time=await make('time-limit'),short=await createSpecialistIntelligence({...normal,configs:configs({...limits,elapsedMs:1})});await direct(short);await sleep(110);await direct(short);
  assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[time.queue])).state.phase,'BLOCKED');
  const denied=await make('unauthorized-capability');await direct(e);await sleep(110);await direct(e);
  const deniedState=(await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[denied.queue])).state;
  assert(deniedState.history.some((h:any)=>h.error==='SPECIALIST_CAPABILITY_DENIED'));
  // Stop this synthetic pending work without mutating any protected environment.
  await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[denied.goal]);await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[denied.queue]);
  console.log('PASS controls: scope-cancel-time');
  const dispatchProvider:ModelProviderAdapter={...provider,async invoke(){return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:dispatch(read,'Bounded direct source',{channel:'resolve'})};}};
  const dispatchGateway=new ModelGateway({[provider.providerId]:dispatchProvider});
  for(const key of ['delegations','tools'] as const){
   const g=await make('budget-'+key),boundedEngine=await createSpecialistIntelligence({...normal,configs:configs({...limits,[key]:key==='tools'?1:0}),gateway:dispatchGateway});
   await direct(boundedEngine);
   if(key==='tools'){
    const child=await claimNextWorkForSpecialistAtomic(bundle.catalog.specialists.getAgent('source-specialist'),'tool-budget',5);assert(child);
    await assert.rejects(()=>boundedEngine.beforeTool({...child,params:{channel:'risk'}}),/DELEGATED_TASK_CHANGED/);
    await boundedEngine.beforeTool(child);
    await assert.rejects(()=>boundedEngine.beforeTool(child),/BUDGET_EXHAUSTED:tools/);
    assert.equal((await one('SELECT count(*)::int n FROM executions WHERE queue_id=$1',[child.queueId])).n,0);
    await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[child.queueId]);await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[child.goalId]);
    await boundedEngine.cancel(g.queue);await sleep(110);await direct(boundedEngine);
   }
   assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[g.queue])).state.phase,'BLOCKED');
  }
  console.log('PASS controls: tool-and-delegation-counters');
  const toolTime=await make('read-tool-timeout'),toolTimeEngine=await createSpecialistIntelligence({...normal,configs:configs({...limits,toolCallMs:50}),gateway:dispatchGateway});
  await direct(toolTimeEngine);
  const timedWork=await claimNextWorkForSpecialistAtomic(bundle.catalog.specialists.getAgent('source-specialist'),'bounded-read',5);assert(timedWork);
  await toolTimeEngine.beforeTool(timedWork);
  await assert.rejects(()=>toolTimeEngine.executeRead(timedWork,async()=>new Promise(()=>{})),/TOOL_TIMEOUT/);
  assert.equal((await one('SELECT count(*)::int n FROM executions WHERE queue_id=$1',[timedWork.queueId])).n,0);
  await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[timedWork.queueId]);await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[timedWork.goalId]);
  await toolTimeEngine.cancel(toolTime.queue);await sleep(110);await direct(toolTimeEngine);
  assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[toolTime.queue])).state.phase,'BLOCKED');
  console.log('PASS controls: read-timeout');
  const cancelledRead=await make('cancel-inflight-read'),cancelReadEngine=await createSpecialistIntelligence({...normal,gateway:dispatchGateway});await direct(cancelReadEngine);
  const cancelledWork=await claimNextWorkForSpecialistAtomic(bundle.catalog.specialists.getAgent('source-specialist'),'cancel-read',5);assert(cancelledWork);await cancelReadEngine.beforeTool(cancelledWork);
  let finishRead!:(v:any)=>void,startedRead!:()=>void;const readStarted=new Promise<void>(r=>startedRead=r);
  const pendingRead=cancelReadEngine.executeRead(cancelledWork,async()=>{startedRead();return new Promise(r=>finishRead=r);});await readStarted;await cancelReadEngine.cancel(cancelledRead.queue);
  finishRead({result:{value:'27'},evidence:{readback:true}});await assert.rejects(()=>pendingRead,/CANCELLED_OR_EXPIRED/);
  await assert.rejects(()=>recordExecutionAndRequestVerificationAtomic({queueId:cancelledWork.queueId,fencingToken:cancelledWork.fencingToken,actor:'late-fixture',result:{value:'27'},evidence:{readback:true}}),/CANCELLED_OR_EXPIRED/);
  await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[cancelledWork.queueId]);await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[cancelledWork.goalId]);
  await sleep(110);await direct(cancelReadEngine);
  console.log('PASS controls: cancel-inflight-read');
  const priced=validateProductionBundle({...bundle.raw,toolDefinitions:bundle.raw.toolDefinitions.map(t=>({...t,costUpperBoundUsd:t.capabilityId===read?0.02:0}))});
  const pricedGoal=await make('priced-tool-budget'),pricedEngine=await createSpecialistIntelligence({configs:configs({...limits,costUsd:0.04}),catalog:priced.catalog,tools:priced.tools,gateway:dispatchGateway});await direct(pricedEngine);
  const pricedWork=await claimNextWorkForSpecialistAtomic(bundle.catalog.specialists.getAgent('source-specialist'),'priced-read',5);assert(pricedWork);
  await assert.rejects(()=>pricedEngine.beforeTool(pricedWork),/BUDGET_EXHAUSTED:costUsd/);
  await pool.query("UPDATE work_queue SET status='FAILED' WHERE id=$1",[pricedWork.queueId]);await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[pricedWork.goalId]);
  await pricedEngine.cancel(pricedGoal.queue);await sleep(110);await direct(pricedEngine);
  console.log('PASS controls: tool-cost');
  const money=await make('cumulative-money'),moneyEngine=await createSpecialistIntelligence({...normal,configs:configs({...limits,costUsd:0.04})});
  await direct(moneyEngine);await sleep(110);await direct(moneyEngine);
  const used=(await one('SELECT used FROM specialist_budgets WHERE root_queue_id=$1',[money.queue])).used;
  assert.equal(used.models,1);assert(used.costUsd>0&&used.costUsd<=0.04);
  console.log('PASS controls: cumulative-model-cost');
  let entered!:()=>void,finish!:(v:any)=>void;const started=new Promise<void>(r=>entered=r);
  const slow:ModelProviderAdapter={...provider,async invoke(){entered();return new Promise(r=>finish=r);}};
  const late=await make('cancel-inflight'),lateEngine=await createSpecialistIntelligence({...normal,gateway:new ModelGateway({[provider.providerId]:slow})});
  const pending=direct(lateEngine);await started;await lateEngine.cancel(late.queue);
  finish({model:'fixture',usage:{inputTokens:1,outputTokens:1},output:dispatch(read,'Late forbidden dispatch',{channel:'resolve'})});await pending;
  assert.equal((await one('SELECT count(*)::int n FROM specialist_delegations WHERE parent_queue_id=$1',[late.queue])).n,0);
  assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[late.queue])).state.phase,'BLOCKED');
  console.log('PASS controls: cancel-inflight-model');
  const timeoutProvider:ModelProviderAdapter={...provider,async invoke(){await sleep(150);return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:dispatch(read,'Too late',{channel:'resolve'})};}};
  const timeoutGoal=await make('late-timeout'),timeoutEngine=await createSpecialistIntelligence({...normal,configs:configs({...limits,modelCallMs:50}),gateway:new ModelGateway({[provider.providerId]:timeoutProvider})});
  await direct(timeoutEngine);await sleep(180);
  assert.equal((await one('SELECT count(*)::int n FROM specialist_delegations WHERE parent_queue_id=$1',[timeoutGoal.queue])).n,0);
  assert.equal((await one('SELECT state FROM specialist_sessions WHERE queue_id=$1',[timeoutGoal.queue])).state.phase,'BLOCKED');
  console.log('PASS controls: model-timeout');
  const narrowGoal=await make('narrow-child-model-allowance');
  const narrowConfigs=configs();narrowConfigs[1].limits={...limits,models:0};
  const delegateProvider:ModelProviderAdapter={...provider,async invoke(){return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:dispatch(market,'Narrow child task',{objective:'Narrow child task'})};}};
  const narrowEngine=await createSpecialistIntelligence({...normal,configs:narrowConfigs,gateway:new ModelGateway({[provider.providerId]:delegateProvider})});await direct(narrowEngine);
  const narrowResult=await runOneSpecialistWork({agent:bundle.catalog.specialists.getAgent('market-specialist'),workerInstanceId:'narrow-child',ttlSeconds:5,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools}),advancers:narrowEngine.advancers});assert(narrowResult.processed);
  const childBudget=await one('SELECT state,used FROM specialist_sessions WHERE queue_id=$1',[narrowResult.queueId]);assert.equal(childBudget.state.phase,'BLOCKED');assert.equal(childBudget.used.models,0);
  assert.match(childBudget.state.reason,/AGENT_BUDGET_EXHAUSTED:models/);
  assert.equal((await one('SELECT used FROM specialist_budgets WHERE root_queue_id=$1',[narrowGoal.queue])).used.models,1);
  await narrowEngine.cancel(narrowGoal.queue);await sleep(110);await direct(narrowEngine);
  console.log('PASS narrowed child model budget enforced independently of available family budget');
  const unsafe={...bundle.raw,toolDefinitions:bundle.raw.toolDefinitions.map(d=>({...d,sideEffect:true}))};const bad=validateProductionBundle(unsafe);
  await assert.rejects(()=>createSpecialistIntelligence({...normal,catalog:bad.catalog,tools:bad.tools}),/READ_SCOPE_REQUIRED/);
  const wrongCompany=validateProductionBundle({...bundle.raw,capabilities:bundle.raw.capabilities.map(c=>({...c,companyScopes:[process.env.FIXTURE_FOREIGN!]})),toolDefinitions:bundle.raw.toolDefinitions.map(t=>({...t,companyScopes:[process.env.FIXTURE_FOREIGN!]}))});
  await assert.rejects(()=>createSpecialistIntelligence({...normal,catalog:wrongCompany.catalog,tools:wrongCompany.tools}),/READ_SCOPE_REQUIRED/);
  const unsupported:ModelProviderAdapter={providerId:provider.providerId,async invoke(){throw Error('MUST_NOT_INVOKE_LIVE_ADAPTER');}};
  const bounded={maxInputTokens:100,maxOutputTokens:100,reserveAttempt:async()=>{throw Error('SHOULD_NOT_RESERVE');}};
  await assert.rejects(()=>new ModelGateway({[provider.providerId]:unsupported}).invoke({task:'specialist_reasoning',capability:'specialist_reasoning',dataClassification:'INTERNAL',input:{},boundedSynthetic:bounded}),/SYNTHETIC_ADAPTER_REQUIRED/);
  await assert.rejects(()=>gateway.invoke({task:'specialist_reasoning',capability:'specialist_reasoning',dataClassification:'INTERNAL',input:'oversized',boundedSynthetic:{...bounded,maxInputTokens:1}}),/INPUT_BUDGET_INVALID/);
  console.log('PASS model/token/cost/iteration/time limits, cancellation, unauthorized dynamic capability denied, side effects and unbounded/live adapters refused');
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
