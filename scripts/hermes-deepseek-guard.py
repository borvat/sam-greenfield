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


# Byte-exact historical insertions permit only the recorded deployed upgrade.
PREVIOUS_SOURCE = '144737ef9769cf29890653b738d94bac45e4e1e09e1d2260a9a5b26fdeed4531'
PREVIOUS_GUARD = GUARD
PREVIOUS_FINISH_GUARD = FINISH_GUARD
GUARD = '''        # SAM_DEEPSEEK_EFFECTIVE_BODY_V2 -- same native SDK operation and ceilings.
        if self.agent.provider == "deepseek" and __import__("re").fullmatch(
                r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", str(self.agent.session_id or "")):
            # OpenAI merges extra_body AFTER its typed argument transform. Native
            # bypass leaves messages/tools=[] slots and moves their values there.
            extra = dict(stream_kwargs.get("extra_body") or {})
            def _sam_body():
                return {**{k: v for k, v in stream_kwargs.items()
                    if k not in ("timeout", "extra_headers", "extra_query", "extra_body")}, **extra}
            body = _sam_body()
            if body.get("model") != "deepseek-flash":
                raise RuntimeError("SAM_DEEPSEEK_MODEL_DENIED")
            if (getattr(self.agent, "_sam_deepseek_wire_claimed", False)
                    or type(getattr(request_client, "max_retries", None)) is not int
                    or request_client.max_retries != 0):
                raise RuntimeError("SAM_DEEPSEEK_ATTEMPT_CEILING")
            max_tokens = min(int(body.get("max_tokens") or 2048), 2048)
            if max_tokens < 1 or body.get("tools"):
                raise RuntimeError("SAM_DEEPSEEK_SCOPE_DENIED")
            stream_kwargs["max_tokens"] = max_tokens
            if "max_tokens" in extra:
                extra["max_tokens"] = max_tokens
            extra["thinking"] = {"type": "disabled"}
            self._sam_data_analysis_provenance = None
            gate = {"stage": "format_gate", "task_id": self.agent.session_id[4:],
                "session_id": self.agent.session_id, "content_kind": "other",
                "envelope_parse": False, "envelope_shape": False, "task_session_match": False,
                "analyst_role": False, "instructions_parse": False,
                "source_shape": False, "schema_shape": False, "json_mode": False}
            try:
                def _sam_uuid(value):
                    return isinstance(value, str) and __import__("re").fullmatch(
                        r"[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", value) is not None
                messages = body.get("messages") or []
                last = messages[-1]
                content = last.get("content") if last.get("role") == "user" else None
                gate["content_kind"] = "string" if isinstance(content, str) else "parts" if isinstance(content, list) else "other"
                envelope = json.loads(content) if isinstance(content, str) else None
                gate["envelope_parse"] = isinstance(content, str)
                gate["envelope_shape"] = (isinstance(envelope, dict)
                    and set(envelope) == {"task_id", "goal_id", "agent_role", "instructions"}
                    and _sam_uuid(envelope["goal_id"]))
                if isinstance(envelope, dict):
                    gate["task_session_match"] = envelope.get("task_id") == self.agent.session_id[4:]
                    gate["analyst_role"] = envelope.get("agent_role") == "data_analyst"
                if gate["envelope_shape"] and gate["task_session_match"] and gate["analyst_role"]:
                    instructions = json.loads(envelope["instructions"])
                    gate["instructions_parse"] = isinstance(instructions, dict)
                    source = instructions["source"]
                    gate["source_shape"] = (isinstance(instructions["aggregate"], dict)
                        and _sam_uuid(source["executionId"])
                        and isinstance(source["sha256"], str)
                        and __import__("re").fullmatch(r"[a-f0-9]{64}", source["sha256"]) is not None)
                    schema = instructions["outputSchema"]
                    props = schema["properties"]
                    observations = props["observations"]
                    item = observations["items"]
                    gate["schema_shape"] = (schema.get("type") == "object" and schema.get("additionalProperties") is False
                        and set(schema["required"]) == {"summary", "observations"}
                        and set(props) == {"summary", "observations"}
                        and props["summary"].get("type") == "string" and props["summary"].get("maxLength") == 1800
                        and observations.get("type") == "array" and observations.get("minItems") == 1 and observations.get("maxItems") == 8
                        and item.get("type") == "object" and item.get("additionalProperties") is False
                        and set(item["required"]) == {"reference", "comment"}
                        and set(item["properties"]) == {"reference", "comment"}
                        and item["properties"]["comment"].get("type") == "string" and item["properties"]["comment"].get("maxLength") == 800)
                    gate["json_mode"] = gate["source_shape"] and gate["schema_shape"]
            except (ValueError, TypeError, KeyError, IndexError, AttributeError):
                pass
            # Syntax mode is routing, never authorization or schema enforcement.
            if gate["json_mode"]:
                stream_kwargs["response_format"] = {"type": "json_object"}
                if "response_format" in extra:
                    extra["response_format"] = {"type": "json_object"}
            stream_kwargs["extra_body"] = extra
            body = _sam_body()
            if len(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()) > 90000:
                raise RuntimeError("SAM_DEEPSEEK_INPUT_CEILING")
            if __import__("os").environ.get("SAM_HERMES_MEASUREMENT_ENABLED") == "1":
                try:
                    logger.info("sam_hermes_provenance %s", json.dumps(gate, separators=(",", ":")))
                except Exception:
                    pass
                if gate["json_mode"]:
                    try:
                        # Canonical merged JSON body, not raw HTTP bytes or SDK kwargs.
                        digest = __import__("hashlib").sha256(json.dumps(body, ensure_ascii=False,
                            separators=(",", ":"), sort_keys=True).encode("utf-8")).hexdigest()
                        self._sam_data_analysis_provenance = {"task_id": envelope["task_id"],
                            "session_id": self.agent.session_id, "request_body_sha256": digest}
                        logger.info("sam_hermes_provenance %s", json.dumps(dict(
                            self._sam_data_analysis_provenance, stage="request_body", json_mode=True), separators=(",", ":")))
                    except Exception:
                        pass
            self.agent._sam_deepseek_wire_claimed = True
'''
FINISH_GUARD = PREVIOUS_FINISH_GUARD

