import { createHash } from "node:crypto";
import { taskPrompt } from "../../../packages/model-providers/src/common";
import type { ModelTask } from "../../../packages/model-gateway/src/types";
import { validateCandidatePlan } from "../../brain/src/planner";
import { assertSafeScalar } from "./planningPolicy";

export const PROBE_MODEL = "deepseek-flash";
export const PROBE_BASE_URL = "https://api.deepseek.com";
export const PROBE_CAPABILITY = "synthetic.office_task";
export const OUTPUT_LIMIT = 512;
// Official peak/cache-miss prices checked before the approved test, in USD/1M.
export const PRICES = { input: 0.30, output: 1.20 };
export const OBJECTIVE = "Prioritize exactly three fictional office tasks. Proposal only; do not perform any action.";
export const CYCLE_OBJECTIVE = "Organize three fictional office tasks and record their priority internally in the isolated development database. No external actions.";

export function syntheticTask(): ModelTask {
  return {
    task: "executive_planning", capability: "planning", dataClassification: "PUBLIC",
    maxCostUsd: 0.25,
    input: {
      objective: OBJECTIVE,
      context: {
        synthetic: true,
        tasks: [
          { label: "A", description: "Sort fictional stationery supplies", dueInDays: 3, importance: 1 },
          { label: "B", description: "Draft an agenda for a fictional meeting", dueInDays: 1, importance: 3 },
          { label: "C", description: "Arrange a fictional empty folder", dueInDays: 7, importance: 1 }
        ]
      },
      capabilities: [{ name: PROBE_CAPABILITY, description: "Describe a fictional task in a proposed priority list only; no executor." }],
      contract: {
        format: "JSON object only; no markdown",
        assumptions: {}, constraints: { proposalOnly: true }, dependencies: {},
        steps: "Exactly three steps ordered by priority: first 3, second 2, third 1. These are unique ranks, not the importance values from context. Each task A, B, C occurs once. Each step has ONLY capabilityId, params={task:one letter}, priority.",
        expectedShape: {
          assumptions: {}, constraints: { proposalOnly: true }, dependencies: {},
          steps: [3, 2, 1].map(priority => ({
            capabilityId: PROBE_CAPABILITY, params: { task: `TASK_AT_RANK_${priority}` }, priority
          }))
        },
        placeholderRule: "Return this exact object shape. Replace each TASK_AT_RANK placeholder with one of A, B, C, choosing order from context. No placeholders, extra fields, explanations, or markdown."
      }
    }
  };
}

export function cycleSyntheticTask(): ModelTask {
  const task = syntheticTask();
  const input = task.input as any;
  input.objective = CYCLE_OBJECTIVE;
  input.capabilities[0].description = "Record a fictional task and its rank in the local development database only. No email, Drive, finance, legal action, or external execution.";
  input.contract.plannerRule = "Only propose JSON. SAM independently authorizes execution. For these fictional deadlines, the required task order is B,A,C with ranks 3,2,1.";
  return task;
}

export type ProbePhase = "original_structure" | "synthetic_contract" | "response_safety" | "provider_response";
export class ProbeRejection extends Error {
  constructor(readonly phase: ProbePhase, readonly code: string, readonly stepIndex?: number) {
    super(`SYNTHETIC_PROBE_${code}`);
  }
}
export function rejectionEvidence(error: unknown) {
  return error instanceof ProbeRejection
    ? { phase: error.phase, code: error.code, ...(error.stepIndex === undefined ? {} : { stepIndex: error.stepIndex }) }
    : null;
}
function deny(code: string): never { throw new ProbeRejection("provider_response", code); }
function equal(a: unknown, b: unknown) { return JSON.stringify(a) === JSON.stringify(b); }

