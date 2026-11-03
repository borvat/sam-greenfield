/** Rejection diagnostics only; no database, no network, no paid call. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateBriefing} from '../../apps/command-center/src/briefing';

const ENTITY = '73aa81c6-3a23-4369-9408-8bea0956d399';
const GOAL = 'aaaaaaaa-bbbb-4ccc-8ddd-000000000001';

const facts = {
  counts: {active_goals: 17, failed_goals: 30},
  window: {e24: 3, v24: 2, g24: 1},
  decisionTotals: {approval: 1, blocked: 0, waiting: 0, failed: 30},
  decisions: [{id: GOAL, kind: 'approval', goalId: GOAL, businessId: '900001', title: 'هدف بانتظار قرارك', since: '2026-10-01T08:00:00Z', reason: 'approval_required'}],
  condensed: {shown: 1, omitted: 0},
  recentExecutions: [],
  savedReports: [],
};

const goodOutput = {
  headline: 'هدف واحد ينتظر قرارك',
  problem: {what: 'هدف بانتظار الموافقة', why: 'الحالة تتطلب قرار المالك', evidence: [GOAL]},
  impact: {statement: 'المسار متوقف حتى القرار', basis: [GOAL]},
  options: [{id: 'o1', title: 'مراجعة الهدف', risk: 'قراءة فقط', authority: 'GREEN'}],
  samCan: ['عرض السجل'],
  ownerMust: ['القرار'],
  nextStep: 'افتح الهدف',
};

const reply = (output: any) => ({
  providerId: 'deepseek',
  result: {output: typeof output === 'string' ? output : JSON.stringify(output), model: 'deepseek-flash', usage: {inputTokens: 900, outputTokens: 300}},
});

function deps(invoke: any, usage: any = {recordedUsd: 0.0005, estimatedUsd: 0.0007, callsLastHour: 1}, budgetUsd = 0.006) {
  const read = typeof usage === 'function' ? usage : async () => usage;
  return {budgetUsd, facts: async () => facts, invoke, usage: read, attribution: async () => 'VERIFIED' as const, tenant: async () => true};
}

/** Room for the first attempt, none for the retry once the first call has been billed. */
function tightBudget() {
  let reads = 0;
  return async () => {
    reads += 1;
    const spent = reads === 1 ? 0.0001 : 0.0055;
    return {recordedUsd: spent, estimatedUsd: spent, callsLastHour: 1};
  };
}

test('a rejected output keeps its own reason while the retry is blocked by budget', async () => {
  const bad = {...goodOutput, headline: '5 أهداف تنتظر قرارك'}; // 5 is not in the facts
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: deps(async () => {
      calls += 1;
      return reply(bad);
    }, tightBudget()),
  });

  assert.equal(calls, 1, 'the retry must not be sent');
  assert.equal(result.mode, 'MODEL_REJECTED');
  assert.equal(result.reason, 'UNSUPPORTED_NUMBER');
  assert.equal(result.rejectionReason?.code, 'UNSUPPORTED_NUMBER');
  assert.equal(result.rejectionReason?.path, 'headline');
  assert.equal(result.rejectionReason?.detail, 'number=5');
  assert.equal(result.retryBlockedReason, 'BUDGET_EXHAUSTED');
  assert.equal(result.analysis, null);
});

test('two attempts are allowed when the budget covers the second one', async () => {
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: deps(async () => {
      calls += 1;
      return calls === 1 ? reply({...goodOutput, headline: '5 أهداف'}) : reply(goodOutput);
    }),
  });
  assert.equal(calls, 2);
  assert.equal(result.mode, 'MODEL');
  assert.equal(result.receipt?.attempts, 2);
  assert.equal(result.rejectionReason ?? null, null);
  assert.equal(result.retryBlockedReason ?? null, null);
});

test('a foreign evidence id is still refused and names the field', async () => {
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: deps(async () => reply({...goodOutput, problem: {...goodOutput.problem, evidence: ['bbbbbbbb-bbbb-4ccc-8ddd-000000000009']}}), tightBudget()),
  });
  assert.equal(result.mode, 'MODEL_REJECTED');
  assert.equal(result.rejectionReason?.code, 'EVIDENCE_ID');
  assert.equal(result.rejectionReason?.path, 'problem.evidence[0]');
  assert.equal(result.retryBlockedReason, 'BUDGET_EXHAUSTED');
});

