import {createHash, randomUUID} from 'node:crypto';
import {CHAT_OVERHEAD_TOKENS, MAX_INPUT_TOKENS, classifyPrompt} from './promptBound';
import {parseModelJson} from './jsonOutput';
import {buildInput, fitFacts} from './factsBudget';
import {loadBrief, saveBrief, type StoredBrief} from './briefStore';

export type BriefingMode = 'MODEL' | 'MODEL_REJECTED' | 'MODEL_UNAVAILABLE';

export interface BriefingReceipt {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  generatedAt: string;
  factsHash: string;
  attempts: number;
  transportRetries?: number;
  attribution: 'VERIFIED' | 'MISSING' | 'FOREIGN';
  callId: string;
}

export interface BriefingAnalysis {
  headline: string;
  problem: {what: string; why: string; evidence: string[]};
  impact: {statement: string; basis: string[]};
  options: {id: string; title: string; risk: string; authority: 'GREEN' | 'YELLOW' | 'RED'}[];
  samCan: string[];
  ownerMust: string[];
  nextStep: string;
}

export interface BriefingResult {
  mode: BriefingMode;
  reason?: string;
  analysis: BriefingAnalysis | null;
  deterministic: BriefingAnalysis;
  receipt: BriefingReceipt | null;
  /** Why the model output was refused, kept separate from why a retry could not run. */
  rejectionReason?: RejectionReason | null;
  retryBlockedReason?: string | null;
  /** True when the analysis comes from the stored brief because a new call was not affordable. */
  fromStore?: boolean;
  savedAt?: string | null;
  facts: Record<string, unknown>;
  budget: {recordedUsd: number; estimatedUsd: number; spentUsd: number; reservedUsd: number; limitUsd: number; callsLastHour: number; hourlyCap: number};
}

/** Every knob below is an operating limit, so each one has a conservative default. */
const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_CALL_INTERVAL_MS = 60 * 1000;
const MAX_OUTPUT_TOKENS = Number(process.env.SAM_BRIEFING_MAX_OUTPUT_TOKENS || 600);
const DAILY_BUDGET_USD = Number(process.env.SAM_BRIEFING_BUDGET_USD || 0.25);
const HOURLY_CALL_CAP = Number(process.env.SAM_BRIEFING_HOURLY_CALL_CAP || 6);
/** Used only when a provider row carries no price: the audit row then records cost 0, and a
 *  dollar ceiling that reads that zero would never fire. Calibrated to 1.5x the three measured
 *  production calls (0.0006 per 1k tokens), so the estimate stays above the real charge. */
const COST_PER_1K_TOKENS = Number(process.env.SAM_BRIEFING_COST_PER_1K_TOKENS || 0.0009);

/** A rejected output is retried once, so one brief can cost two calls. */
const MAX_ATTEMPTS = 2;
/** A provider outage produces no output and no charge, so it is retried briefly and does not
 *  consume the validation attempts that cost money. */
const TRANSPORT_RETRY_LIMIT = Number(process.env.SAM_BRIEFING_TRANSPORT_RETRIES || 3);
const TRANSPORT_BACKOFF_MS = Number(process.env.SAM_BRIEFING_TRANSPORT_BACKOFF_MS || 1500);
const TRANSIENT = /PROVIDER_UNAVAILABLE|HTTP 5[0-9][0-9]|ECONNRESET|ECONNREFUSED|ETIMEDOUT|fetch failed|socket hang up/i;

async function invokeWithTransportRetry(callModel: (task: any) => Promise<any>, task: any, onRetry: () => void, sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))): Promise<any> {
  let lastError: unknown;
  for (let i = 0; i < TRANSPORT_RETRY_LIMIT; i += 1) {
    try {
      return await callModel(task);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!TRANSIENT.test(message) || i === TRANSPORT_RETRY_LIMIT - 1) throw error;
      onRetry();
      await sleep(TRANSPORT_BACKOFF_MS * (i + 1));
    }
  }
  throw lastError;
}
const PROVIDER_ID = process.env.DEEPSEEK_PROVIDER_ID || 'deepseek';
const PROVIDER_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-flash';

