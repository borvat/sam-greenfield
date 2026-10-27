"""Pinned native DeepSeek wire ceiling. No provider/model invocation.

Apply at existing Hermes image startup, after the existing session-lock patch.
Only SAM UUID sessions on the approved direct provider are affected. This is
not the optional timing patch; that remains unapplied.
"""
import ast
import hashlib
import json
from pathlib import Path

SOURCE = 'd5ac7612af5819891293c4ec182f71a1a9e59f6aa32e98f15266a85fca64e4a8'
ANCHOR = '        return request_client.chat.completions.create(**stream_kwargs)'
GUARD = '''        # SAM_DEEPSEEK_WIRE_CEILING_V1 -- native request, no wrapper/proxy.
        if self.agent.provider == "deepseek" and __import__("re").fullmatch(
                r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", str(self.agent.session_id or "")):
            if stream_kwargs.get("model") != "deepseek-flash":
                raise RuntimeError("SAM_DEEPSEEK_MODEL_DENIED")
            if (getattr(self.agent, "_sam_deepseek_wire_claimed", False)
                    or type(getattr(request_client, "max_retries", None)) is not int
                    or not 0 <= request_client.max_retries <= 2):
                raise RuntimeError("SAM_DEEPSEEK_ATTEMPT_CEILING")
            stream_kwargs["max_tokens"] = min(int(stream_kwargs.get("max_tokens") or 2048), 2048)
            if stream_kwargs["max_tokens"] < 1 or stream_kwargs.get("tools"):
                raise RuntimeError("SAM_DEEPSEEK_SCOPE_DENIED")
            extra = dict(stream_kwargs.get("extra_body") or {})
            extra["thinking"] = {"type": "disabled"}
            stream_kwargs["extra_body"] = extra
            # SDK timeout/transport metadata is not part of the tokenized body.
            body = {k: v for k, v in stream_kwargs.items() if k not in ("timeout", "extra_headers")}
            if len(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()) > 90000:
                raise RuntimeError("SAM_DEEPSEEK_INPUT_CEILING")
            self.agent._sam_deepseek_wire_claimed = True
'''


def patch(source: str) -> str:
    if GUARD in source:
        original = source.replace(GUARD, '', 1)
        if hashlib.sha256(original.encode()).hexdigest() != SOURCE:
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        return source
    if hashlib.sha256(source.encode()).hexdigest() != SOURCE or source.count(ANCHOR) != 1:
        raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
    changed = source.replace(ANCHOR, GUARD + ANCHOR, 1)
    ast.parse(changed)
    return changed


if __name__ == '__main__':
    path = Path('/opt/hermes/agent/chat_completion_helpers.py')
    before = path.read_text()
    changed = patch(before)
    path.write_text(changed)
    print(json.dumps({'kind': 'SAM_DEEPSEEK_NATIVE_GUARD', 'sha256': hashlib.sha256(changed.encode()).hexdigest(), 'modelCalls': 0}))
