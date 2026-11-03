import test from 'node:test';
import assert from 'node:assert/strict';
import {createBriefingTools} from '../../apps/chatgpt-tools/src/briefingTools';

const ENTITY = '73aa81c6-3a23-4369-9408-8bea0956d399';
const DECISION = '11111111-2222-4333-8444-555555555555';

const analysis = {
  headline: 'موافقة معلّقة توقف مسار التصدير',
  problem: {what: 'طلب موافقة لم يُبتّ', why: 'بانتظار قرار المالك', evidence: [DECISION]},
  impact: {statement: 'المسار متوقف حتى القرار', basis: [DECISION]},
  options: [{id: 'a', title: 'اعتماد', risk: 'low', authority: 'YELLOW' as const}],
  samCan: ['تجهيز الملخص'],
  ownerMust: ['اعتماد الطلب'],
  nextStep: 'افتح الهدف من رابط الدليل.',
};
const facts = {
  counts: {active: 17, failed: 30, waiting: 1, approvals: 1},
  condensed: {shown: 2, omitted: 5},
  decisions: [{id: DECISION, goalId: '99999999-2222-4333-8444-555555555555', kind: 'approval', title: 'bol_offer_export', businessId: '900001', since: '2026-11-01T09:00:00Z'}],
  savedReports: [],
};
const receipt = {provider: 'deepseek', model: 'deepseek-flash', inputTokens: 605, outputTokens: 370, costUsd: 0.000625, latencyMs: 3205, generatedAt: '2026-11-03T10:45:28.407Z', factsHash: 'f4adb863', attempts: 1, attribution: 'VERIFIED' as const, callId: '5903a7c8-64ce-4d97-a159-e000ca57d603'};

const stored = {analysis, receipt, facts, savedAt: '2026-11-03T10:45:28Z'};

test('the tool needs a company context', async () => {
  const [tool] = createBriefingTools({tenant: async () => null, load: async () => stored, generate: async () => { throw new Error('must not call'); }});
  const r = await tool.handler({}, {actor: 'chatgpt', systemOwner: false});
  assert.equal(r.ok, false);
  assert.equal(r.error, 'TENANT_REQUIRED');
});

test('the stored brief is returned with its generation time and readable evidence', async () => {
  const [tool] = createBriefingTools({tenant: async () => null, load: async () => stored, generate: async () => { throw new Error('must not call'); }});
  const r = await tool.handler({}, {actor: 'chatgpt', systemOwner: false, legalEntityId: ENTITY});
  assert.equal(r.ok, true);
  const data: any = r.data;
  assert.equal(data.fromStore, true);
  assert.equal(data.generatedAt, receipt.generatedAt);
  assert.equal(data.analysis.headline, analysis.headline);
  assert.equal(data.evidence.problem[0].id, DECISION);
  assert.equal(data.evidence.problem[0].title, 'bol_offer_export');
  assert.equal(data.evidence.problem[0].businessId, '900001');
  assert.equal(data.evidence.omitted, 5);
});

test('a missing stored brief asks for a fresh call instead of inventing one', async () => {
  const [tool] = createBriefingTools({tenant: async () => null, load: async () => null, generate: async () => { throw new Error('must not call'); }});
  const r = await tool.handler({}, {actor: 'chatgpt', systemOwner: false, legalEntityId: ENTITY});
  assert.equal(r.ok, false);
  assert.match(String(r.error), /NO_STORED_BRIEF/);
});

test('fresh=true goes to the shared engine and reports the model result', async () => {
  let asked: any = null;
  const [tool] = createBriefingTools({
    load: async () => null,
    generate: async (id, options) => {
      asked = {id, options};
      return {mode: 'MODEL', analysis, deterministic: analysis, receipt, facts, budget: {recordedUsd: 0, estimatedUsd: 0.0046, spentUsd: 0.0046, reservedUsd: 0, limitUsd: 0.006, callsLastHour: 1, hourlyCap: 6}} as any;
    },
  });
  const r = await tool.handler({fresh: true, lang: 'en'}, {actor: 'chatgpt', systemOwner: false, legalEntityId: ENTITY});
  assert.equal(r.ok, true);
  assert.deepEqual(asked, {id: ENTITY, options: {force: true, lang: 'en'}});
  const data: any = r.data;
  assert.equal(data.mode, 'MODEL');
  assert.equal(data.receipt.callId, receipt.callId);
  assert.equal(data.fromStore, false);
});

test('a refused budget is reported, not hidden', async () => {
  const [tool] = createBriefingTools({
    load: async () => null,
    generate: async () => ({mode: 'MODEL_REJECTED', analysis: null, deterministic: analysis, receipt: null, facts, budget: {recordedUsd: 0, estimatedUsd: 0.006, spentUsd: 0.006, reservedUsd: 0, limitUsd: 0.006, callsLastHour: 6, hourlyCap: 6}, rejectionReason: {code: 'BASIS_ID', path: 'impact.basis[0]'}, retryBlockedReason: 'BUDGET_EXHAUSTED'} as any),
  });
  const r = await tool.handler({fresh: true}, {actor: 'chatgpt', systemOwner: false, legalEntityId: ENTITY});
  assert.equal(r.ok, true);
  const data: any = r.data;
  assert.equal(data.mode, 'MODEL_REJECTED');
  assert.equal(data.rejectionReason.code, 'BASIS_ID');
  assert.equal(data.retryBlockedReason, 'BUDGET_EXHAUSTED');
  assert.ok(data.deterministic, 'the deterministic brief is offered instead of nothing');
});

test('the company comes from the database session when the caller has none', async () => {
  let asked = '';
  const [tool] = createBriefingTools({
    tenant: async () => ENTITY,
    load: async (id) => { asked = id; return stored; },
    generate: async () => { throw new Error('must not call'); },
  });
  const r = await tool.handler({}, {actor: 'chatgpt', systemOwner: true});
  assert.equal(r.ok, true);
  assert.equal(asked, ENTITY);
});

test('the answer states whether a provider credential is configured, never its value', async () => {
  const [tool] = createBriefingTools({tenant: async () => ENTITY, load: async () => stored, generate: async () => { throw new Error('no'); }});
  const r = await tool.handler({}, {actor: 'chatgpt', systemOwner: true});
  const data: any = r.data;
  assert.equal(typeof data.provider.configured, 'boolean');
  assert.equal(JSON.stringify(data).includes('sk-'), false);
});
