"use strict";
const {createPublicKey}=require("node:crypto");
const {validateReleaseDatabase}=require("../release/contract.cjs");
const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const identifier=/^[a-z_][a-z0-9_]{0,62}$/;
function deny(code){throw new Error(code);}
function integer(value,min,max){const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)deny("DIRECT_LIMIT_REQUIRED");return n;}
function tenant(env){
  const org=env.SAM_RELEASE_ORG_ID,entity=env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID;
  if(!uuid.test(org??"")||!uuid.test(entity??""))deny("DIRECT_TENANT_REQUIRED");
  const schema=env.SAM_DB_SCHEMA??"sam",role=env.SAM_DB_APP_ROLE??"sam_runtime";
  if(!identifier.test(schema)||schema==="public"||schema.startsWith("pg_")||
    !identifier.test(role)||/^(postgres|admin|root|neondb_owner)$/.test(role))deny("DIRECT_DATABASE_SCOPE_REQUIRED");
  return {orgId:org.toLowerCase(),entityId:entity.toLowerCase(),schema,role};
}
function limits(env){return {goalsPerDay:integer(env.SAM_DIRECT_GOALS_PER_DAY,1,1000),
  modelCallsPerDay:integer(env.SAM_DIRECT_MODEL_CALLS_PER_DAY,1,1000),
  planningMaxCostUsd:(()=>{const n=Number(env.SAM_DIRECT_PLAN_BUDGET_USD);if(!Number.isFinite(n)||n<=0||n>10)deny("DIRECT_PLAN_BUDGET_REQUIRED");return n;})()};}
function oauth(env){
  const t=tenant(env);
  let resource,issuer;
  try{resource=new URL(env.SAM_MCP_OAUTH_RESOURCE);issuer=new URL(env.SAM_MCP_OAUTH_ISSUER);}catch{deny("DIRECT_OAUTH_REQUIRED");}
  if(resource.protocol!=="https:"||resource.pathname!=="/mcp"||resource.username||resource.password||resource.search||resource.hash||
    resource.href!==env.SAM_MCP_OAUTH_RESOURCE||issuer.protocol!=="https:"||issuer.username||issuer.password||issuer.search||issuer.hash||
    issuer.href!==env.SAM_MCP_OAUTH_ISSUER||!issuer.pathname.endsWith("/"))deny("DIRECT_OAUTH_REQUIRED");
  const subject=env.SAM_MCP_OAUTH_SUBJECT,clientId=env.SAM_MCP_OAUTH_CLIENT_ID;
  if(!subject||!clientId||subject.length>256||clientId.length>256)deny("DIRECT_OAUTH_OWNER_REQUIRED");
  const keys=new Map();
  try{
    const jwks=JSON.parse(env.SAM_MCP_OAUTH_PUBLIC_JWKS??"");
    if(!Array.isArray(jwks.keys)||jwks.keys.length<1||jwks.keys.length>4)deny("DIRECT_JWKS_REQUIRED");
    for(const key of jwks.keys){
      if(key.kty!=="RSA"||key.alg!=="RS256"||key.use!=="sig"||!/^[-a-zA-Z0-9_]{1,80}$/.test(key.kid??"")||keys.has(key.kid)||
        ["d","p","q","dp","dq","qi","oth"].some(k=>Object.hasOwn(key,k)))deny("DIRECT_JWKS_REQUIRED");
      const publicKey=createPublicKey({key,format:"jwk"});
      if((publicKey.asymmetricKeyDetails?.modulusLength??0)<2048)deny("DIRECT_JWKS_REQUIRED");
      keys.set(key.kid,publicKey);
    }
  }catch{deny("DIRECT_JWKS_REQUIRED");}
  return {...t,resource:resource.href,issuer:issuer.href,claimNamespace:resource.origin+"/sam",subject,clientId,
    keys,runId:t.orgId,deadline:Number.MAX_SAFE_INTEGER,maxGoals:limits(env).goalsPerDay,executive:true};
}
function configuration(env){
  if(env.SAM_EXECUTIVE_MCP!=="1"||env.NODE_ENV!=="production"||env.SAM_DATABASE_TARGET!=="production")deny("DIRECT_EXECUTIVE_CONFIGURATION_REQUIRED");
  if(env.SAM_PROVISION_DATABASE_URL||env.SAM_RUNTIME_PASSWORD||env.SAM_RELEASE_SETUP_MODE==="1"||
    env.SAM_RELEASE_SYNTHETIC_PLANNER==="1")deny("DIRECT_ADMIN_OR_SETUP_ENV_FORBIDDEN");
  const identity=tenant(env),auth=oauth(env),budget=limits(env);
  if(!env.SAM_RELEASE_DATABASE_URL?.trim())deny("DIRECT_RUNTIME_CONNECTION_REQUIRED");
  const normalized={...env,SAM_DB_SCHEMA:identity.schema,SAM_DB_APP_ROLE:identity.role,
    SAM_DB_CONNECTION_SOURCE:"independent",SAM_DB_CONNECTION_MODE:"direct"};
  const {databaseUrl}=validateReleaseDatabase(normalized);
  const connection=new URL(databaseUrl);
  connection.searchParams.set("options",`-c search_path=${identity.schema},pg_catalog,pg_temp -c app.current_org_id=${identity.orgId} -c app.current_legal_entity_id=${identity.entityId}`);
  const port=integer(env.PORT??5000,1,65535),tickMs=integer(env.SAM_DIRECT_TICK_MS??1000,250,60000);
  const capabilities=(env.SAM_RELEASE_CAPABILITIES??"").split(",").map(x=>x.trim());
  if(!capabilities.length||new Set(capabilities).size!==capabilities.length||
    capabilities.some(x=>!/^[-a-zA-Z0-9_.]{1,80}$/.test(x)))deny("DIRECT_CAPABILITIES_REQUIRED");
  return {...identity,oauth:auth,budget,databaseUrl:connection.href,port,tickMs,capabilities,host:new URL(auth.resource).hostname,
    origin:new URL(auth.resource).origin};
}
module.exports={tenant,limits,oauth,configuration};
