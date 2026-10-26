import { test } from 'node:test';
import assert from 'node:assert/strict';
import { benchmarkCases } from '../../packages/ai-infrastructure/src/benchmark';

test('benchmark independently rejects incorrect outputs and does not execute returned code', async () => {
  const observation = await benchmarkCases([{ id: 'math', dimension: 'math', input: { value: 2 }, expected: { value: 4 } }],
    () => ({ providerId: 'synthetic', invoke: async () => ({ output: { value: 5 }, model: 'fixture', usage: { inputTokens: 7, outputTokens: 4 } }) }), 'fixture');
  assert.equal(observation[0].verified, false); assert.equal(observation[0].failure, 'OUTPUT_MISMATCH');
});
test('benchmark preserves unknown usage for failed calls and redacts errors', async () => {
  const observation = await benchmarkCases([{ id: 'math', dimension: 'math', input: {}, expected: 4 }],
    () => ({ providerId: 'synthetic', invoke: async () => { throw Error('synthetic-secret-must-never-escape'); } }), 'fixture');
  assert.equal(observation[0].usage, null); assert.equal(JSON.stringify(observation).includes('synthetic-secret'), false);
});
test('benchmark expands the long context corpus rather than merely claiming it', async () => {
  let bytes = 0;
  const observation = await benchmarkCases([{ id: 'long-context', dimension: 'context', input: {}, expected: { checkpoint: 'SYNTHETIC-CHECKPOINT-73' } }],
    () => ({ providerId: 'synthetic', invoke: async task => {
      bytes = JSON.stringify(task.input).length;
      return { output: { checkpoint: 'SYNTHETIC-CHECKPOINT-73' }, model: 'fixture', usage: { inputTokens: 100000, outputTokens: 12 } };
    } }), 'fixture');
  assert.ok(bytes > 300000); assert.equal(observation[0].verified, true);
});
test('duplicate benchmark case IDs fail before any call', async () => {
  await assert.rejects(benchmarkCases([{ id: 'one', dimension: 'math', input: {}, expected: 4 },
    { id: 'one', dimension: 'math', input: {}, expected: 4 }], () => { throw Error('must not run'); }, 'fixture'), /BENCHMARK_CASE_INVALID/);
});