# Retain the byte-exact deployed effective-body guard as an upgrade preimage.
CURRENT_SOURCE = '746d4a1a26ddc42e35d2b95423c3ccd4db1c50a373fb2812add4ed2713ac814b'
PARTIAL_ERROR_ANCHOR = '    def _handle_stream_error(self, e: Exception, attempt: int, max_retries: int) -> bool:'
PARTIAL_ERROR_CALL_ANCHOR = '''                except Exception as e:
                    self._close_managed_stream()
                    if not self._handle_stream_error(e, _stream_attempt, _max_stream_retries):'''
PARTIAL_ERROR_CALL = PARTIAL_ERROR_CALL_ANCHOR.replace(
    '                    self._close_managed_stream()',
    '                    self._sam_observe_partial_error(e)\n                    self._close_managed_stream()', 1)
PARTIAL_ERROR_GUARD = '''    def _sam_observe_partial_error(self, e):
        # SAM_FIRST_PARTIAL_ERROR_DIAGNOSTIC -- passive, never a retry.
        try:
            _sam_p = getattr(self, "_sam_data_analysis_provenance", None)
            _sam_sid = getattr(self.agent, "session_id", None)
            _sam_re = __import__("re")
            if (not getattr(self, "_sam_first_partial_error_observed", False)
                    and not self._request_cancelled["value"]
                    and self.deltas_were_sent["yes"]
                    and not self.result.get("partial_tool_names")
                    and not self.provider_tool_in_flight["yes"]
                    and self._visible_text_delivered()
                    and self.agent.provider == "deepseek"
                    and __import__("os").environ.get("SAM_HERMES_MEASUREMENT_ENABLED") == "1"
                    and isinstance(_sam_sid, str)
                    and _sam_re.fullmatch(r"sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}", _sam_sid)
                    and type(_sam_p) is dict
                    and _sam_p.get("session_id") == _sam_sid
                    and _sam_p.get("task_id") == _sam_sid[4:]
                    and isinstance(_sam_p.get("request_body_sha256"), str)
                    and _sam_re.fullmatch(r"[a-f0-9]{64}", _sam_p["request_body_sha256"])):
                # Claim before metadata/logger work: failures must not cause duplicates.
                self._sam_first_partial_error_observed = True
                _sam_math = __import__("math")
                def _sam_int(value, ceiling):
                    return min(value, ceiling) if type(value) is int and value >= 0 else None
                def _sam_number(value):
                    try:
                        return value if type(value) in (int, float) and _sam_math.isfinite(value) and value >= 0 else None
                    except (OverflowError, TypeError, ValueError):
                        return None
                def _sam_ms(later, earlier):
                    try:
                        if _sam_number(later) is None or _sam_number(earlier) is None or later < earlier:
                            return None
                        return round(min(later - earlier, 3600) * 1000, 3)
                    except (OverflowError, TypeError, ValueError):
                        return None
                _sam_diag = getattr(self.clients, "diag", None)
                _sam_diag = _sam_diag if type(_sam_diag) is dict else {}
                _sam_types = {
                    "builtins": {"Exception", "OSError", "ConnectionError", "ConnectionResetError", "ConnectionAbortedError", "BrokenPipeError", "TimeoutError", "RuntimeError", "ValueError"},
                    "httpx": {"ReadError", "ReadTimeout", "ConnectError", "ConnectTimeout", "WriteError", "WriteTimeout", "PoolTimeout", "CloseError", "RemoteProtocolError", "LocalProtocolError", "DecodingError", "StreamError", "StreamClosed", "StreamConsumed", "TransportError", "TimeoutException", "HTTPError"},
                    "httpcore": {"ReadError", "ReadTimeout", "ConnectError", "ConnectTimeout", "WriteError", "WriteTimeout", "PoolTimeout", "RemoteProtocolError", "LocalProtocolError", "NetworkError", "TimeoutException", "ProtocolError", "ConnectionNotAvailable"},
                    "openai": {"APIConnectionError", "APITimeoutError", "APIError", "APIStatusError", "InternalServerError", "RateLimitError", "BadRequestError"},
                }
                _sam_files = {"chat_completion_helpers.py", "run_agent.py", "_streaming.py", "_models.py", "default.py", "connection_pool.py", "http11.py", "http2.py", "sync.py", "_sync.py", "_exceptions.py", "_base_client.py", "_response.py", "relay_llm.py", "ssl.py"}
                _sam_functions = {"_call", "_call_wire", "_call_chat_completions", "_with_stream_emitters", "_consume_chat_stream", "_iter_stream_chunks", "__iter__", "__next__", "__stream__", "_iter_events", "iter_bytes", "iter_raw", "_iter_response", "stream", "read", "_read", "_receive_response_body", "_receive_event", "handle_request", "map_exceptions", "map_httpcore_exceptions", "_read_response_body", "_iter_sse_chunks", "decode", "recv", "recv_into"}
                _sam_chain, _sam_stack, _sam_seen = [], [], set()
                _sam_error = e
                while isinstance(_sam_error, BaseException) and id(_sam_error) not in _sam_seen and len(_sam_chain) < 4:
                    _sam_seen.add(id(_sam_error))
                    _sam_kind = type(_sam_error)
                    _sam_module = getattr(_sam_kind, "__module__", "")
                    _sam_module = _sam_module.split(".", 1)[0] if type(_sam_module) is str else "other"
                    _sam_name = getattr(_sam_kind, "__name__", "")
                    if _sam_name not in _sam_types.get(_sam_module, set()):
                        _sam_module, _sam_name = "other", "other"
                    _sam_errno = getattr(_sam_error, "errno", None)
                    _sam_errno = _sam_errno if type(_sam_errno) is int and 0 <= _sam_errno <= 4095 else None
                    _sam_chain.append({"module": _sam_module, "type": _sam_name, "errno": _sam_errno})
                    _sam_tb, _sam_scanned = _sam_error.__traceback__, 0
                    while _sam_tb is not None and _sam_scanned < 32:
                        _sam_code = _sam_tb.tb_frame.f_code
                        _sam_file = __import__("os").path.basename(_sam_code.co_filename)
                        _sam_function = _sam_code.co_name
                        _sam_line = _sam_tb.tb_lineno
                        if (_sam_file in _sam_files and _sam_function in _sam_functions
                                and type(_sam_line) is int and 1 <= _sam_line <= 1000000):
                            _sam_stack.append({"file": _sam_file, "function": _sam_function, "line": _sam_line})
                            _sam_stack = _sam_stack[-8:]
                        _sam_tb, _sam_scanned = _sam_tb.tb_next, _sam_scanned + 1
                    _sam_error = _sam_error.__cause__ or _sam_error.__context__
                # Native diag headers have already been truncated; validate the
                # whole original value instead, never a misleading clipped ID.
                _sam_headers = {}
                try:
                    _sam_raw_headers = getattr(getattr(self, "_attempt_stream_response", None), "headers", None)
                    for _sam_header in ("x-request-id", "cf-ray"):
                        try:
                            _sam_value = _sam_raw_headers.get(_sam_header) if _sam_raw_headers is not None else None
                            if type(_sam_value) is not str or not 1 <= len(_sam_value) <= 128:
                                continue
                            _sam_pattern = (r"(?:[a-fA-F0-9]{16,64}|[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}|req_[A-Za-z0-9]{8,80})"
                                if _sam_header == "x-request-id" else r"[a-fA-F0-9]{16,32}(?:-[A-Za-z]{3})?")
                            if _sam_re.fullmatch(_sam_pattern, _sam_value):
                                _sam_headers[_sam_header] = _sam_value
                        except Exception:
                            pass
                except Exception:
                    pass
                _sam_status = _sam_diag.get("http_status")
                _sam_event = {"stage": "first_partial_stream_error", "task_id": _sam_p["task_id"],
                    "session_id": _sam_sid, "request_body_sha256": _sam_p["request_body_sha256"],
                    "exception_chain": _sam_chain, "stack": _sam_stack,
                    "http_status": _sam_status if type(_sam_status) is int and 100 <= _sam_status <= 599 else None,
                    "headers": _sam_headers, "bytes": _sam_int(_sam_diag.get("bytes"), 1000000000),
                    "chunks": _sam_int(_sam_diag.get("chunks"), 1000000000),
                    "elapsed_ms": _sam_ms(__import__("time").time(), _sam_diag.get("started_at")),
                    "ttfb_ms": _sam_ms(_sam_diag.get("first_chunk_at"), _sam_diag.get("started_at")),
                    "finish_reason_seen": _sam_diag.get("finish_reason_seen") if type(_sam_diag.get("finish_reason_seen")) is bool else None}
                logger.info("sam_hermes_provenance %s", json.dumps(_sam_event, separators=(",", ":"), allow_nan=False), exc_info=False, stack_info=False)
        except Exception:
            # Observation cannot replace the original error or its cleanup.
            pass

'''

