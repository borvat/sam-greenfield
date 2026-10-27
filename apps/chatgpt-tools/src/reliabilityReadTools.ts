import {withTransaction} from '../../../packages/db/src/client';
import {knowledgeEnabled,recallKnowledge} from '../../brain/src/knowledge';
import {notificationsEnabled} from '../../notifications/src/center';
import {buildRevision} from '../../../packages/shared/src/buildRevision';
import type {RegisteredChatGPTTool,ChatGPTToolContext} from './types';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const schema=(properties:Record<string,unknown>,required:string[]=[])=>({type:'object',properties,required,additionalProperties:false});
async function scope(client:any,context:ChatGPTToolContext){
 if(!context.systemOwner)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 const principal=(await client.query('SELECT current_org_id() AS org,current_legal_entity_id() AS entity')).rows[0];
 const requested=context.legalEntityId??process.env.SAM_DEFAULT_LEGAL_ENTITY_ID??process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID??principal?.entity;
 if(!uuid.test(principal?.org??'')||!uuid.test(principal?.entity??'')||requested!==principal.entity)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 if(!(await client.query('SELECT id FROM legal_entities WHERE id=$1 AND org_id=$2',[principal.entity,principal.org])).rowCount)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 return principal.entity as string;
}

async function optionalReadAvailability(client:any,table:'knowledge_records'|'owner_notifications'){
 const access=(await client.query(`SELECT relation IS NOT NULL AS present,
  CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
  FROM (SELECT to_regclass($1) AS relation) access`,[table])).rows[0];
 return !access.present?'MISSING_INTEGRATION_TABLE':!access.allowed?'PERMISSION_UNAVAILABLE':'AVAILABLE';
}
const knowledgeVisibility={SOURCE_FACT:{visibility:'CURRENT_ROLE_RLS_VISIBLE_ATTRIBUTED_ROWS'},INFERENCE:{visibility:'NOT_VERIFIED'},OWNER_DECISION:{visibility:'NOT_VERIFIED'}};
function tool(name:string,description:string,inputSchema:Record<string,unknown>,read:(c:any,id:string,args:Record<string,unknown>)=>Promise<unknown>):RegisteredChatGPTTool{
 return {definition:{name,description,inputSchema,risk:'READ',availability:'READ_ONLY'},async handler(args,context){
  if(Object.keys(args).some(k=>!Object.hasOwn((inputSchema as any).properties,k)))return {ok:false,error:'INVALID_READ_ARGUMENTS'};
  try{return {ok:true,data:await withTransaction(async c=>read(c,await scope(c,context),args))};}
  catch(error){return {ok:false,unavailable:true,error:error instanceof Error&&error.message==='AUTHORIZED_COMPANY_CONTEXT_REQUIRED'?error.message:'SCOPED_READ_UNAVAILABLE'};}
 }};
}
export function createReliabilityReadTools():RegisteredChatGPTTool[]{return [
 tool('sam_get_report','Retrieve an immutable report and original hash only when visible under the current company and role RLS; historical reports from earlier plans may be invisible. No execution or inference.',schema({report_id:{type:'string',format:'uuid'}},['report_id']),async(c,id,args)=>{
  if(typeof args.report_id!=='string'||!uuid.test(args.report_id))throw Error('INVALID_REPORT_ID');
  const row=(await c.query(`SELECT r.* FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id
   WHERE r.id=$1 AND g.company_scope=$2`,[args.report_id,id])).rows[0];
  return {report:row??null,visibility:'CURRENT_ROLE_RLS_VISIBLE_REPORTS',nullReason:row?null:'NOT_FOUND_OR_NOT_VISIBLE_UNDER_CURRENT_RLS',executionPerformed:false,semanticValidation:row?(row.decision?.report?.semanticPolicy??'HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED'):null};
 }),
 tool('sam_memory_status','Inspect scoped execution and operational memory availability; engineering memory is maintained separately.',schema({}),async(c,id)=>{
  const operational=(await c.query(`SELECT COUNT(*)::int AS count FROM memory_records WHERE scope->>'legal_entity_id'=$1`,[id])).rows[0];
  let execution:any={enabled:knowledgeEnabled(),availability:knowledgeEnabled()?'RLS_VISIBLE_ATTRIBUTED_ROWS':'FEATURE_DISABLED'};
  if(knowledgeEnabled()){
   const availability=await optionalReadAvailability(c,'knowledge_records');
   execution=availability==='AVAILABLE'?{...execution,countMeaning:'RLS_VISIBLE_ATTRIBUTED_ROWS_ONLY',categories:knowledgeVisibility,...(await c.query("SELECT COUNT(*)::int AS count FROM knowledge_records WHERE legal_entity_id=$1 AND kind='SOURCE_FACT'",[id])).rows[0]}:{enabled:true,availability};
  }
  return {engineering:{availability:'SEPARATE_GIT_SYSTEM'},execution,operational:{availability:'AVAILABLE',...operational},...buildRevision()};
 }),
 tool('sam_recall_memory','Recall attributed execution knowledge and operational memories in the authorized company, preserving approval distinctions.',schema({query:{type:'string',minLength:1,maxLength:4000}},['query']),async(c,id,args)=>{
  if(typeof args.query!=='string'||!args.query.trim()||args.query.length>4000)throw Error('INVALID_MEMORY_QUERY');
  let execution:any={availability:'FEATURE_DISABLED'};
  if(knowledgeEnabled()){
   const availability=await optionalReadAvailability(c,'knowledge_records');
   execution=availability==='AVAILABLE'?{availability:'RLS_VISIBLE_ROWS',categories:knowledgeVisibility,records:await recallKnowledge(c,id,args.query)}:{availability};
  }
  const operational=(await c.query(`SELECT id,type,statement,scope,status,source,confidence,support_count,created_at,last_confirmed_at FROM memory_records
   WHERE scope->>'legal_entity_id'=$1 AND status<>'SUPERSEDED' AND position(lower($2) in lower(statement))>0 ORDER BY created_at DESC,id DESC LIMIT 20`,[id,args.query])).rows;
  return {engineering:{availability:'SEPARATE_GIT_SYSTEM'},execution,operational:{availability:'AVAILABLE',records:operational},approvalMeaning:'Only APPROVED_RULE or explicit OWNER_DECISION with approval is owner-approved; observations and reinforcement never expand authority.'};
 }),
 tool('sam_list_notifications','Poll internal scoped notifications. UNROUTED is stored internally and does not mean ChatGPT push delivery.',schema({limit:{type:'integer',minimum:1,maximum:200}}),async(c,id,args)=>{
  if(!notificationsEnabled())return {availability:'FEATURE_DISABLED',delivery:'POLLING_ONLY',pushPerformed:false};
  const limit=args.limit??50;if(!Number.isInteger(limit)||Number(limit)<1||Number(limit)>200)throw Error('INVALID_LIMIT');
  const availability=await optionalReadAvailability(c,'owner_notifications');
  if(availability!=='AVAILABLE')return {availability,delivery:'POLLING_ONLY',pushPerformed:false};
  return {availability:'AVAILABLE',delivery:'POLLING_ONLY',unroutedMeaning:'Stored internally; not sent to ChatGPT or owner',pushPerformed:false,records:(await c.query('SELECT * FROM owner_notifications WHERE legal_entity_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2',[id,limit])).rows};
 })
];}
