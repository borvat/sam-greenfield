import { validateToolParameters } from "../../../packages/tool-gateway/src/validation";
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

function planningCapabilities(objective:string,items:unknown[]):Record<string,unknown>[]{
  const all=items.filter(isObject);
  const readOnly=/read[-\s]?only|sideEffect\s*=?\s*false|قراءة\s*فقط|دون\s+تعديل|لا\s+(?:تغيّر|تعدل|تنفذ)/i.test(objective);
  if(!readOnly)return all;
  const safe=all.filter(item=>item.sideEffect===false);
  const bolCommerce=/bol\.com/i.test(objective)&&/(sales|orders|inventory|stock|return|مبيعات|طلبات|مخزون|مرتجعات)/i.test(objective);
  if(!bolCommerce)return safe;
  const ids=["bol_list_orders","bol_get_inventory"];
  if(/return|مرتجعات/i.test(objective))ids.push("bol_list_returns");
  const relevant=ids.map(id=>safe.find(item=>item.capabilityId===id)).filter((item):item is Record<string,unknown>=>Boolean(item));
  return relevant.length?relevant:safe;
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
  availableCapabilities?:unknown[];
}): Promise<PersistPlanInput> {
  const capabilities=planningCapabilities(input.objective,input.availableCapabilities??[]);
  const bolReadOnlyPlan=/bol\.com/i.test(input.objective)&&/قراءة\s*فقط|read[-\s]?only|sideEffect\s*=?\s*false/i.test(input.objective);
  const requiredSteps=bolReadOnlyPlan && capabilities.some(c=>c.capabilityId==="bol_list_orders") && capabilities.some(c=>c.capabilityId==="bol_get_inventory")?2:1;
  const planningTime=new Date().toISOString();
  let previousError:string|undefined;
  for(let attempt=0;attempt<2;attempt++){
    const routed = await input.gateway.invoke({
      task: "executive_planning",
      capability: "planning",
      dataClassification: input.dataClassification,
      maxCostUsd: input.maxCostUsd/2,
      preferredProviders: input.preferredProviders,
      input: {
        objective: input.objective,
        planningTimeUtc:planningTime,
        validationFeedback:previousError,
        context: input.context,
        capabilities,
        contract: {
          output: "CandidatePlan",
          schema: {
            assumptions: "object",
            constraints: "object",
            dependencies: "object",
            steps: {
              type: "array",
              minItems: requiredSteps,
              items: {capabilityId:"an id from capabilities",params:"object matching that capability's parameters",priority:"integer"}
            }
          },
          rules: [
            "Return exactly one JSON object, with no markdown or prose.",
            "All parameters must be concrete values. Resolve relative dates against planningTimeUtc. Never use placeholders, templates, expressions, or invented variables. Dates must be real YYYY-MM-DD strings.",
            "This executor does not resolve output references or run prose instructions in assumptions/dependencies. Do not claim analysis, identity checks, pagination, or reporting are steps unless matching executable capabilities are included.",
            `The steps array must contain at least ${requiredSteps} entries; never return an empty plan.`,
            "Use only capability ids listed in capabilities.",
            "Respect each capability's sideEffect field; if the objective says read-only, choose only sideEffect=false capabilities.",
            "For a read-only bol.com sales and stock objective, include bol_list_orders and bol_get_inventory when they are listed.",
            "Follow the user's scope and constraints.",
            "Do not execute capabilities or cause side effects while planning."
          ]
        }
      }
    });

    try{
      const candidate = validateCandidatePlan(routed.result.output);
      if(candidate.steps.length<requiredSteps) throw new Error(`Planner requires at least ${requiredSteps} steps`);
      for(const step of candidate.steps){
        const descriptor=capabilities.find(item=>item.capabilityId===step.capabilityId);
        if(input.availableCapabilities && !descriptor) throw new Error(`Planner selected unavailable capability: ${step.capabilityId}`);
        validateToolParameters(step.capabilityId,step.params??{},descriptor?.parameters as Record<string,unknown>|undefined);
      }
      return {
        goalId: input.goalId,
        assumptions: candidate.assumptions,
        constraints: candidate.constraints,
        dependencies: candidate.dependencies,
        steps: candidate.steps
      };
    }catch(error){
      previousError=error instanceof Error?error.message:String(error);
      if(attempt===1) throw new Error(`Planner validation failed after correction: ${previousError}`);
    }
  }
  throw new Error("Planner did not produce a valid plan");
}
