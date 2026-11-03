"""Offline evaluation of the real, explicitly installed zg 0.2.1 CLI on synthetic data.
No installer, remote embeddings, application memory, repository index or credentials.
"""
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import statistics
import subprocess
import tempfile
import time
import threading
from types import SimpleNamespace

HERE = Path(__file__).resolve().parent
CLI = Path(os.environ['AI_EVAL_ZG_CLI']).resolve()
CACHE = Path(os.environ['AI_EVAL_ZG_MODEL_CACHE']).resolve()
MODEL = CACHE / 'model2vec/minishlab--potion-code-16M-v2/e9d2a44ca6a05ac6685f3b23709ea57eb7352d5b'
for name, expected in {
    'model.safetensors': '75cf7a6c2171b230ad19b1e7d8e0b1aee86da5a02af8e7cacedd9921d227623c',
    'tokenizer/tokenizer.json': '107bbdcbad4bff1d299b7a4c3a2fb17c52890688b7dd0e4c9deab79d3c4f3d45'
}.items():
    if hashlib.sha256((MODEL / name).read_bytes()).hexdigest() != expected:
        raise RuntimeError('PREVERIFIED_MODEL_CACHE_REQUIRED')

cases = json.loads((HERE / 'retrieval-cases.json').read_text())
with tempfile.TemporaryDirectory(prefix='surooh-retrieval-') as tmp:
    root = Path(tmp); corpus = root / 'corpus'
    shutil.copytree(HERE / 'corpus', corpus)
    env = {'PATH': os.environ['PATH'], 'ZVEC_GREP_HOME': str(root / 'state'),
           'ZVEC_GREP_MODEL_CACHE': str(CACHE), 'ZVEC_GREP_MODE': 'direct', 'ZVEC_GREP_DEVICE': 'cpu'}

    def run(args):
        started = time.perf_counter()
        with tempfile.TemporaryFile() as out, tempfile.TemporaryFile() as err:
            child = subprocess.Popen(args, cwd=corpus, env=env, stdout=out, stderr=err)
            timer = threading.Timer(60, child.kill); timer.start()
            try:
                _, status, usage = os.wait4(child.pid, 0)
                child.returncode = os.waitstatus_to_exitcode(status)
            finally:
                timer.cancel()
            out.seek(0); err.seek(0)
            p = SimpleNamespace(returncode=child.returncode, stdout=out.read().decode(), stderr=err.read().decode())
        elapsed = (time.perf_counter() - started) * 1000
        return p, elapsed, usage.ru_maxrss

    version = subprocess.check_output(['node', str(CLI), 'version'], env=env, text=True).strip()
    if '0.2.1' not in version:
        raise RuntimeError('PINNED_ZG_VERSION_REQUIRED')
    indexed, index_ms, index_rss = run(['node', str(CLI), 'index', str(corpus), '--embedding',
                                      'local/potion-code-16m-v2', '--device', 'cpu', '--mode', 'direct',
                                      '--embedding-concurrency', '1'])
    if indexed.returncode:
        raise RuntimeError('ISOLATED_ZG_INDEX_FAILED')
    observations = []
    for mode in ['rg-literal', 'bm25', 'semantic', 'hybrid']:
        for case in cases:
            for repeat in range(3):
                if mode == 'rg-literal':
                    args = ['rg', '-l', '-i', '-F', '--', case['query'], '.']
                else:
                    flag = {'bm25': '--fts', 'semantic': '--vector', 'hybrid': '--hybrid'}[mode]
                    args = ['node', str(CLI), 'query', flag, case['query'], '--mode', 'direct',
                            '--limit', '3', '--preview', 'none']
                p, ms, rss = run(args)
                if mode == 'rg-literal':
                    files = [Path(line).name for line in p.stdout.splitlines()][:3]
                    valid = p.returncode in (0, 1)
                else:
                    files = [Path(v).name for v in re.findall(r'^#\d+ matchedBy=\S+ ([^:\n]+):\d+', p.stdout, re.M)]
                    valid = p.returncode == 0
                hit = case['expected'] in files
                observations.append({'mode': mode, 'case': case['id'], 'repeat': repeat,
                                     'valid': valid, 'recallAt3': int(hit),
                                     'reciprocalRank': 1 / (files.index(case['expected']) + 1) if hit else 0,
                                     'latencyMs': round(ms, 3), 'peakRssKb': rss, 'returnedFiles': files})
    summary = []
    for mode in ['rg-literal', 'bm25', 'semantic', 'hybrid']:
        rows = [r for r in observations if r['mode'] == mode]
        timings = sorted(r['latencyMs'] for r in rows)
        summary.append({'mode': mode, 'runs': len(rows), 'errors': sum(not r['valid'] for r in rows),
                        'recallAt3': round(statistics.mean(r['recallAt3'] for r in rows), 4),
                        'mrrAt3': round(statistics.mean(r['reciprocalRank'] for r in rows), 4),
                        'p50Ms': round(statistics.median(timings), 3),
                        'p95Ms': timings[math.ceil(len(timings) * .95) - 1],
                        'maxPeakRssKb': max(r['peakRssKb'] for r in rows)})
    print(json.dumps({'tool': version, 'model': 'local/potion-code-16m-v2', 'syntheticFiles': 10,
                      'cases': len(cases), 'repeats': 3, 'indexMs': round(index_ms, 3),
                      'indexPeakRssKb': index_rss, 'summary': summary,
                      'limits': ['Tiny synthetic English corpus; not a production benchmark.',
                                 'Each CLI invocation includes Node/native/model startup; not a warm daemon.',
                                 'rg-literal is literal phrase matching, not a ranked semantic baseline.',
                                 'SAM SQL memory and Hermes memory were not accessed or benchmarked.'],
                      'observations': observations}, indent=2))
