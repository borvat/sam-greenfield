"""Local policy/journal tests only. No SDK, remote guest or live acceptance."""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
DEPLOY = ROOT / 'deploy/hermes-coding'
sys.path.insert(0, str(DEPLOY))
import real_project_policy as policy
import real_ui_profile as profile
from real_ui_journal import Journal

JOB = '00000000-0000-4000-8000-000000000001'
DIGEST = 'a' * 64


class Transfer(unittest.TestCase):
    def setUp(self):
        self.base = (ROOT / policy.PATH).read_text()
        # Deliberately not a real repair: these canary labels fail the immutable
        # UI verifier's loading expectations. Never written into the real source.
        source = self.base.replace(policy.ANCHOR, policy.ANCHOR +
            "  document.getElementById('finalReport').textContent='CANARY_REPORT';\n" +
            "  document.getElementById('timeline').textContent='CANARY_EVIDENCE';\n")
        self.body = {'jobId': JOB, 'repository': policy.REPOSITORY,
                     'base': policy.BASE, 'files': {policy.PATH: source}}
        self.verifier = (ROOT / 'tests/isolated/hermes_real_ui_acceptance.cjs').read_text()

    def test_only_exact_two_controller_owned_guest_files_no_dependencies(self):
        r = profile.transfer_packet(self.body, self.base, self.verifier)
        self.assertEqual(set(r['files']), {'ui.ts', 'sam-verifier.cjs'})
        self.assertEqual(r['dependencies'], [])
        self.assertFalse(r['dispatchEnabled'])
        self.assertEqual(r['verifierSha256'], profile.VERIFIER_SHA256)

    def test_secret_files_dependencies_commands_and_modified_verifier_are_denied(self):
        for key in ['.env', '../secrets', '/etc/passwd', 'package.json']:
            body = copy.deepcopy(self.body);body['files'][key] = 'SYNTHETIC_CANARY'
            with self.assertRaises(ValueError):profile.transfer_packet(body, self.base, self.verifier)
        for extra in [{'env': {}}, {'dependencies': []}, {'command': 'npm install'}]:
            with self.assertRaises(ValueError):profile.transfer_packet({**self.body, **extra}, self.base, self.verifier)
        with self.assertRaises(ValueError):profile.transfer_packet(self.body, self.base, self.verifier + '\n')

    def test_resource_network_identity_and_mounts_are_fixed(self):
        r = profile.sandbox_options('sam-ui-' + JOB + '-candidate')
        self.assertEqual(r['cpu'], (0.5, 0.5));self.assertEqual(r['memory'], (1024, 1024))
        self.assertEqual(r['timeout'], 90);self.assertTrue(r['block_network'])
        self.assertFalse(r['include_oidc_identity_token'])
        for key in ['env', 'secrets', 'volumes', 'network_file_systems', 'encrypted_ports', 'unencrypted_ports', 'h2_ports']:self.assertFalse(r[key])
        for name in ['main', 'sam-ui-' + JOB + '-shell', '../secrets', 'sam-ui-' + '-'*36 + '-candidate']:
            with self.assertRaises(ValueError):profile.sandbox_options(name)

    def test_image_tags_incomplete_receipts_and_truthy_nonbooleans_are_denied(self):
        r = {'kind': 'REAL_UI_LIVE_IMAGE_ACCEPTANCE', 'imageId': 'im-SyntheticOnly',
             'recipeSha256': DIGEST, 'nodeVersion': profile.NODE_VERSION,
             'nodeArchiveSha256': profile.NODE_ARCHIVE_SHA256,
             'verifierSha256': profile.VERIFIER_SHA256, 'networkIsolationPassed': True,
             'secretIsolationPassed': True, 'resourceLimitsPassed': True,
             'controllerDeathPassed': True, 'cleanupConfirmed': True}
        self.assertEqual(profile.image_admission(r, DIGEST), 'im-SyntheticOnly')
        for key, value in [('imageId', 'node:latest'), ('nodeVersion', 'latest'),
                           ('controllerDeathPassed', 1), ('cleanupConfirmed', False),
                           ('verifierSha256', 'b' * 64), ('recipeSha256', 'c' * 64)]:
            with self.assertRaises(ValueError):profile.image_admission({**r, key: value}, DIGEST)
        del r['secretIsolationPassed']
        with self.assertRaises(ValueError):profile.image_admission(r, DIGEST)

    def test_symlink_and_world_readable_operator_files_are_denied(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)/'data';p.write_bytes(b'CANARY');p.chmod(0o644)
            with self.assertRaises(ValueError):profile.private_bytes(p, 64)
            p.chmod(0o600);self.assertEqual(profile.private_bytes(p,64),b'CANARY')
            link = Path(d)/'link';link.symlink_to(p)
            with self.assertRaises(OSError):profile.private_bytes(link,64)


