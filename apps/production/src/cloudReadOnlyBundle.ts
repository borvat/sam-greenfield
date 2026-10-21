import {buildScopedMcpExpansion,connectScopedMcp,parseScopedMcpManifest,type ExpansionFactory} from './scopedMcpBundle';
import {validateToolParameters} from '../../../packages/tool-gateway/src/validation';
import type {ProductionBundle} from './types';

export interface CloudReadScope {
 companyId:string;
 repository:{owner:string;name:string};
 workspaceId:string;
 serviceIds:string[];
}
const origins=['https://api.githubcopilot.com','https://mcp.render.com'];
const gh=new Set(['get_file_contents','list_commits','get_commit','list_branches','list_pull_requests','pull_request_read','actions_list','actions_get']);
const render=new Set(['get_service','list_deploys','get_deploy','get_metrics']);
const denied=()=>{throw new Error('CLOUD_READ_SCOPE_INVALID')};

/** Trusted deployment policy, never produced by a model or a provider response. */
export function cloudReadPolicy(raw:string,scope:CloudReadScope){
 if(!scope||!scope.repository||typeof scope.repository.owner!=='string'||typeof scope.repository.name!=='string'||typeof scope.workspaceId!=='string'||!/^[-\w.]+$/.test(scope.repository.owner)||!/^[-\w.]+$/.test(scope.repository.name)||
  !/^tea-[a-z0-9]+$/.test(scope.workspaceId)||!Array.isArray(scope.serviceIds)||scope.serviceIds.length<1||scope.serviceIds.length>4||
  scope.serviceIds.some(s=>!/^srv-[a-z0-9]+$/.test(s)))denied();
 const manifest=parseScopedMcpManifest(raw,origins);
 const schemas=new Map<string,Record<string,any>>();
 if(!manifest.servers.some(s=>s.domain==='github')||!manifest.servers.some(s=>s.domain==='render'))denied();
 for(const server of manifest.servers){
  if(server.companyId!==scope.companyId||!server.credentialEnv)denied();
  if(server.domain==='github'){
   if(server.credentialEnv!=='SAM_MCP_SECRET_GITHUB')denied();
   if(!/^https:\/\/api\.githubcopilot\.com\/mcp\/(?:x\/(?:repos|actions)\/)?readonly$/.test(server.endpoint))denied();
  }else if(server.domain==='render'){
   if(server.credentialEnv!=='SAM_MCP_SECRET_RENDER')denied();
   if(server.endpoint!=='https://mcp.render.com/mcp')denied();
  }else denied();
  for(const tool of server.tools){
   if(!(server.domain==='github'?gh:render).has(tool.name))throw new Error('CLOUD_TOOL_NOT_APPROVED_READ');
   const schema:any=structuredClone(tool.inputSchema),properties=schema.properties??{};
   const bind=(key:string,constraint:any)=>{
    if(!properties[key])throw new Error('CLOUD_SCOPE_SCHEMA_UNSUPPORTED');
    properties[key]={allOf:[properties[key],constraint]};
    schema.required=[...new Set([...(schema.required??[]),key])];
   };
   if(server.domain==='github'){
    bind('owner',{const:scope.repository.owner});bind('repo',{const:scope.repository.name});
    if(tool.name==='pull_request_read')bind('method',{enum:['get','get_status','get_files','get_diff']});
   }else{
    // Request-scoped workspace required. No implicit selection, switching or writes.
    bind('workspaceId',{const:scope.workspaceId});
    bind(tool.name==='get_metrics'?'resourceId':'serviceId',{enum:scope.serviceIds});
   }
   schema.properties=properties;
   schemas.set(server.serverId+':'+tool.name,schema);
  }
 }
 return {manifest,schemas};
}

export async function buildCloudReadOnlyBundle(base:ProductionBundle,raw:string,scope:CloudReadScope,env:NodeJS.ProcessEnv,
 connect:ExpansionFactory=connectScopedMcp){
 const policy=cloudReadPolicy(raw,scope);
 const guarded:ExpansionFactory=async(server,token)=>{
  const connection=await connect(server,token);
  return {close:connection.close,client:{listTools:(args?:any)=>connection.client.listTools(args),callTool:(args:any,...rest:any[])=>{
   const schema=policy.schemas.get(server.serverId+':'+args.name);
   if(!schema)throw new Error('CLOUD_TOOL_NOT_APPROVED_READ');
   validateToolParameters(args.name,args.arguments,schema);
   return connection.client.callTool(args,...rest);
  }}};
 };
 const result=await buildScopedMcpExpansion(base,JSON.stringify(policy.manifest),{allowedOrigins:origins,env,connect:guarded});
 // Discovery still compares the *original* schema pin. Only the planner/runtime
 // receives the stricter company/repository/service/workspace schema.
 result.bundle.toolDefinitions=result.bundle.toolDefinitions.map(def=>{
  const server=policy.manifest.servers.find(s=>s.tools.some(t=>'research_mcp_'+s.serverId+'_'+t.name===def.capabilityId));
  if(!server)return def;
  const tool=server.tools.find(t=>'research_mcp_'+server.serverId+'_'+t.name===def.capabilityId)!;
  return {...def,inputSchema:policy.schemas.get(server.serverId+':'+tool.name)!};
 });
 return result;
}
