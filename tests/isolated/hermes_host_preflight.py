"""Synthetic readiness-race regression; no network, credentials or Modal calls."""
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
import tempfile
import io
import sys
import types
from contextlib import redirect_stdout
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('preflight',Path(__file__).resolve().parents[2]/'deploy/hermes-coding/read_only_host_preflight.py')
preflight=importlib.util.module_from_spec(spec);spec.loader.exec_module(preflight)

class HostPreflight(unittest.TestCase):
    def test_auth_diagnostic_never_prints_exception_or_config_values(self):
        secret='SYNTHETIC_SECRET_NEVER_LOG'
        class AuthError(Exception):pass
        for message,expected in [('Token missing '+secret,'MISSING_CREDENTIAL'),
                                 ('Invalid token '+secret,'INVALID_CREDENTIAL'),
                                 ('Permission denied '+secret,'ACCESS_DENIED'),
                                 ('Unclassified '+secret,'AUTH_UNCLASSIFIED')]:
            modal=types.ModuleType('modal');config_module=types.ModuleType('modal.config')
            def lookup(*args,**kwargs):
                self.assertEqual(kwargs,{'create_if_missing':False})
                raise AuthError(message)
            modal.App=SimpleNamespace(lookup=lookup)
            config_module.config=SimpleNamespace(get=lambda key:secret)
            output=io.StringIO()
            with patch.dict(sys.modules,{'modal':modal,'modal.config':config_module}), patch('importlib.metadata.version',return_value='1.6.2'), redirect_stdout(output):
                exec(preflight.SDK_CHECK,{})
            self.assertNotIn(secret,output.getvalue())
            result=json.loads(output.getvalue())
            self.assertEqual(result['authFailure'],expected)
            self.assertIs(result['tokenIdConfigured'],True)
            self.assertIs(result['tokenSecretConfigured'],True)

    def test_python_executable_is_not_sdk_readiness(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            calls=[]
            def run(args,**kwargs):
                calls.append(args)
                self.assertEqual(set(kwargs['env']),{'PATH','MODAL_CONFIG_PATH'} if args[-1]==preflight.SDK_CHECK else {'PATH'})
                if args[-1]==preflight.READY_CHECK:
                    return SimpleNamespace(returncode=0 if len(calls)>1 else 1)
                return SimpleNamespace(returncode=0,stdout=json.dumps({'sdk':'1.6.2','readOnlyLookup':'OK','appId':'ap-SYNTHETIC'}))
            with patch.object(preflight,'ROOT',root), patch.object(preflight,'SDK',root/'python'), patch.object(Path,'is_file',return_value=True), patch.object(preflight.subprocess,'run',side_effect=run), patch.object(preflight.time,'sleep'):
                preflight.inspect()
            report=json.loads((root/preflight.REPORT).read_text())
            self.assertTrue(report['sdkImportReady'])
            self.assertEqual(report['modalReadOnly']['readOnlyLookup'],'OK')
            self.assertEqual(len(calls),3)
            self.assertEqual(report['guestCreations'],0)
            self.assertEqual(report['modelCalls'],0)
            self.assertEqual((root/preflight.REPORT).stat().st_mode&0o777,0o600)

    def test_completed_preflight_is_not_dispatched_after_restart(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);root.chmod(0o700)
            (root/preflight.REPORT).write_text('{}')
            with patch.object(preflight,'ROOT',root), patch.object(preflight.os,'getuid',return_value=0), patch.object(preflight.subprocess,'Popen') as spawn:
                preflight.main()
                spawn.assert_not_called()

if __name__=='__main__':unittest.main()
