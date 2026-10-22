const path=require("node:path");
const {setupModeEnabled,validateSetup,startSetup}=require("./setup.cjs");
async function main(){
  if(setupModeEnabled(process.env)){
    const config=validateSetup(process.env);
    if(process.argv.includes("--validate-only")){
      console.log("RELEASE_SETUP_CONTRACT PASS; executive activation remains blocked.");
      return;
    }
    const setup=startSetup(config);await setup.ready;
    console.log("RELEASE_SETUP_LISTENING; executive disabled; billing cap not enforced.");
    const stop=async()=>{await setup.stop();process.exit(0);};
    process.once("SIGTERM",()=>void stop());process.once("SIGINT",()=>void stop());
    return;
  }
  const {validateRelease,childEnvironment}=require("./contract.cjs");
  const {startSupervisor}=require("./supervisor.cjs");
  const {servicePorts}=require("./ports.cjs");
  const config=validateRelease(process.env);
  if(process.argv.includes("--validate-only")){
    console.log("RELEASE_CONFIG_CONTRACT PASS; no connection, service, migration or publish performed.");
    return;
  }
  Object.assign(config,await servicePorts());
  const specs=[
    ["worker","apps/runtime/src/main.ts"],["command-center","apps/command-center/src/main.ts"],
    ...(config.enableMcp?[["mcp","apps/mcp/src/main.ts"]]:[])
  ].map(([name,file])=>({name,command:process.execPath,
    args:["--import","tsx",path.join(config.root,file)],env:childEnvironment(process.env,config,name)}));
  const supervisor=startSupervisor(config,process.env,specs);
  await supervisor.ready;
  const stop=async()=>{const result=await supervisor.stop();process.exit(result.graceful?0:1);};
  process.once("SIGTERM",()=>void stop());process.once("SIGINT",()=>void stop());
}
main().catch(error=>{
  const code=/^RELEASE_[A-Z0-9_]+$/.test(String(error.message))?error.message:"RELEASE_STARTUP_REFUSED";
  console.error(code);process.exitCode=1;
});
