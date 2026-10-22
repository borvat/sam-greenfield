import type { ModelTask } from "../../../packages/model-gateway/src/types";
import { localDevelopment, sanitizeDevelopmentPlanningInput, denyDevelopment, LOCAL_MODEL_BLOCK } from "./planningPolicy";
import { CYCLE_OBJECTIVE, cycleSyntheticTask } from "./syntheticProbe";

export interface DevelopmentCyclePermit { readonly scope: "synthetic-goal-cycle" }
type PlanningInput = { goalId: string; objective: string; context: unknown };
const permits = new WeakMap<object, { input: string; task: string; spent: boolean }>();
const exact = (value: unknown) => JSON.stringify(value);

// An in-process object, not an environment switch, bearer, or public authorization.
// It cannot authorize another goal, another task, facts, memory, or another call.
export function createDevelopmentCyclePermit(input: PlanningInput): DevelopmentCyclePermit {
  if (!localDevelopment() || process.env.NODE_ENV !== "development") denyDevelopment(LOCAL_MODEL_BLOCK);
  const projected = sanitizeDevelopmentPlanningInput(input);
  if (input.objective !== CYCLE_OBJECTIVE || exact(projected) !== exact({
    objective: CYCLE_OBJECTIVE, context: { entity: "synthetic_development", facts: [], memory: [] }
  })) denyDevelopment("CYCLE_SYNTHETIC_INPUT_REQUIRED");
  const permit = Object.freeze({ scope: "synthetic-goal-cycle" as const });
  permits.set(permit, { input: exact(input), task: exact(cycleSyntheticTask()), spent: false });
  return permit;
}

export function cyclePlanningTask(permit: DevelopmentCyclePermit | undefined, input: PlanningInput): ModelTask {
  const approved = permit && permits.get(permit);
  if (!localDevelopment() || !approved || approved.spent) denyDevelopment(LOCAL_MODEL_BLOCK);
  sanitizeDevelopmentPlanningInput(input); // Current record/value/entity allowlist still applies.
  if (approved.input !== exact(input)) denyDevelopment("CYCLE_GOAL_CONTEXT_MISMATCH");
  return JSON.parse(approved.task);
}

export function consumeCycleTask(permit: DevelopmentCyclePermit | undefined, task: ModelTask): ModelTask {
  const approved = permit && permits.get(permit);
  if (!approved || approved.spent) denyDevelopment(LOCAL_MODEL_BLOCK);
  if (exact(task) !== approved.task) denyDevelopment("CYCLE_TASK_MISMATCH");
  approved.spent = true; // No fallback or re-entry, even after an error.
  return JSON.parse(approved.task);
}
