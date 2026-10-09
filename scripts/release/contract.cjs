const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const required=[
  "DATABASE_URL","SAM_DB_APP_ROLE","SAM_DB_SCHEMA","SAM_RELEASE_ORG_ID",
  "SAM_COMMAND_CENTER_LEGAL_ENTITY_ID","SAM_COMMAND_CENTER_BEARER_TOKEN",
  "SAM_COMMAND_CENTER_ALLOWED_HOSTS","SAM_COMMAND_CENTER_ALLOWED_ORIGINS",
  "SAM_PRODUCTION_BUNDLE_MODULE","SAM_RELEASE_CAPABILITIES"
];
function fail(code){throw new Error(code);}
function int(v,min,max,fallback){
  if(v===undefined||v==="")return fallback;
  const n=Number(v);if(!Number.isInteger(n)||n<min||n>max)fail("RELEASE_INTEGER_INVALID");
  return n;
}
function validateRelease(env){
  if(env.NODE_ENV!=="production"||env.SAM_RELEASE_APPROVED!=="1")fail("RELEASE_OWNER_APPROVAL_REQUIRED");
  if(env.REPLIT_DEV_DOMAIN||env.SAM_DEVELOPMENT_SAFE_MODE==="1"||env.SAM_AUTONOMY_SANDBOX==="1"){
    fail("RELEASE_DEVELOPMENT_ENV_FORBIDDEN");
  }
  if(env.SAM_DATABASE_TARGET!=="production")fail("RELEASE_DATABASE_TARGET_REQUIRED");
  for(const k of required)if(!env[k]?.trim())fail("RELEASE_MISSING_"+k);
  let db;try{db=new URL(env.DATABASE_URL);}catch{fail("RELEASE_DATABASE_URL_INVALID");}
  if(!["postgres:","postgresql:"].includes(db.protocol)||!db.hostname||!db.pathname.slice(1)||
    !["require","verify-full"].includes(db.searchParams.get("sslmode")))fail("RELEASE_DATABASE_TLS_REQUIRED");
  for(const name of [env.SAM_DB_APP_ROLE,env.SAM_DB_SCHEMA]){
    if(!/^[a-z_][a-z0-9_]{0,62}$/.test(name))fail("RELEASE_DATABASE_IDENTIFIER_INVALID");
  }
  if(/^(postgres|root|admin)$/i.test(env.SAM_DB_APP_ROLE)||env.SAM_DB_SCHEMA.startsWith("sam_replit_")){
    fail("RELEASE_DEVELOPMENT_OR_ADMIN_TARGET_FORBIDDEN");
  }
  if(decodeURIComponent(db.username)!==env.SAM_DB_APP_ROLE)fail("RELEASE_APPLICATION_LOGIN_REQUIRED");
  for(const k of ["SAM_RELEASE_ORG_ID","SAM_COMMAND_CENTER_LEGAL_ENTITY_ID"]){
    if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(env[k]))fail("RELEASE_TENANT_INVALID");
  }
  if(env.SAM_COMMAND_CENTER_BEARER_TOKEN.length<32)fail("RELEASE_BEARER_TOO_SHORT");
  const hosts=env.SAM_COMMAND_CENTER_ALLOWED_HOSTS.split(",").map(x=>x.trim());
  if(hosts.some(h=>!h||h==="*"||!/^([a-z0-9-]+\.)*[a-z0-9-]+$/i.test(h))){
    fail("RELEASE_HOST_INVALID");
  }
  for(const origin of env.SAM_COMMAND_CENTER_ALLOWED_ORIGINS.split(",")){
    let u;try{u=new URL(origin.trim());}catch{fail("RELEASE_ORIGIN_INVALID");}
    if(u.protocol!=="https:"||u.origin!==origin.trim()||!hosts.includes(u.hostname))fail("RELEASE_ORIGIN_INVALID");
  }
  const bundle=path.resolve(root,env.SAM_PRODUCTION_BUNDLE_MODULE);
  if(!bundle.startsWith(root+path.sep)||bundle.includes(path.sep+"development"+path.sep)||
    bundle.includes(path.sep+"tests"+path.sep)){
    fail("RELEASE_BUNDLE_FORBIDDEN");
  }
  const capabilities=env.SAM_RELEASE_CAPABILITIES.split(",").map(x=>x.trim());
  if(capabilities.some(c=>!c||!/^[a-zA-Z0-9_.-]{1,80}$/.test(c)||
    /finance|legal|gmail_send|drive_(create|update|delete|write)/i.test(c)))fail("RELEASE_CAPABILITY_FORBIDDEN");
  if(env.SAM_RELEASE_ENABLE_MCP==="1"){
    // An authenticated read-only surface is optional; no write dispatcher is forwarded.
    if(!env.SAM_MCP_BEARER_TOKEN||env.SAM_MCP_BEARER_TOKEN.length<32||
      env.SAM_MCP_BEARER_TOKEN===env.SAM_COMMAND_CENTER_BEARER_TOKEN)fail("RELEASE_DISTINCT_MCP_TOKEN_REQUIRED");
  }
  // Strip inherited connection options; the owner-approved production role/tenant
  // replaces them, not an editor/admin role or development search_path.
  const options=`-c role=${env.SAM_DB_APP_ROLE} -c search_path=${env.SAM_DB_SCHEMA},pg_catalog`+
    ` -c app.current_org_id=${env.SAM_RELEASE_ORG_ID}`+
    ` -c app.current_legal_entity_id=${env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID}`;
  db.searchParams.set("options",options);
  return {
    root,databaseUrl:db.href,bundle,capabilities,
    port:int(env.PORT,1,65535,5000),
    workerPort:0,commandPort:0,mcpPort:0,
    shutdownMs:int(env.SAM_SHUTDOWN_GRACE_MS,100,120000,15000),
    restartLimit:int(env.SAM_RELEASE_RESTART_LIMIT,0,10,3),
    leaseMaxAttempts:int(env.SAM_WORK_LEASE_MAX_ATTEMPTS,1,20,3),
    enableMcp:env.SAM_RELEASE_ENABLE_MCP==="1"
  };
}
function childEnvironment(env,config,service){
  const child={};
  for(const key of ["PATH","HOME","TMPDIR","LANG","TZ","NODE_EXTRA_CA_CERTS"]){
    if(env[key])child[key]=env[key];
  }
  Object.assign(child,{
    NODE_ENV:"production",DATABASE_URL:config.databaseUrl,
    SAM_REQUIRE_GOAL_ACCEPTANCE:"1",SAM_WORKER_ID:"sam-release-worker",
    SAM_SHUTDOWN_GRACE_MS:String(config.shutdownMs),
    SAM_WORK_LEASE_MAX_ATTEMPTS:String(config.leaseMaxAttempts??3),
    SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,
    SAM_COMMAND_CENTER_ALLOWED_HOSTS:env.SAM_COMMAND_CENTER_ALLOWED_HOSTS,
    SAM_COMMAND_CENTER_ALLOWED_ORIGINS:env.SAM_COMMAND_CENTER_ALLOWED_ORIGINS,
    SAM_COMMAND_CENTER_HOST:"127.0.0.1",SAM_COMMAND_CENTER_PORT:String(config.commandPort),
    SAM_RUNTIME_HOST:"127.0.0.1",PORT:String(config.workerPort),
    SAM_RUNTIME_STATUS_BEARER_TOKEN:env.SAM_COMMAND_CENTER_BEARER_TOKEN
  });
  if(service==="worker"){
    Object.assign(child,{
      SAM_COMPOSITION_MODULE:path.join(config.root,"apps/runtime/src/releaseCompositionModule.ts"),
      SAM_PRODUCTION_BUNDLE_MODULE:config.bundle,
      SAM_RELEASE_CAPABILITIES:config.capabilities.join(","),
      SAM_TICK_INTERVAL_MS:"1000"
    });
    // No provider/OAuth keys: the default release envelope has no such consent.
  }else if(service==="command-center"){
    child.SAM_COMMAND_CENTER_BEARER_TOKEN=env.SAM_COMMAND_CENTER_BEARER_TOKEN;
  }else if(service==="mcp"){
    delete child.SAM_RUNTIME_STATUS_BEARER_TOKEN;
    child.SAM_MCP_BEARER_TOKEN=env.SAM_MCP_BEARER_TOKEN;
    child.SAM_MCP_ALLOWED_HOSTS=env.SAM_COMMAND_CENTER_ALLOWED_HOSTS;
    child.SAM_MCP_ALLOWED_ORIGINS=env.SAM_COMMAND_CENTER_ALLOWED_ORIGINS;
    child.SAM_MCP_HOST="127.0.0.1";child.SAM_MCP_PORT=String(config.mcpPort);
    child.SAM_MCP_RELEASE_READ_ONLY="1";
    // Deliberately no SAM_PRODUCTION_BUNDLE_MODULE / mutation dispatcher.
  }
  return child;
}
module.exports={validateRelease,childEnvironment};
