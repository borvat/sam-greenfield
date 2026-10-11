"use strict";
const {createPublicKey}=require("node:crypto");
function deny(){throw new Error("MCP_OAUTH_CONFIGURATION_REQUIRED");}
function https(value){
  let u;try{u=new URL(value);}catch{deny();}
  if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)deny();
  return value;
}
// Public verification material only. No signing keys, discovery fetching or
// credential provisioning. The external authorization server must be reviewed.
function oauthResourceConfig(env,now=Date.now()){
  if(env.SAM_MCP_OAUTH_APPROVED!=="1"||env.SAM_MCP_SYNTHETIC_TOOLS!=="1"||
    env.NODE_ENV!=="production"||env.SAM_RELEASE_APPROVED!=="1"||
    env.SAM_DATABASE_TARGET!=="production")deny();
  const resource=https(env.SAM_MCP_OAUTH_RESOURCE),issuer=https(env.SAM_MCP_OAUTH_ISSUER);
  if(new URL(resource).pathname!=="/mcp"||
    !(env.SAM_COMMAND_CENTER_ALLOWED_HOSTS??"").split(",").map(x=>x.trim()).includes(new URL(resource).hostname))deny();
  const subject=env.SAM_MCP_OAUTH_SUBJECT,clientId=env.SAM_MCP_OAUTH_CLIENT_ID;
  if(!subject||!clientId||subject.length>256||clientId.length>256)deny();
  const ids=[env.SAM_RELEASE_ORG_ID,env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,env.SAM_PILOT_RUN_ID];
  if(ids.some(x=>!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(x??"")))deny();
  const deadline=Date.parse(env.SAM_PILOT_EXPIRES_AT);
  if(!Number.isFinite(deadline)||deadline<=now||deadline>now+86400000)deny();
  const maxGoals=Number(env.SAM_PILOT_MAX_REQUESTS);
  if(!Number.isInteger(maxGoals)||maxGoals<1||maxGoals>4)deny();
  const keys=new Map();
  try{
    const jwks=JSON.parse(env.SAM_MCP_OAUTH_PUBLIC_JWKS??"");
    if(!Array.isArray(jwks.keys)||jwks.keys.length<1||jwks.keys.length>4)deny();
    for(const key of jwks.keys){
      if(key.kty!=="RSA"||key.alg!=="RS256"||key.use!=="sig"||
        !/^[a-zA-Z0-9_-]{1,80}$/.test(key.kid??"")||keys.has(key.kid)||
        ["d","p","q","dp","dq","qi","oth"].some(k=>Object.hasOwn(key,k)))deny();
      const publicKey=createPublicKey({key,format:"jwk"});
      if((publicKey.asymmetricKeyDetails?.modulusLength??0)<2048)deny();
      keys.set(key.kid,publicKey);
    }
  }catch{deny();}
  return {resource,issuer,subject,clientId,orgId:ids[0].toLowerCase(),
    entityId:ids[1].toLowerCase(),runId:ids[2].toLowerCase(),keys,deadline,maxGoals};
}
module.exports={oauthResourceConfig};
