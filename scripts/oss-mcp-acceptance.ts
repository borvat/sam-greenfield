import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {PGlite} from '@electric-sql/pglite';
import {buildOssStdioReadBundle,type OssStdioProfile} from '../apps/production/src/ossStdioBundle';
import {validateProductionBundle} from '../apps/production/src/bundle';
import {createToolExecutors} from '../apps/tools/src/executorFactory';
import {pool} from '../packages/db/src/client';
import {companyCapabilities} from '../packages/tool-gateway/src/companyScope';
import {proposePlan} from '../apps/brain/src/planner';

async function main(){
const root=process.env.SAM_OSS_LAB_ROOT;
if(!root||!process.env.SAM_OSS_LAB_REPORT)throw new Error('Explicit lab root and report required');
const nodeRoot=resolve(root,'oss-mcp-lab/node_modules'),python=resolve(root,'oss-mcp-python/bin/python');
for(const [name,version] of [['@modelcontextprotocol/server-filesystem','2.0.0'],['@playwright/mcp','0.0.83']]){
 const metadata=JSON.parse(await readFile(join(nodeRoot,name,'package.json'),'utf8'));assert.equal(metadata.version,version);
}
const pyVersions=JSON.parse(execFileSync(python,['-c',"import json,importlib.metadata as m; print(json.dumps({n:m.version(n) for n in ['mcp-server-git','mcp-server-fetch']}))"],{encoding:'utf8'}));
assert.equal(pyVersions['mcp-server-git'],'2026.10.19');assert.equal(pyVersions['mcp-server-fetch'],'2026.10.19');
const work=await mkdtemp(join(root,'oss-acceptance-')),file=join(work,'source.txt'),reportFile=join(work,'sam-result.txt');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const G='33333333-3333-4333-8333-333333333333',P='44444444-4444-4444-8444-444444444444',Q='55555555-5555-4555-8555-555555555555';
const text='SAM isolated source: verified fixture, no company business data.\n';
await writeFile(file,text);execFileSync('git',['init','-q',work]);
const pins=JSON.parse(await readFile('integrations/oss-mcp/reviewed-tools.json','utf8'));
const profiles:OssStdioProfile[]=[
 {id:'oss_files',companyId:A,command:process.execPath,args:[join(nodeRoot,'@modelcontextprotocol/server-filesystem/dist/index.js'),work],package:'@modelcontextprotocol/server-filesystem',version:'2.0.0',repository:'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',tools:pins.filesystem,
 parameterConstraints:{read_text_file:{path:{type:'string',enum:[file,reportFile]}},list_directory:{path:{type:'string',const:work}},get_file_info:{path:{type:'string',enum:[file,reportFile]}}}},
 {id:'oss_git',companyId:A,command:python,args:['-m','mcp_server_git','--repository',work],package:'mcp-server-git',version:'2026.10.19',repository:'https://github.com/modelcontextprotocol/servers/tree/main/src/git',tools:pins.git,
 parameterConstraints:Object.fromEntries(pins.git.map((t:any)=>[t.name,{repo_path:{type:'string',const:work}}]))},
 {id:'oss_web',companyId:A,command:python,args:['-m','mcp_server_fetch'],package:'mcp-server-fetch',version:'2026.10.19',repository:'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',tools:pins.fetch,
 parameterConstraints:{fetch:{url:{type:'string',enum:['https://example.com/']},max_length:{type:'integer',minimum:1,maximum:2000}}}}
];
const env:Record<string,string>={PATH:process.env.PATH!,PYTHONUNBUFFERED:'1'};
for(const key of ['HTTPS_PROXY','HTTP_PROXY','ALL_PROXY','NO_PROXY','SSL_CERT_FILE','REQUESTS_CA_BUNDLE'])if(process.env[key])env[key]=process.env[key]!;
const expansion=await buildOssStdioReadBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},profiles,env);
const validated=validateProductionBundle(expansion.bundle),db=new PGlite();const original=pool.connect;
const checks:Array<Record<string,unknown>>=[];
try{
 await db.exec(`CREATE TABLE goals(id UUID,company_scope UUID,state TEXT,current_plan_id UUID);
 CREATE TABLE work_queue(id UUID,goal_id UUID,plan_id UUID,capability_id TEXT,params JSONB,fencing_token BIGINT,status TEXT,lease_expiry TIMESTAMPTZ);`);
 await db.query("INSERT INTO goals VALUES($1,$2,'EXECUTING',$3)",[G,A,P]);
 (pool as any).connect=async()=>({query:(sql:string,args?:any[])=>db.query(sql,args),release(){}});
 const executors=createToolExecutors({catalog:validated.catalog,tools:validated.tools});
 const reads=[{capabilityId:'research_mcp_oss_files_read_text_file',params:{path:file}},{capabilityId:'research_mcp_oss_git_git_status',params:{repo_path:work}},{capabilityId:'research_mcp_oss_web_fetch',params:{url:'https://example.com/',max_length:1500}}];
 // Existing SAM planner receives actual server schemas. This model double chooses
 // from them; live LLM autonomous tool choice is a separate acceptance gate.
 const available=companyCapabilities(validated.catalog.planningDescriptors(),A)!;
 await proposePlan({gateway:{invoke:async()=>({result:{output:{steps:reads}}})} as any,goalId:G,objective:'read-only compare a local file, repository status and public web page',context:{},dataClassification:'INTERNAL',maxCostUsd:.1,availableCapabilities:available});
 assert.equal(companyCapabilities(validated.catalog.planningDescriptors(),B)!.length,0);
 for(const read of reads){
  await db.query('DELETE FROM work_queue');
  await db.query("INSERT INTO work_queue VALUES($1,$2,$3,$4,$5,1,'LEASED',now()+interval '5 minutes')",[Q,G,P,read.capabilityId,read.params]);
  const workItem={queueId:Q,goalId:G,planId:P,capabilityId:read.capabilityId,params:read.params,fencingToken:1};
  try{
   const output=await executors[read.capabilityId](workItem);
   const verified=await validated.verifiers.get(read.capabilityId)!.verify({execution:{id:'isolated-exec',legalEntityId:A,capabilityId:read.capabilityId,params:read.params,result:output.result,evidence:output.evidence,operationKeyRef:null},contract:{id:'isolated-readback',method:'api_readback',requiredEvidenceFields:{},independentQueryTemplate:{}}});
   checks.push({capability:read.capabilityId,state:'READ_EXECUTED',verification:verified.result,resultPreview:JSON.stringify(output.result).slice(0,350)});
   if(read.capabilityId.includes('read_text_file'))assert.match(JSON.stringify(output.result),/SAM isolated source/);
   if(read.capabilityId.includes('git_status'))assert.match(JSON.stringify(output.result),/source.txt/);
  }catch(error){checks.push({capability:read.capabilityId,state:'BLOCKED',error:String(error).slice(0,250)})}
 }
 const fs=expansion.bundle.toolAdapters.find(a=>a.capabilityId.endsWith('_read_text_file'))!;
 await assert.rejects(fs.execute({capabilityId:fs.capabilityId,legalEntityId:B,params:{path:file},idempotencyKey:'denied'}),/COMPANY_DENIED/);
 await assert.rejects(fs.execute({capabilityId:fs.capabilityId,legalEntityId:A,params:{path:'/etc/passwd'},idempotencyKey:'denied'}),/INVALID|enum|equal to one of/);
 checks.push({check:'cross_company_and_outside_path',state:'DENIED_BEFORE_PROVIDER'});
 // An explicit lab-only owner action to a disposable path. Not registered in SAM
 // and not evidence of autonomous approval/reconciliation for production writes.
 const writer=new Client({name:'sam-owner-local-action-probe',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:profiles[0].args,env:{PATH:process.env.PATH!},stderr:'pipe'});transport.stderr?.on('data',()=>{});
 try{await writer.connect(transport,{timeout:15000});const sent=await writer.callTool({name:'write_file',arguments:{path:reportFile,content:'SAM local MCP action verified.\n'}});assert.equal(sent.isError??false,false);assert.equal(await readFile(reportFile,'utf8'),'SAM local MCP action verified.\n');
 const out=await fs.execute({capabilityId:fs.capabilityId,legalEntityId:A,params:{path:reportFile},idempotencyKey:'read-action-result'});assert.match(JSON.stringify(out.result),/SAM local MCP action verified/);
 checks.push({check:'filesystem_write_and_sam_readback',state:'LOCAL_OWNER_ACTION_SUCCEEDED',productionWriteRegistered:false});
 }finally{await writer.close()}
 const browser=new Client({name:'sam-browser-probe',version:'1'}),bt=new StdioClientTransport({command:process.execPath,args:[join(nodeRoot,'@playwright/mcp/cli.js'),'--headless','--isolated','--sandbox','--no-webmcp'],env:{PATH:process.env.PATH!},stderr:'pipe'});bt.stderr?.on('data',()=>{});
 try{await browser.connect(bt,{timeout:15000});const listed=await browser.listTools();const navigate=await browser.callTool({name:'browser_navigate',arguments:{url:'about:blank'}},undefined,{timeout:20000});
 checks.push({check:'browser_navigation',discoveredTools:listed.tools.length,state:navigate.isError?'BLOCKED':'NAVIGATED',detail:JSON.stringify(navigate).slice(0,650)});
 }catch(error){checks.push({check:'browser_navigation',state:'BLOCKED',detail:String(error).slice(0,250)})}finally{await browser.close()}
 const outcome=checks.some(check=>check.state==='BLOCKED')?'PARTIAL':'PASSED';
 const result={outcome,capturedAt:new Date().toISOString(),environment:'ISOLATED_LOCAL_STAGING',productionChanged:false,autonomousLiveModel:false,receipts:expansion.receipts,checks};
 await writeFile(process.env.SAM_OSS_LAB_REPORT!,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 if(outcome==='PARTIAL')process.exitCode=2;
}finally{pool.connect=original;await expansion.close();await db.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