def patch(source: str) -> str:
    digest = hashlib.sha256(source.encode()).hexdigest()
    if digest == INSTALLED_SOURCE:
        if any(source.count(part) != 1 for part in (LEGACY_GUARD, PROBE_GUARD, NONSTREAM_GUARD)):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source.replace(LEGACY_GUARD, '', 1).replace(PROBE_GUARD, '', 1).replace(NONSTREAM_GUARD, '', 1)
    elif digest == PREVIOUS_SOURCE:
        parts = (PREVIOUS_GUARD, PROBE_GUARD, NONSTREAM_GUARD, PREVIOUS_FINISH_GUARD)
        if any(source.count(part) != 1 for part in parts):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source
        for part in parts:
            original = original.replace(part, '', 1)
    elif digest == CURRENT_SOURCE:
        parts = (GUARD, PROBE_GUARD, NONSTREAM_GUARD, FINISH_GUARD)
        if any(source.count(part) != 1 for part in parts):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source
        for part in parts:
            original = original.replace(part, '', 1)
    elif digest == SOURCE:
        original = source
    else:
        if any(source.count(part) != 1 for part in (GUARD, PROBE_GUARD, NONSTREAM_GUARD, FINISH_GUARD, PARTIAL_ERROR_GUARD, PARTIAL_ERROR_CALL)):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        original = source.replace(GUARD, '', 1).replace(PROBE_GUARD, '', 1).replace(NONSTREAM_GUARD, '', 1).replace(FINISH_GUARD, '', 1)
        original = original.replace(PARTIAL_ERROR_GUARD, '', 1).replace(PARTIAL_ERROR_CALL, PARTIAL_ERROR_CALL_ANCHOR, 1)
        if hashlib.sha256(original.encode()).hexdigest() != SOURCE:
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        # Exact restoration alone permits relocated insertions. Require the
        # complete canonical postimage, including every observer call location.
        if source != patch(original):
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        return source
    if (hashlib.sha256(original.encode()).hexdigest() != SOURCE
            or any(original.count(anchor) != 1 for anchor in (ANCHOR, PROBE_ANCHOR, NONSTREAM_ANCHOR, FINISH_ANCHOR, PARTIAL_ERROR_ANCHOR, PARTIAL_ERROR_CALL_ANCHOR))):
        raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
    changed = original.replace(ANCHOR, GUARD + ANCHOR, 1)
    changed = changed.replace(PROBE_ANCHOR, PROBE_GUARD + PROBE_ANCHOR, 1)
    changed = changed.replace(NONSTREAM_ANCHOR, NONSTREAM_GUARD + NONSTREAM_ANCHOR, 1)
    changed = changed.replace(FINISH_ANCHOR + '\n', FINISH_ANCHOR + '\n' + FINISH_GUARD, 1)
    changed = changed.replace(PARTIAL_ERROR_ANCHOR, PARTIAL_ERROR_GUARD + PARTIAL_ERROR_ANCHOR, 1)
    changed = changed.replace(PARTIAL_ERROR_CALL_ANCHOR, PARTIAL_ERROR_CALL, 1)
    ast.parse(changed)
    return changed

if __name__ == '__main__':
    path = Path('/opt/hermes/agent/chat_completion_helpers.py')
    before = path.read_text()
    changed = patch(before)
    path.write_text(changed)
    print(json.dumps({'kind': 'SAM_DEEPSEEK_NATIVE_GUARD', 'sha256': hashlib.sha256(changed.encode()).hexdigest(), 'modelCalls': 0}))
