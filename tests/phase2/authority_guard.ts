import assert from "node:assert/strict";
import { pool, withTransaction } from "../../packages/db/src/client";
import { evaluatePlanAuthority } from "../../apps/brain/src/authorityGuard";
import { sha256Hex } from "../../packages/shared/src/stableJson";

async function createGoal(authorityCeiling: "GREEN"|"YELLOW"|"RED") {
  return withTransaction(async (client) => {
    const org = await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", [`P2AUTH-${Date.now()}-${Math.random()}`]);
    const le = await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id", [org.rows[0].id,`P2AUTHLE-${Date.now()}-${Math.random()}`]);
    const g = await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING',$4) RETURNING id",
      [`P2AUTH-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id,"Authority test",authorityCeiling]
    );
    return {goalId:g.rows[0].id,legalEntityId:le.rows[0].id};
  });
}

async function main(){
  const policies = {
    test_echo:"GREEN",
    supplier_email:"YELLOW",
    bank_transfer:"RED"
  } as const;

  const greenGoal = await createGoal("GREEN");
  const green = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:greenGoal.goalId,
    legalEntityId:greenGoal.legalEntityId,
    steps:[{capabilityId:"test_echo",params:{value:1}}],
    capabilityPolicies:policies
  }));
  assert.equal(green.authorized,true);

  const unknown = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:greenGoal.goalId,
    legalEntityId:greenGoal.legalEntityId,
    steps:[{capabilityId:"mystery_tool",params:{}}],
    capabilityPolicies:policies
  }));
  assert.equal(unknown.authorized,false);
  assert.equal(unknown.blocked[0].reason,"UNKNOWN_CAPABILITY_POLICY");

  const aboveCeiling = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:greenGoal.goalId,
    legalEntityId:greenGoal.legalEntityId,
    steps:[{capabilityId:"supplier_email",params:{supplier_id:"s1"}}],
    capabilityPolicies:policies
  }));
  assert.equal(aboveCeiling.authorized,false);
  assert.equal(aboveCeiling.blocked[0].reason,"ABOVE_GOAL_CEILING");

  const yellowGoal = await createGoal("YELLOW");
  const yellowParams = {supplier_id:"s1",subject:"RFQ"};
  const needsApproval = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:yellowGoal.goalId,
    legalEntityId:yellowGoal.legalEntityId,
    steps:[{capabilityId:"supplier_email",params:yellowParams}],
    capabilityPolicies:policies
  }));
  assert.equal(needsApproval.authorized,false);
  assert.equal(needsApproval.blocked[0].reason,"APPROVAL_REQUIRED");

  await pool.query(
    `INSERT INTO approvals
      (goal_id,capability_id,params_hash,legal_entity_id,expiry_at,authority_class,requested_by,approved_by,status)
     VALUES($1,$2,$3,$4,now()+interval '1 hour','YELLOW','brain-test','owner-test','APPROVED')`,
    [yellowGoal.goalId,"supplier_email",sha256Hex(yellowParams),yellowGoal.legalEntityId]
  );

  const approved = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:yellowGoal.goalId,
    legalEntityId:yellowGoal.legalEntityId,
    steps:[{capabilityId:"supplier_email",params:yellowParams}],
    capabilityPolicies:policies
  }));
  assert.equal(approved.authorized,true);

  const changedParams = await withTransaction((client)=>evaluatePlanAuthority(client,{
    goalId:yellowGoal.goalId,
    legalEntityId:yellowGoal.legalEntityId,
    steps:[{capabilityId:"supplier_email",params:{supplier_id:"s1",subject:"CHANGED"}}],
    capabilityPolicies:policies
  }));
  assert.equal(changedParams.authorized,false);
  assert.equal(changedParams.blocked[0].reason,"APPROVAL_REQUIRED");

  console.log("PHASE2_AUTHORITY_GUARD PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