/** Keyed by tenant scope + language + facts fingerprint: one company never reads another's brief. */
const lastCall = new Map<string, {at: number; value: BriefingResult}>();
const cache = new Map<string, {at: number; value: BriefingResult}>();
/** Concurrent callers of the same key share one paid call. */
const inflight = new Map<string, Promise<BriefingResult>>();

const clip = (value: unknown, max: number) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Facts are the only material the model may use; every id here is a real stored row. */
export async function buildFacts(legalEntityId: string) {
  // Lazy so the diagnostics tests can import this module without a database.
  const {commandCenterExecutive} = await import('../../../apps/command-center/src/store');
  const snapshot = await commandCenterExecutive(legalEntityId);
  const decisions = [
    ...snapshot.decisions.approvals.map((a: any) => ({id: a.id, kind: 'approval', goalId: a.goal_id, businessId: a.business_id, title: clip(a.capability_id, 80), since: a.created_at, reason: 'approval_required'})),
    ...snapshot.decisions.waiting.map((g: any) => ({id: g.id, kind: g.state === 'BLOCKED' ? 'blocked' : 'waiting', goalId: g.id, businessId: g.business_id, title: clip(g.objective, 220), since: g.updated_at, reason: clip(g.replan_reason, 200)})),
    ...snapshot.decisions.failed.map((g: any) => ({id: g.id, kind: 'failed', goalId: g.id, businessId: g.business_id, title: clip(g.objective, 220), since: g.updated_at, reason: clip(g.replan_reason, 200)})),
  ];
  const reports = (snapshot.reports.items || []).slice(0, 3).map((r: any) => ({
    id: r.id, goalId: r.goal_id, businessId: r.business_id, at: r.created_at,
    summary: clip(r.decision?.summary, 240),
  }));
  const recent = (snapshot.activity?.recent || []).slice(0, 4).map((e: any) => ({
    actor: clip(e.actor, 60), capability: clip(e.capability_id, 60), at: e.at, result: clip(e.result, 30),
  }));
  return {
    company: {scope: 'configured legal entity only'},
    counts: snapshot.counts,
    window: {
      executions24h: snapshot.activity?.executions_24h ?? null,
      verified24h: snapshot.activity?.verified_24h ?? null,
      newGoals24h: snapshot.activity?.goals_24h ?? null,
    },
    decisions,
    recentExecutions: recent,
    savedReports: reports,
    finance: {briefAvailable: Boolean(snapshot.finance?.brief), costAvailable: false, costReason: 'NOT_TENANT_SCOPED'},
  };
}

const AR_TEXT = /[\u0600-\u06FF]/;

function numbersIn(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (typeof value === 'number') into.add(String(Math.trunc(value)));
  else if (typeof value === 'string') for (const m of value.matchAll(/-?\d+(?:\.\d+)?/g)) into.add(String(Math.trunc(Number(m[0]))));
  else if (Array.isArray(value)) for (const v of value) numbersIn(v, into);
  else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value as any)) { numbersIn(key, into); numbersIn(v, into); }
  }
  return into;
}

export interface RejectionReason {code: string; path: string; detail?: string}

type Validation = {ok: true; value: BriefingAnalysis} | ({ok: false} & RejectionReason);

/** Rejects any digit the facts cannot support, any foreign evidence id, and any text in the wrong script.
 *  Every failure names the rule and the field, so a rejection is diagnosable without the raw output. */
