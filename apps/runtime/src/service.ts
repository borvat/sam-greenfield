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
  dependencyProbe?:()=>Promise<unknown>;
}):Promise<RuntimeService>{
  const gate=new ReadinessGate();
  const counters={startedAt:new Date().toISOString(),ticks:0,errors:0,dependencyFailures:0,lastStartedAt:null as string|null,lastFinishedAt:null as string|null};
  const server=createHealthServer(gate,()=>({...counters,inFlight:tickInFlight}));

  let stopped=false;
  let timer:NodeJS.Timeout|null=null;
  let tickInFlight=false;

  const tick=async()=>{
    if(stopped||tickInFlight) return;
    tickInFlight=true;
    counters.lastStartedAt=new Date().toISOString();
    try{
      if(!await gate.refresh(input.dependencyProbe)){counters.dependencyFailures++;return;}
      await input.composition.runWorkTick();
      await runOperationalSupervisorTick({
        actor:input.supervisorActor ?? "operational-supervisor",
        ...input.composition.supervisorOptions
      });
      counters.ticks++;
    }catch(error){
      counters.errors++;
      throw error;
    }finally{
      tickInFlight=false;
      counters.lastFinishedAt=new Date().toISOString();
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

  timer=setInterval(()=>{ void tick().catch(()=>{
    // Goal/model guards still fail closed. A refused proposal must not kill
    // unrelated kernel maintenance or log a provider response/credential.
    console.error(JSON.stringify({service:"sam-runtime",event:"WORK_TICK_FAILED",details:"withheld",continuation:"next_bounded_tick"}));
  }); },input.tickIntervalMs);
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
