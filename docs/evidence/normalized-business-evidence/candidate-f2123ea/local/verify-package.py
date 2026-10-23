"""Read-only authentication of report artifacts and frozen checkout contents."""
import hashlib, json, pathlib, subprocess, sys
full, source = map(pathlib.Path, sys.argv[1:3])
report = json.loads((full / 'report.json').read_text())
commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
assert report['source']['sha'] == commit
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
for name, digest in report['artifacts'].items():
    assert sha(full / name) == digest, name
manifest = json.loads((full / 'metadata/source-files.json').read_text())
for name, digest in manifest.items():
    assert sha(source / name) == digest, name
assert report['status'] == 'PASS'
assert all(s['status'] == 'PASS' for s in report['steps'])
print(json.dumps({'commit': commit, 'tree': report['source']['tree'], 'reportArtifacts': len(report['artifacts']), 'sourceFiles': len(manifest), 'stages': len(report['steps']), 'status': 'PASS'}))
