"""Pinned Hermes 0.22.5 compatibility fix, no model or tool invocation.

Runs' canonical admission drops the existing confirmed session model lock.
Carry it into the existing runtime settlement check; never fabricate telemetry.
Refuse any other installed source. Run on each isolated-image start only.
"""
import ast
import asyncio
import hashlib
import json
from pathlib import Path
from types import SimpleNamespace

SOURCE = 'a9c3b02e51407ca30fc948753149984c0ec75dcc047763cf75a356c1baaba466'
HELPER = '''async def _run_model_lock_kwargs(self, launch):
    kwargs = dict(launch.agent_kwargs)
    session, error = await self._get_existing_session_or_404(launch.session_id)
    lock = None if error else self._runtime_request_from_persisted_session_lock(session, {})
    if not lock:
        return kwargs
    requested = lock['requested']
    for key in ('provider', 'model'):
        selected = requested.get(key)
        explicit = kwargs.get('requested_' + key)
        if explicit and explicit != selected:
            raise RuntimeError('confirmed session model lock conflicts with run request')
        kwargs['requested_' + key] = selected
    kwargs.update(confirmed_runtime_lock=True, requested_runtime=requested,
                  route_source=lock['route_source'])
    return kwargs


'''

async def self_test():
    namespace = {}
    exec(compile(HELPER, '<native-lock-helper-test>', 'exec'), namespace)
    helper = namespace['_run_model_lock_kwargs']
    class Adapter:
        lock = None
        async def _get_existing_session_or_404(self, session_id):
            assert session_id == 'test-session'
            return {}, None
        def _runtime_request_from_persisted_session_lock(self, session, body):
            return self.lock
    adapter = Adapter()
    launch = SimpleNamespace(session_id='test-session', agent_kwargs={'requested_provider':'nous', 'requested_model':'free'})
    assert await helper(adapter, launch) == launch.agent_kwargs
    adapter.lock = {'requested':{'provider':'nous', 'model':'free'}, 'route_source':'session_model_lock'}
    value = await helper(adapter, launch)
    assert value['confirmed_runtime_lock'] is True
    assert value['requested_runtime'] == adapter.lock['requested']
    assert 'confirmed_runtime_lock' not in launch.agent_kwargs
    launch.agent_kwargs['requested_model'] = 'different'
    try:
        await helper(adapter, launch)
    except RuntimeError:
        pass
    else:
        raise AssertionError('conflicting model admitted')

def patch(path):
    data = path.read_text()
    marker = 'async def _admit_run_to_authority('
    old = '**launch.agent_kwargs)'
    new = '**(await _run_model_lock_kwargs(self, launch)))'
    if HELPER in data:
        original = data.replace(HELPER, '', 1).replace(new, old, 1)
        if hashlib.sha256(original.encode()).hexdigest() != SOURCE:
            raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
        ast.parse(data)
        return 'ALREADY_PATCHED'
    if hashlib.sha256(data.encode()).hexdigest() != SOURCE or data.count(marker) != 1 or data.count(old) != 1:
        raise RuntimeError('PINNED_HERMES_SOURCE_REQUIRED')
    changed = data.replace(marker, HELPER + marker, 1).replace(old, new, 1)
    ast.parse(changed)
    backup = Path('/opt/data/sam-native-runs-before-model-lock.py')
    if not backup.exists():
        backup.write_text(data)
        backup.chmod(0o600)
    path.write_text(changed)
    return 'PATCHED'

if __name__ == '__main__':
    asyncio.run(self_test())
    path = Path('/opt/hermes/gateway/platforms/api_server_runs.py')
    status = patch(path)
    print(json.dumps({'status':status, 'sourceSha256':SOURCE,
                      'patchedSha256':hashlib.sha256(path.read_bytes()).hexdigest(), 'modelCalls':0}))
