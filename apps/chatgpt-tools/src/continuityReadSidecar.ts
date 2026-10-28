import {withTransaction} from '../../../packages/db/src/client';
import {authorizedCompany,type OwnerContext} from '../../../packages/shared/src/ownerScope';
import {recallApprovedOwnerDecisions} from '../../brain/src/memory';
import {ownerContinuityActivation} from '../../notifications/src/center';
async function access(client:any,table:string){
 const row=(await client.query(`SELECT relation IS NOT NULL AS present,
  CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
  FROM (SELECT to_regclass($1) AS relation) access`,[table])).rows[0];
 return !row?.present?'MISSING_TABLE':!row.allowed?'PERMISSION_UNAVAILABLE':'AVAILABLE';
}
/** Existing cached tools expose bounded current-role reads; optional failures do
 * not roll back the core read or imply missing rows are authorized/absent. */
export async function readContinuitySidecar(context:OwnerContext,objective='',goalId?:string){
 try{return await withTransaction(async client=>{
  const company=await authorizedCompany(client,context);
  const memoryAccess=await access(client,'memory_records'),notificationAccess=await access(client,'owner_notifications'),auditAccess=await access(client,'audit_log');
  const ownerDecisions=memoryAccess==='AVAILABLE'?{availability:'AVAILABLE',...(await client.query(`SELECT COUNT(*)::int AS approved_count FROM memory_records WHERE type='OWNER_DECISION' AND status='APPROVED_RULE' AND scope->>'legal_entity_id'=$1 AND scope->>'schema'='sam.approved_owner_decision.v1'`,[company])).rows[0],records:objective?await recallApprovedOwnerDecisions(client,company,objective):[],relevance:'EXPLICIT_CONTEXT_TERMS_IN_TASK',executionAuthorityExpanded:false}:{availability:memoryAccess};
  const activation=auditAccess==='AVAILABLE'?await ownerContinuityActivation(client,company):null;
  const notificationSummary=notificationAccess==='AVAILABLE'?(await client.query(`SELECT status,COUNT(*)::int AS count FROM owner_notifications WHERE legal_entity_id=$1 AND ($2::uuid IS NULL OR goal_id=$2) GROUP BY status ORDER BY status`,[company,goalId??null])).rows:[];
  return {availability:'CURRENT_ROLE_SCOPED_READS',ownerDecisions,notifications:{availability:notificationAccess,enabled:activation?true:auditAccess==='AVAILABLE'?false:null,activation:activation??null,counts:notificationSummary,scope:goalId?'REQUESTED_GOAL':'CURRENT_COMPANY',readReceiptAvailability:auditAccess,delivery:'POLLING_ONLY',pushPerformed:false},executionPerformed:false};
 })}catch{return {availability:'SCOPED_CONTINUITY_UNAVAILABLE',executionPerformed:false}}
}

export async function readSavedReports(goalId:string){
 try{return await withTransaction(async client=>{const availability=await access(client,'goal_read_reviews');return {availability,records:availability==='AVAILABLE'?(await client.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1 ORDER BY round',[goalId])).rows:[]};})}
 catch{return {availability:'CURRENT_ROLE_REPORT_READ_UNAVAILABLE',records:[]}}
}
