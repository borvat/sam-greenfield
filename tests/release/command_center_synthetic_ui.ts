import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {pool} from "../../packages/db/src/client";
import {startCommandCenterHttpServer} from "../../apps/command-center/src/http";
import {commandCenterOverview,commandCenterGoalTimeline} from "../../apps/command-center/src/store";

const {childEnvironment}=createRequire(import.meta.url)("../../scripts/release/contract.cjs");
const entity="11111111-1111-4111-8111-111111111111";
const fakeToken="synthetic-local-token-not-a-real-credential";
const queries:string[]=[];
const originalConnect=pool.connect;
// View/query-shape regression only: no database, provider or acceptance claim.
(pool as any).connect=async()=>({
  query:async(text:string)=>{
    queries.push(text);
    if(text.startsWith("SELECT * FROM goals"))return {rowCount:1,rows:[{id:entity}]};
    return {rowCount:0,rows:[]};
  },
  release(){}
});

async function main(){
  const env={NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
    SAM_RELEASE_SYNTHETIC_PLANNER:"1",SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED:"1",
    SAM_PILOT_RUN_ID:entity,SAM_PILOT_EXPIRES_AT:new Date(Date.now()+3600000).toISOString(),
    SAM_PILOT_PRICE_REVIEWED_AT:new Date().toISOString(),SAM_PILOT_INPUT_USD_PER_1K:"0.0003",
    SAM_PILOT_OUTPUT_USD_PER_1K:"0.0012",SAM_PILOT_MAX_REQUESTS:"1",SAM_PILOT_MAX_COST_USD:"0.01",
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/syntheticPilotBundleModule.ts",
    SAM_RELEASE_CAPABILITIES:"local.calculate,local.statistics",DEEPSEEK_API_KEY:"fake-local-only"};
  const config={databaseUrl:process.env.DATABASE_URL,commandPort:0,workerPort:0,shutdownMs:1000};
  const cc=childEnvironment(env,config,"command-center");
  assert.equal(cc.SAM_RELEASE_SYNTHETIC_PLANNER,"1");
  assert.equal(cc.SAM_REQUIRE_GOAL_ACCEPTANCE,"1");
  assert.equal(cc.DEEPSEEK_API_KEY,undefined);
  assert.equal(cc.SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED,undefined);
  assert.equal(childEnvironment({...env,SAM_RELEASE_SYNTHETIC_PLANNER:"0"},config,"command-center").SAM_RELEASE_SYNTHETIC_PLANNER,undefined);
  assert.throws(()=>childEnvironment({...env,SAM_PILOT_MAX_COST_USD:"0"},config,"command-center"));
  const http=await startCommandCenterHttpServer({legalEntityId:entity,port:0,host:"127.0.0.1",
    bearerToken:fakeToken,allowedHosts:"127.0.0.1"});
  try{
    const address=http.server.address();
    assert(address&&typeof address!=="string");
    const root=`http://127.0.0.1:${address.port}`;
    for(const [flag,domain] of [["0","owner_command"],["1","release_synthetic"]]){
      process.env.SAM_RELEASE_SYNTHETIC_PLANNER=flag;
      const html=await (await fetch(root)).text();
      assert(html.includes(`id="domain" value="${domain}"`));
      if(flag==="1"){
        assert(!html.includes("<option>YELLOW</option>"));
        assert(html.includes('id="acceptance" required'));
        assert(html.includes("&quot;synthetic&quot;"));
        assert(html.includes('value==null?"DISABLED"'));
        assert(html.includes("SYNTHETIC PILOT · CONNECTED"));
      }else assert(html.includes("<option>YELLOW</option>"));
    }
    const before=queries.length;
    assert.equal((await fetch(root+"/api/finance/latest")).status,401);
    const finance=await (await fetch(root+"/api/finance/latest",{headers:{Authorization:`Bearer ${fakeToken}`}})).json();
    assert.equal(finance.data,null);
    assert.equal(queries.length,before);
    await commandCenterOverview(entity);
    await commandCenterGoalTimeline(entity,entity);
    assert(!queries.some(sql=>/\b(approvals|side_effect_operations)\b/.test(sql)));
  }finally{await http.close();}
  console.log("PASS SYNTHETIC_RELEASE_UI: validated marker, no provider key, original defaults, GREEN scope, required contract, authenticated disabled finance, restricted read SQL; no DB/provider calls.");
}
main().catch(()=>{console.error("FAIL SYNTHETIC_RELEASE_UI");process.exitCode=1;})
  .finally(async()=>{pool.connect=originalConnect;await pool.end();});
