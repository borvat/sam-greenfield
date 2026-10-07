import { createServer,type Server } from "node:http";
import type { ReadinessGate } from "./readiness";

export function createHealthServer(gate:ReadinessGate):Server{
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

    res.statusCode=404;
    res.end();
  });
}