function validateAnalysis(raw: any, facts: any, lang: 'ar' | 'en' = 'ar'): Validation {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {ok: false, code: 'NOT_OBJECT', path: 'body'};
  const required = ['headline', 'problem', 'impact', 'options', 'samCan', 'ownerMust', 'nextStep'];
  const foreign = Object.keys(raw).find((k) => !required.includes(k));
  if (foreign) return {ok: false, code: 'FOREIGN_KEY', path: `body.${foreign}`};
  const script = lang === 'en' ? /[A-Za-z]/ : AR_TEXT;
  const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && script.test(v);
  if (!text(raw.headline, 140)) return {ok: false, code: 'HEADLINE', path: 'headline', detail: `len=${typeof raw.headline === 'string' ? raw.headline.length : 'n/a'}`};
  if (!raw.problem || !text(raw.problem.what, 600)) return {ok: false, code: 'PROBLEM', path: 'problem.what'};
  if (!text(raw.problem.why, 600)) return {ok: false, code: 'PROBLEM', path: 'problem.why'};
  if (!raw.impact || !text(raw.impact.statement, 600)) return {ok: false, code: 'IMPACT', path: 'impact.statement'};
  if (!Array.isArray(raw.options) || raw.options.length < 1 || raw.options.length > 4) return {ok: false, code: 'OPTIONS', path: 'options', detail: `count=${Array.isArray(raw.options) ? raw.options.length : 'n/a'}`};
  if (!Array.isArray(raw.samCan) || raw.samCan.length > 5) return {ok: false, code: 'LISTS', path: 'samCan'};
  if (!Array.isArray(raw.ownerMust) || raw.ownerMust.length > 5) return {ok: false, code: 'LISTS', path: 'ownerMust'};
  if (!text(raw.nextStep, 300)) return {ok: false, code: 'NEXT_STEP', path: 'nextStep'};

  // A decision carries two real handles: the decision id and the goal it belongs to.
  // Both are stored rows, so both are valid citations; anything else still fails.
  const ids = new Set<string>();
  for (const d of facts.decisions) { if (d?.id) ids.add(String(d.id)); if (d?.goalId) ids.add(String(d.goalId)); }
  for (const r of facts.savedReports) { if (r?.id) ids.add(String(r.id)); if (r?.goalId) ids.add(String(r.goalId)); }
  const evidence = Array.isArray(raw.problem.evidence) ? raw.problem.evidence : [];
  const badEvidence = evidence.findIndex((id: unknown) => typeof id !== 'string' || !ids.has(id));
  if (badEvidence >= 0) return {ok: false, code: 'EVIDENCE_ID', path: `problem.evidence[${badEvidence}]`};
  const basis = Array.isArray(raw.impact.basis) ? raw.impact.basis : [];
  const badBasis = basis.findIndex((id: unknown) => typeof id !== 'string' || !ids.has(id));
  if (badBasis >= 0) return {ok: false, code: 'BASIS_ID', path: `impact.basis[${badBasis}]`};

  const allowedNumbers = numbersIn(facts);
  const fields: [string, unknown][] = [
    ['headline', raw.headline],
    ['problem.what', raw.problem.what],
    ['problem.why', raw.problem.why],
    ['impact.statement', raw.impact.statement],
    ['nextStep', raw.nextStep],
    ...raw.samCan.map((v: unknown, i: number) => [`samCan[${i}]`, v] as [string, unknown]),
    ...raw.ownerMust.map((v: unknown, i: number) => [`ownerMust[${i}]`, v] as [string, unknown]),
    ...raw.options.map((o: any, i: number) => [`options[${i}].title`, o?.title] as [string, unknown]),
    ...raw.options.map((o: any, i: number) => [`options[${i}].risk`, o?.risk] as [string, unknown]),
  ];
  for (const [path, value] of fields) {
    for (const n of numbersIn(value)) {
      if (!allowedNumbers.has(n)) return {ok: false, code: 'UNSUPPORTED_NUMBER', path, detail: `number=${n}`};
    }
  }

  for (let i = 0; i < raw.options.length; i += 1) {
    const o = raw.options[i];
    if (!o || typeof o.id !== 'string') return {ok: false, code: 'OPTION_SHAPE', path: `options[${i}].id`};
    if (!text(o.title, 160)) return {ok: false, code: 'OPTION_SHAPE', path: `options[${i}].title`};
    if (!text(o.risk, 300)) return {ok: false, code: 'OPTION_SHAPE', path: `options[${i}].risk`};
    if (!['GREEN', 'YELLOW', 'RED'].includes(o.authority)) return {ok: false, code: 'OPTION_SHAPE', path: `options[${i}].authority`, detail: `value=${String(o.authority).slice(0, 20)}`};
  }
  const options = raw.options.map((o: any, index: number) => ({id: clip(o.id, 40) || String(index + 1), title: o.title, risk: o.risk, authority: o.authority}));

  return {
    ok: true,
    value: {
      headline: raw.headline,
      problem: {what: raw.problem.what, why: raw.problem.why, evidence},
      impact: {statement: raw.impact.statement, basis},
      options: options as BriefingAnalysis['options'],
      samCan: raw.samCan.map((s: unknown) => clip(s, 200)),
      ownerMust: raw.ownerMust.map((s: unknown) => clip(s, 200)),
      nextStep: raw.nextStep,
    },
  };
}

