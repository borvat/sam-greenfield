// Synthetic RSA only; never reads process.env, disk secrets, Render or GitHub.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {generateKeyPairSync,createPublicKey,verify,createHash}=require('node:crypto');
const p=require('../../deploy/hermes-coding/publisher_identity.cjs');
const pair=generateKeyPairSync('rsa',{modulusLength:2048});
const pem=pair.privateKey.export({format:'pem',type:'pkcs1'});
const fp=createHash('sha256').update(pair.publicKey.export({format:'der',type:'spki'})).digest('base64');
const now=1792990800;
const installation=()=>({id:p.PROFILE.installationId,app_id:p.PROFILE.appId,app_slug:p.PROFILE.slug,
  account:{login:'borvat'},repository_selection:'selected',suspended_at:null,permissions:{...p.PERMISSIONS}});
const token=()=>({token:'SYNTHETIC_NOT_A_REAL_TOKEN_'+'x'.repeat(520),repository_selection:'selected',
  repositories:[{id:p.PROFILE.repositoryId,full_name:p.PROFILE.repository}],permissions:{...p.PERMISSIONS},
  expires_at:new Date(now*1000+3600000).toISOString()});

test('synthetic key fingerprint matches independent DER public-key hashing',()=>{
  const key=p.parseSigningKey(pem,fp);assert.equal(p.fingerprint(key),fp);
});
test('malformed, oversized, non-RSA and mismatched keys fail without echoing secret',()=>{
  const ec=generateKeyPairSync('ec',{namedCurve:'prime256v1'}).privateKey.export({format:'pem',type:'pkcs8'});
  for(const value of ['SYNTHETIC_SECRET_CANARY',pem+'x'.repeat(17000),ec,pem]){
    assert.throws(()=>p.parseSigningKey(value,'wrong-fingerprint'),err=>
      /^PUBLISHER_/.test(err.message)&&!err.message.includes(value));
  }
});
test('disabled publisher never parses the available operator secret',()=>{
  assert.throws(()=>p.loadOperatorKey({SAM_GITHUB_PUBLISHER_ENABLED:'0','sam-github-publisher.pem':'CANARY_ONLY'}),/PUBLISHER_DISABLED/);
});
test('saved dot-containing environment alias is handled directly and bound to production fingerprint',()=>{
  assert.throws(()=>p.loadOperatorKey({SAM_GITHUB_PUBLISHER_ENABLED:'1','sam-github-publisher.pem':pem}),/PUBLISHER_KEY_FINGERPRINT_DENIED/);
});
test('conflicting secret sources and generic GitHub tokens are refused',()=>{
  assert.throws(()=>p.loadOperatorKey({SAM_GITHUB_PUBLISHER_ENABLED:'1',SAM_GITHUB_APP_PRIVATE_KEY:'a','sam-github-publisher.pem':'b'}),/SOURCE_CONFLICT/);
  assert.throws(()=>p.loadOperatorKey({SAM_GITHUB_PUBLISHER_ENABLED:'1',GITHUB_TOKEN:'CANARY_ONLY'}),/KEY_FORMAT_DENIED/);
});
test('JWT signature verifies independently, with fixed issuer and short bounded lifetime',()=>{
  const jwt=p.createAppJwt(p.parseSigningKey(pem,fp),now);
  const parts=jwt.split('.'),header=JSON.parse(Buffer.from(parts[0],'base64url')),
    payload=JSON.parse(Buffer.from(parts[1],'base64url'));
  assert.equal(header.alg,'RS256');assert.equal(payload.iss,p.PROFILE.clientId);
  assert.equal(payload.iat,now-60);assert.equal(payload.exp,now+300);
  assert(verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey(pair.privateKey),Buffer.from(parts[2],'base64url')));
  assert.throws(()=>p.createAppJwt(pair.privateKey,NaN),/TIME_DENIED/);
});
test('installation identity requires selected repositories and exact minimal grants',()=>{
  assert.equal(p.validateInstallation(installation()).appId,p.PROFILE.appId);
  for(const changes of [{id:1},{app_id:1},{app_slug:'other'},{account:{login:'other'}},
    {repository_selection:'all'},{suspended_at:'2026-01-01'},{permissions:{...p.PERMISSIONS,administration:'read'}},
    {permissions:{...p.PERMISSIONS,actions:'read'}},{permissions:{contents:'read',pull_requests:'write',metadata:'read'}}]){
    assert.throws(()=>p.validateInstallation({...installation(),...changes}),/PUBLISHER_/);
  }
});
test('token request always specifies exactly one immutable repository ID and minimal permissions',()=>{
  assert.deepEqual(p.installationTokenRequest(),{method:'POST',path:'/app/installations/175336519/access_tokens',
    body:{repository_ids:[1408209483],permissions:{contents:'write',pull_requests:'write',metadata:'read'}}});
});
test('long-format synthetic token validates without returning secret in public evidence',()=>{
  const result=p.validateTokenResponse(token(),now*1000);
  assert.equal(result.repository,p.PROFILE.repository);
  assert(!JSON.stringify(result).includes(token().token));assert(!('token' in result));
});
test('expanded repo scope, permissions, expired/unbounded lifetime or malformed token fail closed',()=>{
  for(const changes of [{repository_selection:'all'},{repositories:[]},
    {repositories:[...token().repositories,{id:2,full_name:'borvat/other'}]},
    {repositories:[{id:2,full_name:p.PROFILE.repository}]},
    {permissions:{...p.PERMISSIONS,secrets:'read'}},{permissions:{...p.PERMISSIONS,deployments:'write'}},
    {expires_at:new Date(now*1000-1).toISOString()},
    {expires_at:new Date(now*1000+7200000).toISOString()},{expires_at:'invalid'},{token:'x'}]){
    assert.throws(()=>p.validateTokenResponse({...token(),...changes},now*1000),/PUBLISHER_/);
  }
});
