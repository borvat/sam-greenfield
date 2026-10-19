import { createPublicKey,timingSafeEqual,verify } from "node:crypto";
import { createServer,type IncomingMessage,type Server,type ServerResponse } from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import type { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import { buildSamMcpServer } from "./server";

function csv(values:string[]|string|undefined):string[]{
  if(Array.isArray(values)) return values.map((v)=>v.trim()).filter(Boolean);
  return (values??"").split(",").map((v)=>v.trim()).filter(Boolean);
}

function safeTokenEqual(actual:string,expected:string):boolean{
  const a=Buffer.from(actual);
  const b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}

function bearer(req:IncomingMessage):string{
  const header=req.headers.authorization??"";
  return header.startsWith("Bearer ")?header.slice(7):"";
}

function hostname(req:IncomingMessage):string{
  const host=req.headers.host??"";
  try{
    return new URL(`http://${host}`).hostname.toLowerCase();
  }catch{
    return "";
  }
}

function deny(res:ServerResponse,status:number,message:string){
  res.statusCode=status;
  res.setHeader("content-type","application/json");
  res.end(JSON.stringify({error:message}));
}


function publicUrl(req:IncomingMessage):URL|undefined{
  try{return new URL(req.url??"/","http://localhost");}catch{return undefined;}
}

function oauthConfig():{issuer:string;resource:string;jwks:string;subjects:string[]}|undefined{
  const issuer=process.env.SAM_MCP_OAUTH_ISSUER?.trim();
  const resource=process.env.SAM_MCP_PUBLIC_RESOURCE_URL?.trim();
  const jwks=process.env.SAM_MCP_OAUTH_JWKS_URI?.trim();
  const subjects=(process.env.SAM_MCP_OAUTH_ALLOWED_SUBJECTS??"").split(",").map(x=>x.trim()).filter(Boolean);
  if(!issuer||!resource||!jwks||subjects.length===0)return undefined;
  try{
    const i=new URL(issuer),r=new URL(resource),j=new URL(jwks);
    if(i.protocol!=="https:"||r.protocol!=="https:"||j.protocol!=="https:"||r.pathname!=="/mcp"||i.username||i.password||r.username||r.password||j.username||j.password||i.hash||r.hash||j.hash)return undefined;
    return {issuer:i.toString().replace(/\\/$/,""),resource:r.toString(),jwks:j.toString(),subjects};
  }catch{return undefined;}
}

function oauthMetadata():Record<string,unknown>|undefined{
  const c=oauthConfig();
  return c?{resource:c.resource,authorization_servers:[c.issuer]}:undefined;
}

function challenge(res:ServerResponse,resource:string){
  res.setHeader("www-authenticate",`Bearer resource_metadata="${new URL("/.well-known/oauth-protected-resource",resource).toString()}"`);
  deny(res,401,"unauthorized");
}

function decodeSegment(part:string):unknown{
  return JSON.parse(Buffer.from(part,"base64url").toString("utf8"));
}

let jwksCache:{url:string;expires:number;keys:Array<Record<string,unknown>>}|undefined;
async function validOAuthToken(token:string,config:{issuer:string;resource:string;jwks:string;subjects:string[]}):Promise<boolean>{
  try{
    const parts=token.split(".");
    if(parts.length!==3||parts.some(p=>!p||p.length>16000))return false;
    const header=decodeSegment(parts[0]) as Record<string,unknown>;
    const claims=decodeSegment(parts[1]) as Record<string,unknown>;
    if(header.alg!=="RS256"||typeof header.kid!=="string"||typeof claims.exp!=="number"||claims.exp<=Date.now()/1000||claims.iss!==config.issuer)return false;
    const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
    if(!audiences.includes(config.resource)||typeof claims.sub!=="string"||!config.subjects.includes(claims.sub))return false;
    if(typeof claims.nbf==="number"&&claims.nbf>Date.now()/1000)return false;
    if(typeof claims.iat==="number"&&claims.iat>Date.now()/1000+60)return false;
    if(!jwksCache||jwksCache.url!==config.jwks||jwksCache.expires<Date.now()){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),3000);
      try{
        const response=await fetch(config.jwks,{signal:controller.signal,redirect:"error"});
        if(!response.ok)return false;
        const body=await response.json() as {keys?:Array<Record<string,unknown>>};
        if(!Array.isArray(body.keys)||body.keys.length>50)return false;
        jwksCache={url:config.jwks,expires:Date.now()+300000,keys:body.keys};
      }finally{clearTimeout(timer);}
    }
    const key=jwksCache.keys.find(k=>k.kid===header.kid&&k.kty==="RSA"&&k.use!=="enc"&&(k.alg===undefined||k.alg==="RS256"));
    if(!key)return false;
    return verify("RSA-SHA256",Buffer.from(parts[0]+"."+parts[1]),createPublicKey({key:key as any,format:"jwk"}),Buffer.from(parts[2],"base64url"));
  }catch{return false;}
}

