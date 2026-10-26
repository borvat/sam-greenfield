/** UNREGISTERED trusted-host identity check. No repository writes or model API.
 * Credential material stays in this process; all responses/errors are sanitized.
 */
'use strict';
const https=require('node:https');
const identity=require('./publisher_identity.cjs');
const {PROFILE}=identity;
const INSTALLATION='/app/installations/'+PROFILE.installationId;
const TOKEN=INSTALLATION+'/access_tokens';
const REPOSITORIES='/installation/repositories?per_page=100';
const MAIN='/repos/'+PROFILE.repository+'/branches/main';
const REVOKE='/installation/token';
const ALLOWED=new Set(['GET '+INSTALLATION,'POST '+TOKEN,'GET '+REPOSITORIES,'GET '+MAIN,'DELETE '+REVOKE]);
function denied(code){throw new Error(code)}

function request(method,path,credential,body){
  if(!ALLOWED.has(method+' '+path))denied('PUBLISHER_PREFLIGHT_ROUTE_DENIED');
  return new Promise((resolve,reject)=>{
    const fail=()=>reject(new Error('PUBLISHER_PREFLIGHT_TRANSPORT_FAILED'));
    const data=body===undefined?null:Buffer.from(JSON.stringify(body));
    const req=https.request({hostname:'api.github.com',port:443,method,path,
      headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',
        'User-Agent':'sam-bounded-publisher-preflight',Authorization:'Bearer '+credential,
        ...(data?{'Content-Type':'application/json','Content-Length':data.length}:{})}},res=>{
      let size=0;const chunks=[];
      res.on('error',fail);
      res.on('data',chunk=>{
        size+=chunk.length;
        if(size>65536){req.destroy();fail();return}
        chunks.push(chunk);
      });
      res.on('end',()=>{
        if(res.statusCode!==(method==='POST'?201:method==='DELETE'?204:200)){
          reject(new Error('PUBLISHER_PREFLIGHT_HTTP_DENIED'));return;
        }
        if(method==='DELETE'){resolve(null);return}
        try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}
        catch{reject(new Error('PUBLISHER_PREFLIGHT_RESPONSE_DENIED'))}
      });
    });
    const deadline=setTimeout(()=>req.destroy(),15000);
    req.once('close',()=>clearTimeout(deadline));
    req.on('error',fail);req.setTimeout(15000,()=>req.destroy());
    if(data)req.write(data);req.end();
  });
}

async function inspectWithKey(key,transport=request,now=Date.now()){
  const jwt=identity.createAppJwt(key,Math.floor(now/1000));
  let token,receipt;
  try{
    const installation=await transport('GET',INSTALLATION,jwt);
    identity.validateInstallation(installation);
    const mint=identity.installationTokenRequest();
    const response=await transport(mint.method,mint.path,jwt,mint.body);
    // Revoke even if permission/repository validation subsequently rejects it.
    token=typeof response?.token==='string'?response.token:undefined;
    const scope=identity.validateTokenResponse(response,now);
    const repositories=await transport('GET',REPOSITORIES,token);
    if(repositories?.total_count!==1||!Array.isArray(repositories.repositories)||
       repositories.repositories.length!==1||repositories.repositories[0].id!==PROFILE.repositoryId||
       repositories.repositories[0].full_name!==PROFILE.repository)
      denied('PUBLISHER_PREFLIGHT_REPOSITORY_SCOPE_DENIED');
    const main=await transport('GET',MAIN,token);
    if(main?.name!=='main'||main.protected!==true||
       !/^[a-f0-9]{40}$/.test(main.commit?.sha||''))denied('PUBLISHER_PREFLIGHT_MAIN_PROTECTION_DENIED');
    receipt={kind:'PUBLISHER_READONLY_AUTHENTICATION',appId:PROFILE.appId,
      installationId:PROFILE.installationId,...scope,mainProtected:true,
      mainCommit:main.commit.sha,repositoryWrites:0};
  }catch(error){
    // Preserve bounded local validation codes only. Never forward provider bodies,
    // request headers, exception messages containing key/token bytes or objects.
    const code=error instanceof Error?error.message:'';
    denied(/^PUBLISHER_[A-Z_]{1,100}$/.test(code)?code:'PUBLISHER_PREFLIGHT_FAILED');
  }finally{
    if(token){
      try{await transport('DELETE',REVOKE,token)}
      catch{denied('PUBLISHER_PREFLIGHT_TOKEN_REVOCATION_UNCONFIRMED')}
      token=undefined;
    }
  }
  return {...receipt,tokenRevoked:true};
}

async function inspectOperatorIdentity(env=process.env){
  return inspectWithKey(identity.loadOperatorKey(env));
}
module.exports={inspectOperatorIdentity,inspectWithKey};
