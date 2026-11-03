import {generateBriefing, type BriefingResult} from '../../../packages/executive-brief/src/briefing';
import {loadBrief, type StoredBrief} from '../../../packages/executive-brief/src/briefStore';
import type { RegisteredChatGPTTool } from './types';

const schema = {
  type: 'object',
  properties: {
    lang: { type: 'string', enum: ['ar', 'en'] },
    fresh: { type: 'boolean' },
  },
  additionalProperties: false,
};

type Deps = {
  tenant: () => Promise<string | null>;
  load: (legalEntityId: string, lang: 'ar' | 'en') => Promise<StoredBrief | null>;
  generate: (legalEntityId: string, options: {force?: boolean; lang?: 'ar' | 'en'}) => Promise<BriefingResult>;
};

function decisionIndex(facts: any): Map<string, any> {
  const index = new Map<string, any>();
  for (const d of facts?.decisions ?? []) {
    if (d?.id) index.set(String(d.id), d);
    if (d?.goalId) index.set(String(d.goalId), d);
  }
  for (const r of facts?.savedReports ?? []) {
    if (r?.id) index.set(String(r.id), {...r, kind: 'report'});
    if (r?.goalId) index.set(String(r.goalId), {...r, kind: 'report'});
  }
  return index;
}

/** Citations become readable entries so the model's evidence can be opened, not just trusted. */
function evidenceOf(facts: any, ids: unknown): { id: string; kind: string; title: string; businessId: string | null; since: string | null }[] {
  const index = decisionIndex(facts);
  return (Array.isArray(ids) ? ids : []).map((raw) => {
    const id = String(raw);
    const row = index.get(id);
    return {
      id,
      kind: String(row?.kind ?? 'unknown'),
      title: String(row?.title ?? row?.summary ?? '').slice(0, 240),
      businessId: row?.businessId ? String(row.businessId) : null,
      since: row?.since ? String(row.since) : row?.at ? String(row.at) : null,
    };
  });
}

function shape(result: BriefingResult) {
  const analysis = result.analysis;
  return {
    mode: result.mode,
    reason: result.reason ?? null,
    analysis,
    deterministic: result.mode === 'MODEL' ? null : result.deterministic,
    evidence: {
      problem: analysis ? evidenceOf(result.facts, analysis.problem?.evidence) : [],
      impact: analysis ? evidenceOf(result.facts, analysis.impact?.basis) : [],
      omitted: (result.facts as any)?.condensed?.omitted ?? 0,
    },
    generatedAt: result.receipt?.generatedAt ?? null,
    savedAt: result.savedAt ?? null,
    fromStore: result.fromStore === true,
    receipt: result.receipt,
    budget: result.budget,
    counts: (result.facts as any)?.counts ?? null,
    rejectionReason: result.rejectionReason ?? null,
    retryBlockedReason: result.retryBlockedReason ?? null,
  };
}

export function createBriefingTools(deps?: Partial<Deps>): RegisteredChatGPTTool[] {
  // The company comes from the database session, never from the caller: the runtime role is
  // bound to one legal entity, so this cannot be switched by a request argument.
  const tenant = deps?.tenant ?? (async () => {
    // Lazy so this module stays importable without a database (tests, tools list).
    const {one} = await import('./sql');
    const row = await one('SELECT current_legal_entity_id()::text AS entity');
    return row?.entity ?? null;
  });
  const load = deps?.load ?? loadBrief;
  const generate = deps?.generate ?? ((id: string, options: {force?: boolean; lang?: 'ar' | 'en'}) => generateBriefing(id, options));
  return [
    {
      definition: {
        name: 'sam_executive_brief',
        description:
          'Read the latest executive analysis of this company from stored SAM facts: what is blocking the work, why, its impact, options with their authority, what SAM can do without approval, what needs the owner, and the next step. Returns the evidence behind each claim, the generation time and cost, and whether the answer came from the stored brief. Pass fresh=true to ask the model for a new analysis within the company budget. Read-only: executes nothing and needs no approval.',
        risk: 'READ',
        availability: 'READ_ONLY',
        inputSchema: schema,
      },
      handler: async (args, context) => {
        const entity = context.legalEntityId ?? (await tenant());
        if (!entity) return {ok: false, error: 'TENANT_REQUIRED'};
        const lang: 'ar' | 'en' = args.lang === 'en' ? 'en' : 'ar';
        try {
          if (args.fresh === true) {
            return {ok: true, data: shape(await generate(entity, {force: true, lang}))};
          }
          const stored = await load(entity, lang);
          if (!stored || !stored.analysis) {
            return {ok: false, error: 'NO_STORED_BRIEF: call again with fresh=true to generate one within the budget'};
          }
          return {
            ok: true,
            data: {
              mode: 'MODEL',
              fromStore: true,
              savedAt: stored.savedAt,
              analysis: stored.analysis,
              receipt: stored.receipt,
              generatedAt: (stored.receipt as any)?.generatedAt ?? null,
              evidence: (() => {
                const a: any = stored.analysis;
                return {problem: evidenceOf(stored.facts, a?.problem?.evidence), impact: evidenceOf(stored.facts, a?.impact?.basis), omitted: (stored.facts as any)?.condensed?.omitted ?? 0};
              })(),
              counts: (stored.facts as any)?.counts ?? null,
            },
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return {ok: false, error: message.replace(/\s+/g, ' ').slice(0, 200)};
        }
      },
    },
  ];
}
