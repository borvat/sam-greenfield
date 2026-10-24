import { withTransaction } from "../../db/src/client";
import { recordModelCall } from "../../db/src/modelCalls";
import { loadProviderRegistry } from "./registry";
import { routeModel } from "./router";
import { applyRecentFailureCircuitBreaker } from "./health";
import { localDevelopment } from "../../../apps/development/src/planningPolicy";
import type { ProbePhase } from "../../../apps/development/src/syntheticProbe";
import type { ModelProviderAdapter, ModelTask, ProviderResult } from "./types";
import { cyclePlanningTask, consumeCycleTask, type DevelopmentCyclePermit } from "../../../apps/development/src/cyclePermit";
import { isAutonomyPermit,type AutonomyPermit } from "../../../apps/development/src/autonomyPermit";
import {assertEvaluationPermit,assertEvaluationPrice} from './evaluationPermit';
import {assertRegisteredEvaluationAdapter} from './evaluationAdapter';
import {measuredPolicyFromEnv,type MeasuredRoutingPolicy} from './measuredRouting';

export class ModelGateway {
  constructor(
    private readonly adapters: Record<string, ModelProviderAdapter>,
    private readonly developmentPermit?: DevelopmentCyclePermit|AutonomyPermit,
    private readonly developmentDiagnostic?: (phase: ProbePhase) => void,
    private readonly measuredRoutingPolicy:MeasuredRoutingPolicy|undefined=measuredPolicyFromEnv()
  ) {}

  developmentPlanningTask(input: { goalId: string; objective: string; context: any;availableCapabilities?:any[] }): ModelTask {
    return isAutonomyPermit(this.developmentPermit)?this.developmentPermit.planningTask(input):
      cyclePlanningTask(this.developmentPermit as DevelopmentCyclePermit, { goalId: input.goalId, objective: input.objective, context: input.context });
  }

  recordDevelopmentValidation(phase: ProbePhase) {
    this.developmentDiagnostic?.(phase);
  }

