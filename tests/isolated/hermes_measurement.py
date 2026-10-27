"""No SDK/model/network. Exercise exact pinned methods, not a rewritten provider.

HERMES_MEASUREMENT_SOURCE points to the two-file byte-matched upstream snapshot.
"""
import ast
import contextlib
import copy
import importlib.util
import json
import logging
import os
from pathlib import Path
from types import SimpleNamespace as NS
import tempfile
import threading
import unittest
from unittest.mock import patch
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(os.environ['HERMES_MEASUREMENT_SOURCE'])
spec = importlib.util.spec_from_file_location('prepare_measurement', ROOT / 'scripts/hermes-measurement/prepare.py')
prepare_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare_module)
METHODS = {'_new_diag', '_open_chat_stream', '_chat_stream_created', '_count_chunk',
           '_mark_finish_seen', '_close_managed_stream', '_abort_for_interrupt'}
TASK = '00000000-0000-4000-8000-000000000001'


class Recorder:
    def __init__(self):
        self.rows = []
        self.fail = False

    def info(self, _fmt, record):
        if self.fail:
            raise RuntimeError('synthetic logger unavailable')
        self.rows.append(json.loads(record))

    def debug(self, *args, **kwargs):
        pass


def chunk(content='', **delta):
    return NS(choices=[NS(delta=NS(content=content, **delta))])


class MeasurementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.output = Path(cls.tmp.name) / 'patched'
        cls.manifest = prepare_module.prepare(SOURCE, cls.output)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def harness(self, instrumented=True):
        root = self.output if instrumented else SOURCE
        spec = importlib.util.spec_from_file_location('isolated_diag', root / 'agent/stream_diag.py')
        diag = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(diag)
        recorder = Recorder()
        diag.logger = recorder
        calls, mono = [], [10.0]
        # A private clock object, not a monkeypatch to the global execution clock.
        diag.time = NS(time=lambda: -999999, monotonic=lambda: mono[0])
        namespace = dict(Any=Any, contextlib=contextlib, time=NS(time=lambda: 42), logger=recorder,
                         is_native_gemini_base_url=lambda _url: False,
                         bypass_chat_sdk_request_transform=lambda kw, client: kw,
                         claim_stream_writer=lambda agent: calls.append('claim_writer'),
                         _estimate_chunk_bytes=lambda c: 1,
                         _record_interrupted_provider_wait=lambda *a, **kw: False,
                         _join_worker_for_relay_teardown=lambda *a, **kw: calls.append('join'))
        for name in ('_sam_measure_reset', '_sam_measure_start', '_sam_measure_event', '_sam_measure_chunk'):
            if hasattr(diag, name):
                namespace[name] = getattr(diag, name)
        tree = ast.parse((root / 'agent/chat_completion_helpers.py').read_text())
        native = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == '_StreamingCall')
        native.body = [n for n in native.body if isinstance(n, ast.FunctionDef) and n.name in METHODS]
        native.bases = []
        exec(compile(ast.fix_missing_locations(ast.Module(body=[native], type_ignores=[])), 'native_methods', 'exec'), namespace)
        h = namespace['_StreamingCall']()
        agent = NS(session_id='sam_' + TASK, base_url='https://synthetic.invalid',
                   _touch_activity=lambda text: calls.append('activity:' + text),
                   _capture_rate_limits=lambda r: calls.append('rate'),
                   _capture_credits=lambda r: calls.append('credits'),
                   _capture_nous_model_switch=lambda r: calls.append('switch'),
                   _stream_diag_capture_response=lambda d, r: calls.append('capture'),
                   _check_openrouter_cache_status=lambda r: calls.append('cache'))
        client = NS(chat=NS(completions=NS()))
        raw = NS(response=NS(status_code=200, headers={'authorization': 'DO_NOT_LOG'}))

        def create(**kw):
            calls.append(('create', copy.deepcopy(kw)))
            return raw

        client.chat.completions.create = create
        agent._create_request_openai_client = lambda **kw: client
        h.agent = agent
        h.clients = NS(diag=diag.stream_diag_init(), set_client=lambda c: c,
                       close_once=lambda reason: calls.append('abort_client'))
        h.last_chunk_time = {}
        h._attempt_stream_response = None
        h._quiet = lambda fn: quiet(fn)
        h._reabort_if_cancelled = lambda r: calls.append('reabort')
        h.managed_stream_holder = {'stream': NS(close=lambda: calls.append('close'))}
        h._uncounted_stale_attempt = lambda: 0
        h._request_cancelled = {'value': False}
        h._cancel_current_stream_attempt = lambda reason: calls.append('mark_cancel')
        h._shutdown_stale_attempt_socket = lambda r: calls.append('shutdown')
        h.worker = None
        h._monitor_interrupted = {}
        return h, diag, recorder, calls, mono, raw

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_timing_real_delta_and_native_behavior(self):
        outcomes = []
        for enabled in (False, True):
            h, diag, log, calls, mono, raw = self.harness(enabled)
            kwargs = {'model': 'poolside/laguna-s-2.1:free', 'messages': ['DO_NOT_LOG'], 'timeout': 120}
            self.assertIs(h._open_chat_stream(kwargs), raw)
            mono[0] += .010
            h._chat_stream_created(raw)
            h._count_chunk(h.clients.diag, chunk())  # role/empty frame
            h._count_chunk(h.clients.diag, NS(choices=[]))  # usage/heartbeat
            self.assertNotIn('provider_first_delta', [r['event'] for r in log.rows])
            mono[0] += .010
            h._count_chunk(h.clients.diag, chunk('DO_NOT_LOG'))
            h._count_chunk(h.clients.diag, chunk('DO_NOT_LOG_AGAIN'))
            mono[0] += .010
            h._mark_finish_seen(h.clients.diag, 'stop')
            h._mark_finish_seen(h.clients.diag, 'stop')
            mono[0] += .010
            h._close_managed_stream()
            outcomes.append((calls, {k: v for k, v in h.clients.diag.items() if not k.startswith('_sam_')}))
            if enabled:
                self.assertEqual([r['event'] for r in log.rows], ['provider_request_started', 'provider_headers',
                                 'provider_first_delta', 'provider_finish', 'provider_stream_closed'])
                for row, elapsed in zip(log.rows, [0, 10, 20, 30, 40]):
                    self.assertAlmostEqual(row['elapsed_ms'], elapsed)
                    self.assertEqual(row['task_id'], TASK)
                    self.assertEqual(row['session_id'], 'sam_' + TASK)
                self.assertEqual(len({r['operation_id'] for r in log.rows}), 1)
                self.assertEqual(log.rows[1]['http_status'], 200)
                self.assertNotIn('DO_NOT_LOG', json.dumps(log.rows))
            else:
                self.assertEqual(log.rows, [])
        self.assertEqual(outcomes[0], outcomes[1], 'No changed SDK args, calls, counters or close order')

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_logger_failure_and_exception_identity(self):
        h, diag, log, calls, mono, raw = self.harness()
        log.fail = True
        self.assertIs(h._open_chat_stream({}), raw)
        h._chat_stream_created(raw)
        h._count_chunk(h.clients.diag, chunk('secret'))
        h._mark_finish_seen(h.clients.diag, 'stop')
        h._close_managed_stream()
        sentinel = RuntimeError('PRIVATE_PROVIDER_ERROR')
        h._attempt_request_client.chat.completions.create = lambda **kw: (_ for _ in ()).throw(sentinel)
        with self.assertRaises(RuntimeError) as caught:
            h._open_chat_stream({})
        self.assertIs(caught.exception, sentinel)
        self.assertEqual(log.rows, [])

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_http_error_headers_are_distinct_from_no_response(self):
        h, diag, log, calls, mono, raw = self.harness()
        sentinel = RuntimeError('PRIVATE_ERROR_BODY')
        sentinel.status_code = 429
        h.agent._create_request_openai_client().chat.completions.create = lambda **kw: (_ for _ in ()).throw(sentinel)
        with self.assertRaises(RuntimeError) as caught:
            h._open_chat_stream({})
        self.assertIs(caught.exception, sentinel)
        self.assertEqual([r['event'] for r in log.rows], ['provider_request_started', 'provider_headers', 'provider_open_failed'])
        self.assertEqual(log.rows[1]['http_status'], 429)
        self.assertNotIn('PRIVATE_', json.dumps(log.rows))

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_cancel_and_new_attempt_identity(self):
        outcomes = []
        for enabled in (False, True):
            h, diag, log, calls, mono, raw = self.harness(enabled)
            h._open_chat_stream({})
            h._abort_for_interrupt(9.5)
            outcomes.append(copy.deepcopy((calls, h._request_cancelled, h._monitor_interrupted)))
            if enabled:
                self.assertEqual([r['event'] for r in log.rows], ['provider_request_started', 'provider_cancel_observed'])
                operation = log.rows[0]['operation_id']
                mono[0] += 3
                h._open_chat_stream({})
                self.assertNotEqual(operation, log.rows[-1]['operation_id'])
                self.assertEqual(log.rows[-1]['elapsed_ms'], 0)
        self.assertEqual(outcomes[0], outcomes[1])

    def test_default_off_and_unrelated_sessions(self):
        for flag, session in [('0', 'sam_' + TASK), ('1', 'unrelated-session')]:
            with patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': flag}):
                h, diag, log, calls, mono, raw = self.harness()
                h.agent.session_id = session
                h._open_chat_stream({})
                self.assertEqual(log.rows, [])
                self.assertNotIn('_sam_measurement', h.clients.diag)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_late_old_worker_headers_keep_original_operation(self):
        h, diag, log, calls, mono, raw = self.harness()
        shared = diag.stream_diag_init()
        old_started, new_started = threading.Event(), threading.Event()
        identities = {}

        def old_worker():
            diag._sam_measure_start(h.agent, shared)
            identities['old'] = log.rows[-1]['operation_id']
            old_started.set()
            if not new_started.wait(1):
                return
            # The existing diagnostic holder can now refer to a newer attempt.
            diag._sam_measure_event(shared, 'provider_headers', 200)
            diag._sam_measure_chunk(shared, chunk('PRIVATE_OLD_DELTA'))

        worker = threading.Thread(target=old_worker)
        worker.start()
        self.assertTrue(old_started.wait(1))
        diag._sam_measure_start(h.agent, shared)
        identities['new'] = log.rows[-1]['operation_id']
        diag._sam_measure_event(shared, 'provider_cancel_observed', current=True)
        new_started.set()
        worker.join(1)
        self.assertFalse(worker.is_alive())
        self.assertNotEqual(identities['old'], identities['new'])
        by_event = {r['event']: r for r in log.rows if r['event'] != 'provider_request_started'}
        self.assertEqual(by_event['provider_headers']['operation_id'], identities['old'])
        self.assertEqual(by_event['provider_first_delta']['operation_id'], identities['old'])
        self.assertEqual(by_event['provider_cancel_observed']['operation_id'], identities['new'])

    def test_only_pinned_methods_changed_and_prepare_never_writes_input(self):
        before = {p: (SOURCE / p).read_bytes() for p in prepare_module.PINS}
        old = ast.parse(before['agent/chat_completion_helpers.py'].decode())
        new = ast.parse((self.output / 'agent/chat_completion_helpers.py').read_text())
        for tree in (old, new):
            tree.body = [n for n in tree.body if not isinstance(n, ast.ImportFrom) or n.module != 'agent.stream_diag']
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef) and node.name == '_StreamingCall':
                    node.body = [n for n in node.body if not isinstance(n, ast.FunctionDef) or n.name not in METHODS]
        self.assertEqual(ast.dump(old), ast.dump(new))
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                prepare_module.prepare(SOURCE, SOURCE / 'nested')
            bad = Path(tmp) / 'bad'
            for p, b in before.items():
                (bad / p).parent.mkdir(parents=True, exist_ok=True)
                (bad / p).write_bytes(b + b'#wrong version\n')
            with self.assertRaisesRegex(ValueError, 'source mismatch'):
                prepare_module.prepare(bad, Path(tmp) / 'never_written')
            self.assertFalse((Path(tmp) / 'never_written').exists())
        self.assertEqual(before, {p: (SOURCE / p).read_bytes() for p in before})


def quiet(fn):
    with contextlib.suppress(Exception):
        fn()


if __name__ == '__main__':
    unittest.main(verbosity=2)
