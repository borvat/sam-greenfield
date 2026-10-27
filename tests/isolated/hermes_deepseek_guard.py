import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
from types import SimpleNamespace as NS
from typing import Any
import unittest
from unittest.mock import patch as mock_patch

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('native_guard',ROOT/'scripts/hermes-deepseek-guard.py')
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
SOURCE=Path(os.environ['HERMES_DEEPSEEK_SOURCE']).read_text()


def harness(provider='deepseek'):
    calls=[]
    sdk=NS(max_retries=0,chat=NS(completions=NS(create=lambda **kw:calls.append(kw) or 'synthetic')))
    agent=NS(provider=provider,session_id='sam_00000000-0000-4000-8000-000000000001',base_url='https://synthetic.invalid',
             _create_request_openai_client=lambda **kw:sdk,_touch_activity=lambda _:None)
    tree=ast.parse(guard.patch(SOURCE))
    method=next(n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name=='_open_chat_stream')
    ns={'Any':Any,'json':json,'is_native_gemini_base_url':lambda _:False,'time':NS(time=lambda:0),'bypass_chat_sdk_request_transform':lambda kw,c:kw}
    exec(compile(ast.fix_missing_locations(ast.Module(body=[method],type_ignores=[])),'native_guard_test','exec'),ns)
    owner=NS(agent=agent,clients=NS(set_client=lambda c:c),last_chunk_time={})
    return lambda kw:ns['_open_chat_stream'](owner,kw),agent,sdk,calls


def diagnostic_harness(provider='deepseek',session_id='sam_00000000-0000-4000-8000-000000000001'):
    calls=[]
    error=RuntimeError('original streaming failure');error.status_code=500
    def probe(agent,kwargs):
        calls.append(kwargs)
        raise error
    agent=NS(provider=provider,session_id=session_id,api_mode='chat_completions',
             _stream_5xx_probe_ts=None,_is_provider_stream_parse_error=lambda e:False)
    tree=ast.parse(guard.patch(SOURCE))
    methods=[n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name in
             ('_handle_stream_error','_unmask_server_error_with_nonstreaming')]
    ns={'json':json,'time':NS(monotonic=lambda:100),'interruptible_api_call':probe,
        '_streams_llamacpp':lambda a:False,'_extract_status_code':lambda e:getattr(e,'status_code',None),
        '_anthropic_connection_error_types':lambda:(),'_is_sse_connection_error':lambda e:False,
        '_rejects_stream_options':lambda e:False,'EmptyStreamError':type('EmptyStreamError',(Exception,),{}),
        '_STREAM_5XX_PROBE_WINDOW_S':60,'logger':NS(debug=lambda *a:None,exception=lambda *a:None,info=lambda *a:None)}
    exec(compile(ast.fix_missing_locations(ast.Module(body=methods,type_ignores=[])),'native_guard_test','exec'),ns)
    owner=NS(agent=agent,result={'error':None},deltas_were_sent={'yes':False},
             _request_cancelled={'value':False},api_kwargs={'model':'deepseek-flash','stream':True},
             _stream_stale_timeout=30,_maybe_disable_streaming=lambda e:None)
    owner._unmask_server_error_with_nonstreaming=lambda e:ns['_unmask_server_error_with_nonstreaming'](owner,e)
    def run():
        httpx=NS(**{name:type(name,(Exception,),{}) for name in
                    ('ReadTimeout','ConnectTimeout','PoolTimeout','ConnectError','ReadError','RemoteProtocolError')})
        with mock_patch.dict('sys.modules',{'httpx':httpx}):
            return ns['_handle_stream_error'](owner,error,2,2)
    return run,owner,error,calls


def nonstream_harness(provider='deepseek',session_id='sam_00000000-0000-4000-8000-000000000001'):
    calls=[]
    agent=NS(provider=provider,session_id=session_id,api_mode='chat_completions')
    tree=ast.parse(guard.patch(SOURCE))
    method=next(n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name=='_dispatch_nonstreaming_api_request')
    ns={'bypass_chat_sdk_request_transform':lambda kw,c:kw,
        '_chat_completion_capturing_headers':lambda a,c,kw:calls.append('wire') or 'synthetic'}
    exec(compile(ast.fix_missing_locations(ast.Module(body=[method],type_ignores=[])),'native_guard_test','exec'),ns)
    def make_client(*a,**kw):
        calls.append('client')
        return NS()
    return lambda:ns['_dispatch_nonstreaming_api_request'](agent,{'model':'deepseek-flash'},make_client=make_client),calls


