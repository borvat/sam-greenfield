import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {resolve,relative,isAbsolute} from 'node:path';
import {withTransaction} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {validateToolParameters} from '../../../packages/tool-gateway/src/validation';
import type {ProductionBundle} from './types';

/** An opt-in local file action. No email, purchase, price, stock or cloud action. */
export async function withOssFileAction(base:ProductionBundle,config:{
 companyId:string;root:string;target:string;serverEntry:string;
 reviewedWriteSchema:Record<string,unknown>;reviewedReadSchema:Record<string,unknown>;
}){
 const root=resolve(config.root),target=resolve(config.target),rel=relative(root,target);
 if(!rel||rel.startsWith('..')||isAbsolute(rel))throw new Error('OSS_ACTION_TARGET_DENIED');
 const capabilityId='oss_files_write_report';
 if(base.capabilities.some(c=>c.capabilityId===capabilityId))throw new Error('OSS_ACTION_ALREADY_REGISTERED');
 const client=new Client({name:'sam-guarded-file-action',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:[config.serverEntry,root],env:{PATH:process.env.PATH??''},stderr:'pipe'});transport.stderr?.on('data',()=>{});
 try{await client.connect(transport,{timeout:15000});
 const list=await client.listTools();
 for(const [name,pin] of [['write_file',config.reviewedWriteSchema],['read_text_file',config.reviewedReadSchema]] as const){
  if(sha256Hex(list.tools.find(t=>t.name===name)?.inputSchema??{})!==sha256Hex(pin))throw new Error('OSS_ACTION_SCHEMA_DRIFT');
 }
 const inputSchema={type:'object',properties:{path:{type:'string',const:target},content:{type:'string',maxLength:4000}},required:['path','content'],additionalProperties:false};
 const definition={capabilityId,authorityClass:'YELLOW' as const,sideEffect:true,companyScopes:[config.companyId],description:'Write a reviewed local report to one explicitly bound file; exact owner approval required',inputSchema};
 const readActual=async()=>{
  const response:any=await client.callTool({name:'read_text_file',arguments:{path:target}},undefined,{timeout:15000});
  if(response.isError)throw new Error('OSS_ACTION_READBACK_UNAVAILABLE');
  const content=response.structuredContent?.content??response.content?.find((x:any)=>x.type==='text')?.text;
  if(typeof content!=='string'||content.length>4000)throw new Error('OSS_ACTION_READBACK_INVALID');
  return {content,hash:sha256Hex({path:target,content})};
 };
 const adapter={capabilityId,async execute(request:any){
  if(process.env.SAM_PERCEPTION_ACTION_ENABLED!=='true'||request.legalEntityId!==config.companyId)throw new Error('OSS_ACTION_DISABLED_OR_WRONG_COMPANY');
  validateToolParameters(capabilityId,request.params,inputSchema);
  const response:any=await client.callTool({name:'write_file',arguments:request.params},undefined,{timeout:15000});
  if(response.isError)throw new Error('OSS_ACTION_OUTCOME_UNCONFIRMED');
  const requestHash=sha256Hex(request.params);
  return {providerReference:'oss-report:'+requestHash,result:{written:true,path:target},evidence:{companyId:config.companyId,requestHash,side_effect:true}};
 },async reconcile(input:any){
  // Read expected request hash from SAM's existing durable operation ledger,
  // so reconciliation after an ambiguous call does not rely on process memory.
  const op=await withTransaction(async c=>(await c.query('SELECT request_hash FROM side_effect_operations WHERE operation_key=$1 AND capability_id=$2 AND legal_entity_id=$3',[input.idempotencyKey,capabilityId,config.companyId])).rows[0]);
  if(!op)return {result:'NOT_FOUND' as const,evidence:{reason:'operation_not_found_in_scope'}};
  try{const fresh=await readActual();return {result:fresh.hash===op.request_hash?'CONFIRMED' as const:'FAILED' as const,evidence:{method:'fresh_mcp_file_readback',freshHash:fresh.hash,expectedHash:op.request_hash}}}
  catch{return {result:'NOT_FOUND' as const,evidence:{reason:'fresh_readback_unavailable'}}}
 }};
 const verifier={capabilityId,async verify(input:any){
  if(input.execution.legalEntityId!==config.companyId)return {result:'INCONCLUSIVE' as const,evidence:{reason:'company_mismatch'},verifier:'oss-report-readback'};
  const fresh=await readActual();const expectedHash=sha256Hex(input.execution.params);
  return {result:fresh.hash===expectedHash?'VERIFIED' as const:'INCONCLUSIVE' as const,evidence:{method:'fresh_mcp_file_readback',freshHash:fresh.hash,expectedHash},verifier:'oss-report-readback'};
 }};
 return {...base,capabilities:[...base.capabilities,{...definition,parameters:inputSchema,specialistAgentId:'documents',specialistVersion:'1.0.0'}],toolDefinitions:[...base.toolDefinitions,definition],toolAdapters:[...base.toolAdapters,adapter],verificationAdapters:[...(base.verificationAdapters??[]),verifier],closeIntegrations:async()=>{await client.close();await base.closeIntegrations?.()}} as ProductionBundle;
 }catch(error){await client.close();throw error}
}
