import type { ModelTask, ProviderConfig, RouteCandidate } from "./types";

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
  estimates: { inputTokens?: number; outputTokens?: number } = {}
): RouteCandidate[] {
  const preferred = new Map(
    (task.preferredProviders ?? []).map((id, index) => [id, index])
  );

  const candidates: RouteCandidate[] = [];

  for (const provider of providers) {
    if (provider.health === "DOWN") continue;
    if (!provider.capabilities.includes(task.capability)) continue;
    if (!provider.privacyClasses.includes(task.dataClassification)) continue;

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
