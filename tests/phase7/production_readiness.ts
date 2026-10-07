import assert from "node:assert/strict";
import { pool,withTransaction } from "../../packages/db/src/client";
import { loadRuntimeConfig } from "../../apps/runtime/src/config";
import { ReadinessGate } from "../../apps/runtime/src/readiness";
import { createHealthServer } from "../../apps/runtime/src/healthServer";

async function createExpiredLease(){
  return withTransaction(async(client)=>{
    const org=await client.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[`P7-${Date.now()}-${Math.random()}`]);
    const le=await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,`P7LE-${Date.now()}-${Math.random()}`]);
    const g=await client.query(
      "INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,'Phase7 recovery','EXECUTING') RETURNING id",
      [`P7G-${Date.now()}-${Math.floor(Math.random()*1e9)}`,le.rows[0].id]
    );
    const q=await client.query(
      `INSERT INTO work_queue(goal_id,capability_id,status,lease_owner,lease_expiry,lease_timestamp)
       VALUES($1,'p7_probe','LEASED','dead-worker',now()-interval '1 minute',now()-interval '2 minutes')
       RETURNING id`,
      [g.rows[0].id]
    );
    return q.rows[0].id as string;
  });
}

async function main(){
  let missingDbBlocked=false;
  try{
    loadRuntimeConfig({NODE_ENV:"production",SAM_WORKER_ID:"worker-1"} as NodeJS.ProcessEnv);
  }catch(err){
    missingDbBlocked=err instanceof Error && err.message.includes("DATABASE_URL");
  }
  assert.equal(missingDbBlocked,true);

  let defaultPasswordBlocked=false;
  try{
    loadRuntimeConfig({
      NODE_ENV:"production",
      DATABASE_URL:"postgres://user:secret@db/sam",
      SAM_WORKER_ID:"worker-1",
      POSTGRES_PASSWORD:"postgres",
      SAM_COMPOSITION_MODULE:"/tmp/composition.ts"
    } as NodeJS.ProcessEnv);
  }catch(err){
    defaultPasswordBlocked=err instanceof Error && err.message.includes("forbidden");
  }
  assert.equal(defaultPasswordBlocked,true);

  const cfg=loadRuntimeConfig({
    NODE_ENV:"production",
    DATABASE_URL:"postgres://user:secret@db/sam",
    SAM_WORKER_ID:"worker-1",
    SAM_COMPOSITION_MODULE:"/tmp/composition.ts",
    PORT:"8081",
    SAM_TICK_INTERVAL_MS:"2000",
    SAM_SHUTDOWN_GRACE_MS:"5000"
  } as NodeJS.ProcessEnv);
  assert.equal(cfg.workerId,"worker-1");
  assert.equal(cfg.port,8081);
  assert.equal(cfg.compositionModule,"/tmp/composition.ts");

  const queueId=await createExpiredLease();
  const gate=new ReadinessGate();
  assert.equal(gate.snapshot().ready,false);

  await gate.start();
  assert.equal(gate.snapshot().ready,true);

  const recovered=await pool.query("SELECT status,lease_owner FROM work_queue WHERE id=$1",[queueId]);
  assert.equal(recovered.rows[0].status,"HANDBACK");
  assert.equal(recovered.rows[0].lease_owner,null);

  const server=createHealthServer(gate);
  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("server address unavailable");
  const base=`http://127.0.0.1:${address.port}`;

  const live=await fetch(`${base}/livez`);
  assert.equal(live.status,200);

  const ready=await fetch(`${base}/readyz`);
  assert.equal(ready.status,200);

  gate.beginShutdown();
  const notReady=await fetch(`${base}/readyz`);
  assert.equal(notReady.status,503);

  await new Promise<void>((resolve,reject)=>server.close((err)=>err?reject(err):resolve()));

  console.log("PHASE7_PRODUCTION_READINESS PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
