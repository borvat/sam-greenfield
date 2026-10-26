"""No-cloud controller validation; candidate code is never run on the host."""
import ast
import importlib.util
from pathlib import Path
import unittest
import tempfile,json,time,types
from unittest.mock import patch
p=Path(__file__).resolve().parents[2]/'deploy/hermes-coding/modal_worker.py'
spec=importlib.util.spec_from_file_location('worker',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
bp=p.parent/'broker.py';bs=importlib.util.spec_from_file_location('broker',bp);broker=importlib.util.module_from_spec(bs);bs.loader.exec_module(broker)
class Safety(unittest.TestCase):
 def test_expected_and_wrong_control_are_syntactically_admitted(self):
  self.assertEqual(m.validate_source(m.BROKEN),m.BROKEN)
  self.assertTrue(m.validate_source(m.BROKEN.replace('min(lower, max(upper, value))','min(upper, max(lower, value))')))
 def test_host_effects_and_test_bypass_are_denied_before_cloud_creation(self):
  for source in ['import os\n'+m.BROKEN,m.BROKEN+'\nprint("ok")',m.BROKEN.replace('min(lower, max(upper, value))','__import__("os").system("id")'),m.BROKEN.replace('min(lower, max(upper, value))','open("secret")'),m.BROKEN.replace('min(lower, max(upper, value))','clamp(value, lower, upper)'), '@print("x")\n'+m.BROKEN]:
   with self.subTest(source=source):
    with self.assertRaises(ValueError):m.validate_source(source)
 def test_launcher_is_valid_bounded_guest_code_without_running_it(self):
  text=m.launch_code('print("synthetic")');ast.parse(text)
  self.assertIn('os.setuid(10001)',text);self.assertIn('os.environ.clear()',text);self.assertIn('RLIMIT_NPROC',text)
 def test_durable_broker_claim_prevents_repeat_conflict_and_second_job(self):
  body={'jobId':'00000000-0000-4000-8000-000000000001','artifact':{'files':{'clamp.py':m.BROKEN},'tests':'assert True','action':'run_tests'}}
  policy={'enabled':True,'maxJobs':1,'expiresAtEpoch':time.time()+100}
  with tempfile.TemporaryDirectory() as d,patch.object(broker,'DB',d+'/jobs.sqlite'),patch.object(broker,'Path') as path,patch('subprocess.run') as run:
   path.return_value.read_text.return_value=json.dumps(policy)
   run.return_value=types.SimpleNamespace(returncode=0,stdout=json.dumps({'ok':False,'error':'SYNTHETIC_ONLY'}))
   a=broker.execute(body);self.assertEqual(a,broker.execute(body));self.assertEqual(run.call_count,1)
   self.assertEqual(broker.execute({**body,'artifact':{**body['artifact'],'tests':'assert False'}})['error'],'CODING_ID_CONFLICT')
   self.assertEqual(broker.execute({**body,'jobId':'00000000-0000-4000-8000-000000000002'})['error'],'CODING_TASK_CEILING')
 def test_closed_policy_never_starts_worker(self):
  with patch.object(broker,'Path') as path,patch('subprocess.run') as run:
   path.return_value.read_text.return_value=json.dumps({'enabled':True,'maxJobs':1,'expiresAtEpoch':0})
   # Structural rejection now precedes admission; the expanded suite separately
   # checks a valid request against a closed campaign.
   self.assertEqual(broker.execute({})['error'],'CODING_SCOPE_DENIED');run.assert_not_called()
if __name__=='__main__':unittest.main()

