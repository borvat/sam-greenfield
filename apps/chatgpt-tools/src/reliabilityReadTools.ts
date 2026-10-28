import {describeSavedReports} from '../../../packages/shared/src/savedReportSemantics';
import {withTransaction} from '../../../packages/db/src/client';
import {knowledgeEnabled,recallKnowledge} from '../../brain/src/knowledge';
import {saveApprovedOwnerDecision} from '../../brain/src/learning';
import {recallApprovedOwnerDecisions} from '../../brain/src/memory';
import {authorizedCompany} from '../../../packages/shared/src/ownerScope';
import {notificationsEnabled,listOwnerNotifications,acknowledgeOwnerNotification,ownerContinuityActivation,pollScopedOwnerNotifications} from '../../notifications/src/center';
import {buildRevision} from '../../../packages/shared/src/buildRevision';
import type {RegisteredChatGPTTool,ChatGPTToolContext} from './types';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const schema=(properties:Record<string,unknown>,required:string[]=[])=>({type:'object',properties,required,additionalProperties:false});
const scope=authorizedCompany;

async function optionalReadAvailability(client:any,table:'knowledge_records'|'owner_notifications'){
 const access=(await client.query(`SELECT relation IS NOT NULL AS present,
  CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
  FROM (SELECT to_regclass($1) AS relation) access`,[table])).rows[0];
 return !access.present?'MISSING_INTEGRATION_TABLE':!access.allowed?'PERMISSION_UNAVAILABLE':'AVAILABLE';
}
const knowledgeVisibility={SOURCE_FACT:{visibility:'CURRENT_ROLE_RLS_VISIBLE_ATTRIBUTED_ROWS'},INFERENCE:{visibility:'NOT_VERIFIED'},OWNER_DECISION:{visibility:'NOT_VERIFIED'}};
function tool(name:string,description:string,inputSchema:Record<string,unknown>,read:(c:any,id:string,args:Record<string,unknown>,context:ChatGPTToolContext)=>Promise<unknown>,risk:'READ'|'GREEN'='READ'):RegisteredChatGPTTool{
 return {definition:{name,description,inputSchema,risk,availability:risk==='READ'?'READ_ONLY':'AVAILABLE'},async handler(args,context){
  if(Object.keys(args).some(k=>!Object.hasOwn((inputSchema as any).properties,k)))return {ok:false,error:'INVALID_READ_ARGUMENTS'};
  try{return {ok:true,data:await withTransaction(async c=>read(c,await scope(c,context),args,context))};}
  catch(error){return {ok:false,unavailable:true,error:error instanceof Error&&error.message==='AUTHORIZED_COMPANY_CONTEXT_REQUIRED'?error.message:'SCOPED_READ_UNAVAILABLE'};}
 }};
}
export function createReliabilityReadTools():RegisteredChatGPTTool[]{return [
 tool('sam_get_report','Retrieve an immutable report and original hash only when visible under the current company and role RLS; historical reports from earlier plans may be invisible. No execution or inference.',schema({report_id:{type:'string',format:'uuid'}},['report_id']),async(c,id,args)=>{
  if(typeof args.report_id!=='string'||!uuid.test(args.report_id))throw Error('INVALID_REPORT_ID');
  const row=(await c.query(`SELECT r.* FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id
   WHERE r.id=$1 AND g.company_scope=$2`,[args.report_id,id])).rows[0];
  const successor=row?.revision===1?(await c.query(`SELECT r.id,r.report_hash,r.decision FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id WHERE r.goal_id=$1 AND r.plan_id=$2 AND g.company_scope=$3 AND r.decision->'supersedesReport'->>'id'=$4`,[row.goal_id,row.plan_id,id,row.id])).rows:[];
  return {report:row??null,interpretation:row?describeSavedReports([row,...successor])[0]:null,visibility:'CURRENT_ROLE_RLS_VISIBLE_REPORTS',nullReason:row?null:'NOT_FOUND_OR_NOT_VISIBLE_UNDER_CURRENT_RLS',executionPerformed:false,semanticValidation:row?(row.decision?.report?.semanticPolicy??'HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED'):null};
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
   WHERE type<>'OWNER_DECISION' AND scope->>'legal_entity_id'=$1 AND status<>'SUPERSEDED' AND position(lower($2) in lower(statement))>0 ORDER BY created_at DESC,id DESC LIMIT 20`,[id,args.query])).rows;
  return {engineering:{availability:'SEPARATE_GIT_SYSTEM'},execution,operational:{availability:'AVAILABLE',records:operational},ownerDecisions:{records:await recallApprovedOwnerDecisions(c,id,args.query),relevance:'EXPLICIT_CONTEXT_TERMS_IN_TASK'},approvalMeaning:'Only APPROVED_RULE or explicit OWNER_DECISION with approval is owner-approved; observations and reinforcement never expand authority.'};
 }),
 tool('sam_list_notifications','Poll internal scoped notifications. UNROUTED is stored internally and does not mean ChatGPT push delivery.',schema({limit:{type:'integer',minimum:1,maximum:200}}),async(c,id,args,context)=>{
  if(!notificationsEnabled()&&!await ownerContinuityActivation(c,id))return {availability:'FEATURE_DISABLED',delivery:'POLLING_ONLY',pushPerformed:false};
  const limit=args.limit??50;if(!Number.isInteger(limit)||Number(limit)<1||Number(limit)>200)throw Error('INVALID_LIMIT');
  const availability=await optionalReadAvailability(c,'owner_notifications');
  if(availability!=='AVAILABLE')return {availability,delivery:'POLLING_ONLY',pushPerformed:false};
  return listOwnerNotifications(c,{...context,legalEntityId:id},Number(limit));
 }),
 tool('sam_notification_status','Read whether scoped internal owner notifications are enabled; polling is internal and never claims external delivery.',schema({}),async(c,id)=>({enabled:Boolean(await ownerContinuityActivation(c,id)),mode:'SCOPED_STATE_EVENTS_SINCE_EXPLICIT_ENABLEMENT',delivery:'POLLING_ONLY',pushPerformed:false,...buildRevision()})),
 tool('sam_poll_notifications','Explicitly enable current-company internal notifications from now and poll subsequent goal state events. Stores only internal notifications; never sends or pushes externally.',schema({}),async(c,id,args,context)=>pollScopedOwnerNotifications(c,{...context,legalEntityId:id}),'GREEN'),
 tool('sam_save_owner_decision','Save one explicitly approved owner decision with its company, source, date and relevant task context. Internal memory only; never expands execution authority.',schema({statement:{type:'string',minLength:1,maxLength:4000},context_key:{type:'string',minLength:3,maxLength:80},source:{type:'string',minLength:1,maxLength:500},source_timestamp:{type:'string',format:'date-time'},idempotency_key:{type:'string',minLength:1,maxLength:200},approved:{type:'boolean',const:true}},['statement','context_key','source','source_timestamp','idempotency_key','approved']),async(c,id,args,context)=>saveApprovedOwnerDecision(c,{...context,legalEntityId:id},{statement:args.statement as string,contextKey:args.context_key as string,source:args.source as string,sourceTimestamp:args.source_timestamp as string,idempotencyKey:args.idempotency_key as string,approved:args.approved as boolean}),'GREEN'),
 tool('sam_acknowledge_notification','Record a durable internal read receipt for the authenticated owner and current company. Does not send, push or confirm external delivery.',schema({notification_id:{type:'string',format:'uuid'}},['notification_id']),async(c,id,args,context)=>{
  if(!notificationsEnabled()&&!await ownerContinuityActivation(c,id))return {availability:'FEATURE_DISABLED',delivery:'POLLING_ONLY',pushPerformed:false};
  return acknowledgeOwnerNotification(c,{...context,legalEntityId:id},args.notification_id as string);
 },'GREEN')
];}
