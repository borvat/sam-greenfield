import {test} from "node:test";
import assert from "node:assert/strict";
import {createPkceRequest,redeemPkceCode,refreshSamMcpAccessToken} from "../../apps/production/src/samGoogleOauthPkce";
test("SAM authorization URL uses distinct secure callback and read-only Google scopes",async()=>{
 let saved:{state:string;verifier:string}|undefined;
 const r=await createPkceRequest({clientId:"https://sam.example.com/oauth/client.json",redirectUri:"https://sam.example.com/oauth/callback",stateStore:(state,verifier)=>{saved={state,verifier}}});
 const u=new URL(r.authorizationUrl);
 assert.equal(u.origin,"https://sam-google-workspace-mcp.onrender.com");
 assert.equal(u.pathname,"/authorize");
 assert.equal(u.searchParams.get("code_challenge_method"),"S256");
 assert.match(u.searchParams.get("scope")??"",/gmail.readonly/);
 assert.match(u.searchParams.get("scope")??"",/drive.readonly/);
 assert.ok(saved?.verifier);
 assert.equal(r.state,saved?.state);
 await assert.rejects(createPkceRequest({clientId:"a",redirectUri:"http://localhost:8080/cb",stateStore:()=>{}}),/HTTPS_REDIRECT_REQUIRED/);
});
test("invalid state fails without network request",async()=>{
 await assert.rejects(redeemPkceCode({code:"test",state:"bad",storedState:"expected",verifier:"private",clientId:"x",redirectUri:"https://sam.example.com/cb"}),/OAUTH_STATE_MISMATCH/);
});

test("refresh flow fails closed on missing SAM-only credential",async()=>{
 await assert.rejects(refreshSamMcpAccessToken({clientId:"",refreshToken:"secret"}),/CREDENTIALS_REQUIRED/);
 await assert.rejects(refreshSamMcpAccessToken({clientId:"sam-client",refreshToken:""}),/CREDENTIALS_REQUIRED/);
});
test("expired OAuth refresh is reported as explicit reauthorization",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=(async (_url:any,init:any)=>{
   const form=init.body as URLSearchParams;
   assert.equal(form.get("grant_type"),"refresh_token");
   return new Response("",{status:401});
 }) as typeof fetch;
 try{
  await assert.rejects(refreshSamMcpAccessToken({clientId:"sam-client",refreshToken:"sam-only-refresh-token"}),/REAUTH_REQUIRED/);
 }finally{globalThis.fetch=original}
});

test("authorization cannot proceed until OAuth state is durably stored",async()=>{
 await assert.rejects(createPkceRequest({
  clientId:"sam-client",
  redirectUri:"https://sam.example.com/oauth/callback",
  stateStore:async()=>{throw new Error("DATABASE_UNAVAILABLE")}
 }),/DATABASE_UNAVAILABLE/);
});
