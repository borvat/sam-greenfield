import { withTransaction } from "../../db/src/client";
import { recordModelCall } from "../../db/src/modelCalls";
import { loadProviderRegistry } from "./registry";
import { routeModel } from "./router";
import { applyRecentFailureCircuitBreaker } from "./health";
import { localDevelopment, denyDevelopment, LOCAL_MODEL_BLOCK } from "../../../apps/development/src/planningPolicy";
import type { ModelProviderAdapter, ModelTask, ProviderResult } from "./types";

export class ModelGateway {
  constructor(private readonly adapters: Record<string, ModelProviderAdapter>) {}

  async invoke(task: ModelTask): Promise<{
    providerId: string;
    result: ProviderResult;
    attempts: number;
  }> {
    if (localDevelopment()) denyDevelopment(LOCAL_MODEL_BLOCK);
    const providers = await withTransaction(async (client) => {
      const registry = await loadProviderRegistry(client);
      return applyRecentFailureCircuitBreaker(client, registry);
    });
    const candidates = routeModel(task, providers);
    if (candidates.length === 0) {
      throw new Error("No eligible model provider for task");
    }

    let lastError: unknown;
    let reservedBudgetUsd = 0;

    for (let i = 0; i < candidates.length; i++) {
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

      const started = Date.now();
      try {
        const result = await adapter.invoke(task, candidate.model);
        const provider = providers.find((p) => p.providerId === candidate.providerId)!;
        const costUsd =
          (result.usage.inputTokens / 1000) * provider.costPer1kInput +
          (result.usage.outputTokens / 1000) * provider.costPer1kOutput;

        if (task.maxCostUsd !== undefined && costUsd > task.maxCostUsd) {
          throw new Error(`Actual model cost ${costUsd} exceeds ceiling ${task.maxCostUsd}`);
        }

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
        await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: candidate.model,
          reasonSelected: candidate.reason,
          latencyMs: Date.now() - started,
          retryCount: i,
          success: false,
          verificationResult: err instanceof Error ? err.message : "UNKNOWN_FAILURE",
          dataClassification: task.dataClassification
        }));
      }
    }

    throw lastError instanceof Error ? lastError : new Error("All model providers failed");
  }
}
