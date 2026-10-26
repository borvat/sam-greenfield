/** UNREGISTERED trusted-host publisher. Never a Hermes or Sandbox tool.
 * New publication requires a SAM-signed independent acceptance, exact source
 * policy, private crash journal and freshly checked one-repository App token.
 * There is no merge, branch update, main push, settings or Actions operation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),https=require('node:https');
const {createHash,createPublicKey,verify}=require('node:crypto');
const identity=require('./publisher_identity.cjs');
const REPO='borvat/sam-greenfield',BASE='91da88a224eabb2e0a9701dd1ed462c7a0e69f2d';
const BASE_BRANCH='integration/sam-hermes-live-20261026',FILE='apps/command-center/src/ui.ts';
const BASE_HASH='0bb06f3c6e976a9f5d3878df97268260c47d365757afd7d44ba877f94e0c2c35';
const VERIFIER_HASH='54881bbb9bbd8f8dedc2ee537d3eddbebd1e7522989e26f46157a19584dc8a5c';
const ANCHOR="  document.getElementById('goalProgress').textContent='Loading goal evidence…';\n";
const sha=s=>createHash('sha256').update(s).digest('hex');
const gitBlob=s=>createHash('sha1').update(Buffer.concat([Buffer.from('blob '+Buffer.byteLength(s)+'\0'),Buffer.from(s)])).digest('hex');
const hex=s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);
const uuid=s=>typeof s==='string'&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(s);
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===keys.split(',').sort().join(',');
function deny(code){throw Error(code)}
function canonical(o){return JSON.stringify(Object.fromEntries(Object.keys(o).sort().map(k=>[k,o[k]])))}

function admitArtifact(body,baseline){
 if(!exact(body,'jobId,repository,base,files')||!uuid(body.jobId)||body.repository!==REPO||body.base!==BASE||!exact(body.files,FILE))deny('BOUNDED_PUBLISH_TARGET_DENIED');
 const source=body.files[FILE];
 if(typeof source!=='string'||Buffer.byteLength(source)>32768||typeof baseline!=='string'||sha(baseline)!==BASE_HASH||baseline.split(ANCHOR).length!==2)deny('BOUNDED_PUBLISH_SOURCE_DENIED');
 const [a,b]=baseline.split(ANCHOR),prefix=a+ANCHOR;
 if(!source.startsWith(prefix)||!source.endsWith(b))deny('BOUNDED_PUBLISH_PATCH_DENIED');
 const insert=source.slice(prefix.length,source.length-b.length);
 const regex=/  document\.getElementById\('(finalReport|timeline)'\)\.textContent='([A-Za-z0-9 .…:_-]{1,120})';\n/g;
 const matches=[...insert.matchAll(regex)];
 if(matches.length!==2||matches.map(m=>m[0]).join('')!==insert||new Set(matches.map(m=>m[1])).size!==2)deny('BOUNDED_PUBLISH_PATCH_DENIED');
 return {jobId:body.jobId,source,sourceHash:sha(source),blob:gitBlob(source),branch:'hermes/real-ui-'+body.jobId};
}

function admitAcceptance(envelope,artifact,publicKey){
 const fields='kind,jobId,repository,base,path,sourceSha256,verifierSha256,imageId,candidateSandboxId,independentSandboxId,testsPassed,exitCode,cleanupConfirmed,complete';
 const p=envelope?.payload;
 if(!exact(envelope,'payload,signature')||!exact(p,fields)||p.kind!=='SAM_REAL_UI_ACCEPTED'||p.jobId!==artifact.jobId||p.repository!==REPO||p.base!==BASE||p.path!==FILE||p.sourceSha256!==artifact.sourceHash||p.verifierSha256!==VERIFIER_HASH||p.testsPassed!==5||p.exitCode!==0||p.cleanupConfirmed!==true||p.complete!==true||
  typeof p.imageId!=='string'||!/^im-[A-Za-z0-9]+$/.test(p.imageId)||
  ![p.candidateSandboxId,p.independentSandboxId].every(x=>typeof x==='string'&&/^sb-[A-Za-z0-9]+$/.test(x))||p.candidateSandboxId===p.independentSandboxId)deny('BOUNDED_PUBLISH_ACCEPTANCE_DENIED');
 try{
  const k=createPublicKey(publicKey);
  if(k.asymmetricKeyType!=='ed25519'||typeof envelope.signature!=='string'||!/^[-_A-Za-z0-9]{86}$/.test(envelope.signature)||!verify(null,Buffer.from(canonical(p)),k,Buffer.from(envelope.signature,'base64url')))deny('BOUNDED_PUBLISH_SIGNATURE_DENIED');
 }catch{deny('BOUNDED_PUBLISH_SIGNATURE_DENIED')}
 return p;
}

function readPrivate(file){
 const fd=fs.openSync(file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
 try{const m=fs.fstatSync(fd);if(!m.isFile()||m.uid!==process.getuid?.()||(m.mode&0o077)||m.size<1||m.size>65536)deny('BOUNDED_PUBLISH_JOURNAL_DENIED');const b=fs.readFileSync(fd);if(b.length!==m.size)deny('BOUNDED_PUBLISH_JOURNAL_DENIED');return JSON.parse(b)}finally{fs.closeSync(fd)}
}
// LOCAL TEST JOURNAL ONLY unless the directory is independently provisioned on
// persistent private storage. This module does not provision or assert a mount.
// Registration must supply SAM's durable atomic journal; ephemeral /tmp or an
// unpersisted Render container is insufficient for live publication admission.
class PublicationJournal{
 constructor(directory){const m=fs.lstatSync(directory);if(!m.isDirectory()||m.uid!==process.getuid?.()||(m.mode&0o077))deny('BOUNDED_PUBLISH_DIRECTORY_DENIED');this.directory=directory}
 begin(id,digest){
  if(!uuid(id)||!/^[a-f0-9]{64}$/.test(digest))deny('BOUNDED_PUBLISH_JOB_DENIED');
  const file=path.join(this.directory,'publication.json');
  try{const fd=fs.openSync(file,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify({id,digest,state:'CLAIMED',stages:[]}));fs.fsyncSync(fd)}finally{fs.closeSync(fd)}this.syncDirectory();return null}
  catch(e){if(e.code!=='EEXIST')throw e;const r=readPrivate(file);if(r.id!==id||r.digest!==digest)deny('BOUNDED_PUBLISH_JOB_CONFLICT');if(r.state!=='COMPLETE')deny('BOUNDED_PUBLISH_RECONCILE_REQUIRED');return r.receipt}
 }
 syncDirectory(){const fd=fs.openSync(this.directory,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}
 save(id,stage,value){
  const file=path.join(this.directory,'publication.json'),r=readPrivate(file);if(r.id!==id||r.state!=='CLAIMED')deny('BOUNDED_PUBLISH_RECONCILE_REQUIRED');
  if(stage==='COMPLETE'){r.state='COMPLETE';r.receipt=value}else r.stages.push({stage,...value});
  const tmp=file+'.next';const fd=fs.openSync(tmp,'wx',0o600);
  try{fs.writeFileSync(fd,JSON.stringify(r));fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
  fs.renameSync(tmp,file);this.syncDirectory();
 }
}

function transportFor(artifact){
 const root='/repos/'+REPO,installation='/app/installations/'+identity.PROFILE.installationId;
 return async function request(method,route,credential,body){
  const fixed=new Set(['GET '+installation,'POST '+installation+'/access_tokens','GET /installation/repositories?per_page=100','DELETE /installation/token','GET '+root+'/branches/main','GET '+root+'/branches/'+encodeURIComponent(BASE_BRANCH),'GET '+root+'/git/commits/'+BASE,
   'POST '+root+'/git/trees','POST '+root+'/git/commits','POST '+root+'/git/refs','POST '+root+'/pulls']);
  const filesRead=method==='GET'&&new RegExp('^'+root+'/pulls/[1-9][0-9]*/files\\?per_page=100$').test(route);
  if(!fixed.has(method+' '+route)&&!filesRead)deny('BOUNDED_PUBLISH_ROUTE_DENIED');
  if(method==='POST'&&route===root+'/git/refs'&&(!exact(body,'ref,sha')||body.ref!=='refs/heads/'+artifact.branch||!hex(body.sha)))deny('BOUNDED_PUBLISH_BRANCH_DENIED');
  if(method==='POST'&&route===root+'/git/trees'&&(!exact(body,'base_tree,tree')||!hex(body.base_tree)||!Array.isArray(body.tree)||body.tree.length!==1||!exact(body.tree[0],'path,mode,type,content')||body.tree[0].path!==FILE||body.tree[0].mode!=='100644'||body.tree[0].type!=='blob'||body.tree[0].content!==artifact.source))deny('BOUNDED_PUBLISH_FILES_DENIED');
  if(method==='POST'&&route===root+'/git/commits'&&(!exact(body,'tree,parents,message')||!hex(body.tree)||JSON.stringify(body.parents)!==JSON.stringify([BASE])||body.message!=='fix(ui): clear stale goal evidence while loading [skip ci]'))deny('BOUNDED_PUBLISH_COMMIT_DENIED');
  if(method==='POST'&&route===root+'/pulls'&&(!exact(body,'title,body,head,base,draft,maintainer_can_modify')||body.head!==artifact.branch||body.base!==BASE_BRANCH||body.draft!==true||body.maintainer_can_modify!==false))deny('BOUNDED_PUBLISH_PR_DENIED');
  return new Promise((resolve,reject)=>{
   const fail=()=>reject(Error('BOUNDED_PUBLISH_TRANSPORT_FAILED')),data=body===undefined?null:Buffer.from(JSON.stringify(body));
   const req=https.request({hostname:'api.github.com',port:443,method,path:route,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'sam-bounded-publisher',Authorization:'Bearer '+credential,...(data?{'Content-Type':'application/json','Content-Length':data.length}:{})}},res=>{
    let size=0;const chunks=[];res.on('error',fail);res.on('data',b=>{size+=b.length;if(size>1048576){req.destroy();fail();return}chunks.push(b)});
    res.on('end',()=>{if(res.statusCode!==(method==='POST'?201:method==='DELETE'?204:200))return reject(Error('BOUNDED_PUBLISH_HTTP_DENIED'));if(method==='DELETE')return resolve(null);try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(Error('BOUNDED_PUBLISH_RESPONSE_DENIED'))}});
   });
   const timer=setTimeout(()=>req.destroy(),15000);req.once('close',()=>clearTimeout(timer));req.on('error',fail);req.setTimeout(15000,()=>req.destroy());if(data)req.write(data);req.end();
  });
 };
}

