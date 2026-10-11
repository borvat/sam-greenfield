import {AsyncLocalStorage} from "node:async_hooks";
import {createHash,verify,type KeyObject} from "node:crypto";
import {createRequire} from "node:module";

export const syntheticScopes=["sam:synthetic:read","sam:synthetic:submit"] as const;
export interface SyntheticPrincipal {
  orgId:string; entityId:string; runId:string; actor:string; scopes:readonly string[]; expiresAt:number; maxGoals:number;
}
export interface OAuthResourceConfig {
  resource:string; issuer:string; subject:string; clientId:string;
  orgId:string; entityId:string; runId:string; keys:Map<string,KeyObject>; deadline:number; maxGoals:number;
}
export const oauthRequest=new AsyncLocalStorage<SyntheticPrincipal>();
const {oauthResourceConfig:configure}=createRequire(import.meta.url)("../../../scripts/release/mcp-oauth.cjs");
export function oauthResourceConfig(env:NodeJS.ProcessEnv):OAuthResourceConfig{
  return configure(env);
}
export function authenticateOAuth(token:string,config:OAuthResourceConfig,now=Math.floor(Date.now()/1000)):SyntheticPrincipal{
  const deny=():never=>{throw new Error("MCP_ACCESS_DENIED");};
  try{
    if(token.length>8192)return deny();
    const parts=token.split(".");
    if(parts.length!==3||parts.some(p=>!p||!/^[a-zA-Z0-9_-]+$/.test(p)))return deny();
    const header=JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8"));
    if(header.alg!=="RS256"||header.typ!=="at+jwt"||
      ["jku","x5u","jwk","crit"].some(k=>Object.hasOwn(header,k)))return deny();
    const key=config.keys.get(header.kid);
    if(!key||!verify("RSA-SHA256",Buffer.from(parts[0]+"."+parts[1]),key,Buffer.from(parts[2],"base64url")))return deny();
    const claims=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8"));
    if(claims.iss!==config.issuer||claims.aud!==config.resource||claims.sub!==config.subject||
      claims.client_id!==config.clientId||claims.org_id!==config.orgId||
      claims.legal_entity_id!==config.entityId||claims.pilot_run_id!==config.runId)return deny();
    if(!Number.isSafeInteger(claims.exp)||!Number.isSafeInteger(claims.iat)||
      claims.exp<=now||claims.iat>now||claims.exp<=claims.iat||claims.exp-claims.iat>3600||
      (claims.nbf!==undefined&&(!Number.isSafeInteger(claims.nbf)||claims.nbf>now)))return deny();
    if(typeof claims.scope!=="string")return deny();
    const scopes=claims.scope.split(" ");
    if(scopes.length<1||new Set(scopes).size!==scopes.length||
      scopes.some((s:string)=>!syntheticScopes.includes(s as typeof syntheticScopes[number])))return deny();
    const actor="mcp:"+createHash("sha256").update(JSON.stringify([
      config.issuer,config.subject,config.orgId,config.entityId,config.runId])).digest("hex");
    if(config.deadline<=now*1000)return deny();
    return {orgId:config.orgId,entityId:config.entityId,runId:config.runId,actor,scopes,
      expiresAt:Math.min(claims.exp*1000,config.deadline),maxGoals:config.maxGoals};
  }catch{return deny();}
}
export function requirePrincipal(scope:typeof syntheticScopes[number]){
  const principal=oauthRequest.getStore();
  if(!principal||principal.expiresAt<=Date.now()||!principal.scopes.includes(scope))throw new Error("MCP_ACCESS_DENIED");
  return principal;
}
export function protectedResourceMetadata(config:OAuthResourceConfig){
  return {resource:config.resource,authorization_servers:[config.issuer],
    scopes_supported:syntheticScopes,bearer_methods_supported:["header"]};
}
