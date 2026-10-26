'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {generateKeyPairSync}=require('node:crypto');
const {PROFILE,PERMISSIONS}=require('../../deploy/hermes-coding/publisher_identity.cjs');
const {inspectOperatorIdentity,inspectWithKey}=require('../../deploy/hermes-coding/publisher_auth_preflight.cjs');
const key=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey;
const NOW=Date.now(),TOKEN='SYNTHETIC_ONLY_12345678901234567890';
function fixture(change={}){
  const calls=[];
  const installation={id:PROFILE.installationId,app_id:PROFILE.appId,app_slug:PROFILE.slug,
    account:{login:PROFILE.owner},repository_selection:'selected',suspended_at:null,permissions:{...PERMISSIONS}};
  const repository={id:PROFILE.repositoryId,full_name:PROFILE.repository};
  const token={token:TOKEN,repository_selection:'selected',permissions:{...PERMISSIONS},repositories:[repository],expires_at:new Date(NOW+3600000).toISOString()};
  const repositories={total_count:1,repositories:[repository]};
  const main={name:'main',protected:true,commit:{sha:'a'.repeat(40)}};
  change.installation?.(installation);change.token?.(token);change.repositories?.(repositories);change.main?.(main);
  async function transport(method,path,credential,body){
    calls.push({method,path,credential,body});
    if(method==='DELETE'){
      assert.equal(path,'/installation/token');assert.equal(credential,TOKEN);
      if(change.revokeFails)throw Error('secret synthetic provider error');return null;
    }
    if(path.startsWith('/app/installations/')){
      assert.match(credential,/^[\w-]+\.[\w-]+\.[\w-]+$/);
      if(method==='GET')return installation;
      assert.equal(method,'POST');
      assert.deepEqual(body,{repository_ids:[PROFILE.repositoryId],permissions:{...PERMISSIONS}});
      return token;
    }
    assert.equal(method,'GET');assert.equal(credential,TOKEN);
    if(path==='/installation/repositories?per_page=100')return repositories;
    assert.equal(path,'/repos/borvat/sam-greenfield/branches/main');return main;
  }
  return {calls,transport};
}
test('one-repo authentication and protected main are read; token is revoked',async()=>{
  const f=fixture(),receipt=await inspectWithKey(key,f.transport,NOW);
  assert.equal(receipt.repositoryWrites,0);assert.equal(receipt.mainProtected,true);assert.equal(receipt.tokenRevoked,true);
  assert.equal(f.calls.length,5);assert.equal(f.calls.at(-1).method,'DELETE');
  assert.ok(!JSON.stringify(receipt).includes(TOKEN));
  assert.ok(!JSON.stringify(receipt).includes(f.calls[0].credential));
});
test('all-repository installation is refused before minting',async()=>{
  const f=fixture({installation:v=>v.repository_selection='all'});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_INSTALLATION_DENIED/);
  assert.equal(f.calls.length,1);
});
test('extra privileges are refused before minting',async()=>{
  const f=fixture({installation:v=>v.permissions.administration='write'});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_PERMISSION_SCOPE_DENIED/);assert.equal(f.calls.length,1);
});
test('overscoped token is revoked even on validation failure',async()=>{
  const f=fixture({token:v=>v.repositories.push({id:1,full_name:'other/repo'})});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_TOKEN_SCOPE_DENIED/);
  assert.equal(f.calls.length,3);assert.equal(f.calls.at(-1).method,'DELETE');
});
test('installation repository inventory is checked independently',async()=>{
  const f=fixture({repositories:v=>v.total_count=2});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_PREFLIGHT_REPOSITORY_SCOPE_DENIED/);
  assert.equal(f.calls.length,4);assert.equal(f.calls.at(-1).method,'DELETE');
});
test('unprotected main is refused without attempting a push',async()=>{
  const f=fixture({main:v=>v.protected=false});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_PREFLIGHT_MAIN_PROTECTION_DENIED/);
  assert.ok(f.calls.every(c=>c.method==='GET'||c.method==='DELETE'||c.path.endsWith('/access_tokens')));
});
test('revocation must be confirmed before success',async()=>{
  const f=fixture({revokeFails:true});
  await assert.rejects(inspectWithKey(key,f.transport,NOW),/PUBLISHER_PREFLIGHT_TOKEN_REVOCATION_UNCONFIRMED/);
});
test('transport details containing synthetic secrets never escape',async()=>{
  await assert.rejects(inspectWithKey(key,async()=>{throw Error(TOKEN)},NOW),{message:'PUBLISHER_PREFLIGHT_FAILED'});
});
test('disabled operator identity cannot start network authentication',async()=>{
  await assert.rejects(inspectOperatorIdentity({GITHUB_TOKEN:TOKEN}),{message:'PUBLISHER_DISABLED'});
});
