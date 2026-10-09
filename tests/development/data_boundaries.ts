import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pool } from "../../packages/db/src/client";
import { assembleContext } from "../../apps/brain/src/contextAssembler";
import { proposePlan } from "../../apps/brain/src/planner";
import { runBrainPlanningCycle } from "../../apps/brain/src/executiveBrain";
import { runBrainReplanCycle } from "../../apps/brain/src/replanner";
import { observeAndEnterPlanning } from "../../apps/kernel/src/orchestrator";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";
import { sanitizeDevelopmentPlanningInput, authorizeDevelopmentGoal, LOCAL_MODEL_BLOCK } from "../../apps/development/src/planningPolicy";
import { sanitizedValidationSummary } from "../../apps/development/src/readSurface";

let phase = "fixtures";
const marker = "SYNTHETIC_PRIVATE_MARKER_DO_NOT_EXPORT";
const temp = mkdtempSync(join(tmpdir(), "sam-boundary-test-"));
const file = join(temp, "policy.json");
const actor = { actor: "local-test", systemOwner: true };
async function main() {
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE, "1");
  assert.match((await pool.query("SELECT current_schema() AS s")).rows[0].s, /^sam_replit_test_[0-9]+$/);
  const org = (await pool.query("INSERT INTO organizations(name) VALUES('Synthetic boundary fixtures') RETURNING id")).rows[0].id;
  const entities = (await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic A'),($1,'Synthetic B') RETURNING id", [org])).rows;
  const [a, b] = entities.map(row => row.id);
  const goals = [];
  for (const [index, entity] of [a, b].entries()) {
    goals.push((await pool.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,completion_definition)
      VALUES($1,$2,'development_probe',$3,'NEW','Local probe; not completed execution') RETURNING id,objective`,
    [`synthetic-boundary-${index}`, entity, `Synthetic local probe ${index}`])).rows[0]);
  }
  const facts: any[] = [];
  for (const [entity, value] of [[a, "synthetic allowed value"], [a, marker], [b, "OTHER_ENTITY_PRIVATE_DATA"]]) {
    facts.push((await pool.query(`INSERT INTO world_facts(entity_type,entity_id,domain,attribute,value,status,source,source_timestamp)
      VALUES('legal_entity',$1,'development_probe','probe',$2::jsonb,'VERIFIED','synthetic_test',now())
      RETURNING id,entity_type,entity_id,domain,attribute,value`, [entity, JSON.stringify(value)])).rows[0]);
  }
  for (const entity of [a, b]) {
    await pool.query(`INSERT INTO memory_records(type,statement,scope,source,status)
      VALUES('OWNER_DECISION',$1,$2::jsonb,'synthetic_test','APPROVED_RULE')`,
    [marker, JSON.stringify({ entity_id: entity })]);
  }
  process.env.SAM_DEV_LEGAL_ENTITY_ID = a;
  process.env.SAM_DEV_PLANNING_POLICY_FILE = file;
  process.env.SAM_TEST_SECRET = marker; // A fixture string, not a credential or connection token.
  const policy = {
    legalEntityId: a, approvedGoals: goals,
    approvedFacts: [{ id: facts[0].id, domain: "development_probe", attribute: "probe", value: facts[0].value }]
  };
  const save = (value = policy) => writeFileSync(file, JSON.stringify(value));
  phase = "default-denial";
  await assert.rejects(authorizeDevelopmentGoal(pool, goals[0].id), /GOAL_NOT_APPROVED/);
  save();
  phase = "entity-and-field-boundaries";
  const context = await assembleContext(pool, "legal_entity", a);
  assert.equal(context.facts.length, 1);
  assert.deepEqual(context.memory, []);
  const clean = sanitizeDevelopmentPlanningInput({ goalId: goals[0].id, objective: goals[0].objective, context });
  const serialized = JSON.stringify(clean);
  for (const forbidden of [a, b, facts[0].id, marker, "OTHER_ENTITY_PRIVATE_DATA"]) {
    assert.ok(!serialized.includes(forbidden));
  }
  await assert.rejects(assembleContext(pool, "legal_entity", b), /ENTITY_SCOPE/);
  await assert.rejects(assembleContext(pool, "user", a), /ENTITY_SCOPE/);
  save({ ...policy, approvedFacts: [...policy.approvedFacts, { ...policy.approvedFacts[0], id: facts[2].id }] });
  await assert.rejects(assembleContext(pool, "legal_entity", a), /FACT_SCOPE_OR_STATUS/);
  save({ ...policy, approvedFacts: [{ ...policy.approvedFacts[0], attribute: "password" }] });
  await assert.rejects(assembleContext(pool, "legal_entity", a), /INVALID_POLICY/);
  save();
  await pool.query("UPDATE world_facts SET value='\"changed since approval\"'::jsonb WHERE id=$1", [facts[0].id]);
  await assert.rejects(assembleContext(pool, "legal_entity", a), /FACT_DATA_NOT_APPROVED/);
  await pool.query("UPDATE world_facts SET value=$2::jsonb WHERE id=$1", [facts[0].id, JSON.stringify(facts[0].value)]);
  const payload = { goalId: goals[0].id, objective: goals[0].objective, context };
  for (const extra of [{ users: [] }, { financial_documents: [] }, { legal_documents: [] }, { replan_reason: marker }]) {
    assert.throws(() => sanitizeDevelopmentPlanningInput({ ...payload, context: { ...context, ...extra } }), /UNAPPROVED_FIELD/);
  }
  assert.throws(() => sanitizeDevelopmentPlanningInput({ ...payload, context: { ...context, memory: [marker] } }), /MEMORY_NOT_ALLOWED/);
  assert.throws(() => sanitizeDevelopmentPlanningInput({ ...payload, context: { ...context, facts: [facts[2]] } }), /FACT_DATA_NOT_APPROVED/);
  save({ ...policy, approvedFacts: [{ ...policy.approvedFacts[0], value: marker }] });
  assert.throws(() => sanitizeDevelopmentPlanningInput(payload), /SECRET_VALUE/);
  save();
  const gateway = new ModelGateway({});
  const brainInput = { gateway, goalId: goals[1].id, dataClassification: "INTERNAL" as const, maxCostUsd: 0, capabilityPolicies: {} };
  phase = "cross-entity-state-unchanged";
  await assert.rejects(runBrainPlanningCycle(brainInput), /ENTITY_SCOPE/);
  await assert.rejects(runBrainReplanCycle({ ...brainInput, reason: "synthetic local probe" }), /ENTITY_SCOPE/);
  await assert.rejects(observeAndEnterPlanning(goals[1].id), /ENTITY_SCOPE/);
  assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1", [goals[1].id])).rows[0].state, "NEW");
  phase = "model-call-prevention";
  let invoked = 0;
  await assert.rejects(proposePlan({ ...payload, gateway: { invoke: async () => { invoked++; throw new Error("must not run"); } } as any,
    dataClassification: "INTERNAL", maxCostUsd: 0 }), new RegExp(LOCAL_MODEL_BLOCK));
  assert.equal(invoked, 0); // Negative test trap, not a simulated planner or completed cycle.
  await assert.rejects(gateway.invoke({ task: "synthetic_probe", capability: "planning", input: {}, dataClassification: "INTERNAL" }), new RegExp(LOCAL_MODEL_BLOCK));
  phase = "real-local-goal-probe";
  // Real kernel transitions, approved synthetic facts, real gateway with NO adapters.
  // Stop at the explicit model boundary. No fabricated plan, execution or verifier.
  await assert.rejects(runBrainPlanningCycle({ ...brainInput, goalId: goals[0].id }), new RegExp(LOCAL_MODEL_BLOCK));
  phase = "real-goal-state";
  assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1", [goals[0].id])).rows[0].state, "PLANNING");
  for (const table of ["plans", "work_queue", "executions", "verifications", "side_effect_operations", "model_calls"]) {
    phase = `real-goal-no-${table}`;
    assert.equal((await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n, 0);
  }
  phase = "real-goal-transition-events";
  assert.equal((await pool.query(`SELECT count(*)::int AS n FROM outbox_events
    WHERE aggregate_id=$1 AND event_type='GOAL_STATE_CHANGED'`, [goals[0].id])).rows[0].n, 2);
  console.log("LOCAL_GOAL_PROBE PASS: real NEW -> MODELING -> PLANNING; stopped at disabled model; no plan/execution/verification/model call.");
  phase = "assistant-read-surface";
  const surface = createChatGPTToolSurface();
  assert.deepEqual(surface.definitions().map(tool => tool.name),
    ["sam_development_service_status", "sam_development_test_results"]);
  for (const name of ["sam_list_users", "sam_list_memory", "sam_list_financial_documents", "sam_list_legal_entities",
    "sam_list_goals", "sam_execute", "sam_system_status", marker]) {
    const denied = await surface.invoke(name, {}, actor);
    assert.equal(denied.ok, false);
    assert.ok(!JSON.stringify(denied).includes(marker));
  }
  for (const args of [{ entityId: b }, { sql: "SELECT * FROM users" }, { token: marker }]) {
    const denied = await surface.invoke("sam_development_test_results", args, actor);
    assert.equal(denied.ok, false);
    assert.ok(!JSON.stringify(denied).includes(marker));
  }
  assert.equal((await surface.invoke("sam_development_test_results", {}, { ...actor, systemOwner: false })).ok, false);
  process.env.SAM_DEV_VALIDATION_FILE = join(temp, "malicious-report.json");
  writeFileSync(process.env.SAM_DEV_VALIDATION_FILE, JSON.stringify({
    status: marker, passedSuites: marker, failedSuites: -9, authenticatedUi: marker,
    goalCycle: "COMPLETED", externalModelTest: "PASS", users: [marker], legal_documents: [marker], error: marker
  }));
  const summary = sanitizedValidationSummary();
  assert.ok(!JSON.stringify(summary).includes(marker));
  assert.equal(summary.goalCycle, "NOT_RUN");
  assert.equal(summary.externalModelTest, "NOT_RUN");
  phase = "original-behavior-outside-opt-in";
  delete process.env.SAM_DEVELOPMENT_SAFE_MODE;
  assert.ok(createChatGPTToolSurface().definitions().length >= 28);
  assert.equal((await assembleContext(pool, "legal_entity", a)).memory.length, 2);
  process.env.SAM_DEVELOPMENT_SAFE_MODE = "1";
  console.log("DEVELOPMENT_DATA_BOUNDARIES PASS: explicit record/field/entity allowlists; cross-entity mutation denied; memory/finance/users/tools rejected; secret fixtures absent from outputs; original opt-out behavior retained.");
}
main().then(async () => { rmSync(temp, { recursive: true, force: true }); await pool.end(); })
  .catch(async () => {
    console.error(`DEVELOPMENT_DATA_BOUNDARIES FAIL phase=${phase}; sensitive error details suppressed.`);
    rmSync(temp, { recursive: true, force: true }); await pool.end(); process.exitCode = 1;
  });
