import {validateParameters} from '../../../packages/tool-gateway/src/validation';
import {normalizeDependencies,validateStepGraph} from '../../kernel/src/dependencies';
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import type { PersistPlanInput, PlanStepInput } from "../../kernel/src/planning";
import { localDevelopment, sanitizeDevelopmentPlanningInput, denyDevelopment, LOCAL_MODEL_BLOCK } from "../../development/src/planningPolicy";
import { validateSyntheticPlan } from "../../development/src/syntheticProbe";
import { autonomyEnabled,validateAutonomyCandidate } from "../../development/src/autonomyBoundary";

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

  let steps:PlanStepInput[] = value.steps.map((raw, index) => {
    if (!isObject(raw) || typeof raw.capabilityId !== "string" || raw.capabilityId.length === 0) {
      throw new Error(`Planner step ${index} missing capabilityId`);
    }
    return {
      capabilityId: raw.capabilityId,
      stepKey:raw.stepKey as string|undefined,
      dependsOn:raw.dependsOn as string[]|undefined,
      resultRefs:raw.resultRefs as PlanStepInput["resultRefs"],
      params: raw.params===undefined?{}:isObject(raw.params)?raw.params:(()=>{throw new Error("PLAN_PARAMETERS_INVALID")})(),
      priority: typeof raw.priority === "number" ? raw.priority : 0,
      idempotencyKey: typeof raw.idempotencyKey === "string" ? raw.idempotencyKey : null,
      operationKeyRef: typeof raw.operationKeyRef === "string" ? raw.operationKeyRef : null
    } satisfies PlanStepInput;
  });

  validateStepGraph(steps);
  steps=normalizeDependencies(steps,isObject(value.dependencies)?value.dependencies:{});
  validateStepGraph(steps);
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
  signal?: AbortSignal;
  preferredProviders?: string[];
  availableCapabilities?: unknown[];
}): Promise<PersistPlanInput> {
  if (localDevelopment()) {
    sanitizeDevelopmentPlanningInput(input);
    if (typeof input.gateway.developmentPlanningTask !== "function") denyDevelopment(LOCAL_MODEL_BLOCK);
  }
  const task = localDevelopment() ? input.gateway.developmentPlanningTask(input) : {
    task: "executive_planning",
    capability: "planning",
    dataClassification: input.dataClassification,
    maxCostUsd: input.maxCostUsd,
    signal:input.signal,preferredProviders: input.preferredProviders,
    input: {
      objective: input.objective,
    context: input.context,
    capabilities:input.availableCapabilities??[],
      contract: {
        output: "CandidatePlan",
        rule: "proposal_only_no_side_effects"
      }
    }
  };
  input.signal?.throwIfAborted();
  let onAbort:(()=>void)|undefined;
  const abort=new Promise<never>((_,reject)=>{onAbort=()=>reject(new Error('PLANNING_DEADLINE_EXCEEDED'));input.signal?.addEventListener('abort',onAbort,{once:true});});
  let routed;
  try{routed=await Promise.race([input.gateway.invoke(task as import("../../../packages/model-gateway/src/types").ModelTask),abort]);}
  finally{if(onAbort)input.signal?.removeEventListener('abort',onAbort);}
  input.signal?.throwIfAborted();

  if(autonomyEnabled())validateAutonomyCandidate(routed.result.output);
  const candidate = localDevelopment() && !autonomyEnabled() ?
    validateSyntheticPlan(routed.result.output, () => {}, phase => input.gateway.recordDevelopmentValidation(phase)) :
    validateCandidatePlan(routed.result.output);
  for(const step of candidate.steps){
    const descriptor=(input.availableCapabilities as {capabilityId:string;parameters?:Record<string,unknown>}[]|undefined)?.find(c=>c.capabilityId===step.capabilityId);
    if(!Object.keys(step.resultRefs??{}).length)validateParameters(descriptor?.parameters,step.params??{});
  }
  return {
    goalId: input.goalId,
    assumptions: candidate.assumptions,
    constraints: candidate.constraints,
    dependencies: candidate.dependencies,
    steps: candidate.steps
  };
}
