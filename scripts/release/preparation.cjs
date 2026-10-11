// Offline, nonsecret preparation. No process.env, database, providers or writes.
const {validateSetupConfiguration}=require("./setup.cjs");
const values=Object.freeze({
  NODE_ENV:"production",
  SAM_RELEASE_APPROVED:"0",
  SAM_RELEASE_SETUP_MODE:"1",
  SAM_RELEASE_SETUP_LOCAL:"0",
  SAM_DATABASE_TARGET:"production",
  SAM_DB_CONNECTION_SOURCE:"replit_managed",
  SAM_DB_CONNECTION_MODE:"direct",
  SAM_DB_SCHEMA:"sam",
  SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/syntheticPilotBundleModule.ts",
  SAM_RELEASE_CAPABILITIES:"local.calculate,local.statistics",
  SAM_RELEASE_ENABLE_MCP:"1",
  SAM_MCP_SYNTHETIC_TOOLS:"1",
  SAM_MCP_OAUTH_APPROVED:"0",
  SAM_RELEASE_SYNTHETIC_PLANNER:"1",
  SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED:"0",
  SAM_PILOT_MAX_REQUESTS:"1",
  SAM_PILOT_MAX_COST_USD:"0.01"
});
function report(config=values){
  // Offline preparation must not manufacture the platform's runtime marker.
  if(["REPLIT_DEPLOYMENT","REPLIT_DEV_DOMAIN"].some(key=>Object.hasOwn(config,key))){
    throw new Error("RELEASE_PREPARATION_MANAGED_MARKER_FORBIDDEN");
  }
  const setup=validateSetupConfiguration(config);
  if(config.SAM_MCP_OAUTH_APPROVED!=="0"||
    config.SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED!=="0"){
    throw new Error("RELEASE_PREPARATION_ACTIVATION_FORBIDDEN");
  }
  if(Object.entries(values).some(([key,value])=>config[key]!==value)){
    throw new Error("RELEASE_PREPARATION_PROFILE_MISMATCH");
  }
  return {
    status:"SETUP_CONFIGURATION_READY_EXECUTIVE_BLOCKED",
    classification:"OFFLINE_CONFIGURATION_NOT_DEPLOYMENT_OR_DB_PROOF",
    setup:{port:setup.port,rootStatus:200,readyStatus:503},
    runtimeContext:"NOT_VERIFIED_REQUIRES_PLATFORM_REPLIT_DEPLOYMENT_1",
    executiveWorker:false,databaseConnections:0,modelCalls:0,
    businessActions:false,publishAuthorized:false,
    oauthDiscovery:setup.oauthDiscovery?"PUBLIC_METADATA_ONLY":"NOT_CONFIGURED",
    missingExternalEvidence:[
      "ACTUAL_RESTRICTED_PRODUCTION_LOGIN_TLS_RLS_SCHEMA_AND_SYNTHETIC_SEED",
      "FINAL_RESERVED_HTTPS_RESOURCE",
      "AUTH0_ISSUER_CLIENT_OWNER_PUBLIC_JWKS_AND_BOUND_CLAIMS",
      "AUTH0_RFC8707_RESOURCE_COMPATIBILITY_PKCE_AND_EXACT_CALLBACK",
      "REVIEWED_PROVIDER_PRICING_RUN_SCOPE_AND_EXPIRY",
      "SEPARATE_PUBLISH_AND_SECRET_USE_APPROVAL"
    ]
  };
}
module.exports={values,report};
if(require.main===module){
  if(process.argv.includes("--print-env")){
    console.log(Object.entries(values).map(([key,value])=>`${key}=${value}`).join("\n"));
  }else console.log(JSON.stringify(report(),null,2));
}