/** Deterministic brief used when no model call is possible; it never claims analysis and follows the UI language. */
export function deterministicBrief(facts: any, lang: 'ar' | 'en' = 'ar'): BriefingAnalysis {
  const top = facts.decisions[0];
  const en = lang === 'en';
  if (!top) {
    return en ? {
      headline: 'No open operational problem right now.',
      problem: {what: 'Every open objective is under control and nothing is waiting for your decision.', why: 'No waiting, blocked, failed or pending-approval item was found inside this company.', evidence: []},
      impact: {statement: 'No open operational impact at this moment.', basis: []},
      options: [{id: 'hold', title: 'Hold the current position and watch the activity', risk: 'No added risk; this is simply waiting.', authority: 'GREEN'}],
      samCan: ['Keep recording and verifying as usual'],
      ownerMust: ['Nothing is required right now'],
      nextStep: 'Watch the board; any new item will appear here automatically.',
    } : {
      headline: 'لا توجد مشكلة تشغيلية مفتوحة الآن.',
      problem: {what: 'كل الأهداف المفتوحة تحت السيطرة، ولا يوجد بند ينتظر قرارك.', why: 'لم تُرصد حالات انتظار أو فشل أو تفويض معلّق في نطاق هذه الشركة.', evidence: []},
      impact: {statement: 'لا أثر تشغيلي مفتوح في هذه اللحظة.', basis: []},
      options: [{id: 'hold', title: 'الاحتفاظ بالوضع الحالي ومراقبة النشاط', risk: 'لا مخاطر إضافية؛ مجرد انتظار.', authority: 'GREEN'}],
      samCan: ['متابعة التسجيل والتحقق كما هو'],
      ownerMust: ['لا شيء مطلوب الآن'],
      nextStep: 'راقب اللوحة؛ أي بند جديد سيظهر هنا تلقائياً.',
    };
  }
  const label = en
    ? (top.kind === 'approval' ? 'Approval pending' : top.kind === 'blocked' ? 'Objective blocked' : top.kind === 'failed' ? 'Objective failed' : 'Objective waiting for input')
    : (top.kind === 'approval' ? 'تفويض معلّق' : top.kind === 'blocked' ? 'هدف متوقف' : top.kind === 'failed' ? 'هدف فاشل' : 'هدف بانتظار مدخلات');
  return en ? {
    headline: `${label}: ${top.businessId}`,
    problem: {what: top.title, why: top.reason ? `Recorded reason: ${top.reason}` : 'No reason is recorded in the log; the state itself is the evidence.', evidence: [top.id]},
    impact: {statement: 'The commercial impact cannot be measured from the available records; the operational impact is that this track has stopped.', basis: [top.id]},
    options: [{id: 'open', title: 'Open the objective and review the full record', risk: 'No execution risk; read only.', authority: 'GREEN'}],
    samCan: ['Show the stored execution and verification', 'Summarise the linked evidence'],
    ownerMust: ['Decide on the open item'],
    nextStep: 'Open the objective from the button below to review the evidence.',
  } : {
    headline: `${label}: ${top.businessId}`,
    problem: {what: top.title, why: top.reason ? `سبب مسجّل: ${top.reason}` : 'لا يوجد سبب مسجّل في السجل؛ الحالة نفسها هي الدليل.', evidence: [top.id]},
    impact: {statement: 'الأثر التجاري غير قابل للقياس من السجلات المتاحة؛ الأثر التشغيلي هو توقف هذا المسار.', basis: [top.id]},
    options: [{id: 'open', title: 'فتح الهدف ومراجعة السجل الكامل', risk: 'لا مخاطر تنفيذية؛ قراءة فقط.', authority: 'GREEN'}],
    samCan: ['عرض التنفيذ والتحقق المحفوظ', 'تلخيص الأدلة المرتبطة'],
    ownerMust: ['القرار في البند المفتوح'],
    nextStep: 'افتح الهدف من الزر أدناه لمراجعة الأدلة.',
  };
}