  async invoke(task: ModelTask): Promise<{
    providerId: string;
    result: ProviderResult;
    attempts: number;
  }> {
    const restrictedDevelopment = localDevelopment();
    if (restrictedDevelopment) task = isAutonomyPermit(this.developmentPermit)?await this.developmentPermit.consume(task):
      consumeCycleTask(this.developmentPermit as DevelopmentCyclePermit, task);
    const providers = await withTransaction(async (client) => {
      const registry = await loadProviderRegistry(client);
      return applyRecentFailureCircuitBreaker(client, registry);
    });
    if(task.boundedSynthetic&&task.boundedEvaluation)throw Error('MODEL_BOUNDARY_CONFLICT');
    if(task.boundedEvaluation)assertEvaluationPermit(task.boundedEvaluation.permit);
    const bounded=task.boundedEvaluation??task.boundedSynthetic;
    if(bounded){
      if(!Number.isSafeInteger(bounded.maxInputTokens)||!Number.isSafeInteger(bounded.maxOutputTokens)||
        bounded.maxInputTokens<1||bounded.maxOutputTokens<1||
        Buffer.byteLength(JSON.stringify(task.input),'utf8')>bounded.maxInputTokens)throw Error('MODEL_INPUT_BUDGET_INVALID');
    }
    if(this.measuredRoutingPolicy&&this.measuredRoutingPolicy.taskClass!==task.task)throw Error('MEASURED_ROUTING_TASK_CLASS_MISMATCH');
    const candidates = routeModel(task, providers,bounded?{inputTokens:bounded.maxInputTokens,outputTokens:bounded.maxOutputTokens}:{},this.measuredRoutingPolicy)
      .filter(candidate => !restrictedDevelopment || candidate.providerId === "deepseek" && candidate.model === "deepseek-flash")
      .slice(0, restrictedDevelopment ? 1 : undefined);
    if (candidates.length === 0) {
      throw new Error("No eligible model provider for task");
    }

    let lastError: unknown;
    let reservedBudgetUsd = 0;

    for (let i = 0; i < candidates.length; i++) {
      task.signal?.throwIfAborted();
      const candidate = candidates[i];

      if (
        task.maxCostUsd !== undefined &&
        reservedBudgetUsd + candidate.estimatedCostUsd > task.maxCostUsd
      ) {
        lastError = new Error(
          `Model fallback budget exhausted: reserved=${reservedBudgetUsd.toFixed(6)} next=${candidate.estimatedCostUsd.toFixed(6)} ceiling=${task.maxCostUsd.toFixed(6)}`
        );
        break;
      }
      reservedBudgetUsd += candidate.estimatedCostUsd;

      const adapter = this.adapters[candidate.providerId];
      if (!adapter) {
        lastError = new Error(`No adapter configured for provider ${candidate.providerId}`);
        if(bounded?.note)await bounded.note({kind:'ADAPTER_MISSING',providerId:candidate.providerId,model:candidate.model});
        await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: candidate.model,
          reasonSelected: candidate.reason,
          latencyMs: 0,
          retryCount: i,
          success: false,
          verificationResult: "ADAPTER_MISSING",
          dataClassification: task.dataClassification
        }));
        continue;
      }

      let ticket:string|void=undefined;let finished=false;
      if(bounded){
        if(task.boundedEvaluation){
          assertRegisteredEvaluationAdapter(adapter,task.boundedEvaluation.permit.mode);
          const provider=providers.find(p=>p.providerId===candidate.providerId)!;
          assertEvaluationPrice(task.boundedEvaluation.permit,candidate.providerId,candidate.model,provider.costPer1kInput,provider.costPer1kOutput);
          if(adapter.executionMode!==(task.boundedEvaluation.permit.mode==='fixture'?'evaluation-fixture':'evaluation-live')||adapter.supportsUsageLimits!==true)throw Error('EVALUATION_ADAPTER_REQUIRED');
        }else if(adapter.executionMode!=='synthetic'||adapter.supportsUsageLimits!==true)throw Error('BOUNDED_SYNTHETIC_ADAPTER_REQUIRED');
        ticket=await bounded.reserveAttempt({providerId:candidate.providerId,model:candidate.model,
          tokens:bounded.maxInputTokens+bounded.maxOutputTokens,costUsd:candidate.estimatedCostUsd});
      }
      const started = Date.now();
      try {
        task.signal?.throwIfAborted();
        const result = await adapter.invoke(task, candidate.model);
        task.signal?.throwIfAborted();
        if(bounded&&(!Number.isSafeInteger(result.usage.inputTokens)||!Number.isSafeInteger(result.usage.outputTokens)||
          result.usage.inputTokens<0||result.usage.outputTokens<0||result.usage.inputTokens>bounded.maxInputTokens||
          result.usage.outputTokens>bounded.maxOutputTokens||Buffer.byteLength(JSON.stringify(result.output),'utf8')>bounded.maxOutputTokens))
          throw Error('MODEL_USAGE_LIMIT_VIOLATION');
        if(task.boundedEvaluation&&result.model!==candidate.model)throw Error('EVALUATION_MODEL_MISMATCH');
        const provider = providers.find((p) => p.providerId === candidate.providerId)!;
        const costUsd =
          (result.usage.inputTokens / 1000) * provider.costPer1kInput +
          (result.usage.outputTokens / 1000) * provider.costPer1kOutput;

        if (task.maxCostUsd !== undefined && costUsd > task.maxCostUsd) {
          throw new Error(`Actual model cost ${costUsd} exceeds ceiling ${task.maxCostUsd}`);
        }

        if(bounded?.finishAttempt){finished=true;await bounded.finishAttempt(ticket,{status:'success',result});}
        await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: result.model,
          modelVersion: result.modelVersion,
          reasonSelected: candidate.reason,
          usage: result.usage,
          costUsd,
          latencyMs: Date.now() - started,
          retryCount: i,
          success: true,
          verificationResult: "GATEWAY_ACCEPTED",
          dataClassification: task.dataClassification
        }));

        return { providerId: candidate.providerId, result, attempts: i + 1 };
      } catch (err) {
        lastError = err;
        if(bounded?.finishAttempt&&!finished){finished=true;await bounded.finishAttempt(ticket,{status:'failure'});}
        await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: candidate.model,
          reasonSelected: candidate.reason,
          latencyMs: Date.now() - started,
          retryCount: i,
          success: false,
          verificationResult: bounded ? "BOUNDED_MODEL_PROVIDER_REJECTED" : restrictedDevelopment ? "DEVELOPMENT_PROVIDER_REJECTED" :
            err instanceof Error ? err.message : "UNKNOWN_FAILURE",
          dataClassification: task.dataClassification
        }));
        if(task.boundedEvaluation&&(task.signal?.aborted||err instanceof Error&&/^EVALUATION_/.test(err.message)))throw err;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("All model providers failed");
  }
}
