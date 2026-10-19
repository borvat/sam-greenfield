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

function isReadOnlyObjective(objective:string):boolean{
  return /read[-\s]?only|sideEffect\s*=?\s*false|قراءة\s*فقط|دون\s+تعديل|لا\s+(?:تغيّر|تعدل|تنفذ)/i.test(objective);
}

function planningCapabilities(objective:string,items:unknown[],context:unknown):Record<string,unknown>[]{
  const all=items.filter(isObject);
  const readOnly=isReadOnlyObjective(objective);
  if(!readOnly)return all;
  const safe=all.filter(item=>item.sideEffect===false);
  const bolCommerce=/bol\.com/i.test(objective)&&/(sales|orders|inventory|stock|return|مبيعات|طلبات|مخزون|مرتجعات)/i.test(objective);
  if(!bolCommerce)return safe;
  const ids=["bol_list_orders","bol_get_inventory"];
  if(/return|مرتجعات/i.test(objective))ids.push("bol_list_returns");
  const contextText=JSON.stringify(context??{});
  if(contextText.includes("orders_empty_while_recent_returns_exist"))ids.push("bol_get_order");
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
  const capabilities=planningCapabilities(input.objective,input.availableCapabilities??[],input.context);
  const bolReadOnlyPlan=/bol\.com/i.test(input.objective)&&isReadOnlyObjective(input.objective);
  const requiredSteps=bolReadOnlyPlan?2:1;
  const routed = await input.gateway.invoke({
    task: "executive_planning",
    capability: "planning",
    dataClassification: input.dataClassification,
    maxCostUsd: input.maxCostUsd,
    preferredProviders: input.preferredProviders,
    input: {
      objective: input.objective,
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
          `The steps array must contain at least ${requiredSteps} entries; never return an empty plan.`,
          "Use only capability ids listed in capabilities.",
          "Respect each capability's sideEffect field; if the objective says read-only, choose only sideEffect=false capabilities.",
          "For a read-only bol.com sales and stock objective, include bol_list_orders and bol_get_inventory when they are listed.",
          "For complete bol.com reads, start each paged endpoint at page 1; the SAM adapter automatically reads pages through the empty terminal page.",
          "For a full current inventory read, do not set quantity, stock, or state filters; derive low-stock products from the complete result.",
          "For a sales period, use the order placed date as the period boundary; the SAM adapter reads recent pages and filters locally by orderPlacedDateTime.",
          "If context shows orders_empty_while_recent_returns_exist, use bol_get_order for a small sample of orderIds from the return evidence to check the mismatch, and include that limitation in assumptions.",
          "Follow the user's scope and constraints.",
          "Do not execute capabilities or cause side effects while planning."
        ]
      }
    }
  });

  const candidate = validateCandidatePlan(routed.result.output);
  if(bolReadOnlyPlan&&/inventory|stock|مخزون/i.test(input.objective)){
    for(const step of candidate.steps){
      if(step.capabilityId!=="bol_get_inventory")continue;
      const params={...(step.params??{})};
      delete params.quantity;delete params.stock;delete params.state;
      step.params=params;
    }
  }
  return {
    goalId: input.goalId,
    assumptions: candidate.assumptions,
    constraints: candidate.constraints,
    dependencies: candidate.dependencies,
    steps: candidate.steps
  };
}
