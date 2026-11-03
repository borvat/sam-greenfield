import {createHash} from 'node:crypto';
import {commandCenterExecutive} from './store';

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
  facts: Record<string, unknown>;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_CALL_INTERVAL_MS = 60 * 1000;
const lastCall = new Map<string, {at: number; value: BriefingResult}>();
const cache = new Map<string, {at: number; value: BriefingResult}>();

const clip = (value: unknown, max: number) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Facts are the only material the model may use; every id here is a real stored row. */
export async function buildFacts(legalEntityId: string) {
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
  else if (value && typeof value === 'object') for (const v of Object.values(value as any)) numbersIn(v, into);
  return into;
}

/** Rejects any digit the facts cannot support, any foreign evidence id, and any non-Arabic text. */
function validateAnalysis(raw: any, facts: any, lang: 'ar' | 'en' = 'ar'): {ok: true; value: BriefingAnalysis} | {ok: false; reason: string} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {ok: false, reason: 'NOT_OBJECT'};
  const required = ['headline', 'problem', 'impact', 'options', 'samCan', 'ownerMust', 'nextStep'];
  if (Object.keys(raw).some((k) => !required.includes(k))) return {ok: false, reason: 'FOREIGN_KEY'};
  const script = lang === 'en' ? /[A-Za-z]/ : AR_TEXT;
  const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && script.test(v);
  if (!text(raw.headline, 140)) return {ok: false, reason: 'HEADLINE'};
  if (!raw.problem || !text(raw.problem.what, 600) || !text(raw.problem.why, 600)) return {ok: false, reason: 'PROBLEM'};
  if (!raw.impact || !text(raw.impact.statement, 600)) return {ok: false, reason: 'IMPACT'};
  if (!Array.isArray(raw.options) || raw.options.length < 1 || raw.options.length > 4) return {ok: false, reason: 'OPTIONS'};
  if (!Array.isArray(raw.samCan) || raw.samCan.length > 5 || !Array.isArray(raw.ownerMust) || raw.ownerMust.length > 5) return {ok: false, reason: 'LISTS'};
  if (!text(raw.nextStep, 300)) return {ok: false, reason: 'NEXT_STEP'};

  const ids = new Set<string>([...facts.decisions.map((d: any) => d.id), ...facts.savedReports.map((r: any) => r.id)]);
  const evidence = Array.isArray(raw.problem.evidence) ? raw.problem.evidence : [];
  if (evidence.some((id: unknown) => typeof id !== 'string' || !ids.has(id))) return {ok: false, reason: 'EVIDENCE_ID'};
  const basis = Array.isArray(raw.impact.basis) ? raw.impact.basis : [];
  if (basis.some((id: unknown) => typeof id !== 'string' || !ids.has(id))) return {ok: false, reason: 'BASIS_ID'};

  const allowedNumbers = numbersIn(facts);
  const claimed = new Set<string>();
  for (const part of [raw.headline, raw.problem.what, raw.problem.why, raw.impact.statement, raw.nextStep, ...raw.samCan, ...raw.ownerMust, ...raw.options.map((o: any) => o.title), ...raw.options.map((o: any) => o.risk)]) {
    numbersIn(part, claimed);
  }
  for (const n of claimed) if (!allowedNumbers.has(n)) return {ok: false, reason: 'UNSUPPORTED_NUMBER'};

  const options = raw.options.map((o: any, index: number) => {
    if (!o || typeof o.id !== 'string' || !text(o.title, 160) || !text(o.risk, 300)) return null;
    if (!['GREEN', 'YELLOW', 'RED'].includes(o.authority)) return null;
    return {id: clip(o.id, 40) || String(index + 1), title: o.title, risk: o.risk, authority: o.authority};
  });
  if (options.some((o: any) => o === null)) return {ok: false, reason: 'OPTION_SHAPE'};

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

/** Deterministic brief used when no model call is possible; it never claims analysis. */
export function deterministicBrief(facts: any): BriefingAnalysis {
  const top = facts.decisions[0];
  if (!top) {
    return {
      headline: 'لا توجد مشكلة تشغيلية مفتوحة الآن.',
      problem: {what: 'كل الأهداف المفتوحة تحت السيطرة، ولا يوجد بند ينتظر قرارك.', why: 'لم تُرصد حالات انتظار أو فشل أو تفويض معلّق في نطاق هذه الشركة.', evidence: []},
      impact: {statement: 'لا أثر تشغيلي مفتوح في هذه اللحظة.', basis: []},
      options: [{id: 'hold', title: 'الاحتفاظ بالوضع الحالي ومراقبة النشاط', risk: 'لا مخاطر إضافية؛ مجرد انتظار.', authority: 'GREEN'}],
      samCan: ['متابعة التسجيل والتحقق كما هو'],
      ownerMust: ['لا شيء مطلوب الآن'],
      nextStep: 'راقب اللوحة؛ أي بند جديد سيظهر هنا تلقائياً.',
    };
  }
  const label = top.kind === 'approval' ? 'تفويض معلّق' : top.kind === 'blocked' ? 'هدف متوقف' : top.kind === 'failed' ? 'هدف فاشل' : 'هدف بانتظار مدخلات';
  return {
    headline: `${label}: ${top.businessId}`,
    problem: {what: top.title, why: top.reason ? `سبب مسجّل: ${top.reason}` : 'لا يوجد سبب مسجّل في السجل؛ الحالة نفسها هي الدليل.', evidence: [top.id]},
    impact: {statement: 'الأثر التجاري غير قابل للقياس من السجلات المتاحة؛ الأثر التشغيلي هو توقف هذا المسار.', basis: [top.id]},
    options: [{id: 'open', title: 'فتح الهدف ومراجعة السجل الكامل', risk: 'لا مخاطر تنفيذية؛ قراءة فقط.', authority: 'GREEN'}],
    samCan: ['عرض التنفيذ والتحقق المحفوظ', 'تلخيص الأدلة المرتبطة'],
    ownerMust: ['القرار في البند المفتوح'],
    nextStep: 'افتح الهدف من الزر أدناه لمراجعة الأدلة.',
  };
}

