// Prepare an UNTRUSTED operator key for explicit owner review. This script does
// not attest ownership, sign approval payloads, register trust, alter a release,
// change credentials, access a database, or make a model/network call.
const fs=require('node:fs');
const path=require('node:path');
const {generateKeyPairSync,createHash}=require('node:crypto');
function preparePendingSigner(directory,request,now=Date.now()){
 const allowed=['kind','baseCommit','budgetCeilingUsd','lifetimeMinutes','dataScope'];
 if(!request||Object.keys(request).some(k=>!allowed.includes(k))||request.kind!=='SAM_PENDING_SIGNER_REQUEST'||
  !/^[a-f0-9]{40}$/.test(request.baseCommit)||request.dataScope!=='SYNTHETIC_READ_ONLY'||
  !Number.isFinite(request.budgetCeilingUsd)||request.budgetCeilingUsd<=0||request.budgetCeilingUsd>0.30||
  !Number.isSafeInteger(request.lifetimeMinutes)||request.lifetimeMinutes<1||request.lifetimeMinutes>60)throw Error('PENDING_SIGNER_SCOPE_INVALID');
 const target=path.resolve(directory),cwd=path.resolve(process.cwd());
 if(!path.isAbsolute(directory)||target===cwd||target.startsWith(cwd+path.sep)||
  fs.realpathSync(path.dirname(target))!==path.dirname(target))throw Error('PRIVATE_OPERATOR_DIRECTORY_REQUIRED');
 // Never reuse a fixture key, overwrite an existing identity, or place key
 // material inside the current repository. The new directory is private.
 fs.mkdirSync(target,{mode:0o700});
 try{
  const pair=generateKeyPairSync('ed25519');
  const publicDer=pair.publicKey.export({type:'spki',format:'der'});
  const scope={version:1,status:'PENDING_OWNER_ATTESTATION',keyOrigin:'NEW_OPERATOR_KEY_NOT_OWNER_ATTESTED',
   publicKeyFingerprint:'sha256:'+createHash('sha256').update(publicDer).digest('hex'),
   baseCommit:request.baseCommit,budgetCeilingUsd:request.budgetCeilingUsd,dataScope:request.dataScope,
   preparedAt:new Date(now).toISOString(),expiresAt:new Date(now+request.lifetimeMinutes*60000).toISOString(),
   releaseActivation:false,databaseGrants:false,modelCalls:0};
  fs.writeFileSync(path.join(target,'private-key.pem'),pair.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600,flag:'wx'});
  fs.writeFileSync(path.join(target,'public-key.pem'),pair.publicKey.export({type:'spki',format:'pem'}),{mode:0o600,flag:'wx'});
  fs.writeFileSync(path.join(target,'pending-scope.json'),JSON.stringify(scope,null,2),{mode:0o600,flag:'wx'});
  return scope;
 }catch(error){fs.rmSync(target,{recursive:true,force:true});throw error;}
}
module.exports={preparePendingSigner};
if(require.main===module){
 try{const input=fs.readFileSync(0,'utf8');if(Buffer.byteLength(input)>4096)throw Error('INPUT_TOO_LARGE');
  console.log(JSON.stringify(preparePendingSigner(process.argv[2],JSON.parse(input))));
 }catch{console.error('PENDING_SIGNER_PREPARATION_FAILED');process.exitCode=1;}
}
