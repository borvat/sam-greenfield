import type { ModelTask, ProviderConfig, RouteCandidate } from "./types";
import {rankMeasured,type MeasuredRoutingPolicy} from './measuredRouting';

const HEALTH_RANK: Record<ProviderConfig["health"], number> = {
  HEALTHY: 0,
  DEGRADED: 1,
  DOWN: 9
};

export function estimateCostUsd(
  provider: ProviderConfig,
  estimatedInputTokens = 1000,
  estimatedOutputTokens = 1000
): number {
  return (
    (estimatedInputTokens / 1000) * provider.costPer1kInput +
    (estimatedOutputTokens / 1000) * provider.costPer1kOutput
  );
}

export function routeModel(
  task: ModelTask,
  providers: ProviderConfig[],
  estimates: { inputTokens?: number; outputTokens?: number } = {},
  measuredPolicy?:MeasuredRoutingPolicy
): RouteCandidate[] {
  const preferred = new Map(
    (task.preferredProviders ?? []).map((id, index) => [id, index])
  );

  const candidates: RouteCandidate[] = [];
  if(task.requiredContextTokens!==undefined&&(!Number.isSafeInteger(task.requiredContextTokens)||task.requiredContextTokens<1))throw Error('MODEL_CONTEXT_REQUIREMENT_INVALID');
  if(![estimates.inputTokens??1000,estimates.outputTokens??1000].every(v=>Number.isFinite(v)&&v>=0))throw Error('MODEL_TOKEN_ESTIMATE_INVALID');

  for (const provider of providers) {
    if (provider.health === "DOWN") continue;
    if(![provider.costPer1kInput,provider.costPer1kOutput].every(v=>Number.isFinite(v)&&v>=0))continue;
    if (!provider.capabilities.includes(task.capability)) continue;
    if (!provider.privacyClasses.includes(task.dataClassification)) continue;
    if(task.requiresToolCalling&&provider.supportsToolCalling!==true)continue;
    if(task.requiredContextTokens!==undefined&&(provider.contextWindowTokens===undefined||provider.contextWindowTokens<task.requiredContextTokens))continue;
    if(provider.contextWindowTokens!==undefined&&(estimates.inputTokens??1000)+(estimates.outputTokens??1000)>provider.contextWindowTokens)continue;
    if(provider.maxOutputTokens!==undefined&&(estimates.outputTokens??1000)>provider.maxOutputTokens)continue;

    const models = task.requiredModels?.length
      ? provider.models.filter((m) => task.requiredModels!.includes(m))
      : provider.models;
    if (models.length === 0) continue;

    const estimatedCostUsd = estimateCostUsd(
      provider,
      estimates.inputTokens ?? 1000,
      estimates.outputTokens ?? 1000
    );
    if (task.maxCostUsd !== undefined && estimatedCostUsd > task.maxCostUsd) continue;

    for (const model of models) {
      const prefRank = preferred.has(provider.providerId)
        ? preferred.get(provider.providerId)!
        : Number.MAX_SAFE_INTEGER;
      candidates.push({
        providerId: provider.providerId,
        model,
        estimatedCostUsd,
        reason: `health=${provider.health};preferred_rank=${prefRank};estimated_cost=${estimatedCostUsd.toFixed(6)}`
      });
    }
  }

  if(measuredPolicy)return rankMeasured(candidates,providers,measuredPolicy);
  return candidates.sort((a, b) => {
    const pa = providers.find((p) => p.providerId === a.providerId)!;
    const pb = providers.find((p) => p.providerId === b.providerId)!;
    const preferredA = preferred.has(a.providerId) ? preferred.get(a.providerId)! : Number.MAX_SAFE_INTEGER;
    const preferredB = preferred.has(b.providerId) ? preferred.get(b.providerId)! : Number.MAX_SAFE_INTEGER;
    return (
      preferredA - preferredB ||
      HEALTH_RANK[pa.health] - HEALTH_RANK[pb.health] ||
      a.estimatedCostUsd - b.estimatedCostUsd ||
      a.providerId.localeCompare(b.providerId) ||
      a.model.localeCompare(b.model)
    );
  });
}
