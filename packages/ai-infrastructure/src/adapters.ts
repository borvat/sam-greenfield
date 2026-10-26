import type { ModelProviderAdapter, ModelTask, ProviderResult } from '../../model-gateway/src/types';
import { OpenAICompatibleChatAdapter } from '../../model-providers/src/openaiCompatible';
import { type ModelProfile, microusd, validateProfile } from './catalog';
import { audit, deny, InfrastructureError, LocalAdmissionLedger, ServiceIdentities, type AuditSink } from './security';
import { VaultAiSecrets } from './vault';

function endpoint(profile: ModelProfile, allowLoopbackTest: boolean): string {
  let url: URL;
  try { url = new URL(profile.baseUrl); } catch { deny('PROVIDER_ENDPOINT_DENIED'); }
  if (url.username || url.password || url.search || url.hash) deny('PROVIDER_ENDPOINT_DENIED');
  if (allowLoopbackTest && url.protocol === 'http:' && url.hostname === '127.0.0.1') return url.href.replace(/\/$/, '');
  const allowed = profile.provider === 'deepseek' ? url.origin === 'https://api.deepseek.com' :
    profile.provider === 'kimi' ? url.origin === 'https://api.moonshot.ai' :
    profile.provider === 'amd' ? url.origin === 'https://developer.amd.com.cn' :
    profile.provider === 'qwen' ? ['dashscope.aliyuncs.com', 'dashscope-intl.aliyuncs.com', 'dashscope-us.aliyuncs.com'].includes(url.hostname) ||
      /^[a-zA-Z0-9-]+\.(ap-southeast-1|us-east-1|cn-beijing|cn-hongkong|ap-northeast-1)\.maas\.aliyuncs\.com$/.test(url.hostname) : false;
  const pathAllowed = profile.provider === 'amd' ? url.pathname === '/radeon/api/v1' :
    profile.provider === 'qwen' ? url.pathname === '/compatible-mode/v1' : ['/v1', '/'].includes(url.pathname);
  if (url.protocol !== 'https:' || !allowed || !pathAllowed) deny('PROVIDER_ENDPOINT_DENIED');
  return url.href.replace(/\/$/, '');
}
async function boundedJson(response: Response): Promise<any> {
  if (!response.body) deny('PROVIDER_RESPONSE_INVALID');
  const reader = response.body.getReader();
  const parts: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_000_000) { await reader.cancel(); deny('PROVIDER_RESPONSE_TOO_LARGE'); }
    parts.push(value);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { deny('PROVIDER_RESPONSE_INVALID'); }
}

export interface AdapterDependencies {
  identities: ServiceIdentities;
  /** Trusted fixed mapping, never selected by a caller-supplied project. */
  secretsFor: (project: string, environment: 'test' | 'production') => VaultAiSecrets;
  ledger: LocalAdmissionLedger;
  audit: AuditSink;
  now?: () => number;
  allowLoopbackTest?: boolean;
  /** Explicit operator gate; false by default. No env auto-discovery of real keys. */
  enableNetwork?: boolean;
  /** Operator-owned free-account quota proof, checked before any external call.
   * No paid permits exist in this phase. Missing evidence denies external requests.
   */
  verifyFreeTestQuota?: (profile: Readonly<ModelProfile>) => boolean;
}

/** An unregistered adapter extension, not a second gateway. SAM's existing
 * ModelGateway remains the routing/execution owner. Each binding admits at most one call.
 */
