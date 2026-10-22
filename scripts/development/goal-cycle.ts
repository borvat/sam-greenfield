import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { pool, withTransaction } from "../../packages/db/src/client";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { OpenAICompatibleChatAdapter } from "../../packages/model-providers/src/openaiCompatible";
import { runCatalogPlanningCycle } from "../../apps/agents/src/executiveFlow";
import { createDevelopmentCyclePermit } from "../../apps/development/src/cyclePermit";
import { officeBundle } from "../../apps/development/src/officeCapability";
import { syntheticTask, cycleSyntheticTask, preflight, boundedTransport, CYCLE_OBJECTIVE, PROBE_MODEL, PROBE_BASE_URL, PROBE_CAPABILITY, rejectionEvidence } from "../../apps/development/src/syntheticProbe";

const unit = process.env.SAM_CYCLE_UNIT_TEST === "1";
const file = join(process.cwd(), `.local/sam-dev/goal-cycle-${unit ? "local-acceptance" : "report"}.json`);
const temp = mkdtempSync(join(tmpdir(), "sam-real-cycle-"));
const marker = unit ? join(temp, "fixture-used.json") : join(process.cwd(), ".local/sam-dev/goal-cycle-used.json");
const report: any = { startedAt: new Date().toISOString(), status: "BLOCKED", liveInferenceAttempts: 0,
  providerMode: unit ? "LOCAL_UNIT_FIXTURE" : "LIVE", planning: "NOT_RUN", execution: "NOT_RUN", verification: "NOT_RUN", ordinaryExternalCallsBlocked: true };
let stage = "local_preflight";
const save = () => writeFileSync(file, JSON.stringify(report, null, 2));

