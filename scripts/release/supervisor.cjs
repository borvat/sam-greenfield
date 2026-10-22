const http=require("node:http");
const {spawn}=require("node:child_process");
const {timingSafeEqual}=require("node:crypto");
function authorized(req,token){
  const a=Buffer.from(req.headers.authorization||""),b=Buffer.from("Bearer "+token);
  return Boolean(token)&&a.length===b.length&&timingSafeEqual(a,b);
}
function event(name,service,extra={}){
  // Allow-list log fields only. Never forward child output, URLs, request bodies,
  // headers, config objects, or raw exception messages.
  console.log(JSON.stringify({service:"sam-release",event:name,component:service,...extra}));
}
function startSupervisor(config,env,children,{spawnChild=spawn}={}){
  const state=new Map();let stopping=false;let stopPromise;
  const start=spec=>{
    const entry=state.get(spec.name)||{restarts:0,child:null,timer:null,exhausted:false};
    state.set(spec.name,entry);
    const child=spawnChild(spec.command,spec.args,{cwd:config.root,env:spec.env,stdio:["ignore","pipe","pipe"]});
    entry.child=child;event("CHILD_STARTED",spec.name);
    for(const stream of [child.stdout,child.stderr])stream?.on("data",chunk=>{
      const safeCodes=new Set(["RELEASE_APPLICATION_LOGIN_REQUIRED","RELEASE_APPLICATION_ROLE_UNSAFE","RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN",
        "RELEASE_RLS_REQUIRED","RELEASE_UNAPPROVED_CAPABILITY_OR_MODEL","RUNTIME_DEPENDENCY_UNAVAILABLE","RUNTIME_STARTUP_FAILED"]);
      let code;
      let diagnostic={};
      try{
        const parsed=JSON.parse(chunk.toString());
        if(parsed.event==="STARTUP_FAILED"&&safeCodes.has(parsed.code)){
          code=parsed.code;
          if(["TransformError","TypeError","SyntaxError","Error"].includes(parsed.type))diagnostic.type=parsed.type;
          if(["COMPOSITION_EXPORT_INVALID","BUNDLE_EMPTY","PORT_IN_USE","WITHHELD"].includes(parsed.cause)||/^42[0-9A-Z]{3}$/.test(parsed.cause??""))diagnostic.cause=parsed.cause;
          if(Array.isArray(parsed.locations))diagnostic.locations=parsed.locations.filter(x=>
            typeof x==="string"&&/^(apps|packages)\/[a-zA-Z0-9_./-]+\.ts:\d+:\d+$/.test(x)).slice(0,2);
        }
      }catch{}
      event("CHILD_OUTPUT_WITHHELD",spec.name,{bytes:chunk.length,...(code?{code,...diagnostic}:{})});
    });
    child.once("error",()=>event("CHILD_START_ERROR",spec.name));
    child.once("close",(code,signal)=>{
      entry.child=null;event("CHILD_EXIT",spec.name,{code,signal});
      if(stopping)return;
      if(entry.restarts>=config.restartLimit){
        entry.exhausted=true;event("RESTART_LIMIT_REACHED",spec.name);return;
      }
      entry.restarts++;
      entry.timer=setTimeout(()=>{entry.timer=null;if(!stopping)start(spec);},
        Math.min(10000,100*2**(entry.restarts-1)));
    });
  };
  const proxy=(req,res,port,path=req.url)=>{
    // Preserve public Host/Origin for the existing service's authentication.
    const upstream=http.request({host:"127.0.0.1",port,path,method:req.method,headers:req.headers},response=>{
      res.writeHead(response.statusCode,response.headers);response.pipe(res);
    });
    upstream.on("error",()=>{if(!res.headersSent)res.writeHead(503);res.end();});
    upstream.setTimeout(30000,()=>upstream.destroy());
    req.on("aborted",()=>upstream.destroy());
    res.on("close",()=>upstream.destroy());
    req.pipe(upstream);
  };
  const server=http.createServer(async(req,res)=>{
    if(stopping){res.writeHead(503);res.end();return;}
    if(req.url==="/livez"){res.writeHead(200,{"content-type":"application/json"});res.end('{"status":"alive"}');return;}
    if(req.url==="/readyz"){
      if([...state.values()].some(e=>!e.child||e.exhausted)){res.writeHead(503);res.end();return;}
      proxy(req,res,config.workerPort,"/readyz");return;
    }
    if(req.url==="/_sam/status"&&!config.mcpOnly){
      if(req.method!=="GET"||!authorized(req,env.SAM_COMMAND_CENTER_BEARER_TOKEN)){
        res.writeHead(401);res.end();return;
      }
      const components=[...state].map(([name,s])=>({name,running:Boolean(s.child),restarts:s.restarts,exhausted:s.exhausted}));
      let worker=null;
      try{
        const r=await fetch(`http://127.0.0.1:${config.workerPort}/statusz`,{
          headers:{authorization:"Bearer "+env.SAM_COMMAND_CENTER_BEARER_TOKEN},
          signal:AbortSignal.timeout(1000)});
        if(r.ok){
          const raw=await r.json();
          const integer=k=>Number.isSafeInteger(raw[k])&&raw[k]>=0?raw[k]:null;
          const timestamp=k=>typeof raw[k]==="string"&&/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(raw[k])?raw[k]:null;
          worker={ticks:integer("ticks"),errors:integer("errors"),dependencyFailures:integer("dependencyFailures"),
            inFlight:raw.inFlight===true,lastStartedAt:timestamp("lastStartedAt"),lastFinishedAt:timestamp("lastFinishedAt")};
        }
      }catch{}
      res.writeHead(200,{"content-type":"application/json","cache-control":"no-store"});
      res.end(JSON.stringify({components,worker,coverage:worker?"RUNTIME":"PARTIAL",
        cost:{status:"EXTERNAL_MODEL_DISABLED",authorizedBudgetUsd:0,recordedCostUsd:null,
          reason:"LIVE_COST_MONITOR_REQUIRES_APPROVED_TENANT_BOUND_LEDGER"}}));return;
    }
    if(req.url==="/mcp"||req.url?.startsWith("/mcp/")||
      (config.mcpOnly&&["/.well-known/oauth-protected-resource","/.well-known/oauth-protected-resource/mcp"].includes(req.url))){
      if(!config.enableMcp){res.writeHead(404);res.end();return;}
      proxy(req,res,config.mcpPort);return;
    }
    if(config.mcpOnly){res.writeHead(404);res.end();return;}
    proxy(req,res,config.commandPort);
  });
  const ready=new Promise((resolve,reject)=>{
    server.once("error",reject);
    server.listen(config.port,"0.0.0.0",()=>{for(const spec of children)start(spec);resolve();});
  });
  function stop(){
    if(stopPromise)return stopPromise;
    stopping=true;
    stopPromise=(async()=>{
      const closed=new Promise(resolve=>server.close(()=>resolve()));
      for(const s of state.values())if(s.timer)clearTimeout(s.timer);
      const exits=[...state.values()].filter(s=>s.child).map(s=>new Promise(resolve=>{
        s.child.once("close",resolve);s.child.kill("SIGTERM");
      }));
      let timedOut=false;
      const timer=setTimeout(()=>{
        timedOut=true;
        for(const s of state.values())s.child?.kill("SIGKILL");
        server.closeAllConnections();
        event("SHUTDOWN_GRACE_EXCEEDED","supervisor");
      },config.shutdownMs+1000);
      await Promise.all(exits);server.closeAllConnections();await closed;clearTimeout(timer);
      return {graceful:!timedOut};
    })();
    return stopPromise;
  }
  return {server,ready,stop,state};
}
module.exports={startSupervisor,authorized};