async function publishReviewed({body,baseline,acceptance,verifierPublicKey,journal,env=process.env},dependencies={}){
 // Complete validation before durable reservation, signing or any network call.
 const artifact=admitArtifact(body,baseline);admitAcceptance(acceptance,artifact,verifierPublicKey);
 const digest=sha(canonical({jobId:artifact.jobId,sourceHash:artifact.sourceHash,base:BASE,repository:REPO,verifierSha256:VERIFIER_HASH}));
 const prior=await journal.begin(artifact.jobId,digest);if(prior)return prior;
 const key=(dependencies.loadKey??identity.loadOperatorKey)(env);
 const transport=dependencies.transport??transportFor(artifact),root='/repos/'+REPO;
 const jwt=identity.createAppJwt(key);let token,receipt;
 try{
  const installation=await transport('GET','/app/installations/'+identity.PROFILE.installationId,jwt);identity.validateInstallation(installation);
  const mint=identity.installationTokenRequest(),response=await transport(mint.method,mint.path,jwt,mint.body);
  token=typeof response?.token==='string'?response.token:undefined;identity.validateTokenResponse(response);
  const repos=await transport('GET','/installation/repositories?per_page=100',token);
  if(repos?.total_count!==1||repos.repositories?.length!==1||repos.repositories[0].id!==identity.PROFILE.repositoryId||repos.repositories[0].full_name!==REPO)deny('BOUNDED_PUBLISH_REPOSITORY_DENIED');
  const main=await transport('GET',root+'/branches/main',token);if(main?.name!=='main'||main.protected!==true||!hex(main.commit?.sha))deny('BOUNDED_PUBLISH_MAIN_PROTECTION_DENIED');
  const base=await transport('GET',root+'/branches/'+encodeURIComponent(BASE_BRANCH),token);if(base?.name!==BASE_BRANCH||base.commit?.sha!==BASE)deny('BOUNDED_PUBLISH_BASE_MOVED_REVIEW_REQUIRED');
  const commit=await transport('GET',root+'/git/commits/'+BASE,token);if(commit?.sha!==BASE||!hex(commit.tree?.sha))deny('BOUNDED_PUBLISH_BASE_DENIED');
  await journal.save(artifact.jobId,'SCOPE_VERIFIED',{repository:REPO,sourceHash:artifact.sourceHash});
  // Persist intent before the first repository mutation. No retries after any
  // uncertain write; the private journal requires explicit reconciliation.
  await journal.save(artifact.jobId,'WRITE_INTENT',{});
  const tree=await transport('POST',root+'/git/trees',token,{base_tree:commit.tree.sha,tree:[{path:FILE,mode:'100644',type:'blob',content:artifact.source}]});
  if(!hex(tree?.sha))deny('BOUNDED_PUBLISH_TREE_DENIED');
  const created=await transport('POST',root+'/git/commits',token,{tree:tree.sha,parents:[BASE],message:'fix(ui): clear stale goal evidence while loading [skip ci]'});
  if(!hex(created?.sha)||created.tree?.sha!==tree.sha||created.parents?.length!==1||created.parents[0].sha!==BASE)deny('BOUNDED_PUBLISH_COMMIT_RESULT_DENIED');
  await journal.save(artifact.jobId,'COMMIT_CREATED',{sha:created.sha});
  const branch=await transport('POST',root+'/git/refs',token,{ref:'refs/heads/'+artifact.branch,sha:created.sha});
  if(branch?.ref!=='refs/heads/'+artifact.branch||branch.object?.sha!==created.sha)deny('BOUNDED_PUBLISH_BRANCH_RESULT_DENIED');
  await journal.save(artifact.jobId,'BRANCH_CREATED',{branch:artifact.branch,sha:created.sha});
  const pr=await transport('POST',root+'/pulls',token,{title:'Clear stale goal report and evidence during goal loading',body:'SAM independent verification accepted all five immutable UI checks in a separate isolated guest. Changes are restricted to '+FILE+'. Human review required; no merge or deployment is authorized.',head:artifact.branch,base:BASE_BRANCH,draft:true,maintainer_can_modify:false});
  if(!Number.isSafeInteger(pr?.number)||pr.number<1||pr.draft!==true||pr.head?.ref!==artifact.branch||pr.head.sha!==created.sha||pr.head.repo?.full_name!==REPO||pr.base?.ref!==BASE_BRANCH||pr.base.sha!==BASE||pr.base.repo?.full_name!==REPO)deny('BOUNDED_PUBLISH_PR_RESULT_DENIED');
  await journal.save(artifact.jobId,'DRAFT_CREATED',{number:pr.number});
  const files=await transport('GET',root+'/pulls/'+pr.number+'/files?per_page=100',token);
  if(!Array.isArray(files)||files.length!==1||files[0].filename!==FILE||files[0].sha!==artifact.blob||files[0].status!=='modified'||files[0].additions!==2||files[0].deletions!==0)deny('BOUNDED_PUBLISH_DIFF_DENIED_RECONCILE');
  receipt={kind:'BOUNDED_DRAFT_PR_PUBLISHED',jobId:artifact.jobId,repository:REPO,branch:artifact.branch,base:BASE,commit:created.sha,pullRequest:pr.number,draft:true,path:FILE,sourceHash:artifact.sourceHash};
 }catch(e){deny(/^(PUBLISHER_|BOUNDED_PUBLISH_)[A-Z_]{1,100}$/.test(e?.message||'')?e.message:'BOUNDED_PUBLISH_FAILED_RECONCILE')}
 finally{if(token){try{await transport('DELETE','/installation/token',token)}catch{deny('BOUNDED_PUBLISH_TOKEN_REVOCATION_UNCONFIRMED')}token=undefined}}
 const result={...receipt,tokenRevoked:true};await journal.save(artifact.jobId,'COMPLETE',result);return result;
}
module.exports={REPO,BASE,BASE_BRANCH,FILE,VERIFIER_HASH,canonical,admitArtifact,admitAcceptance,PublicationJournal,transportFor,publishReviewed};
