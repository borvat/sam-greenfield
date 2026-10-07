import { pathToFileURL } from "node:url";
import { loadRuntimeConfig } from "./config";
import { startRuntimeService,type RuntimeComposition } from "./service";
import { pool } from "../../../packages/db/src/client";

async function loadComposition(path:string):Promise<RuntimeComposition>{
  if(!path) throw new Error("SAM_COMPOSITION_MODULE is required");
  const mod=await import(pathToFileURL(path).href);
  const composition=(mod.default ?? mod.composition ?? mod) as Partial<RuntimeComposition>;
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
      process.stderr.write(`SAM shutdown failed: ${err instanceof Error?err.message:"unknown"}\n`);
      process.exit(1);
    }
  };

  process.on("SIGTERM",()=>{void shutdown("SIGTERM");});
  process.on("SIGINT",()=>{void shutdown("SIGINT");});
}

main().catch(async(err)=>{
  process.stderr.write(`SAM startup failed: ${err instanceof Error?err.message:"unknown"}\n`);
  try{ await pool.end(); }catch{}
  process.exit(1);
});
