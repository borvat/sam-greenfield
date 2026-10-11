import { createChatGPTToolSurface } from "../../chatgpt-tools/src/surface";
import { createKernelProductionDispatcher } from "../../production/src/dispatcher";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { pool } from "../../../packages/db/src/client";
import { startMcpHttpServer } from "./http";
import { localDevelopment, denyDevelopment } from "../../development/src/planningPolicy";
import {createReleaseReadSurface} from "./releaseReadSurface";
import {oauthResourceConfig} from "./oauthResource";
import {createSyntheticGoalSurface,admitSyntheticMcpDatabase} from "./syntheticGoalSurface";

function positiveInt(name:string,value:string|undefined,fallback:number):number{
  if(!value) return fallback;
  const n=Number(value);
  if(!Number.isInteger(n)||n<=0) throw new Error(`${name} must be a positive integer`);
  return n;
}

async function main(){
  const production=process.env.NODE_ENV==="production";
  const synthetic=process.env.SAM_MCP_SYNTHETIC_TOOLS==="1";
  const oauth=synthetic?oauthResourceConfig(process.env):undefined;
  const token=process.env.SAM_MCP_BEARER_TOKEN?.trim()??"";
  const allowedHosts=process.env.SAM_MCP_ALLOWED_HOSTS?.trim()??"";
  const allowedOrigins=process.env.SAM_MCP_ALLOWED_ORIGINS?.trim()??"";
  const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";
  if(localDevelopment() && bundlePath) denyDevelopment("PRODUCTION_BUNDLE_NOT_ALLOWED");

  if(production&&!token&&!oauth){
    throw new Error("SAM_MCP_BEARER_TOKEN is required in production");
  }
  if(production&&!allowedHosts){
    throw new Error("SAM_MCP_ALLOWED_HOSTS is required in production");
  }

  const releaseReadOnly=process.env.SAM_MCP_RELEASE_READ_ONLY==="1";
  if((releaseReadOnly||synthetic)&&bundlePath)throw new Error("RELEASE_MCP_DISPATCHER_FORBIDDEN");
  if(synthetic)await admitSyntheticMcpDatabase();
  const dispatcher=bundlePath
    ? createKernelProductionDispatcher(await loadProductionBundle(bundlePath))
    : undefined;

  const surface=synthetic?createSyntheticGoalSurface():releaseReadOnly?createReleaseReadSurface():createChatGPTToolSurface({dispatcher});
  const service=await startMcpHttpServer({
    surface,
    actor:process.env.SAM_MCP_ACTOR?.trim()||"chatgpt-mcp",
    port:positiveInt("SAM_MCP_PORT",process.env.SAM_MCP_PORT,8081),
    host:process.env.SAM_MCP_HOST?.trim()||"0.0.0.0",
    bearerToken:oauth?undefined:token||undefined,
    oauth,
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
      process.stderr.write("SAM MCP shutdown failed: details withheld\n");
      process.exit(1);
    }
  };

  process.on("SIGTERM",()=>{void stop("SIGTERM");});
  process.on("SIGINT",()=>{void stop("SIGINT");});
}

main().catch(async(err)=>{
  process.stderr.write("SAM MCP startup failed: details withheld\n");
  try{await pool.end();}catch{}
  process.exit(1);
});
