'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const auth=require('../../deploy/hermes-coding/trusted_auth_preflight.cjs');
const id='ak-SYNTHETIC_ID',secret='as-SYNTHETIC_SECRET',pem='SYNTHETIC_GITHUB_KEY';
const env={SAM_MODAL_OPERATOR_TOKEN_ID:id,SAM_MODAL_OPERATOR_TOKEN_SECRET:secret,
  'sam-github-publisher.pem':pem,DEEPSEEK_API_KEY:'SYNTHETIC_PAID_MODEL_KEY',
  DATABASE_URL:'SYNTHETIC_DATABASE',NODE_OPTIONS:'SYNTHETIC_PRELOAD',SAM_TEST_BEARER_TOKEN:'SYNTHETIC_SAM_TOKEN'};
const digest=createHash('sha256').update(id).digest('hex');
function fixture(options={}){
  const calls=[];let closed=false;
  class Client{
    constructor(params){
      calls.push(['constructor',params]);
      this.environments={fromName:async(...args)=>{
        calls.push(['environment',...args]);if(options.failure)throw Error(secret);
        return {name:'main',environmentId:'en-SYNTHETIC123'};
      }};
      this.sandboxes={list:async function* (...args){calls.push(['inventory',...args]);if(options.active)yield {sandboxId:'sb-SYNTHETIC'}}};
    }
    version(){return options.version??'0.11.1'}
    close(){closed=true}
  }
  return {Client,calls,closed:()=>closed};
}
test('Modal child receives only its own credential and safe process variables',()=>{
  const result=auth.childEnvironment(env,'modal');
  assert.deepEqual(Object.keys(result).sort(),['HOME','PATH','SAM_MODAL_OPERATOR_TOKEN_ID','SAM_MODAL_OPERATOR_TOKEN_SECRET','TMPDIR']);
  assert.ok(!JSON.stringify(result).includes(pem));
  assert.ok(!JSON.stringify(result).includes('SYNTHETIC_PAID_MODEL_KEY'));
});
test('GitHub child receives no Modal/model/PG/SAM credential or preload',()=>{
  assert.deepEqual(Object.keys(auth.childEnvironment(env,'github')).sort(),['HOME','PATH','TMPDIR','sam-github-publisher.pem']);
});
test('original SAM retains its existing bearer/DB settings but loses vault credentials',()=>{
  const result=auth.scrubVault({...env});
  assert.equal(result.SAM_TEST_BEARER_TOKEN,env.SAM_TEST_BEARER_TOKEN);
  assert.equal(result.DATABASE_URL,env.DATABASE_URL);
  assert.equal(result['sam-github-publisher.pem'],undefined);
  assert.equal(result.SAM_MODAL_OPERATOR_TOKEN_SECRET,undefined);
});
test('wrong account token fails before SDK loading or network',async()=>{
  const f=fixture();await assert.rejects(auth.inspectModal(env,f.Client),/SAM_AUTH_MODAL_ACCOUNT_BINDING_DENIED/);
  assert.equal(f.calls.length,0);
});
test('placeholder/empty credential fails before SDK loading',async()=>{
  const f=fixture();await assert.rejects(auth.inspectModal({...env,SAM_MODAL_OPERATOR_TOKEN_SECRET:'OWNER_INPUT_REQUIRED'},f.Client,digest),/CREDENTIAL_FORMAT_DENIED/);
  assert.equal(f.calls.length,0);
});
test('authenticated inventory is read-only and sanitized; client closes',async()=>{
  const f=fixture(),result=await auth.inspectModal(env,f.Client,digest);
  assert.equal(result.authenticated,true);assert.equal(result.activeSandboxes,0);
  assert.equal(result.guestCreations,0);assert.equal(result.modelCalls,0);
  assert.deepEqual(f.calls.slice(1),[['environment','main',{createIfMissing:false}],['inventory',{environment:'main'}]]);
  assert.equal(f.calls[0][1].maxRetries,0);assert.equal(f.calls[0][1].endpoint,'https://api.modal.com');
  assert.ok(!JSON.stringify(result).includes(secret));assert.equal(f.closed(),true);
});
test('active work forces reconciliation without termination or creation',async()=>{
  const f=fixture({active:true});await assert.rejects(auth.inspectModal(env,f.Client,digest),/ACTIVE_SANDBOX_RECONCILE/);
  assert.equal(f.closed(),true);
});
test('SDK version drift is refused and client closes',async()=>{
  const f=fixture({version:'OTHER'});await assert.rejects(auth.inspectModal(env,f.Client,digest),/SDK_VERSION_DENIED/);
  assert.equal(f.calls.length,1);assert.equal(f.closed(),true);
});
test('provider exceptions cannot expose synthetic credential contents',async()=>{
  const f=fixture({failure:true});await assert.rejects(auth.inspectModal(env,f.Client,digest),{message:'SAM_AUTH_MODAL_REQUEST_FAILED'});
  assert.equal(f.closed(),true);
});
test('extra child output cannot smuggle a credential into a parent receipt',()=>{
  assert.throws(()=>auth.runChildren(env,()=>({status:0,stdout:JSON.stringify({kind:'MODAL_READONLY_AUTHENTICATION',secret})})),/RESULT_DENIED/);
});
test('well-shaped but failed Modal receipt cannot authorize GitHub authentication',()=>{
  const receipt={kind:'MODAL_READONLY_AUTHENTICATION',sdk:'0.11.1',authenticated:false,
    workspace:'ceo-53153',tokenIdSha256:auth.TOKEN_ID_SHA,environment:'main',environmentId:'en-SYNTHETIC',
    activeSandboxes:0,guestCreations:0,modelCalls:0};
  let count=0;
  assert.throws(()=>auth.runChildren(env,()=>{count++;return {status:0,stdout:JSON.stringify(receipt)}}),/RESULT_DENIED/);
  assert.equal(count,1);
});
test('negative child status remains failure even with success-shaped output',()=>{
  assert.throws(()=>auth.runChildren(env,()=>({status:1,stdout:JSON.stringify({kind:'MODAL_READONLY_AUTHENTICATION'})})),/CHILD_FAILED/);
});
test('all SDK artifacts are integrity pinned; install hooks and native optional modules are disabled',()=>{
  const lock=JSON.parse(fs.readFileSync(require.resolve('../../deploy/hermes-coding/operator-sdk/package-lock.json'),'utf8'));
  assert.equal(lock.packages['node_modules/modal'].version,'0.11.1');
  for(const [name,value] of Object.entries(lock.packages)){
    if(!name)continue;
    assert.match(value.resolved,/^https:\/\/registry\.npmjs\.org\//);
    assert.match(value.integrity,/^sha512-/);
    if(value.hasInstallScript)assert.ok(name==='node_modules/protobufjs'||value.optional===true);
  }
  assert.ok(auth.NPM_ARGS.includes('--ignore-scripts'));
  assert.ok(auth.NPM_ARGS.includes('--omit=optional'));
  assert.ok(Object.isFrozen(auth.NPM_ARGS));
});
test('private operator binding reaches only Modal and authenticates exact replacement identity',async()=>{
  const bound={...env,SAM_MODAL_EXPECTED_TOKEN_ID_SHA256:digest};
  const modal=auth.childEnvironment(bound,'modal');
  assert.equal(modal.SAM_MODAL_EXPECTED_TOKEN_ID_SHA256,digest);
  assert.equal(auth.childEnvironment(bound,'github').SAM_MODAL_EXPECTED_TOKEN_ID_SHA256,undefined);
  const f=fixture();assert.equal((await auth.inspectModal(modal,f.Client)).authenticated,true);
  const wrong=fixture();await assert.rejects(auth.inspectModal({...modal,SAM_MODAL_EXPECTED_TOKEN_ID_SHA256:'0'.repeat(64)},wrong.Client),/ACCOUNT_BINDING_DENIED/);
  assert.equal(wrong.calls.length,0);
  const malformed=fixture();await assert.rejects(auth.inspectModal({...modal,SAM_MODAL_EXPECTED_TOKEN_ID_SHA256:''},malformed.Client),/ACCOUNT_BINDING_DENIED/);
  assert.equal(malformed.calls.length,0);
});