async function main() {
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE, "1");
  assert.equal((await pool.query("SELECT current_schema() AS name")).rows[0].name, unit ? "sam_replit_test_cycle" : "sam_replit_goal_cycle");
  const role = (await pool.query("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user")).rows[0];
  assert.equal(role.rolsuper, false); assert.equal(role.rolbypassrls, false);
  report.nonBypassApplicationRole = true;
  const entity = process.env.SAM_DEV_LEGAL_ENTITY_ID!;
  stage = "rls_cross_entity_reads";
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM legal_entities")).rows[0].n, 1);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM legal_entities WHERE id=$1", [process.env.SAM_CYCLE_FOREIGN_ENTITY])).rows[0].n, 0);
  await assert.rejects(withTransaction(client => client.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state)
    VALUES('forbidden-sentinel',$1,'development_probe','Synthetic forbidden entity','NEW')`, [process.env.SAM_CYCLE_FOREIGN_ENTITY])), (error: any) => error.code === "42501");
  report.rlsCrossEntityReadDenied = true; report.rlsCrossEntityInsertDenied = true;
  stage = "synthetic_goal_creation";
  const goal = (await pool.query("SELECT id,objective FROM goals WHERE id=$1", [process.env.SAM_CYCLE_GOAL_ID])).rows[0];
  assert.equal(goal.objective, CYCLE_OBJECTIVE);
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result)
    VALUES('development-goal-input',$1,'GOAL_SUBMITTED','local_cycle','GREEN','NEW')`, [goal.id]);
  // IDs remain local audit references, never model input.
  report.goalId = goal.id;
  const context = { entityType: "legal_entity", entityId: entity, facts: [], memory: [] };
  process.env.SAM_DEV_PLANNING_POLICY_FILE = join(temp, "policy.json");
  writeFileSync(process.env.SAM_DEV_PLANNING_POLICY_FILE, JSON.stringify({
    legalEntityId: entity, approvedGoals: [{ id: goal.id, objective: CYCLE_OBJECTIVE }], approvedFacts: []
  }));
  report.preflight = preflight(cycleSyntheticTask());
  console.log(JSON.stringify({ LOCAL_CYCLE_PREFLIGHT: report.preflight, rls: "non-bypass role; cross-entity reads/inserts denied" }));
  const permit = createDevelopmentCyclePermit({ goalId: goal.id, objective: CYCLE_OBJECTIVE, context });
  if (unit) {
    const denied = new ModelGateway({}, { scope: "synthetic-goal-cycle" });
    await assert.rejects(denied.invoke(cycleSyntheticTask()), /LOCAL_DEVELOPMENT_MODELS_DISABLED/);
    assert.throws(() => createDevelopmentCyclePermit({ goalId: goal.id, objective: CYCLE_OBJECTIVE,
      context: { ...context, entityId: process.env.SAM_CYCLE_FOREIGN_ENTITY } }), /ENTITY_SCOPE/);
    assert.throws(() => createDevelopmentCyclePermit({ goalId: goal.id, objective: CYCLE_OBJECTIVE,
      context: { ...context, memory: [{ secret: "fixture" }] } }), /MEMORY_NOT_ALLOWED/);
    assert.throws(() => new ModelGateway({}, permit).developmentPlanningTask({
      goalId: goal.id, objective: CYCLE_OBJECTIVE, context: { ...context, extra: "forbidden" }
    }), /UNAPPROVED_FIELD/);
    report.permitNegativeTests = "PASS";
  }
  const adapter = new OpenAICompatibleChatAdapter("deepseek", { apiKey: process.env.DEEPSEEK_API_KEY!, baseUrl: PROBE_BASE_URL,
    transport: boundedTransport({
      variant: "goal-cycle",
      ...(unit ? { request: async () => new Response(JSON.stringify({
        model: PROBE_MODEL, id: "explicit-unit-fixture-not-live", usage: { prompt_tokens: 50, completion_tokens: 100 },
        choices: [{ finish_reason: "stop", message: { content: JSON.stringify({
          assumptions: {}, constraints: { proposalOnly: true }, dependencies: {},
          steps: ["B", "A", "C"].map((task, index) => ({ capabilityId: PROBE_CAPABILITY, params: { task }, priority: 3 - index }))
        }) } }]
      }), { status: 200 }) } : {}),
      claim() { writeFileSync(marker, JSON.stringify({ claimedAt: new Date().toISOString(), model: PROBE_MODEL }), { flag: "wx" }); report.liveInferenceAttempts = unit ? 0 : 1; report.transportAttempts = 1; save(); },
      onResponse(metadata) { Object.assign(report, metadata); save(); }
    }) });
  const gateway = new ModelGateway({ deepseek: adapter }, permit, phase => { report[phase] = "PASS"; save(); });
  const bundle = officeBundle(goal.id, entity);
  stage = "real_catalog_planning";
  const planned = await runCatalogPlanningCycle({ catalog: bundle.catalog, gateway, goalId: goal.id, dataClassification: "PUBLIC", maxCostUsd: 0.25 });
  await assert.rejects(gateway.invoke(cycleSyntheticTask()), /LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  report.secondPlanningCallDenied = true;
  report.planId = planned.persisted.planId; report.planHash = planned.persisted.planHash;
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,source,authority_class,result,after_ref)
    VALUES('original-brain-planner',$1,'PLAN_ACCEPTED','plan',$2,'local_cycle','GREEN','PERSISTED',$3)`,
    [goal.id, planned.persisted.planId, JSON.stringify({ planHash: planned.persisted.planHash })]);
  report.planning = "PASS"; report.authority = planned.authority.authorized ? "PASS" : "FAIL"; save();
  stage = "local_execution_worker";
  // The execution worker is a separate process with NO model/OAuth credentials.
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/API.?KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTHORIZATION/i.test(key)) delete env[key];
  env.SAM_CYCLE_GOAL_ID = goal.id;
  const worker = spawnSync(process.execPath, ["--import", "tsx", "scripts/development/goal-cycle-worker.ts"], {
    env, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: 60000
  });
  report.workerExitCode = worker.status;
  if (unit && worker.status !== 0) console.log(JSON.stringify({ localUnitWorkerFailed: true }));
  if (worker.status !== 0) throw new Error("Local worker failed; raw output suppressed.");
  stage = "database_acceptance";
  const state = (await pool.query("SELECT state FROM goals WHERE id=$1", [goal.id])).rows[0].state;
  report.goalState = state;
  const counts: any = {};
  for (const table of ["plans", "work_queue", "executions", "verifications", "development_office_results", "model_calls", "side_effect_operations"]) {
    counts[table] = (await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
  }
  report.counts = counts;
  assert.equal(state, "COMPLETED");
  assert.equal(counts.plans, 1); assert.equal(counts.work_queue, 3);
  assert.equal(counts.executions, 3); assert.equal(counts.verifications, 3);
  assert.equal(counts.development_office_results, 3); assert.equal(counts.model_calls, 1);
  assert.equal(counts.side_effect_operations, 0);
  const artifacts = (await pool.query("SELECT task,priority FROM development_office_results ORDER BY priority DESC")).rows;
  assert.deepEqual(artifacts, [{ task: "B", priority: 3 }, { task: "A", priority: 2 }, { task: "C", priority: 1 }]);
  report.artifacts = artifacts;
  report.independentHashBindings = (await pool.query(`SELECT count(*)::int AS n FROM verifications v
    JOIN executions e ON e.id=v.execution_id JOIN plans p ON p.id=e.plan_id
    WHERE v.result='VERIFIED' AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash
    AND v.execution_hash=e.execution_hash AND p.plan_hash=e.plan_hash`)).rows[0].n;
  assert.equal(report.independentHashBindings, 3);
  report.specialistHandoffs = (await pool.query(`SELECT count(*)::int AS n FROM work_queue
    WHERE status='EXECUTED' AND fencing_token>0 AND handoff->>'worker_instance_id'='local-office-cycle-worker'`)).rows[0].n;
  assert.equal(report.specialistHandoffs, 3);
  await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result)
    VALUES('independent-cycle-acceptance',$1,'GOAL_COMPLETION_CONFIRMED','local_cycle','COMPLETED')`, [goal.id]);
  counts.audit_log = (await pool.query("SELECT count(*)::int AS n FROM audit_log")).rows[0].n;
  assert.equal(counts.audit_log, 9);
  await assert.rejects(withTransaction(client => client.query("UPDATE audit_log SET result='tampered' WHERE goal_id=$1", [goal.id])), (error: any) => error.code === "P0001");
  report.auditAppendOnlyEnforced = true;
  report.auditTransitions = (await pool.query(`SELECT payload->>'from' AS from_state,payload->>'to' AS to_state,event_type
    FROM outbox_events WHERE aggregate_id=$1 AND event_type='GOAL_STATE_CHANGED' ORDER BY created_at,id`, [goal.id])).rows;
  report.modelAuditRecorded = (await pool.query("SELECT success,retry_count,cost FROM model_calls")).rows;
  report.auditRows = (await pool.query("SELECT actor,action,result,timestamp,evidence_id FROM audit_log ORDER BY timestamp,id")).rows;
  report.fabricEvents = (await pool.query("SELECT count(*)::int AS n FROM event_fabric_events")).rows[0].n;
  report.pendingOutbox = (await pool.query("SELECT count(*)::int AS n FROM outbox_events WHERE status='PENDING'")).rows[0].n;
  assert.equal(report.auditTransitions.length, 5);
  assert.equal(report.pendingOutbox, 0);
  report.execution = "PASS"; report.verification = "PASS"; report.status = "PASS";
  report.completedAt = new Date().toISOString();
}
main().catch(error => {
  report.status = "FAIL"; report.failureStage = stage;
  report.sqlState = typeof error.code === "string" && /^[A-Z0-9_]+$/.test(error.code) ? error.code : undefined;
  report.deniedObject = /^permission denied for (?:table|sequence) ([a-z_]+)$/.exec(error.message ?? "")?.[1];
  report.rlsDeniedTable = /^new row violates row-level security policy for table "([a-z_]+)"$/.exec(error.message ?? "")?.[1];
  report.rejection = rejectionEvidence(error) ?? { code: "LOCAL_CYCLE_STAGE_FAILED" };
}).finally(async () => {
  try { await assert.rejects(new ModelGateway({}).invoke(syntheticTask()), /LOCAL_DEVELOPMENT_MODELS_DISABLED/); }
  catch { report.ordinaryExternalCallsBlocked = false; report.status = "FAIL"; }
  if (unit) {
    report.fixtureUsageNotBilled = report.usage; delete report.usage;
    report.fixtureCostComputationNotBilled = report.actualCostUpperBoundUsd; delete report.actualCostUpperBoundUsd;
  }
  save(); console.log(JSON.stringify({ GOAL_CYCLE_RESULT: report }));
  rmSync(temp, { recursive: true, force: true }); await pool.end();
  if (report.status !== "PASS") process.exitCode = 1;
});
