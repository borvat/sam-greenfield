import {runLiveGoldenChain} from "./liveGoldenChain";

function required(name:string):string{
  const value=process.env[name]?.trim();
  if(!value) throw new Error(name+" is required");
  return value;
}

async function main(){
  const result=await runLiveGoldenChain({
    runtimeUrl:required("SAM_LIVE_RUNTIME_URL"),
    commandCenterUrl:required("SAM_LIVE_COMMAND_CENTER_URL"),
    commandCenterToken:required("SAM_LIVE_COMMAND_CENTER_TOKEN"),
    mcpUrl:process.env.SAM_LIVE_MCP_URL?.trim()||undefined,
    objective:process.env.SAM_LIVE_CANARY_OBJECTIVE?.trim()||
      "Use one available GREEN read-only capability to produce a verified canary result. Do not perform any side effect.",
    timeoutMs:Number(process.env.SAM_LIVE_ACCEPTANCE_TIMEOUT_MS??120000),
    pollMs:Number(process.env.SAM_LIVE_ACCEPTANCE_POLL_MS??1000)
  });
  process.stdout.write("LIVE_GOLDEN_CHAIN PASS "+JSON.stringify(result)+"\n");
}
main().catch(err=>{
  process.stderr.write("LIVE_GOLDEN_CHAIN FAIL "+(err instanceof Error?err.message:"unknown")+"\n");
  process.exit(1);
});
