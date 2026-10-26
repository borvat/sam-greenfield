import { isDeepStrictEqual } from 'node:util';
import type { ModelProviderAdapter, ModelTask } from '../../model-gateway/src/types';
import { deny } from './security';

export interface BenchmarkCase { id: string; dimension: string; input: unknown; expected: unknown; }
export interface BenchmarkObservation {
  id: string; dimension: string; verified: boolean; latencyMs: number;
  usage: { inputTokens: number; outputTokens: number } | null;
  provider: string; model: string; failure: 'OUTPUT_MISMATCH' | 'CALL_FAILED' | null;
}
/** Explicitly invoked evaluator; no process execution or self-graded model scores.
 * One pre-authorized scoped adapter per case. Provider errors/output are never logged.
 */
export async function benchmarkCases(cases: BenchmarkCase[], adapterFor: (id: string) => ModelProviderAdapter,
  model: string): Promise<BenchmarkObservation[]> {
  const seen = new Set<string>();
  for (const c of cases) {
    if (!/^[a-z0-9-]{1,64}$/.test(c.id) || seen.has(c.id)) deny('BENCHMARK_CASE_INVALID');
    seen.add(c.id);
  }
  const observations: BenchmarkObservation[] = [];
  for (const c of cases) {
    const adapter = adapterFor(c.id);
    let input = c.input;
    if (c.id === 'long-context') {
      const distractors = Array.from({ length: 10000 }, (_, i) => `Distractor ${i}: synthetic value ${i * 7}`);
      distractors.splice(4321, 0, 'Exact checkpoint: SYNTHETIC-CHECKPOINT-73');
      input = { text: distractors.join('\n'), question: 'Return JSON checkpoint with the exact checkpoint.' };
    }
    const task: ModelTask = { task: `Synthetic benchmark ${c.id}: return JSON only`,
      capability: 'planning', dataClassification: 'PUBLIC', input };
    const start = performance.now();
    try {
      const result = await adapter.invoke(task, model);
      const verified = isDeepStrictEqual(result.output, c.expected);
      observations.push({ id: c.id, dimension: c.dimension, verified, latencyMs: performance.now() - start,
        usage: { ...result.usage }, provider: adapter.providerId, model: result.model,
        failure: verified ? null : 'OUTPUT_MISMATCH' });
    } catch {
      observations.push({ id: c.id, dimension: c.dimension, verified: false, latencyMs: performance.now() - start,
        usage: null, provider: adapter.providerId, model, failure: 'CALL_FAILED' });
    }
  }
  return observations;
}
