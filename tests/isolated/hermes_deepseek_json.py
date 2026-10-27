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
        updates=kwargs.pop('wire_updates',{})
        wire=dict(model='deepseek-flash',messages=[dict(role='user',content=json.dumps(envelope() if message is None else message))],**kwargs)
        wire.update(updates)
        result=ns['run'](owner,wire,sdk);calls.append(result);return result
    def finish(parts,reason='stop'):
        body='def finish(self,content_parts,finish_reason):\n'+getattr(guard,'FINISH_ANCHOR','        full_content = "".join(content_parts) or None')+'\n'+getattr(guard,'FINISH_GUARD','')+'        return full_content\n'
        exec(body,ns);return ns['finish'](owner,parts,reason)
    return run,finish,owner,sdk,log,calls


class ScopedJsonGuard(unittest.TestCase):
    def test_bypassed_message_slot_uses_effective_extra_body(self):
        run,_,_,_,_,_=harness()
        messages=[{'role':'user','content':json.dumps(envelope())}]
        wire=run(wire_updates={'messages':[]},extra_body={'messages':messages})
        self.assertEqual(wire['response_format'],{'type':'json_object'})
        self.assertEqual(wire['messages'],[],'Keep the SDK bypass slot unchanged')
        self.assertEqual(wire['extra_body']['messages'],messages)

    def test_effective_body_collisions_cannot_override_safety_gates(self):
        for extra in ({'model':'other'},{'tools':[{'type':'function'}]},{'messages':['x'*90001]}):
            with self.subTest(extraKeys=list(extra)):
                run,_,_,_,_,calls=harness()
                with self.assertRaises(RuntimeError):run(extra_body=extra)
                self.assertEqual(calls,[])
        run,_,_,_,_,_=harness()
        wire=run(extra_body={'max_tokens':9000,'thinking':{'type':'enabled'},'response_format':{'type':'text'}})
        self.assertEqual(wire['max_tokens'],2048);self.assertEqual(wire['extra_body']['max_tokens'],2048)
        self.assertEqual(wire['extra_body']['thinking'],{'type':'disabled'})
        self.assertEqual(wire['extra_body']['response_format'],{'type':'json_object'})

    @patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'1'})
    def test_gate_misses_have_bounded_diagnostics_without_content_or_hashes(self):
        run,_,_,_,log,_=harness();e=envelope();e['agent_role']='programmer'
        wire=run(extra_body={'messages':[{'role':'user','content':json.dumps(e)}]})
        self.assertNotIn('response_format',wire)
        self.assertEqual(len(log.rows),1);gate=log.rows[0]
        self.assertEqual(gate['stage'],'format_gate');self.assertFalse(gate['analyst_role']);self.assertFalse(gate['json_mode'])
        self.assertTrue(gate['task_session_match']);self.assertTrue(gate['envelope_parse'])
        self.assertNotIn('request_body_sha256',gate)
        self.assertNotIn('\"instructions\":',json.dumps(gate))

    def test_exact_analysis_envelope_sets_json_object_before_wire(self):
        run,_,_,sdk,_,calls=harness();wire=run()
        self.assertEqual(wire['response_format'],{'type':'json_object'})
        self.assertEqual(wire['max_tokens'],2048);self.assertEqual(wire['extra_body']['thinking'],{'type':'disabled'})
        self.assertEqual(sdk.max_retries,0);self.assertEqual(len(calls),1)

    @patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'0'})
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
        self.assertEqual(len(log.rows),3)
        self.assertEqual(log.rows[0]['stage'],'format_gate');self.assertTrue(log.rows[0]['json_mode'])
        body={k:v for k,v in wire.items() if k not in ('timeout','extra_headers','extra_query','extra_body')}
        body.update(wire['extra_body'])
        expected=hashlib.sha256(json.dumps(body,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()
        self.assertEqual(log.rows[1]['request_body_sha256'],expected)
        self.assertEqual(log.rows[2]['request_body_sha256'],expected)
        self.assertEqual(log.rows[2]['decoded_content_sha256'],hashlib.sha256(content.encode()).hexdigest())
        self.assertEqual(log.rows[2]['finish_reason'],'stop')
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
