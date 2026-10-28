import {aggregateForHermes,validateInterpretation,ANALYSIS_SEMANTIC_POLICY} from '../../apps/production/src/hermesDataAnalysis';
/** Real SAM handler/SQL/execution/verification/readback; all model HTTP is synthetic. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {writeFile,readFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {ANALYST,SOURCE} from '../../apps/production/src/dataAnalysisContract';
import {createKernelProductionDispatcher} from '../../apps/production/src/dispatcher';
import {createChatGPTToolSurface} from '../../apps/chatgpt-tools/src/surface';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {followupFixture,owner,OTHER,answer,readStrictPrivateFixture} from './hermes_source_followup_fixture';

test('follow-up: source mismatches and non-owner fail before admission, model or source access',async()=>{
 const f=await followupFixture();
 try{
  const args={objective:'Already verified source follow-up',legal_entity_id:f.entity,source_binding:f.binding};
  const denied=await f.surface.invoke('sam_submit_analysis_followup',args,{...owner,systemOwner:false});
  assert.equal(denied.ok,false);
  for(const objective of [null,1,true,{},[],undefined])await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',{...args,objective},owner),Error);
  await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',{...args,unexpected:'refused'},owner),Error);
  const changes:any[]=[{sourceExecutionId:'00000000-0000-4000-8000-000000000090'},
   {sourceGoalId:'00000000-0000-4000-8000-000000000091'},{sourcePlanId:'00000000-0000-4000-8000-000000000092'},
   {sourceVerificationId:'00000000-0000-4000-8000-000000000093'},{sourceHash:'0'.repeat(64)},
   {sourceExecutionHash:'0'.repeat(64)},{sourcePlanHash:'0'.repeat(64)},{legalEntityId:OTHER},
   {startDate:'2026-10-25'},{endDate:'2026-10-27'},{timeZone:'UTC'},{unexpected:'not permitted'}];
  for(const change of changes)await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',
   {...args,source_binding:{...f.binding,...change}},owner),Error,JSON.stringify(change));
  for(const state of ['COMPLETED','CANCELLED']){
   await f.query('UPDATE goals SET state=$2 WHERE id=$1',[f.oldGoal,state]);
   try{await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',args,owner),/SOURCE/);}
   finally{await f.query("UPDATE goals SET state='FAILED' WHERE id=$1",[f.oldGoal]);}
  }
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,1);
  assert.equal((await f.query('SELECT count(*)::int n FROM work_queue')).rows[0].n,2);
  assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: SELECT-only verification metadata needs no row-lock privilege while mutable proof stays locked',async()=>{
 const f=await followupFixture();
 let sourceSql='',sourceArgs:any[]=[];
 try{
  const {loadVerifiedFollowupSource}=await import('../../apps/production/src/hermesSourceFollowup');
  f.setBeforeQuery(async(text,args)=>{if(text.includes('source_plan_version')&&text.includes('FROM executions e JOIN work_queue sw')){sourceSql=text;sourceArgs=args;}});
  await loadVerifiedFollowupSource({query:f.query},f.binding,f.entity);f.setBeforeQuery(undefined);
  const metadataBefore=(await f.query('SELECT * FROM verification_contracts WHERE capability_id=$1',[SOURCE])).rows[0];
  assert.match(sourceSql,/FOR SHARE OF e,sw,sg,sp,v\s*$/,'Mutable execution/work/goal/plan/verification rows must remain share-locked');
  const legacySql=sourceSql.replace(/FOR SHARE OF e,sw,sg,sp,v\s*$/,'FOR SHARE OF e,sw,sg,sp,v,vc');
  await f.sql.exec(`CREATE ROLE sam_followup_contract_reader;
   GRANT USAGE ON SCHEMA public TO sam_followup_contract_reader;
   GRANT SELECT,UPDATE ON executions,work_queue,goals,plans,verifications TO sam_followup_contract_reader;
   GRANT SELECT ON verification_contracts TO sam_followup_contract_reader;
   SET ROLE sam_followup_contract_reader;`);
  const privileges=async()=>(await f.query("SELECT has_table_privilege(current_user,'verification_contracts','SELECT') AS can_select,has_table_privilege(current_user,'verification_contracts','UPDATE') AS can_update")).rows[0];
  assert.deepEqual(await privileges(),{can_select:true,can_update:false});
  let legacyState:string|undefined;
  await assert.rejects(()=>f.query(legacySql,sourceArgs),(error:any)=>{legacyState=error.code;return error.code==='42501';},'Historical vc row lock requires UPDATE metadata privilege');
  const checked=await loadVerifiedFollowupSource({query:f.query},f.binding,f.entity);
  assert.equal(checked.source.id,f.binding.sourceExecutionId);assert.deepEqual(checked.binding,f.binding);
  assert.deepEqual(await privileges(),{can_select:true,can_update:false},'Fix must not require granting UPDATE on metadata');
  await f.sql.exec("RESET ROLE; UPDATE verification_contracts SET must_not_trust_execution_result=false WHERE capability_id='bol_sales_stock_report'; SET ROLE sam_followup_contract_reader;");
  await assert.rejects(()=>loadVerifiedFollowupSource({query:f.query},f.binding,f.entity),{message:'ANALYSIS_VERIFIED_SOURCE_BINDING_DENIED'},'Read-only contract flags must still be enforced');
  assert.deepEqual(await privileges(),{can_select:true,can_update:false});
  await f.sql.exec('RESET ROLE');
  await f.query('UPDATE verification_contracts SET must_not_trust_execution_result=$2 WHERE id=$1',[metadataBefore.id,metadataBefore.must_not_trust_execution_result]);
  assert.deepEqual((await f.query('SELECT * FROM verification_contracts WHERE id=$1',[metadataBefore.id])).rows[0],metadataBefore,'Restore the exact original metadata row');
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
  console.log(JSON.stringify({kind:'LOCAL_SELECT_ONLY_CONTRACT_PERMISSION_REGRESSION',legacySqlState:legacyState,patchedLoader:'accepted',contractSelectPrivilege:true,contractUpdatePrivilege:false,contractFlagFalse:'ANALYSIS_VERIFIED_SOURCE_BINDING_DENIED',metadataRowRestored:true,mutableProofLocks:['e','sw','sg','sp','v']}));
 }finally{f.setBeforeQuery(undefined);await f.sql.exec('RESET ROLE');await f.close();}
});

test('follow-up: exact source creates one analyst task and admission deduplicates concurrent calls and later windows',async()=>{
 const f=await followupFixture();
 try{
  const upper=Object.fromEntries(Object.entries(f.binding).map(([key,value])=>[key,key.endsWith('Id')?String(value).toUpperCase():value]));
  assert.notEqual(upper.sourceExecutionId,f.binding.sourceExecutionId);assert.notEqual(f.entity.toUpperCase(),f.entity);
  const [a,b]=await Promise.all([f.submit(),f.submit({objective:'Different wording, same proof',legal_entity_id:f.entity.toUpperCase(),source_binding:upper})]);
  assert.equal(a.goalId,b.goalId);assert.equal([a.status,b.status].filter(x=>x==='QUEUED').length,1);
  const admission=a.status==='QUEUED'?a:b;
  const queue=(await f.query('SELECT * FROM work_queue WHERE goal_id=$1',[admission.goalId])).rows;
  assert.equal(queue.length,1);assert.equal(queue[0].capability_id,ANALYST);assert.equal(queue[0].step_key,'analysis');assert.deepEqual(queue[0].depends_on,[]);
  assert.equal((await f.query('SELECT count(*)::int n FROM executions')).rows[0].n,1,'No source execution is fabricated');
  const saved=(await f.query('SELECT goal_assumptions FROM plans WHERE id=$1',[admission.planId])).rows[0];
  assert.deepEqual(saved.goal_assumptions.sourceReuse,f.binding);
  const nextPolicy={...f.policy,activatedAt:new Date(Date.now()-500).toISOString(),expiresAt:new Date(Date.now()+10*60000).toISOString()};
  const nextSurface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(f.makeBundle(nextPolicy))});
  const replay=await f.submit({objective:'Another window must not permit a duplicate',legal_entity_id:f.entity.toUpperCase(),source_binding:upper},nextSurface);
  assert.equal(replay.status,'EXISTING');assert.equal(replay.goalId,admission.goalId);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,2);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1,'Admission does not reserve or spend');
  const lockIndex=f.queries.findIndex(sql=>sql.includes("pg_advisory_xact_lock(hashtext('sam-hermes-data-analysis-admission'))"));
  const dedupIndex=f.queries.findIndex(sql=>sql.includes("p.goal_assumptions->'sourceReuse'->>'sourceExecutionId'"));
  assert.ok(lockIndex>f.queries.lastIndexOf('BEGIN',lockIndex)&&lockIndex<dedupIndex,'Admission transaction executes its lock before durable dedup lookup');
  assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: both admission and runtime reject a follow-up window longer than thirty minutes',async()=>{
 const f=await followupFixture();
 try{
  const widePolicy={...f.policy,expiresAt:new Date(Date.parse(f.policy.activatedAt)+31*60000).toISOString()};
  const wideBundle=f.makeBundle(widePolicy),wideSurface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(wideBundle)});
  await assert.rejects(()=>wideSurface.invoke('sam_submit_analysis_followup',{objective:'Excessive follow-up window',legal_entity_id:f.entity,source_binding:f.binding},owner),/WINDOW/);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,1,'Invalid admission creates no goal');
  const admission=await f.submit(),queueId=admission.queueIds[0];
  const {leaseWorkAtomic}=await import('../../apps/kernel/src/queue');
  const lease=await leaseWorkAtomic(queueId,'synthetic-followup-worker',300);
  const request={capabilityId:ANALYST,idempotencyKey:queueId,params:lease.work.params,executionContext:{queueId,fencingToken:lease.token}};
  await assert.rejects(()=>wideBundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute(request),/WINDOW/);
  assert.equal(f.wire.length,0);assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1,'Invalid runtime never reserves a new model call');
  assert.equal((await f.query('SELECT handoff FROM work_queue WHERE id=$1',[queueId])).rows[0].handoff,null);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: runtime cannot substitute a different thirty-minute authorization window',async()=>{
 const f=await followupFixture();
 try{
  const admission=await f.submit(),queueId=admission.queueIds[0];
  const shifted={...f.policy,activatedAt:new Date(Date.parse(f.policy.activatedAt)-1000).toISOString(),expiresAt:new Date(Date.parse(f.policy.expiresAt)-1000).toISOString()};
  const runtime=f.makeBundle(shifted),{leaseWorkAtomic}=await import('../../apps/kernel/src/queue');
  const lease=await leaseWorkAtomic(queueId,'synthetic-followup-worker',300);
  await assert.rejects(()=>runtime.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute({capabilityId:ANALYST,idempotencyKey:queueId,params:lease.work.params,executionContext:{queueId,fencingToken:lease.token}}),/WINDOW/);
  assert.equal(f.wire.length,0);assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: a distinct valid second source is blocked by the same-window task ceiling',async()=>{
 const f=await followupFixture();
 try{
  await f.submit();const second=await f.addSecondSource();
  const {loadVerifiedFollowupSource}=await import('../../apps/production/src/hermesSourceFollowup');
  await loadVerifiedFollowupSource({query:f.query},second,f.entity);
  await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',{objective:'Second independent source',legal_entity_id:f.entity,source_binding:second},owner),/TASK_CEILING/);
  assert.equal((await f.query("SELECT count(*)::int n FROM goals WHERE state='EXECUTING'")).rows[0].n,1);
  assert.equal((await f.query("SELECT count(*)::int n FROM work_queue WHERE status='QUEUED'")).rows[0].n,1);
  assert.equal(f.wire.length,0);assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: source proof is rechecked before model access and independent verification',async()=>{
 const f=await followupFixture();
 try{
  const admission=await f.submit();
  const queueId=admission.queueIds[0];
  // Lease once, then prove all pre-model failures leave the new receipt/reservation untouched.
  const {leaseWorkAtomic}=await import('../../apps/kernel/src/queue');
  const lease=await leaseWorkAtomic(queueId,'synthetic-followup-worker',300),adapter=f.bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!;
  const request={capabilityId:ANALYST,idempotencyKey:queueId,params:lease.work.params,executionContext:{queueId,fencingToken:lease.token}};
  const tamper=[
   {sql:'UPDATE goals SET company_scope=$2 WHERE id=$1',args:[f.oldGoal,OTHER],undo:'UPDATE goals SET company_scope=$2 WHERE id=$1',restore:[f.oldGoal,f.entity]},
   {sql:"UPDATE executions SET evidence=jsonb_set(evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",args:[f.binding.sourceExecutionId,'0'.repeat(64)],undo:"UPDATE executions SET evidence=jsonb_set(evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",restore:[f.binding.sourceExecutionId,f.binding.sourceHash]},
   {sql:"UPDATE verifications SET result='FAILED' WHERE id=$1",args:[f.binding.sourceVerificationId],undo:"UPDATE verifications SET result='VERIFIED' WHERE id=$1",restore:[f.binding.sourceVerificationId]},
   {sql:"UPDATE executions SET result=jsonb_set(result,'{startDate}','\"2026-10-25\"'::jsonb) WHERE id=$1",args:[f.binding.sourceExecutionId],undo:"UPDATE executions SET result=jsonb_set(result,'{startDate}',to_jsonb($2::text)) WHERE id=$1",restore:[f.binding.sourceExecutionId,f.binding.startDate]},
   {sql:"UPDATE executions SET params=params||'{\"fixtureTamper\":\"changed\"}'::jsonb WHERE id=$1",args:[f.binding.sourceExecutionId],undo:"UPDATE executions SET params=params-'fixtureTamper' WHERE id=$1",restore:[f.binding.sourceExecutionId]},
   {sql:"UPDATE executions SET evidence=evidence||'{\"fixtureTamper\":\"changed\"}'::jsonb WHERE id=$1",args:[f.binding.sourceExecutionId],undo:"UPDATE executions SET evidence=evidence-'fixtureTamper' WHERE id=$1",restore:[f.binding.sourceExecutionId]},
   {sql:"UPDATE plans SET goal_assumptions=goal_assumptions||'{\"fixtureTamper\":\"changed\"}'::jsonb WHERE id=$1",args:[f.oldPlan],undo:"UPDATE plans SET goal_assumptions=goal_assumptions-'fixtureTamper' WHERE id=$1",restore:[f.oldPlan]}
  ];
  for(const item of tamper){
   await f.query(item.sql,item.args);await assert.rejects(()=>adapter.execute(request),/SOURCE/);await f.query(item.undo,item.restore);
  }
  assert.equal(f.wire.length,0);assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);
  const outcome=await adapter.execute(request);
  const {recordExecutionAndRequestVerificationAtomic}=await import('../../apps/kernel/src/execution');
  const execution=await recordExecutionAndRequestVerificationAtomic({queueId,fencingToken:lease.token,actor:'synthetic-followup-worker',...outcome});
  const verifier=f.bundle.verifiers.get(ANALYST)!;
  for(const item of tamper){
   await f.query(item.sql,item.args);
   const result=await verifier.verify({execution:{id:execution.executionId,capabilityId:ANALYST,params:lease.work.params,...outcome,operationKeyRef:null},contract:{id:'synthetic-contract',method:'external_event',requiredEvidenceFields:{},independentQueryTemplate:{}}});
   assert.equal(result.result,'FAILED',item.sql);await f.query(item.undo,item.restore);
  }
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.sourceCalls,0);
 }finally{await f.close();}
});

async function completeLocally(privateTimeline?:string,syntheticOptions:{sourceReport?:any;objective?:string}={}){
 const f=await followupFixture(privateTimeline,answer,syntheticOptions);
 try{
  const admission=await f.submit(),executed=await f.execute(admission);
  const wireCount=f.wire.filter(w=>w.path==='/v1/runs').length;
  assert.equal(wireCount,1);
  const submitted=f.wire.find(w=>w.path==='/v1/runs')!.body,input=JSON.parse(submitted.input),prompt=JSON.parse(input.instructions);
  assert.equal(prompt.requestedAnalysis,f.objective,'Owner objective must be included in the real submitted instructions');
  assert.deepEqual(prompt.source.authorizationWindow,{activatedAt:f.policy.activatedAt,expiresAt:f.policy.expiresAt});
  assert.ok(input.instructions.length<=16000);
  const adapter=f.bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!;
  const replay=await adapter.execute(executed.request);
  assert.deepEqual(replay,executed.outcome);assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1,'Durable receipt prevents another model submission');
  const recorded=await executed.record();
  assert.equal((await f.query('SELECT state FROM goals WHERE id=$1',[admission.goalId])).rows[0].state,'VERIFYING');
  const reserved=(await f.query('SELECT * FROM model_calls ORDER BY created_at,id')).rows as Record<string,any>[];
  assert.equal(reserved.length,2);assert.ok(reserved.every(r=>r.cost===0.15&&r.retry_count===0&&r.verification_result==='RESERVED_USAGE_UNKNOWN'));
  assert.equal(reserved.filter(r=>r.task==='hermes:'+executed.request.executionContext.queueId).length,1,'Fresh task uses a separate conservative reservation');
  const verification=await verifyNextExecution(f.bundle);assert.equal(verification.processed,true);assert.equal(verification.executionId,recorded.executionId);
  const timeline=await f.surface.invoke('sam_get_goal_timeline',{goal_id:admission.goalId},owner);assert.equal(timeline.ok,true);
  const data=timeline.data as any;assert.equal(data.goal.state,'COMPLETED');assert.equal(data.work.length,1);assert.equal(data.executions.length,1);assert.equal(data.verifications.length,1);assert.equal(data.reports.length,1);
  const saved=data.reports[0];assert.match(saved.id,/^[a-f0-9-]{36}$/);assert.equal(saved.report_hash,sha256Hex(saved.decision));assert.equal(saved.decision.status,'complete');
  const expectedInterpretation=validateInterpretation(answer,aggregateForHermes(f.sourceReport));
  const expectedReport={source:f.sourceReport,sourceExecutionId:f.binding.sourceExecutionId,sourceHash:f.binding.sourceHash,sourceReuse:f.binding,hermesRunId:'run_synthetic_followup',semanticPolicy:ANALYSIS_SEMANTIC_POLICY,interpretation:expectedInterpretation,
   analysisCoverage:{sourceProducts:f.sourceReport.products.length,sentProducts:Math.min(30,f.sourceReport.products.length),subset:f.sourceReport.products.length>30},
   limitations:[...f.sourceReport.limitations,'Reference selection only; all displayed statements are derived from verified source by SAM. Free-form narrative is unavailable. Price sums do not establish currency, tax treatment, profit or a causal shipping explanation.']};
  assert.deepEqual(saved.decision.report,expectedReport,'Readback must contain the complete exact source and expected synthetic interpretation');
  assert.deepEqual(saved.decision.sourceReuse,f.binding);assert.deepEqual(saved.decision.report.sourceReuse,f.binding);
  assert.equal(saved.decision.report.sourceExecutionId,f.binding.sourceExecutionId);assert.equal(saved.decision.report.sourceHash,f.binding.sourceHash);
  assert.equal(saved.decision.report.interpretation.summary,expectedInterpretation.summary);assert.equal(saved.decision.report.interpretation.classification,'SOURCE_DERIVED');
  assert.equal(saved.decision.verificationId,verification.verificationId);assert.equal(saved.decision.executionId,recorded.executionId);
  const v=data.verifications[0];
  assert.deepEqual(saved.decision,{status:'complete',summary:expectedInterpretation.summary,classification:'SOURCE_DERIVED',sourceReuse:f.binding,executionId:recorded.executionId,verificationId:v.id,report:expectedReport});
  const receipt=data.work[0].handoff.hermes;
  assert.equal(receipt.taskHash,sha256Hex({task_id:data.work[0].id,goal_id:admission.goalId,agent_role:'data_analyst',instructions:input.instructions,allowed_tools:[],repository_scope:[],execution_budget:{max_cost_usd:0.15,max_concurrency:1},timeout:120000,created_at:new Date(data.work[0].created_at).toISOString()}));
  assert.ok(f.queries.some(sql=>/FOR SHARE OF p,w/.test(sql)),'Final report transaction must issue plan/work share locks');
  const reused=await recordIndependentVerificationAtomic({executionId:recorded.executionId,verifier:v.verifier,contractId:v.contract_id,independentEvidence:v.independent_evidence,result:'VERIFIED'});
  assert.equal(reused,v.id);assert.equal((await verifyNextExecution(f.bundle)).processed,false);
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,1);assert.equal((await f.query('SELECT count(*)::int n FROM executions WHERE capability_id=$1',[SOURCE])).rows[0].n,1);
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.sourceCalls,0);
  const proof={classification:'LOCAL_OFFLINE_SYNTHETIC_MODEL_NOT_LIVE_ACCEPTANCE',fixtureScope:syntheticOptions.sourceReport?'Preserved report shape and objective with synthetic provenance, verification, and model; prompt compatibility only':privateTimeline?'Strict common-column projection of captured original records, not a full production database replay':'Synthetic preexisting evidence',goalId:admission.goalId,planId:admission.planId,executionId:recorded.executionId,verificationId:verification.verificationId,reportId:saved.id,reportHash:saved.report_hash,decision:saved.decision,sourceBinding:f.binding,report:saved.decision.report,receipt,promptCharacters:input.instructions.length,originalRecordsHash:f.originalHash,
   sourceCollectorCalls:f.sourceCalls,syntheticModelSubmissions:wireCount,sourceExecutionCount:1,newAnalysisExecutionCount:1,modelReservations:reserved.map(r=>({id:r.id,task:r.task,cost:r.cost,verification_result:r.verification_result,retry_count:r.retry_count}))};
  if(process.env.SAM_HERMES_FOLLOWUP_EVIDENCE_FILE)await writeFile(process.env.SAM_HERMES_FOLLOWUP_EVIDENCE_FILE,JSON.stringify(proof,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({kind:'LOCAL_FOLLOWUP_ACCEPTED_REPORT',fixtureScope:proof.fixtureScope,promptCharacters:proof.promptCharacters,goalId:proof.goalId,reportId:proof.reportId,reportHash:proof.reportHash,sourceExecutionId:f.binding.sourceExecutionId,sourceCollectorCalls:0,syntheticModelSubmissions:1}));
 }finally{await f.close();}
}
test('follow-up: actual handler, receipt, kernel verification and SAM timeline persist one accepted local report',()=>completeLocally());

test('follow-up: report insert failure rolls verification/completion back, then retry saves once without another model call',async()=>{
 const f=await followupFixture();
 try{
  const admission=await f.submit(),executed=await f.execute(admission),recorded=await executed.record();
  await f.sql.exec(`CREATE FUNCTION reject_report() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'SYNTHETIC_REPORT_WRITE_FAILURE';END$$;
   CREATE TRIGGER reject_report BEFORE INSERT ON goal_read_reviews FOR EACH ROW EXECUTE FUNCTION reject_report();`);
  await assert.rejects(()=>verifyNextExecution(f.bundle),/SYNTHETIC_REPORT_WRITE_FAILURE/);
  assert.equal((await f.query('SELECT state FROM goals WHERE id=$1',[admission.goalId])).rows[0].state,'VERIFYING');
  assert.equal((await f.query('SELECT count(*)::int n FROM verifications WHERE execution_id=$1',[recorded.executionId])).rows[0].n,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);
  await f.sql.exec('DROP TRIGGER reject_report ON goal_read_reviews');
  assert.equal((await verifyNextExecution(f.bundle)).processed,true);
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,1);
  assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1);assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: source tampering between independent check and atomic report save is rejected and rolled back',async()=>{
 const f=await followupFixture();
 try{
  const admission=await f.submit(),executed=await f.execute(admission),recorded=await executed.record();
  let injected=false;
  f.setBeforeQuery(async text=>{if(!injected&&/^INSERT INTO verifications\s/.test(text.trim())){
   injected=true;await f.rawQuery("UPDATE executions SET evidence=jsonb_set(evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",[f.binding.sourceExecutionId,'0'.repeat(64)]);
  }});
  await assert.rejects(()=>verifyNextExecution(f.bundle),/SOURCE/);assert.equal(injected,true);f.setBeforeQuery(undefined);
  assert.equal((await f.query('SELECT state FROM goals WHERE id=$1',[admission.goalId])).rows[0].state,'VERIFYING');
  assert.equal((await f.query('SELECT count(*)::int n FROM verifications WHERE execution_id=$1',[recorded.executionId])).rows[0].n,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
  assert.equal((await verifyNextExecution(f.bundle)).processed,true);assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1);
 }finally{await f.close();}
});

test('follow-up: verified analysis result, evidence and receipt cannot change before atomic report persistence',async()=>{
 const f=await followupFixture();
 try{
  const admission=await f.submit(),executed=await f.execute(admission),recorded=await executed.record();
  const initial=(await f.query('SELECT result,evidence FROM executions WHERE id=$1',[recorded.executionId])).rows[0];
  const payloadHash=sha256Hex(initial);
  const context=async()=>({goal:(await f.query('SELECT objective FROM goals WHERE id=$1',[admission.goalId])).rows[0],plan:(await f.query('SELECT goal_assumptions FROM plans WHERE id=$1',[admission.planId])).rows[0]});
  const contextHash=sha256Hex(await context());
  const injections=[
   ()=>f.rawQuery("UPDATE executions SET result=jsonb_set(result,'{report,interpretation,summary}','\"Changed after independent verification\"'::jsonb) WHERE id=$1",[recorded.executionId]),
   ()=>f.rawQuery("UPDATE executions SET evidence=jsonb_set(evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",[recorded.executionId,'0'.repeat(64)]),
   ()=>f.rawQuery("UPDATE work_queue SET handoff=jsonb_set(handoff,'{hermes,output}','\"Changed durable receipt\"'::jsonb) WHERE id=$1",[executed.request.executionContext.queueId]),
   ()=>f.rawQuery('UPDATE goals SET objective=$2 WHERE id=$1',[admission.goalId,'Changed objective after independent verification']),
   ()=>f.rawQuery("UPDATE plans SET goal_assumptions=goal_assumptions||'{\"contextTamper\":true}'::jsonb WHERE id=$1",[admission.planId])
  ];
  for(const mutate of injections){
   let injected=false;
   f.setBeforeQuery(async text=>{if(!injected&&/^INSERT INTO verifications\s/.test(text.trim())){injected=true;await mutate();}});
   await assert.rejects(()=>verifyNextExecution(f.bundle),/ANALYSIS_FOLLOWUP_(VERIFICATION_PAYLOAD_CHANGED|VERIFICATION_CONTEXT_CHANGED|REPORT_BINDING_DENIED)/);assert.equal(injected,true);f.setBeforeQuery(undefined);
   assert.equal((await f.query('SELECT state FROM goals WHERE id=$1',[admission.goalId])).rows[0].state,'VERIFYING');
   assert.equal((await f.query('SELECT count(*)::int n FROM verifications WHERE execution_id=$1',[recorded.executionId])).rows[0].n,0);
   assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);
   assert.equal(sha256Hex((await f.query('SELECT result,evidence FROM executions WHERE id=$1',[recorded.executionId])).rows[0]),payloadHash);
   assert.equal(sha256Hex(await context()),contextHash);
   assert.equal(sha256Hex(await f.original()),f.originalHash);
  }
  assert.equal((await verifyNextExecution(f.bundle)).processed,true);assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1);
 }finally{await f.close();}
});

test('follow-up: verification or acceptance failure stops only the new goal without report or another model request',async()=>{
 for(const failure of ['verification','acceptance']){
  const f=await followupFixture();
  try{
   const admission=await f.submit(),executed=await f.execute(admission),recorded=await executed.record();
   if(failure==='verification')await f.query("UPDATE executions SET result=result-'sourceReuse' WHERE id=$1",[recorded.executionId]);
   else{
    const goal=(await f.query('SELECT completion_definition FROM goals WHERE id=$1',[admission.goalId])).rows[0],contract=JSON.parse(goal.completion_definition.slice('sam.acceptance/v1:'.length));
    contract.constraints.find((c:any)=>c.result.field==='sourceHash').result.equals='0'.repeat(64);
    await f.query('UPDATE goals SET completion_definition=$2 WHERE id=$1',[admission.goalId,'sam.acceptance/v1:'+JSON.stringify(contract)]);
   }
   assert.equal((await verifyNextExecution(f.bundle)).processed,true);
   assert.equal((await f.query('SELECT state FROM goals WHERE id=$1',[admission.goalId])).rows[0].state,'FAILED',failure);
   assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,0);
   assert.equal((await verifyNextExecution(f.bundle)).processed,false);
   await assert.rejects(()=>f.bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute(executed.request),/NO_LONGER_AUTHORIZED/);
   assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1);
   const replay=await f.submit();assert.equal(replay.status,'EXISTING');assert.equal(replay.goalId,admission.goalId);
   assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,2);
   assert.equal(sha256Hex(await f.original()),f.originalHash);
  }finally{await f.close();}
 }
});

if(process.env.SAM_HERMES_REUSE_TIMELINE_FILE)test('follow-up: strict original private projection reuses the exact source through local save and SAM readback',async()=>{
 const path=process.env.SAM_HERMES_REUSE_TIMELINE_FILE!;
 for(const key of ['SAM_HERMES_REUSE_BINDING_FILE','SAM_HERMES_REUSE_CONTRACTS_FILE','SAM_HERMES_REUSE_RESERVATION_FILE','SAM_HERMES_REUSE_PREPARED_REQUEST_FILE']){
  const saved=process.env[key];delete process.env[key];
  try{await assert.rejects(()=>readStrictPrivateFixture(path),/Private fixture requires/);}finally{if(saved!==undefined)process.env[key]=saved;}
 }
 const temporary=await mkdtemp(join(tmpdir(),'sam-followup-private-proof-'));
 try{
  const saved=JSON.parse(await readFile(path,'utf8'));saved.data.executions=[];
  const missing=join(temporary,'missing-source.json');await writeFile(missing,JSON.stringify(saved));
  await assert.rejects(()=>followupFixture(missing),/Missing exact private source/);
 }finally{await rm(temporary,{recursive:true,force:true});}
 await completeLocally(path);
});

async function rejectCandidateWithoutSuccess(candidate:string){
 const f=await followupFixture(undefined,candidate);
 try{
  const admission=await f.submit(),request=await f.prepare(admission),queueId=request.executionContext.queueId;
  const adapter=f.bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!;
  await assert.rejects(()=>adapter.execute(request));
  const receipt=(await f.query('SELECT handoff FROM work_queue WHERE id=$1',[queueId])).rows[0].handoff.hermes;
  assert.equal(receipt.status,'completed');assert.equal(receipt.output,candidate,'Retain exact rejected output in durable receipt');
  const receiptHash=sha256Hex(receipt),wireCount=f.wire.length;
  await assert.rejects(()=>adapter.execute(request));
  assert.equal(f.wire.length,wireCount,'Replay of completed rejected receipt makes no HTTP requests');
  assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1,'No retry POST after rejected interpretation');
  assert.equal(sha256Hex((await f.query('SELECT handoff FROM work_queue WHERE id=$1',[queueId])).rows[0].handoff.hermes),receiptHash);
  assert.equal((await f.query('SELECT count(*)::int n FROM executions WHERE goal_id=$1',[admission.goalId])).rows[0].n,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM goal_read_reviews WHERE goal_id=$1',[admission.goalId])).rows[0].n,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls WHERE task=$1',['hermes:'+queueId])).rows[0].n,1);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,2,'Original unresolved reservation is retained');
  assert.equal((await verifyNextExecution(f.bundle)).processed,false);
  const timeline=await f.surface.invoke('sam_get_goal_timeline',{goal_id:admission.goalId},owner);
  assert.equal(timeline.ok,true);assert.equal((timeline.data as any).reports.length,0);
  assert.notEqual((timeline.data as any).goal.state,'COMPLETED');
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.sourceCalls,0);
 }finally{await f.close();}
}

test('follow-up: real adapter rejects unsupported contextual and non-scalar refs independently of prose',async()=>{
 for(const reference of ['analysisCoverage','analysisCoverage.sentProducts','totals','products.0'])
  await rejectCandidateWithoutSuccess(JSON.stringify({...JSON.parse(answer),references:[reference]}));
});

test('follow-up: real adapter rejects arbitrary summary/comment fields, including empty and whitespace prose',async()=>{
 for(const text of ['', ' \n\t\u00a0']){
  await rejectCandidateWithoutSuccess(JSON.stringify({...JSON.parse(answer),summary:text}));
  await rejectCandidateWithoutSuccess(JSON.stringify({...JSON.parse(answer),observations:[{reference:'totals.netOrdered',comment:text}]}));
 }
});

if(process.env.SAM_HERMES_REJECTED_OUTPUT_FILE)test('follow-up: exact preserved rejected output stays immutable through real client and adapter replay',async()=>{
 const path=process.env.SAM_HERMES_REJECTED_OUTPUT_FILE!,bytes=await readFile(path);
 const hash=(value:Buffer)=>createHash('sha256').update(value).digest('hex');
 const expected=hash(bytes);
 assert.ok(['a26a742581a2bc61f82ab755998851948258a50ee6befbd97cfef537155ef604','7b956f6fb14c67214076dc75516804c847eff711c7f4c7297f00cedb1c6efa2e'].includes(expected));
 const parsed=JSON.parse(bytes.toString('utf8'));
 if(expected==='a26a742581a2bc61f82ab755998851948258a50ee6befbd97cfef537155ef604'){
  assert.equal(parsed.observations.length,7);assert.ok(parsed.observations.every((o:any)=>o.comment===''));
  assert.equal(parsed.observations[0].reference,'analysisCoverage');
 }else{
  assert.equal(parsed.observations.length,14);assert.ok(parsed.observations.some((o:any)=>o.reference==='analysisCoverage.sentProducts'));
 }
 await rejectCandidateWithoutSuccess(bytes.toString('utf8'));
 assert.equal(hash(await readFile(path)),expected);
});

if(process.env.SAM_HERMES_SOURCE_REPORT_FILE&&process.env.SAM_HERMES_FOLLOWUP_OBJECTIVE_FILE)test('follow-up: preserved report shape and actual objective fit full prompt with synthetic provenance, model and verification',async()=>{
 const reportPath=process.env.SAM_HERMES_SOURCE_REPORT_FILE!,objectivePath=process.env.SAM_HERMES_FOLLOWUP_OBJECTIVE_FILE!;
 const bytes=await readFile(reportPath),objectiveBytes=await readFile(objectivePath);
 const captured=JSON.parse(objectiveBytes.toString('utf8')),data=captured.data??captured;
 assert.ok(typeof data.goal.objective==='string'&&data.goal.objective.trim());
 await completeLocally(undefined,{sourceReport:JSON.parse(bytes.toString('utf8')),objective:data.goal.objective});
 assert.deepEqual(await readFile(reportPath),bytes);assert.deepEqual(await readFile(objectivePath),objectiveBytes);
});


async function failedFollowupParent(f:Awaited<ReturnType<typeof followupFixture>>){
 const first=await f.submit(),past=new Date(Date.now()-60000).toISOString(),terminal=new Date(Date.now()-30000).toISOString();
 await f.query("UPDATE work_queue SET status='FAILED' WHERE goal_id=$1",[first.goalId]);
 await f.query("UPDATE goals SET state='FAILED',created_at=$2,updated_at=$3 WHERE id=$1",[first.goalId,past,terminal]);
 const policy={...f.policy,retryOfGoalId:first.goalId};
 const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(f.makeBundle(policy))});
 const snapshot=async()=>({goal:(await f.query('SELECT * FROM goals WHERE id=$1',[first.goalId])).rows,
  plans:(await f.query('SELECT * FROM plans WHERE goal_id=$1 ORDER BY id',[first.goalId])).rows,
  work:(await f.query('SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY id',[first.goalId])).rows,
  reservations:(await f.query('SELECT * FROM model_calls ORDER BY id')).rows});
 return {first,policy,surface,snapshot};
}

test('follow-up: operator-pinned failed parent admits one immutable successor across concurrent calls and later windows',async()=>{
 const f=await followupFixture();
 try{
  const p=await failedFollowupParent(f),before=sha256Hex(await p.snapshot());
  assert.equal((await f.submit()).goalId,p.first.goalId,'Default admission never bypasses durable source identity');
  const [a,b]=await Promise.all([f.submit({},p.surface),f.submit({objective:'Same authorized successor with different prose'},p.surface)]);
  assert.equal(a.goalId,b.goalId);assert.equal([a,b].filter(x=>x.status==='QUEUED').length,1);
  const successor=a.status==='QUEUED'?a:b;
  assert.notEqual(successor.goalId,p.first.goalId);
  const plan=(await f.query('SELECT * FROM plans WHERE id=$1',[successor.planId])).rows[0];
  assert.equal(plan.goal_assumptions.analysisRetryOfGoalId,p.first.goalId);assert.deepEqual(plan.goal_assumptions.sourceReuse,f.binding);
  assert.deepEqual((await f.query('SELECT capability_id,depends_on FROM work_queue WHERE goal_id=$1',[successor.goalId])).rows,[{capability_id:ANALYST,depends_on:[]}]);
  const later={...p.policy,activatedAt:new Date(Date.now()-100).toISOString(),expiresAt:new Date(Date.now()+600000).toISOString()};
  const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(f.makeBundle(later))});
  const replay=await f.submit({},surface);assert.equal(replay.status,'EXISTING');assert.equal(replay.goalId,successor.goalId);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,3);
  assert.equal(sha256Hex(await p.snapshot()),before,'Do not rewrite parent, old receipts, or reservations');
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.sourceCalls,0);assert.equal(f.wire.length,0);
 }finally{await f.close();}
});

test('follow-up: retry authority is operator-only and rejects wrong, active, completed, reported or newly failed parents',async()=>{
 const f=await followupFixture();
 try{
  const p=await failedFollowupParent(f),args={objective:f.objective,legal_entity_id:f.entity,source_binding:f.binding};
  await assert.rejects(()=>f.surface.invoke('sam_submit_analysis_followup',{...args,retry_of_goal_id:p.first.goalId},owner),Error);
  assert.throws(()=>f.makeBundle({...p.policy,retryOfGoalId:'not-a-uuid'}),Error);
  const {withHermesDataAnalysisFromEnv}=await import('../../apps/production/src/hermesDataAnalysis');
  await assert.rejects(()=>withHermesDataAnalysisFromEnv(f.bundle.raw,{SAM_HERMES_DATA_ANALYSIS_ENABLED:'1',SAM_HERMES_DATA_ANALYSIS_MODE:'dispatch-only',
   SAM_HERMES_DATA_ANALYSIS_ENTITY_ID:f.entity,SAM_HERMES_DATA_ANALYSIS_ACTIVATED_AT:p.policy.activatedAt,SAM_HERMES_DATA_ANALYSIS_EXPIRES_AT:p.policy.expiresAt,
   SAM_HERMES_DATA_ANALYSIS_RETRY_OF_GOAL_ID:'invalid'}),Error);
  const {dataAnalysisAcceptance}=await import('../../apps/production/src/dataAnalysisContract');
  const sourceRequest={sourceCapabilityId:SOURCE,startDate:f.binding.startDate,endDate:f.binding.endDate} as const;
  await assert.rejects(()=>p.surface.invoke('sam_submit_data_analysis',{objective:f.objective,legal_entity_id:f.entity,analysis_request:sourceRequest,
   acceptance_contract:dataAnalysisAcceptance(f.entity,sourceRequest)},owner),/RETRY_ONLY/);
  for(const retryOfGoalId of ['00000000-0000-4000-8000-000000000099',f.oldGoal]){
   const surface=createChatGPTToolSurface({dispatcher:createKernelProductionDispatcher(f.makeBundle({...p.policy,retryOfGoalId}))});
   await assert.rejects(()=>surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  }
  for(const state of ['EXECUTING','VERIFYING','COMPLETED','CANCELLED']){
   await f.query('UPDATE goals SET state=$2 WHERE id=$1',[p.first.goalId,state]);
   await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  }
  await f.query("UPDATE goals SET state='FAILED' WHERE id=$1",[p.first.goalId]);
  await f.query("UPDATE work_queue SET status='QUEUED' WHERE goal_id=$1",[p.first.goalId]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  await f.query("UPDATE work_queue SET status='FAILED' WHERE goal_id=$1",[p.first.goalId]);
  await f.query('UPDATE goals SET company_scope=$2 WHERE id=$1',[p.first.goalId,OTHER]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  await f.query('UPDATE goals SET company_scope=$2 WHERE id=$1',[p.first.goalId,f.entity]);
  const assumptions=(await f.query('SELECT goal_assumptions FROM plans WHERE id=$1',[p.first.planId])).rows[0].goal_assumptions;
  await f.query('UPDATE plans SET goal_assumptions=$2::jsonb WHERE id=$1',[p.first.planId,JSON.stringify({...assumptions,sourceReuse:{...f.binding,sourceHash:'0'.repeat(64)}})]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  await f.query('UPDATE plans SET goal_assumptions=$2::jsonb WHERE id=$1',[p.first.planId,JSON.stringify(assumptions)]);
  await f.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,$3::jsonb,$4)',[p.first.goalId,p.first.planId,JSON.stringify({status:'complete'}),'0'.repeat(64)]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  await f.query('DELETE FROM goal_read_reviews WHERE goal_id=$1',[p.first.goalId]);
  await f.query('UPDATE goals SET updated_at=$2 WHERE id=$1',[p.first.goalId,new Date().toISOString()]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',args,owner),/RETRY_PARENT_DENIED/);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,2);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});

test('follow-up: runtime retry lineage must match the operator policy before any model reservation or send',async()=>{
 const f=await followupFixture();
 try{
  const p=await failedFollowupParent(f),admission=await f.submit({},p.surface),request=await f.prepare(admission);
  const adapter=f.bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!;
  await assert.rejects(()=>adapter.execute(request),/RETRY_POLICY_DENIED/);
  const pBundle=f.makeBundle(p.policy),assumptions=(await f.query('SELECT goal_assumptions FROM plans WHERE id=$1',[admission.planId])).rows[0].goal_assumptions;
  const withoutSource={...assumptions};delete withoutSource.sourceReuse;
  await f.query('UPDATE plans SET goal_assumptions=$2::jsonb WHERE id=$1',[admission.planId,JSON.stringify(withoutSource)]);
  await assert.rejects(()=>pBundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute(request),/RETRY_POLICY_DENIED/,'Retry-only runtime never falls back to an original source-collection task');
  await f.query('UPDATE plans SET goal_assumptions=$2::jsonb WHERE id=$1',[admission.planId,JSON.stringify(assumptions)]);
  assert.equal(f.wire.length,0);assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);
  assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});


test('follow-up: authorized successor completes real local adapter, verification, persistence and SAM readback without touching parent',async()=>{
 const f=await followupFixture();
 try{
  const p=await failedFollowupParent(f),parent=await p.snapshot(),bundle=f.makeBundle(p.policy),admission=await f.submit({},p.surface);
  const request=await f.prepare(admission),outcome=await bundle.raw.toolAdapters.find(a=>a.capabilityId===ANALYST)!.execute(request);
  const {recordExecutionAndRequestVerificationAtomic}=await import('../../apps/kernel/src/execution');
  const recorded=await recordExecutionAndRequestVerificationAtomic({queueId:request.executionContext.queueId,fencingToken:request.executionContext.fencingToken,actor:'synthetic-retry-worker',...outcome});
  const mismatch=f.bundle.raw.verificationAdapters!.find(a=>a.capabilityId===ANALYST)!;
  assert.equal((await mismatch.verify({execution:{id:recorded.executionId,capabilityId:ANALYST,params:request.params,...outcome,operationKeyRef:null},contract:{id:'synthetic-contract',method:'external_event',requiredEvidenceFields:{},independentQueryTemplate:{}}})).result,'FAILED');
  const proof=await verifyNextExecution(bundle);assert.equal(proof.processed,true);assert.equal(proof.executionId,recorded.executionId);
  const readback=await p.surface.invoke('sam_get_goal_timeline',{goal_id:admission.goalId},owner);assert.equal(readback.ok,true);
  const data=readback.data as any;assert.equal(data.goal.state,'COMPLETED');assert.equal(data.reports.length,1);
  assert.deepEqual(data.reports[0].decision.report.source,f.sourceReport);assert.deepEqual(data.reports[0].decision.sourceReuse,f.binding);
  assert.equal(data.plans[0].goal_assumptions.analysisRetryOfGoalId,p.first.goalId);
  const after=await p.snapshot();assert.deepEqual(after.goal,parent.goal);assert.deepEqual(after.plans,parent.plans);assert.deepEqual(after.work,parent.work);
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.sourceCalls,0);assert.equal(f.wire.filter(w=>w.path==='/v1/runs').length,1);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,2,'Separate new reservation, original remains unresolved');
 }finally{await f.close();}
});

test('follow-up: operator retry does not bypass the one-task activation ceiling',async()=>{
 const f=await followupFixture();
 try{
  const p=await failedFollowupParent(f);
  await f.query("INSERT INTO goals(id,business_id,company_scope,domain,state,created_at,updated_at) VALUES($1,$2,$3,'hermes_data_analysis','FAILED',now(),now())",['00000000-0000-4000-8000-000000000099','SYNTHETIC-WINDOW-USED',f.entity]);
  await assert.rejects(()=>p.surface.invoke('sam_submit_analysis_followup',{objective:f.objective,legal_entity_id:f.entity,source_binding:f.binding},owner),/TASK_CEILING/);
  assert.equal((await f.query('SELECT count(*)::int n FROM goals')).rows[0].n,3);assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
  assert.equal((await f.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);assert.equal(sha256Hex(await f.original()),f.originalHash);
 }finally{await f.close();}
});