export function assertSafeResponse(value: unknown) {
  try { assertSafeScalar(value); }
  catch (error) {
    const message = error instanceof Error ? error.message : "";
    const code = message === "Local development denied: SECRET_VALUE" ? "SECRET_VALUE"
      : message === "Local development denied: UNSAFE_VALUE" ? "UNSAFE_VALUE" : "SAFETY_CHECK_FAILED";
    throw new ProbeRejection("response_safety", code);
  }
}
export function preflight(task: ModelTask) {
  if (!equal(task, syntheticTask()) && !equal(task, cycleSyntheticTask())) deny("UNAPPROVED_INPUT");
  const content = taskPrompt(task);
  assertSafeScalar(content);
  if (/postgres(?:ql)?:\/\/|Bearer\s|-----BEGIN |(?:sk-|ghp_)[A-Za-z0-9_-]{8,}|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(content)) {
    deny("SENSITIVE_INPUT");
  }
  const bytes = Buffer.byteLength(content, "utf8");
  if (bytes > 3000) deny("INPUT_TOO_LARGE");
  // Conservative byte-level token bound plus chat framing overhead; no cache credit.
  const inputTokenUpperBound = bytes + 256;
  const costUpperBoundUsd = (inputTokenUpperBound * PRICES.input + OUTPUT_LIMIT * PRICES.output) / 1_000_000;
  if (costUpperBoundUsd > 0.25) deny("BUDGET");
  return {
    syntheticOnly: true, businessContextRead: false, facts: 0, memory: 0, tasks: 3,
    payloadBytes: bytes, payloadSha256: createHash("sha256").update(content).digest("hex"),
    inputTokenUpperBound, maxOutputTokens: OUTPUT_LIMIT, reasoningEnabled: false,
    costUpperBoundUsd, pricesPerMillionUsd: PRICES
  };
}

export function validateSyntheticPlan(
  raw: unknown, originalValidated: () => void = () => {},
  phasePassed: (phase: ProbePhase) => void = () => {}
) {
  // First apply SAM's original structural validator; then the stricter probe contract.
  let candidate;
  try { candidate = validateCandidatePlan(raw); }
  catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Planner output must be an object") throw new ProbeRejection("original_structure", "ORIGINAL_NON_OBJECT");
    if (message === "Planner output requires non-empty steps") throw new ProbeRejection("original_structure", "ORIGINAL_NONEMPTY_STEPS");
    const match = /^Planner step (\d+) missing capabilityId$/.exec(message);
    if (match) throw new ProbeRejection("original_structure", "ORIGINAL_CAPABILITY_ID", Number(match[1]));
    throw new ProbeRejection("original_structure", "ORIGINAL_VALIDATION_FAILED");
  }
  originalValidated();
  phasePassed("original_structure");
  const value = raw as any;
  const reject = (code: string, stepIndex?: number): never => { throw new ProbeRejection("synthetic_contract", code, stepIndex); };
  if (Object.keys(value).sort().join(",") !== "assumptions,constraints,dependencies,steps") reject("PLAN_FIELDS_ROOT_KEYS");
  if (!equal(value.assumptions, {})) reject("PLAN_FIELDS_ASSUMPTIONS");
  if (!equal(value.dependencies, {})) reject("PLAN_FIELDS_DEPENDENCIES");
  if (!equal(value.constraints, { proposalOnly: true })) reject("PLAN_FIELDS_CONSTRAINTS");
  if (candidate.steps.length !== 3) reject("PLAN_FIELDS_STEP_COUNT");
  const seen = new Set<string>();
  for (const [index, step] of candidate.steps.entries()) {
    const source = value.steps[index];
    if (Object.keys(source).sort().join(",") !== "capabilityId,params,priority") reject("PLAN_STEPS_KEYS", index);
    if (step.capabilityId !== PROBE_CAPABILITY) reject("PLAN_STEPS_CAPABILITY", index);
    if (Object.keys(step.params).join(",") !== "task") reject("PLAN_STEPS_PARAMS", index);
    if (!["A", "B", "C"].includes(String(step.params.task))) reject("PLAN_STEPS_TASK", index);
    if (seen.has(String(step.params.task))) reject("PLAN_STEPS_DUPLICATE_TASK", index);
    if (step.priority !== 3 - index) reject("PLAN_STEPS_RANK_SEQUENCE", index);
    seen.add(String(step.params.task));
  }
  phasePassed("synthetic_contract");
  assertSafeResponse(JSON.stringify(candidate));
  phasePassed("response_safety");
  return candidate;
}

export function candidateShape(raw: unknown) {
  const value = raw as any;
  const steps = Array.isArray(value?.steps) ? value.steps : [];
  return {
    isObject: Boolean(value && typeof value === "object" && !Array.isArray(value)),
    requiredRootFieldsPresent: ["assumptions", "constraints", "dependencies", "steps"].every(key => value && Object.hasOwn(value, key)),
    extraRootFieldsPresent: value && typeof value === "object" ? Object.keys(value).some(key => !["assumptions", "constraints", "dependencies", "steps"].includes(key)) : false,
    stepCount: steps.length,
    proposalOnlyConstraint: equal(value?.constraints, { proposalOnly: true }),
    emptyAssumptions: equal(value?.assumptions, {}),
    emptyDependencies: equal(value?.dependencies, {}),
    uniqueTaskLabels: steps.length === 3 && new Set(steps.map((step: any) => step?.params?.task)).size === 3,
    allCapabilitiesAllowed: steps.length > 0 && steps.every((step: any) => step?.capabilityId === PROBE_CAPABILITY),
    allParamsAllowed: steps.length > 0 && steps.every((step: any) =>
      step?.params && Object.keys(step.params).join(",") === "task" && ["A", "B", "C"].includes(step.params.task)),
    allStepFieldsAllowed: steps.length > 0 && steps.every((step: any) =>
      step && typeof step === "object" && Object.keys(step).sort().join(",") === "capabilityId,params,priority"),
    ranksMatchContract: steps.length === 3 && steps.every((step: any, index: number) => step?.priority === 3 - index)
  };
}