export function scopedAiAdapter(deps: AdapterDependencies, binding: {
  serviceToken: string; requestId: string; profile: ModelProfile;
}): ModelProviderAdapter {
  // Snapshot trusted configuration so it cannot be mutated during I/O.
  const profile: ModelProfile = structuredClone(binding.profile);
  const serviceToken = binding.serviceToken, requestId = binding.requestId;
  const now = deps.now ?? Date.now;
  const authenticate = () => deps.identities.authenticate(serviceToken);
  let invoked = false;
  return Object.freeze({
    providerId: profile.provider,
    async invoke(task: ModelTask, model: string): Promise<ProviderResult> {
      // Freeze the request meaning before any await (caller may retain its object).
      const { signal: callerSignal, ...request } = task as ModelTask & { signal?: AbortSignal };
      if (callerSignal !== undefined && !(callerSignal instanceof AbortSignal)) deny('INVALID_CANCELLATION_SIGNAL');
      if (callerSignal?.aborted) deny('REQUEST_CANCELLED');
      try { task = structuredClone(request); } catch { deny('REQUEST_INVALID'); }
      const grant = authenticate();
      // Restart-safe limits/identity and coordinated gateway wiring are not yet accepted.
      if (grant.environment !== 'test') deny('PRODUCTION_COMPATIBILITY_GATE_CLOSED');
      if (!deps.enableNetwork) deny('NETWORK_DISABLED');
      validateProfile(profile, now());
      if (model !== profile.model || !grant.providers.includes(profile.provider) ||
          !grant.capabilities.includes(task.capability) || !profile.capabilities.includes(task.capability) ||
          !grant.classifications.includes(task.dataClassification) || !profile.classifications.includes(task.dataClassification) ||
          profile.health !== 'HEALTHY') deny('MODEL_SCOPE_DENIED');
      if (profile.provider === 'amd' && (!profile.trialOnly || task.dataClassification !== 'PUBLIC')) deny('AMD_TRIAL_PUBLIC_ONLY');
      const baseUrl = endpoint(profile, !!deps.allowLoopbackTest);
      if (!baseUrl.startsWith('http://127.0.0.1:') &&
          (task.dataClassification !== 'PUBLIC' || !deps.verifyFreeTestQuota?.(structuredClone(profile)))) deny('EXTERNAL_QUOTA_UNVERIFIED');
      const scope = `${grant.environment}/${grant.project}`;
      const event = { service: grant.service, project: grant.project, environment: grant.environment,
        provider: profile.provider, requestId };
      if (invoked) deny('DUPLICATE_REQUEST');
      // Reserve full input capacity; max_tokens below bounds all generated/reasoning tokens.
      const reserved = microusd(profile, profile.context - profile.maxOutput, profile.maxOutput);
      if (task.maxCostUsd !== undefined && (!Number.isFinite(task.maxCostUsd) || task.maxCostUsd < 0 ||
          reserved > Math.floor(task.maxCostUsd * 1_000_000))) deny('TASK_BUDGET_EXHAUSTED');
      deps.ledger.reserve(scope, requestId, reserved); invoked = true;
      try {
        await audit(deps.audit, { ...event, event: 'ADMITTED', reservedMicrousd: reserved });
        const secrets = deps.secretsFor(grant.project, grant.environment);
        let usage: { input: number; output: number; cached: number } | undefined;
        const result = await secrets.use(profile.provider, async key => {
          authenticate(); // revocation while awaiting Vault must stop dispatch.
          const transport = async (_url: string, init: RequestInit): Promise<any> => {
            authenticate();
            if (callerSignal?.aborted) deny('REQUEST_CANCELLED');
            const body = JSON.parse(String(init.body));
            body.max_tokens = profile.maxOutput; body.stream = false;
            // Bound bytes conservatively below reserved input capacity, with template overhead margin.
            if (Buffer.byteLength(JSON.stringify(body)) > profile.context - profile.maxOutput - 4096) deny('CONTEXT_LIMIT');
            const response = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
              body: JSON.stringify(body), redirect: 'error', signal: callerSignal ?
                AbortSignal.any([callerSignal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000)
            });
            if (!response.ok) {
              if (response.status === 429) {
                const retry = response.headers.get('retry-after');
                const ms = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 :
                  retry && Number.isFinite(Date.parse(retry)) ? Date.parse(retry) - now() : 60_000;
                deps.ledger.cooldown(scope, Math.max(1000, Math.min(ms, 86_400_000)));
              }
              await response.body?.cancel();
              deny(response.status === 429 ? 'PROVIDER_RATE_LIMITED' : 'PROVIDER_REJECTED');
            }
            const raw = await boundedJson(response);
            const u = raw?.usage;
            if (!u || ![u.prompt_tokens, u.completion_tokens].every(v => Number.isSafeInteger(v) && v >= 0)) deny('USAGE_UNKNOWN');
            const cached = u.prompt_tokens_details?.cached_tokens ?? u.prompt_cache_hit_tokens ?? u.cached_tokens ?? 0;
            if (!Number.isSafeInteger(cached) || cached < 0 || cached > u.prompt_tokens ||
                u.prompt_tokens > profile.context - profile.maxOutput || u.completion_tokens > profile.maxOutput) deny('USAGE_INVALID');
            if (raw.model !== profile.model) deny('MODEL_ID_MISMATCH');
            usage = { input: u.prompt_tokens, output: u.completion_tokens, cached };
            // A hostile/provider echo must not return either provider or service credential.
            const serialized = JSON.stringify(raw);
            if ([key, serviceToken].some(secret => serialized.includes(secret) ||
                serialized.includes(JSON.stringify(secret).slice(1, -1)))) deny('SECRET_ECHO_REJECTED');
            return raw;
          };
          // Existing Qwen/DeepSeek wire adapter is reused for Kimi/AMD too.
          return new OpenAICompatibleChatAdapter(profile.provider, { apiKey: key, baseUrl, transport }).invoke(task, model);
        }) as ProviderResult;
        if (!usage) deny('USAGE_UNKNOWN');
        authenticate(); // do not deliver an in-flight response after identity revocation.
        if (callerSignal?.aborted) deny('REQUEST_CANCELLED');
        const measured = usage as { input: number; output: number; cached: number };
        const actual = microusd(profile, measured.input, measured.output, measured.cached);
        // Audit completion before refunding any part of a conservative reservation.
        await audit(deps.audit, { ...event, event: 'SUCCEEDED', actualMicrousd: actual,
          inputTokens: measured.input, outputTokens: measured.output, cachedTokens: measured.cached });
        deps.ledger.settle(scope, reserved, actual);
        return result;
      } catch (error) {
        await audit(deps.audit, { ...event, event: 'UNCERTAIN', reservedMicrousd: reserved });
        if (callerSignal?.aborted) deny('REQUEST_CANCELLED');
        // No provider text, URLs, key values or arbitrary exceptions escape this boundary.
        if (error instanceof InfrastructureError) throw error;
        deny('INFRASTRUCTURE_UNAVAILABLE');
      }
    }
  });
}

