"""Offline native AIAgent -> real SDK -> partial SSE diagnostic regression.

HERMES_NATIVE_SOURCE must identify the exact pristine upstream checkout. Install
the existing native dependencies on PYTHONPATH. No network or model is allowed.
Synthetic input is the default; SAM_HERMES_RUNS_REQUEST_FILE may explicitly
select a retained request without adding its private content to the repository.
"""
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from types import SimpleNamespace as NS
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
STAGE = 'first_partial_stream_error'
SENTINEL = 'PRIVATE_DIAGNOSTIC_SENTINEL'
BASELINE_FINAL_SHA256 = 'de895327617c640f34bc5b33c54c4a6dc3b501fd9903a1a92663d9dee2b5be1b'
EVENT_FIELDS = {'stage', 'task_id', 'session_id', 'request_body_sha256', 'exception_chain', 'stack', 'http_status', 'headers', 'bytes', 'chunks', 'elapsed_ms', 'ttfb_ms', 'finish_reason_seen'}


def load_guard():
    spec = importlib.util.spec_from_file_location('partial_guard', ROOT / 'scripts/hermes-deepseek-guard.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def native_probe(destination):
    sys.dont_write_bytecode = True
    network = []
    def deny(*args, **kwargs):
        network.append(True)
        raise AssertionError('OFFLINE_SOCKET_DENIED')
    # This probe is a disposable subprocess. Deny sockets before SDK/native
    # imports as well as initialization, streaming, finalization and cleanup.
    socket.socket.connect = deny
    socket.socket.connect_ex = deny
    socket.create_connection = deny
    import logging
    import httpx
    import openai
    from hermes_deepseek_json import envelope

    native = Path(os.environ['HERMES_NATIVE_SOURCE']).resolve()
    guard = load_guard()
    original = (native / 'agent/chat_completion_helpers.py').read_bytes()
    assert hashlib.sha256(original).hexdigest() == guard.SOURCE, 'Exact pristine native source required'
    with tempfile.TemporaryDirectory(prefix='hermes-partial-offline-') as tmp:
        tmp = Path(tmp)
        tree, home = tmp / 'native', tmp / 'home'
        tree.mkdir(); home.mkdir()
        # Isolate the patched module; immutable upstream siblings are symlinked.
        for child in native.iterdir():
            if child.name == 'agent':
                shutil.copytree(child, tree / 'agent', ignore=shutil.ignore_patterns('__pycache__'))
                (tree / 'agent/chat_completion_helpers.py').write_text(guard.patch(original.decode()))
            elif child.is_file() and child.suffix == '.py':
                shutil.copyfile(child, tree / child.name)
            elif child.name not in ('.git', '__pycache__'):
                (tree / child.name).symlink_to(child, target_is_directory=child.is_dir())
        reqfile = os.environ.get('SAM_HERMES_RUNS_REQUEST_FILE')
        if reqfile:
            request = json.loads(Path(reqfile).read_text())
        else:
            synthetic = envelope()
            instructions = json.loads(synthetic['instructions'])
            instructions['aggregate'] = {'private_source': SENTINEL}
            synthetic['instructions'] = json.dumps(instructions)
            request = {'input': json.dumps(synthetic), 'instructions': 'Return JSON only.'}
        text = request['input']; task = json.loads(text)['task_id']
        success = os.environ.get('PARTIAL_STREAM_TEST_MODE') == 'success'
        partial = json.dumps({'summary': SENTINEL + ' success', 'observations': []}) if success else '{"summary":"' + SENTINEL + ' reply interrupted'
        os.environ.update(HERMES_HOME=str(home), HERMES_STREAM_RETRIES='0', HERMES_CODEX_SDK_TRANSFORM='0')
        (home / 'config.yaml').write_text('agent:\n  api_max_retries: 1\n  auto_recovery_cycles: 0\n  model_upgrade_enabled: false\nupdates:\n  check: false\nmodels_dev:\n  url: http://127.0.0.1:9/api.json\nskills:\n  creation_nudge_interval: 0\nmemory:\n  nudge_interval: 0\nauxiliary:\n  title_generation:\n    enabled: false\n')
        (home / 'models_dev_cache.json').write_text(json.dumps({'deepseek': {'id': 'deepseek', 'name': 'DeepSeek', 'models': {'deepseek-flash': {'id': 'deepseek-flash', 'name': 'DeepSeek Flash', 'limit': {'context': 1000000, 'output': 384000}, 'tool_call': True, 'reasoning': True, 'modalities': {'input': ['text', 'image'], 'output': ['text']}}}}}))
        sys.path.insert(0, str(tree))
        from run_agent import AIAgent
        from hermes_state import SessionDB
        from gateway.platforms.api_server_runs import _run_user_message
        from agent import chat_completion_helpers
        assert Path(chat_completion_helpers.__file__).resolve() == (tree / 'agent/chat_completion_helpers.py').resolve()
        assert Path(chat_completion_helpers.__file__).read_text() == guard.patch(original.decode())
        canonical, error = _run_user_message(text, lambda *a, **k: None)
        assert error is None and canonical == text
        seen, events = [], []
        cleanup = {'activeNativeCloses': 0, 'diagnosticBeforeNativeClose': None}

        class Capture(logging.Handler):
            def emit(self, record):
                message = record.getMessage()
                if message.startswith('sam_hermes_provenance '):
                    value = json.loads(message.split(' ', 1)[1])
                    if value.get('stage') == STAGE and os.environ.get('PARTIAL_STREAM_TEST_MODE') == 'logger_failure':
                        raise RuntimeError(SENTINEL + ' logging failure')
                    if value.get('stage') == STAGE:
                        cleanup['diagnosticBeforeNativeClose'] = cleanup['activeNativeCloses'] == 0
                    events.append(value)

        class Partial(httpx.SyncByteStream):
            def __iter__(self):
                for content in (partial[:12], partial[12:]):
                    chunk = {'id': 'offline-partial', 'object': 'chat.completion.chunk', 'created': 1, 'model': 'deepseek-flash', 'choices': [{'index': 0, 'delta': {'role': 'assistant', 'content': content}, 'finish_reason': None}]}
                    yield ('data: ' + json.dumps(chunk) + '\n\n').encode()
                if success:
                    chunk['choices'] = [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]
                    yield ('data: ' + json.dumps(chunk) + '\n\ndata: [DONE]\n\n').encode()
                    return
                try:
                    raise ConnectionResetError(104, SENTINEL + ' inner error')
                except ConnectionResetError as cause:
                    raise httpx.ReadError(SENTINEL + ' outer error') from cause

        def receive(request):
            seen.append(json.loads(request.content))
            assert len(seen) == 1, 'Unexpected second SDK network operation'
            return httpx.Response(200, request=request, headers={'content-type': 'text/event-stream', 'x-request-id': 'req_abcdefgh12345678', 'cf-ray': '0123456789abcdef-AMS', 'authorization': SENTINEL, 'set-cookie': SENTINEL, 'x-private': SENTINEL}, stream=Partial())

        capture = Capture(); log = logging.getLogger(); old = log.level
        log.addHandler(capture); log.setLevel(logging.INFO)
        db = SessionDB(db_path=home / 'state.db')
        sdk = openai.OpenAI(api_key='synthetic-no-authority', base_url='https://api.deepseek.com/v1', max_retries=0, http_client=httpx.Client(transport=httpx.MockTransport(receive)))
        agent = None
        original_close = chat_completion_helpers._StreamingCall._close_managed_stream
        if os.environ.get('PARTIAL_STREAM_TEST_MODE') == 'cleanup_order':
            def close_and_invalidate_headers(owner, *args, **kwargs):
                response = getattr(owner, '_attempt_stream_response', None)
                if response is not None:
                    cleanup['activeNativeCloses'] += 1
                    response.headers.clear()
                return original_close(owner, *args, **kwargs)
            chat_completion_helpers._StreamingCall._close_managed_stream = close_and_invalidate_headers
        try:
            with patch.object(socket.socket, 'connect', deny), patch.object(socket.socket, 'connect_ex', deny), patch.object(socket, 'create_connection', deny):
                agent = AIAgent(provider='deepseek', base_url='https://api.deepseek.com/v1', api_key='synthetic-no-authority', model='deepseek-flash', api_mode='chat_completions', ephemeral_system_prompt=request.get('instructions'), platform='api_server', session_id='sam_' + task, session_db=db, enabled_toolsets=[], quiet_mode=True, skip_context_files=True, skip_memory=True, skip_background_review=True, save_trajectories=False, stream_delta_callback=lambda *a, **k: None)
                agent._create_request_openai_client = lambda *a, **kw: sdk
                result = agent.run_conversation(user_message=canonical, conversation_history=[], task_id='sam_' + task)
            body = seen[0]
            outcome = {'sdkVersion': openai.__version__, 'helperSha256': hashlib.sha256(Path(chat_completion_helpers.__file__).read_bytes()).hexdigest(), 'pristineSha256': hashlib.sha256(original).hexdigest(), 'sdkRequests': len(seen), 'sockets': len(network), 'inputUnchanged': [m for m in body['messages'] if m.get('role') == 'user'][0]['content'] == text, 'model': body['model'], 'stream': body['stream'], 'tools': body.get('tools'), 'thinking': body.get('thinking'), 'maxTokens': body['max_tokens'], 'sdkRetries': sdk.max_retries, 'responseFormat': body.get('response_format'), 'events': events, 'failed': result.get('failed'), 'finalResponseSha256': hashlib.sha256(str(result.get('final_response')).encode()).hexdigest(), 'finalEqualsProviderBytes': result.get('final_response') == partial, 'finalContainsAttemptCeiling': 'SAM_DEEPSEEK_ATTEMPT_CEILING' in str(result), 'pristineUnchanged': (native / 'agent/chat_completion_helpers.py').read_bytes() == original}
        finally:
            if agent is not None: agent.close()
            sdk.close(); log.removeHandler(capture); log.setLevel(old)
            chat_completion_helpers._StreamingCall._close_managed_stream = original_close
        # The process-wide socket guard remains active during both close paths.
        # Capture the count only after cleanup has completed, not beforehand.
        outcome['sockets'] = len(network)
        outcome['cleanupOrder'] = cleanup
        Path(destination).write_text(json.dumps(outcome))


class NativePartialDiagnostics(unittest.TestCase):
    def exercise(self, measurement='1', mode='partial'):
        self.assertTrue(os.environ.get('HERMES_NATIVE_SOURCE'), 'HERMES_NATIVE_SOURCE required')
        with tempfile.TemporaryDirectory(prefix='hermes-partial-result-') as tmp:
            result = Path(tmp) / 'result.json'
            env = dict(os.environ, SAM_HERMES_MEASUREMENT_ENABLED=measurement, PARTIAL_STREAM_TEST_MODE=mode)
            process = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--native-probe', str(result)], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=80)
            self.assertEqual(process.returncode, 0, 'Native fixture failed before diagnostic assertion: ' + process.stderr[-1500:].replace(SENTINEL, '[redacted]'))
            outcome = json.loads(result.read_text())
            evidence = os.environ.get('SAM_HERMES_DIAGNOSTIC_EVIDENCE_FILE')
            if evidence:
                # Outcome contains only whitelisted events and hashes/flags;
                # the request, response and native warning text are never saved.
                Path(evidence).write_text(json.dumps(outcome, indent=2) + '\n')
            return outcome

    def test_real_native_partial_stream_records_first_original_error(self):
        result = self.exercise()
        self.assertEqual(result['sdkVersion'], '2.24.0')
        self.assertEqual(result['sdkRequests'], 1)
        self.assertEqual(result['sockets'], 0)
        self.assertTrue(result['inputUnchanged'])
        self.assertEqual(result['model'], 'deepseek-flash')
        self.assertEqual(result['sdkRetries'], 0)
        self.assertEqual(result['maxTokens'], 2048)
        self.assertEqual(result['responseFormat'], {'type': 'json_object'})
        self.assertEqual(result['thinking'], {'type': 'disabled'})
        self.assertTrue(result['stream']); self.assertFalse(result['tools'])
        self.assertTrue(result['pristineUnchanged'])
        records = [row for row in result['events'] if row.get('stage') == STAGE]
        self.assertEqual(len(records), 1, 'Missing first_partial_stream_error record from actual AIAgent partial SSE path')
        self.assertNotIn(SENTINEL, json.dumps(records))
        record = records[0]
        self.assertEqual(set(record), EVENT_FIELDS)
        self.assertEqual(record['exception_chain'], [{'module': 'httpx', 'type': 'ReadError', 'errno': None}, {'module': 'builtins', 'type': 'ConnectionResetError', 'errno': 104}])
        self.assertEqual(record['http_status'], 200)
        self.assertEqual(record['headers'], {'x-request-id': 'req_abcdefgh12345678', 'cf-ray': '0123456789abcdef-AMS'})
        self.assertGreater(record['bytes'], 0); self.assertEqual(record['chunks'], 2)
        self.assertFalse(record['finish_reason_seen'])
        self.assertIsInstance(record['elapsed_ms'], (int, float)); self.assertGreaterEqual(record['elapsed_ms'], 0)
        self.assertIsInstance(record['ttfb_ms'], (int, float)); self.assertGreaterEqual(record['ttfb_ms'], 0)
        self.assertLessEqual(record['ttfb_ms'], record['elapsed_ms'])
        request = [row for row in result['events'] if row.get('stage') == 'request_body']
        self.assertEqual(len(request), 1)
        for key in ('task_id', 'session_id', 'request_body_sha256'):
            self.assertEqual(record[key], request[0][key])
        self.assertFalse(any(row.get('stage') == 'decoded_provider_content' for row in result['events']))
        self.assertTrue(result['failed']); self.assertTrue(result['finalContainsAttemptCeiling'])
        self.assertEqual(result['finalResponseSha256'], BASELINE_FINAL_SHA256)
        self.assertLessEqual(len(json.dumps(record)), 4096)

    def test_real_native_success_has_no_partial_record_and_preserves_output(self):
        result = self.exercise(mode='success')
        self.assertEqual(result['sdkRequests'], 1); self.assertEqual(result['sockets'], 0)
        self.assertFalse(any(row.get('stage') == STAGE for row in result['events']))
        self.assertTrue(result['finalEqualsProviderBytes']); self.assertFalse(result['failed'])

    def test_real_native_measurement_off_preserves_original_failure(self):
        result = self.exercise(measurement='0')
        self.assertEqual(result['events'], [])
        self.assertEqual(result['sdkRequests'], 1); self.assertEqual(result['sockets'], 0)
        self.assertEqual(result['finalResponseSha256'], BASELINE_FINAL_SHA256)

    def test_real_native_logger_failure_preserves_original_failure(self):
        result = self.exercise(mode='logger_failure')
        self.assertFalse(any(row.get('stage') == STAGE for row in result['events']))
        self.assertEqual(result['sdkRequests'], 1); self.assertEqual(result['sockets'], 0)
        self.assertEqual(result['finalResponseSha256'], BASELINE_FINAL_SHA256)

    def test_real_native_observes_original_error_before_close_invalidates_metadata(self):
        result = self.exercise(mode='cleanup_order')
        self.assertEqual(result['sdkRequests'], 1); self.assertEqual(result['sockets'], 0)
        self.assertGreater(result['cleanupOrder']['activeNativeCloses'], 0)
        self.assertTrue(result['cleanupOrder']['diagnosticBeforeNativeClose'], 'Original partial error diagnostic must precede initial native stream close')
        record = next(row for row in result['events'] if row.get('stage') == STAGE)
        self.assertEqual(record['headers'], {'x-request-id': 'req_abcdefgh12345678', 'cf-ray': '0123456789abcdef-AMS'})
        self.assertEqual(result['finalResponseSha256'], BASELINE_FINAL_SHA256)


class PartialObserverBoundaries(unittest.TestCase):
    """Supplemental actual patched observer helper tests; not builder proof."""
    def harness(self, *, diag=None, headers=None, response=True):
        source = (Path(os.environ['HERMES_NATIVE_SOURCE']) / 'agent/chat_completion_helpers.py').read_text()
        tree = ast.parse(load_guard().patch(source))
        cls = next(node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == '_StreamingCall')
        method = next(node for node in cls.body if isinstance(node, ast.FunctionDef) and node.name == '_sam_observe_partial_error')
        rows, calls = [], []

        class Log:
            fail = False
            def info(self, fmt, value, **kwargs):
                row = json.loads(value)
                if row.get('stage') == STAGE:
                    calls.append(True)
                    if self.fail: raise RuntimeError(SENTINEL)
                    rows.append(row)
            def warning(self, *args, **kwargs): pass
            def debug(self, *args, **kwargs): pass

        logger = Log()
        namespace = {'logger': logger, 'json': json, 'time': time, '_anthropic_connection_error_types': lambda: (), '_is_sse_connection_error': lambda e: False, '_rejects_stream_options': lambda e: False, 'EmptyStreamError': type('EmptyStreamError', (Exception,), {})}
        exec(compile(ast.Module(body=[method], type_ignores=[]), '<actual-native-partial-method>', 'exec'), namespace)
        task = '00000000-0000-4000-8000-000000000001'
        owner = NS(agent=NS(provider='deepseek', session_id='sam_' + task, _is_provider_stream_parse_error=lambda e: False), _request_cancelled={'value': False}, deltas_were_sent={'yes': True}, first_delta_fired={'done': True}, provider_tool_in_flight={'yes': False}, result={}, _visible_text_delivered=lambda: True, _sam_data_analysis_provenance={'task_id': task, 'session_id': 'sam_' + task, 'request_body_sha256': 'a' * 64}, clients=NS(diag=diag), _attempt_stream_response=NS(status_code=200, headers={} if headers is None else headers) if response else None)
        def invoke(error=None):
            error = error if error is not None else ConnectionResetError(104, SENTINEL)
            owner.result['error'] = error
            answer = namespace['_sam_observe_partial_error'](owner, error)
            self.assertIsNone(answer); self.assertIs(owner.result['error'], error)
            return rows
        return owner, logger, invoke, rows, calls

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_missing_metadata_is_null_and_deduped(self):
        owner, _, invoke, rows, calls = self.harness(response=False)
        invoke(); invoke()
        self.assertEqual(len(rows), 1); self.assertEqual(len(calls), 1)
        for key in ('http_status', 'bytes', 'chunks', 'elapsed_ms', 'ttfb_ms', 'finish_reason_seen'):
            self.assertIsNone(rows[0][key])
        self.assertEqual(rows[0]['headers'], {})

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_logger_failure_is_passive_and_claimed_once(self):
        owner, logger, invoke, rows, calls = self.harness()
        logger.fail = True
        invoke(); invoke()
        self.assertEqual(rows, []); self.assertEqual(len(calls), 1)

    def test_disabled_and_unrelated_scopes_do_not_emit(self):
        cases = [('0', None), ('1', 'non_sam'), ('1', 'other_provider'), ('1', 'no_analysis'), ('1', 'cancelled'), ('1', 'invisible'), ('1', 'no_deltas'), ('1', 'tool_names'), ('1', 'tool_in_flight')]
        for measurement, mode in cases:
            with self.subTest(measurement=measurement, mode=mode), patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': measurement}):
                owner, _, invoke, rows, _ = self.harness()
                if mode == 'non_sam': owner.agent.session_id = 'unrelated'
                if mode == 'other_provider': owner.agent.provider = 'nous'
                if mode == 'no_analysis': owner._sam_data_analysis_provenance = None
                if mode == 'cancelled': owner._request_cancelled['value'] = True
                if mode == 'invisible': owner._visible_text_delivered = lambda: False
                if mode == 'no_deltas': owner.deltas_were_sent['yes'] = False
                if mode == 'tool_names': owner.result['partial_tool_names'] = ['synthetic_tool']
                if mode == 'tool_in_flight': owner.provider_tool_in_flight['yes'] = True
                invoke(); self.assertEqual(rows, [])

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_nonfinite_negative_boolean_metadata_never_escapes(self):
        for value in (float('nan'), float('inf'), float('-inf'), -1, True, SENTINEL):
            with self.subTest(kind=type(value).__name__, value=str(value)):
                owner, _, invoke, rows, _ = self.harness(diag={'bytes': value, 'chunks': value, 'started_at': value, 'first_chunk_at': value, 'finish_reason_seen': value, 'http_status': value})
                owner._attempt_stream_response.status_code = value
                invoke(); record = rows[0]
                for key in ('http_status', 'bytes', 'chunks', 'elapsed_ms', 'ttfb_ms'):
                    self.assertIsNone(record[key], key)
                self.assertEqual(record['finish_reason_seen'], value if type(value) is bool else None)
                json.dumps(record, allow_nan=False)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_header_allowlist_rejects_full_unsafe_and_overlong_values(self):
        invalid = [SENTINEL, 'req_abcdefgh' + 'a' * 130, 'req_abcdefgh\nsecret', 'req_abcdefgh/secret', 'req_abcdefgh=secret', 'req_éabcdefgh', 'req_abcdefgh ']
        for value in invalid:
            with self.subTest(value=value):
                owner, _, invoke, rows, _ = self.harness(headers={'x-request-id': value, 'cf-ray': value, 'authorization': SENTINEL, 'cookie': SENTINEL})
                owner.clients.diag = {'headers': {'x-request-id': 'req_abcdefgh12345678'}}
                invoke(); self.assertEqual(rows[0]['headers'], {})
                self.assertNotIn(SENTINEL, json.dumps(rows))

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_cyclic_long_exception_chain_is_bounded_and_private_type_hidden(self):
        private_type = type(SENTINEL, (Exception,), {})
        chain = [private_type(SENTINEL), ConnectionResetError(104, SENTINEL), ValueError(SENTINEL), OSError(5, SENTINEL), RuntimeError(SENTINEL)]
        for index, error in enumerate(chain): error.__cause__ = chain[(index + 1) % len(chain)]
        _, _, invoke, rows, _ = self.harness()
        invoke(chain[0]); record = rows[0]
        self.assertLessEqual(len(record['exception_chain']), 4)
        self.assertEqual(record['exception_chain'][0]['module'], 'other')
        self.assertEqual(record['exception_chain'][0]['type'], 'other')
        self.assertNotIn(SENTINEL, json.dumps(record))
        self.assertLessEqual(len(record['stack']), 8)
        self.assertLessEqual(len(json.dumps(record)), 4096)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_large_valid_counters_and_finite_timings_are_capped(self):
        now = time.time()
        _, _, invoke, rows, _ = self.harness(diag={'bytes': 10 ** 1000, 'chunks': 10 ** 1000, 'started_at': now - 7200, 'first_chunk_at': now - 1, 'http_status': 200, 'finish_reason_seen': False})
        invoke(); record = rows[0]
        self.assertEqual(record['bytes'], 1000000000); self.assertEqual(record['chunks'], 1000000000)
        self.assertEqual(record['elapsed_ms'], 3600000); self.assertEqual(record['ttfb_ms'], 3600000)
        self.assertEqual(record['http_status'], 200)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_unrepresentable_timestamps_do_not_drop_event(self):
        _, _, invoke, rows, _ = self.harness(diag={'started_at': 10 ** 1000, 'first_chunk_at': 10 ** 1000})
        invoke(); self.assertEqual(len(rows), 1)
        self.assertIsNone(rows[0]['elapsed_ms']); self.assertIsNone(rows[0]['ttfb_ms'])

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_extreme_finite_timestamp_delta_is_capped_without_infinity(self):
        _, _, invoke, rows, _ = self.harness(diag={'started_at': 1, 'first_chunk_at': 1e308})
        invoke(); self.assertEqual(rows[0]['ttfb_ms'], 3600000)
        json.dumps(rows[0], allow_nan=False)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_short_exception_cycle_does_not_repeat_links(self):
        one, two = ConnectionResetError(104, SENTINEL), RuntimeError(SENTINEL)
        one.__cause__ = two; two.__cause__ = one
        _, _, invoke, rows, _ = self.harness()
        invoke(one); self.assertEqual(len(rows[0]['exception_chain']), 2)

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_private_frame_names_and_exception_string_are_never_rendered(self):
        class Private(Exception):
            def __str__(self): raise AssertionError('Exception string was read')
            def __repr__(self): raise AssertionError('Exception repr was read')
        namespace = {'error': Private(SENTINEL)}
        exec(compile('def ' + SENTINEL + '():\n    raise error\n', '/private/' + SENTINEL + '.py', 'exec'), namespace)
        try:
            namespace[SENTINEL]()
        except Private as error:
            _, _, invoke, rows, _ = self.harness()
            invoke(error)
        self.assertEqual(len(rows), 1)
        self.assertNotIn(SENTINEL, json.dumps(rows))
        self.assertEqual(rows[0]['stack'], [])

    @patch.dict(os.environ, {'SAM_HERMES_MEASUREMENT_ENABLED': '1'})
    def test_invalid_original_provenance_cannot_enable_diagnostics(self):
        for field, value in (('request_body_sha256', SENTINEL), ('task_id', 'wrong'), ('session_id', 'wrong')):
            owner, _, invoke, rows, _ = self.harness()
            owner._sam_data_analysis_provenance[field] = value
            invoke(); self.assertEqual(rows, [])

    def test_current_installed_guard_upgrade_and_new_patch_are_exact(self):
        guard = load_guard()
        original = (Path(os.environ['HERMES_NATIVE_SOURCE']) / 'agent/chat_completion_helpers.py').read_text()
        changed = guard.patch(original)
        current = changed.replace(guard.PARTIAL_ERROR_GUARD, '', 1)
        if hasattr(guard, 'PARTIAL_ERROR_CALL'):
            current = current.replace(guard.PARTIAL_ERROR_CALL, guard.PARTIAL_ERROR_CALL_ANCHOR, 1)
        self.assertEqual(hashlib.sha256(current.encode()).hexdigest(), guard.CURRENT_SOURCE)
        self.assertEqual(guard.patch(current), changed)
        self.assertEqual(guard.patch(changed), changed)
        with self.assertRaisesRegex(RuntimeError, 'PINNED'):
            guard.patch(changed + '# unsupported native change\n')

    def test_relocated_observer_is_rejected_even_if_insertions_strip_cleanly(self):
        guard = load_guard()
        original = (Path(os.environ['HERMES_NATIVE_SOURCE']) / 'agent/chat_completion_helpers.py').read_text()
        changed = guard.patch(original)
        if guard.PARTIAL_ERROR_GUARD.lstrip().startswith('def '):
            without = changed.replace(guard.PARTIAL_ERROR_GUARD, '', 1)
            anchor = '    def _unmask_server_error_with_nonstreaming(self, e: Exception) -> bool:'
            moved = without.replace(anchor, guard.PARTIAL_ERROR_GUARD + anchor, 1)
        else:
            moved = changed.replace(guard.PARTIAL_ERROR_GUARD, '', 1).replace(guard.PARTIAL_ERROR_ANCHOR + '\n', guard.PARTIAL_ERROR_ANCHOR + '\n' + guard.PARTIAL_ERROR_GUARD, 1)
        self.assertNotEqual(moved, changed)
        ast.parse(moved)
        with self.assertRaisesRegex(RuntimeError, 'PINNED'):
            guard.patch(moved)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--native-probe':
        native_probe(sys.argv[2])
    else:
        unittest.main(verbosity=2)
