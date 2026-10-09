import type { Server } from "node:http";
import { createHealthServer } from "./healthServer";
import { ReadinessGate } from "./readiness";
import { runOperationalSupervisorTick } from "../../supervisor/src/runtime";

export interface RuntimeComposition {
  runWorkTick():Promise<unknown>;
  supervisorOptions?:{monitorSideEffects?:boolean};
}

export interface RuntimeService {
  gate:ReadinessGate;
  server:Server;
  stop():Promise<void>;
}

export async function startRuntimeService(input:{
  port:number;
  host?:string;
  tickIntervalMs:number;
  composition:RuntimeComposition;
  supervisorActor?:string;
}):Promise<RuntimeService>{
  const gate=new ReadinessGate();
  const server=createHealthServer(gate);

  let stopped=false;
  let timer:NodeJS.Timeout|null=null;
  let tickInFlight=false;

  const tick=async()=>{
    if(stopped||tickInFlight||!gate.snapshot().ready) return;
    tickInFlight=true;
    try{
      await input.composition.runWorkTick();
      await runOperationalSupervisorTick({
        actor:input.supervisorActor ?? "operational-supervisor",
        ...input.composition.supervisorOptions
      });
    }finally{
      tickInFlight=false;
    }
  };

  await gate.start();

  await new Promise<void>((resolve,reject)=>{
    server.once("error",reject);
    server.listen(input.port,input.host ?? "0.0.0.0",()=>{
      server.off("error",reject);
      resolve();
    });
  });

  timer=setInterval(()=>{ void tick(); },input.tickIntervalMs);
  timer.unref?.();

  return {
    gate,
    server,
    async stop(){
      if(stopped) return;
      stopped=true;
      gate.beginShutdown();
      if(timer){
        clearInterval(timer);
        timer=null;
      }
      while(tickInFlight){
        await new Promise((resolve)=>setTimeout(resolve,10));
      }
      await new Promise<void>((resolve,reject)=>{
        server.close((err)=>err?reject(err):resolve());
      });
    }
  };
}
