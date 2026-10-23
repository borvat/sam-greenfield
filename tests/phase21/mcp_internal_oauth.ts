import assert from "node:assert/strict";
import {createHash,generateKeyPairSync} from "node:crypto";
import {createServer} from "node:http";
import test from "node:test";
import {Client,StreamableHTTPClientTransport} from "@modelcontextprotocol/client";
import {InternalOAuthServer,makePasswordHash,type OAuthStore} from "../../apps/mcp/src/internalOAuth";
import {createChatGPTToolSurface} from "../../apps/chatgpt-tools/src/surface";
import {startMcpHttpServer} from "../../apps/mcp/src/http";

test("SAM internal OAuth completes PKCE, issues JWTs, and rotates refresh tokens",async()=>{
  const clients=new Map<string,{client_id:string;redirect_uris:string[]}>();
  const requests=new Map<string,any>();
  const codes=new Map<string,any>();
  const refresh=new Map<string,any>();
  const store:OAuthStore={
    async getClient(id){return clients.get(id);},
    async addClient(id,redirect_uris){clients.set(id,{client_id:id,redirect_uris});},
    async saveAuthRequest(v){requests.set(v.request_id,v);},
    async consumeAuthRequest(idHash,csrfHash){
      for(const [id,v] of requests){
        const hash=(x:string)=>createHash("sha256").update(x).digest("hex");
        if(hash(id)===idHash&&hash(v.csrf)===csrfHash&&v.expires_at>Date.now()){requests.delete(id);return v;}
      }
      return undefined;
    },
    async saveCode(v){codes.set(v.code_hash,v);},
    async consumeCode(hash,client_id,redirect_uri,challenge){const v=codes.get(hash);if(!v||v.expires_at<=Date.now()||v.client_id!==client_id||v.redirect_uri!==redirect_uri||v.challenge!==challenge)return undefined;codes.delete(hash);return v;},
    async saveRefresh(v){refresh.set(v.token_hash,v);},
    async rotateRefresh(hash,v){const old=refresh.get(hash);if(!old||old.expires_at<=Date.now()||old.client_id!==v.client_id||old.resource!==v.resource||(v.requestedScope&&old.scope!==v.requestedScope))return undefined;refresh.delete(hash);refresh.set(v.token_hash,{...v,scope:old.scope});return old.scope;}
  };
  const {privateKey}=generateKeyPairSync("rsa",{modulusLength:2048});
  const config={resource:"https://sam.example.com/mcp",ownerEmail:"owner@example.com",ownerPasswordHash:makePasswordHash("test-password-that-is-long-123"),privateKeyPem:privateKey.export({type:"pkcs8",format:"pem"}).toString(),publicBaseUrl:"https://sam.example.com"};
  const oauth=new InternalOAuthServer(config,store);
  const server=createServer((req,res)=>{
    const path=new URL(req.url??"/","http://localhost").pathname;
    void oauth.handle(req,res,path).then(handled=>{if(!handled){res.statusCode=404;res.end();}});
  });
  await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
  const address=server.address();assert.ok(address&&typeof address!=="string");
  const base=`http://127.0.0.1:${address.port}`;
  const post=(path:string,body:URLSearchParams)=>fetch(base+path,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body,redirect:"manual"});
  try{
    const metadata=await fetch(base+"/.well-known/oauth-authorization-server").then(r=>r.json()) as any;
    assert.equal(metadata.registration_endpoint,"https://sam.example.com/oauth/register");
    assert.ok(metadata.scopes_supported.includes("sam:access"));

    const callback="https://chatgpt.com/connector_platform_oauth_redirect";
    const registered=await fetch(base+"/oauth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({redirect_uris:[callback]})});
    assert.equal(registered.status,201);
    const client=await registered.json() as any;
    const rejected=await fetch(base+"/oauth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({redirect_uris:["https://attacker.example/callback"]})});
    assert.equal(rejected.status,400);

    const verifier="A".repeat(43),challenge=createHash("sha256").update(verifier).digest("base64url"),state="test-state-value-long-enough";
    const auth=new URLSearchParams({client_id:client.client_id,redirect_uri:callback,response_type:"code",state,scope:"sam:access offline_access",resource:config.resource,code_challenge:challenge,code_challenge_method:"S256"});
    const page=await fetch(base+"/oauth/authorize?"+auth.toString());
    assert.equal(page.status,200);
    const html=await page.text();
    const requestId=html.match(/name="request_id" value="([^"]+)"/)?.[1];
    const csrf=html.match(/name="csrf" value="([^"]+)"/)?.[1];
    assert.ok(requestId&&csrf);
    const login=await post("/oauth/authorize/login",new URLSearchParams({request_id:requestId,csrf,email:config.ownerEmail,password:"test-password-that-is-long-123"}));
    assert.equal(login.status,200);
    const returnPage=await login.text();
    assert.match(returnPage,/http-equiv="refresh"/);
    assert.match(returnPage,/العودة إلى ChatGPT/);
    const href=returnPage.match(/href="([^"]+)"/)?.[1];
    assert.ok(href);
    const returned=new URL(href!.replace(/&amp;/g,"&"));
    assert.equal(returned.searchParams.get("state"),state);
    assert.equal(returned.searchParams.get("iss"),config.publicBaseUrl);
    const code=returned.searchParams.get("code");assert.ok(code);

    const exchange=await post("/oauth/token",new URLSearchParams({grant_type:"authorization_code",client_id:client.client_id,code,redirect_uri:callback,code_verifier:verifier,resource:config.resource}));
    assert.equal(exchange.status,200);
    const tokens=await exchange.json() as any;
    assert.equal(tokens.token_type,"Bearer");
    assert.ok(oauth.authenticate(tokens.access_token));
    assert.ok(!oauth.authenticate(tokens.access_token+"x"));

    const mcpService=await startMcpHttpServer({surface:createChatGPTToolSurface(),actor:"oauth-test",port:0,host:"127.0.0.1",internalOAuth:oauth,allowedHosts:["127.0.0.1"]});
    const mcpAddress=mcpService.server.address();assert.ok(mcpAddress&&typeof mcpAddress!=="string");
    const mcpUrl=new URL(`http://127.0.0.1:${mcpAddress.port}/mcp`);
    try{
      const denied=await fetch(mcpUrl,{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
      assert.equal(denied.status,401);
      assert.match(denied.headers.get("www-authenticate")??"",/oauth-protected-resource\/mcp/);
      const mcpClient=new Client({name:"sam-oauth-test",version:"1.0.0"},{versionNegotiation:{mode:"auto"}});
      await mcpClient.connect(new StreamableHTTPClientTransport(mcpUrl,{requestInit:{headers:{Authorization:`Bearer ${tokens.access_token}`}}}));
      const tools=await mcpClient.listTools();
      assert.ok(tools.tools.some(tool=>tool.name==="sam_system_status"));
      await mcpClient.close();
    }finally{await mcpService.close();}

    const renewed=await post("/oauth/token",new URLSearchParams({grant_type:"refresh_token",client_id:client.client_id,refresh_token:tokens.refresh_token,resource:config.resource}));
    assert.equal(renewed.status,200);
    const next=await renewed.json() as any;
    assert.ok(oauth.authenticate(next.access_token));
    const replay=await post("/oauth/token",new URLSearchParams({grant_type:"refresh_token",client_id:client.client_id,refresh_token:tokens.refresh_token,resource:config.resource}));
    assert.equal(replay.status,400);
  }finally{
    await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  }
});
