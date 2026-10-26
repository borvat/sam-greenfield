/** UNREGISTERED, one-shot authentication preflight on the existing SAM TEST host.
 * Never opens a runtime/PG window, starts a model/guest, or writes a repository.
 * Requires explicit vault-to-SAM activation at action time. Diagnostic-only
 * maintenance avoids replaying authentication when the existing PG startup
 * guard exits. It never reports the SAM application as ready.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {spawnSync}=require('node:child_process');
const http=require('node:http');
const ARTIFACTS=Object.freeze({
  "trusted_auth_preflight.cjs": "478ef72bccdf429105ef1704dfd0155d18be3cc5f5a80049cc21429ccce6e118",
  "publisher_identity.cjs": "4f5cd958eaaa25efd92aef710526f7281f22ee3d8829f06b87c44a9c7288b57b",
  "publisher_auth_preflight.cjs": "3b3fe330cc1898ca63ddccb95fb4256f0fe6681047916c6eb0321d63ca8ba382",
  "operator-sdk/package.json": "d94930738ed232fc27f553c94447bbe233242ec38cb73cba8372176e5e84043e",
  "operator-sdk/package-lock.json": "335174c41de4263bdca4b74b5b4c5768da9973e544f9b6653532fc7cef6d9a20",
  "operator-sdk/global-empty.npmrc": "43064fc7d5b3d3c402e93ba9909579bff00a2aaaed2f91be5d57c4a37cba45ad"
});
const VAULT_KEYS=Object.freeze(['sam-github-publisher.pem','SAM_GITHUB_APP_PRIVATE_KEY',
 'SAM_MODAL_OPERATOR_TOKEN_ID','SAM_MODAL_OPERATOR_TOKEN_SECRET']);
function deny(code){throw new Error(code)}
function scrubVault(env){for(const key of VAULT_KEYS)delete env[key];return env}
function verifyArtifact(name,bytes){
 if(!Object.hasOwn(ARTIFACTS,name)||!Buffer.isBuffer(bytes)||bytes.length>65536||
    createHash('sha256').update(bytes).digest('hex')!==ARTIFACTS[name])deny('SAM_AUTH_SOURCE_HASH_DENIED');
 return bytes;
}
async function download(url){
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok||!response.body)deny('SAM_AUTH_SOURCE_DOWNLOAD_FAILED');
 const reader=response.body.getReader(),chunks=[];let count=0;
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;
   count+=value.length;if(count>65536)deny('SAM_AUTH_SOURCE_SIZE_DENIED');chunks.push(Buffer.from(value));
  }
 }finally{await reader.cancel()}
 return Buffer.concat(chunks);
}
async function prepare(commit,deadline,env,options={}){
 if(!/^[0-9a-f]{40}$/.test(commit)||!Number.isSafeInteger(deadline)||
    deadline<=Date.now()||deadline-Date.now()>15*60*1000)deny('SAM_AUTH_OPERATOR_WINDOW_DENIED');
 if(env.SAM_GITHUB_PUBLISHER_ENABLED!=='0')deny('SAM_AUTH_PUBLICATION_MUST_REMAIN_DISABLED');
 if(!env.SAM_MODAL_OPERATOR_TOKEN_ID||!env.SAM_MODAL_OPERATOR_TOKEN_SECRET||
    !(env['sam-github-publisher.pem']||env.SAM_GITHUB_APP_PRIVATE_KEY))deny('SAM_AUTH_VAULT_NOT_BOUND');
 const folder=fs.mkdtempSync('/tmp/sam-auth-only-');fs.chmodSync(folder,0o700);
 try{
  for(const name of Object.keys(ARTIFACTS)){
   const bytes=verifyArtifact(name,await (options.download??download)(
    'https://raw.githubusercontent.com/borvat/sam-greenfield/'+commit+'/deploy/hermes-coding/'+name));
   const target=path.join(folder,name);
   fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
   fs.writeFileSync(target,bytes,{mode:0o600,flag:'wx'});
  }
  const auth=require(path.join(folder,'trusted_auth_preflight.cjs'));
  const npmEnv={PATH:'/usr/local/bin:/usr/bin:/bin',HOME:folder,TMPDIR:folder};
  const installed=(options.install??spawnSync)('npm',auth.NPM_ARGS,{
   cwd:path.join(folder,'operator-sdk'),env:npmEnv,stdio:'ignore',timeout:60000});
  if(installed.status!==0)deny('SAM_AUTH_SDK_INSTALL_FAILED');
  if(Date.now()+220000>deadline)deny('SAM_AUTH_OPERATOR_WINDOW_INSUFFICIENT');
  return (options.check??auth.runChildren)(env);
 }finally{fs.rmSync(folder,{recursive:true,force:true})}
}
function startDiagnostic(port=Number(process.env.PORT||10000),host='0.0.0.0'){
 if(!Number.isSafeInteger(port)||port<0||port>65535)deny('SAM_AUTH_DIAGNOSTIC_PORT_DENIED');
 const server=http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  if(req.url==='/_operator/health'){
   res.writeHead(200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({kind:'TRUSTED_OPERATOR_HEALTH',applicationReady:false,
    executionEnabled:false,guestCreations:0,modelCalls:0}));return;
  }
  res.writeHead(503,{'Content-Type':'text/plain'});
  res.end('Isolated operator maintenance; SAM application unavailable.');
 });
 server.requestTimeout=5000;server.headersTimeout=5000;
 server.listen(port,host);
 return server;
}
async function main(){
 const saved={};for(const key of VAULT_KEYS)if(process.env[key]!==undefined)saved[key]=process.env[key];
 saved.SAM_GITHUB_PUBLISHER_ENABLED=process.env.SAM_GITHUB_PUBLISHER_ENABLED;
 scrubVault(process.env);let result;
 try{
  if(process.getuid?.()!==0)deny('SAM_AUTH_ROOT_OPERATOR_REQUIRED');
  if(fs.existsSync('/tmp/sam-auth-only-result.json'))deny('SAM_AUTH_RECONCILIATION_REQUIRED');
  result={status:'PASS',...await prepare(process.argv[2],Number(process.argv[3]),saved)};
 }catch(error){
  const message=error?.message||'';
  result={kind:'TRUSTED_AUTH_PREFLIGHT',status:'FAIL',
   error:/^(SAM_AUTH_|PUBLISHER_)[A-Z_]{1,100}$/.test(message)?message:'SAM_AUTH_PREFLIGHT_FAILED',
   publicationEnabled:false,guestCreations:0,modelCalls:0};
 }finally{for(const key of Object.keys(saved))delete saved[key]}
 // Exclusive create, never follow a pre-existing result symlink or overwrite it.
 try{fs.writeFileSync('/tmp/sam-auth-only-result.json',JSON.stringify(result),{mode:0o600,flag:'wx'})}
 catch{result={kind:'TRUSTED_AUTH_PREFLIGHT',status:'FAIL',error:'SAM_AUTH_RESULT_STORAGE_DENIED'}}
 console.log(JSON.stringify(result));
 // If HTTP health checks are configured, use /_operator/health for this
 // diagnostic deployment. /readyz and all application routes remain 503.
 // No original runtime, model, database client or task worker is started.
 const server=startDiagnostic();
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
module.exports={ARTIFACTS,VAULT_KEYS,scrubVault,verifyArtifact,download,prepare,startDiagnostic};
if(require.main===module)void main();

