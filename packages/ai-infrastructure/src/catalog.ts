import type { DataClassification, ModelTask, ProviderConfig } from '../../model-gateway/src/types';
import { deny } from './security';

export interface ModelProfile {
  provider: string;
  model: string;
  baseUrl: string;
  context: number;
  maxOutput: number;
  inputUsdPerMillion: number | null;
  outputUsdPerMillion: number | null;
  cacheReadUsdPerMillion: number | null;
  capabilities: string[];
  classifications: DataClassification[];
  quality: number | null;
  p95Ms: number | null;
  successRate: number | null;
  health: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  reviewedAt: number;
  trialOnly: boolean;
  cacheMode: 'automatic' | 'none';
}
/** Quality evidence and fresh tariffs are required before registering a candidate.
 * No defaults equate missing prices with free service. Profiles come from trusted config.
 */
export function validateProfile(p: ModelProfile, now = Date.now()): void {
  if (!/^[a-z][a-z0-9-]{0,62}$/.test(p.provider) || !p.model || p.model.length > 160 ||
      !Number.isSafeInteger(p.context) || !Number.isSafeInteger(p.maxOutput) ||
      p.maxOutput < 1 || p.context <= p.maxOutput + 4096 ||
      !Number.isFinite(p.reviewedAt) || p.reviewedAt > now || now - p.reviewedAt > 86_400_000 ||
      [p.inputUsdPerMillion, p.outputUsdPerMillion].some(v => v === null || !Number.isFinite(v) || v < 0) ||
      (p.cacheReadUsdPerMillion !== null && (!Number.isFinite(p.cacheReadUsdPerMillion) || p.cacheReadUsdPerMillion < 0 ||
        p.cacheReadUsdPerMillion > p.inputUsdPerMillion!))) deny('MODEL_PROFILE_UNVERIFIED');
}
/** Gate/ranking extension for the existing SAM registry; does not execute or fallback. */
export function eligibleProfiles(task: ModelTask, profiles: ModelProfile[], limits: {
  minQuality: number; minSuccessRate: number; maxP95Ms: number; environment: 'test' | 'production';
}, now = Date.now()): ModelProfile[] {
  return profiles.filter(p => {
    try { validateProfile(p, now); } catch { return false; }
    return p.health === 'HEALTHY' && !(p.trialOnly && limits.environment === 'production') &&
      p.capabilities.includes(task.capability) && p.classifications.includes(task.dataClassification) &&
      p.quality !== null && p.quality >= limits.minQuality && p.successRate !== null &&
      p.successRate >= limits.minSuccessRate && p.p95Ms !== null && p.p95Ms <= limits.maxP95Ms &&
      (!task.preferredProviders?.length || task.preferredProviders.includes(p.provider)) &&
      (!task.requiredModels?.length || task.requiredModels.includes(p.model));
  }).sort((a, b) => (a.inputUsdPerMillion! + a.outputUsdPerMillion!) /
    a.successRate! - (b.inputUsdPerMillion! + b.outputUsdPerMillion!) / b.successRate!);
}
export function providerConfig(p: ModelProfile): ProviderConfig {
  validateProfile(p);
  return { providerId: p.provider, models: [p.model], capabilities: [...p.capabilities],
    privacyClasses: [...p.classifications], health: p.health,
    costPer1kInput: p.inputUsdPerMillion! / 1000, costPer1kOutput: p.outputUsdPerMillion! / 1000 };
}
export function microusd(p: ModelProfile, input: number, output: number, cached = 0): number {
  validateProfile(p);
  if (![input, output, cached].every(v => Number.isSafeInteger(v) && v >= 0) || cached > input) deny('USAGE_INVALID');
  const amount = Math.ceil((input - cached) * p.inputUsdPerMillion! + output * p.outputUsdPerMillion! +
    cached * (p.cacheReadUsdPerMillion ?? p.inputUsdPerMillion!));
  if (!Number.isSafeInteger(amount) || amount < 0) deny('USAGE_INVALID');
  return amount;
}
