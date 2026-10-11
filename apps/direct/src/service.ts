import {pool,withTransaction} from "../../../packages/db/src/client";
import {createProductionComposition} from "../../production/src/composition";
import {recoverKernelAfterRestart} from "../../kernel/src/recovery";
import {transitionGoal} from "../../kernel/src/stateMachine";
import {startMcpHttpServer} from "../../mcp/src/http";
import {buildDirectBundle} from "./bundle";
import {createDirectGoalSurface} from "./surface";
import {admitDirectDatabase} from "./admission";

export async function startDirectSam(config:any){
  const bundle=buildDirectBundle(process.env,config.capabilities,config.budget);
  await admitDirectDatabase(config,bundle);await recoverKernelAfterRestart();
  const worker=createProductionComposition({bundle,workerId:"sam-direct-worker"});
  let stopping=false,inFlight:Promise<void>|null=null,lastTick=Date.now(),healthy=true;
  const tick=async()=>{
    if(stopping||inFlight)return;
    inFlight=(async()=>{
      try{await pool.query("SELECT 1");healthy=true;await worker.runWorkTick();lastTick=Date.now();}
      catch{
        try{
          await pool.query("SELECT 1");
          // An invalid proposal or exhausted quota must not trigger a paid retry every second.
          await withTransaction(async client=>{
            const goals=(await client.query("SELECT id,state FROM goals WHERE state IN ('PLANNING','REPLANNING') FOR UPDATE SKIP LOCKED")).rows;
            for(const g of goals)await transitionGoal(client,g.id,g.state,"BLOCKED","DIRECT_PLANNING_REFUSED");
          });
          lastTick=Date.now();
        }catch{healthy=false;}
        console.error("DIRECT_WORK_TICK_REFUSED; details withheld");
      }
    })();
    try{await inFlight;}finally{inFlight=null;}
  };
  const service=await startMcpHttpServer({surface:createDirectGoalSurface(bundle,config.budget.goalsPerDay),actor:"chatgpt-mcp",
    port:config.port,host:"0.0.0.0",oauth:config.oauth,allowedHosts:config.host,allowedOrigins:config.origin,
    readiness:async()=>{try{await pool.query("SELECT 1");return !stopping&&healthy&&Date.now()-lastTick<120000;}catch{return false;}}});
  const timer=setInterval(()=>void tick(),config.tickMs);
  const stop=async()=>{
    if(stopping)return;stopping=true;clearInterval(timer);
    const force=setTimeout(()=>process.exit(1),15000);force.unref();
    await service.close();if(inFlight)await inFlight;await pool.end();clearTimeout(force);
  };
  process.once("SIGTERM",()=>void stop());process.once("SIGINT",()=>void stop());
  console.log("DIRECT_SAM_LISTENING; authenticated MCP and native worker ready");
  return {service,stop,tick};
}
