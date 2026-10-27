"""Offline scoped guard tests; real pinned helper is exercised separately.

No native import, SDK, network, model or deployment operation.
"""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
from types import SimpleNamespace as NS
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('guard',ROOT/'scripts/hermes-deepseek-guard.py')
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
TASK='00000000-0000-4000-8000-000000000001'


def envelope():
    return dict(task_id=TASK,goal_id='00000000-0000-4000-8000-000000000002',agent_role='data_analyst',
        instructions=json.dumps(dict(source=dict(executionId='00000000-0000-4000-8000-000000000003',sha256='a'*64),
          aggregate={},outputSchema=dict(type='object',additionalProperties=False,required=['summary','observations'],
            properties=dict(summary=dict(type='string',maxLength=1800),observations=dict(type='array',minItems=1,maxItems=8,
              items=dict(type='object',additionalProperties=False,required=['reference','comment'],properties=dict(reference={},comment=dict(type='string',maxLength=800)))))))))


class Log:
    def __init__(self):self.rows=[];self.fail=False
    def info(self,fmt,value):
        if self.fail:raise RuntimeError('PRIVATE_LOGGER_ERROR')
        self.rows.append(json.loads(value))


def harness():
    log=Log();calls=[]
    owner=NS(agent=NS(provider='deepseek',session_id='sam_'+TASK))
    sdk=NS(max_retries=0)
    ns=dict(json=json,logger=log)
    exec('def run(self,stream_kwargs,request_client):\n'+guard.GUARD+'        return stream_kwargs\n',ns)
    def run(message=None,**kwargs):
        wire=dict(model='deepseek-flash',messages=[dict(role='user',content=json.dumps(envelope() if message is None else message))],**kwargs)
        result=ns['run'](owner,wire,sdk);calls.append(result);return result
    def finish(parts,reason='stop'):
        body='def finish(self,content_parts,finish_reason):\n'+getattr(guard,'FINISH_ANCHOR','        full_content = "".join(content_parts) or None')+'\n'+getattr(guard,'FINISH_GUARD','')+'        return full_content\n'
        exec(body,ns);return ns['finish'](owner,parts,reason)
    return run,finish,owner,sdk,log,calls


class ScopedJsonGuard(unittest.TestCase):
    def test_exact_analysis_envelope_sets_json_object_before_wire(self):
        run,_,_,sdk,_,calls=harness();wire=run()
        self.assertEqual(wire['response_format'],{'type':'json_object'})
        self.assertEqual(wire['max_tokens'],2048);self.assertEqual(wire['extra_body']['thinking'],{'type':'disabled'})
        self.assertEqual(sdk.max_retries,0);self.assertEqual(len(calls),1)

    def test_unrelated_or_invalid_envelopes_do_not_force_json(self):
        mutations=[lambda e:e.update(agent_role='programmer'),lambda e:e.update(task_id='00000000-0000-4000-8000-000000000099'),
          lambda e:e.update(goal_id='not-uuid'),lambda e:e.update(instructions='not JSON'),lambda e:e.update(extra='unknown'),
          lambda e:e.update(instructions=json.dumps({'source':{},'outputSchema':{}})),
          lambda e:e.update(instructions=json.dumps({'source':{'executionId':TASK,'sha256':'bad'},'aggregate':{},'outputSchema':{}}))]
        for change in mutations:
            with self.subTest(change=change):
                run,_,_,_,log,_=harness();e=envelope();change(e)
                wire=run(e);self.assertNotIn('response_format',wire);self.assertEqual(log.rows,[])
        run,_,owner,_,_,_=harness();owner.agent.provider='nous'
        self.assertNotIn('response_format',run())

    @patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'1'})
    def test_hashes_are_passive_and_join_exact_original_content(self):
        run,finish,_,_,log,_=harness();wire=run(timeout=120,extra_headers={'Authorization':'PRIVATE_CREDENTIAL'})
        content='{"summary":"بيانات","observations":[]}'
        self.assertEqual(finish([content[:9],content[9:]]),content)
        self.assertEqual(len(log.rows),2)
        body={k:v for k,v in wire.items() if k not in ('timeout','extra_headers')}
        expected=hashlib.sha256(json.dumps(body,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()
        self.assertEqual(log.rows[0]['sdk_request_sha256'],expected)
        self.assertEqual(log.rows[1]['sdk_request_sha256'],expected)
        self.assertEqual(log.rows[1]['decoded_content_sha256'],hashlib.sha256(content.encode()).hexdigest())
        self.assertEqual(log.rows[1]['finish_reason'],'stop')
        logged=json.dumps(log.rows,ensure_ascii=False)
        for private in ['PRIVATE_',content,'"source"','"messages"']:self.assertNotIn(private,logged)

    @patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'1'})
    def test_logger_failure_does_not_change_request_or_content(self):
        run,finish,_,_,log,_=harness();log.fail=True
        self.assertEqual(run()['response_format'],{'type':'json_object'})
        self.assertEqual(finish([' original ']),' original ')

    @patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'0'})
    def test_diagnostics_are_off_by_default(self):
        run,finish,_,_,log,_=harness();run();finish(['private']);self.assertEqual(log.rows,[])


if __name__=='__main__':unittest.main(verbosity=2)