export function boundedTransport(input: {
  claim: () => void;
  onResponse: (metadata: Record<string, any>) => void;
  request?: typeof fetch;
  variant?: "goal-cycle";
}) {
  let spent = false;
  return async (url: string, init: RequestInit) => {
    if (spent) deny("ALREADY_ATTEMPTED");
    const task = input.variant === "goal-cycle" ? cycleSyntheticTask() : syntheticTask();
    const check = preflight(task);
    const expected = { model: PROBE_MODEL, messages: [{ role: "user", content: taskPrompt(task) }] };
    let body: any;
    try { body = JSON.parse(String(init.body)); } catch { deny("INVALID_BODY"); }
    const headers = new Headers(init.headers);
    if (url !== `${PROBE_BASE_URL}/chat/completions` || init.method !== "POST" ||
        !equal(body, expected) ||
        [...headers.keys()].sort().join(",") !== "authorization,content-type" ||
        !headers.get("authorization")?.startsWith("Bearer ") ||
        headers.get("content-type") !== "application/json") deny("UNAPPROVED_REQUEST");
    const boundedBody = {
      ...expected, max_tokens: OUTPUT_LIMIT, thinking: { type: "disabled" },
      reasoning_effort: "none", response_format: { type: "json_object" }, stream: false
    };
    spent = true; // No retry after any transport error, timeout, or response rejection.
    input.claim(); // Durable, exclusive claim immediately before the sole inference.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      let response: Response;
      try {
        response = await (input.request ?? fetch)(url, {
          method: "POST", headers, body: JSON.stringify(boundedBody),
          signal: controller.signal, redirect: "error", credentials: "omit"
        });
      } catch { deny("TRANSPORT_FAILURE"); }
      input.onResponse({ httpStatus: response.status });
      if (!response.ok) deny("PROVIDER_HTTP_REJECTION");
      const text = await response.text();
      if (Buffer.byteLength(text) > 64_000) deny("RESPONSE_TOO_LARGE");
      let result: any;
      try { result = JSON.parse(text); } catch { deny("RESPONSE_JSON"); }
      const usage = result.usage;
      const reasoning = usage?.completion_tokens_details?.reasoning_tokens ?? 0;
      if (!Number.isInteger(usage?.prompt_tokens) || usage.prompt_tokens < 0 ||
          usage.prompt_tokens > check.inputTokenUpperBound ||
          !Number.isInteger(usage?.completion_tokens) || usage.completion_tokens < 0 ||
          usage.completion_tokens > OUTPUT_LIMIT || reasoning !== 0 ||
          result.choices?.[0]?.message?.reasoning_content ||
          result.choices?.[0]?.message?.tool_calls?.length) deny("RESPONSE_LIMITS");
      const content = result.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.length > 4000) deny("RESPONSE_CONTENT");
      if (typeof result.model !== "string" || !/^deepseek-(?:flash|v4(?:\.1)?-flash)(?:-[a-z0-9]+)*$/i.test(result.model)) deny("RESPONSE_MODEL");
       assertSafeResponse(result.model);
      const cost = (usage.prompt_tokens * PRICES.input + usage.completion_tokens * PRICES.output) / 1_000_000;
      input.onResponse({
        httpStatus: response.status, reportedModel: result.model,
        responseIdSha256: createHash("sha256").update(String(result.id ?? "")).digest("hex"),
        finishReason: result.choices?.[0]?.finish_reason === "stop" ? "stop" : "other",
        usage: { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, reasoningTokens: reasoning },
        actualCostUpperBoundUsd: cost
      });
       assertSafeResponse(content);
       input.onResponse({ responseSafetyValidation: "PASS" });
      if (result.choices?.[0]?.finish_reason !== "stop") deny("INCOMPLETE_RESPONSE");
      return result;
    } finally { clearTimeout(timer); }
  };
}
