import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';

// Run the actual service and health server with isolated database-backed collaborators.
// No production credentials, database, or external tools are used.
async function harness({ work = async () => {}, supervise = async () => {} } = {}) {
  let callback;
  let cleared = false;
  const logs = [];
  class Gate {
    ready = false;
    async start() { this.ready = true; }
    snapshot() { return { ready: this.ready }; }
    beginShutdown() { this.ready = false; }
  }
  const context = createContext({
    process: { stderr: { write: text => logs.push(text) } },
    setTimeout,
    setInterval(fn) { callback = fn; return { unref() {} }; },
    clearInterval() { cleared = true; }
  });
  const http = await import('node:http');
  const modules = new Map();
  function synthetic(id, values) {
    const mod = new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context, identifier: id });
    modules.set(id, mod);
  }
  synthetic('node:http', { createServer: http.createServer });
  synthetic('./readiness', { ReadinessGate: Gate });
  synthetic('../../supervisor/src/runtime', { runOperationalSupervisorTick: supervise });
  for (const [id, file] of [
    ['./healthServer', '../../apps/runtime/src/healthServer.ts'],
    ['service', '../../apps/runtime/src/service.ts']
  ]) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    modules.set(id, new SourceTextModule(stripTypeScriptTypes(source), { context, identifier: id }));
  }
  const serviceModule = modules.get('service');
  await serviceModule.link(id => {
    if (!modules.has(id)) throw new Error(`Unexpected import: ${id}`);
    return modules.get(id);
  });
  await serviceModule.evaluate();
  const service = await serviceModule.namespace.startRuntimeService({
    port: 0, host: '127.0.0.1', tickIntervalMs: 20,
    composition: { runWorkTick: work }
  });
  return {
    service, logs,
    async tick() { callback(); await new Promise(resolve => setImmediate(resolve)); },
    get cleared() { return cleared; }
  };
}

for (const thrown of [new Error('work unavailable'), 'non-Error failure']) {
  test(`work rejection is logged and a later tick runs: ${String(thrown)}`, async t => {
    let calls = 0;
    let supervisorCalls = 0;
    const h = await harness({
      work: async () => { if (++calls === 1) throw thrown; },
      supervise: async () => { supervisorCalls++; }
    });
    t.after(() => h.service.stop());
    await h.tick();
    assert.equal(calls, 1);
    assert.equal(supervisorCalls, 0);
    assert.equal(h.logs.length, 1);
    assert.match(h.logs[0], /\[sam-runtime\] work tick failed:/);
    assert.ok(h.logs[0].includes(thrown instanceof Error ? thrown.message : thrown));
    await h.tick();
    assert.equal(calls, 2);
    assert.equal(supervisorCalls, 1);
    const { port } = h.service.server.address();
    assert.equal((await fetch(`http://127.0.0.1:${port}/livez`)).status, 200);
  });
}

test('supervisor rejection is contained and the next work tick runs', async t => {
  let calls = 0;
  let supervisorCalls = 0;
  const h = await harness({
    work: async () => { calls++; },
    supervise: async () => { if (++supervisorCalls === 1) throw new Error('supervisor unavailable'); }
  });
  t.after(() => h.service.stop());
  await h.tick();
  await h.tick();
  assert.equal(calls, 2);
  assert.equal(supervisorCalls, 2);
  assert.equal(h.logs.length, 1);
  assert.match(h.logs[0], /supervisor unavailable/);
});

test('ticks do not overlap; shutdown drains the failing tick and prevents future work', async t => {
  let rejectWork;
  let calls = 0;
  const h = await harness({ work: () => {
    calls++;
    return new Promise((resolve, reject) => { rejectWork = reject; });
  } });
  t.after(() => h.service.stop());
  await h.tick();
  await h.tick();
  assert.equal(calls, 1);
  let stopped = false;
  const stopping = h.service.stop().then(() => { stopped = true; });
  await h.tick();
  assert.equal(stopped, false);
  assert.equal(h.cleared, true);
  rejectWork(new Error('failure during shutdown'));
  await stopping;
  await h.tick();
  assert.equal(calls, 1);
  assert.equal(h.service.server.listening, false);
  assert.equal(h.logs.length, 1);
});
