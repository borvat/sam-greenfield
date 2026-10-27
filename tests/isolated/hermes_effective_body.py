"""Actual OpenAI SDK/httpx MockTransport contract; no native builder claim.

Requires HERMES_NATIVE_SOURCE at the exact upstream tree and existing SDK deps.
Native AIAgent messagebuilder coverage is a separate full-chain probe.
"""
import hashlib
import json
import os
from pathlib import Path
import socket
import sys
import unittest
from unittest.mock import patch

import httpx
import openai

from hermes_deepseek_json import guard,envelope,harness

NATIVE=Path(os.environ['HERMES_NATIVE_SOURCE'])
assert hashlib.sha256((NATIVE/'agent/chat_completion_helpers.py').read_bytes()).hexdigest()==guard.SOURCE
sys.path.insert(0,str(NATIVE))
from agent.sdk_transform_bypass import bypass_chat_sdk_request_transform


def deny_network(*args,**kwargs):raise AssertionError('OFFLINE_SOCKET_DENIED')


@patch.dict(os.environ,{'SAM_HERMES_MEASUREMENT_ENABLED':'1','HERMES_CODEX_SDK_TRANSFORM':'0'})
class EffectiveSdkBody(unittest.TestCase):
    def exercise(self,extra=None,typed=None):
        seen=[]
        def receive(request):
            seen.append(json.loads(request.content))
            return httpx.Response(200,headers={'content-type':'text/event-stream'},content=b'data: [DONE]\n\n',request=request)
        with patch.object(socket.socket,'connect',deny_network),patch.object(socket,'create_connection',deny_network):
            with openai.OpenAI(api_key='synthetic-no-authority',base_url='https://synthetic.invalid/v1',max_retries=0,
                    http_client=httpx.Client(transport=httpx.MockTransport(receive))) as client:
                initial={'model':'deepseek-flash','messages':[{'role':'user','content':json.dumps(envelope())}],
                    'stream':True,'tools':[],**(typed or {}),'extra_body':extra or {}}
                bypassed=bypass_chat_sdk_request_transform(initial,client)
                run,_,_,_,log,_=harness()
                final=run(wire_updates=bypassed)
                response=client.chat.completions.create(**final);response.close()
        self.assertEqual(len(seen),1)
        request_events=[r for r in log.rows if r['stage']=='request_body']
        self.assertEqual(len(request_events),1)
        expected=hashlib.sha256(json.dumps(seen[0],ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()
        self.assertEqual(request_events[0]['request_body_sha256'],expected,'Hash the actual final HTTP JSON body')
        self.assertEqual(seen[0]['model'],'deepseek-flash');self.assertEqual(seen[0]['max_tokens'],2048)
        self.assertFalse(seen[0].get('tools'));self.assertEqual(seen[0]['thinking'],{'type':'disabled'})
        self.assertEqual(seen[0]['response_format'],{'type':'json_object'})
        return seen[0]

    def test_native_bypass_and_real_sdk_preserve_conversation_and_hash(self):
        self.assertEqual(self.exercise()['messages'][0]['role'],'user')

    def test_extra_body_nested_overrides_follow_actual_sdk_merge(self):
        body=self.exercise({'stream_options':{'include_usage':False}},typed={'stream_options':{'include_usage':True,'other':'synthetic'}})
        self.assertEqual(body['stream_options'],{'include_usage':False})

    def test_actual_wire_safety_overrides_cannot_escape_bounds(self):
        body=self.exercise({'max_tokens':9000,'thinking':{'type':'enabled'},'response_format':{'type':'text'}})
        self.assertEqual(body['max_tokens'],2048)

    def test_effective_model_and_tools_are_denied_before_real_sdk(self):
        for extra,reason in (({'model':'other'},'MODEL_DENIED'),({'tools':[{'type':'function'}]},'SCOPE_DENIED')):
            with self.subTest(reason=reason):
                with self.assertRaisesRegex(RuntimeError,reason):self.exercise(extra)

    def test_sdk_bypass_escape_hatch_keeps_same_json_mode_and_hash(self):
        with patch.dict(os.environ,{'HERMES_CODEX_SDK_TRANSFORM':'1'}):self.exercise()


if __name__=='__main__':unittest.main(verbosity=2)
