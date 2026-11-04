import {taskPrompt} from '../../model-providers/src/common';

export type Lang = 'ar' | 'en';

const CATEGORY_RANK: Record<string, number> = {approval: 0, blocked: 1, waiting: 2, failed: 3};

export function objectiveFor(lang: Lang): string {
  return lang === 'en'
    ? 'Write an executive brief for the owner in English, using only the supplied facts.'
    : 'اكتب موجزاً تنفيذياً عربياً للمالك من الحقائق المرفقة فقط.';
}

export function contractFor(lang: Lang): {output: string; rules: string[]} {
  return {
    output: '{"headline","problem":{"what","why","evidence":[]},"impact":{"statement","basis":[]},"options":[{"id","title","risk","authority"}],"samCan":[],"ownerMust":[],"nextStep"}',
    rules: lang === 'en'
      ? [
          'Facts only; never invent numbers, names or outcomes.',
          'evidence and basis are ids from facts.decisions[].id or .goalId, or facts.savedReports[].id.',
          'authority: GREEN, YELLOW or RED; owner decisions are YELLOW or RED.',
          'Short: headline <= 12 words, each field <= 30 words.',
        ]
      : [
          'حقائق فقط؛ لا تخترع أرقاماً أو أسماء أو نتائج.',
          'evidence وbasis معرّفات من facts.decisions[].id أو .goalId أو facts.savedReports[].id.',
          'authority: GREEN أو YELLOW أو RED؛ قرار المالك YELLOW أو RED.',
          'مختصر: العنوان ≤ 12 كلمة، كل حقل ≤ 30 كلمة.',
        ],
  };
}

/** The exact object the provider will receive, used for both measuring and sending. */
export function buildInput(facts: unknown, lang: Lang): Record<string, unknown> {
  return {objective: objectiveFor(lang), contract: contractFor(lang), facts};
}

/** Bytes of the final request body as the provider will see it, template overhead excluded. */
export function promptBytes(facts: unknown, lang: Lang): number {
  // Measure with the real task shape: the engine sends executive_briefing:<callId>:<attempt>,
  // which is longer than the bare name. Measuring the short form under-counted the request.
  const prompt = taskPrompt({
    task: `executive_briefing:${'00000000-0000-4000-8000-000000000000'}:2`,
    capability: 'planning',
    dataClassification: 'INTERNAL',
    input: buildInput(facts, lang),
  } as any);
  return Buffer.byteLength(String(prompt), 'utf8');
}

const truncate = (value: unknown, chars: number) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  const points = [...text];
  return points.length <= chars ? text : points.slice(0, chars).join('') + '…';
};

function rankDecisions(decisions: any[]): any[] {
  const rank = (d: any) => CATEGORY_RANK[String(d?.kind)] ?? 9;
  const time = (d: any) => {
    const t = Date.parse(String(d?.since ?? ''));
    return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
  };
  return [...decisions].sort((a, b) => rank(a) - rank(b) || time(a) - time(b));
}

/** Picks a bounded sample: priority categories, most overdue first, and always the newest. */
export function sampleDecisions(decisions: any[], limit: number): any[] {
  if (limit <= 0) return [];
  const ranked = rankDecisions(decisions);
  const picked = ranked.slice(0, limit);
  const newest = [...decisions].sort((a, b) => {
    const ta = Date.parse(String(a?.since ?? ''));
    const tb = Date.parse(String(b?.since ?? ''));
    return (Number.isFinite(tb) ? tb : -1) - (Number.isFinite(ta) ? ta : -1);
  })[0];
  if (newest && limit > 1 && !picked.some((d) => d.id === newest.id)) {
    // A single slot always goes to the most urgent item; with room, the newest is kept visible.
    picked[picked.length - 1] = newest;
  }
  return picked.sort((a, b) => (CATEGORY_RANK[String(a?.kind)] ?? 9) - (CATEGORY_RANK[String(b?.kind)] ?? 9));
}

function assemble(full: any, decisions: any[], titleChars: number, reasonChars: number, includeReports: boolean, executions: number): any {
  const totals = {approval: 0, blocked: 0, waiting: 0, failed: 0};
  for (const d of full.decisions || []) {
    const key = String(d?.kind);
    if (key in totals) (totals as any)[key] += 1;
  }
  const c = full.counts || {};
  return {
    // Only the totals the brief reasons about; the rest stays in the dashboard.
    counts: {active: c.active_goals ?? c.active ?? null, completed: c.completed_goals ?? c.completed ?? null, failed: c.failed_goals ?? c.failed ?? null, waiting: c.waiting_owner ?? null, approvals: c.pending_approvals ?? null},
    decisionTotals: totals,
    decisions: decisions.map((d) => ({
      id: d.id,
      kind: d.kind,
      goalId: d.goalId,
      businessId: d.businessId,
      title: truncate(d.title, titleChars),
      since: d.since,
      reason: truncate(d.reason, reasonChars),
    })),
    condensed: {shown: decisions.length, omitted: Math.max(0, (full.decisions || []).length - decisions.length)},
    recentExecutions: (full.recentExecutions || []).slice(0, executions),
    savedReports: includeReports ? (full.savedReports || []).slice(0, 1) : [],
  };
}

/**
 * Fits the facts into a byte budget measured on the final request.
 * Tries 5..1 items, then shorter reasons, then without reports. Returns null when even one
 * item cannot fit, so the caller can fall back before any network call.
 */
const LEVELS = [
  {titleChars: 120, reasonChars: 120, includeReports: true, executions: 4},
  {titleChars: 90, reasonChars: 90, includeReports: false, executions: 1},
  {titleChars: 60, reasonChars: 60, includeReports: false, executions: 0},
];

export function fitFacts(full: any, lang: Lang, maxPromptBytes: number): {facts: any; promptBytes: number; shown: number; omitted: number; level: number} | null {
  const all = full.decisions || [];
  const maxItems = Math.min(5, all.length);
  // Prefer keeping more items: five short entries beat one verbose one.
  for (let n = maxItems; n >= 1; n -= 1) {
    for (let level = 0; level < LEVELS.length; level += 1) {
      const l = LEVELS[level];
      const candidate = assemble(full, sampleDecisions(all, n), l.titleChars, l.reasonChars, l.includeReports, l.executions);
      const bytes = promptBytes(candidate, lang);
      if (bytes <= maxPromptBytes) return {facts: candidate, promptBytes: bytes, shown: n, omitted: all.length - n, level};
    }
  }
  if (all.length === 0) {
    const candidate = assemble(full, [], 120, 120, false, 1);
    const bytes = promptBytes(candidate, lang);
    if (bytes <= maxPromptBytes) return {facts: candidate, promptBytes: bytes, shown: 0, omitted: 0, level: 0};
  }
  return null;
}
