import assert from "node:assert/strict";
import { readFileSync,writeFileSync,mkdtempSync,rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pool,withTransaction } from "../../packages/db/src/client";
import { observeAndEnterPlanning,persistPlanAndStartExecution } from "../../apps/kernel/src/orchestrator";
import { validateCandidatePlan } from "../../apps/brain/src/planner";
import { evaluatePlanAuthority } from "../../apps/brain/src/authorityGuard";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { syntheticTask } from "../../apps/development/src/syntheticProbe";
import { DRIVE_READ_OBJECTIVE } from "../../apps/development/src/driveRead";
import { sha256Hex } from "../../packages/shared/src/stableJson";

const unit=process.env.SAM_DRIVE_READ_UNIT_TEST==="1";
const reportFile=join(process.cwd(),`.local/sam-dev/drive-read-${unit?"local-acceptance":"report"}.json`);
const temp=mkdtempSync(join(tmpdir(),"sam-private-drive-scope-"));
const report:any={startedAt:new Date().toISOString(),status:"BLOCKED",providerMode:unit?"LOCAL_UNIT_FIXTURE":"LIVE_GOOGLE_MANAGED_PROXY",
  planner:"OWNER_DECLARED_NATIVE_VALIDATOR_NO_MODEL",modelCalls:0,execution:"NOT_RUN",verification:"NOT_RUN",contentRead:false,
  writes:false,mail:false,finance:false,legal:false,ordinaryExternalModelsBlocked:true};