class Durability(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.temp.name)/'journal.sqlite')
        self.j = Journal(self.path)

    def tearDown(self):
        self.j.close();self.temp.cleanup()

    def test_uncertain_intent_survives_abrupt_controller_process_exit_without_retry(self):
        self.j.close()
        code = "import sys,os;sys.path.insert(0,sys.argv[1]);from real_ui_journal import Journal;j=Journal(sys.argv[2]);j.claim(sys.argv[3],sys.argv[4]);j.intend(sys.argv[3],'candidate');os._exit(23)"
        r = subprocess.run([sys.executable, '-c', code, str(DEPLOY), self.path, JOB, DIGEST], capture_output=True, env={'PATH':'/usr/bin:/bin'})
        self.assertEqual(r.returncode, 23)
        self.j = Journal(self.path)
        self.assertEqual(self.j.pending()[0][2], 'sam-ui-' + JOB + '-candidate')
        self.assertEqual(self.j.pending()[0][-1], 'INTENT')
        with self.assertRaisesRegex(ValueError, 'RECONCILE'):self.j.claim(JOB, DIGEST)
        with self.assertRaisesRegex(ValueError, 'RECONCILE'):self.j.intend(JOB, 'candidate')

    def test_acceptance_requires_both_distinct_guest_cleanups(self):
        self.j.claim(JOB, DIGEST)
        with self.assertRaisesRegex(ValueError, 'CLEANUP'):self.j.accept(JOB, {'jobId':JOB,'complete':True})
        name = self.j.intend(JOB, 'candidate')
        with self.assertRaisesRegex(ValueError, 'ORDER'):self.j.intend(JOB, 'independent')
        self.j.attached(name, 'sb-Candidate')
        with self.assertRaisesRegex(ValueError, 'UNCONFIRMED'):self.j.cleaned(name, 'sb-Candidate', None)
        with self.assertRaisesRegex(ValueError, 'RECONCILE'):self.j.cleaned(name, 'sb-Other', 137)
        self.j.cleaned(name, 'sb-Candidate', 137)
        name = self.j.intend(JOB, 'independent')
        with self.assertRaisesRegex(ValueError, 'REUSE'):self.j.attached(name, 'sb-Candidate')
        self.j.attached(name, 'sb-Independent');self.j.cleaned(name, 'sb-Independent', 137)
        self.j.accept(JOB, {'jobId':JOB,'complete':True,'syntheticOnly':True})

    def test_accepted_receipt_reads_after_reopen_without_new_guest_intent(self):
        self.j.claim(JOB,DIGEST)
        for stage,sid in [('candidate','sb-Candidate'),('independent','sb-Independent')]:
            n=self.j.intend(JOB,stage);self.j.attached(n,sid);self.j.cleaned(n,sid,137)
        result={'jobId':JOB,'complete':True,'syntheticOnly':True};self.j.accept(JOB,result)
        self.j.close();self.j=Journal(self.path)
        self.assertEqual(self.j.claim(JOB,DIGEST),result);self.assertEqual(self.j.pending(),[])
        with self.assertRaisesRegex(ValueError,'CONFLICT'):self.j.claim(JOB,'b'*64)
        with self.assertRaisesRegex(ValueError,'CEILING'):self.j.claim('00000000-0000-4000-8000-000000000002',DIGEST)

    def test_journal_rejects_symlink_and_insecure_directory(self):
        p=Path(self.temp.name)/'link';p.symlink_to(self.path)
        with self.assertRaises(OSError):Journal(p)
        with tempfile.TemporaryDirectory() as other:
            os.chmod(other,0o755)
            with self.assertRaisesRegex(ValueError,'DIRECTORY'):Journal(Path(other)/'j.sqlite')


if __name__ == '__main__':unittest.main()
