
# SAM one-request measurement. Appended to this EXISTING diagnostic module;
# no transport wrapper, extra request, stream consumption or model configuration.
import json as _sam_json
import os as _sam_os
import re as _sam_re
import uuid as _sam_uuid
import threading as _sam_threading
from datetime import datetime as _sam_datetime, timezone as _sam_timezone

_sam_process_id = str(_sam_uuid.uuid4())
_sam_local = _sam_threading.local()


def _sam_measure_reset():
    try:
        _sam_local.measurement = None
    except Exception:
        pass


def _sam_measure_event(diag, event, status=None, current=False):
    try:
        # Owner-thread context prevents a late old response from acquiring the
        # replacement attempt's identity. Only the interrupt monitor reads the
        # current diagnostic pointer; it runs on a different thread by design.
        m = diag.get('_sam_measurement') if current else getattr(_sam_local, 'measurement', None)
        if not m or event in m['seen']:
            return
        m['seen'].add(event)
        record = dict(event=event, at=_sam_datetime.now(_sam_timezone.utc).isoformat(),
                      elapsed_ms=max(0.0, (time.monotonic() - m['origin']) * 1000),
                      process_id=_sam_process_id, operation_id=m['operation_id'],
                      session_id=m['session_id'], task_id=m['task_id'])
        if event == 'provider_headers' and type(status) is int and 100 <= status <= 599:
            record['http_status'] = status
        elif status in ('closed', 'close_failed', 'exception', 'stop', 'length',
                        'content_filter', 'tool_calls', 'function_call', 'other'):
            record['status'] = status
        logger.info('sam_hermes_measurement %s', _sam_json.dumps(record, separators=(',', ':')))
    except Exception:
        pass  # Diagnostics must not affect admission, execution or cleanup.


def _sam_measure_start(agent, diag):
    try:
        _sam_measure_reset()
        session = getattr(agent, 'session_id', '')
        if (_sam_os.environ.get('SAM_HERMES_MEASUREMENT_ENABLED') != '1'
                or not isinstance(diag, dict) or not isinstance(session, str)
                or not _sam_re.fullmatch(r'sam_[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}', session)):
            return
        diag['_sam_measurement'] = dict(origin=time.monotonic(), operation_id=str(_sam_uuid.uuid4()),
                                        session_id=session, task_id=session[4:], seen=set())
        _sam_local.measurement = diag['_sam_measurement']
        _sam_measure_event(diag, 'provider_request_started')
    except Exception:
        pass


def _sam_measure_chunk(diag, chunk):
    try:
        m = getattr(_sam_local, 'measurement', None)
        if not m or 'provider_first_delta' in m['seen']:
            return
        for choice in getattr(chunk, 'choices', None) or ():
            delta = getattr(choice, 'delta', None)
            # Empty role/heartbeat/usage frames are not model output. Merely
            # inspect the chunk already consumed by Hermes; never next()/peek().
            extra = getattr(delta, 'model_extra', None) or {}
            for name in ('content', 'reasoning_content', 'reasoning', 'refusal', 'tool_calls', 'reasoning_details'):
                value = getattr(delta, name, None) or (extra.get(name) if isinstance(extra, dict) else None)
                if isinstance(value, str) and value:
                    _sam_measure_event(diag, 'provider_first_delta')
                    return
                if isinstance(value, (list, tuple)) and any(
                        isinstance(v, dict) and isinstance(v.get('text'), str) and v['text']
                        or isinstance(getattr(v, 'text', None), str) and v.text for v in value):
                    _sam_measure_event(diag, 'provider_first_delta')
                    return
    except Exception:
        pass