/** Loaded lazily: the gateway pulls configuration at import time, and the
 *  auth tests must be able to import this module without a database URL. */
async function gateway(): Promise<{invoke: (task: any) => Promise<any>} | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  const [{ModelGateway}, {OpenAICompatibleChatAdapter}] = await Promise.all([
    import('../../../packages/model-gateway/src/gateway'),
    import('../../../packages/model-providers/src/openaiCompatible'),
  ]);
  const adapter = new OpenAICompatibleChatAdapter('deepseek', {
    apiKey,
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  });
  return new ModelGateway({deepseek: adapter} as any);
}

export async function generateBriefing(legalEntityId: string, options: {force?: boolean; lang?: 'ar' | 'en'} = {}): Promise<BriefingResult> {
  const lang: 'ar' | 'en' = options.lang === 'en' ? 'en' : 'ar';
  const facts = await buildFacts(legalEntityId);
  // Hash only stable content: a volatile field here would defeat the cache and bill every page load.
  const factsHash = createHash('sha256').update(JSON.stringify(facts)).digest('hex');
  const key = `${legalEntityId}:${lang}:${factsHash}`;
  const hit = cache.get(key);
  if (!options.force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  const fallback = deterministicBrief(facts);
  const scope = `${legalEntityId}:${lang}`;
  const previous = lastCall.get(scope);
  if (!options.force && previous && Date.now() - previous.at < MIN_CALL_INTERVAL_MS) {
    return previous.value;
  }
  const base: BriefingResult = {mode: 'MODEL_UNAVAILABLE', analysis: null, deterministic: fallback, receipt: null, facts};

  const model = await gateway();
  if (!model) return {...base, reason: 'NO_PROVIDER_CREDENTIAL'};

  const started = Date.now();
  try {
    const res = await model.invoke({
      task: 'executive_briefing',
      capability: 'planning',
      dataClassification: 'INTERNAL',
      maxCostUsd: 0.02,
      preferredProviders: ['deepseek'],
      requiredModels: ['deepseek-flash'],
      input: {
        objective: lang === 'en'
          ? 'Write an executive brief for the owner in English, using only the supplied facts.'
          : 'اكتب موجزاً تنفيذياً عربياً للمالك من الحقائق المرفقة فقط.',
        contract: {
          output: 'JSON فقط بالعربية، بالمفاتيح: headline, problem{what,why,evidence[]}, impact{statement,basis[]}, options[{id,title,risk,authority}], samCan[], ownerMust[], nextStep.',
          rules: [
            'استخدم فقط الحقائق المرفقة. لا تخترع أرقاماً أو أسماء أو نتائج.',
            'لا تذكر أي رقم غير موجود حرفياً في facts.',
            'evidence وbasis يجب أن تكون معرّفات موجودة في facts.decisions أو facts.savedReports.',
            'authority واحدة من GREEN أو YELLOW أو RED؛ ما يحتاج موافقة المالك يكون YELLOW أو RED.',
            'لا تدّعِ تنفيذاً؛ كل إجراء يمر عبر التفويض والتحقق.',
            'كل النصوص عربية فصيحة وقصيرة: العنوان ≤ 12 كلمة، كل حقل ≤ 30 كلمة، وكل خيار سطر واحد.',
            ...(lang === 'en' ? ['ALL text values must be in English.'] : []),
            'لا تكرر الحقائق سرداً؛ اكتفِ بالاستنتاج.',
          ],
        },
        facts,
      },
    });
    const parsed = typeof res.result.output === 'string' ? (() => { try { return JSON.parse(res.result.output as string); } catch { return null; } })() : res.result.output;
    const checked = validateAnalysis(parsed, facts, lang);
    const costUsd = (res.result.usage.inputTokens / 1000) * 0.0003 + (res.result.usage.outputTokens / 1000) * 0.0012;
    const receipt: BriefingReceipt = {
      provider: res.providerId,
      model: res.result.model,
      inputTokens: res.result.usage.inputTokens,
      outputTokens: res.result.usage.outputTokens,
      costUsd: Number(costUsd.toFixed(6)),
      latencyMs: Date.now() - started,
      generatedAt: new Date().toISOString(),
      factsHash,
    };
    const value: BriefingResult = checked.ok
      ? {mode: 'MODEL', analysis: checked.value, deterministic: fallback, receipt, facts}
      : {mode: 'MODEL_REJECTED', reason: checked.reason, analysis: null, deterministic: fallback, receipt, facts};
    cache.set(key, {at: Date.now(), value});
    lastCall.set(scope, {at: Date.now(), value});
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MODEL_FAILED';
    return {...base, reason: message.slice(0, 80), facts};
  }
}
