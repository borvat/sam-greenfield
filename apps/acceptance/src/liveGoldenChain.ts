export interface LiveGoldenChainOptions{
  runtimeUrl:string;
  commandCenterUrl:string;
  commandCenterToken:string;
  mcpUrl?:string;
  objective:string;
  timeoutMs?:number;
  pollMs?:number;
  fetchImpl?:typeof fetch;
  sleep?: (ms:number)=>Promise<void>;
}

export interface LiveGoldenChainEvidence{
  goalId:string;
  businessId:string;
  finalState:string;
  polls:number;
  planCount:number;
  workCount:number;
  executionCount:number;
  verificationCount:number;
  verifiedCount:number;
  auditCount:number;
  durationMs:number;
}

function base(url:string):string{return url.replace(/\/$/,"")}
async function jsonResponse(fetchImpl:typeof fetch,url:string,init?:RequestInit){
  const response=await fetchImpl(url,init);
  let body:any={};
  try{body=await response.json()}catch{}
  return {response,body};
}
function auth(token:string){return {authorization:"Bearer "+token}}
function positive(value:unknown,fallback:number,min:number,max:number){
  const n=Number(value??fallback);
  if(!Number.isFinite(n)) return fallback;
  return Math.max(min,Math.min(max,Math.trunc(n)));
}

export async function runLiveGoldenChain(options:LiveGoldenChainOptions):Promise<LiveGoldenChainEvidence>{
  const fetchImpl=options.fetchImpl??fetch;
  const sleep=options.sleep??((ms)=>new Promise(resolve=>setTimeout(resolve,ms)));
  const timeoutMs=positive(options.timeoutMs,120000,1000,30*60*1000);
  const pollMs=positive(options.pollMs,1000,50,30000);
  const started=Date.now();

  const runtime=await jsonResponse(fetchImpl,base(options.runtimeUrl)+"/readyz");
  if(!runtime.response.ok||runtime.body?.status!=="ready"){
    throw new Error("Runtime is not ready");
  }

  const commandReady=await jsonResponse(fetchImpl,base(options.commandCenterUrl)+"/readyz");
  if(!commandReady.response.ok||commandReady.body?.status!=="ready"){
    throw new Error("Command Center is not ready");
  }

  if(options.mcpUrl){
    const mcp=await jsonResponse(fetchImpl,base(options.mcpUrl)+"/livez");
    if(!mcp.response.ok||mcp.body?.status!=="alive"){
      throw new Error("MCP is not alive");
    }
  }

  const objective=String(options.objective??"").trim();
  if(objective.length<3) throw new Error("Canary objective is required");

  const created=await jsonResponse(fetchImpl,base(options.commandCenterUrl)+"/api/goals",{
    method:"POST",
    headers:{...auth(options.commandCenterToken),"content-type":"application/json"},
    body:JSON.stringify({
      objective,
      domain:"acceptance_canary",
      priority:100,
      authority_ceiling:"GREEN"
    })
  });
  if(created.response.status!==201||!created.body?.data?.id){
    throw new Error("Canary goal creation failed");
  }

  const goalId=String(created.body.data.id);
  const businessId=String(created.body.data.business_id??"");
  let polls=0;

  while(Date.now()-started<=timeoutMs){
    polls++;
    const timeline=await jsonResponse(
      fetchImpl,
      base(options.commandCenterUrl)+"/api/goals/"+encodeURIComponent(goalId)+"/timeline",
      {headers:auth(options.commandCenterToken)}
    );
    if(!timeline.response.ok) throw new Error("Canary timeline read failed");

    const data=timeline.body?.data??{};
    const state=String(data?.goal?.state??"");
    if(state==="FAILED"||state==="CANCELLED"){
      throw new Error("Canary entered terminal failure state: "+state);
    }
    if(state==="WAITING_OWNER"){
      throw new Error("GREEN canary unexpectedly requires owner approval");
    }
    if(state==="COMPLETED"){
      const plans=Array.isArray(data.plans)?data.plans:[];
      const work=Array.isArray(data.work)?data.work:[];
      const executions=Array.isArray(data.executions)?data.executions:[];
      const verifications=Array.isArray(data.verifications)?data.verifications:[];
      const audit=Array.isArray(data.audit)?data.audit:[];
      const verified=verifications.filter((v:any)=>v?.result==="VERIFIED");

      if(plans.length<1) throw new Error("COMPLETED canary has no persisted plan");
      if(work.length<1) throw new Error("COMPLETED canary has no persisted work");
      if(executions.length<1) throw new Error("COMPLETED canary has no execution evidence");
      if(verified.length<1) throw new Error("COMPLETED canary has no VERIFIED independent verification");

      return {
        goalId,
        businessId,
        finalState:state,
        polls,
        planCount:plans.length,
        workCount:work.length,
        executionCount:executions.length,
        verificationCount:verifications.length,
        verifiedCount:verified.length,
        auditCount:audit.length,
        durationMs:Date.now()-started
      };
    }

    await sleep(pollMs);
  }

  throw new Error("Live Golden Chain acceptance timed out");
}
