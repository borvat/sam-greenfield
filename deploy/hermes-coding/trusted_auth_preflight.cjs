/** UNREGISTERED trusted-host authentication only. Never a model/guest tool.
 * Read-only Modal requests; GitHub mints and revokes a one-repo token but does
 * not write repository data. Each credential family runs in its own child.
 */
'use strict';
const {createHash}=require('node:crypto');
const {spawnSync}=require('node:child_process');
const TOKEN_ID_SHA='b2f871d28fded6eafd141b82ee436d116cadc90db65af05cbdf46beff0c1dd47';
const KEYS=['SAM_MODAL_OPERATOR_TOKEN_ID','SAM_MODAL_OPERATOR_TOKEN_SECRET',
  'sam-github-publisher.pem','SAM_GITHUB_APP_PRIVATE_KEY'];
const NPM_ARGS=Object.freeze(['ci','--omit=optional','--ignore-scripts','--no-audit','--no-fund',
  '--registry=https://registry.npmjs.org','--userconfig=/dev/null','--globalconfig=global-empty.npmrc']);
const silent=Object.freeze({debug(){},info(){},warn(){},error(){}});
function deny(code){throw new Error(code)}
function scrubVault(env){for(const key of KEYS)delete env[key];return env}
function childEnvironment(env,kind){
  const clean={PATH:'/usr/local/bin:/usr/bin:/bin',TMPDIR:'/tmp',HOME:'/nonexistent'};
  if(kind==='modal'){
    for(const key of KEYS.slice(0,2))clean[key]=env[key]??'';
    if(env.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256!==undefined)clean.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256=env.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256;
  }else if(kind==='github'){
    for(const key of KEYS.slice(2))if(env[key]!==undefined)clean[key]=env[key];
  }else deny('SAM_AUTH_CHILD_DENIED');
  return clean;
}
async function inspectModal(env,Client,expectedTokenHash=env.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256??TOKEN_ID_SHA){
  if(!/^[a-f0-9]{64}$/.test(expectedTokenHash))deny('SAM_AUTH_MODAL_ACCOUNT_BINDING_DENIED');
  const id=env.SAM_MODAL_OPERATOR_TOKEN_ID,secret=env.SAM_MODAL_OPERATOR_TOKEN_SECRET;
  if(typeof id!=='string'||!/^ak-[A-Za-z0-9_-]{5,256}$/.test(id)||
     typeof secret!=='string'||!/^as-[A-Za-z0-9_-]{5,512}$/.test(secret))deny('SAM_AUTH_MODAL_CREDENTIAL_FORMAT_DENIED');
  if(createHash('sha256').update(id).digest('hex')!==expectedTokenHash)deny('SAM_AUTH_MODAL_ACCOUNT_BINDING_DENIED');
  let client;
  try{
    if(!Client)({ModalClient:Client}=require('./operator-sdk/node_modules/modal'));
    client=new Client({tokenId:id,tokenSecret:secret,environment:'main',
      endpoint:'https://api.modal.com',timeoutMs:10000,maxRetries:0,
      maxThrottleWaitSecs:0,logger:silent,logLevel:'error'});
    if(client.version()!=='0.11.1')deny('SAM_AUTH_MODAL_SDK_VERSION_DENIED');
    const environment=await client.environments.fromName('main',{createIfMissing:false});
    if(environment.name!=='main'||!/^en-[A-Za-z0-9]+$/.test(environment.environmentId))deny('SAM_AUTH_MODAL_ENVIRONMENT_DENIED');
    for await(const sandbox of client.sandboxes.list({environment:'main'})){
      // Fail immediately without touching or terminating someone else's work.
      void sandbox;deny('SAM_AUTH_MODAL_ACTIVE_SANDBOX_RECONCILE');
    }
    return {kind:'MODAL_READONLY_AUTHENTICATION',sdk:'0.11.1',authenticated:true,
      workspace:'ceo-53153',tokenIdSha256:expectedTokenHash,environment:'main',
      environmentId:environment.environmentId,activeSandboxes:0,guestCreations:0,modelCalls:0};
  }catch(error){
    if(/^SAM_AUTH_[A-Z_]+$/.test(error?.message||''))throw error;
    deny('SAM_AUTH_MODAL_REQUEST_FAILED');
  }finally{client?.close()}
}
async function inspectGithub(env){
  const identity=require('./publisher_identity.cjs');
  const {inspectWithKey}=require('./publisher_auth_preflight.cjs');
  if(env.SAM_GITHUB_APP_PRIVATE_KEY!==undefined&&env['sam-github-publisher.pem']!==undefined&&
     env.SAM_GITHUB_APP_PRIVATE_KEY!==env['sam-github-publisher.pem'])deny('SAM_AUTH_GITHUB_KEY_SOURCE_CONFLICT');
  // Authentication-only route: publication remains disabled; there is no
  // repository-write function in this process or in its network helper.
  const key=identity.parseSigningKey(env.SAM_GITHUB_APP_PRIVATE_KEY??env['sam-github-publisher.pem'],identity.PROFILE.fingerprint);
  return inspectWithKey(key);
}
function runChildren(env,spawn=spawnSync){
  const results={};
  for(const kind of ['modal','github']){
    const result=spawn(process.execPath,[__filename,kind],{env:childEnvironment(env,kind),
      encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:100000,maxBuffer:16384});
    let parsed;try{parsed=JSON.parse(result.stdout)}catch{deny('SAM_AUTH_CHILD_RESULT_DENIED')}
    if(result.status!==0){
      if(Object.keys(parsed).sort().join(',')==='error,ok'&&parsed.ok===false&&
         /^(SAM_AUTH_|PUBLISHER_)[A-Z_]{1,100}$/.test(parsed.error||''))deny(parsed.error);
      deny('SAM_AUTH_CHILD_FAILED');
    }
    const expected=kind==='modal'?'MODAL_READONLY_AUTHENTICATION':'PUBLISHER_READONLY_AUTHENTICATION';
    const fields=kind==='modal'?
      'activeSandboxes,authenticated,environment,environmentId,guestCreations,kind,modelCalls,sdk,tokenIdSha256,workspace':
      'appId,expiresAt,installationId,kind,mainCommit,mainProtected,permissions,repository,repositoryId,repositoryWrites,tokenRevoked';
    if(parsed.kind!==expected||Object.keys(parsed).sort().join(',')!==fields||
       kind==='github'&&parsed.tokenRevoked!==true)deny('SAM_AUTH_CHILD_RESULT_DENIED');
    if(kind==='modal'){
      if(parsed.authenticated!==true||parsed.sdk!=='0.11.1'||parsed.workspace!=='ceo-53153'||
         parsed.tokenIdSha256!==(env.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256??TOKEN_ID_SHA)||parsed.environment!=='main'||
         !/^en-[A-Za-z0-9]+$/.test(parsed.environmentId||'')||parsed.activeSandboxes!==0||
         parsed.guestCreations!==0||parsed.modelCalls!==0)deny('SAM_AUTH_CHILD_RESULT_DENIED');
    }else{
      const {PROFILE,PERMISSIONS}=require('./publisher_identity.cjs');
      if(parsed.appId!==PROFILE.appId||parsed.installationId!==PROFILE.installationId||
         parsed.repository!==PROFILE.repository||parsed.repositoryId!==PROFILE.repositoryId||
         parsed.mainProtected!==true||parsed.repositoryWrites!==0||
         !/^[a-f0-9]{40}$/.test(parsed.mainCommit||'')||
         !parsed.permissions||Object.keys(parsed.permissions).sort().join(',')!=='contents,metadata,pull_requests'||
         Object.entries(PERMISSIONS).some(([name,value])=>parsed.permissions[name]!==value)||
         !Number.isFinite(Date.parse(parsed.expiresAt))||Date.parse(parsed.expiresAt)<=Date.now()||
         Date.parse(parsed.expiresAt)>Date.now()+3630000)deny('SAM_AUTH_CHILD_RESULT_DENIED');
    }
    results[kind]=parsed;
  }
  return {kind:'TRUSTED_AUTH_PREFLIGHT',...results,publicationEnabled:false,modelCalls:0,guestCreations:0};
}
module.exports={TOKEN_ID_SHA,NPM_ARGS,childEnvironment,scrubVault,inspectModal,inspectGithub,runChildren};
if(require.main===module){
  (async()=>{
    if(process.getuid?.()!==0)deny('SAM_AUTH_ROOT_OPERATOR_REQUIRED');
    const kind=process.argv[2];
    if(kind!=='modal'&&kind!=='github')deny('SAM_AUTH_CHILD_DENIED');
    const result=kind==='modal'?await inspectModal(process.env):await inspectGithub(process.env);
    process.stdout.write(JSON.stringify(result));
  })().catch(error=>{
    const code=/^(SAM_AUTH_|PUBLISHER_)[A-Z_]+$/.test(error?.message||'')?error.message:'SAM_AUTH_FAILED';
    process.stdout.write(JSON.stringify({ok:false,error:code}));process.exitCode=1;
  });
}
