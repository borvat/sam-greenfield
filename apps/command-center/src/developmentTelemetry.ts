import {withTransaction} from "../../../packages/db/src/client";
import {captureDevelopmentTelemetry} from "../../supervisor/src/developmentTelemetry";
import type {WorkerHeartbeat} from "../../supervisor/src/telemetry";

export async function commandCenterDevelopmentTelemetry(entity:string,bearer:string){
  if(process.env.SAM_DEVELOPMENT_SAFE_MODE!=="1"||!bearer)throw new Error("TELEMETRY_NOT_AUTHORIZED");
  let heartbeat:WorkerHeartbeat={};
  try{
    const response=await fetch("http://127.0.0.1:8080/statusz",{
      headers:{authorization:"Bearer "+bearer},signal:AbortSignal.timeout(1500),redirect:"error"});
    if(response.ok)heartbeat=await response.json() as WorkerHeartbeat;
  }catch{/* Unavailable worker becomes an actionable local alert, never raw network/body logging. */}
  return withTransaction(client=>captureDevelopmentTelemetry(client,entity,heartbeat));
}
