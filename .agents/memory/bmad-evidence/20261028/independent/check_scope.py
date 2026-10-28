"""Read-only independent SAM wiring and original-scope checks."""
import hashlib
import json
from pathlib import Path

ROOT = Path('/workspace/scratch/c261a0b3e58a/sam-final')
EVIDENCE = Path('/workspace/scratch/c261a0b3e58a/final-evidence/sam')
MANIFEST = ROOT / '_bmad/render/bmad-build/sam-final-a492d6b961ea/4ce3878288680765f791/manifest.json'

def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

snapshot = json.loads((EVIDENCE / 'source-snapshot.json').read_text())
integrity = json.loads((EVIDENCE / 'scope-integrity.json').read_text())
tree = json.loads((EVIDENCE / 'tree.json').read_text())
branch = json.loads((EVIDENCE / 'branch.json').read_text())
assert snapshot['commit'] == integrity['base'] == branch['commit']['sha']
assert snapshot['tree'] == tree['sha'] == branch['commit']['commit']['tree']['sha']
tree_blobs = {x['path']: x['sha'] for x in tree['tree'] if x['type'] == 'blob'}
by_path = {x['path']: x for x in snapshot['files']}
for record in snapshot['files']:
    data = record['content'].encode('utf-8')
    assert blob(data) == record['sha'] == record['tree_sha'] == tree_blobs[record['path']], record['path']
unchanged = []
for record in integrity['runtime_files_unchanged']:
    path = record['path']
    assert blob((ROOT / path).read_bytes()) == record['unchanged_blob'] == by_path[path]['sha'], path
    unchanged.append(path)
all_original_unchanged = []
for record in snapshot['files']:
    path = record['path']
    if path == '.agents/memory/MEMORY.md':
        continue
    assert blob((ROOT / path).read_bytes()) == record['sha'], path
    all_original_unchanged.append(path)

sam_helper = (ROOT / 'tools/agent_learning.py').read_bytes()
accounting_helper = Path('/workspace/scratch/c261a0b3e58a/accounting-final/tools/agent_learning.py').read_bytes()
expected_blob = 'a16204a51da6619f7634e32dbbdf151152ce11e1'
assert blob(accounting_helper) == expected_blob
old = b'LEDGER = ROOT / "docs/agent-learning/lessons.jsonl"'
new = b'LEDGER = ROOT / ".agents/memory/engineering-lessons.jsonl"'
assert sam_helper.count(new) == 1 and accounting_helper.count(old) == 1
normalized = sam_helper.replace(new, old)
assert normalized == accounting_helper and blob(normalized) == expected_blob
assert (ROOT / '.agents/memory/engineering-lessons.jsonl').read_bytes() == b''

manifest = json.loads(MANIFEST.read_text())
resolved = manifest['inputs']['resolved_values']
assert resolved['customization.workflow.persistent_facts'] == ['file:{project-root}/.agents/memory/engineering-learning.md']
assert resolved['customization.workflow.activation_steps_prepend'] == []
append = resolved['customization.workflow.activation_steps_append']
assert len(append) == 1
assert append[0].index('python3 tools/agent_learning.py audit') < append[0].index('python3 tools/agent_learning.py brief --tag engineering --tag sam')
assert '.agents/memory/engineering-lessons.jsonl' in resolved['customization.workflow.on_complete']
assert 'docs/agent-learning/lessons.jsonl' not in str(resolved)
assert '.agents/memory/MEMORY.md' not in str(resolved)
skill = Path(manifest['inputs']['skill_root'])
for name, expected in manifest['inputs']['source_sha256'].items():
    assert hashlib.sha256((skill / name).read_bytes()).hexdigest() == expected, name
assert hashlib.sha256((ROOT / '_bmad/scripts/render_skill.py').read_bytes()).hexdigest() == manifest['inputs']['renderer_sha256']
logs = {name: json.loads((EVIDENCE / 'independent' / (name + '.json')).read_text()) for name in ('renderer', 'persistent-policy', 'audit', 'brief')}
for name, log in logs.items():
    assert log['cwd'] == str(ROOT) and log['exit_code'] == 0, name
order = ('renderer', 'persistent-policy', 'audit', 'brief')
for earlier, later in zip(order, order[1:]):
    assert logs[earlier]['end_utc'] <= logs[later]['start_utc'], (earlier, later)
assert logs['audit']['stdout'] == 'VALID lessons=0, verified=0\n'
assert logs['brief']['stdout'] == 'No verified lessons match. UNKNOWN is not PASS.\n'
print(json.dumps({
    'activation': 'PASS: original renderer once, policy then audit then brief; zero approved/no guidance',
    'manifest': str(MANIFEST),
    'base': snapshot['commit'],
    'base_tree': snapshot['tree'],
    'authenticated_snapshot_files_hash_checked': len(snapshot['files']),
    'scope_integrity_runtime_migration_dependency_files_unchanged': len(unchanged),
    'materialized_original_files_unchanged_excluding_authorized_memory_index': len(all_original_unchanged),
    'helper_only_ledger_path_changed': True,
    'normalized_helper_origin_blob': blob(normalized),
    'ledger_bytes': 0,
    'phase5_native_sql_tests': 'NOT_RUN',
}, indent=2))
