import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { runOperationalSupervisorTick } from "../../apps/supervisor/src/runtime";

async function count(sql:string,params:any[]=[]){
  const r=await pool.query(sql,params);
  return Number(r.rows[0].count);
}

async function createStaleGoal(){
  return withTransaction(async(client)=>{
    const org=await client.query(
      "INSERT INTO organizations(name) VALUES($1) RETURNING id",
      [`P6-${Date.now()}-${Math.random()}`]
    );
    const le=await client.query(
      "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
      [org.rows[0].id,`P6LE-${Date.now()}-${Math.random()}`]
    );
    const goal=await client.query(
      `INSERT INTO goals(business_id,company_scope,objective,state,updated_at)
       VALUES($1,$2,'Phase6 stale goal','EXECUTING',now()-interval '2 hours')
       RETURNING id`,
      [`P6G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id]
    );
    return goal.rows[0].id as string;
  });
}

async function main(){
  const actor=`operational-supervisor-test-${Date.now()}-${Math.floor(Math.random()*1e9)}`;
  const staleGoalId=await createStaleGoal();

  const first=await runOperationalSupervisorTick({
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:15,
    actor
  });

  assert.ok(first.candidates.some((i)=>i.incidentKey==="runtime:stale_active_goals"));
  assert.ok(first.incidentDelta.opened.includes("runtime:stale_active_goals"));
  assert.ok(["ERROR","CRITICAL"].includes(first.ownerBrief.overallStatus));

  const openedCount=await count(
    `SELECT COUNT(*)::int AS count
       FROM audit_log
      WHERE actor=$1
        AND action='INCIDENT_OPENED'
        AND after_ref->>'incident_key'='runtime:stale_active_goals'`,
    [actor]
  );
  assert.equal(openedCount,1);

  const second=await runOperationalSupervisorTick({
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:15,
    actor
  });

  assert.ok(second.incidentDelta.active.includes("runtime:stale_active_goals"));

  const openedCountAfterSecond=await count(
    `SELECT COUNT(*)::int AS count
       FROM audit_log
      WHERE actor=$1
        AND action='INCIDENT_OPENED'
        AND after_ref->>'incident_key'='runtime:stale_active_goals'`,
    [actor]
  );
  assert.equal(openedCountAfterSecond,1);

  await pool.query(
    "UPDATE goals SET state='COMPLETED',updated_at=now() WHERE id=$1",
    [staleGoalId]
  );

  const third=await runOperationalSupervisorTick({
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:15,
    actor
  });

  assert.ok(third.incidentDelta.resolved.includes("runtime:stale_active_goals"));

  const resolvedCount=await count(
    `SELECT COUNT(*)::int AS count
       FROM audit_log
      WHERE actor=$1
        AND action='INCIDENT_RESOLVED'
        AND after_ref->>'incident_key'='runtime:stale_active_goals'`,
    [actor]
  );
  assert.equal(resolvedCount,1);

  let mutationBlocked=false;
  try{
    await pool.query(
      `UPDATE audit_log
          SET result='MUTATED'
        WHERE actor=$1
          AND action='INCIDENT_OPENED'
          AND after_ref->>'incident_key'='runtime:stale_active_goals'`,
      [actor]
    );
  }catch{
    mutationBlocked=true;
  }
  assert.equal(mutationBlocked,true);

  const latest=await runOperationalSupervisorTick({
    staleGoalMinutes:30,
    staleVerificationMinutes:15,
    oldOutboxMinutes:5,
    modelLookbackMinutes:15,
    actor
  });

  assert.ok(!latest.ownerBrief.activeIncidents.some((i)=>i.incidentKey==="runtime:stale_active_goals"));

  console.log("PHASE6_OPERATIONAL_SUPERVISION PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
