import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { runOperationalSupervisorTick } from "../../apps/supervisor/src/runtime";

async function one(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return r.rows[0];
}

async function createFixtures(actor:string){
  return withTransaction(async(client)=>{
    const org=await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P6FA-${Date.now()}-${Math.random()}`]
    );
    const le=await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P6FALE-${Date.now()}-${Math.random()}`]
    );
    const goal=await client.query(
      `INSERT INTO goals(business_id,company_scope,objective,state,updated_at)
       VALUES($1,$2,'Phase6 final stale goal','EXECUTING',now()-interval '2 hours')
       RETURNING id`,
      [`P6FAG-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id]
    );

    await client.query(
      `INSERT INTO side_effect_operations
       (operation_key,capability_id,goal_id,legal_entity_id,request_hash,state,reconciliation_state)
       VALUES($1,'phase6_external',$2,$3,'hash','SENT','NEEDS_RECONCILIATION')`,
      [`p6fa-op-${Date.now()}-${Math.random()}`,goal.rows[0].id,le.rows[0].id]
    );

    await client.query(
      `INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health)
       VALUES($1,'["m"]'::jsonb,'["planning"]'::jsonb,'["INTERNAL"]'::jsonb,'DOWN')`,
      [`p6-provider-${Date.now()}-${Math.random()}`]
    );

    for(let i=0;i<4;i++){
      await client.query(
        `INSERT INTO model_calls
         (task,provider,model,reason_selected,tokens,cost,latency_ms,retry_count,success,verification_result,data_classification)
         VALUES('phase6','p6-test','m','synthetic',0,0,1,$1,false,'failure','INTERNAL')`,
        [i]
      );
    }

    return {goalId:goal.rows[0].id,legalEntityId:le.rows[0].id,actor};
  });
}

async function main(){
  const baselineDownProviders=Number((await one(
    "SELECT COUNT(*)::int AS count FROM model_providers WHERE health='DOWN'"
  )).count);
  const policy={
    staleActiveGoalLimit:0,
    staleVerificationLimit:0,
    oldPendingOutboxLimit:0,
    unresolvedSideEffectLimit:0,
    expiredLeaseLimit:0,
    downProviderLimit:baselineDownProviders,
    modelFailureRateLimit:1,
    modelFailureMinSamples:999999
  };
  const actor=`operational-supervisor-final-${Date.now()}-${Math.floor(Math.random()*1e9)}`;
  const fx=await createFixtures(actor);

  const first=await runOperationalSupervisorTick({
    actor,
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:60,
    policy
  });

  assert.equal(first.ownerBrief.overallStatus,"CRITICAL");
  const keys=new Set(first.ownerBrief.activeIncidents.map((i)=>i.incidentKey));
  assert.ok(keys.has("runtime:stale_active_goals"));
  assert.ok(keys.has("runtime:side_effect_reconciliation"));
  assert.ok(keys.has("runtime:model_providers_down"));


  const opened=await pool.query(
    `SELECT after_ref->>'incident_key' AS incident_key
       FROM audit_log
      WHERE actor=$1
        AND action='INCIDENT_OPENED'`,
    [actor]
  );
  assert.ok(opened.rowCount>=3);

  const outboxOpened=Number((await one(
    `SELECT COUNT(*)::int AS count
       FROM outbox_events
      WHERE event_type='SUPERVISOR_INCIDENT_OPENED'
        AND payload->>'incident_key' IN (
          'runtime:stale_active_goals',
          'runtime:side_effect_reconciliation',
          'runtime:model_providers_down'
        )`
  )).count);
  assert.ok(outboxOpened>=3);

  const second=await runOperationalSupervisorTick({
    actor,
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:60,
    policy
  });

  assert.equal(second.incidentDelta.opened.length,0);

  await pool.query(
    "UPDATE goals SET state='COMPLETED',updated_at=now() WHERE id=$1",
    [fx.goalId]
  );
  await pool.query(
    `UPDATE side_effect_operations
        SET state='CONFIRMED',
            reconciliation_state='RECONCILED',
            last_reconciled_at=now(),
            updated_at=now()
      WHERE goal_id=$1`,
    [fx.goalId]
  );
  await pool.query(
    "UPDATE model_providers SET health='HEALTHY' WHERE provider_id LIKE 'p6-provider-%'"
  );
  await pool.query(
    "UPDATE model_calls SET created_at=now()-interval '2 hours' WHERE task='phase6'"
  );

  const third=await runOperationalSupervisorTick({
    actor,
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:15,
    policy
  });

  assert.ok(third.incidentDelta.resolved.includes("runtime:stale_active_goals"));
  assert.ok(third.incidentDelta.resolved.includes("runtime:side_effect_reconciliation"));
  assert.ok(third.incidentDelta.resolved.includes("runtime:model_providers_down"));

  const outboxResolved=Number((await one(
    `SELECT COUNT(*)::int AS count
       FROM outbox_events
      WHERE event_type='SUPERVISOR_INCIDENT_RESOLVED'
        AND payload->>'incident_key' IN (
          'runtime:stale_active_goals',
          'runtime:side_effect_reconciliation',
          'runtime:model_providers_down',
          'runtime:model_failure_rate'
        )`
  )).count);
  assert.ok(outboxResolved>=3);

  assert.equal(
    third.ownerBrief.activeIncidents.filter((i)=>[
      "runtime:stale_active_goals",
      "runtime:side_effect_reconciliation",
      "runtime:model_providers_down"
    ].includes(i.incidentKey)).length,
    0
  );

  console.log("PHASE6_FINAL_ACCEPTANCE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
