#!/usr/bin/env python3
"""Offline source packaging only. Never connects to a DB or installs dependencies."""
import hashlib,json,pathlib,subprocess,tarfile,io
HERE=pathlib.Path(__file__).resolve().parent
REPO=pathlib.Path('/workspace/scratch/ca1213daa2e0/sam-rollback')
PINS={'forward':'8a08e6163516f30f37c65313134170744330c4f4','runtime_fallback':'2d4d32e286ff71307417f7375985b85214c7a2e6','cc_mcp_fallback':'0f056d36f98413b7590a405294693c0b5fc18885'}
ROOTS=['apps','packages','vendor','package.json','package-lock.json','tsconfig.json','scripts/release/mcp-oauth.cjs','scripts/release/synthetic-pilot.cjs']
manifest={'classification':'PREPARED_NOT_EXECUTED','databaseTarget':'dpg-dbjpqkutlv9c73dup8lg-a','databaseName':'sam_restore_pr86_20261101_2013','sources':{}}
for name,commit in PINS.items():
 target=HERE/'sources'/name
 if target.exists():raise SystemExit('Refusing to overwrite source directory: '+name)
 target.mkdir(parents=True)
 present=subprocess.check_output(['git','ls-tree','--name-only',commit],cwd=REPO,text=True).splitlines()
 paths=[p for p in ROOTS if p in present or p.startswith('scripts/release/')]
 archive=subprocess.check_output(['git','archive',commit,*paths],cwd=REPO)
 with tarfile.open(fileobj=io.BytesIO(archive)) as tar:tar.extractall(target,filter='data')
 files=[{'path':str(p.relative_to(target)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(target.rglob('*')) if p.is_file()]
 manifest['sources'][name]={'commit':commit,'tree':subprocess.check_output(['git','rev-parse',commit+'^{tree}'],cwd=REPO,text=True).strip(),'files':files}
(HERE/'source-pins.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'prepared':True,'sources':{k:{'commit':v['commit'],'tree':v['tree'],'files':len(v['files'])} for k,v in manifest['sources'].items()},'dbConnections':0}))
