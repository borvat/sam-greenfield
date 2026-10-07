import type { Server } from "node:http";
import { pool } from "../../../packages/db/src/client";
import type { ReadinessGate } from "./readiness";

export async function gracefulShutdown(input:{
  gate:ReadinessGate;
  server?:Server|null;
  graceMs:number;
  closePool?:boolean;
}):Promise<void>{
  input.gate.beginShutdown();

  if(input.server){
    await new Promise<void>((resolve,reject)=>{
      input.server!.close((err)=>err?reject(err):resolve());
    });
  }

  if(input.graceMs>0){
    await new Promise((resolve)=>setTimeout(resolve,Math.min(input.graceMs,50)));
  }

  if(input.closePool!==false){
    await pool.end();
  }
}
