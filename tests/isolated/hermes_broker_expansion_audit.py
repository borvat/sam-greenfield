"""Independent no-cloud acceptance checks. Known baseline failures are deliberate.

No candidate program is executed. Modal and worker subprocesses are synthetic.
Run from any directory: python3 tests/isolated/hermes_broker_expansion_audit.py -v
"""
import importlib.util
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import time
import types
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value
broker = module('audit_broker', 'deploy/hermes-coding/broker.py')
worker = module('audit_worker', 'deploy/hermes-coding/modal_worker.py')
JOB = '00000000-0000-4000-8000-000000000001'
SOURCE = worker.BROKEN.replace('min(lower, max(upper, value))', 'min(upper, max(lower, value))')
BODY = {'jobId': JOB, 'artifact': {'files': {'clamp.py': SOURCE}, 'tests': 'assert True', 'action': 'run_tests'}}

class BrokerAudit(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db_patch = patch.object(broker, 'DB', self.tmp.name + '/jobs.sqlite')
        self.db_patch.start(); self.addCleanup(self.db_patch.stop)
        self.path_patch = patch.object(broker, 'Path')
        self.path = self.path_patch.start(); self.addCleanup(self.path_patch.stop)
        self.policy = {'enabled': True, 'maxJobs': 1, 'expiresAtEpoch': time.time()+100}
        self.path.return_value.read_text.side_effect = lambda: json.dumps(self.policy)
        self.run_patch = patch('subprocess.run')
        self.run = self.run_patch.start(); self.addCleanup(self.run_patch.stop)
        self.run.return_value = types.SimpleNamespace(returncode=0, stdout=json.dumps({'ok': False, 'error': 'SYNTHETIC_ONLY'}))

    def test_closed_campaign_blocks_new_admission(self):
        self.policy['enabled'] = False
        self.assertEqual(broker.execute(BODY)['error'], 'CODING_POLICY_CLOSED')
        self.run.assert_not_called()

    def test_conflicting_replay_never_dispatches_again(self):
        broker.execute(BODY)
        changed = {**BODY, 'artifact': {**BODY['artifact'], 'tests': 'assert False'}}
        self.assertEqual(broker.execute(changed)['error'], 'CODING_ID_CONFLICT')
        self.assertEqual(self.run.call_count, 1)

    def test_durable_replay_after_module_reload(self):
        first = broker.execute(BODY)
        fresh = module('audit_reloaded_broker', 'deploy/hermes-coding/broker.py')
        with patch.object(fresh, 'DB', broker.DB), patch.object(fresh, 'Path', self.path):
            self.assertEqual(fresh.execute(BODY), first)
        self.assertEqual(self.run.call_count, 1)

    def test_uncertain_timeout_is_not_reexecuted(self):
        self.run.side_effect = subprocess.TimeoutExpired('synthetic-worker', 150)
        first = broker.execute(BODY)
        self.assertEqual(first['error'], 'CODING_EXECUTION_UNCERTAIN_RECONCILE')
        self.assertEqual(broker.execute(BODY), first)
        self.assertEqual(self.run.call_count, 1)

    def test_claimed_job_requires_reconciliation(self):
        import hashlib
        digest = hashlib.sha256(json.dumps(BODY, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        db = sqlite3.connect(broker.DB)
        db.execute('CREATE TABLE jobs(id TEXT PRIMARY KEY,digest TEXT,state TEXT,result TEXT)')
        db.execute('INSERT INTO jobs VALUES(?,?,?,NULL)', (JOB, digest, 'CLAIMED'))
        db.commit(); db.close()
        self.assertEqual(broker.execute(BODY)['error'], 'CODING_IN_PROGRESS_RECONCILE')
        self.run.assert_not_called()

    def test_worker_environment_has_no_ambient_secrets(self):
        broker.execute(BODY)
        self.assertEqual(set(self.run.call_args.kwargs['env']), {'PATH', 'MODAL_CONFIG_PATH'})

    def test_GATE_invalid_artifact_must_not_consume_job_or_launch_worker(self):
        broker.execute({'jobId': JOB, 'artifact': {'files': {'../.env': 'CANARY_ONLY'}}})
        self.run.assert_not_called()
        with sqlite3.connect(broker.DB) as db:
            self.assertEqual(db.execute('SELECT count(*) FROM jobs').fetchone()[0], 0)

    def test_GATE_incomplete_success_receipt_must_be_rejected(self):
        self.run.return_value.stdout = json.dumps({'ok': True, 'receipt': {'complete': False}})
        self.assertIsNot(broker.execute(BODY).get('ok'), True)

    def test_GATE_nonzero_worker_exit_must_not_be_success(self):
        self.run.return_value.returncode = 1
        self.run.return_value.stdout = json.dumps({'ok': True, 'receipt': {'complete': True}})
        self.assertIsNot(broker.execute(BODY).get('ok'), True)

    def test_GATE_completed_receipt_remains_readable_after_policy_closes(self):
        self.run.return_value.stdout = json.dumps({'ok': True, 'receipt': {'complete': True, 'syntheticOnly': True}})
        first = broker.execute(BODY)
        self.policy['enabled'] = False
        self.assertEqual(broker.execute(BODY), first)
        self.assertEqual(self.run.call_count, 1)

class WorkerAudit(unittest.TestCase):
    def fake_modal(self, bad_harness=False):
        stages = []
        class Sandbox:
            def __init__(self):
                self.object_id = 'synthetic-sandbox-' + str(len(stages))
                self.stopped = False
            def exec(self, *args, **kwargs):
                index = len(stages)
                value = {'exitCode': 1 if index == 1 else 0, 'outputHash': '0'*64,
                         'tail': json.dumps({'passed': True, 'assertions': 46})}
                return types.SimpleNamespace(stdout=types.SimpleNamespace(read=lambda: json.dumps(value)),
                    stderr=types.SimpleNamespace(read=lambda: ''), wait=lambda: 1 if bad_harness else 0)
            def terminate(self, **kwargs): self.stopped = True
            def poll(self): return 0 if self.stopped else None
        def create(*args, **kwargs):
            sb = Sandbox(); stages.append((kwargs, sb)); return sb
        image = types.SimpleNamespace(dockerfile_commands=lambda *args: 'SYNTHETIC_IMAGE')
        fake = types.SimpleNamespace(App=types.SimpleNamespace(lookup=lambda *args, **kwargs: 'SYNTHETIC_APP'),
            Image=types.SimpleNamespace(debian_slim=lambda **kwargs: image), Sandbox=types.SimpleNamespace(create=create))
        return fake, stages

    def invoke(self, payload, bad_harness=False):
        fake, stages = self.fake_modal(bad_harness)
        real_path = Path
        class Paths:
            def __new__(cls, name):
                if str(name).startswith('/opt/data/'):
                    return types.SimpleNamespace(read_text=lambda: json.dumps({'cleanup': True,
                        'guest': {'allPassed': True}, 'wallDeadline': {'passed': True}}))
                return real_path(name)
        with tempfile.TemporaryDirectory() as tmp, patch.dict(sys.modules, {'modal': fake}), \
             patch.object(worker, 'Path', Paths), patch.object(worker, 'payload_deadline', return_value=time.time()+90):
            try:
                value = worker.run_job(payload, tmp+'/report.json')
            except Exception:
                self.assertTrue(all(sb.stopped for _, sb in stages))
                raise
        return value, stages

    def test_unapproved_files_rejected_before_create(self):
        for name in ['../.env', '.env', '/etc/passwd', 'package.json', 'clamp.py/../.env']:
            with self.subTest(name=name):
                bad = {**BODY, 'artifact': {**BODY['artifact'], 'files': {name: 'CANARY_ONLY'}}}
                with self.assertRaisesRegex(ValueError, 'ARTIFACT_SCOPE'): self.invoke(bad)

    def test_imports_and_host_effects_rejected(self):
        for source in ['import os\n'+SOURCE, SOURCE+'\nopen("CANARY_ONLY")',
                       SOURCE.replace('min(upper, max(lower, value))', '__import__("os")')]:
            with self.assertRaises(ValueError): worker.validate_source(source)

    def test_empty_and_oversized_source_rejected(self):
        for source in ['', 'x'*4001, None]:
            with self.assertRaises(ValueError): worker.validate_source(source)

    def test_synthetic_sdk_controls_and_fresh_guests(self):
        result, stages = self.invoke(BODY)
        self.assertTrue(result['complete'])
        self.assertEqual(len({s.object_id for _, s in stages}), 3)
        for kwargs, sb in stages:
            self.assertIs(kwargs['block_network'], True)
            self.assertEqual(kwargs['secrets'], [])
            self.assertEqual(kwargs['volumes'], {})
            self.assertEqual(kwargs['network_file_systems'], {})
            self.assertEqual(kwargs['env'], {})
            self.assertIs(kwargs['include_oidc_identity_token'], False)
            self.assertEqual(kwargs['cpu'], (.5, .5))
            self.assertEqual(kwargs['memory'], (1024, 1024))
            self.assertEqual(kwargs['timeout'], 90)
            self.assertTrue(sb.stopped)

    def test_harness_failure_terminates_guest(self):
        with self.assertRaisesRegex(ValueError, 'SANDBOX_HARNESS_FAILED'):
            self.invoke(BODY, bad_harness=True)

if __name__ == '__main__': unittest.main()
