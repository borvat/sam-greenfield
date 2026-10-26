import { deny } from './security';

export interface ExactTariff {
  providerId: string; model: string; reportedModels: string[];
  inputMicrousdPerMillion: string; outputMicrousdPerMillion: string; cachedMicrousdPerMillion: string;
  maxInputTokens: number; maxOutputTokens: number; framingTokens: number;
  sourceSha256: string; reviewedUntil: string;
}
export function amount(value: string | bigint): bigint {
  if (typeof value !== 'bigint' && !/^(0|[1-9][0-9]{0,17})$/.test(value)) deny('AI_AMOUNT_INVALID');
  const n = BigInt(value); if (n < 0n || n > 9223372036854775807n) deny('AI_AMOUNT_INVALID');
  return n;
}
export function usdToMicrousd(value: string): bigint {
  if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,6})?$/.test(value)) deny('AI_USD_PRECISION_INVALID');
  const [whole, fraction = ''] = value.split('.');
  return amount(BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, '0')));
}
export function assertTariff(t: ExactTariff): void {
  if (!t || !['deepseek','qwen','kimi','amd'].includes(t.providerId) || typeof t.model !== 'string' ||
      !t.model || t.model.length > 160 || !Array.isArray(t.reportedModels) || !t.reportedModels.length ||
      t.reportedModels.some(m => typeof m !== 'string' || !m || m.length > 160) ||
      ![t.maxInputTokens,t.maxOutputTokens,t.framingTokens].every(n => Number.isSafeInteger(n) && n > 0) ||
      t.framingTokens < 512 || !/^[a-f0-9]{64}$/.test(t.sourceSha256) ||
      !Number.isFinite(Date.parse(t.reviewedUntil)) || Date.parse(t.reviewedUntil) <= Date.now()) deny('AI_TARIFF_UNVERIFIED');
  const input = amount(t.inputMicrousdPerMillion), cached = amount(t.cachedMicrousdPerMillion);
  amount(t.outputMicrousdPerMillion);
  if (cached > input) deny('AI_TARIFF_UNVERIFIED');
}
export function exactCost(t: ExactTariff, input: number, output: number, cached = 0): bigint {
  if (![input,output,cached].every(n => Number.isSafeInteger(n) && n >= 0) || cached > input) deny('AI_USAGE_UNKNOWN');
  const numerator = BigInt(input - cached) * amount(t.inputMicrousdPerMillion) +
    BigInt(cached) * amount(t.cachedMicrousdPerMillion) + BigInt(output) * amount(t.outputMicrousdPerMillion);
  return amount((numerator + 999999n) / 1000000n); // Exact conservative ceil to one micro-USD.
}
