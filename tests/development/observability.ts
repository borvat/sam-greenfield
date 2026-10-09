import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {writeFileSync} from "node:fs";
import {pool,setTenantContext} from "../../packages/db/src/client";
import {captureDevelopmentTelemetry} from "../../apps/supervisor/src/developmentTelemetry";
import {projectHeartbeat,estimateScopedUsage,localAlerts} from "../../apps/supervisor/src/telemetry";

async function main(){
  const canary="Bearer synthetic-observability-secret-canary";
  const valid={startedAt:new Date(Date.now()-10000).toISOString(),lastFinishedAt:new Date().toISOString(),ticks:2,errors:0,dependencyFailures:0};
  const projected=projectHeartbeat({...valid,lastStartedAt:canary} as any);
  assert.equal(JSON.stringify(projected).includes(canary),false);
  const cost=estimateScopedUsage([{model:"deepseek-flash",input_tokens:100,output_tokens:20,reasoning_tokens:7,http_status:200}]);
  assert.equal(cost.estimatedUpperUsd,0.000054);
  assert.equal(cost.reasoningTokens,7);assert.equal(cost.billedUsd,null);
  assert.equal(estimateScopedUsage([{model:canary,input_tokens:1,output_tokens:1,reasoning_tokens:0,http_status:200}]).estimatedUpperUsd,null);
  assert.equal(estimateScopedUsage([{model:"deepseek-flash",input_tokens:null,output_tokens:null,reasoning_tokens:null,http_status:401}]).estimatedUpperUsd,null);
  const alerts=localAlerts({heartbeat:projectHeartbeat({...valid,lastFinishedAt:new Date(Date.now()-60000).toISOString(),
    lastStartedAt:new Date(Date.now()-400000).toISOString(),inFlight:true,dependencyFailures:1}),
    ready:2,oldestReadySeconds:200,failed:1,expiredLeases:1,
    provider:estimateScopedUsage([{model:"deepseek-flash",input_tokens:null,output_tokens:null,reasoning_tokens:null,http_status:401}])});
  for(const code of ["WORKER_HEARTBEAT_STALE","ACT_STALLED","WORKER_DEPENDENCY_FAILURE","QUEUE_STUCK","WORK_FAILED","LEASE_EXPIRED","PROVIDER_AUTH_REJECTED","COST_UNKNOWN"])
    assert.ok(alerts.some(a=>a.code===code));
  assert.ok(alerts.every(a=>a.action.length>10));
  assert.equal(projectHeartbeat({...valid,lastFinishedAt:new Date(Date.now()+3600000).toISOString()}).ageSeconds,null,
    "FUTURE_HEARTBEAT_MUST_NOT_APPEAR_HEALTHY");
  const edgeUsage=estimateScopedUsage([
    {model:"deepseek-flash",input_tokens:null,output_tokens:null,reasoning_tokens:null,http_status:503},
    {model:canary,input_tokens:100,output_tokens:20,reasoning_tokens:7,http_status:429}
  ]);
  assert.equal(edgeUsage.estimatedUpperUsd,null);
  const edgeAlerts=localAlerts({heartbeat:projected,ready:0,oldestReadySeconds:0,failed:0,expiredLeases:0,provider:edgeUsage});
  for(const code of ["PROVIDER_UNAVAILABLE","PROVIDER_RATE_LIMITED","COST_UNKNOWN"])
    assert.ok(edgeAlerts.some(a=>a.code===code));
  assert.equal(JSON.stringify(edgeAlerts).includes(canary),false);
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const orgs=(await client.query("INSERT INTO organizations(name) VALUES('Synthetic telemetry own'),('Synthetic telemetry other') RETURNING id")).rows;
    const entities=(await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic telemetry own'),($2,'Synthetic telemetry other') RETURNING id",[orgs[0].id,orgs[1].id])).rows;
    const own=entities[0].id,other=entities[1].id;
    const goals=(await client.query(`INSERT INTO goals(business_id,company_scope,domain,objective)
      VALUES($1,$2,'development_probe','Synthetic telemetry'),($3,$4,'development_probe','Synthetic other telemetry') RETURNING id`,
      [randomUUID(),own,randomUUID(),other])).rows;
    await client.query(`INSERT INTO work_queue(goal_id,capability_id,created_at) VALUES($1,'unit.telemetry',now()-interval '10 minutes')`,[goals[0].id]);
    await client.query("INSERT INTO work_queue(goal_id,capability_id) VALUES($1,'unit.foreign'),($1,'unit.foreign')",[goals[1].id]);
    await client.query(`CREATE TABLE autonomy_session(session_id uuid PRIMARY KEY,org_id uuid,legal_entity_id uuid);
      CREATE TABLE autonomy_model_claims(id uuid PRIMARY KEY,goal_id uuid,session_id uuid);
      CREATE TABLE autonomy_provider_receipts(claim_id uuid PRIMARY KEY,model text,http_status int,input_tokens int,output_tokens int,reasoning_tokens int,started_at timestamptz);
      ALTER TABLE goals ADD COLUMN autonomy_session_id uuid`);
    for(let i=0;i<2;i++){
      const session=randomUUID(),claim=randomUUID();
      await client.query("INSERT INTO autonomy_session VALUES($1,$2,$3)",[session,orgs[i].id,entities[i].id]);
      await client.query("UPDATE goals SET autonomy_session_id=$1 WHERE id=$2",[session,goals[i].id]);
      await client.query("INSERT INTO autonomy_model_claims VALUES($1,$2,$3)",[claim,goals[i].id,session]);
      await client.query("INSERT INTO autonomy_provider_receipts VALUES($1,'deepseek-flash',200,$2,20,7,now())",[claim,i===0?100:999999]);
    }
    const schema=(await client.query("SELECT current_schema() s")).rows[0].s;
    assert.match(schema,/^sam_replit_test_[0-9]+$/);
    const role="sam_telemetry_test_"+Date.now();assert.match(role,/^sam_telemetry_test_[0-9]+$/);
    await client.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS;
      GRANT USAGE ON SCHEMA ${schema} TO ${role};
      GRANT SELECT ON goals,work_queue,legal_entities,autonomy_session,autonomy_model_claims,autonomy_provider_receipts TO ${role};
      CREATE POLICY telemetry_fixture_goals ON goals TO ${role}
        USING(company_scope=NULLIF(current_setting('app.current_legal_entity_id',true),'')::uuid);
      CREATE POLICY telemetry_fixture_queue ON work_queue TO ${role}
        USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id));
      CREATE POLICY telemetry_fixture_entities ON legal_entities TO ${role}
        USING(org_id=NULLIF(current_setting('app.current_org_id',true),'')::uuid)`);
    await setTenantContext(client,{orgId:orgs[0].id,legalEntityId:own});
    await client.query(`SET LOCAL ROLE ${role}`);
    const snapshot=await captureDevelopmentTelemetry(client,own,valid);
    assert.equal(snapshot.ready,1);assert.equal(snapshot.provider?.requests,1);
    assert.equal(snapshot.provider?.inputTokens,100);assert.equal(snapshot.provider?.estimatedUpperUsd,0.000054);
    assert.ok(snapshot.alerts.some(a=>a.code==="QUEUE_STUCK"));
    const text=JSON.stringify(snapshot);
    for(const forbidden of [own,other,orgs[0].id,goals[0].id,canary])assert.equal(text.includes(forbidden),false);
    assert.equal(snapshot.alertDelivery,"LOCAL_ONLY_NO_OUTBOX_OR_EXTERNAL_NOTIFICATION");
    await setTenantContext(client,{orgId:orgs[1].id,legalEntityId:other});
    await assert.rejects(()=>captureDevelopmentTelemetry(client,own,valid),/TELEMETRY_ROLE_OR_TENANT_DENIED/);
    await client.query("RESET ROLE");
    await setTenantContext(client,{orgId:orgs[0].id,legalEntityId:own});
    await client.query(`WITH seed AS (SELECT goal_id,session_id FROM autonomy_model_claims WHERE goal_id=$1 LIMIT 1),
      added AS (INSERT INTO autonomy_model_claims
        SELECT gen_random_uuid(),goal_id,session_id FROM seed CROSS JOIN generate_series(1,999) RETURNING id)
      INSERT INTO autonomy_provider_receipts SELECT id,'deepseek-flash',200,100,20,7,now() FROM added`,[goals[0].id]);
    await client.query(`SET LOCAL ROLE ${role}`);
    const full=await captureDevelopmentTelemetry(client,own,valid);
    assert.equal(full.provider?.requests,1000);assert.equal(full.receiptsTruncated,false);
    assert.equal(full.provider?.estimatedUpperUsd,0.054);
    await client.query("RESET ROLE");
    const extra=randomUUID();
    await client.query(`INSERT INTO autonomy_model_claims SELECT $1,goal_id,session_id FROM autonomy_model_claims WHERE goal_id=$2 LIMIT 1`,[extra,goals[0].id]);
    await client.query("INSERT INTO autonomy_provider_receipts VALUES($1,'deepseek-flash',200,100,20,7,now())",[extra]);
    await client.query(`SET LOCAL ROLE ${role}`);
    const overflow=await captureDevelopmentTelemetry(client,own,valid);
    assert.equal(overflow.provider?.requests,1000);assert.equal(overflow.receiptsTruncated,true);
    assert.equal(overflow.provider?.estimatedUpperUsd,null);
    assert.ok(overflow.alerts.some(a=>a.code==="USAGE_WINDOW_TRUNCATED"));
    assert.equal(JSON.stringify(overflow).includes(canary),false);
    await client.query("RESET ROLE");
    assert.equal((await client.query("SELECT count(*)::int n FROM outbox_events")).rows[0].n,0);
    await client.query("ROLLBACK");
    const receipt={status:"PASS",classification:"REAL_POSTGRES_SCOPE_TEST_WITH_PROVIDER_USAGE_FIXTURES",
      checkedAt:new Date().toISOString(),foreignQueueAndProviderReceiptsExcluded:true,tenantMismatchDenied:true,
      reasoningNotDoubleCharged:true,unknownCostNotZero:true,localActionableAlertCodes:alerts.map(a=>a.code),
      futureHeartbeatRejected:true,receiptBoundaryCounts:[1000,1001],truncatedTotalUnknownNotZero:true,
      provider503And429AlertedWithFixtures:true,fixtureProviderRequestsNotLiveCalls:true,
      rawIdentifiersAndCanaryNotExposed:true,outboxWrites:0,externalCalls:0};
    writeFileSync(".local/sam-dev/observability-evidence.json",JSON.stringify(receipt,null,2));
    console.log(JSON.stringify({test:"OBSERVABILITY",status:"PASS",externalCalls:0}));
  }finally{await client.query("ROLLBACK");client.release();await pool.end();}
}
main().catch(e=>{console.error(JSON.stringify({test:"OBSERVABILITY",status:"FAIL",code:e.code??"ASSERTION",details:e.code?"withheld":e.message}));process.exitCode=1;});
