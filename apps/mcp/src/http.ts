import { timingSafeEqual } from "node:crypto";
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

function resourceMetadata(req:IncomingMessage):Record<string,unknown>|undefined{
  const issuer=process.env.SAM_MCP_OAUTH_ISSUER?.trim();
  const resource=process.env.SAM_MCP_PUBLIC_RESOURCE_URL?.trim();
  if(!issuer||!resource) return undefined;
  try{
    const i=new URL(issuer);
    const r=new URL(resource);
    if(i.protocol!=="https:"||r.protocol!=="https:"||r.pathname!=="/mcp") return undefined;
    return {resource:r.toString(),authorization_servers:[i.toString()]};
  }catch{return undefined;}
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
    if(req.method==="GET"&&path==="/.well-known/oauth-protected-resource"){
      const metadata=resourceMetadata(req);
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

    if(expectedToken&&!safeTokenEqual(bearer(req),expectedToken)){
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
