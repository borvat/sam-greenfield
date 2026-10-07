import { withTransaction } from "../../../packages/db/src/client";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import { assembleContext } from "./contextAssembler";
import { proposePlan } from "./planner";
import { beginReplanAtomic } from "../../kernel/src/replanning";
import { persistPlanAndStartExecution } from "../../kernel/src/orchestrator";

export async function runBrainReplanCycle(input: {
  gateway: ModelGateway;
  goalId: string;
  reason: string;
  dataClassification: DataClassification;
  maxCostUsd: number;
  preferredProviders?: string[];
}) {
  const goal = await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id,objective,state,company_scope FROM goals WHERE id=$1",
      [input.goalId]
    );
    if (res.rowCount !== 1) throw new Error("Goal not found");
    return res.rows[0];
  });

  if (goal.state !== "REPLANNING") {
    throw new Error(`Brain replan cycle requires REPLANNING goal, got ${goal.state}`);
  }

  const replanState = await beginReplanAtomic(input.goalId,input.reason);
  if (replanState === "FAILED") {
    return { failed:true, reason:"replan_budget_exhausted" as const };
  }

  const context = await withTransaction(async (client) => {
    if (!goal.company_scope) {
      return { entity:{type:"legal_entity",id:null},facts:[],memory:[] };
    }
    return assembleContext(client,"legal_entity",goal.company_scope);
  });

  const candidate = await proposePlan({
    gateway:input.gateway,
    goalId:input.goalId,
    objective:goal.objective,
    context:{
      ...context,
      replan_reason:input.reason
    },
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    preferredProviders:input.preferredProviders
  });

  const persisted = await persistPlanAndStartExecution(candidate);

  return {
    failed:false,
    context,
    candidate,
    persisted
  };
}
