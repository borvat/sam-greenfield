const path=require("node:path");
const bundlePath="apps/production/src/syntheticPilotBundleModule.ts";
function deny(){throw new Error("RELEASE_SYNTHETIC_PILOT_CONFIGURATION_REQUIRED");}
function syntheticPilot(env,now=Date.now()){
  if(env.SAM_RELEASE_SYNTHETIC_PLANNER!=="1")return undefined;
  if(env.NODE_ENV!=="production"||env.SAM_RELEASE_APPROVED!=="1"||
    env.SAM_DATABASE_TARGET!=="production"||env.REPLIT_DEV_DOMAIN||
    env.SAM_DEVELOPMENT_SAFE_MODE==="1"||env.SAM_AUTONOMY_SANDBOX==="1"||
    env.SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED!=="1"||
    !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(env.SAM_PILOT_RUN_ID??""))deny();
  const expiry=Date.parse(env.SAM_PILOT_EXPIRES_AT);
  const reviewed=Date.parse(env.SAM_PILOT_PRICE_REVIEWED_AT);
  const input=Number(env.SAM_PILOT_INPUT_USD_PER_1K),output=Number(env.SAM_PILOT_OUTPUT_USD_PER_1K);
  const requests=Number(env.SAM_PILOT_MAX_REQUESTS),cost=Number(env.SAM_PILOT_MAX_COST_USD);
  if(!Number.isFinite(expiry)||expiry<=now||expiry>now+86400000||
    !Number.isFinite(reviewed)||reviewed>now||reviewed<now-7*86400000||
    ![input,output,cost].every(n=>Number.isFinite(n)&&n>0)||
    cost>0.25||!Number.isInteger(requests)||requests<1||requests>4||
    path.normalize(env.SAM_PRODUCTION_BUNDLE_MODULE??"")!==bundlePath||
    env.SAM_RELEASE_CAPABILITIES!=="local.calculate,local.statistics"||
    !env.DEEPSEEK_API_KEY?.trim()||
    (env.SAM_RELEASE_ENABLE_MCP==="1"&&
      (env.SAM_MCP_SYNTHETIC_TOOLS!=="1"||env.SAM_MCP_OAUTH_APPROVED!=="1")))deny();
  return {runId:env.SAM_PILOT_RUN_ID,expiry,input,output,requests,cost};
}
module.exports={syntheticPilot,bundlePath};
