import { pathToFileURL } from "node:url";
import { loadRuntimeConfig } from "./config";
import { startRuntimeService,type RuntimeComposition } from "./service";
import { pool } from "../../../packages/db/src/client";

async function loadComposition(path:string):Promise<RuntimeComposition>{
  if(!path) throw new Error("SAM_COMPOSITION_MODULE is required");
  const mod=await import(pathToFileURL(path).href);
  const composition=await (mod.default?.default ?? mod.default ?? mod.composition ?? mod) as Partial<RuntimeComposition>;
  if(typeof composition.runWorkTick!=="function"){
    throw new Error("Composition module must export runWorkTick()");
  }
  return composition as RuntimeComposition;
}

async function main(){
  const config=loadRuntimeConfig();
  const composition=await loadComposition(config.compositionModule);
  const service=await startRuntimeService({
    port:config.port,
    host:config.host,
    tickIntervalMs:config.tickIntervalMs,
    composition
  });

  let stopping=false;
  const shutdown=async(signal:string)=>{
    if(stopping) return;
    stopping=true;
    process.stderr.write(`SAM shutdown requested: ${signal}\n`);
    service.gate.beginShutdown();

    const forced=setTimeout(()=>{
      process.stderr.write("SAM shutdown grace exceeded\n");
      process.exit(1);
    },config.shutdownGraceMs);
    forced.unref?.();

    try{
      await service.stop();
      await pool.end();
      clearTimeout(forced);
      process.exit(0);
    }catch(err){
      clearTimeout(forced);
      process.stderr.write("SAM shutdown failed: details withheld\n");
      process.exit(1);
    }
  };

  process.on("SIGTERM",()=>{void shutdown("SIGTERM");});
  process.on("SIGINT",()=>{void shutdown("SIGINT");});
}

main().catch(async(err)=>{
  const codes=new Set(["RELEASE_APPLICATION_LOGIN_REQUIRED","RELEASE_APPLICATION_ROLE_UNSAFE","RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN",
    "RELEASE_RLS_REQUIRED","RELEASE_UNAPPROVED_CAPABILITY_OR_MODEL","RUNTIME_DEPENDENCY_UNAVAILABLE"]);
  const type=["TransformError","TypeError","SyntaxError","Error"].includes(err?.name)?err.name:"Error";
  const cause=err?.message==="Composition module must export runWorkTick()"?"COMPOSITION_EXPORT_INVALID":
    err?.message==="Production bundle requires at least one real capability"?"BUNDLE_EMPTY":
    err?.code==="EADDRINUSE"?"PORT_IN_USE":/^42[0-9A-Z]{3}$/.test(err?.code??"")?err.code:"WITHHELD";
  const locations=String(err?.stack??"").split("\n").filter(x=>x.trim().startsWith("at "))
    .map(x=>x.match(/\/((?:apps|packages)\/[a-zA-Z0-9_./-]+\.ts:\d+:\d+)/)?.[1]).filter(Boolean).slice(0,2);
  process.stderr.write(JSON.stringify({event:"STARTUP_FAILED",code:codes.has(err?.message)?err.message:"RUNTIME_STARTUP_FAILED",type,cause,locations})+"\n");
  try{ await pool.end(); }catch{}
  process.exit(1);
});
