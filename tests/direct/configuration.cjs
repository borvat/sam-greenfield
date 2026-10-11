const assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const {onExecutePostLogin}=require('../../scripts/direct/auth0-post-login.cjs');
const {manifest}=require('../../scripts/direct/provision.cjs');
(async()=>{
 const secrets={SAM_MCP_RESOURCE:'https://sam.example/mcp',SAM_MCP_CLIENT_ID:'client',SAM_MCP_OWNER_SUB:'owner',SAM_MCP_ORG_ID:'00000000-0000-4000-8000-000000000001',SAM_MCP_ENTITY_ID:'00000000-0000-4000-8000-000000000002'};
 const event={secrets,resource_server:{identifier:secrets.SAM_MCP_RESOURCE},client:{client_id:'client'},user:{user_id:'owner'}};
 let denied=false,claims={};const api={access:{deny:()=>{denied=true;}},accessToken:{setCustomClaim:(k,v)=>{claims[k]=v;}}};
 await onExecutePostLogin(event,api);assert.equal(denied,false);assert.deepEqual(Object.keys(claims).sort(),['https://sam.example/sam/legal_entity_id','https://sam.example/sam/org_id']);
 for(const variant of [{...event,user:{user_id:'other'}},{...event,client:{client_id:'other'}},{...event,secrets:{...secrets,SAM_MCP_ENTITY_ID:'invalid'}}]){denied=false;claims={};await onExecutePostLogin(variant,api);assert.equal(denied,true);assert.deepEqual(claims,{});}
 const replit=fs.readFileSync('.replit','utf8');assert.match(replit,/run = \["env", "NODE_ENV=production", "npm", "run", "start:direct"\]/);assert.doesNotMatch(replit,/SAM_RELEASE_SETUP_MODE = "1"|SAM_RELEASE_SYNTHETIC_PLANNER = "1"|start:release/);
 const unconfigured=spawnSync(process.execPath,['scripts/direct/main.cjs','--validate-only'],{env:{PATH:process.env.PATH,NODE_ENV:'production'},encoding:'utf8'});assert.equal(unconfigured.status,1);assert.match(unconfigured.stderr,/DIRECT_STARTUP_REFUSED/);
 const noop=spawnSync(process.execPath,['scripts/direct/provision.cjs'],{env:{PATH:process.env.PATH},encoding:'utf8'});assert.equal(noop.status,0);assert.equal(JSON.parse(noop.stdout).connections,0);
 assert.throws(()=>manifest({}));
 console.log('DIRECT_CONFIGURATION_PASS: direct import profile; private owner/client Auth0 binding; incomplete configuration denied; provisioner defaults to no connection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
