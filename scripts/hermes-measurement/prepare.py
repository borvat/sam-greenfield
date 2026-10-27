"""LOCAL preparation only. Never imports Hermes, starts it or writes its input tree.

Read the exact pinned two-file snapshot; emit an isolated patched copy + diff.
The custom native API/model-lock file is deliberately outside the write set.
"""
import argparse
import ast
import difflib
import hashlib
import json
from pathlib import Path

PINS = {
    'agent/chat_completion_helpers.py': 'd5ac7612af5819891293c4ec182f71a1a9e59f6aa32e98f15266a85fca64e4a8',
    'agent/stream_diag.py': 'c4ca4586560e32d973a46b480b529d38bab07e399e38089c8eb839122e25cef2',
}


def prepare(source, output):
    source, output = Path(source).resolve(), Path(output).resolve()
    if source == output or source in output.parents or output in source.parents:
        raise ValueError('separate isolated output directory required')
    original = {p: (source / p).read_bytes() for p in PINS}
    for p, expected in PINS.items():
        if hashlib.sha256(original[p]).hexdigest() != expected:
            raise ValueError('installed source mismatch: ' + p)
    updated = {p: b.decode() for p, b in original.items()}
    diag = 'agent/stream_diag.py'
    updated[diag] += Path(__file__).with_name('stream_measurement.py.inc').read_text()
    helper = 'agent/chat_completion_helpers.py'
    s = updated[helper]
    replacements = [
        ('logger = logging.getLogger(__name__)',
         'from agent.stream_diag import _sam_measure_start, _sam_measure_event, _sam_measure_chunk, _sam_measure_reset\n\nlogger = logging.getLogger(__name__)'),
        ('    def _new_diag(self) -> dict:\n        diag = self.agent._stream_diag_init()',
         '    def _new_diag(self) -> dict:\n        _sam_measure_reset()\n        diag = self.agent._stream_diag_init()'),
        ('        return request_client.chat.completions.create(**stream_kwargs)',
         '        _sam_measure_start(self.agent, self.clients.diag)\n'
         '        try:\n            return request_client.chat.completions.create(**stream_kwargs)\n'
         '        except Exception as error:\n'
         '            self._quiet(lambda: _sam_measure_event(self.clients.diag, "provider_headers", error.status_code) if type(getattr(error, "status_code", None)) is int else None)\n'
         '            _sam_measure_event(self.clients.diag, "provider_open_failed", "exception")\n            raise'),
        ('    def _chat_stream_created(self, raw_stream: Any) -> None:\n        response = self._attempt_stream_response = getattr(raw_stream, "response", None)',
         '    def _chat_stream_created(self, raw_stream: Any) -> None:\n        response = self._attempt_stream_response = getattr(raw_stream, "response", None)\n'
         '        self._quiet(lambda: _sam_measure_event(self.clients.diag, "provider_headers", getattr(response, "status_code", None)) if response is not None else None)'),
        ('        self.agent._touch_activity("receiving stream response")',
         '        self.agent._touch_activity("receiving stream response")\n        _sam_measure_chunk(diag, chunk)'),
        ('            diag["finish_reason_seen"] = True',
         '            diag["finish_reason_seen"] = True\n'
         '            _sam_measure_event(diag, "provider_finish", finish_reason if finish_reason in ("stop", "length", "content_filter", "tool_calls", "function_call") else "other")'),
        ('                close()\n            except Exception:\n                logger.debug("Managed provider stream cleanup failed", exc_info=True)',
         '                close()\n                _sam_measure_event(self.clients.diag, "provider_stream_closed", "closed")\n'
         '            except Exception:\n                _sam_measure_event(self.clients.diag, "provider_stream_closed", "close_failed")\n'
         '                logger.debug("Managed provider stream cleanup failed", exc_info=True)'),
        ('        # Once per attempt: a stale kill that already counted this attempt wins.',
         '        self._quiet(lambda: _sam_measure_event(self.clients.diag, "provider_cancel_observed", current=True))\n'
         '        # Once per attempt: a stale kill that already counted this attempt wins.'),
    ]
    for old, new in replacements:
        if s.count(old) != 1:
            raise ValueError('ambiguous instrumentation anchor')
        s = s.replace(old, new)
    updated[helper] = s
    manifest = {'image': 'docker.io/nousresearch/hermes-agent@sha256:fd822bae0a61bf023450737edbeaeea5fc6460f17cb4ee240a7e67b306ed63fb',
                'hermesVersion': '0.22.5', 'hermesCommit': 'bf0203a794a07aac3ff764972ab9087baa4e4f4e',
                'sdk': {'openai': '2.24.0', 'httpx': '0.28.1'}, 'before': PINS, 'after': {}}
    diff = []
    for p, text in updated.items():
        ast.parse(text, filename=p)
        dest = output / p
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(text.encode())
        manifest['after'][p] = hashlib.sha256(dest.read_bytes()).hexdigest()
        diff.extend(difflib.unified_diff(original[p].decode().splitlines(True), text.splitlines(True), fromfile='a/' + p, tofile='b/' + p, n=0))
    (output / 'hermes-provider-measurement.patch').write_text(''.join(diff))
    (output / 'measurement-pin.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.source, args.output), indent=2))
