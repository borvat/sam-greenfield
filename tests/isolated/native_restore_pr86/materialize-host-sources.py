#!/usr/bin/env python3
"""Reviewed host-only source download/materialization; no DB or dependency execution."""
import hashlib,json,pathlib,urllib.request,urllib.error,tarfile,tempfile,shutil,sys
HERE=pathlib.Path(__file__).resolve().parent
PINS=json.loads((HERE/'source-pins.json').read_text())
MAX=25*1024*1024
EXISTING={'forward':('forward.tar.gz','dd30d0f35e1397d99e47e3efe991f920689fec508ef56336e1c6964d6f86d772'),'runtime_fallback':('runtime-fallback.tar.gz','2a91543df2cfc41ffc50523db220dd4efef04aad22e9a98ae3892913fe21238a'),'cc_mcp_fallback':('surface-fallback.tar.gz','a644ecf9c5c89c603efa893bd7c32be4ab70424f87e10e8c6c03c9d02f3da04b')}
try:
 receipt={'classification':'PINNED_SOURCE_HOST_PREPARATION','sources':{}}
 for name,pin in PINS['sources'].items():
  dest=HERE/'sources'/name
  supplement='--complete-missing-runtime-helpers' in sys.argv
  if dest.exists() and not supplement:raise RuntimeError('REFUSE_EXISTING_SOURCE_DIRECTORY')
  if supplement:
   for row in pin['files']:
    existing=dest/row['path']
    if row['path'] not in ['scripts/release/mcp-oauth.cjs','scripts/release/synthetic-pilot.cjs'] and (not existing.is_file() or hashlib.sha256(existing.read_bytes()).hexdigest()!=row['sha256']):raise RuntimeError('EXISTING_SOURCE_HASH_MISMATCH')
  commit=pin['publishedCommit'];url=f'https://codeload.github.com/borvat/sam-greenfield/tar.gz/{commit}'
  with tempfile.NamedTemporaryFile(suffix='.tar.gz') as archive:
   total=0
   if len(sys.argv)>1:
    filename,digest=EXISTING[name];archivePath=pathlib.Path(sys.argv[1]).resolve()/filename
    if archivePath.stat().st_size>MAX or hashlib.sha256(archivePath.read_bytes()).hexdigest()!=digest:raise RuntimeError('PREVIOUSLY_DOWNLOADED_SOURCE_ARCHIVE_PIN_MISMATCH')
   else:
    request=urllib.request.Request(url,headers={'User-Agent':'sam-native-source-preparation'})
    with urllib.request.urlopen(request,timeout=60) as remote:
     if not remote.geturl().startswith('https://codeload.github.com/'):raise RuntimeError('SOURCE_REDIRECT_FORBIDDEN')
     while block:=remote.read(1024*1024):
      total+=len(block)
      if total>MAX:raise RuntimeError('SOURCE_ARCHIVE_BUDGET_EXCEEDED')
      archive.write(block)
    archive.flush();archivePath=pathlib.Path(archive.name)
   dest.mkdir(parents=True,exist_ok=supplement)
   expected={row['path']:row['sha256'] for row in pin['files'] if not supplement or row['path'] in ['scripts/release/mcp-oauth.cjs','scripts/release/synthetic-pilot.cjs']};seen=set();expanded=0
   with tarfile.open(archivePath,'r:gz') as tar:
    for member in tar:
     expanded+=member.size
     if expanded>200*1024*1024:raise RuntimeError('SOURCE_ARCHIVE_EXPANSION_BUDGET_EXCEEDED')
     parts=pathlib.PurePosixPath(member.name).parts
     if len(parts)<2:continue
     relative='/'.join(parts[1:])
     if relative not in expected:continue
     if relative in seen or not member.isfile() or member.size>10*1024*1024:raise RuntimeError('SOURCE_MEMBER_INVALID')
     payload=tar.extractfile(member).read()
     if hashlib.sha256(payload).hexdigest()!=expected[relative]:raise RuntimeError('SOURCE_MEMBER_HASH_MISMATCH')
     target=dest/relative;target.parent.mkdir(parents=True,exist_ok=True)
     if target.exists():
      if hashlib.sha256(target.read_bytes()).hexdigest()!=expected[relative]:raise RuntimeError('EXISTING_HELPER_HASH_MISMATCH')
     else:target.write_bytes(payload)
     seen.add(relative)
   if seen!=set(expected):raise RuntimeError('SOURCE_MEMBERS_MISSING')
   receipt['sources'][name]={'publishedCommit':commit,'originalCommit':pin['commit'],'reviewedEquivalentTree':pin['tree'],'materializedFiles':len(seen),'downloadBytes':total,'reusedArchive':len(sys.argv)>1,'archiveSha256':hashlib.sha256(archivePath.read_bytes()).hexdigest(),'sourceFileHashes':'ALL_MATCH'}
 (HERE/'host-source-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'status':'SOURCE_FILES_MATCH_PINNED_MANIFEST','dbConnections':0,'sources':receipt['sources']}))
except Exception as error:
 print(json.dumps({'status':'BLOCKED','code':str(error) if str(error).isupper() and len(str(error))<100 else 'HOST_SOURCE_DOWNLOAD_OR_MATERIALIZATION_FAILED'}),file=sys.stderr);sys.exit(1)