let stage="scope_preflight";
const save=()=>writeFileSync(reportFile,JSON.stringify(report,null,2));
async function main() {
  assert.equal(process.env.NODE_ENV,"development");assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE,"1");
  const applicationRole=(await pool.query("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user")).rows[0];
  assert.equal(applicationRole.rolsuper,false);assert.equal(applicationRole.rolbypassrls,false);
  assert.equal((await pool.query("SELECT current_schema() AS name")).rows[0].name,unit?"sam_replit_test_drive_read":"sam_replit_drive_read");
  const approval=unit?{fileId:"fixture-personal-document-001"}:JSON.parse(readFileSync(process.env.SAM_DRIVE_READ_APPROVAL_FILE!,"utf8"));
  const scope=(await pool.query("SELECT goal_id,resource_hash FROM development_cycle_scope")).rows[0];
  assert.equal(sha256Hex(approval.fileId),scope.resource_hash);
  const goalId=scope.goal_id,entity=process.env.SAM_DEV_LEGAL_ENTITY_ID!;
  report.resourceHash=scope.resource_hash;report.goalId=goalId;
  stage="rls_and_permission_proof";
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM legal_entities")).rows[0].n,1);
  assert.equal((await pool.query("SELECT id FROM legal_entities WHERE id=$1",[process.env.SAM_CYCLE_FOREIGN_ENTITY])).rowCount,0);
  await assert.rejects(withTransaction(c=>c.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state)
    VALUES('forbidden',$1,'development_probe','Foreign sentinel','NEW')`,[process.env.SAM_CYCLE_FOREIGN_ENTITY])),(e:any)=>e.code==="42501");
  for (const table of ["users","memory_records","financial_documents"]) {
    await assert.rejects(withTransaction(c=>c.query(`SELECT count(*) FROM ${table}`)),(e:any)=>e.code==="42501");
  }
  await assert.rejects(withTransaction(c=>c.query("UPDATE development_cycle_scope SET resource_hash='tampered'")),(e:any)=>e.code==="42501");
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM model_providers")).rows[0].n,0);
  await assert.rejects(new ModelGateway({}).invoke(syntheticTask()),/LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  report.nonBypassApplicationRole=true;report.crossEntityReadsAndWritesDenied=true;report.sensitiveTablesDenied=true;
  stage="native_observe_and_owner_plan";
  const policyFile=join(temp,"policy.json");
  writeFileSync(policyFile,JSON.stringify({legalEntityId:entity,approvedGoals:[{id:goalId,objective:DRIVE_READ_OBJECTIVE}],approvedFacts:[]}),{mode:0o600});
  process.env.SAM_DEV_PLANNING_POLICY_FILE=policyFile;
  const context=await observeAndEnterPlanning(goalId);
  assert.deepEqual(context.facts,[]);assert.deepEqual(context.memory,[]);
  const candidate=validateCandidatePlan({assumptions:{planner:"owner_declared"},constraints:{readOnly:true,oneResource:true,noContent:true,noModelDisclosure:true},
    dependencies:{},steps:[{capabilityId:"drive_get_metadata",params:{file_id:approval.fileId},priority:1}]});
  const authority=await withTransaction(c=>evaluatePlanAuthority(c,{goalId,legalEntityId:entity,steps:candidate.steps,capabilityPolicies:{drive_get_metadata:"GREEN"}}));
  assert.equal(authority.authorized,true);
  const persisted=await persistPlanAndStartExecution({goalId,...candidate});
  report.planId=persisted.planId;report.planHash=persisted.planHash;report.planning="PASS";report.authority="PASS";
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result)
    VALUES('owner-plan-native-validator',$1,'OWNER_READ_PLAN_ACCEPTED','private_read_scope','GREEN','PERSISTED')`,[goalId]);
  if (!unit) writeFileSync(join(process.cwd(),".local/sam-dev/drive-read-used.json"),JSON.stringify({consumedAt:new Date().toISOString(),goalId,resourceHash:scope.resource_hash}),{flag:"wx",mode:0o600});
  save();stage="separate_native_worker";
  const env={...process.env};
  for(const key of Object.keys(env)) if(/API.?KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTHORIZATION/i.test(key)) delete env[key];
  const worker=spawnSync(process.execPath,["--import","tsx","scripts/development/drive-read-worker.ts"],{cwd:process.cwd(),env,encoding:"utf8",stdio:["ignore","pipe","pipe"],timeout:65000});
  report.workerExitCode=worker.status;
  const workerFile=join(process.cwd(),`.local/sam-dev/drive-read-worker-${unit?"local":"live"}.json`);
  try{report.worker=JSON.parse(readFileSync(workerFile,"utf8"));}catch{report.worker={status:"NO_SAFE_REPORT"};}
  if(worker.status!==0){report.failureCode=report.worker.failureCode??"WORKER_FAILED";throw new Error("WORKER_FAILED");}
  stage="independent_database_acceptance";
  report.goalState=(await pool.query("SELECT state FROM goals WHERE id=$1",[goalId])).rows[0].state;
  assert.equal(report.goalState,"COMPLETED");
  report.counts={};
  for(const table of ["plans","work_queue","executions","verifications","model_calls","side_effect_operations"]) {
    report.counts[table]=(await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
  }
  for(const table of ["plans","work_queue","executions","verifications"]) assert.equal(report.counts[table],1);
  assert.equal(report.counts.model_calls,0);assert.equal(report.counts.side_effect_operations,0);
  report.independentHashBindings=(await pool.query(`SELECT count(*)::int AS n FROM verifications v
    JOIN executions e ON e.id=v.execution_id JOIN plans p ON p.id=e.plan_id
    WHERE v.result='VERIFIED' AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash
    AND v.execution_hash=e.execution_hash AND p.plan_hash=e.plan_hash`)).rows[0].n;
  assert.equal(report.independentHashBindings,1);
  report.fencedHandoff=(await pool.query(`SELECT count(*)::int AS n FROM work_queue
    WHERE status='EXECUTED' AND fencing_token>0 AND handoff->>'worker_instance_id'='personal-drive-read-worker'`)).rows[0].n;
  assert.equal(report.fencedHandoff,1);
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result)
    VALUES('independent-read-cycle-acceptance',$1,'GOAL_COMPLETION_CONFIRMED','private_read_scope','COMPLETED')`,[goalId]);
  await assert.rejects(withTransaction(c=>c.query("UPDATE audit_log SET result='tampered'")),(e:any)=>e.code==="P0001");
  report.auditAppendOnly=true;
  report.audit=(await pool.query("SELECT actor,action,result,timestamp FROM audit_log ORDER BY timestamp,id")).rows;
  report.pendingOutbox=(await pool.query("SELECT count(*)::int AS n FROM outbox_events WHERE status='PENDING'")).rows[0].n;
  assert.equal(report.pendingOutbox,0);
  report.execution="PASS";report.verification="PASS";report.status="PASS";
}
main().catch(error=>{
  report.status="FAIL";report.failureStage=stage;
  report.failureCode=report.failureCode??(/^[A-Z0-9_]+$/.test(error.code??"")?error.code:"NATIVE_READ_CYCLE_REJECTED");
}).finally(async()=>{
  await assert.rejects(new ModelGateway({}).invoke(syntheticTask()),/LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  report.completedAt=new Date().toISOString();save();
  console.log(JSON.stringify({DRIVE_READ_CYCLE_RESULT:report}));
  rmSync(temp,{recursive:true,force:true});await pool.end();
  if(report.status!=="PASS")process.exitCode=1;
});
