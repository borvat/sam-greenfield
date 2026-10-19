import {timingSafeEqual} from "node:crypto";
import { createServer,type IncomingMessage,type Server,type ServerResponse } from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import type { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import { buildSamMcpServer } from "./server";
import type {InternalOAuthServer} from "./internalOAuth";

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


export interface McpHttpServerOptions{
  surface:ChatGPTToolRegistry;
  actor:string;
  port:number;
  host?:string;
  bearerToken?:string;
  internalOAuth?:InternalOAuthServer;
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
    const pathname=new URL(req.url??"/","http://localhost").pathname;
    const host=hostname(req);
    if(allowedHosts.size>0&&!allowedHosts.has(host)){deny(res,403,"host_not_allowed");return;}
    const origin=req.headers.origin;
    if(origin&&allowedOrigins.size>0&&!allowedOrigins.has(origin)){deny(res,403,"origin_not_allowed");return;}
    if(options.internalOAuth){
      void options.internalOAuth.handle(req,res,pathname).then(handled=>{
        if(!handled)routeRequest(req,res,pathname);
      }).catch(()=>deny(res,400,"invalid_request"));
      return;
    }
    routeRequest(req,res,pathname);
  });

  function routeRequest(req:IncomingMessage,res:ServerResponse,path:string){
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

    const supplied=bearer(req);
    if(options.internalOAuth){
      if(!options.internalOAuth.authenticate(supplied)){
        const metadata=new URL("/.well-known/oauth-protected-resource/mcp",options.internalOAuth.resourceUrl()).href;
        res.setHeader("www-authenticate",`Bearer resource_metadata="${metadata}", scope="sam:access offline_access"`);
        res.setHeader("cache-control","no-store");deny(res,401,"unauthorized");return;
      }
    }
    if(expectedToken&&!safeTokenEqual(supplied,expectedToken)){
      deny(res,401,"unauthorized");
      return;
    }

    void nodeHandler(req,res);
  }

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
