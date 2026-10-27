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
INSTALLED_SOURCE = '6119b3808fcbcd399393ff9ffb1d553c5f29e007f703b4cad0aa4df55a6906b2'
ANCHOR = '        return request_client.chat.completions.create(**stream_kwargs)'
LEGACY_GUARD = '''        # SAM_DEEPSEEK_WIRE_CEILING_V1 -- native request, no wrapper/proxy.
        if self.agent.provider == "deepseek" and __import__("re").fullmatch(
                r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", str(self.agent.session_id or "")):
            if stream_kwargs.get("model") != "deepseek-flash":
                raise RuntimeError("SAM_DEEPSEEK_MODEL_DENIED")
            if (getattr(self.agent, "_sam_deepseek_wire_claimed", False)
                    or type(getattr(request_client, "max_retries", None)) is not int
                    or request_client.max_retries != 0):
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
PROBE_ANCHOR = '''        if getattr(self.agent, "_interrupt_requested", False):
            return False
        if _streams_llamacpp(self.agent):'''
PROBE_GUARD = '''        # SAM sessions preserve the original failure; no diagnostic model call.
        if self.agent.provider == "deepseek" and __import__("re").fullmatch(
                r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", str(self.agent.session_id or "")):
            return False
'''
NONSTREAM_ANCHOR = '''    if agent.api_mode == "codex_responses":
        return agent._run_codex_stream(api_kwargs, client=make_client("codex_stream_request"),'''
NONSTREAM_GUARD = '''    # SAM DeepSeek requests must use the bounded streaming wire path.
    if agent.provider == "deepseek" and __import__("re").fullmatch(
            r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", str(agent.session_id or "")):
        raise RuntimeError("SAM_DEEPSEEK_NONSTREAM_DENIED")
'''



# The legacy exact preimage remains accepted for controlled offline upgrading.
FORMAT_GUARD = '''            # JSON syntax mode applies only to the exact SAM analysis envelope.
            # This is routing, not authorization or provider schema enforcement.
            analysis = False
            self._sam_data_analysis_provenance = None
            try:
                messages = stream_kwargs.get("messages") or []
                last = messages[-1]
                envelope = json.loads(last["content"]) if last.get("role") == "user" and isinstance(last.get("content"), str) else None
                if (isinstance(envelope, dict)
                        and set(envelope) == {"task_id", "goal_id", "agent_role", "instructions"}
                        and envelope["task_id"] == self.agent.session_id[4:]
                        and __import__("re").fullmatch(r"[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", envelope["goal_id"])
                        and envelope["agent_role"] == "data_analyst"):
                    instructions = json.loads(envelope["instructions"])
                    source = instructions["source"]
                    schema = instructions["outputSchema"]
                    props = schema["properties"]
                    observations = props["observations"]
                    item = observations["items"]
                    analysis = (isinstance(instructions["aggregate"], dict)
                        and __import__("re").fullmatch(r"[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", source["executionId"]) is not None
                        and __import__("re").fullmatch(r"[a-f0-9]{64}", source["sha256"]) is not None
                        and schema.get("type") == "object" and schema.get("additionalProperties") is False
                        and set(schema["required"]) == {"summary", "observations"}
                        and set(props) == {"summary", "observations"}
                        and props["summary"].get("type") == "string" and props["summary"].get("maxLength") == 1800
                        and observations.get("type") == "array" and observations.get("minItems") == 1 and observations.get("maxItems") == 8
                        and item.get("type") == "object" and item.get("additionalProperties") is False
                        and set(item["required"]) == {"reference", "comment"}
                        and set(item["properties"]) == {"reference", "comment"}
                        and item["properties"]["comment"].get("type") == "string" and item["properties"]["comment"].get("maxLength") == 800)
            except (ValueError, TypeError, KeyError, IndexError, AttributeError):
                analysis = False
            if analysis:
                stream_kwargs["response_format"] = {"type": "json_object"}
'''
PROVENANCE_GUARD = '''            # Opt-in hashes describe SDK arguments and joined decoded content,
            # never raw HTTP/SSE bytes. Observation failures cannot change execution.
            if analysis and __import__("os").environ.get("SAM_HERMES_MEASUREMENT_ENABLED") == "1":
                try:
                    request_hash = __import__("hashlib").sha256(json.dumps(
                        body, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")).hexdigest()
                    self._sam_data_analysis_provenance = {"task_id": envelope["task_id"],
                        "session_id": self.agent.session_id, "sdk_request_sha256": request_hash}
                    logger.info("sam_hermes_provenance %s", json.dumps(dict(
                        self._sam_data_analysis_provenance, stage="sdk_request", json_mode=True), separators=(",", ":")))
                except Exception:
                    pass
'''
GUARD = LEGACY_GUARD.replace("            # SDK timeout/transport metadata", FORMAT_GUARD + "            # SDK timeout/transport metadata", 1)
GUARD = GUARD.replace("            self.agent._sam_deepseek_wire_claimed = True\n", PROVENANCE_GUARD + "            self.agent._sam_deepseek_wire_claimed = True\n", 1)
FINISH_ANCHOR = '        full_content = "".join(content_parts) or None'
FINISH_GUARD = '''        # Observe the existing join; no second stream iteration or text repair.
        provenance = getattr(self, "_sam_data_analysis_provenance", None)
        if provenance is not None:
            try:
                logger.info("sam_hermes_provenance %s", json.dumps(dict(provenance,
                    stage="decoded_provider_content", decoded_content_sha256=__import__("hashlib").sha256(
                        (full_content or "").encode("utf-8")).hexdigest(),
                    finish_reason=finish_reason if finish_reason in ("stop", "length", "content_filter", "tool_calls", "function_call") else "other"), separators=(",", ":")))
            except Exception:
                pass
'''


def patch(source: str) -> str:
    digest = hashlib.sha256(source.encode()).hexdigest()
    if digest == INSTALLED_SOURCE:
        if any(source.count(part) != 1 for part in (LEGACY_GUARD, PROBE_GUARD, NONSTREAM_GUARD)):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source.replace(LEGACY_GUARD, '', 1).replace(PROBE_GUARD, '', 1).replace(NONSTREAM_GUARD, '', 1)
    elif digest == SOURCE:
        original = source
    else:
        if any(source.count(part) != 1 for part in (GUARD, PROBE_GUARD, NONSTREAM_GUARD, FINISH_GUARD)):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source.replace(GUARD, '', 1).replace(PROBE_GUARD, '', 1).replace(NONSTREAM_GUARD, '', 1).replace(FINISH_GUARD, '', 1)
        if hashlib.sha256(original.encode()).hexdigest() != SOURCE:
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        return source
    if (hashlib.sha256(original.encode()).hexdigest() != SOURCE
            or any(original.count(anchor) != 1 for anchor in (ANCHOR, PROBE_ANCHOR, NONSTREAM_ANCHOR, FINISH_ANCHOR))):
        raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
    changed = original.replace(ANCHOR, GUARD + ANCHOR, 1)
    changed = changed.replace(PROBE_ANCHOR, PROBE_GUARD + PROBE_ANCHOR, 1)
    changed = changed.replace(NONSTREAM_ANCHOR, NONSTREAM_GUARD + NONSTREAM_ANCHOR, 1)
    changed = changed.replace(FINISH_ANCHOR + '\n', FINISH_ANCHOR + '\n' + FINISH_GUARD, 1)
    ast.parse(changed)
    return changed

if __name__ == '__main__':
    path = Path('/opt/hermes/agent/chat_completion_helpers.py')
    before = path.read_text()
    changed = patch(before)
    path.write_text(changed)
    print(json.dumps({'kind': 'SAM_DEEPSEEK_NATIVE_GUARD', 'sha256': hashlib.sha256(changed.encode()).hexdigest(), 'modelCalls': 0}))
