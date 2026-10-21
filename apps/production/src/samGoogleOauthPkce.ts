/** Standalone OAuth 2.1 PKCE helpers for SAM Google MCP.
 * The SAM operator must authorize a distinct MCP client; ChatGPT connector tokens
 * and legacy Google REST refresh tokens are not interchangeable.
 * This module creates no URLs with secrets other than transient PKCE parameters.
 */
import {createHash,randomBytes} from "node:crypto";
export const SAM_GOOGLE_ISSUER="https://sam-google-workspace-mcp.onrender.com";
const CALLBACK_ORIGIN=/^https:\/\/[^/?#]+(?:\/[^?#]*)?$/;
export function createPkceRequest(input:{clientId:string;redirectUri:string;stateStore:(state:string,verifier:string)=>void}){
  if(!input.clientId.trim()) throw new Error("MCP_CLIENT_ID_REQUIRED");
  const redirect=new URL(input.redirectUri);
  if(redirect.protocol!=="https:" || !CALLBACK_ORIGIN.test(input.redirectUri))throw new Error("HTTPS_REDIRECT_REQUIRED");
  const verifier=randomBytes(32).toString("base64url");
  const challenge=createHash("sha256").update(verifier).digest("base64url");
  const state=randomBytes(24).toString("base64url");
  input.stateStore(state,verifier); // Store securely server-side; one use, 10-minute TTL.
  const u=new URL("/authorize",SAM_GOOGLE_ISSUER);
  u.searchParams.set("response_type","code");
  u.searchParams.set("client_id",input.clientId);
  u.searchParams.set("redirect_uri",input.redirectUri);
  u.searchParams.set("code_challenge",challenge);
  u.searchParams.set("code_challenge_method","S256");
  u.searchParams.set("state",state);
  u.searchParams.set("resource",SAM_GOOGLE_ISSUER+"/mcp");
  u.searchParams.set("scope",[
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "openid","https://www.googleapis.com/auth/userinfo.email",
  ].join(" "));
  return {authorizationUrl:u.toString(),state};
}
export async function redeemPkceCode(input:{code:string;state:string;storedState:string;verifier:string;clientId:string;redirectUri:string}):Promise<{access_token:string;refresh_token?:string;expires_in?:number}>{
 if(!input.code||!input.state||input.state!==input.storedState||!input.verifier)throw new Error("OAUTH_STATE_MISMATCH");
 const form=new URLSearchParams({grant_type:"authorization_code",code:input.code,redirect_uri:input.redirectUri,client_id:input.clientId,code_verifier:input.verifier});
 const resp=await fetch(SAM_GOOGLE_ISSUER+"/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:form,signal:AbortSignal.timeout(15000)});
 if(!resp.ok)throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
 const raw=await resp.json() as Record<string,unknown>;
 if(typeof raw.access_token!=="string"||!raw.access_token)throw new Error("OAUTH_ACCESS_TOKEN_MISSING");
 return raw as {access_token:string;refresh_token?:string;expires_in?:number};
}

/** Renew an already-authorized SAM-only MCP token. Never use legacy Google tokens. */
export async function refreshSamMcpAccessToken(input:{clientId:string;refreshToken:string}):Promise<{access_token:string;refresh_token?:string;expires_in?:number}> {
 if(!input.clientId?.trim()||!input.refreshToken?.trim())throw new Error("SAM_MCP_REFRESH_CREDENTIALS_REQUIRED");
 const body=new URLSearchParams({grant_type:"refresh_token",client_id:input.clientId,refresh_token:input.refreshToken});
 const resp=await fetch(SAM_GOOGLE_ISSUER+"/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,signal:AbortSignal.timeout(15000)});
 if(resp.status===400||resp.status===401)throw new Error("SAM_MCP_REFRESH_REAUTH_REQUIRED");
 if(!resp.ok)throw new Error("SAM_MCP_REFRESH_FAILED");
 const value=await resp.json() as Record<string,unknown>;
 if(typeof value.access_token!=="string"||!value.access_token)throw new Error("SAM_MCP_REFRESH_TOKEN_RESPONSE_INVALID");
 return value as {access_token:string;refresh_token?:string;expires_in?:number};
}
