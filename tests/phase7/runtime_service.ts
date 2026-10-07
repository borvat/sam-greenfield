import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { startRuntimeService } from "../../apps/runtime/src/service";

async function main(){
  let ticks=0;
  const service=await startRuntimeService({
    port:0,
    host:"127.0.0.1",
    tickIntervalMs:20,
    supervisorActor:`p7-service-${Date.now()}-${Math.random()}`,
    composition:{
      async runWorkTick(){
        ticks+=1;
      }
    }
  });

  const address=service.server.address();
  if(!address||typeof address==="string") throw new Error("no server address");
  const base=`http://127.0.0.1:${address.port}`;

  const live=await fetch(`${base}/livez`);
  const ready=await fetch(`${base}/readyz`);
  assert.equal(live.status,200);
  assert.equal(ready.status,200);

  await new Promise((resolve)=>setTimeout(resolve,100));
  assert.ok(ticks>0);

  await service.stop();
  assert.equal(service.gate.snapshot().ready,false);
  assert.equal(service.gate.snapshot().shuttingDown,true);

  const ticksAtStop=ticks;
  await new Promise((resolve)=>setTimeout(resolve,60));
  assert.equal(ticks,ticksAtStop);

  console.log("PHASE7_RUNTIME_SERVICE PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
