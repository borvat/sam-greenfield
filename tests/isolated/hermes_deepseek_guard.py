import ast
import importlib.util
import json
import os
from pathlib import Path
from types import SimpleNamespace as NS
from typing import Any
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('native_guard',ROOT/'scripts/hermes-deepseek-guard.py')
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
SOURCE=Path(os.environ['HERMES_DEEPSEEK_SOURCE']).read_text()


def harness(provider='deepseek'):
    calls=[]
    sdk=NS(max_retries=2,chat=NS(completions=NS(create=lambda **kw:calls.append(kw) or 'synthetic')))
    agent=NS(provider=provider,session_id='sam_00000000-0000-4000-8000-000000000001',base_url='https://synthetic.invalid',
             _create_request_openai_client=lambda **kw:sdk,_touch_activity=lambda _:None)
    tree=ast.parse(guard.patch(SOURCE))
    method=next(n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name=='_open_chat_stream')
    ns={'Any':Any,'json':json,'is_native_gemini_base_url':lambda _:False,'time':NS(time=lambda:0),'bypass_chat_sdk_request_transform':lambda kw,c:kw}
    exec(compile(ast.fix_missing_locations(ast.Module(body=[method],type_ignores=[])),'native_guard_test','exec'),ns)
    owner=NS(agent=agent,clients=NS(set_client=lambda c:c),last_chunk_time={})
    return lambda kw:ns['_open_chat_stream'](owner,kw),agent,sdk,calls


class NativeGuard(unittest.TestCase):
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

    def test_pinned_idempotent_patch_preserves_free_path(self):
        changed=guard.patch(SOURCE);self.assertEqual(guard.patch(changed),changed)
        with self.assertRaisesRegex(RuntimeError,'PINNED'):
            guard.patch(SOURCE+'# different installed version\n')
        run,_,_,calls=harness('nous');run({'model':'poolside/laguna-s-2.1:free'})
        self.assertNotIn('max_tokens',calls[0]);self.assertNotIn('extra_body',calls[0])


if __name__=='__main__':unittest.main(verbosity=2)
