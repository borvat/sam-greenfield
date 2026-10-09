import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {randomUUID} from "node:crypto";
import {writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {pool} from "../../packages/db/src/client";
import {evaluatePlanAuthority} from "../../apps/brain/src/authorityGuard";
import {appendMemoryObservation,loadApprovedMemory} from "../../apps/brain/src/memory";
import {loadVerifiedWorldModel} from "../../apps/brain/src/worldModel";
import {learnVerifiedWorldFact} from "../../apps/brain/src/learning";
import {ingestEvent,nextEventForConsumer,markConsumerEventProcessed} from "../../apps/event-fabric/src/index";
import {enqueueWork} from "../../apps/kernel/src/queue";
import {captureHealthSnapshot} from "../../apps/supervisor/src/health";
import {loadActiveIncidents,reconcileIncidents} from "../../apps/supervisor/src/incidents";
import {consumeApproval} from "../../packages/db/src/approvals";
import {acquireLease,commitWithFencing} from "../../packages/db/src/fencing";
import {recordModelCall} from "../../packages/db/src/modelCalls";
import {insertOutboxEvent,claimOutboxBatch} from "../../packages/db/src/outbox";
import {applyRecentFailureCircuitBreaker} from "../../packages/model-gateway/src/health";
import {setTenantContext} from "../../packages/db/src/client";
import {sha256Hex} from "../../packages/shared/src/stableJson";
const require=createRequire(import.meta.url);
const {installCycleRls}=require("../../scripts/development/goal-cycle-rls.cjs");
const {prepareSessions}=require("../../scripts/development/autonomy-sessions.cjs");
const {developmentEnvironment}=require("../../scripts/development/environment.cjs");

async function main(){
  const client=await pool.connect(),payload="SQL_TEST_'; SELECT pg_sleep(9); DROP TABLE goals; -- عربي";
  const cases:string[]=[],queries:{sql:string;boundCanary:boolean}[]=[];
  const observed={query:async(sql:string,params?:unknown[])=>{
    assert.equal(sql.includes(payload),false,"UNBOUND_CANARY_IN_SQL");
    queries.push({sql,boundCanary:JSON.stringify(params??[]).includes(payload)});
    return client.query(sql,params);
  }};
  const testRole="sam_goal_cycle_test_app";
  let createdRole=false;
  try{
    await client.query("BEGIN");
    const org=(await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",["Synthetic SQL audit"])).rows[0].id;
    const entity=(await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org,"Synthetic SQL entity"])).rows[0].id;
    const goal=(await client.query(`INSERT INTO goals(business_id,company_scope,objective,authority_ceiling)
      VALUES($1,$2,$3,'YELLOW') RETURNING id`,[randomUUID(),entity,"Synthetic SQL security test"])).rows[0].id;
    const params={text:payload};
    await client.query(`INSERT INTO approvals(capability_id,params_hash,legal_entity_id,authority_class,status,expiry_at,max_uses)
      VALUES($1,$2,$3,'YELLOW','APPROVED',now()+interval '1 hour',3)`,[payload,sha256Hex(params),entity]);
    const authority=await evaluatePlanAuthority(observed,{goalId:goal,legalEntityId:entity,
      steps:[{capabilityId:payload,params}],capabilityPolicies:{[payload]:"YELLOW"}});
    assert.equal(authority.authorized,true);
    await consumeApproval(observed,{capabilityId:payload,params,legalEntityId:entity,authorityClass:"YELLOW"});
    cases.push("authority_goal_and_approval_lookup","approval_consumption_bound_derived_update");
    await appendMemoryObservation(observed,{type:"OPERATIONAL",statement:payload,source:payload,scope:params});
    await loadApprovedMemory(observed,20);
    assert.equal((await loadVerifiedWorldModel(observed,payload,entity)).length,0);
    cases.push("memory_insert_and_bound_limit","world_model_bound_entity");
    const queue=await enqueueWork(observed,{goalId:goal,capabilityId:payload,params,idempotencyKey:payload});
    const token=await acquireLease(observed,queue,payload,10);
    assert.equal(await commitWithFencing(observed,queue,token),true);
    cases.push("queue_json_capability_and_idempotency_binding","lease_owner_and_fencing_function_static_sql");
    const execution=(await client.query(`INSERT INTO executions(queue_id,goal_id,capability_id,actor,result,evidence,plan_hash,execution_hash,fencing_token)
      VALUES($1,$2,$3,'sql-fixture-actor','{"value":8}','{}','fixture-plan','fixture-execution',1) RETURNING id`,
      [queue,goal,payload])).rows[0].id;
    await client.query(`INSERT INTO verifications(execution_id,verifier,method,independent_evidence,result,plan_hash,execution_hash)
      VALUES($1,'sql-fixture-verifier','db_query','{}','VERIFIED','fixture-plan','fixture-execution')`,[execution]);
    await learnVerifiedWorldFact({executionId:execution,entityType:payload,entityId:entity,
      domain:payload,attribute:payload,value:payload},observed);
    cases.push("learning_execution_uuid_and_json_binding");
    const eventInput={source:payload,eventType:payload,dedupKey:payload,occurredAt:new Date(),payload:params};
    assert.equal((await ingestEvent(observed,eventInput)).inserted,true);
    assert.equal((await ingestEvent(observed,eventInput)).inserted,false);
    const event=await nextEventForConsumer(observed,payload);
    assert.ok(event);
    await markConsumerEventProcessed(observed,payload,event.dedup_key);
    cases.push("event_insert_and_dedup","consumer_select_inbox_insert_and_processed_update");
    await insertOutboxEvent(observed,{aggregateType:payload,aggregateId:goal,eventType:payload,payload:params});
    assert.ok((await claimOutboxBatch(observed,10)).length>0);
    cases.push("outbox_insert_and_limit_binding");
    await recordModelCall(observed,{task:payload,provider:payload,model:payload,reasonSelected:payload,
      latencyMs:1,retryCount:0,success:false,dataClassification:"PUBLIC"});
    assert.equal((await client.query("SELECT cost FROM model_calls WHERE task=$1",[payload])).rows[0].cost,null);
    await applyRecentFailureCircuitBreaker(observed,[],{lookbackMinutes:15,failureThreshold:3});
    await captureHealthSnapshot(observed,{monitorSideEffects:false});
    cases.push("model_call_binding_unknown_cost_is_null","circuit_breaker_and_private_health_count_static_queries");
    const incident={incidentKey:payload,severity:"WARN" as const,code:payload,title:payload,detail:params};
    await reconcileIncidents(observed,[incident],payload);
    assert.equal((await loadActiveIncidents(observed,payload)).length,1);
    await reconcileIncidents(observed,[],payload);
    cases.push("incident_actor_and_json_open_resolve_binding");
    await setTenantContext(client,{orgId:payload,legalEntityId:payload});
    assert.equal((await client.query("SELECT current_setting('app.current_org_id') value")).rows[0].value,payload);
    cases.push("tenant_set_config_literal_not_statement");
    // Each rejection is isolated so PostgreSQL's error does not abort later probes.
    async function rejectsBound(label:string,fn:()=>Promise<unknown>){
      await client.query("SAVEPOINT injection_rejection");
      try{await fn();assert.fail("INJECTION_REJECTION_EXPECTED");}
      catch(e:any){assert.ok(["22P02","22007","22015"].includes(e.code),"EXPECTED_TYPED_POSTGRES_REJECTION");}
      finally{await client.query("ROLLBACK TO SAVEPOINT injection_rejection");}
      cases.push(label);
    }
    await rejectsBound("uuid_payload_rejected_not_interpolated",()=>evaluatePlanAuthority(observed,{
      goalId:payload,legalEntityId:entity,steps:[],capabilityPolicies:{}}));
    await rejectsBound("limit_payload_rejected_not_executed",()=>loadApprovedMemory(observed,payload as any));
    await rejectsBound("health_interval_payload_rejected",()=>captureHealthSnapshot(observed,{staleGoalMinutes:payload as any,monitorSideEffects:false}));
    assert.ok((await client.query("SELECT to_regclass('goals') present")).rows[0].present);
    assert.equal((await client.query("SELECT count(*)::int n FROM goals")).rows[0].n,1);
    assert.ok(queries.some(q=>q.boundCanary));
    assert.equal((await client.query("SELECT 1 FROM pg_roles WHERE rolname=$1",[testRole])).rowCount,0,"FIXTURE_ROLE_ALREADY_EXISTS");
    await client.query(`CREATE ROLE ${testRole} NOLOGIN NOSUPERUSER NOBYPASSRLS`);createdRole=true;
    await client.query("CREATE TABLE development_cycle_scope(goal_id uuid); CREATE TABLE development_office_results(goal_id uuid)");
    await installCycleRls(client,testRole);
    const policies=(await client.query("SELECT count(*)::int n FROM pg_policies WHERE schemaname=current_schema() AND policyname='cycle_scope'")).rows[0].n;
    assert.ok(policies>5);
    await assert.rejects(()=>installCycleRls(observed,testRole+payload),/Invalid cycle role/);
    await assert.rejects(()=>prepareSessions({schema:payload,role:payload,orgId:payload,legalEntityId:payload}),/AUTONOMY_SESSION_SCOPE/);
    assert.throws(()=>developmentEnvironment(payload),/Invalid isolated development schema/);
    cases.push("cycle_policy_ddl_closed_identifiers","autonomy_session_ddl_closed_uuid_and_scope","development_schema_allowlist");
    for(const mode of ["production","development"]){
      const probe=spawnSync(process.execPath,["--import","tsx","-e",
        "import('./packages/db/src/client.ts').catch(e=>{console.log(e.message);process.exitCode=1})"],
        {env:{PATH:process.env.PATH,HOME:process.env.HOME,NODE_ENV:mode},encoding:"utf8",timeout:10000});
      assert.equal(probe.status,1);
      assert.match(probe.stdout,/^DATABASE_URL_REQUIRED(?:_IN_PRODUCTION)?\s*$/);
    }
    cases.push("missing_database_url_fail_closed_in_all_modes");
    await client.query("ROLLBACK");createdRole=false;
    const receipt={status:"PASS",classification:"REAL_POSTGRES_SYNTHETIC_ADVERSARIAL_NOT_LIVE_MODEL",
      checkedAt:new Date().toISOString(),cases,caseCount:cases.length,observedQueries:queries.length,
      unsafeInterpolatedQueries:0,externalCalls:0,fixtureVerificationNotClaimedLive:true};
    writeFileSync(".local/sam-dev/sql-injection-evidence.json",JSON.stringify(receipt,null,2));
    console.log(JSON.stringify({test:"SQL_INJECTION",status:"PASS",cases:cases.length,queries:queries.length}));
  }finally{
    await client.query("ROLLBACK");
    if(createdRole)await client.query(`DROP ROLE ${testRole}`);
    client.release();await pool.end();
  }
}
main().catch(e=>{console.error(JSON.stringify({test:"SQL_INJECTION",status:"FAIL",code:e.code??"ASSERTION",message:e.code?"withheld":e.message}));process.exitCode=1;});