test('an unattributed call is withheld even when the output is valid', async () => {
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {...deps(async () => reply(goodOutput)), attribution: async () => 'FOREIGN' as const},
  });
  assert.equal(result.mode, 'MODEL_UNAVAILABLE');
  assert.equal(result.reason, 'ATTRIBUTION_FOREIGN');
  assert.equal(result.analysis, null);
});

test('a model without tenant context is never called', async () => {
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {...deps(async () => { calls += 1; return reply(goodOutput); }), tenant: async () => false},
  });
  assert.equal(calls, 0);
  assert.equal(result.reason, 'TENANT_CONTEXT_MISSING');
});

test('a provider outage is retried without spending a validation attempt', async () => {
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {
      ...deps(async () => {
        calls += 1;
        if (calls < 3) throw new Error('PROVIDER_UNAVAILABLE: HTTP 503');
        return reply(goodOutput);
      }),
      sleep: async () => {},
    },
  });
  assert.equal(calls, 3, 'two outages then one success');
  assert.equal(result.mode, 'MODEL');
  assert.equal(result.receipt?.attempts, 1, 'outages do not consume the paid attempt');
  assert.equal(result.receipt?.transportRetries, 2);
});

test('a deterministic provider error is not retried', async () => {
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {
      ...deps(async () => {
        calls += 1;
        throw new Error('PROVIDER_INPUT_LIMIT');
      }),
      sleep: async () => {},
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.mode, 'MODEL_UNAVAILABLE');
  assert.match(String(result.reason), /PROVIDER_INPUT_LIMIT/);
});

test('a stored brief is served when the remaining budget cannot afford a new call', async () => {
  let calls = 0;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {
      ...deps(async () => { calls += 1; return reply(goodOutput); }, {recordedUsd: 0.0059, estimatedUsd: 0.0059, callsLastHour: 1}),
      load: async () => ({analysis: goodOutput, receipt: {callId: 'stored-1', costUsd: 0.0007}, facts, savedAt: '2026-11-03T10:08:19.381Z'}),
    },
  });
  assert.equal(calls, 0, 'no provider call is made');
  assert.equal(result.mode, 'MODEL');
  assert.equal(result.fromStore, true);
  assert.equal(result.savedAt, '2026-11-03T10:08:19.381Z');
  assert.equal(result.analysis?.headline, goodOutput.headline);
});

test('without a stored brief the same state refuses with a reason', async () => {
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {
      ...deps(async () => reply(goodOutput), {recordedUsd: 0.0059, estimatedUsd: 0.0059, callsLastHour: 1}),
      load: async () => null,
    },
  });
  assert.equal(result.mode, 'MODEL_UNAVAILABLE');
  assert.ok(['BUDGET_TOO_SMALL_FOR_FACTS', 'FACTS_EXCEED_INPUT_BUDGET'].includes(String(result.reason)));
});

test('an accepted brief is stored for later readers', async () => {
  let saved: any = null;
  const result = await generateBriefing(ENTITY, {
    force: true,
    deps: {...deps(async () => reply(goodOutput)), save: async (_e, _l, brief) => { saved = brief; }},
  });
  assert.equal(result.mode, 'MODEL');
  assert.ok(saved, 'the brief was handed to the trail');
  assert.equal((saved.analysis as any).headline, goodOutput.headline);
});

test('a goal id is accepted as a citation while an unknown id is not', async () => {
  const decisionId = 'aaaaaaaa-bbbb-4ccc-8ddd-00000000000a';
  const facts2 = {...facts, decisions: [{...facts.decisions[0], id: decisionId, goalId: GOAL}]};
  const ok = await generateBriefing(ENTITY, {
    force: true,
    deps: {...deps(async () => reply({...goodOutput, impact: {statement: 'المسار متوقف', basis: [GOAL]}})), facts: async () => facts2},
  });
  assert.equal(ok.mode, 'MODEL', 'the goal id is a real handle');
  const bad = await generateBriefing(ENTITY, {
    force: true,
    deps: {...deps(async () => reply({...goodOutput, impact: {statement: 'المسار متوقف', basis: ['cccccccc-bbbb-4ccc-8ddd-00000000000b']}})), facts: async () => facts2},
  });
  assert.equal(bad.mode, 'MODEL_REJECTED');
  assert.equal(bad.rejectionReason?.code, 'BASIS_ID');
});