class NativeGuard(unittest.TestCase):
    def test_shared_direct_and_interruptible_nonstream_dispatch_fails_before_client(self):
        run,calls=nonstream_harness()
        with self.assertRaisesRegex(RuntimeError,'NONSTREAM_DENIED'):
            run()
        self.assertEqual(calls,[])

    def test_nonstream_dispatch_unchanged_outside_exact_sam_deepseek_scope(self):
        for provider,session in (('nous','sam_00000000-0000-4000-8000-000000000001'),
                                 ('deepseek','ordinary_session'),('deepseek','sam_not_uuid')):
            with self.subTest(provider=provider,session=session):
                run,calls=nonstream_harness(provider,session)
                self.assertEqual(run(),'synthetic')
                self.assertEqual(calls,['client','wire'])

    def test_exhausted_stream_5xx_preserves_error_without_nonstream_probe(self):
        run,owner,error,calls=diagnostic_harness()
        self.assertIs(run(),False)
        self.assertEqual(calls,[])
        self.assertIs(owner.result['error'],error)
        self.assertIsNone(owner.agent._stream_5xx_probe_ts)

    def test_nonstream_diagnostic_unchanged_outside_exact_sam_deepseek_scope(self):
        for provider,session in (('nous','sam_00000000-0000-4000-8000-000000000001'),
                                 ('deepseek','ordinary_session'),('deepseek','sam_not_uuid')):
            with self.subTest(provider=provider,session=session):
                run,owner,error,calls=diagnostic_harness(provider,session)
                self.assertIs(run(),False)
                self.assertEqual(len(calls),1)
                self.assertIs(owner.result['error'],error)

    def test_only_exact_zero_sdk_retries_allowed_before_request(self):
        for retries in (1,2,3,-1,True,False,None,'0',0.0):
            with self.subTest(max_retries=repr(retries)):
                run,agent,sdk,calls=harness()
                sdk.max_retries=retries
                with self.assertRaisesRegex(RuntimeError,'ATTEMPT_CEILING'):
                    run({'model':'deepseek-flash'})
                self.assertEqual(calls,[])
                self.assertIs(sdk.max_retries,retries)
                self.assertFalse(getattr(agent,'_sam_deepseek_wire_claimed',False))
        run,agent,sdk,calls=harness()
        del sdk.max_retries
        with self.assertRaisesRegex(RuntimeError,'ATTEMPT_CEILING'):
            run({'model':'deepseek-flash'})
        self.assertEqual(calls,[])
        self.assertFalse(hasattr(sdk,'max_retries'))

    def test_direct_bounded_request_no_extra_sdk_operation(self):
        run,agent,sdk,calls=harness()
        self.assertEqual(run({'model':'deepseek-flash','messages':[{'role':'user','content':'synthetic'}]}),'synthetic')
        self.assertEqual(calls[0]['max_tokens'],2048)
        self.assertEqual(calls[0]['extra_body']['thinking'],{'type':'disabled'})
        with self.assertRaisesRegex(RuntimeError,'ATTEMPT_CEILING'):
            run({'model':'deepseek-flash'})
        self.assertEqual(len(calls),1)

    def test_invalid_identity_tools_input_and_sdk_retry_ceiling_fail_before_request(self):
        for kw,mutate in [({'model':'other'},lambda a,s:None),({'model':'deepseek-flash','tools':[{}]},lambda a,s:None),
                          ({'model':'deepseek-flash','messages':['x'*90001]},lambda a,s:None),
                          ({'model':'deepseek-flash'},lambda a,s:setattr(s,'max_retries',3))]:
            run,a,s,calls=harness();mutate(a,s)
            with self.assertRaises(RuntimeError):run(kw)
            self.assertEqual(calls,[])

    def test_actual_finish_join_hash_preserves_decoded_content(self):
        from hermes_deepseek_json import Log
        log=Log()
        tree=ast.parse(guard.patch(SOURCE))
        method=next(n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name=='_finish_chat_stream')
        ns={'json':json,'logger':log,'SimpleNamespace':NS,
            '_provider_stream_error_from_text':lambda *a,**kw:None,'is_router_timeout_shim':lambda r:False}
        exec(compile(ast.fix_missing_locations(ast.Module(body=[method],type_ignores=[])),'native_finish_test','exec'),ns)
        text='{"summary":"بيانات","observations":[]}'
        for width in (1,7,37):
            owner=NS(agent=NS(),_assemble_tool_calls=lambda *a:(None,False),
                _sam_data_analysis_provenance={'task_id':'synthetic-task','session_id':'synthetic-session','sdk_request_sha256':'a'*64})
            parts=[text[i:i+width] for i in range(0,len(text),width)]
            response=ns['_finish_chat_stream'](owner,None,'assistant',parts,['synthetic reasoning'],{},'stop',
                'deepseek-flash',None,flush_pending=lambda:None,response_id='synthetic-response')
            self.assertEqual(response.choices[0].message.content,text)
            self.assertEqual(log.rows[-1]['decoded_content_sha256'],hashlib.sha256(text.encode()).hexdigest())
            self.assertEqual(log.rows[-1]['finish_reason'],'stop')
        self.assertNotIn(text,json.dumps(log.rows,ensure_ascii=False))

    def test_actual_analysis_wire_uses_json_object(self):
        from hermes_deepseek_json import envelope
        run,_,_,calls=harness()
        run({'model':'deepseek-flash','messages':[{'role':'user','content':json.dumps(envelope())}]})
        self.assertEqual(calls[0]['response_format'],{'type':'json_object'})

    def test_pinned_idempotent_patch_preserves_free_path(self):
        changed=guard.patch(SOURCE);self.assertEqual(guard.patch(changed),changed)
        with self.assertRaisesRegex(RuntimeError,'PINNED'):
            guard.patch(SOURCE+'# different installed version\n')
        run,_,_,calls=harness('nous');run({'model':'poolside/laguna-s-2.1:free'})
        self.assertNotIn('max_tokens',calls[0]);self.assertNotIn('extra_body',calls[0])

    def test_incomplete_guard_patch_is_rejected(self):
        changed=guard.patch(SOURCE)
        for insertion in (guard.GUARD,guard.PROBE_GUARD,guard.NONSTREAM_GUARD,guard.FINISH_GUARD):
            with self.subTest(insertion=insertion.splitlines()[0]):
                with self.assertRaisesRegex(RuntimeError,'PINNED'):
                    guard.patch(changed.replace(insertion,'',1))


if __name__=='__main__':unittest.main(verbosity=2)
