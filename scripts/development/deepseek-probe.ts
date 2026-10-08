import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pool } from "../../packages/db/src/client";
import { OpenAICompatibleChatAdapter } from "../../packages/model-providers/src/openaiCompatible";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { observeAndEnterPlanning } from "../../apps/kernel/src/orchestrator";
import { sanitizeDevelopmentPlanningInput } from "../../apps/development/src/planningPolicy";
import { evaluatePlanAuthority } from "../../apps/brain/src/authorityGuard";
import { syntheticTask, preflight, boundedTransport, validateSyntheticPlan, candidateShape,
  PROBE_MODEL, PROBE_BASE_URL, PROBE_CAPABILITY, OBJECTIVE } from "../../apps/development/src/syntheticProbe";

const reportFile = join(process.cwd(), ".local/sam-dev/deepseek-probe-report.json");
const lockFile = join(process.cwd(), ".local/sam-dev/deepseek-probe-used.json");
const temp = mkdtempSync(join(tmpdir(), "sam-synthetic-probe-"));
const report: any = {
  checkedAt: new Date().toISOString(), status: "BLOCKED", provider: "deepseek",
  requestedModel: PROBE_MODEL, liveInferenceAttempts: 0, authentication: "NOT_RUN",
  candidateValidation: "NOT_RUN", authorityValidation: "NOT_RUN", execution: "NOT_RUN",
  originalStructureValidation: "NOT_RUN", syntheticContractValidation: "NOT_RUN",
  verification: "NOT_RUN", ordinaryExternalCallsBlocked: true,
  pricingSources: ["https://api-docs.deepseek.com/quick_start/pricing", "https://api-docs.deepseek.com/api/create-chat-completion"]
};
let stage = "local_preflight";
function save() { writeFileSync(reportFile, JSON.stringify(report, null, 2)); }
async function main() {
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE, "1");
  assert.match((await pool.query("SELECT current_schema() AS s")).rows[0].s, /^sam_replit_test_[0-9]+$/);
  assert.equal(process.env.DEEPSEEK_MODEL, PROBE_MODEL);
  const task = syntheticTask();
  report.preflight = preflight(task);
  // This is the FULL model task, not business context or a business-derived preview.
  console.log(JSON.stringify({ LOCAL_SYNTHETIC_PREFLIGHT: "PASS", task, bounds: report.preflight }));
  stage = "synthetic_goal";
  const org = (await pool.query("INSERT INTO organizations(name) VALUES('Synthetic office probe') RETURNING id")).rows[0].id;
  const entity = (await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic probe entity') RETURNING id", [org])).rows[0].id;
  const goal = (await pool.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,completion_definition)
    VALUES('synthetic-office-probe',$1,'development_probe',$2,'NEW','Proposal only; execution and verification not tested')
    RETURNING id,objective`, [entity, OBJECTIVE])).rows[0];
  process.env.SAM_DEV_LEGAL_ENTITY_ID = entity;
  process.env.SAM_DEV_PLANNING_POLICY_FILE = join(temp, "policy.json");
  writeFileSync(process.env.SAM_DEV_PLANNING_POLICY_FILE, JSON.stringify({
    legalEntityId: entity, approvedGoals: [goal], approvedFacts: []
  }));
  const context = await observeAndEnterPlanning(goal.id); // Original SAM kernel/context boundaries.
  const projected = sanitizeDevelopmentPlanningInput({ goalId: goal.id, objective: goal.objective, context });
  assert.deepEqual(projected, { objective: OBJECTIVE, context: { entity: "synthetic_development", facts: [], memory: [] } });
  const payload = JSON.stringify(task);
  for (const localId of [org, entity, goal.id]) assert.ok(!payload.includes(localId));
  report.goalTransitions = ["NEW", "MODELING", "PLANNING"];
  report.contextBoundary = "PASS";
  await assert.rejects(new ModelGateway({}).invoke(task), /LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  stage = "account_model_availability";
  const catalog = await fetch(`${PROBE_BASE_URL}/models`, {
    headers: { authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    redirect: "error", signal: AbortSignal.timeout(15_000)
  });
  report.accountCatalogHttpStatus = catalog.status;
  report.authentication = catalog.ok ? "PASS" : "FAIL";
  if (!catalog.ok) throw new Error("Catalog rejected.");
  const models = await catalog.json() as any;
  report.accountModelAvailable = Array.isArray(models.data) && models.data.some((item: any) => item.id === PROBE_MODEL);
  if (!report.accountModelAvailable) throw new Error("Approved Flash model unavailable.");
  save();
  stage = "live_inference";
  const adapter = new OpenAICompatibleChatAdapter("deepseek", {
    apiKey: process.env.DEEPSEEK_API_KEY!, baseUrl: PROBE_BASE_URL,
    transport: boundedTransport({
      claim() {
        writeFileSync(lockFile, JSON.stringify({ claimedAt: new Date().toISOString(), model: PROBE_MODEL }), { flag: "wx" });
        report.liveInferenceAttempts = 1;
        save();
      },
      onResponse(metadata) { Object.assign(report, metadata); save(); }
    })
  });
  const result = await adapter.invoke(task, PROBE_MODEL); // Existing SAM provider, no gateway fallback/retries.
  stage = "original_plan_validation";
  // Retain only bounded diagnostic booleans, never raw response/error values.
  report.candidateShape = candidateShape(result.output);
  let candidate;
  try {
    candidate = validateSyntheticPlan(result.output, () => {
      report.originalStructureValidation = "PASS";
      save();
    });
  } catch {
    report.candidateValidation = "FAIL";
    if (report.originalStructureValidation === "PASS") report.syntheticContractValidation = "FAIL";
    else report.originalStructureValidation = "FAIL";
    save();
    throw new Error("Plan rejected.");
  }
  report.candidateValidation = "PASS";
  report.syntheticContractValidation = "PASS";
  stage = "original_authority_validation";
  const authority = await evaluatePlanAuthority(pool, {
    goalId: goal.id, legalEntityId: entity, steps: candidate.steps,
    capabilityPolicies: { [PROBE_CAPABILITY]: "GREEN" }
  });
  report.authorityValidation = authority.authorized ? "PASS" : "FAIL";
  assert.equal(authority.authorized, true);
  report.proposedTaskOrder = candidate.steps.map(step => ({ task: step.params.task, priority: step.priority }));
  for (const table of ["plans", "work_queue", "executions", "verifications", "side_effect_operations", "model_calls"]) {
    const count = (await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
    assert.equal(count, 0);
  }
  report.executionRows = 0; report.verificationRows = 0; report.sideEffectRows = 0;
  report.persistedPlans = 0;
  report.goalState = (await pool.query("SELECT state FROM goals WHERE id=$1", [goal.id])).rows[0].state;
  report.transitionEventCount = (await pool.query("SELECT count(*)::int AS n FROM outbox_events WHERE aggregate_id=$1 AND event_type='GOAL_STATE_CHANGED'", [goal.id])).rows[0].n;
  assert.equal(report.goalState, "PLANNING");
  assert.equal(report.transitionEventCount, 2);
  await assert.rejects(new ModelGateway({}).invoke(task), /LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  report.status = "PASS";
  report.note = "Live proposal validated only; no plan persistence, execution, or verification. Direct test adapter evidence is in this report, not model_calls.";
}
main().catch(() => {
  report.status = report.liveInferenceAttempts ? "FAIL" : "BLOCKED";
  report.failureStage = stage; // No raw provider/DB errors or response body in diagnostics.
  process.exitCode = 1;
}).finally(async () => {
  save();
  console.log(JSON.stringify({ DEEPSEEK_PROBE_RESULT: report }));
  rmSync(temp, { recursive: true, force: true });
  await pool.end();
});
