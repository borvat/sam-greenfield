import { createServer,type Server } from "node:http";
import type { ReadinessGate } from "./readiness";
import {timingSafeEqual} from "node:crypto";

export function createHealthServer(gate:ReadinessGate,metrics?:()=>unknown):Server{
  return createServer((req,res)=>{
    if(req.method!=="GET"){
      res.statusCode=405;
      res.end();
      return;
    }

    if(req.url==="/livez"){
      res.setHeader("content-type","application/json");
      res.statusCode=200;
      res.end(JSON.stringify({status:"alive"}));
      return;
    }

    if(req.url==="/readyz"){
      const state=gate.snapshot();
      res.setHeader("content-type","application/json");
      res.statusCode=state.ready ? 200 : 503;
      res.end(JSON.stringify({
        status:state.ready ? "ready" : "not_ready",
        started:state.started,
        recovering:state.recovering,
        shuttingDown:state.shuttingDown,
        recoveredAt:state.recoveredAt
      }));
      return;
    }
    if(req.url==="/statusz"){
      const token=process.env.SAM_RUNTIME_STATUS_BEARER_TOKEN??"";
      const actual=Buffer.from(req.headers.authorization??""),expected=Buffer.from("Bearer "+token);
      if(!token||actual.length!==expected.length||!timingSafeEqual(actual,expected)){
        res.statusCode=401;res.end();return;
      }
      res.setHeader("content-type","application/json");res.setHeader("cache-control","no-store");
      res.end(JSON.stringify(metrics?.()??{coverage:"NOT_CONFIGURED"}));return;
    }

    res.statusCode=404;
    res.end();
  });
}