/** What this company has already spent on briefs in the last 24 hours, read from the audit trail.
 *  The tenant context is set on the connection explicitly: the budget must not depend on how
 *  DATABASE_URL happens to be configured, and a session without it would silently read zero. */
export async function briefingUsage(legalEntityId: string): Promise<{recordedUsd: number; estimatedUsd: number; callsLastHour: number}> {
  let client: any;
  try {
    const {pool} = await import('../../db/src/client');
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query("select set_config('app.current_legal_entity_id',$1,true)", [legalEntityId]);
    const res = await client.query(
      `select coalesce(sum(coalesce(cost,0)),0)::float8 as recorded,
              coalesce(sum(greatest(coalesce(cost,0), (coalesce(tokens,0)::float8/1000.0)*$2)),0)::float8 as estimated,
              count(*) filter (where created_at > now() - interval '1 hour')::int as calls_last_hour
         from model_calls
        where task like 'executive_briefing%'
          and legal_entity_id=$1
          and created_at > now() - interval '24 hours'`,
      [legalEntityId, COST_PER_1K_TOKENS],
    );
    await client.query('COMMIT');
    return {
      recordedUsd: Number(res.rows[0]?.recorded ?? 0),
      estimatedUsd: Number(res.rows[0]?.estimated ?? 0),
      callsLastHour: Number(res.rows[0]?.calls_last_hour ?? 0),
    };
  } catch {
    // An unreadable ledger must never unlock spending.
    if (client) await client.query('ROLLBACK').catch(() => {});
    return {recordedUsd: DAILY_BUDGET_USD, estimatedUsd: DAILY_BUDGET_USD, callsLastHour: HOURLY_CALL_CAP};
  } finally {
    if (client) client.release();
  }
}

/** Refuses to spend when the session carries no tenant context: such a call would be written
 *  unattributed and would escape every per-company ceiling. The check runs on a pooled client,
 *  which is the same kind of connection the gateway will write through. */
export async function tenantContextPresent(): Promise<boolean> {
  let client: any;
  try {
    const {pool} = await import('../../db/src/client');
    client = await pool.connect();
    const res = await client.query("select nullif(current_setting('app.current_legal_entity_id', true), '') as entity");
    return Boolean(res.rows[0]?.entity);
  } catch {
    return false;
  } finally {
    if (client) client.release();
  }
}

/** Attribution of one specific call, located by the marker carried in its task name. */
export async function briefingAttribution(task: string, legalEntityId: string): Promise<'VERIFIED' | 'MISSING' | 'FOREIGN'> {
  let client: any;
  try {
    const {pool} = await import('../../db/src/client');
    client = await pool.connect();
    const res = await client.query('select legal_entity_id from model_calls where task=$1', [task]);
    const row = res.rows[0];
    if (!row) return 'MISSING';
    return String(row.legal_entity_id) === legalEntityId ? 'VERIFIED' : 'FOREIGN';
  } catch {
    return 'MISSING';
  } finally {
    if (client) client.release();
  }
}

