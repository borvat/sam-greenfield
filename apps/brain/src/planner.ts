import { validateToolParameters } from "../../../packages/tool-gateway/src/validation";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
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
  // Explicit executable requests must not be replaced by a generic commerce
  // template. Preserve multiple named tools for cross-specialist objectives.
  const named=new Set(objective.match(/\b[a-z][a-z0-9]*_[a-z0-9_]+\b/g)??[]);
  const explicit=safe.filter(item=>named.has(String(item.capabilityId)));
  if(explicit.length)return explicit;
  const bolCommerce=/bol\.com/i.test(objective)&&/(sales|orders|inventory|stock|return|مبيعات|طلبات|مخزون|مرتجعات)/i.test(objective);
  if(!bolCommerce)return safe;
  if(/report|analy|تقرير|تحليل/i.test(objective)&&safe.some(item=>item.capabilityId==="bol_sales_stock_report"))return safe.filter(item=>item.capabilityId==="bol_sales_stock_report");
  return safe;
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
  forbiddenReadSteps?:Array<{capabilityId:string;params:Record<string,unknown>}>;
}): Promise<PersistPlanInput> {
  const capabilities=planningCapabilities(input.objective,input.availableCapabilities??[]);
  const requiredSteps=1;
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
        forbiddenReadSteps:input.forbiddenReadSteps??[],
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
            "Choose only steps required by the objective. A bounded single read may have one step; do not add unrelated reads to satisfy an invented step count. When multiple explicit capabilities are requested, include each of them.",
            "For bol_sales_stock_report, use exactly one report step for the requested date range. It performs pagination, aggregation, stock reads and reporting itself. Use only closed days; when asked for the last seven complete days, exclude today. Its output is not net profit and does not account for returns.",
            "Follow the user's scope and constraints.",
            "Independent verification runs automatically after execution. Never repeat an identical capability and parameter set as a verification step.",
            "Do not execute capabilities or cause side effects while planning."
          ]
        }
      }
    });

    try{
      const candidate = validateCandidatePlan(routed.result.output);
      if(candidate.steps.length<requiredSteps) throw new Error(`Planner requires at least ${requiredSteps} steps`);
      const unique=new Set<string>();
      for(const step of candidate.steps){
        const key=sha256Hex({capabilityId:step.capabilityId,params:step.params});
        if(unique.has(key))throw new Error(`Duplicate planned read/action: ${step.capabilityId}. Independent verification runs automatically after execution; do not repeat identical tool parameters.`);
        unique.add(key);
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
