import {setTimeout as delay} from "node:timers/promises";
import type {ModelProviderAdapter, ModelTask, ProviderConfig, ProviderResult} from "../../model-gateway/src/types";
import {fetchJson, result, taskPrompt} from "./common";

// Only the anonymous endpoints tested by the operator. No credential or host override.
export const FREE_PROVIDERS = {
  "ovh-free": {
    baseUrl: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1",
    models: ["Qwen3.5-397B-A17B", "Qwen3.5-9B"],
    intervalMs: 31_000,
    health: "HEALTHY"
  },
  "kilo-free": {
    baseUrl: "https://ai-gateway.kilo.ai/api/v1",
    models: ["liquid/lfm-2.5-2.6b:free"],
    intervalMs: 19_000,
    // A real call succeeded, but its continuation hit shared-pool HTTP 429.
    health: "DEGRADED"
  }
} as const;

type FreeProviderId = keyof typeof FREE_PROVIDERS;
const nextSlots = new Map<string, number>();

export class AnonymousFreeChatAdapter implements ModelProviderAdapter {
  constructor(readonly providerId: FreeProviderId, private readonly options: {
    transport?: typeof fetchJson;
    now?: () => number;
    wait?: (ms: number, signal: AbortSignal) => Promise<void>;
  } = {}) {}

  async invoke(task: ModelTask, model: string): Promise<ProviderResult> {
    const provider = FREE_PROVIDERS[this.providerId];
    if (task.dataClassification !== "PUBLIC") throw Error("FREE_PROVIDER_PUBLIC_ONLY");
    if (task.capability !== "public_free" || !task.allowedProviders?.includes(this.providerId) ||
        task.allowedProviders.some(id => !Object.hasOwn(FREE_PROVIDERS, id))) {
      throw Error("FREE_PROVIDER_EXPLICIT_SELECTION_REQUIRED");
    }
    if (!(provider.models as readonly string[]).includes(model)) throw Error("FREE_PROVIDER_MODEL_DENIED");
    if (task.boundedSynthetic || task.boundedEvaluation) throw Error("FREE_PROVIDER_EVALUATION_PERMIT_UNSUPPORTED");
    const prompt = taskPrompt(task);
    if (prompt.length > 32_768) throw Error("FREE_PROVIDER_INPUT_TOO_LARGE");

    // Bound queue time as well as HTTP time. The upstream still enforces shared-IP limits.
    const signal = task.signal ? AbortSignal.any([task.signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000);
    signal.throwIfAborted();
    const now = (this.options.now ?? Date.now)();
    const key = `${this.providerId}:${model}`;
    const waitMs = Math.max(0, (nextSlots.get(key) ?? 0) - now);
    if (waitMs > provider.intervalMs) throw Error("FREE_PROVIDER_QUEUE_FULL");
    nextSlots.set(key, now + waitMs + provider.intervalMs);
    if (waitMs) await (this.options.wait ?? ((ms, s) => delay(ms, undefined, {signal: s})))(waitMs, signal);
    signal.throwIfAborted();

    const body = await (this.options.transport ?? fetchJson)(`${provider.baseUrl}/chat/completions`, {
      method: "POST", signal, redirect: "error",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({model, messages: [{role: "user", content: prompt}], max_tokens: 2048, stream: false})
    }, 60_000);
    const text = body?.choices?.[0]?.message?.content;
    if (body?.model !== model || typeof text !== "string" || !text.trim() ||
        body?.choices?.[0]?.finish_reason !== "stop") throw Error("FREE_PROVIDER_RESPONSE_REJECTED");
    const usage = body?.usage;
    if (!Number.isSafeInteger(usage?.prompt_tokens) || usage.prompt_tokens < 0 ||
        !Number.isSafeInteger(usage?.completion_tokens) || usage.completion_tokens < 0 ||
        (usage.cost !== undefined && usage.cost !== 0)) throw Error("FREE_PROVIDER_USAGE_REJECTED");
    return {...result(text, model, {inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens}, body.model),
      ...(typeof body.id === "string" ? {providerRequestId: body.id} : {})};
  }
}

export function buildAnonymousFreeProvidersFromEnv(env: NodeJS.ProcessEnv) {
  const adapters: ModelProviderAdapter[] = [];
  const configs: ProviderConfig[] = [];
  for (const [id, flag] of [["ovh-free", "SAM_FREE_OVH_ENABLED"], ["kilo-free", "SAM_FREE_KILO_ENABLED"]] as const) {
    if (env[flag] !== "1") continue;
    const provider = FREE_PROVIDERS[id];
    adapters.push(new AnonymousFreeChatAdapter(id));
    configs.push({providerId: id, models: [...provider.models], capabilities: ["public_free"],
      privacyClasses: ["PUBLIC"], health: provider.health, costPer1kInput: 0, costPer1kOutput: 0});
  }
  return {adapters, configs};
}
