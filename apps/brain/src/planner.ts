import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import type { PersistPlanInput, PlanStepInput } from "../../kernel/src/planning";

export interface CandidatePlan {
  assumptions: Record<string, unknown>;
  constraints: Record<string, unknown>;
  dependencies: Record<string, unknown>;
  steps: PlanStepInput[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateCandidatePlan(value: unknown): CandidatePlan {
  if (!isObject(value)) throw new Error("Planner output must be an object");
  if (!Array.isArray(value.steps) || value.steps.length === 0) {
    throw new Error("Planner output requires non-empty steps");
  }

  const steps = value.steps.map((raw, index) => {
    if (!isObject(raw) || typeof raw.capabilityId !== "string" || raw.capabilityId.length === 0) {
      throw new Error(`Planner step ${index} missing capabilityId`);
    }
    return {
      capabilityId: raw.capabilityId,
      params: isObject(raw.params) ? raw.params : {},
      priority: typeof raw.priority === "number" ? raw.priority : 0,
      idempotencyKey: typeof raw.idempotencyKey === "string" ? raw.idempotencyKey : null,
      operationKeyRef: typeof raw.operationKeyRef === "string" ? raw.operationKeyRef : null
    } satisfies PlanStepInput;
  });

  return {
    assumptions: isObject(value.assumptions) ? value.assumptions : {},
    constraints: isObject(value.constraints) ? value.constraints : {},
    dependencies: isObject(value.dependencies) ? value.dependencies : {},
    steps
  };
}

export async function proposePlan(input: {
  gateway: ModelGateway;
  goalId: string;
  objective: string;
  context: unknown;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
}): Promise<PersistPlanInput> {
  const routed = await input.gateway.invoke({
    task: "executive_planning",
    capability: "planning",
    dataClassification: input.dataClassification,
    maxCostUsd: input.maxCostUsd,
    preferredProviders: input.preferredProviders,
    input: {
      objective: input.objective,
      context: input.context,
      contract: {
        output: "CandidatePlan",
        rule: "proposal_only_no_side_effects"
      }
    }
  });

  const candidate = validateCandidatePlan(routed.result.output);
  return {
    goalId: input.goalId,
    assumptions: candidate.assumptions,
    constraints: candidate.constraints,
    dependencies: candidate.dependencies,
    steps: candidate.steps
  };
}
