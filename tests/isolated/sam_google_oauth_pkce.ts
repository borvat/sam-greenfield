import {test} from "node:test";
import assert from "node:assert/strict";
import {createPkceRequest,redeemPkceCode} from "../../apps/production/src/samGoogleOauthPkce";
test("SAM authorization URL uses distinct secure callback and read-only Google scopes",()=>{
 let saved:{state:string;verifier:string}|undefined;
 const r=createPkceRequest({clientId:"https://sam.example.com/oauth/client.json",redirectUri:"https://sam.example.com/oauth/callback",stateStore:(state,verifier)=>{saved={state,verifier}}});
 const u=new URL(r.authorizationUrl);
 assert.equal(u.origin,"https://sam-google-workspace-mcp.onrender.com");
 assert.equal(u.pathname,"/authorize");
 assert.equal(u.searchParams.get("code_challenge_method"),"S256");
 assert.match(u.searchParams.get("scope")??"",/gmail.readonly/);
 assert.match(u.searchParams.get("scope")??"",/drive.readonly/);
 assert.ok(saved?.verifier);
 assert.equal(r.state,saved?.state);
 assert.throws(()=>createPkceRequest({clientId:"a",redirectUri:"http://localhost:8080/cb",stateStore:()=>{}}),/HTTPS_REDIRECT_REQUIRED/);
});
test("invalid state fails without network request",async()=>{
 await assert.rejects(redeemPkceCode({code:"test",state:"bad",storedState:"expected",verifier:"private",clientId:"x",redirectUri:"https://sam.example.com/cb"}),/OAUTH_STATE_MISMATCH/);
});
