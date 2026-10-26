// Local synthetic publisher transport only; no token, PR or guest is created.
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {generateKeyPairSync,sign,createHash}=require('node:crypto');
const p=require('../../deploy/hermes-coding/bounded_publisher.cjs');
const {PROFILE,PERMISSIONS}=require('../../deploy/hermes-coding/publisher_identity.cjs');
const rsa=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey;
const signing=generateKeyPairSync('ed25519');
const publicPem=signing.publicKey.export({type:'spki',format:'pem'});
const JOB='00000000-0000-4000-8000-000000000001',TOKEN='SYNTHETIC_ONLY_NOT_A_CREDENTIAL_12345678';
const baseline=fs.readFileSync(path.join(__dirname,'../../apps/command-center/src/ui.ts'),'utf8');
const anchor="  document.getElementById('goalProgress').textContent='Loading goal evidence…';\n";
// Deliberately fails the real verifier's loading expectations. It is a guard
// fixture, never saved to the UI source or attributed to Hermes.
const source=baseline.replace(anchor,anchor+"  document.getElementById('finalReport').textContent='CANARY_REPORT';\n"+"  document.getElementById('timeline').textContent='CANARY_EVIDENCE';\n");
const body={jobId:JOB,repository:p.REPO,base:p.BASE,files:{[p.FILE]:source}};
const artifact=p.admitArtifact(body,baseline);
function envelope(changes={}){
 const payload={kind:'SAM_REAL_UI_ACCEPTED',jobId:JOB,repository:p.REPO,base:p.BASE,path:p.FILE,sourceSha256:artifact.sourceHash,verifierSha256:p.VERIFIER_HASH,imageId:'im-SyntheticOnly',candidateSandboxId:'sb-Candidate',independentSandboxId:'sb-Independent',testsPassed:5,exitCode:0,cleanupConfirmed:true,complete:true,...changes};
 return {payload,signature:sign(null,Buffer.from(p.canonical(payload)),signing.privateKey).toString('base64url')};
}
function fixture(change={}){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'sam-publisher-test-'));fs.chmodSync(directory,0o700);
 const journal=new p.PublicationJournal(directory),calls=[],repo={id:PROFILE.repositoryId,full_name:p.REPO};
 const installation={id:PROFILE.installationId,app_id:PROFILE.appId,app_slug:PROFILE.slug,account:{login:PROFILE.owner},repository_selection:'selected',suspended_at:null,permissions:{...PERMISSIONS}};
 const token={token:TOKEN,repository_selection:'selected',permissions:{...PERMISSIONS},repositories:[repo],expires_at:new Date(Date.now()+3500000).toISOString()};
 change.token?.(token);change.installation?.(installation);
 const tree='a'.repeat(40),created='b'.repeat(40),root='/repos/'+p.REPO;
 async function transport(method,route,credential,data){
  calls.push({method,route,data});
  if(method==='DELETE'){assert.equal(route,'/installation/token');assert.equal(credential,TOKEN);if(change.revokeFails)throw Error(TOKEN);return null}
  if(route==='/app/installations/'+PROFILE.installationId)return installation;
  if(route.endsWith('/access_tokens')){assert.deepEqual(data,{repository_ids:[PROFILE.repositoryId],permissions:{...PERMISSIONS}});return token}
  assert.equal(credential,TOKEN);
  if(route==='/installation/repositories?per_page=100')return {total_count:change.extraRepository?2:1,repositories:[repo]};
  if(route===root+'/branches/main')return {name:'main',protected:!change.unprotected,commit:{sha:'c'.repeat(40)}};
  if(route===root+'/branches/'+encodeURIComponent(p.BASE_BRANCH))return {name:p.BASE_BRANCH,commit:{sha:change.movedBase?'d'.repeat(40):p.BASE}};
  if(route===root+'/git/commits/'+p.BASE)return {sha:p.BASE,tree:{sha:'e'.repeat(40)}};
  if(method==='POST'&&route===root+'/git/trees'){assert.equal(data.tree.length,1);assert.equal(data.tree[0].path,p.FILE);assert.equal(data.tree[0].content,source);return {sha:tree}}
  if(method==='POST'&&route===root+'/git/commits'){assert.deepEqual(data.parents,[p.BASE]);assert(data.message.includes('[skip ci]'));return {sha:created,tree:{sha:tree},parents:[{sha:p.BASE}]}}
  if(method==='POST'&&route===root+'/git/refs'){assert.equal(data.ref,'refs/heads/'+artifact.branch);if(change.uncertainBranch)throw Error(TOKEN);return {ref:data.ref,object:{sha:created}}}
  if(method==='POST'&&route===root+'/pulls'){assert.equal(data.draft,true);assert.equal(data.head,artifact.branch);assert.equal(data.base,p.BASE_BRANCH);return {number:1000,draft:true,head:{ref:artifact.branch,sha:created,repo},base:{ref:p.BASE_BRANCH,sha:p.BASE,repo}}}
  assert.equal(route,root+'/pulls/1000/files?per_page=100');return [{filename:change.extraFile?'package.json':p.FILE,sha:artifact.blob,status:'modified',additions:2,deletions:0}];
 }
 const options={body,baseline,acceptance:envelope(),verifierPublicKey:publicPem,journal,env:{}};
 const dependencies={transport,loadKey:()=>rsa};
 return {directory,journal,calls,options,dependencies,clean:()=>fs.rmSync(directory,{recursive:true,force:true})};
}
test('synthetic flow rechecks App scope then creates exactly one branch and draft PR',async()=>{
 const f=fixture();try{const r=await p.publishReviewed(f.options,f.dependencies);assert.equal(r.draft,true);assert.equal(r.tokenRevoked,true);assert.equal(r.repository,p.REPO);
  assert(!JSON.stringify(r).includes(TOKEN));assert.equal(f.calls.filter(x=>x.route.endsWith('/git/refs')).length,1);assert.equal(f.calls.at(-1).method,'DELETE');
  const writes=f.calls.filter(x=>x.method==='POST'&&!x.route.endsWith('/access_tokens'));assert.equal(writes.length,4);
 }finally{f.clean()}
});
test('invalid file/repository/branch authority is denied before reservation or authentication',async()=>{
 for(const changed of [{...body,repository:'other/repo'},{...body,files:{...body.files,'.env':'CANARY'}},{...body,branch:'main'},{...body,files:{[p.FILE]:source+'\n'}}]){
  const f=fixture();try{await assert.rejects(p.publishReviewed({...f.options,body:changed},f.dependencies),/BOUNDED_PUBLISH_/);assert.equal(f.calls.length,0);assert.deepEqual(fs.readdirSync(f.directory),[])}finally{f.clean()}
 }
});
test('forged, incomplete, failing and same-guest verifier receipts are denied before writes',async()=>{
 for(const changes of [{exitCode:1},{testsPassed:4},{cleanupConfirmed:1},{independentSandboxId:'sb-Candidate'},{sourceSha256:'a'.repeat(64)},{extraAuthority:true}]){
  const f=fixture();try{await assert.rejects(p.publishReviewed({...f.options,acceptance:envelope(changes)},f.dependencies),/ACCEPTANCE_DENIED/);assert.equal(f.calls.length,0)}finally{f.clean()}
 }
 const f=fixture();try{const forged=envelope();forged.signature='a'.repeat(86);await assert.rejects(p.publishReviewed({...f.options,acceptance:forged},f.dependencies),/SIGNATURE_DENIED/);assert.equal(f.calls.length,0)}finally{f.clean()}
});
test('scope expansion and unprotected main prevent repository writes and revoke minted tokens',async()=>{
 for(const change of [{token:t=>t.repositories.push({id:1,full_name:'other/repo'})},{token:t=>t.permissions.actions='write'},{extraRepository:true},{unprotected:true},{movedBase:true}]){
  const f=fixture(change);try{await assert.rejects(p.publishReviewed(f.options,f.dependencies));assert(!f.calls.some(x=>x.method==='POST'&&x.route.startsWith('/repos/')));assert.equal(f.calls.at(-1).method,'DELETE')}finally{f.clean()}
 }
});
test('all-repo installation is refused before token minting',async()=>{
 const f=fixture({installation:i=>i.repository_selection='all'});try{await assert.rejects(p.publishReviewed(f.options,f.dependencies));assert.equal(f.calls.length,1)}finally{f.clean()}
});
test('uncertain branch creation cannot be retried after journal reopen',async()=>{
 const f=fixture({uncertainBranch:true});try{
  await assert.rejects(p.publishReviewed(f.options,f.dependencies),{message:'BOUNDED_PUBLISH_FAILED_RECONCILE'});const count=f.calls.length;
  const journal=new p.PublicationJournal(f.directory);await assert.rejects(p.publishReviewed({...f.options,journal},f.dependencies),/RECONCILE_REQUIRED/);assert.equal(f.calls.length,count);
 }finally{f.clean()}
});
test('completed receipt reads without reminting or repeated publication after reopen',async()=>{
 const f=fixture();try{const r=await p.publishReviewed(f.options,f.dependencies),count=f.calls.length;
  const reopened=new p.PublicationJournal(f.directory);assert.deepEqual(await p.publishReviewed({...f.options,journal:reopened},{transport:()=>{throw Error('MUST_NOT_RUN')},loadKey:()=>{throw Error('MUST_NOT_RUN')}}),r);assert.equal(f.calls.length,count);
  assert.throws(()=>reopened.begin('00000000-0000-4000-8000-000000000002','b'.repeat(64)),/JOB_CONFLICT/);
 }finally{f.clean()}
});
test('unexpected published diff or unconfirmed revocation cannot report success',async()=>{
 for(const change of [{extraFile:true},{revokeFails:true}]){const f=fixture(change);try{await assert.rejects(p.publishReviewed(f.options,f.dependencies));assert.equal(f.calls.at(-1).method,'DELETE');const text=fs.readFileSync(path.join(f.directory,'publication.json'),'utf8');assert(!text.includes(TOKEN));assert.equal(JSON.parse(text).state,'CLAIMED')}finally{f.clean()}}
});
test('main updates, merge, other repositories, workflow files and non-draft routes fail without network',async()=>{
 const request=p.transportFor(artifact),root='/repos/'+p.REPO;
 for(const [method,route,data]of [['PATCH',root+'/git/refs/heads/main',{}],['PUT',root+'/pulls/1/merge',{}],['POST','/repos/other/repo/git/trees',{}],['POST',root+'/git/refs',{ref:'refs/heads/main',sha:'a'.repeat(40)}],['POST',root+'/git/trees',{base_tree:'a'.repeat(40),tree:[{path:'.github/workflows/x.yml',mode:'100644',type:'blob',content:'CANARY'}]}],['POST',root+'/pulls',{title:'x',body:'x',head:artifact.branch,base:p.BASE_BRANCH,draft:false,maintainer_can_modify:false}]])await assert.rejects(request(method,route,TOKEN,data),/BOUNDED_PUBLISH_/);
});