/** The adapter and endpoint the runtime already uses, with the pilot's output cap and no reasoning tokens. */
async function gateway(): Promise<{invoke: (task: any) => Promise<any>} | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const endpoint = `${baseUrl}/chat/completions`;
  const [{ModelGateway}, {OpenAICompatibleChatAdapter}, {fetchJson}] = await Promise.all([
    import('../../model-gateway/src/gateway'),
    import('../../model-providers/src/openaiCompatible'),
    import('../../model-providers/src/common'),
  ]);
  const adapter = new OpenAICompatibleChatAdapter(PROVIDER_ID, {
    apiKey,
    baseUrl,
    timeoutMs: 60_000,
    transport: async (url: string, init: RequestInit, timeout?: number) => {
      if (url !== endpoint) throw new Error('PROVIDER_DESTINATION_DENIED');
      const body = JSON.parse(String(init.body));
      // Rejected before the request is sent: an over-limit prompt must not cost anything.
      const prompt = String(body?.messages?.[0]?.content ?? '');
      if (!classifyPrompt(prompt).allowed) throw new Error('PROVIDER_INPUT_LIMIT');
      body.max_tokens = MAX_OUTPUT_TOKENS;
      body.thinking = {type: 'disabled'};
      const response = await fetchJson(url, {...init, body: JSON.stringify(body)}, timeout);
      const used = response?.usage?.completion_tokens;
      if (Number.isInteger(used) && used > MAX_OUTPUT_TOKENS) throw new Error('PROVIDER_USAGE_EXCEEDED');
      return response;
    },
  });
  return new ModelGateway({[PROVIDER_ID]: adapter} as any);
}

export interface BriefingDeps {
  budgetUsd?: number;
  facts?: (legalEntityId: string) => Promise<any>;
  invoke?: (task: any) => Promise<any>;
  usage?: (legalEntityId: string) => Promise<{recordedUsd: number; estimatedUsd: number; callsLastHour: number}>;
  attribution?: (task: string, legalEntityId: string) => Promise<'VERIFIED' | 'MISSING' | 'FOREIGN'>;
  sleep?: (ms: number) => Promise<void>;
  tenant?: () => Promise<boolean>;
  load?: (legalEntityId: string, lang: 'ar' | 'en') => Promise<StoredBrief | null>;
  save?: (legalEntityId: string, lang: string, brief: {analysis: unknown; receipt: unknown; facts: unknown}) => Promise<void>;
}

