const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {createPublicKey,createPrivateKey,sign,verify}=require('node:crypto');
const {preparePendingSigner}=require('../../scripts/evaluation/prepare-pending-signer.cjs');
const request={kind:'SAM_PENDING_SIGNER_REQUEST',baseCommit:'a'.repeat(40),budgetCeilingUsd:0.30,lifetimeMinutes:60,dataScope:'SYNTHETIC_READ_ONLY'};
test('invalid or self-attested scope is rejected before any key is created',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sam-pending-key-test-'));
 try{for(const change of [{budgetCeilingUsd:0.31},{budgetCeilingUsd:-1},{lifetimeMinutes:61},{baseCommit:'invalid'},{dataScope:'BUSINESS_DATA'},{ownerAttested:true}]){
  const target=path.join(root,'refused');assert.throws(()=>preparePendingSigner(target,{...request,...change}));assert(!fs.existsSync(target));
 }}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('pending key has private custody, cannot overwrite, and conveys no owner/release authority',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sam-pending-key-test-')),target=path.join(root,'identity');
 try{
  const scope=preparePendingSigner(target,request,1000);assert.equal(scope.status,'PENDING_OWNER_ATTESTATION');
  assert.equal(scope.releaseActivation,false);assert.equal(scope.databaseGrants,false);assert.equal(scope.modelCalls,0);
  assert.equal(fs.statSync(target).mode&0o777,0o700);
  for(const name of ['private-key.pem','public-key.pem','pending-scope.json'])assert.equal(fs.statSync(path.join(target,name)).mode&0o777,0o600);
  const secret=createPrivateKey(fs.readFileSync(path.join(target,'private-key.pem'))),publicKey=createPublicKey(fs.readFileSync(path.join(target,'public-key.pem')));
  // This validates the pending key pair only; it is deliberately not an owner
  // approval payload, permit, runtime trust root, fixture-to-owner promotion.
  const message=Buffer.from('UNTRUSTED_KEY_PAIR_TEST');assert(verify(null,message,publicKey,sign(null,message,secret)));
  assert.throws(()=>preparePendingSigner(target,request));
  assert(!JSON.stringify(scope).includes('PRIVATE KEY'));assert(!JSON.stringify(scope).includes('owner-attested'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