/** Checks authenticated model-list reachability, not inference quality or free quota. */
export async function inspectModelHealth(deps: AdapterDependencies, binding: {
  serviceToken: string; requestId: string; profile: ModelProfile;
}): Promise<'HEALTHY' | 'MODEL_UNAVAILABLE'> {
  const p = structuredClone(binding.profile), grant = deps.identities.authenticate(binding.serviceToken);
  validateProfile(p, (deps.now ?? Date.now)());
  if (grant.environment !== 'test' || !deps.enableNetwork || !grant.providers.includes(p.provider)) deny('HEALTH_SCOPE_DENIED');
  const baseUrl = endpoint(p, !!deps.allowLoopbackTest);
  if (!baseUrl.startsWith('http://127.0.0.1:') && !deps.verifyFreeTestQuota?.(structuredClone(p))) deny('EXTERNAL_QUOTA_UNVERIFIED');
  const scope = `${grant.environment}/${grant.project}`;
  deps.ledger.reserve(scope, binding.requestId, 0);
  const event = { service: grant.service, project: grant.project, environment: grant.environment,
    provider: p.provider, requestId: binding.requestId };
  await audit(deps.audit, { ...event, event: 'ADMITTED', reservedMicrousd: 0 });
  try {
    const value = await deps.secretsFor(grant.project, grant.environment).use(p.provider, async key => {
      deps.identities.authenticate(binding.serviceToken);
      const response = await fetch(`${baseUrl}/models`, { headers: { authorization: `Bearer ${key}` },
        redirect: 'error', signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        await response.body?.cancel();
        if (response.status === 429) deps.ledger.cooldown(scope, 60_000);
        deny('HEALTH_CHECK_FAILED');
      }
      const body = await boundedJson(response);
      if (!Array.isArray(body?.data)) deny('HEALTH_CHECK_FAILED');
      return body.data.some((m: any) => m?.id === p.model) ? 'HEALTHY' : 'MODEL_UNAVAILABLE';
    });
    deps.identities.authenticate(binding.serviceToken);
    await audit(deps.audit, { ...event, event: 'SUCCEEDED', actualMicrousd: 0 });
    return value as 'HEALTHY' | 'MODEL_UNAVAILABLE';
  } catch {
    await audit(deps.audit, { ...event, event: 'UNCERTAIN' });
    deny('HEALTH_CHECK_FAILED');
  }
}
