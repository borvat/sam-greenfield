import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
import {PostgresSamGoogleOauthStore} from '../../apps/production/src/samGoogleOauthPostgres';
import {beginSamGoogleOauth,finishSamGoogleOauth} from '../../apps/production/src/samGoogleOauthFlow';
import {SAM_GOOGLE_ISSUER} from '../../apps/production/src/samGoogleOauthPkce';
import {SAM_GOOGLE_ALLOWED_TOOLS,SamGoogleMcpBridge} from '../../apps/production/src/samGoogleMcpBridge';
import {discoverResearchMcpCapabilities} from '../../apps/tools/src/mcpResearchAdapter';
import {internalOAuthConfig} from '../../apps/mcp/src/internalOAuth';
async function main(){
 const c=await pool.connect();try{await applyIntegrationProfile(c);}finally{c.release();}
 const key=randomBytes(32),store=new PostgresSamGoogleOauthStore(pool,key);
 const config={ownerId:'synthetic-owner',clientId:'https://fixture.invalid/client',redirectUri:'https://fixture.invalid/callback',transactions:store,tokens:store};
 const original=globalThis.fetch;let exchanges=0,calls=0;
 assert.throws(()=>internalOAuthConfig({SAM_MCP_INTERNAL_OAUTH_ENABLED:'1',SAM_MCP_BEARER_TOKEN:'synthetic-service-bearer',SAM_MCP_PUBLIC_RESOURCE_URL:'https://fixture.invalid/mcp',SAM_MCP_OAUTH_OWNER_EMAIL:'owner@example.invalid',SAM_MCP_OAUTH_SIGNING_PRIVATE_KEY:'fixture-not-a-key'}),/CONFIG_REQUIRED/);
 globalThis.fetch=async(input,init)=>{
  const url=String(input);assert(url.startsWith(SAM_GOOGLE_ISSUER+'/'));
  if(url.endsWith('/token')){exchanges++;return Response.json({access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_in:300});}
  const body=JSON.parse(String(init?.body));calls++;
  if(body.method==='notifications/initialized')return new Response(null,{status:202});
  const result=body.method==='initialize'?{protocolVersion:'2025-03-26'}:body.method==='tools/list'?{
   tools:[...SAM_GOOGLE_ALLOWED_TOOLS.map(name=>({name,inputSchema:{type:'object'},annotations:{readOnlyHint:true}})),{name:'send_email',annotations:{readOnlyHint:true}}]
  }:{content:[{type:'text',text:'Synthetic supplier terms: EUR 23, lead time 4 days.'}]};
  return Response.json({jsonrpc:'2.0',id:body.id,result});
 };
 try{
  const authorization=new URL(await beginSamGoogleOauth(config)),state=authorization.searchParams.get('state')!;
  assert.equal(authorization.searchParams.get('code_challenge_method'),'S256');
  await assert.rejects(()=>finishSamGoogleOauth(config,{state,code:'synthetic-code',issuer:'https://wrong.invalid/'}),/ISSUER/);
  assert.equal(await finishSamGoogleOauth(config,{state,code:'synthetic-code',issuer:SAM_GOOGLE_ISSUER+'/'}),'AUTHORIZED');
  await assert.rejects(()=>finishSamGoogleOauth(config,{state,code:'synthetic-code',issuer:SAM_GOOGLE_ISSUER+'/'}),/STATE_INVALID/);
  assert.equal(exchanges,1);assert.equal(await store.loadRefresh(config.ownerId,config.clientId),'synthetic-refresh');
  const sealed=(await pool.query('SELECT refresh_sealed FROM sam_google_oauth_tokens')).rows[0].refresh_sealed;
  assert(!sealed.includes('synthetic-refresh'));
  await assert.rejects(()=>new PostgresSamGoogleOauthStore(pool,randomBytes(32)).loadRefresh(config.ownerId,config.clientId),/DECRYPT/);
  const wrongState=new URL(await beginSamGoogleOauth(config)).searchParams.get('state')!;
  await assert.rejects(()=>finishSamGoogleOauth({...config,ownerId:'another-owner'},{state:wrongState,code:'fixture',issuer:SAM_GOOGLE_ISSUER+'/'}),/OWNER_CLIENT/);
  const expired=new URL(await beginSamGoogleOauth(config)).searchParams.get('state')!;
  await pool.query("UPDATE sam_google_oauth_states SET created_at=now()-interval '11 minutes'");
  await assert.rejects(()=>finishSamGoogleOauth(config,{state:expired,code:'fixture',issuer:SAM_GOOGLE_ISSUER+'/'}),/EXPIRED/);
  const bridge=new SamGoogleMcpBridge('synthetic-access');
  assert.equal((await bridge.discover()).length,7);assert((await bridge.read('get_drive_file_content',{file_id:'fixture'})));
  const before=calls;await assert.rejects(()=>bridge.read('send_email' as any,{}),/NOT_ALLOWED/);assert.equal(calls,before);
  const remote={listTools:async()=>({tools:[{name:'read_terms',inputSchema:{type:'object',properties:{},additionalProperties:false}}]}),
   callTool:async()=>({content:[{type:'text',text:'Synthetic risk evidence'}]})};
  const research=await discoverResearchMcpCapabilities({serverId:'fixture',client:remote,allowedReadTools:['read_terms']});
  await assert.rejects(()=>discoverResearchMcpCapabilities({serverId:'fixture',allowedReadTools:['read_terms'],client:{...remote,listTools:async()=>({tools:[{name:'read_terms',inputSchema:{type:'object',oneOf:[{}]}}]})}}),/SCHEMA_UNSUPPORTED/);
  const execution=await research.toolAdapters[0].execute({capabilityId:research.capabilities[0].capabilityId,params:{},idempotencyKey:'fixture'});
  const proof=await research.verificationAdapters[0].verify({execution:{capabilityId:research.capabilities[0].capabilityId,params:{},result:execution.result},contract:{id:'fixture',method:'api_readback'}});
  assert.equal(proof.result,'VERIFIED');
  remote.callTool=async()=>({content:[{type:'text',text:'Changed source'}]});
  assert.equal((await research.verificationAdapters[0].verify({execution:{capabilityId:research.capabilities[0].capabilityId,params:{},result:execution.result},contract:{id:'fixture',method:'api_readback'}})).result,'INCONCLUSIVE');
  console.log(JSON.stringify({test:'INTEGRATION_OAUTH_MCP',status:'PASS',realPostgres:true,tokenExchangesMocked:exchanges,mcpRequestsMocked:calls,liveProviderRequests:0,
   tested:['PKCE','state replay/expiry/owner/issuer refusals','durable sealed tokens','seven-tool read allowlist','fresh MCP readback mismatch refusal']}));
 }finally{globalThis.fetch=original;await pool.end();}
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
