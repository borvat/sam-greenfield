/** Native PG drill phases. No import rewriting, providers, schema/ACL changes or real-record writes. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import common from './common.cjs';
const [configPath,statePath,variant,mode,receiptPath,hold]=process.argv.slice(2);
let client;
try{
 const runtimeArtifacts=common.verifyRuntimeArtifacts(false);
 const c=common.config(configPath),databaseUrl=common.credentials(c),pin=common.verifySource(variant),sourceRoot=common.root(variant);
 const require=createRequire(path.join(sourceRoot,'package.json')),{Client}=require('pg');
 const imported=await import(pathToFileURL(path.join(sourceRoot,'apps/production/src/hermesSourceFollowup.ts')).href);
 const actual=imported.default?.saveAcceptedFollowupReport?imported.default:imported;
 const hashes=await import(pathToFileURL(path.join(sourceRoot,'packages/shared/src/stableJson.ts')).href);
 const hash=(hashes.default??hashes).sha256Hex;
 const access=await import(pathToFileURL(path.join(sourceRoot,'packages/db/src/runtimeAccess.ts')).href);
 client=new Client({connectionString:databaseUrl,...(c.tlsMode==='internal-encrypted-unverified'?{ssl:{rejectUnauthorized:false}}:{}),options:common.tenantOptions(c),connectionTimeoutMillis:5000,statement_timeout:15000,application_name:'sam-native-drill-'+c.runId.slice(0,8)});
 await client.connect();
 const transport=(await client.query('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0];assert.equal(transport?.ssl,true,'ENCRYPTED_NATIVE_CONNECTION_REQUIRED');
 const identity=(await client.query('SELECT current_database() db,current_user role,session_user login,current_schema() schema,current_org_id() org,current_legal_entity_id() entity,current_setting(\'server_version_num\')::int version')).rows[0];
 assert.equal(identity.db,c.databaseName);assert.equal(identity.role,c.appRole);assert.equal(identity.login,c.appRole);assert.equal(identity.schema,'public');assert.equal(identity.org,c.orgId);assert.equal(identity.entity,c.legalEntityId);assert.ok(identity.version>=150000&&identity.version<160000);
 await (access.default??access).assertRuntimeTenantBinding(client);
 const reportAccess=(await client.query("SELECT c.relrowsecurity rls,has_table_privilege(c.oid,'SELECT') can_select,has_table_privilege(c.oid,'INSERT') can_insert,has_table_privilege(c.oid,'UPDATE') can_update,has_table_privilege(c.oid,'DELETE') can_delete FROM pg_class c WHERE c.oid=to_regclass('public.goal_read_reviews')")).rows[0];
 assert.ok(reportAccess?.rls&&reportAccess.can_select&&reportAccess.can_insert&&!reportAccess.can_update&&!reportAccess.can_delete,'RESTRICTED_IMMUTABLE_REPORT_ACCESS_REQUIRED');
 assert.equal((await client.query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='public' AND table_name='goal_read_reviews' AND column_name IN('revision','supersedes_report_id')")).rows[0].n,2,'REVIEW_REVISION_SCHEMA_REQUIRED');
 const planHash=p=>hash({goal_id:p.goal_id,version:1,assumptions:p.goal_assumptions,constraints:{},dependencies:{},steps:p.steps});
 const executionHash=e=>hash({queue_id:e.queue_id,goal_id:e.goal_id,plan_id:e.plan_id,plan_hash:e.plan_hash,capability_id:e.capability_id,params:e.params,result:e.result,evidence:e.evidence,fencing_token:1,operation_key_ref:null});
 const fingerprints=async state=>{
  const exclusions={goals:['id',state?.goalIds??[]],plans:['goal_id',state?.goalIds??[]],work_queue:['goal_id',state?.goalIds??[]],executions:['goal_id',state?.goalIds??[]],verifications:['execution_id',state?.executionIds??[]],goal_read_reviews:['goal_id',state?.goalIds??[]]};
  const mandatory=new Set(['goals','plans','work_queue','executions','verifications','goal_read_reviews','model_calls','audit_log','memory_records','world_facts','side_effect_operations','outbox_events','inbox_events','event_fabric_events','business_id_sequences','model_providers','verification_contracts']);
  const catalog=(await client.query(`SELECT n.nspname AS schema,c.relname AS name,
   has_schema_privilege(n.oid,'USAGE') AS schema_usage,has_table_privilege(c.oid,'SELECT') AS can_select
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relkind IN('r','p') AND n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema'
   ORDER BY n.nspname,c.relname`)).rows;
  const publicNames=new Set(catalog.filter(row=>row.schema==='public').map(row=>row.name));
  for(const table of mandatory)assert.ok(publicNames.has(table),'MANDATORY_NATIVE_FINGERPRINT_TABLE_MISSING');
  const quote=name=>'"'+name.replaceAll('"','""')+'"',result={};
  for(const relation of catalog){
   const key=relation.schema+'.'+relation.name;
   const testRelevant=relation.schema==='public'&&(mandatory.has(relation.name)||/budget|reservation|memory|knowledge|learning|specialist_sessions/i.test(relation.name));
   if(!relation.schema_usage||!relation.can_select){
    result[key]={coverage:!relation.schema_usage?'DENIED_SCHEMA_USAGE':'DENIED_SELECT',testRelevant};
    assert.ok(!testRelevant,'MANDATORY_NATIVE_FINGERPRINT_ACCESS_DENIED');continue;
   }
   const exclude=relation.schema==='public'?exclusions[relation.name]:null;
   const where=exclude?` WHERE ${quote(exclude[0])} IS NULL OR NOT(${quote(exclude[0])}=ANY($1::uuid[]))`:'';
   const row=(await client.query(`SELECT count(*)::int count,coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text,'[]') payload FROM ${quote(relation.schema)}.${quote(relation.name)} t${where}`,exclude?[exclude[1]]:[])).rows[0];
   result[key]={coverage:'SELECT_VISIBLE_ROWS_ONLY',count:row.count,sha256:common.sha(row.payload),testRelevant};
  }
  return result;
 };
 let state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):null;
 if(state)assert.equal(state.runId,c.runId);
 let proof={mode,variant,runtimeArtifacts,transport:{encrypted:true,mode:c.tlsMode,certificateVerification:c.tlsMode==='verify-full',privateNetworkTargetConfirmed:c.tlsMode==='internal-encrypted-unverified'?true:null,reviewReference:c.internalTlsReviewReference??c.operatorReviewReference},sourceCommit:pin.commit,sourceTree:pin.tree,role:identity.role,database:identity.db,postgresVersion:identity.version,tenantBinding:'ACTUAL_SOURCE_ADMISSION_PASSED'};
 if(mode==='seed'){
  assert.equal(state,null,'FIXTURE_STATE_ALREADY_EXISTS');
  const original=await fingerprints(null),ids=Array.from({length:10},()=>randomUUID());
  const [sg,sp,sw,se,sv,ag,ap,aw,ae,av]=ids;
  const contracts=(await client.query("SELECT id,capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[]) AND must_not_trust_execution_result",[['bol_sales_stock_report','hermes.generate_candidate']])).rows;
  const sourceContract=contracts.find(r=>r.capability_id==='bol_sales_stock_report'),analystContract=contracts.find(r=>r.capability_id==='hermes.generate_candidate');
  assert.ok(sourceContract&&analystContract,'EXISTING_VERIFICATION_CONTRACTS_REQUIRED');
  const sourceReport={classification:'SYNTHETIC_NATIVE_REHEARSAL_ONLY',period:{startDate:'2026-11-01',endDate:'2026-11-01',timeZone:'Europe/Amsterdam'},coverage:{pagination:'every requested collection reached an empty terminal page'},limitations:['Native SQL fixture only; no collection, provider invocation or business inference.']};
  const sourcePlan={goal_id:sg,goal_assumptions:{syntheticNativeDrill:c.runId},steps:[{step_key:'source',capability_id:'bol_sales_stock_report'}]};sourcePlan.plan_hash=planHash(sourcePlan);
  const source={queue_id:sw,goal_id:sg,plan_id:sp,plan_hash:sourcePlan.plan_hash,capability_id:'bol_sales_stock_report',params:{startDate:'2026-11-01',endDate:'2026-11-01'},result:{report:sourceReport,coverageComplete:true,startDate:'2026-11-01',endDate:'2026-11-01',timeZone:'Europe/Amsterdam'},evidence:{reportHash:hash(sourceReport),syntheticNativeDrill:c.runId}};source.execution_hash=executionHash(source);
  const binding={sourceExecutionId:se,sourceGoalId:sg,sourcePlanId:sp,sourceVerificationId:sv,sourceHash:hash(sourceReport),sourceExecutionHash:source.execution_hash,sourcePlanHash:sourcePlan.plan_hash,legalEntityId:c.legalEntityId,startDate:'2026-11-01',endDate:'2026-11-01',timeZone:'Europe/Amsterdam'};
  const receipt={syntheticNativeDrill:c.runId,providerInvoked:false},assumptions={sourceReuse:binding,syntheticNativeDrill:c.runId};
  const report={sourceReuse:binding,sourceExecutionId:se,sourceHash:binding.sourceHash,source:sourceReport,interpretation:{summary:'SYNTHETIC NATIVE DRILL; not business evidence',classification:'SOURCE_DERIVED'}};
  const acceptedPlan={goal_id:ag,goal_assumptions:assumptions,steps:[{step_key:'analysis',capability_id:'hermes.generate_candidate'}]};acceptedPlan.plan_hash=planHash(acceptedPlan);
  const accepted={queue_id:aw,goal_id:ag,plan_id:ap,plan_hash:acceptedPlan.plan_hash,capability_id:'hermes.generate_candidate',params:{},result:{sourceReuse:binding,sourceBindingHash:hash(binding),report,candidate:{syntheticNativeDrill:c.runId}},evidence:{reportHash:hash(report),syntheticNativeDrill:c.runId}};accepted.execution_hash=executionHash(accepted);
  const independent={reportHash:hash(report),candidateHash:hash(accepted.result.candidate),sourceBindingHash:hash(binding),receiptHash:hash(receipt)};
  const objective='SYNTHETIC-NATIVE-DRILL-'+c.runId;
  state={fixtureState:'PLANNED_NOT_COMMITTED',runId:c.runId,goalIds:[sg,ag],executionIds:[se,ae],syntheticIds:{sourceGoal:sg,sourcePlan:sp,sourceQueue:sw,sourceExecution:se,sourceVerification:sv,acceptedGoal:ag,acceptedPlan:ap,acceptedQueue:aw,acceptedExecution:ae,acceptedVerification:av},originalFingerprints:original,input:{goalId:ag,planId:ap,executionId:ae,verificationId:av,expectedResultHash:hash(accepted.result),expectedEvidenceHash:hash(accepted.evidence),expectedObjective:objective,expectedPlanAssumptionsHash:hash(assumptions)}};
  common.writeJson(statePath,state);
  await client.query('BEGIN');
  try{
   for(const [goalId,planId,status,suffix] of [[sg,sp,'FAILED','source'],[ag,ap,'VERIFYING','accepted']])await client.query("INSERT INTO goals(id,business_id,company_scope,domain,objective,state,current_plan_id,authority_ceiling,completion_definition) VALUES($1,$2,$3,'hermes_data_analysis',$4,$5,$6,'GREEN','native_drill_fixture_only')",[goalId,'NATIVE-DRILL-'+c.runId+'-'+suffix,c.legalEntityId,objective,status,planId]);
   for(const [planId,p] of [[sp,sourcePlan],[ap,acceptedPlan]])await client.query("INSERT INTO plans(id,goal_id,version,goal_assumptions,constraints,dependencies,steps,plan_hash) VALUES($1,$2,1,$3::jsonb,'{}','{}',$4::jsonb,$5)",[planId,p.goal_id,JSON.stringify(p.goal_assumptions),JSON.stringify(p.steps),p.plan_hash]);
   for(const [queueId,e,step,handoff] of [[sw,source,'source',{}],[aw,accepted,'analysis',{hermes:receipt}]])await client.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,params,status,step_key,fencing_token,handoff) VALUES($1,$2,$3,$4,$5::jsonb,'EXECUTED',$6,1,$7::jsonb)",[queueId,e.goal_id,e.plan_id,e.capability_id,JSON.stringify(e.params),step,JSON.stringify(handoff)]);
   for(const [executionId,e] of [[se,source],[ae,accepted]])await client.query("INSERT INTO executions(id,queue_id,goal_id,plan_id,plan_hash,execution_hash,capability_id,params,result,evidence,fencing_token,actor,status,finished_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,1,'native-drill-fixture-executor','EXECUTED',now())",[executionId,e.queue_id,e.goal_id,e.plan_id,e.plan_hash,e.execution_hash,e.capability_id,JSON.stringify(e.params),JSON.stringify(e.result),JSON.stringify(e.evidence)]);
   for(const [verificationId,executionId,e,contract,detail] of [[sv,se,source,sourceContract.id,{reportHash:binding.sourceHash,matches:true}],[av,ae,accepted,analystContract.id,independent]])await client.query("INSERT INTO verifications(id,execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash) VALUES($1,$2,'native-drill-independent-fixture','external_event',$3,$4::jsonb,'VERIFIED',$5,$6)",[verificationId,executionId,contract,JSON.stringify(detail),e.plan_hash,e.execution_hash]);
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}
  state.fixtureState='COMMITTED';common.writeJson(statePath,state);proof.syntheticIds=state.syntheticIds;
 }else{
  assert.ok(state,'SEEDED_FIXTURE_STATE_REQUIRED');
  if(mode==='save'){
   await client.query('BEGIN');let reportId;try{reportId=await actual.saveAcceptedFollowupReport(client,state.input);await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}
   const saved=(await client.query('SELECT id,report_hash,revision FROM goal_read_reviews WHERE id=$1',[reportId])).rows[0];assert.equal(saved.revision,1);
   if(state.reportId){assert.equal(saved.id,state.reportId);assert.equal(saved.report_hash,state.reportHash);}else{state.reportId=saved.id;state.reportHash=saved.report_hash;common.writeJson(statePath,state);}
   proof={...proof,...saved,durableCommitBeforeStop:true};
  }else if(mode==='revision2'){
   assert.ok(state.reportId);const decision={status:'fixture-revision2',syntheticNativeDrill:c.runId,notAnOperationalRecovery:true},revisionId=randomUUID();
   await client.query('INSERT INTO goal_read_reviews(id,goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id) VALUES($1,$2,$3,1,$4::jsonb,$5,2,$6)',[revisionId,state.input.goalId,state.input.planId,JSON.stringify(decision),hash(decision),state.reportId]);
   state.revision2Id=revisionId;state.fixtureReportFingerprint=common.sha((await client.query('SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text,\'[]\') payload FROM goal_read_reviews r WHERE goal_id=$1',[state.input.goalId])).rows[0].payload);common.writeJson(statePath,state);proof.revision2Id=revisionId;
  }else if(mode==='negative'){
   const expected=async(action,message)=>{await client.query('BEGIN');try{await assert.rejects(action,{message});}finally{await client.query('ROLLBACK');}};
   await expected(async()=>{
    const original=(await client.query('SELECT result,evidence FROM executions WHERE id=$1',[state.input.executionId])).rows[0];original.result.report.interpretation.summary='SYNTHETIC CHANGED PAYLOAD';original.evidence.reportHash=hash(original.result.report);
    await client.query('UPDATE executions SET result=$2::jsonb,evidence=$3::jsonb WHERE id=$1',[state.input.executionId,JSON.stringify(original.result),JSON.stringify(original.evidence)]);
    await client.query("UPDATE verifications SET independent_evidence=jsonb_set(independent_evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",[state.input.verificationId,original.evidence.reportHash]);
    return actual.saveAcceptedFollowupReport(client,{...state.input,expectedResultHash:hash(original.result),expectedEvidenceHash:hash(original.evidence)});
   },'ANALYSIS_FOLLOWUP_REPORT_CONFLICT');
   await expected(async()=>{
    const assumptions=(await client.query('SELECT goal_assumptions FROM plans WHERE id=$1',[state.input.planId])).rows[0].goal_assumptions;assumptions.sourceReuse.legalEntityId=c.foreignCompanyId;
    await client.query('UPDATE plans SET goal_assumptions=$2::jsonb WHERE id=$1',[state.input.planId,JSON.stringify(assumptions)]);
    return actual.saveAcceptedFollowupReport(client,{...state.input,expectedPlanAssumptionsHash:hash(assumptions)});
   },'ANALYSIS_SOURCE_SCOPE_DENIED');
   await client.query('BEGIN');try{
    await client.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[c.foreignCompanyId]);
    assert.equal((await client.query('SELECT id FROM goals WHERE id=$1',[state.input.goalId])).rowCount,0);
    assert.equal((await client.query("UPDATE goals SET objective='SYNTHETIC FOREIGN DENIED' WHERE id=$1",[state.input.goalId])).rowCount,0);
   }finally{await client.query('ROLLBACK');}
   proof.negativeChecks=['CHANGED_ACCEPTED_PAYLOAD_CONFLICT','FOREIGN_SOURCE_BINDING_DENIED','ROLE_GUC_SPOOF_READ_WRITE_DENIED'];
  }else if(mode==='runtime-gate'){
   const row=(await client.query(`SELECT
    (SELECT count(*)::int FROM work_queue WHERE status IN('QUEUED','HANDBACK','LEASED','EXECUTING')) active_work,
    (SELECT count(*)::int FROM goals WHERE next_wake_at IS NOT NULL AND next_wake_at<=now()+interval '2 minutes' AND state IN('WAITING_EXTERNAL','WAITING_OWNER','BLOCKED')) due_goals,
    (SELECT count(*)::int FROM goals g WHERE state='EXECUTING' AND current_plan_id IS NOT NULL AND EXISTS(SELECT 1 FROM work_queue w WHERE w.goal_id=g.id AND w.plan_id=g.current_plan_id) AND NOT EXISTS(SELECT 1 FROM work_queue w WHERE w.goal_id=g.id AND w.plan_id=g.current_plan_id AND w.status<>'EXECUTED')) finished_plans,
    (SELECT count(*)::int FROM goals WHERE state IN('NEW','MODELING','PLANNING','REPLANNING','EXECUTING')) active_goals`)).rows[0];
   proof.runtimeGate=row;proof.runtimeAllowed=c.allowRuntimeBoot===true&&Object.values(row).every(n=>n===0);if(!proof.runtimeAllowed)proof.blockedReason='EXPLICIT_RUNTIME_APPROVAL_AND_EMPTY_NATIVE_RECOVERY_QUEUE_REQUIRED';
  }else if(mode!=='fingerprint')throw Error('NATIVE_MODE_INVALID');
  if(state.fixtureReportFingerprint){const current=common.sha((await client.query('SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text,\'[]\') payload FROM goal_read_reviews r WHERE goal_id=$1',[state.input.goalId])).rows[0].payload);assert.equal(current,state.fixtureReportFingerprint,'FIXTURE_REPORT_REVISIONS_MUTATED');proof.fixtureRevisionsUnchanged=true;}
 }
 const currentFingerprints=await fingerprints(state);assert.deepEqual(currentFingerprints,state.originalFingerprints,'ROLE_VISIBLE_ORIGINAL_FINGERPRINT_CHANGED');proof.roleVisibleOriginalFingerprintsUnchanged=true;proof.fingerprintCoverage={localTablesDiscovered:Object.keys(currentFingerprints).length,visibleTables:Object.values(currentFingerprints).filter(row=>row.coverage==='SELECT_VISIBLE_ROWS_ONLY').length,deniedTables:Object.entries(currentFingerprints).filter(([,row])=>row.coverage!=='SELECT_VISIBLE_ROWS_ONLY').map(([table,row])=>({table,coverage:row.coverage})),readReviewBudgets:'public.audit_log includes READ_REVIEW_BUDGET rows',providerReservations:'public.model_calls includes hermes reservations; no cost/reset mutation',additionalPublicBudgetReservationMemoryTables:'Mandatory when present',scope:'Role-visible rows only; denied relations and owner-visible/other-tenant rows are not attested'};
 common.writeJson(receiptPath,proof);
 if(hold==='hold-after-commit'){
  process.send?.({committed:true,receiptPath});await new Promise(resolve=>process.once('SIGTERM',resolve));
 }
 await client.end();client=null;
}catch(error){const failure={status:'FAILED',variant,mode,error:common.safeError(error)};try{common.writeJson(receiptPath,failure);}catch{}if(client)try{await client.query('ROLLBACK');await client.end();}catch{}console.error(JSON.stringify(failure.error));process.exitCode=1;}
