import { createChatGPTToolSurface } from "../../chatgpt-tools/src/surface";
import { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import { createKernelProductionDispatcher } from "../../production/src/dispatcher";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { pool } from "../../../packages/db/src/client";
import { startMcpHttpServer } from "./http";
import {InternalOAuthServer,internalOAuthConfig,postgresOAuthStore} from "./internalOAuth";

function positiveInt(name:string,value:string|undefined,fallback:number):number{
  if(!value) return fallback;
  const n=Number(value);
  if(!Number.isInteger(n)||n<=0) throw new Error(`${name} must be a positive integer`);
  return n;
}

async function main(){
  const production=process.env.NODE_ENV==="production";
  const testMode=process.env.SAM_MCP_UNAUTHENTICATED_TEST_MODE==="1";
  const token=process.env.SAM_MCP_BEARER_TOKEN?.trim()??"";
  const oauthConfig=testMode?undefined:internalOAuthConfig(process.env);
  if(oauthConfig&&token)throw new Error("CHOOSE_ONE_MCP_AUTH_MODE");
  const internalOAuth=oauthConfig?new InternalOAuthServer(oauthConfig,postgresOAuthStore(pool)):undefined;
  const allowedHosts=process.env.SAM_MCP_ALLOWED_HOSTS?.trim()??"";
  const allowedOrigins=process.env.SAM_MCP_ALLOWED_ORIGINS?.trim()??"";
  const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";

  if(production&&!token&&!internalOAuth&&!testMode){
    throw new Error("SAM_MCP_BEARER_TOKEN or configured internal OAuth is required in production");
  }
  if(production&&!allowedHosts){
    throw new Error("SAM_MCP_ALLOWED_HOSTS is required in production");
  }

  const dispatcher=bundlePath
    ? createKernelProductionDispatcher(await loadProductionBundle(bundlePath))
    : undefined;

  const registeredSurface=createChatGPTToolSurface({dispatcher});
  const surface=testMode
    ? new ChatGPTToolRegistry(registeredSurface.definitions().map((definition)=>({
        definition:{...definition,availability:"AVAILABLE" as const},
        handler:async()=>({
          ok:true,
          data:{
            testMode:true,
            tool:definition.name,
            operationExecuted:false,
            message:"SAM connection test passed. This is a simulated result; no business data was read and no action was executed."
          }
        })
      })))
    : registeredSurface;
  if(testMode){
    process.stderr.write("SAM MCP unauthenticated TEST MODE enabled; all tool calls are simulated.\n");
  }

  const service=await startMcpHttpServer({
    surface,
    actor:process.env.SAM_MCP_ACTOR?.trim()||"chatgpt-mcp",
    port:positiveInt("SAM_MCP_PORT",process.env.SAM_MCP_PORT,8081),
    host:process.env.SAM_MCP_HOST?.trim()||"0.0.0.0",
    bearerToken:internalOAuth?undefined:token||undefined,
    internalOAuth,
    allowedHosts,
    allowedOrigins
  });

  let stopping=false;
  const stop=async(signal:string)=>{
    if(stopping) return;
    stopping=true;
    process.stderr.write(`SAM MCP shutdown requested: ${signal}\n`);
    try{
      await service.close();
      await pool.end();
      process.exit(0);
    }catch(err){
      process.stderr.write(`SAM MCP shutdown failed: ${err instanceof Error?err.message:"unknown"}\n`);
      process.exit(1);
    }
  };

  process.on("SIGTERM",()=>{void stop("SIGTERM");});
  process.on("SIGINT",()=>{void stop("SIGINT");});
}

main().catch(async(err)=>{
  process.stderr.write(`SAM MCP startup failed: ${err instanceof Error?err.message:"unknown"}\n`);
  try{await pool.end();}catch{}
  process.exit(1);
});
