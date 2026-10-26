import type { ModelTask, ModelProviderAdapter, ProviderResult } from '../../model-gateway/src/types';
import { OpenAICompatibleChatAdapter } from '../../model-providers/src/openaiCompatible';
import { boundedJson } from './adapters';
import { deny } from './security';
import type { DurableBinding, DurableTicket } from './durableLedger';
import type { ExactTariff } from './exactMoney';
import type { VaultAiSecrets } from './vault';

export interface ModelLedgerPort {
  authorize(binding: DurableBinding): Promise<void>;
  reserve(binding: DurableBinding, task: ModelTask, candidate: {providerId:string;model:string}): Promise<DurableTicket>;
  dispatch(ticket: DurableTicket): Promise<void>;
  tariff(ticket: DurableTicket): Promise<ExactTariff & {inputBound:number}>;
  finish(ticket: DurableTicket, result: ProviderResult, cached?: number): Promise<void>;
  fail(ticket: DurableTicket): Promise<void>;
}
export interface SamModelCallBoundary {
  reserve(task: ModelTask, candidate: {providerId:string;model:string}): Promise<DurableTicket>;
  execute(ticket: DurableTicket, adapter: ModelProviderAdapter, task: ModelTask, model: string): Promise<ProviderResult>;
  finish(ticket: DurableTicket, result: ProviderResult): Promise<void>;
  fail(ticket: DurableTicket): Promise<never>;
}
const transports = new WeakMap<object,(task:ModelTask,model:string,dispatch:()=>Promise<void>,tariff:ExactTariff)=>Promise<ProviderResult>>();
const receipts = new WeakMap<object,{cached:number}>();

/** Test-only loopback wire adapter. Uses real Vault, existing SAM wire adapter and
 * per-attempt dispatch checkpoint. No external/live activation path in this phase.
 */
export function vaultBoundTestAdapter(options: {providerId:string;endpoint:string;secrets:VaultAiSecrets}): ModelProviderAdapter {
  let url: URL;
  try { url = new URL(options.endpoint); } catch { deny('AI_TEST_ENDPOINT_DENIED'); }
  if (!['deepseek','qwen','kimi','amd'].includes(options.providerId) || url.protocol!=='http:' ||
      url.hostname!=='127.0.0.1' || url.username || url.password || url.search || url.hash) deny('AI_TEST_ENDPOINT_DENIED');
  const adapter: ModelProviderAdapter = Object.freeze({providerId:options.providerId,
    async invoke():Promise<ProviderResult> { deny('AI_DURABLE_BOUNDARY_REQUIRED'); }});
  transports.set(adapter, async (task,model,dispatch,tariff) => {
    const callerSignal = (task as ModelTask & {signal?:AbortSignal}).signal;
    let cached = 0;
    const result = await options.secrets.use(options.providerId, async key => {
      const transport = async (_url:string, init:RequestInit) => {
        const body = JSON.parse(String(init.body)); body.max_tokens=tariff.maxOutputTokens; body.stream=false;
        if (callerSignal?.aborted) deny('AI_CANCELLED_BEFORE_SEND');
        // Commit DISPATCHING before any possible provider send. After this point,
        // errors including abort/HTTP failures retain the entire reservation.
        await dispatch();
        const response = await fetch(url.href.replace(/\/$/,'')+'/chat/completions',{
          method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(body),
          redirect:'error',signal:callerSignal?AbortSignal.any([callerSignal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000)
        });
        if (!response.ok) { await response.body?.cancel(); deny('AI_PROVIDER_RESPONSE_UNCERTAIN'); }
        const raw = await boundedJson(response);
        if (JSON.stringify(raw).includes(key) || JSON.stringify(raw).includes(JSON.stringify(key).slice(1,-1))) deny('AI_SECRET_ECHO_REJECTED');
        if (!raw.usage || ![raw.usage.prompt_tokens,raw.usage.completion_tokens].every(n=>Number.isSafeInteger(n)&&n>=0)) deny('AI_USAGE_UNKNOWN');
        if(typeof raw.model!=='string'||!raw.model||raw.model.length>160)deny('AI_REPORTED_MODEL_UNKNOWN');
        cached=raw.usage.prompt_tokens_details?.cached_tokens??raw.usage.prompt_cache_hit_tokens??0;
        if (!Number.isSafeInteger(cached)||cached<0||cached>raw.usage.prompt_tokens) deny('AI_USAGE_UNKNOWN');
        return raw;
      };
      return new OpenAICompatibleChatAdapter(options.providerId,{apiKey:key,baseUrl:url.href,transport}).invoke(task,model);
    }) as ProviderResult;
    receipts.set(result,{cached}); return result;
  });
  return adapter;
}

/** Middleware for the existing ModelGateway; no route selection or fallback loop. */
export function samModelCallBoundary(ledger: ModelLedgerPort, binding: DurableBinding): SamModelCallBoundary {
  const snapshots = new WeakMap<object,ModelTask>();
  return {
    async reserve(task,candidate) {
      let snapshot: ModelTask;
      const {signal,...json} = task as ModelTask & {signal?:AbortSignal};
      if (signal?.aborted) deny('AI_CANCELLED_BEFORE_SEND');
      try { snapshot=structuredClone(json); } catch { deny('AI_REQUEST_INVALID'); }
      const ticket=await ledger.reserve(binding,snapshot,candidate);
      snapshots.set(ticket,Object.assign(snapshot,signal?{signal}:{})); return ticket;
    },
    async execute(ticket,adapter,_task,model) {
      const snapshot=snapshots.get(ticket), run=transports.get(adapter);
      if (!snapshot||!run) deny('AI_DURABLE_ADAPTER_REQUIRED');
      const tariff=await ledger.tariff(ticket);
      if (adapter.providerId!==tariff.providerId||model!==tariff.model) deny('AI_MODEL_SCOPE_DENIED');
      return run(snapshot,model,()=>ledger.dispatch(ticket),tariff);
    },
    async finish(ticket,result) {
      await ledger.finish(ticket,result,receipts.get(result)?.cached??0);
      // Revocation after dispatch never drops accounting evidence or returns data to a revoked caller.
      await ledger.authorize(binding);
    },
    async fail(ticket):Promise<never> {
      try { await ledger.fail(ticket); } catch { deny('AI_DURABLE_ATTEMPT_UNRESOLVED'); }
      deny('AI_DURABLE_ATTEMPT_STOPPED');
    }
  };
}
