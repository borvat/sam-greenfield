'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const DIR=__dirname,PINS=JSON.parse(fs.readFileSync(path.join(DIR,'source-pins.json'),'utf8'));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const FILE_DIGEST_BUFFER=Buffer.allocUnsafe(1024*1024);
function fileSha(file){const digest=crypto.createHash('sha256'),fd=fs.openSync(file,'r');try{let bytes;while((bytes=fs.readSync(fd,FILE_DIGEST_BUFFER,0,FILE_DIGEST_BUFFER.length,null))!==0)digest.update(FILE_DIGEST_BUFFER.subarray(0,bytes));return digest.digest('hex');}finally{fs.closeSync(fd);}}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(code){throw Error(code);}
function config(file){
 const c=JSON.parse(fs.readFileSync(file,'utf8'));
 if(c.targetRenderId!=='dpg-dbjpqkutlv9c73dup8lg-a'||c.databaseName!=='sam_restore_pr86_20261101_2013'||!/^dpg-dbjpqkutlv9c73dup8lg-a(?:\.[a-z0-9.-]+)?$/.test(c.hostname))fail('RESTORE_TARGET_PIN_REQUIRED');
 if(!/^[a-z_][a-z0-9_]{0,62}$/.test(c.appRole)||/postgres|admin|owner|^root$/.test(c.appRole))fail('RESTRICTED_LOGIN_REQUIRED');
 for(const key of ['orgId','legalEntityId','foreignCompanyId','runId'])if(!uuid.test(c[key]||''))fail('NATIVE_UUID_CONFIGURATION_REQUIRED');
 if(c.foreignCompanyId===c.legalEntityId||!Number.isFinite(Date.parse(c.deadline))||Date.parse(c.deadline)>Date.parse('2026-11-02T20:13:00.000Z')||Date.now()>=Date.parse(c.deadline))fail('TARGET_WINDOW_OR_FOREIGN_SCOPE_INVALID');
 c.tlsMode??='verify-full';
 if(!['verify-full','internal-encrypted-unverified'].includes(c.tlsMode))fail('TLS_MODE_INVALID');
 if(c.tlsMode==='internal-encrypted-unverified'&&(c.hostname!==c.targetRenderId||c.privateNetworkTargetConfirmed!==true||!c.internalTlsReviewReference||/^(FILL|PENDING)/.test(c.internalTlsReviewReference)))fail('EXPLICIT_PRIVATE_TLS_REVIEW_REQUIRED');
 if(!c.operatorReviewReference||/^(FILL|PENDING)/.test(c.operatorReviewReference)||c.allowNativeExecution!==true)fail('OPERATOR_NATIVE_REVIEW_REQUIRED');
 return c;
}
function credentials(c){
 if(process.env.SAM_NATIVE_DRILL_APPROVAL!=='RUN_ISOLATED_NATIVE_SYNTHETIC_DRILL')fail('NATIVE_EXECUTION_NOT_ARMED');
 let url;try{url=new URL(process.env.SAM_NATIVE_APP_DATABASE_URL||'');}catch{fail('PRIVATE_APP_DATABASE_URL_REQUIRED');}
 if(!['postgres:','postgresql:'].includes(url.protocol)||url.hostname!==c.hostname||decodeURIComponent(url.pathname.slice(1))!==c.databaseName||decodeURIComponent(url.username)!==c.appRole||!url.password||url.searchParams.get('sslmode')!==(c.tlsMode==='internal-encrypted-unverified'?'require':'verify-full'))fail('RESTORE_LOGIN_OR_TLS_PIN_MISMATCH');
 for(const key of url.searchParams.keys())if(!['sslmode','connect_timeout','application_name','uselibpqcompat'].includes(key)||url.searchParams.getAll(key).length!==1)fail('DATABASE_URI_OVERRIDE_FORBIDDEN');
 if(url.searchParams.has('uselibpqcompat')&&(c.tlsMode!=='internal-encrypted-unverified'||url.searchParams.get('uselibpqcompat')!=='true'))fail('PRIVATE_TLS_COMPATIBILITY_FLAG_FORBIDDEN');
 if(c.tlsMode==='internal-encrypted-unverified')url.searchParams.set('uselibpqcompat','true');
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')fail('TLS_BYPASS_FORBIDDEN');
 return url.href;
}
function root(name){if(!PINS.sources[name])fail('SOURCE_VARIANT_INVALID');return path.join(DIR,'sources',name);}
function verifySource(name){
 const base=root(name);for(const {path:file,sha256:hash} of PINS.sources[name].files)if(fileSha(path.join(base,file))!==hash)fail('PINNED_SOURCE_HASH_MISMATCH');
 return PINS.sources[name];
}
function verifyRuntimeArtifacts(checkTree=false){
 const file=process.env.SAM_NATIVE_RUNTIME_ARTIFACTS_FILE;if(!file||!path.isAbsolute(file))fail('REVIEWED_RUNTIME_ARTIFACTS_REQUIRED');
 const a=JSON.parse(fs.readFileSync(file,'utf8')),hex=/^[a-f0-9]{64}$/;
 if(a.nodeVersion!=='v24.22.1'||process.version!==a.nodeVersion||process.platform!=='linux'||process.arch!=='x64'||!a.reviewReference||/^(FILL|PENDING)/.test(a.reviewReference))fail('PINNED_NODE24_RUNTIME_REQUIRED');
 for(const key of ['nodeBinarySha256','nodeArchiveSha256','nodeChecksumsSha256','dependencyArchiveSha256','dependencyTreeManifestSha256','installProvenanceSha256'])if(!hex.test(a[key]||''))fail('RUNTIME_ARTIFACT_DIGEST_REQUIRED');
 for(const key of ['nodeBinaryPath','nodeArchivePath','nodeChecksumsPath','dependencyArchivePath','dependencyTreeManifestPath','dependencyRoot','installProvenancePath'])if(!path.isAbsolute(a[key]||''))fail('RUNTIME_ARTIFACT_PATH_REQUIRED');
 if(fs.realpathSync(process.execPath)!==fs.realpathSync(a.nodeBinaryPath)||fileSha(process.execPath)!==a.nodeBinarySha256)fail('NODE_BINARY_INTEGRITY_MISMATCH');
 if(a.nodeChecksumSource!=='https://nodejs.org/dist/v24.22.1/SHASUMS256.txt'||fileSha(a.nodeChecksumsPath)!==a.nodeChecksumsSha256||fileSha(a.nodeArchivePath)!==a.nodeArchiveSha256)fail('NODE_OFFICIAL_ARTIFACT_PIN_MISMATCH');
 const checksumLine=fs.readFileSync(a.nodeChecksumsPath,'utf8').split(/\r?\n/).find(line=>line.trim().split(/\s+/).at(-1)===path.basename(a.nodeArchivePath));
 if(!checksumLine||checksumLine.trim().split(/\s+/)[0]!==a.nodeArchiveSha256)fail('NODE_OFFICIAL_CHECKSUM_ENTRY_MISSING');
 if(fileSha(a.dependencyArchivePath)!==a.dependencyArchiveSha256||fileSha(a.dependencyTreeManifestPath)!==a.dependencyTreeManifestSha256)fail('DEPENDENCY_ARTIFACT_INTEGRITY_MISMATCH');
 if(fileSha(a.installProvenancePath)!==a.installProvenanceSha256)fail('INSTALL_PROVENANCE_PIN_MISMATCH');
 if(checkTree){
  const expected=JSON.parse(fs.readFileSync(a.dependencyTreeManifestPath,'utf8')).files;if(!Array.isArray(expected)||!expected.length)fail('DEPENDENCY_TREE_MANIFEST_REQUIRED');
  const root=fs.realpathSync(a.dependencyRoot),actual=[];
  const walk=(dir,prefix='')=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((x,y)=>x.name.localeCompare(y.name))){const relative=prefix+entry.name,full=path.join(dir,entry.name),stat=fs.lstatSync(full);if(stat.mode&0o6000)fail('UNSAFE_DEPENDENCY_FILE_MODE');if(entry.isDirectory())walk(full,relative+'/');else if(entry.isSymbolicLink()){const target=fs.realpathSync(full);if(!target.startsWith(root+path.sep))fail('DEPENDENCY_SYMLINK_ESCAPE');actual.push({path:relative,type:'symlink',target:fs.readlinkSync(full)});}else if(entry.isFile())actual.push({path:relative,type:'file',sha256:fileSha(full)});else fail('DEPENDENCY_SPECIAL_FILE_FORBIDDEN');}};
  walk(root);const normalize=rows=>JSON.stringify([...rows].sort((x,y)=>x.path.localeCompare(y.path)));
  if(normalize(actual)!==normalize(expected))fail('UNPACKED_DEPENDENCY_TREE_INTEGRITY_MISMATCH');
 }
 return {nodeVersion:a.nodeVersion,nodeBinarySha256:a.nodeBinarySha256,nodeArchiveSha256:a.nodeArchiveSha256,dependencyArchiveSha256:a.dependencyArchiveSha256,dependencyTreeManifestSha256:a.dependencyTreeManifestSha256,dependencyRoot:a.dependencyRoot,installProvenanceSha256:a.installProvenanceSha256,reviewReference:a.reviewReference,unpackedDependencyTreeVerified:checkTree};
}
function tenantOptions(c){for(const key of ['orgId','legalEntityId'])if(!uuid.test(c[key]||''))fail('TENANT_OPTION_UUID_INVALID');return '-c search_path=public,pg_catalog -c app.current_org_id='+c.orgId+' -c app.current_legal_entity_id='+c.legalEntityId;}
function baseEnvironment(databaseUrl,c){
 const env={NODE_ENV:'production',DATABASE_URL:databaseUrl,PGOPTIONS:tenantOptions(c),SAM_DEFAULT_LEGAL_ENTITY_ID:c.legalEntityId,SAM_DB_SCHEMA:'public',SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:c.legalEntityId,TZ:'UTC',SAM_COMPANY_ENABLED:'0',SAM_EXECUTIVE_REPORTS_ENABLED:'0',SAM_OWNER_CONTINUITY_ENABLED:'false',SAM_KNOWLEDGE_ENABLED:'false',SAM_NOTIFICATION_ENABLED:'false'};
 for(const key of ['PATH','HOME','TMPDIR','LANG','NODE_EXTRA_CA_CERTS','SAM_NATIVE_RUNTIME_ARTIFACTS_FILE'])if(process.env[key])env[key]=process.env[key];
 return env;
}
function safeError(error){return {code:/^[A-Z][A-Z0-9_]{2,100}$/.test(error?.message||'')?error.message:'WITHHELD',sqlState:/^[0-9A-Z]{5}$/.test(error?.code||'')?error.code:null};}
function writeJson(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n',{mode:0o600});}
module.exports={DIR,PINS,sha,fileSha,uuid,fail,config,credentials,root,verifySource,baseEnvironment,safeError,writeJson,verifyRuntimeArtifacts,tenantOptions};