export interface McpHttpServerOptions{
  surface:ChatGPTToolRegistry;
  actor:string;
  port:number;
  host?:string;
  bearerToken?:string;
  allowedHosts?:string[]|string;
  allowedOrigins?:string[]|string;
}

export async function startMcpHttpServer(options:McpHttpServerOptions):Promise<{
  server:Server;
  close():Promise<void>;
}>{
  const allowedHosts=new Set(csv(options.allowedHosts).map((v)=>v.toLowerCase()));
  const allowedOrigins=new Set(csv(options.allowedOrigins));
  const expectedToken=options.bearerToken??"";

  const handler=createMcpHandler(
    ()=>buildSamMcpServer({
      surface:options.surface,
      actor:options.actor
    })
  );
  const nodeHandler=toNodeHandler(handler);

  const server=createServer((req,res)=>{
    const path=publicUrl(req)?.pathname;
    if(req.method==="GET"&&(path==="/.well-known/oauth-protected-resource"||path==="/.well-known/oauth-protected-resource/mcp")){
      const metadata=oauthMetadata();
      if(!metadata){deny(res,404,"oauth_not_configured");return;}
      res.statusCode=200;
      res.setHeader("content-type","application/json");
      res.setHeader("cache-control","no-store");
      res.end(JSON.stringify(metadata));
      return;
    }
    if(req.method==="GET"&&path==="/livez"){
      res.statusCode=200;
      res.setHeader("content-type","application/json");
      res.end(JSON.stringify({status:"alive"}));
      return;
    }

    if(path!=="/mcp"){
      deny(res,404,"not_found");
      return;
    }

    if(allowedHosts.size>0&&!allowedHosts.has(hostname(req))){
      deny(res,403,"host_not_allowed");
      return;
    }

    const origin=req.headers.origin;
    if(origin&&allowedOrigins.size>0&&!allowedOrigins.has(origin)){
      deny(res,403,"origin_not_allowed");
      return;
    }

    const oauth=oauthConfig();
    if((process.env.SAM_MCP_OAUTH_ISSUER||process.env.SAM_MCP_PUBLIC_RESOURCE_URL||process.env.SAM_MCP_OAUTH_JWKS_URI||process.env.SAM_MCP_OAUTH_ALLOWED_SUBJECTS)&&!oauth){
      deny(res,503,"oauth_configuration_invalid");return;
    }
    const supplied=bearer(req);
    if(oauth){
      if(!supplied){challenge(res,oauth.resource);return;}
      void validOAuthToken(supplied,oauth).then(valid=>{
        if(!valid){challenge(res,oauth.resource);return;}
        void nodeHandler(req,res);
      }).catch(()=>challenge(res,oauth.resource));
      return;
    }
    if(expectedToken&&!safeTokenEqual(supplied,expectedToken)){
      deny(res,401,"unauthorized");
      return;
    }

    void nodeHandler(req,res);
  });

  await new Promise<void>((resolve,reject)=>{
    server.once("error",reject);
    server.listen(options.port,options.host??"0.0.0.0",()=>{
      server.off("error",reject);
      resolve();
    });
  });

  return {
    server,
    async close(){
      await handler.close();
      await new Promise<void>((resolve,reject)=>{
        server.close((err)=>err?reject(err):resolve());
      });
    }
  };
}
