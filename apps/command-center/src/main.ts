import {pool} from "../../../packages/db/src/client";
import {startCommandCenterHttpServer} from "./http";

function positiveInt(name:string,value:string|undefined,fallback:number){
  const n=Number(value??fallback);
  if(!Number.isInteger(n)||n<=0)throw new Error(name+" must be a positive integer");
  return n;
}

async function main(){
  const production=process.env.NODE_ENV==="production";
  const token=process.env.SAM_COMMAND_CENTER_BEARER_TOKEN?.trim()??"";
  const allowedHosts=process.env.SAM_COMMAND_CENTER_ALLOWED_HOSTS?.trim()??"";
  const legalEntityId=process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID?.trim()??"";
  if(production&&!token)throw new Error("SAM_COMMAND_CENTER_BEARER_TOKEN is required in production");
  if(production&&!allowedHosts)throw new Error("SAM_COMMAND_CENTER_ALLOWED_HOSTS is required in production");
  if(!legalEntityId)throw new Error("SAM_COMMAND_CENTER_LEGAL_ENTITY_ID is required");

  const service=await startCommandCenterHttpServer({
    legalEntityId,
    port:positiveInt("SAM_COMMAND_CENTER_PORT",process.env.SAM_COMMAND_CENTER_PORT,8082),
    host:process.env.SAM_COMMAND_CENTER_HOST?.trim()||"0.0.0.0",
    bearerToken:token||undefined,
    allowedHosts,
    allowedOrigins:process.env.SAM_COMMAND_CENTER_ALLOWED_ORIGINS?.trim()||""
  });

  let stopping=false;
  const stop=async(signal:string)=>{
    if(stopping)return;stopping=true;
    process.stderr.write("SAM Command Center shutdown requested: "+signal+"\n");
    try{await service.close();await pool.end();process.exit(0)}
    catch(err){process.stderr.write("SAM Command Center shutdown failed: "+(err instanceof Error?err.message:"unknown")+"\n");process.exit(1)}
  };
  process.on("SIGTERM",()=>void stop("SIGTERM"));
  process.on("SIGINT",()=>void stop("SIGINT"));
}
main().catch(async err=>{process.stderr.write("SAM Command Center startup failed: "+(err instanceof Error?err.message:"unknown")+"\n");try{await pool.end()}catch{}process.exit(1)});
