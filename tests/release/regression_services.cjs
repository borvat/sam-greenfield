// Optional infrastructure fixture: boots the existing services against an EMPTY
// disposable schema. No new goal implementation, provider adapter or workflow.
const {spawn,spawnSync}=require("node:child_process");
const {createServer}=require("node:net");
const {randomUUID}=require("node:crypto");
const path=require("node:path");
const dev=require("../../scripts/development/environment.cjs");
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function startRegressionServices(admin){
  for(const port of [5000,8080,3001]){
    const probe=createServer();
    await new Promise((resolve,reject)=>{probe.once("error",()=>reject(new Error("REGRESSION_SERVICE_PORT_BUSY")));
      probe.listen(port,"127.0.0.1",()=>probe.close(resolve));});
  }
  const schema=`sam_replit_test_${Date.now()}`,children=[];
  let created=false;
  const stop=async()=>{
    for(const child of children)if(child.exitCode===null)child.kill("SIGTERM");
    for(let i=0;i<60&&children.some(c=>c.exitCode===null);i++)await wait(50);
    for(const child of children)if(child.exitCode===null)child.kill("SIGKILL");
    for(let i=0;i<40&&children.some(c=>c.exitCode===null);i++)await wait(50);
    if(created){await admin.query(`DROP SCHEMA ${schema} CASCADE`);created=false;}
  };
  try{
    await admin.query(`CREATE SCHEMA ${schema}`);created=true;
    const env=dev.developmentEnvironment(schema);
    const migration=spawnSync(process.execPath,["packages/db/src/migrate.js","--apply"],{
      env,cwd:dev.root,stdio:"ignore",timeout:30000});
    if(migration.status!==0)throw new Error("REGRESSION_SERVICE_MIGRATION_FAILED");
    const org=randomUUID(),entity=randomUUID();
    await admin.query(`INSERT INTO ${schema}.organizations(id,name) VALUES($1,'Synthetic service fixture')`,[org]);
    await admin.query(`INSERT INTO ${schema}.legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic service fixture')`,[entity,org]);
    await admin.query(`INSERT INTO ${schema}.goals(business_id,company_scope,objective,domain,authority_ceiling)
      VALUES('SERVICE-FIXTURE',$1,'Synthetic read-only service check','development_probe','GREEN')`,[entity]);
    const bearer=process.env.SAM_COMMAND_CENTER_BEARER_TOKEN||process.env.SESSION_SECRET;
    const mcpBearer=process.env.SAM_MCP_BEARER_TOKEN||process.env.SESSION_SECRET;
    if(!bearer||!mcpBearer)throw new Error("REGRESSION_EXISTING_AUTH_REQUIRED");
    const common={...env,SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,
      SAM_COMMAND_CENTER_ALLOWED_HOSTS:["127.0.0.1","localhost",process.env.REPLIT_DEV_DOMAIN].filter(Boolean).join(","),
      SAM_COMMAND_CENTER_ALLOWED_ORIGINS:process.env.REPLIT_DEV_DOMAIN?`https://${process.env.REPLIT_DEV_DOMAIN}`:"",
      SAM_COMMAND_CENTER_BEARER_TOKEN:bearer,
      SAM_COMMAND_CENTER_HOST:"127.0.0.1",SAM_RUNTIME_HOST:"127.0.0.1",
      SAM_MCP_HOST:"127.0.0.1",SAM_MCP_ALLOWED_HOSTS:"127.0.0.1,localhost",SAM_MCP_BEARER_TOKEN:mcpBearer,
      SAM_RUNTIME_STATUS_BEARER_TOKEN:bearer,SAM_COMMAND_CENTER_PORT:"5000",SAM_MCP_PORT:"3001",PORT:"8080",
      SAM_COMPOSITION_MODULE:path.join(dev.root,"apps/runtime/src/developmentCompositionModule.ts")};
    // developmentEnvironment excludes all external credentials. No autonomy
    // switch: the original maintenance-only composition cannot invoke a model.
    for(const app of ["runtime","command-center","mcp"]){
      const child=spawn(process.execPath,["--import","tsx",`apps/${app}/src/main.ts`],{
        cwd:dev.root,env:common,stdio:"ignore"});
      child.on("error",()=>{});children.push(child);
    }
    let ready=false;
    for(let i=0;i<100;i++){
      if(children.some(c=>c.exitCode!==null))throw new Error("REGRESSION_SERVICE_STARTUP_FAILED");
      const health=await Promise.all([5000,8080,3001].map(port=>fetch(
        `http://127.0.0.1:${port}/${port===3001?"livez":"readyz"}`,{signal:AbortSignal.timeout(300)})
        .then(r=>r.status===200).catch(()=>false)));
      if(health.every(Boolean)){ready=true;break;}await wait(50);
    }
    if(!ready)throw new Error("REGRESSION_SERVICE_NOT_READY");
    console.log("ISOLATED_REGRESSION_SERVICES_READY; existing source; synthetic schema; original maintenance-only worker; no external credentials.");
    return {stop};
  }catch(error){await stop();throw error;}
}
module.exports={startRegressionServices};