export async function generateBriefing(legalEntityId: string, options: {force?: boolean; lang?: 'ar' | 'en'; deps?: BriefingDeps} = {}): Promise<BriefingResult> {
  const lang: 'ar' | 'en' = options.lang === 'en' ? 'en' : 'ar';
  const full = await (options.deps?.facts ?? buildFacts)(legalEntityId);
  const ledger = await (options.deps?.usage ?? briefingUsage)(legalEntityId);
  const limitUsd = options.deps?.budgetUsd ?? DAILY_BUDGET_USD;
  const spentBefore = Math.max(ledger.recordedUsd, ledger.estimatedUsd);
  // The sample is sized to the money that is left, then measured on the final request:
  // a brief that cannot be paid for is never built into a request.
  const affordableTokens = Math.floor(((limitUsd - spentBefore) * 1000) / COST_PER_1K_TOKENS) - MAX_OUTPUT_TOKENS - CHAT_OVERHEAD_TOKENS;
  const maxPromptBytes = Math.min(MAX_INPUT_TOKENS - CHAT_OVERHEAD_TOKENS, affordableTokens);
  const fitted = maxPromptBytes >= 200 ? fitFacts(full, lang, maxPromptBytes) : null;
  if (!fitted) {
    const budget = {recordedUsd: Number(ledger.recordedUsd.toFixed(6)), estimatedUsd: Number(ledger.estimatedUsd.toFixed(6)), spentUsd: Number(spentBefore.toFixed(6)), reservedUsd: 0, limitUsd, callsLastHour: ledger.callsLastHour, hourlyCap: HOURLY_CALL_CAP};
    const stored = await (options.deps?.load ?? loadBrief)(legalEntityId, lang).catch(() => null);
    if (stored && stored.analysis) {
      // A new call is not affordable, but the owner still sees the last real analysis.
      return {
        mode: 'MODEL',
        analysis: stored.analysis as BriefingAnalysis,
        deterministic: deterministicBrief(full, lang),
        receipt: (stored.receipt as BriefingReceipt) ?? null,
        facts: (stored.facts as Record<string, unknown>) ?? full,
        budget,
        fromStore: true,
        savedAt: stored.savedAt,
      };
    }
    return {
      mode: 'MODEL_UNAVAILABLE',
      reason: affordableTokens < 200 ? 'BUDGET_TOO_SMALL_FOR_FACTS' : 'FACTS_EXCEED_INPUT_BUDGET',
      analysis: null,
      deterministic: deterministicBrief(full, lang),
      receipt: null,
      facts: full,
      budget,
    };
  }
  const facts = fitted.facts;
  // The cache key is the company's data, not the size the budget allowed: the same brief is
  // reused across budget states instead of being recomputed into a refusal.
  const factsHash = createHash('sha256').update(JSON.stringify(full)).digest('hex');
  // Tenant scope and language are part of the key: a brief produced for one company is never served to another.
  const key = `${legalEntityId}:${lang}:${factsHash}`;
  const hit = cache.get(key);
  if (!options.force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  const running = inflight.get(key);
  if (!options.force && running) return running;

  const task = (async (): Promise<BriefingResult> => {
    const fallback = deterministicBrief(facts, lang);
    const scope = `${legalEntityId}:${lang}`;
    const round = (n: number) => Number(n.toFixed(6));
    // Worst case for one call under the enforced caps, reserved before anything is sent.
    // Reserve on the request that was actually built and measured, plus the template margin.
    const perAttempt = ((fitted.promptBytes + CHAT_OVERHEAD_TOKENS + MAX_OUTPUT_TOKENS) / 1000) * COST_PER_1K_TOKENS;
    const basis = Math.max(ledger.recordedUsd, ledger.estimatedUsd);
    // Count the other calls already in flight (this one is in the map too).
    const reserved = Math.max(0, inflight.size - 1) * perAttempt;
    const budget = {recordedUsd: round(ledger.recordedUsd), estimatedUsd: round(ledger.estimatedUsd), spentUsd: round(basis), reservedUsd: round(reserved), limitUsd, callsLastHour: ledger.callsLastHour, hourlyCap: HOURLY_CALL_CAP};
    const previous = lastCall.get(scope);
    if (!options.force && previous && Date.now() - previous.at < MIN_CALL_INTERVAL_MS) return previous.value;
    const overBudget = basis + reserved + perAttempt > limitUsd;
    if (overBudget || ledger.callsLastHour >= HOURLY_CALL_CAP) {
      const value: BriefingResult = {
        mode: 'MODEL_UNAVAILABLE',
        reason: ledger.callsLastHour >= HOURLY_CALL_CAP ? 'HOURLY_CAP_REACHED' : (reserved > 0 ? 'BUDGET_RESERVED' : 'BUDGET_EXHAUSTED'),
        analysis: null, deterministic: fallback, receipt: null, facts, budget,
      };
      lastCall.set(scope, {at: Date.now(), value});
      return value;
    }

    if (!(await (options.deps?.tenant ?? tenantContextPresent)())) {
      const value: BriefingResult = {mode: 'MODEL_UNAVAILABLE', reason: 'TENANT_CONTEXT_MISSING', analysis: null, deterministic: fallback, receipt: null, facts, budget};
      lastCall.set(scope, {at: Date.now(), value});
      return value;
    }

    let callModel = options.deps?.invoke;
    if (!callModel) {
      const model = await gateway();
      if (!model) return {mode: 'MODEL_UNAVAILABLE', reason: 'NO_PROVIDER_CREDENTIAL', analysis: null, deterministic: fallback, receipt: null, facts, budget};
      callModel = (t: any) => model.invoke(t);
    }

    const started = Date.now();
    const briefId = randomUUID();
    let attempts = 0;
    let transportRetries = 0;
    let spentUsd = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let lastRejection: RejectionReason | null = null;
    let retryBlockedReason: string | null = null;
    const payload = {
      task: 'executive_briefing',
      capability: 'planning',
      dataClassification: 'INTERNAL',
      maxCostUsd: 0.02,
      preferredProviders: [PROVIDER_ID],
      requiredModels: [PROVIDER_MODEL],
      input: {
        ...buildInput(facts, lang),
      },
    };
    try {
      // One retry only: a rejection is usually a shape slip, and two attempts stay under a cent.
      while (attempts < MAX_ATTEMPTS) {
        if (attempts > 0) {
          // A retry is admitted only against the ledger as it stands now.
          const fresh = await (options.deps?.usage ?? briefingUsage)(legalEntityId);
          if (Math.max(fresh.recordedUsd, fresh.estimatedUsd) + perAttempt > limitUsd) {
            retryBlockedReason = 'BUDGET_EXHAUSTED';
            break;
          }
        }
        attempts += 1;
        const attemptTask = `executive_briefing:${briefId}:${attempts}`;
        const res = await invokeWithTransportRetry(callModel as any, {...payload, task: attemptTask}, () => { transportRetries += 1; }, options.deps?.sleep);
        inputTokens += res.result.usage.inputTokens;
        outputTokens += res.result.usage.outputTokens;
        spentUsd += (res.result.usage.inputTokens / 1000) * 0.0003 + (res.result.usage.outputTokens / 1000) * 0.0012;
        const parsed = parseModelJson(res.result.output);
        const checked = validateAnalysis(parsed, facts, lang);
        if (!checked.ok) {
          lastRejection = {code: checked.code, path: checked.path, detail: checked.detail};
          continue;
        }
        const attribution = await (options.deps?.attribution ?? briefingAttribution)(attemptTask, legalEntityId);
        const receipt: BriefingReceipt = {
          provider: res.providerId,
          model: res.result.model,
          inputTokens,
          outputTokens,
          costUsd: Number(spentUsd.toFixed(6)),
          latencyMs: Date.now() - started,
          generatedAt: new Date().toISOString(),
          factsHash,
          attempts,
          transportRetries,
          attribution,
          callId: briefId,
        };
        if (attribution !== 'VERIFIED') {
          // The call escaped this company's ledger; do not present it as an attributed analysis.
          const value: BriefingResult = {mode: 'MODEL_UNAVAILABLE', reason: `ATTRIBUTION_${attribution}`, analysis: null, deterministic: fallback, receipt, facts, budget};
          lastCall.set(scope, {at: Date.now(), value});
          return value;
        }
        const value: BriefingResult = {mode: 'MODEL', analysis: checked.value, deterministic: fallback, receipt, facts, budget};
        // Best effort: the trail keeps the brief so it survives a restart or a spent budget.
        void (options.deps?.save ?? saveBrief)(legalEntityId, lang, {analysis: checked.value, receipt, facts}).catch(() => {});
        cache.set(key, {at: Date.now(), value});
        lastCall.set(scope, {at: Date.now(), value});
        return value;
      }
      const receipt: BriefingReceipt = {
        provider: PROVIDER_ID,
        model: PROVIDER_MODEL,
        inputTokens,
        outputTokens,
        costUsd: Number(spentUsd.toFixed(6)),
        latencyMs: Date.now() - started,
        generatedAt: new Date().toISOString(),
        factsHash,
        attempts,
        transportRetries,
        attribution: await (options.deps?.attribution ?? briefingAttribution)(`executive_briefing:${briefId}:${attempts}`, legalEntityId),
        callId: briefId,
      };
      const value: BriefingResult = {
        mode: 'MODEL_REJECTED',
        reason: lastRejection ? lastRejection.code : (retryBlockedReason ?? 'MODEL_REJECTED'),
        rejectionReason: lastRejection,
        retryBlockedReason,
        analysis: null, deterministic: fallback, receipt, facts, budget,
      };
      lastCall.set(scope, {at: Date.now(), value});
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MODEL_FAILED';
      return {mode: 'MODEL_UNAVAILABLE', reason: message.slice(0, 80), analysis: null, deterministic: fallback, receipt: null, facts, budget};
    }
  })();

  inflight.set(key, task);
  try {
    return await task;
  } finally {
    inflight.delete(key);
  }
}
