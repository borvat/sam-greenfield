#!/usr/bin/env python3
"""Capture already installed host artifacts only; no install/download/DB/process execution."""
import pathlib,hashlib,json,tarfile,os,sys
HERE=pathlib.Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
try:
 nodeInfo=json.loads(pathlib.Path(sys.argv[1]).read_text());install=pathlib.Path(sys.argv[2]).resolve();provenance=pathlib.Path(sys.argv[3]).resolve();out=pathlib.Path(sys.argv[4]).resolve()
 if out.exists() or not provenance.is_file():raise RuntimeError('FRESH_CAPTURE_DIRECTORY_AND_INSTALL_PROVENANCE_REQUIRED')
 if nodeInfo.get('nodeVersion')!='v24.22.1':raise RuntimeError('PINNED_NODE24_REQUIRED')
 for fileKey,digestKey in [('nodeBinaryPath','nodeBinarySha256'),('nodeArchivePath','nodeArchiveSha256'),('nodeChecksumsPath','nodeChecksumsSha256')]:
  if sha(nodeInfo[fileKey])!=nodeInfo[digestKey]:raise RuntimeError('EXISTING_NODE_ARTIFACT_DIGEST_MISMATCH')
 archiveName='node-v24.22.1-linux-x64.tar.xz'
 expected=next((line.split()[0] for line in pathlib.Path(nodeInfo['nodeChecksumsPath']).read_text().splitlines() if line.split()[-1]==archiveName),None)
 if expected!=nodeInfo['nodeArchiveSha256']:raise RuntimeError('OFFICIAL_NODE_CHECKSUM_ENTRY_MISMATCH')
 pins=json.loads((HERE/'source-pins.json').read_text());pinned={row['path']:row['sha256'] for row in pins['sources']['forward']['files']}
 for name in ['package.json','package-lock.json']:
  if sha(install/name)!=pinned[name]:raise RuntimeError('INSTALLED_SOURCE_LOCK_OR_PACKAGE_MISMATCH')
 modules=(install/'node_modules').resolve();entries=[]
 for p in sorted(modules.rglob('*')):
  relative=p.relative_to(modules).as_posix()
  if p.lstat().st_mode&0o6000:raise RuntimeError('UNSAFE_DEPENDENCY_FILE_MODE')
  if p.is_symlink():
   if not p.resolve().is_relative_to(modules):raise RuntimeError('DEPENDENCY_SYMLINK_ESCAPE')
   entries.append({'path':relative,'type':'symlink','target':os.readlink(p)})
  elif p.is_file():entries.append({'path':relative,'type':'file','sha256':sha(p)})
  elif not p.is_dir():raise RuntimeError('DEPENDENCY_SPECIAL_FILE_FORBIDDEN')
 if not entries:raise RuntimeError('EMPTY_DEPENDENCY_TREE')
 out.mkdir(mode=0o700,parents=True);manifest=out/'dependency-tree-manifest.json';manifest.write_text(json.dumps({'files':entries},indent=2)+'\n')
 bundle=out/'node_modules.tar.gz'
 with tarfile.open(bundle,'w:gz') as tar:tar.add(modules,arcname='node_modules',recursive=True)
 footprint=sum(p.stat().st_size for p in modules.rglob('*') if p.is_file() and not p.is_symlink())+sum(pathlib.Path(nodeInfo[k]).stat().st_size for k in ['nodeBinaryPath','nodeArchivePath','nodeChecksumsPath'])+bundle.stat().st_size+manifest.stat().st_size
 if footprint>200*1024*1024:raise RuntimeError('TRACKED_RUNTIME_ARTIFACT_SET_EXCEEDS_200_MIB')
 result={**nodeInfo,'nodeChecksumSource':'https://nodejs.org/dist/v24.22.1/SHASUMS256.txt','dependencyArchivePath':str(bundle),'dependencyArchiveSha256':sha(bundle),'dependencyTreeManifestPath':str(manifest),'dependencyTreeManifestSha256':sha(manifest),'dependencyRoot':str(modules),'installProvenancePath':str(provenance),'installProvenanceSha256':sha(provenance),'sourceLockSha256':pinned['package-lock.json'],'reviewReference':'PENDING_INDEPENDENT_REVIEW_OF_INSTALL_EXIT_ZERO_AND_ARTIFACT_PROVENANCE'}
 output=out/'runtime-artifacts.json';output.write_text(json.dumps(result,indent=2)+'\n')
 (out/'capture-receipt.json').write_text(json.dumps({'status':'CAPTURED_NOT_YET_PROVENANCE_APPROVED','nodeVersion':nodeInfo['nodeVersion'],'sourcePackageHash':pinned['package.json'],'sourceLockHash':pinned['package-lock.json'],'installProvenanceSha256':sha(provenance),'dependencyFiles':len(entries),'dependencyArchiveBytes':bundle.stat().st_size,'trackedRuntimeArtifactBytes':footprint,'databaseConnections':0,'installationOrDownloadPerformed':False,'limits':'Capture proves bytes and pins provenance file; reviewer must inspect that file for actual npm ci exit0, exact flags and official source/SRI route before setting reviewReference.'},indent=2)+'\n')
 print(json.dumps({'status':'CAPTURED_REVIEW_REQUIRED','runtimeArtifacts':str(output),'dependencyFiles':len(entries),'installRepeated':False,'databaseConnections':0}))
except Exception as error:
 print(json.dumps({'status':'BLOCKED','code':str(error) if str(error).isupper() and len(str(error))<100 else 'HOST_ARTIFACT_CAPTURE_FAILED'}),file=sys.stderr);sys.exit(1)
