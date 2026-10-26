/** Trusted-controller identity primitives. UNREGISTERED: no network or publishing.
 * Never import this module into a candidate runner or pass its result to a model.
 * The real operator key is read only on explicit activation, not at module load.
 */
'use strict';
const {createPrivateKey,createPublicKey,createHash,sign}=require('node:crypto');
const PROFILE=Object.freeze({appId:5475103,clientId:'Iv23liv7FK1qJBdSXbKy',
  slug:'sam-bounded-publisher-borvat',installationId:175336519,owner:'borvat',
  repositoryId:1408209483,repository:'borvat/sam-greenfield',
  fingerprint:'gKgrlZaOgk8D7goI6VIoF2gjAHQnazPU9tQChUIwOSA='});
const PERMISSIONS=Object.freeze({contents:'write',pull_requests:'write',metadata:'read'});
function deny(code){throw new Error(code)}
function fingerprint(key){
  return createHash('sha256').update(createPublicKey(key).export({type:'spki',format:'der'})).digest('base64');
}
function parseSigningKey(pem,expectedFingerprint){
  if(typeof pem!=='string'||Buffer.byteLength(pem)>16384||!pem.startsWith('-----BEGIN ')||!pem.includes('PRIVATE KEY-----'))deny('PUBLISHER_KEY_FORMAT_DENIED');
  let key;
  try{key=createPrivateKey(pem)}catch{deny('PUBLISHER_KEY_FORMAT_DENIED')}
  if(key.asymmetricKeyType!=='rsa'||key.asymmetricKeyDetails.modulusLength<2048)deny('PUBLISHER_RSA_REQUIRED');
  if(fingerprint(key)!==expectedFingerprint)deny('PUBLISHER_KEY_FINGERPRINT_DENIED');
  return key;
}
function loadOperatorKey(env=process.env){
  if(env.SAM_GITHUB_PUBLISHER_ENABLED!=='1')deny('PUBLISHER_DISABLED');
  const canonical=env.SAM_GITHUB_APP_PRIVATE_KEY;
  const savedAlias=env['sam-github-publisher.pem'];
  if(canonical!==undefined&&savedAlias!==undefined&&canonical!==savedAlias)deny('PUBLISHER_KEY_SOURCE_CONFLICT');
  // Exact saved Render variable name; never expand it through a shell. No file,
  // command, URL, model output or general GITHUB_TOKEN is an alternative source.
  return parseSigningKey(canonical??savedAlias,PROFILE.fingerprint);
}
function createAppJwt(key,nowSeconds=Math.floor(Date.now()/1000)){
  if(!Number.isSafeInteger(nowSeconds)||nowSeconds<=0)deny('PUBLISHER_TIME_DENIED');
  const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const input=b64({alg:'RS256',typ:'JWT'})+'.'+b64({iat:nowSeconds-60,exp:nowSeconds+300,iss:PROFILE.clientId});
  try{return input+'.'+sign('RSA-SHA256',Buffer.from(input),key).toString('base64url')}
  catch{deny('PUBLISHER_SIGNING_FAILED')}
}
function exactPermissions(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!==Object.keys(PERMISSIONS).sort().join(','))deny('PUBLISHER_PERMISSION_SCOPE_DENIED');
  for(const [name,level] of Object.entries(PERMISSIONS))if(value[name]!==level)deny('PUBLISHER_PERMISSION_SCOPE_DENIED');
}
function validateInstallation(value){
  if(!value||value.id!==PROFILE.installationId||value.app_id!==PROFILE.appId||value.app_slug!==PROFILE.slug||value.account?.login!==PROFILE.owner||value.repository_selection!=='selected'||value.suspended_at!==null)deny('PUBLISHER_INSTALLATION_DENIED');
  exactPermissions(value.permissions);
  return {appId:PROFILE.appId,installationId:PROFILE.installationId,repositorySelection:'selected'};
}
function installationTokenRequest(){
  return {method:'POST',path:'/app/installations/'+PROFILE.installationId+'/access_tokens',
    body:{repository_ids:[PROFILE.repositoryId],permissions:{...PERMISSIONS}}};
}
function validateTokenResponse(value,nowMs=Date.now()){
  if(!value||typeof value.token!=='string'||value.token.length<20||value.token.length>4096||value.repository_selection!=='selected'||!Array.isArray(value.repositories)||value.repositories.length!==1||value.repositories[0].id!==PROFILE.repositoryId||value.repositories[0].full_name!==PROFILE.repository)deny('PUBLISHER_TOKEN_SCOPE_DENIED');
  exactPermissions(value.permissions);
  const expires=Date.parse(value.expires_at);
  if(!Number.isFinite(nowMs)||!Number.isFinite(expires)||expires<=nowMs||expires-nowMs>3630000)deny('PUBLISHER_TOKEN_EXPIRY_DENIED');
  // Do not return the token in evidence, receipts, debug output or telemetry.
  return {repository:PROFILE.repository,repositoryId:PROFILE.repositoryId,
    permissions:{...PERMISSIONS},expiresAt:value.expires_at};
}
module.exports={PROFILE,PERMISSIONS,fingerprint,parseSigningKey,loadOperatorKey,
  createAppJwt,validateInstallation,installationTokenRequest,validateTokenResponse};
