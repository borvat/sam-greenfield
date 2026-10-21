import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {cloudReadPolicy,buildCloudReadOnlyBundle} from '../../apps/production/src/cloudReadOnlyBundle';
import {assessCloudTrials,cloudPrerequisites,fixedCloudRevision,type CloudTrial} from '../../apps/production/src/cloudAcceptance';
import {validateProductionBundle} from '../../apps/production/src/bundle';
const A='11111111-1111-4111-8111-111111111111';
const scope={companyId:A,repository:{owner:'fixture-owner',name:'fixture-repo'},workspaceId:'tea-fixture',serviceIds:['srv-fixture']};
const schema=(props:any)=>({type:'object',properties:props,required:Object.keys(props),additionalProperties:false});
const gh={name:'list_commits',description:'Reviewed repository history read',inputSchema:schema({owner:{type:'string'},repo:{type:'string'}})};
const render={name:'get_service',description:'Reviewed service state read',inputSchema:schema({workspaceId:{type:'string'},serviceId:{type:'string'}})};
function manifest(){return {version:1,servers:[{serverId:'github',companyId:A,domain:'github',endpoint:'https://api.githubcopilot.com/mcp/readonly',credentialEnv:'SAM_MCP_SECRET_GITHUB',tools:[gh]},{serverId:'render',companyId:A,domain:'render',endpoint:'https://mcp.render.com/mcp',credentialEnv:'SAM_MCP_SECRET_RENDER',tools:[render]}]}}
const env={SAM_MCP_SECRET_GITHUB:'fixture-only',SAM_MCP_SECRET_RENDER:'fixture-only'};
test('cloud policy rejects writes, unknown destinations, wrong company and unscoped old schemas before connection',()=>{
 for(const change of [(m:any)=>m.servers[0].tools=[{...gh,name:'create_pull_request'}],(m:any)=>m.servers[0].endpoint='https://api.githubcopilot.com/mcp/',(m:any)=>m.servers[1].companyId='22222222-2222-4222-8222-222222222222',(m:any)=>m.servers[1].tools=[{...render,inputSchema:schema({serviceId:{type:'string'}})}]]){
  const m=manifest();change(m);assert.throws(()=>cloudReadPolicy(JSON.stringify(m),scope));
 }
});
test('fixture transport tests scope enforcement and original-schema pins, never evidence of a live cloud connection',async()=>{
 let calls=0;const factory:any=async(server:any)=>({close:async()=>{},client:{listTools:async()=>({tools:server.tools}),callTool:async()=>{calls++;return {content:[{type:'text',text:'fixture stable source'}]}}}});
 const expanded=await buildCloudReadOnlyBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},JSON.stringify(manifest()),scope,env,factory);
 try{
  const bundle=validateProductionBundle(expanded.bundle),adapter=bundle.tools.adapter('research_mcp_github_list_commits');
  const request={capabilityId:adapter.capabilityId,legalEntityId:A,idempotencyKey:'fixture',params:{owner:'other',repo:'fixture-repo'}};
  await assert.rejects(adapter.execute(request));assert.equal(calls,0);
  const output=await adapter.execute({...request,params:{owner:'fixture-owner',repo:'fixture-repo'}});assert.equal(calls,1);
  const verify=bundle.verifiers.get(adapter.capabilityId)!;
  assert.equal((await verify.verify({execution:{id:'fixture',capabilityId:adapter.capabilityId,legalEntityId:A,params:{owner:'fixture-owner',repo:'fixture-repo'},result:output.result,evidence:output.evidence,operationKeyRef:null},contract:{id:'fixture',method:'api_readback',requiredEvidenceFields:{},independentQueryTemplate:{}}})).result,'VERIFIED');assert.equal(calls,2);
  const rd=bundle.tools.adapter('research_mcp_render_get_service');
  await assert.rejects(rd.execute({...request,capabilityId:rd.capabilityId,params:{workspaceId:'tea-other',serviceId:'srv-fixture'}}));assert.equal(calls,2);
  await assert.rejects(rd.execute({...request,capabilityId:rd.capabilityId,params:{workspaceId:'tea-fixture',serviceId:'srv-other'}}));assert.equal(calls,2);
 }finally{await expanded.close()}
 let connected=0;
 await assert.rejects(buildCloudReadOnlyBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},JSON.stringify(manifest()),scope,{},async()=>{connected++;throw new Error('must not connect')}),/CREDENTIAL/);assert.equal(connected,0);
});
test('acceptance requires ten distinct completed goals, actual model choices, both sources, fresh verification and attributed memory',()=>{
 const good:CloudTrial={goalId:'0',state:'COMPLETED',liveChoices:1,modelSelectedAllExecuted:true,githubVerified:1,renderVerified:1,githubMemory:1,renderMemory:1,unverified:0,memory:2,report:true};
 const trials=Array.from({length:10},(_,i)=>({...good,goalId:String(i)}));assert.equal(assessCloudTrials(trials),true);
 assert.equal(assessCloudTrials(trials.slice(1)),false);assert.equal(assessCloudTrials([...trials.slice(1),trials[1]]),false);
 for(const patch of [{state:'VERIFYING'},{liveChoices:0},{modelSelectedAllExecuted:false},{githubVerified:0},{renderVerified:0},{unverified:1},{memory:0},{githubMemory:0},{renderMemory:0},{report:false}])assert.equal(assessCloudTrials([{...good,...patch},...trials.slice(1)]),false);
 assert.ok(cloudPrerequisites({}).includes('LIVE_MODEL_CREDENTIAL_AND_MODEL'));
});
test('fixed revision check rejects edits and untracked executable source without changing the inspected checkout',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sam-fixed-'));
 const git=(...args:string[])=>execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();
 try{
  git('init','-q');await writeFile(join(dir,'source.ts'),'export const version=1;\n');git('add','source.ts');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','fixture');const sha=git('rev-parse','HEAD');
  assert.equal(fixedCloudRevision(sha,dir),sha);
  await writeFile(join(dir,'injected.ts'),'throw new Error();');assert.throws(()=>fixedCloudRevision(sha,dir),/REVISION_NOT_FIXED/);
  await rm(join(dir,'injected.ts'));await writeFile(join(dir,'source.ts'),'changed');assert.throws(()=>fixedCloudRevision(sha,dir),/REVISION_NOT_FIXED/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('live entry point reports BLOCKED with zero trials before any inherited production DB fallback',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sam-cloud-preflight-')),report=join(dir,'report.json');
 try{
  const result=spawnSync(process.execPath,['--import','tsx','scripts/cloud-mcp-autonomy.ts'],{cwd:process.cwd(),env:{PATH:process.env.PATH,SAM_CLOUD_REPORT:report,DATABASE_URL:'postgres://forbidden.invalid/production'},encoding:'utf8',timeout:10000});
  assert.equal(result.status,2);const receipt=JSON.parse(await readFile(report,'utf8'));
  assert.equal(receipt.state,'BLOCKED');assert.equal(receipt.liveAccepted,false);assert.deepEqual(receipt.trials,[]);
  assert.ok(receipt.missing.includes('SAM_CLOUD_DB_URL'));assert.equal(receipt.errorCode,undefined);
 }finally{await rm(dir,{recursive:true,force:true})}
});
