/** Facts-budget checks only; no database, no network, no paid call. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fitFacts, promptBytes, sampleDecisions} from '../../apps/command-center/src/factsBudget';

const CAP = 3000 - 64;
const LONG_TITLE = 'مراجعة الفروق المحاسبية بين مبيعات المتجر وبيانات المستودع وتحديث تقرير المالك '.repeat(4);
const LONG_REASON = 'السبب المسجل: انتظار موافقة المالك على صلاحية التنفيذ بعد رفض التحقق المستقل للمحاولة السابقة '.repeat(3);

function uuid(i: number): string {
  const n = (i + 1).toString(16).padStart(12, '0');
  return `aaaaaaaa-bbbb-4ccc-8ddd-${n}`;
}

function productionFacts(active = 17, failed = 30) {
  const decisions: any[] = [];
  const base = Date.parse('2026-10-01T08:00:00Z');
  decisions.push({id: uuid(0), kind: 'approval', goalId: uuid(0), businessId: '900001', title: LONG_TITLE, since: new Date(base).toISOString(), reason: 'approval_required'});
  for (let i = 1; i < active; i += 1) {
    decisions.push({
      id: uuid(i), kind: i === 1 ? 'waiting' : 'blocked', goalId: uuid(i), businessId: `9000${String(i).padStart(2, '0')}`,
      title: LONG_TITLE, since: new Date(base + i * 3600_000).toISOString(), reason: LONG_REASON,
    });
  }
  for (let i = 0; i < failed; i += 1) {
    const k = active + i;
    decisions.push({
      id: uuid(k), kind: 'failed', goalId: uuid(k), businessId: `91${String(i).padStart(4, '0')}`,
      title: LONG_TITLE, since: new Date(base + k * 3600_000).toISOString(), reason: LONG_REASON,
    });
  }
  return {
    company: {scope: 'configured legal entity only'},
    counts: {active_goals: active, completed: 4, failed_goals: failed},
    window: {executions24h: 3, verified24h: 2, newGoals24h: 1},
    decisions,
    recentExecutions: Array.from({length: 4}, (_, i) => ({actor: 'agent-' + i, capability: 'cap.' + i, at: new Date(base).toISOString(), result: 'OK'})),
    savedReports: Array.from({length: 3}, (_, i) => ({id: uuid(900 + i), goalId: uuid(i), businessId: '90000' + i, at: new Date(base).toISOString(), summary: 'ملخص تقرير محفوظ ' + i})),
    finance: {briefAvailable: false, costAvailable: false, costReason: 'NOT_TENANT_SCOPED'},
  };
}

test('production-sized facts fit the final request and keep every total', () => {
  const full = productionFacts(17, 30);
  const fit = fitFacts(full, 'ar', CAP);
  assert.ok(fit, 'expected a fit');
  assert.ok(fit!.promptBytes <= CAP, `prompt ${fit!.promptBytes} over cap ${CAP}`);

  const f = fit!.facts;
  assert.equal(f.decisionTotals.failed, 30);
  assert.equal(f.decisionTotals.approval, 1);
  assert.equal(f.decisionTotals.blocked + f.decisionTotals.waiting, 16);
  assert.ok(f.decisions.length <= 5);
  assert.equal(f.condensed.shown + f.condensed.omitted, 47);
  assert.ok(f.condensed.omitted > 40, 'most items should be condensed');

  const ids = new Set(full.decisions.map((d) => d.id));
  for (const d of f.decisions) assert.ok(ids.has(d.id), 'a shown id must come from the input');
  assert.deepEqual(JSON.parse(JSON.stringify(f)), f, 'facts must survive a JSON round trip');
  assert.equal(promptBytes(f, 'ar'), fit!.promptBytes, 'measured bytes must equal the bytes sent');
});

test('the sample leads with owner decisions and still includes the newest item', () => {
  const full = productionFacts(17, 30);
  const fit = fitFacts(full, 'ar', CAP)!;
  const kinds = fit.facts.decisions.map((d: any) => d.kind);
  assert.equal(kinds[0], 'approval', 'approval must lead');
  const newest = [...full.decisions].sort((a, b) => Date.parse(b.since) - Date.parse(a.since))[0];
  assert.ok(fit.facts.decisions.some((d: any) => d.id === newest.id), 'the newest item must be present');
});

test('a much larger estate is condensed further and still fits', () => {
  const full = productionFacts(60, 200);
  const fit = fitFacts(full, 'ar', CAP)!;
  assert.ok(fit.promptBytes <= CAP);
  assert.equal(fit.facts.decisionTotals.failed, 200);
  assert.ok(fit.facts.condensed.omitted >= 250);
  assert.ok(fit.facts.decisions.length >= 1 && fit.facts.decisions.length <= 5);
});

test('a budget too small for one useful item is refused, not truncated', () => {
  const full = productionFacts(17, 30);
  assert.equal(fitFacts(full, 'ar', 120), null);
});

test('long fields are cut on code-point boundaries, never mid-character', () => {
  const full = productionFacts(3, 2);
  const fit = fitFacts(full, 'ar', CAP)!;
  for (const d of fit.facts.decisions) {
    assert.ok([...d.title].length <= 121, 'title respects the character cap plus ellipsis');
    assert.equal(Buffer.from(d.title, 'utf8').toString('utf8'), d.title, 'title stays valid UTF-8');
    assert.ok(!/\uFFFD/.test(d.title), 'no replacement characters');
  }
});

test('the sample helper honours its limit and priority order', () => {
  const full = productionFacts(17, 30);
  const picked = sampleDecisions(full.decisions, 3);
  assert.equal(picked.length, 3);
  assert.equal(picked[0].kind, 'approval');
});
