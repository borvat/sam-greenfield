const assert=require("node:assert/strict");
const {onExecutePostLogin}=require("../../scripts/release/auth0-post-login.cjs");
async function main(){
  const secrets={
    SAM_MCP_RESOURCE:"https://sam-fixture.example/mcp",SAM_MCP_CLIENT_ID:"fixture-registered-client",
    SAM_MCP_OWNER_SUB:"auth0|fixture-owner",SAM_MCP_ORG_ID:"11111111-1111-1111-1111-111111111111",
    SAM_MCP_ENTITY_ID:"22222222-2222-2222-2222-222222222222",SAM_MCP_RUN_ID:"33333333-3333-3333-3333-333333333333",
    SAM_MCP_RUN_EXPIRES_AT:new Date(Date.now()+3600000).toISOString()
  };
  const event={secrets,resource_server:{identifier:secrets.SAM_MCP_RESOURCE},
    client:{client_id:secrets.SAM_MCP_CLIENT_ID},user:{user_id:secrets.SAM_MCP_OWNER_SUB}};
  async function run(input){
    const claims={};let denied=false;
    await onExecutePostLogin(input,{access:{deny:()=>{denied=true;}},
      accessToken:{setCustomClaim:(k,v)=>{claims[k]=v;}}});
    return {claims,denied};
  }
  const good=await run(event);assert.equal(good.denied,false);
  assert.deepEqual(good.claims,{
    "https://sam-fixture.example/sam/org_id":secrets.SAM_MCP_ORG_ID,
    "https://sam-fixture.example/sam/legal_entity_id":secrets.SAM_MCP_ENTITY_ID,
    "https://sam-fixture.example/sam/pilot_run_id":secrets.SAM_MCP_RUN_ID
  });
  for(const patch of [{client:{client_id:"other"}},{user:{user_id:"other"}},
    {secrets:{...secrets,SAM_MCP_RUN_EXPIRES_AT:"invalid"}},
    {secrets:{...secrets,SAM_MCP_RUN_EXPIRES_AT:new Date(0).toISOString()}},
    {secrets:{...secrets,SAM_MCP_ORG_ID:"other"}},
    {secrets:{...secrets,SAM_MCP_CLIENT_ID:""}},
    {secrets:{...secrets,SAM_MCP_RESOURCE:"http://sam-fixture.example/mcp"},
      resource_server:{identifier:"http://sam-fixture.example/mcp"}}]){
    const result=await run({...event,...patch});assert.equal(result.denied,true);assert.deepEqual(result.claims,{});
  }
  assert.deepEqual(await run({...event,resource_server:{identifier:"https://other-api.example"}}),
    {claims:{},denied:false});
  assert.deepEqual(await run({...event,secrets:{},resource_server:{identifier:"https://sam-greenfield.replit.app/mcp"}}),
    {claims:{},denied:true});
  assert.deepEqual(await run({...event,secrets:{},resource_server:{identifier:"https://other-api.example"}}),
    {claims:{},denied:false});
  console.log("AUTH0_ACTION_PASS: synthetic registered-client/owner binding, exactly three tenant/run claims; adversarial/missing configuration refusals; unrelated API untouched even before configuration. No provider calls or scope grants.");
}
main().catch(()=>{console.error("AUTH0_ACTION_TEST_FAILED");process.exitCode=1;});
