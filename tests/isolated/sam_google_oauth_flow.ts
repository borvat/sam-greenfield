import {test} from "node:test";
import assert from "node:assert/strict";
import {beginSamGoogleOauth,finishSamGoogleOauth} from "../../apps/production/src/samGoogleOauthFlow";
import {MemoryOAuthTxnStore} from "../../apps/production/src/samGoogleOauthState";
test("full SAM-only PKCE state -> callback -> refresh storage; replay denied",async()=>{
 const transactions=new MemoryOAuthTxnStore();
 const saved:{ownerId:string;clientId:string;refreshToken:string}[]=[];
 const cfg={
   ownerId:"owner",clientId:"https://sam.example.com/oauth/client.json",
   redirectUri:"https://sam.example.com/oauth/callback",transactions,
   tokens:{saveRefresh:async(v:{ownerId:string;clientId:string;refreshToken:string})=>{saved.push(v)}}
 };
 const auth=new URL(await beginSamGoogleOauth(cfg));
 assert.equal(auth.origin,"https://sam-google-workspace-mcp.onrender.com");
 const state=auth.searchParams.get("state")!;
 const orig=globalThis.fetch;
 globalThis.fetch=(async (_url:any,init:any)=>{
  assert.equal((init.body as URLSearchParams).get("grant_type"),"authorization_code");
  return new Response(JSON.stringify({access_token:"access",refresh_token:"refresh"}),{status:200,headers:{"content-type":"application/json"}});
 }) as typeof fetch;
 try {
  assert.equal(await finishSamGoogleOauth(cfg,{issuer:"https://sam-google-workspace-mcp.onrender.com/",code:"google-code",state}),"AUTHORIZED");
  assert.deepEqual(saved,[{ownerId:"owner",clientId:cfg.clientId,refreshToken:"refresh"}]);
  await assert.rejects(finishSamGoogleOauth(cfg,{issuer:"https://sam-google-workspace-mcp.onrender.com/",code:"code",state}),/OAUTH_STATE_INVALID/);
 } finally {globalThis.fetch=orig}
});
test("no offline refresh means OAuth cannot be marked authorized",async()=>{
 const transactions=new MemoryOAuthTxnStore();
 const cfg={ownerId:"owner",clientId:"sam-client",redirectUri:"https://sam.example.com/cb",
 transactions,tokens:{saveRefresh:async()=>{throw Error("must never save")}}};
 const url=new URL(await beginSamGoogleOauth(cfg));
 const orig=globalThis.fetch;
 globalThis.fetch=(async()=>new Response(JSON.stringify({access_token:"short-lived"}),{status:200,headers:{"content-type":"application/json"}})) as typeof fetch;
 try{
  await assert.rejects(finishSamGoogleOauth(cfg,{issuer:"https://sam-google-workspace-mcp.onrender.com/",code:"test",state:url.searchParams.get("state")!}),/OFFLINE_REFRESH_TOKEN_REQUIRED/);
 }finally{globalThis.fetch=orig}
});

test("callback cannot move authorization to a different owner/client or issuer",async()=>{
 const transactions=new MemoryOAuthTxnStore();
 const cfg={ownerId:"owner-a",clientId:"sam-client-a",redirectUri:"https://sam.example.com/cb",transactions,tokens:{saveRefresh:async()=>{throw Error("must not save")}}};
 const u=new URL(await beginSamGoogleOauth(cfg)),state=u.searchParams.get("state")!;
 await assert.rejects(finishSamGoogleOauth(cfg,{state,code:"code",issuer:"https://attacker.example/"}),/ISSUER_MISMATCH/);
 await assert.rejects(finishSamGoogleOauth({...cfg,ownerId:"owner-b"},{state,code:"code",issuer:"https://sam-google-workspace-mcp.onrender.com/"}),/OWNER_CLIENT_MISMATCH/);
});
