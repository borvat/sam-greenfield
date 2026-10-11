// Provisioning surface only. Intentionally imports no SAM, DB or provider modules.
const http=require("node:http");
const {setupOAuthDiscovery}=require("./setup-oauth-discovery.cjs");
function fail(code){throw new Error(code);}
function setupModeEnabled(env){
  for(const key of ["SAM_RELEASE_SETUP_MODE","SAM_RELEASE_SETUP_LOCAL"]){
    if(env[key]!==undefined&&!["0","1"].includes(env[key]))fail("RELEASE_SETUP_FLAG_INVALID");
  }
  if(env.SAM_RELEASE_SETUP_LOCAL==="1"&&env.SAM_RELEASE_SETUP_MODE!=="1"){
    fail("RELEASE_SETUP_LOCAL_WITHOUT_MODE");
  }
  return env.SAM_RELEASE_SETUP_MODE==="1";
}
// Pure configuration lint; does not attest the environment in which it runs.
function validateSetupConfiguration(env){
  if(!setupModeEnabled(env)||env.SAM_RELEASE_APPROVED!=="0"){
    fail("RELEASE_SETUP_EXECUTIVE_APPROVAL_FORBIDDEN");
  }
  const local=env.SAM_RELEASE_SETUP_LOCAL==="1";
  if(local){
    if(env.NODE_ENV!=="test")fail("RELEASE_SETUP_LOCAL_TEST_REQUIRED");
  }else{
    if(env.NODE_ENV!=="production")fail("RELEASE_SETUP_PRODUCTION_CONTEXT_REQUIRED");
    if(![undefined,"0"].includes(env.SAM_DEVELOPMENT_SAFE_MODE))fail("RELEASE_SETUP_DEV_SAFE_MODE_FORBIDDEN");
    if(![undefined,"0"].includes(env.SAM_AUTONOMY_SANDBOX))fail("RELEASE_SETUP_DEV_SANDBOX_FORBIDDEN");
  }
  const port=env.PORT===undefined?5000:Number(env.PORT);
  if(!/^[0-9]+$/.test(String(env.PORT??5000))||!Number.isSafeInteger(port)||port<1||port>65535){
    fail("RELEASE_SETUP_PORT_INVALID");
  }
  return {port,host:local?"127.0.0.1":"0.0.0.0",oauthDiscovery:setupOAuthDiscovery(env)};
}
function validateSetup(env){
  const config=validateSetupConfiguration(env);
  if(env.SAM_RELEASE_SETUP_LOCAL==="1"){
    if(![undefined,"0"].includes(env.REPLIT_DEPLOYMENT))fail("RELEASE_SETUP_LOCAL_TEST_REQUIRED");
  }else if(env.REPLIT_DEPLOYMENT!=="1"){
    fail("RELEASE_SETUP_DEPLOYMENT_MARKER_REQUIRED");
  }
  // REPLIT_DEV_DOMAIN may also be injected into a published VM. It is metadata,
  // not a development-mode attestation. No worker/DB/tool approvals change.
  return config;
}
const status=JSON.stringify({
  mode:"SETUP",ready:false,executiveActivationAuthorized:false,
  executiveWorker:"DISABLED",businessApi:"DISABLED",database:"NOT_CONNECTED",
  models:"DISABLED",externalOperations:"DISABLED",billingCapEnforced:false
});
const page=`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SAM — Setup Mode</title><style>
body{margin:0;background:#101820;color:#edf2f5;font:18px system-ui;line-height:1.8}
main{max-width:700px;margin:10vh auto;padding:32px;border:1px solid #435361;border-radius:12px}
h1{font-size:30px}strong{color:#f6c969}small{color:#b7c4ce}
</style><main><small>SAM Greenfield · Setup Mode</small>
<h1>سام غير مفعّل</h1><p><strong>وضع تهيئة مغلق — ليس تشغيل سام التنفيذي.</strong></p>
<p>العامل ولوحة الأعمال والنماذج والعمليات الخارجية معطّلة. لا اتصال بقاعدة البيانات من هذا الوضع.</p>
<p>يلزم إثبات هوية قاعدة مستقلة وصلاحياتها وRLS والاستعادة، ثم تفويض تشغيل مستقل.</p>
<small>هذا الوضع لا يوقف فوترة الاستضافة ولا يفرض سقف إنفاق تلقائياً.</small></main></html>`;
function startSetup(config){
  const setupStatus=JSON.stringify({...JSON.parse(status),
    oauthDiscovery:config.oauthDiscovery?"PUBLIC_METADATA_ONLY":"NOT_CONFIGURED"});
  const server=http.createServer({maxHeaderSize:8192},(req,res)=>{
    res.setHeader("cache-control","no-store");
    res.setHeader("x-content-type-options","nosniff");
    res.setHeader("content-security-policy","default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    res.setHeader("referrer-policy","no-referrer");
    if(req.url==="/mcp"){
      // Never validate/accept a token or instantiate an MCP handler in Setup.
      req.resume();
      if(config.oauthDiscovery)res.setHeader("www-authenticate",config.oauthDiscovery.challenge);
      res.writeHead(config.oauthDiscovery?401:503,{"content-type":"application/json","connection":"close"});
      res.end(req.method==="HEAD"?"":JSON.stringify({
        error:config.oauthDiscovery?"SETUP_MCP_DISABLED":"OAUTH_DISCOVERY_NOT_CONFIGURED"
      }));return;
    }
    if(req.method!=="GET"&&req.method!=="HEAD"){
      res.writeHead(405,{"allow":"GET, HEAD","connection":"close"});res.end();return;
    }
    if(["/.well-known/oauth-protected-resource","/.well-known/oauth-protected-resource/mcp"].includes(req.url)){
      res.writeHead(config.oauthDiscovery?200:503,{"content-type":"application/json"});
      res.end(req.method==="HEAD"?"":JSON.stringify(config.oauthDiscovery?.metadata??
        {error:"OAUTH_DISCOVERY_NOT_CONFIGURED"}));return;
    }
    if(req.url==="/"||req.url==="/livez"||req.url==="/readyz"){
      const html=req.url==="/";
      res.writeHead(req.url==="/readyz"?503:200,{"content-type":html?"text/html; charset=utf-8":"application/json"});
      res.end(req.method==="HEAD"?"":html?page:setupStatus);return;
    }
    res.writeHead(404,{"content-type":"application/json"});res.end(req.method==="HEAD"?"":'{"error":"SETUP_SURFACE_ONLY"}');
  });
  server.maxConnections=32;server.maxRequestsPerSocket=10;
  server.headersTimeout=5000;server.requestTimeout=5000;server.keepAliveTimeout=1000;
  const ready=new Promise((resolve,reject)=>{
    server.once("error",reject);
    server.listen(config.port,config.host,resolve);
  });
  let stopping;
  function stop(){
    if(!stopping)stopping=new Promise(resolve=>{
      server.close(resolve);server.closeAllConnections();
    });
    return stopping;
  }
  return {ready,stop};
}
module.exports={setupModeEnabled,validateSetupConfiguration,validateSetup,startSetup};
