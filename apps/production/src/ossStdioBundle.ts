import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {discoverResearchMcpCapabilities} from '../../tools/src/mcpResearchAdapter';
import {validateToolParameters} from '../../../packages/tool-gateway/src/validation';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {ProductionBundle,VerificationAdapter} from './types';

/** Trusted local staging configuration only. Never exposed as a model tool. */
export interface OssStdioProfile {
 id:string; companyId:string; command:string; args:string[];
 package:string; version:string; repository:string;
 /** Exact schemas captured and reviewed from this pinned upstream version. */
 tools:Array<{name:string;description:string;inputSchema:Record<string,any>}>;
 /** Narrower than upstream schemas: trusted scope constraints, e.g. path enum. */
 parameterConstraints?:Record<string,Record<string,any>>;
}

export async function buildOssStdioReadBundle(base:ProductionBundle,profiles:OssStdioProfile[],env:Record<string,string>={PATH:process.env.PATH??''}){
 const clients:Client[]=[];const receipts:Array<Record<string,unknown>>=[];
 const close=async()=>{await Promise.allSettled(clients.map(c=>c.close()))};
 const bundle:ProductionBundle={...base,capabilities:[...base.capabilities],toolDefinitions:[...base.toolDefinitions],toolAdapters:[...base.toolAdapters],verificationAdapters:[...(base.verificationAdapters??[])]};
 const ids=new Set(base.capabilities.map(c=>c.capabilityId));
 try{
 for(const profile of profiles){
  if(!/^[a-z][a-z0-9_]{1,39}$/.test(profile.id)||!profile.companyId||!profile.command.startsWith('/')||!profile.tools.length)throw new Error('OSS_TRUSTED_PROFILE_INVALID');
  if(profile.tools.some(t=>!/^(read_text_file|list_directory|get_file_info|git_status|git_log|git_diff_unstaged|fetch|search|fetch_content)$/.test(t.name)))throw new Error('OSS_TOOL_NOT_REVIEWED_AS_READ');
  const client=new Client({name:'sam-oss-staging',version:'1.0.0'});clients.push(client);
  const transport=new StdioClientTransport({command:profile.command,args:profile.args,env,stderr:'pipe'});
  // Child logs are intentionally not copied into reports; they may contain source data.
  transport.stderr?.on('data',()=>{});
  await client.connect(transport,{timeout:15_000});
  const discovered=await client.listTools(undefined,{timeout:15_000});
  if(discovered.nextCursor)throw new Error('OSS_DISCOVERY_REQUIRES_REVIEWED_PAGINATION');
  const trusted=profile.tools.map(pin=>{
   const remote=discovered.tools.find(t=>t.name===pin.name);
   if(!remote||sha256Hex(remote.inputSchema)!==sha256Hex(pin.inputSchema))throw new Error('OSS_PINNED_SCHEMA_DRIFT');
   const schema=structuredClone(pin.inputSchema);
   // These reviewed simple schemas use JSON Schema 2020 metadata only. Do not
   // disable validation wholesale or accept external references to make them pass.
   if(schema.$schema && schema.$schema!=='https://json-schema.org/draft/2020-12/schema')throw new Error('OSS_SCHEMA_DIALECT_UNREVIEWED');
   delete schema.$schema;
   if(JSON.stringify(schema).match(/"(?:\$ref|\$defs|definitions)"/))throw new Error('OSS_SCHEMA_REFERENCE_UNREVIEWED');
   schema.additionalProperties=false;
   schema.properties={...schema.properties,...profile.parameterConstraints?.[pin.name]};
   return {name:pin.name,description:pin.description,inputSchema:schema};
  });
  const readClient={listTools:async()=>({tools:trusted}),callTool:async(args:any)=>{
   const tool=trusted.find(t=>t.name===args.name);
   if(!tool)throw new Error('OSS_UNREVIEWED_TOOL');
   validateToolParameters(args.name,args.arguments,tool.inputSchema);
   try{const result=await client.callTool(args,undefined,{timeout:15_000});
    const body=(result.content??[]).filter((x:any)=>x.type==='text').map((x:any)=>x.text).join('\n');
    if((args.name==='search'||args.name==='fetch_content') && /^(?:Error:|No results were found.*(?:bot detection|blocking))/is.test(body))throw new Error('provider diagnostic');
    if(JSON.stringify(result).length>1_048_576)throw new Error('oversized');
    return result;
   }catch{throw new Error('OSS_PROVIDER_READ_FAILED')}
  }};
  const tools=await discoverResearchMcpCapabilities({serverId:profile.id,client:readClient,allowedReadTools:trusted.map(t=>t.name),sourceUri:`urn:sam:oss:${profile.id}`});
  for(const [i,cap] of tools.capabilities.entries()){
   if(ids.has(cap.capabilityId))throw new Error('OSS_CAPABILITY_COLLISION');ids.add(cap.capabilityId);
   cap.companyScopes=[profile.companyId];cap.description=trusted[i].description;
  }
  bundle.capabilities.push(...tools.capabilities);
  bundle.toolDefinitions.push(...tools.toolDefinitions.map((d,i)=>({...d,companyScopes:[profile.companyId],description:trusted[i].description})));
  bundle.toolAdapters.push(...tools.toolAdapters.map(adapter=>({capabilityId:adapter.capabilityId,async execute(request){
   if(request.legalEntityId!==profile.companyId)throw new Error('OSS_COMPANY_DENIED');
   // Executor validates runtime constraints before dispatch. Keep direct internal
   // adapter callers subject to the same parameter policy as well.
   const definition=tools.toolDefinitions.find(d=>d.capabilityId===adapter.capabilityId)!;
   validateToolParameters(adapter.capabilityId,request.params,definition.inputSchema);
   const outcome=await adapter.execute(request);
   if(JSON.stringify(outcome.result).length>1_048_576)throw new Error('OSS_RESPONSE_TOO_LARGE');
   return {...outcome,evidence:{...outcome.evidence,companyId:profile.companyId,upstreamPackage:profile.package,upstreamVersion:profile.version,responseHash:sha256Hex(outcome.result)}};
  }})));
  bundle.verificationAdapters!.push(...tools.verificationAdapters.map(verifier=>({capabilityId:verifier.capabilityId,async verify(input:any){
   if(input.execution.legalEntityId!==profile.companyId||input.execution.evidence?.companyId!==profile.companyId)return {result:'INCONCLUSIVE',evidence:{reason:'company_mismatch'},verifier:'oss-scoped-readback'};
   try{return await verifier.verify(input)}catch{return {result:'INCONCLUSIVE',evidence:{reason:'source_unavailable'},verifier:'oss-scoped-readback'}}
  }} as VerificationAdapter)));
  receipts.push({id:profile.id,package:profile.package,version:profile.version,repository:profile.repository,upstreamTools:discovered.tools.length,registeredReads:trusted.map(t=>t.name),state:'STDIO_CONNECTED_NOT_PRODUCTION'});
 }
 bundle.closeIntegrations=async()=>{await close();await base.closeIntegrations?.()};
 return {bundle,receipts,close};
 }catch(error){await close();throw error}
}
