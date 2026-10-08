import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { OpenAICompatibleChatAdapter } from "../../packages/model-providers/src/openaiCompatible";
import { evaluatePlanAuthority } from "../../apps/brain/src/authorityGuard";
import { ModelGateway } from "../../packages/model-gateway/src/gateway";
import { syntheticTask, preflight, boundedTransport, validateSyntheticPlan, candidateShape,
  PROBE_MODEL, PROBE_BASE_URL, PROBE_CAPABILITY, OUTPUT_LIMIT } from "../../apps/development/src/syntheticProbe";

async function main() {
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE, "1");
  assert.equal(process.env.DEEPSEEK_API_KEY, undefined);
  const task = syntheticTask();
  const bounds = preflight(task);
  assert.ok(bounds.costUpperBoundUsd < 0.25);
  assert.equal(bounds.reasoningEnabled, false);
  for (const altered of [
    { ...task, input: { ...task.input as any, memory: ["private fixture"] } },
    { ...task, input: { ...task.input as any, entityId: "other entity" } },
    { ...task, input: { ...task.input as any, users: [] } },
    { ...task, input: { objective: "sk-fixture_secret_12345678" } },
    { ...task, maxCostUsd: 0 }, { ...task, capability: "email" }
  ]) assert.throws(() => preflight(altered), /UNAPPROVED_INPUT/);
  const plan = {
    assumptions: {}, constraints: { proposalOnly: true }, dependencies: {},
    steps: ["B", "A", "C"].map((label, index) => ({ capabilityId: PROBE_CAPABILITY, params: { task: label }, priority: 3 - index }))
  };
  validateSyntheticPlan(plan);
  assert.throws(() => validateSyntheticPlan({ steps: [] }));
  assert.throws(() => validateSyntheticPlan({ ...plan, users: [] }), /PLAN_FIELDS/);
  let originalValidated = false;
  assert.throws(() => validateSyntheticPlan({ ...plan, users: [] }, () => { originalValidated = true; }), /PLAN_FIELDS/);
  assert.equal(originalValidated, true);
  originalValidated = false;
  assert.throws(() => validateSyntheticPlan({ steps: [] }, () => { originalValidated = true; }));
  assert.equal(originalValidated, false);
  assert.ok(!JSON.stringify(candidateShape({ "sk-private_fixture_12345": "PRIVATE_FIXTURE" })).includes("PRIVATE_FIXTURE"));
  assert.equal(candidateShape(plan).ranksMatchContract, true);
  for (const modified of [
    { ...plan.steps[0], capabilityId: "email.send" },
    { ...plan.steps[0], params: { task: "B", token: "fixture" } },
    { ...plan.steps[0], params: { task: "REAL_COMPANY" } },
    { ...plan.steps[0], priority: 4 }, { ...plan.steps[0], operationKeyRef: "fixture" }
  ]) assert.throws(() => validateSyntheticPlan({ ...plan, steps: [modified, ...plan.steps.slice(1)] }), /PLAN_STEPS/);
  let calls = 0, claims = 0;
  const transport = boundedTransport({
    claim() { claims++; }, onResponse() {},
    request: (async (url: string, options: RequestInit) => {
      calls++;
      assert.equal(url, `${PROBE_BASE_URL}/chat/completions`);
      assert.equal(options.redirect, "error");
      const body = JSON.parse(String(options.body));
      assert.equal(body.max_tokens, OUTPUT_LIMIT);
      assert.deepEqual(body.thinking, { type: "disabled" });
      assert.equal(body.reasoning_effort, "none");
      assert.deepEqual(body.response_format, { type: "json_object" });
      assert.equal(body.tools, undefined);
      assert.ok(!JSON.stringify(body).includes("LOCAL_AUTH_FIXTURE"));
      return new Response(JSON.stringify({
        id: "synthetic-response", model: PROBE_MODEL,
        choices: [{ message: { content: JSON.stringify(plan) }, finish_reason: "stop" }],
        usage: { prompt_tokens: 400, completion_tokens: 100, completion_tokens_details: { reasoning_tokens: 0 } }
      }), { status: 200 });
    }) as any
  });
  const adapter = new OpenAICompatibleChatAdapter("deepseek", { apiKey: "LOCAL_AUTH_FIXTURE", baseUrl: PROBE_BASE_URL, transport });
  await assert.rejects(adapter.invoke({ ...task, input: { memory: [] } }, PROBE_MODEL), /UNAPPROVED_REQUEST/);
  await assert.rejects(adapter.invoke(task, "other-model"), /UNAPPROVED_REQUEST/);
  assert.equal(calls, 0);
  const output = await adapter.invoke(task, PROBE_MODEL);
  validateSyntheticPlan(output.output);
  await assert.rejects(adapter.invoke(task, PROBE_MODEL), /ALREADY_ATTEMPTED/);
  assert.equal(calls, 1); assert.equal(claims, 1);
  let failedCalls = 0;
  const failed = new OpenAICompatibleChatAdapter("deepseek", {
    apiKey: "LOCAL_AUTH_FIXTURE", baseUrl: PROBE_BASE_URL,
    transport: boundedTransport({ claim() {}, onResponse() {}, request: (async () => {
      failedCalls++; return new Response('{"error":{"message":"PRIVATE_FIXTURE"}}', { status: 401 });
    }) as any })
  });
  await assert.rejects(failed.invoke(task, PROBE_MODEL), error => !String(error).includes("PRIVATE_FIXTURE") && /PROVIDER_HTTP_REJECTION/.test(String(error)));
  await assert.rejects(failed.invoke(task, PROBE_MODEL), /ALREADY_ATTEMPTED/);
  assert.equal(failedCalls, 1);
  for (const reply of [
    { model: PROBE_MODEL, choices: [{ message: { content: "{}" }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: OUTPUT_LIMIT + 1 } },
    { model: PROBE_MODEL, choices: [{ message: { content: "{}" }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 10, completion_tokens_details: { reasoning_tokens: 1 } } },
    { model: PROBE_MODEL, choices: [{ message: { content: "sk-fiction_secret_12345678" }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 10 } },
    { model: PROBE_MODEL, choices: [{ message: { content: "{}", tool_calls: [{}] }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 10 } },
    { model: PROBE_MODEL, choices: [{ message: { content: "{}" }, finish_reason: "length" }], usage: { prompt_tokens: 10, completion_tokens: 10 } },
    { model: PROBE_MODEL, choices: [{ message: { content: "{}" }, finish_reason: "stop" }], usage: {} }
  ]) {
    let attempts = 0;
    const rejected = new OpenAICompatibleChatAdapter("deepseek", {
      apiKey: "LOCAL_AUTH_FIXTURE", baseUrl: PROBE_BASE_URL,
      transport: boundedTransport({ claim() {}, onResponse() {}, request: (async () => {
        attempts++; return new Response(JSON.stringify(reply), { status: 200 });
      }) as any })
    });
    await assert.rejects(rejected.invoke(task, PROBE_MODEL), error => !String(error).includes("sk-fiction_secret_12345678"));
    await assert.rejects(rejected.invoke(task, PROBE_MODEL), /ALREADY_ATTEMPTED/);
    assert.equal(attempts, 1);
  }
  const timedOut = new OpenAICompatibleChatAdapter("deepseek", {
    apiKey: "LOCAL_AUTH_FIXTURE", baseUrl: PROBE_BASE_URL,
    transport: boundedTransport({ claim() {}, onResponse() {}, request: (async () => {
      throw new Error("PRIVATE_TRANSPORT_FIXTURE");
    }) as any })
  });
  await assert.rejects(timedOut.invoke(task, PROBE_MODEL), error =>
    /TRANSPORT_FAILURE/.test(String(error)) && !String(error).includes("PRIVATE_TRANSPORT_FIXTURE"));
  await assert.rejects(timedOut.invoke(task, PROBE_MODEL), /ALREADY_ATTEMPTED/);
  await assert.rejects(new ModelGateway({}).invoke(task), /LOCAL_DEVELOPMENT_MODELS_DISABLED/);
  const goal = (await pool.query(`INSERT INTO goals(business_id,domain,objective,state,completion_definition)
    VALUES('synthetic-probe-unit','development_probe','Synthetic authority check','NEW','Not executed') RETURNING id`)).rows[0];
  const authorityInput = { goalId: goal.id, legalEntityId: null, steps: validateSyntheticPlan(plan).steps, capabilityPolicies: { [PROBE_CAPABILITY]: "GREEN" as const } };
  assert.equal((await evaluatePlanAuthority(pool, authorityInput)).authorized, true);
  assert.equal((await evaluatePlanAuthority(pool, { ...authorityInput, capabilityPolicies: {} })).authorized, false);
  assert.equal((await evaluatePlanAuthority(pool, { ...authorityInput, capabilityPolicies: { [PROBE_CAPABILITY]: "RED" } })).authorized, false);
  console.log("SYNTHETIC_PROBE_UNIT PASS: fixed-input rejection; tool/field rejection; bounded outputs; one attempt after success/error; original validation/authority; normal gateway stays denied. Responses here are unit fixtures, NOT live inference.");
}
main().then(async () => { await pool.end(); }).catch(async () => {
  console.error("SYNTHETIC_PROBE_UNIT FAIL: sensitive details suppressed.");
  await pool.end(); process.exitCode = 1;
});
