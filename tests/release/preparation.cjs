const assert=require("node:assert/strict");
const fs=require("node:fs");
const {values,report}=require("../../scripts/release/preparation.cjs");
const pasted=Object.fromEntries(fs.readFileSync("docs/release/env.closed-setup.example","utf8")
  .trim().split("\n").map(line=>[line.slice(0,line.indexOf("=")),line.slice(line.indexOf("=")+1)]));
assert.deepEqual(pasted,values);
const result=report();
assert.equal(result.setup.rootStatus,200);
assert.equal(result.setup.readyStatus,503);
assert.equal(result.executiveWorker,false);
assert.equal(result.databaseConnections,0);
assert.equal(result.modelCalls,0);
assert.equal(result.publishAuthorized,false);
assert.equal(result.runtimeContext,"NOT_VERIFIED_REQUIRES_PLATFORM_REPLIT_DEPLOYMENT_1");
assert.throws(()=>report({...values,REPLIT_DEPLOYMENT:"1"}));
assert.equal(Object.hasOwn(values,"REPLIT_DEPLOYMENT"),false);
for(const [key,value] of [
  ["SAM_RELEASE_APPROVED","1"],["SAM_RELEASE_SETUP_MODE","0"],
  ["SAM_MCP_OAUTH_APPROVED","1"],["SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED","1"],
  ["REPLIT_DEV_DOMAIN","fixture.invalid"],["SAM_PILOT_MAX_REQUESTS","1000"],
  ["SAM_RELEASE_CAPABILITIES","finance.transfer"],["SAM_DB_CONNECTION_MODE","transaction"]
])assert.throws(()=>report({...values,[key]:value}));
for(const forbidden of ["DATABASE_URL","SESSION_SECRET","DEEPSEEK_API_KEY",
  "SAM_COMMAND_CENTER_BEARER_TOKEN","SAM_MCP_OAUTH_ISSUER","SAM_MCP_OAUTH_RESOURCE"])
  assert.equal(Object.hasOwn(values,forbidden),false);
console.log("PREPARATION_PASS: exact nonsecret profile; eight unsafe configuration cases refused; no connections.");
