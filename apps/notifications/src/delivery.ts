import {pool} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {authorizedCompany,uuidPattern} from '../../../packages/shared/src/ownerScope';
import {transaction} from './center';
import type {ReconciliableToolAdapter} from '../../../packages/tool-gateway/src/types';

/** Trusted server configuration only. No HTTP/tool arguments or environment recipient. */
export interface OwnerReportEmailBinding {
 legalEntityId:string;
 recipient:'ceo@suroohholdings.com';
 activatedAt:string;
 activationAuditId:string;
 dataClassification:'PUBLIC'|'INTERNAL'|'CONFIDENTIAL';
}
const OWNER='ceo@suroohholdings.com',MAX_ATTEMPTS=3;
export function ownerReportEmailParams(row:any,recipient:string){
 return {to:[recipient],subject:'SAM completed report '+row.id,
  text:JSON.stringify({schema:'sam.owner_report_email.v1',notificationId:row.id,goalId:row.goal_id,
   reportId:row.report_id,reportHash:row.report_hash,summary:String(row.decision.summary??'').slice(0,1800),
   deliveryMeaning:'Provider acceptance or sent-mail confirmation does not prove inbox delivery or reading.'})};
}

/** One durable notification per ordinary tick; never automatically resend after an ambiguous send. */
export async function runOwnerReportEmailTick(binding?:OwnerReportEmailBinding,adapter?:ReconciliableToolAdapter,db:any=pool):Promise<{enabled:boolean;processed?:boolean;reason?:string;outcome?:string;inboxDeliveryProven?:false}>{
 if(process.env.SAM_OWNER_REPORT_EMAIL_ENABLED!=='true')return {enabled:false,reason:'DISABLED'};
 if(!binding||!adapter||adapter.capabilityId!=='gmail_send')return {enabled:false,reason:'TRANSPORT_OR_BINDING_UNAVAILABLE'};
 // Snapshot server config so an in-flight operation cannot acquire a different audience.
 const config={...binding};
 if(config.recipient!==OWNER||!uuidPattern.test(config.legalEntityId)||!uuidPattern.test(config.activationAuditId)||
  !Number.isFinite(Date.parse(config.activatedAt))||!['PUBLIC','INTERNAL','CONFIDENTIAL'].includes(config.dataClassification))return {enabled:false,reason:'INVALID_BINDING'};
 try{
  const scoped=async<T>(fn:(c:any)=>Promise<T>)=>transaction(db,async c=>{
   await authorizedCompany(c,{actor:'runtime-owner-report-email',systemOwner:true,legalEntityId:config.legalEntityId});
   const activation=await c.query(`SELECT id FROM audit_log WHERE id=$1 AND action='OWNER_REPORT_EMAIL_ENABLED'
    AND entity_type='legal_entity' AND entity_id=$2 AND authority_class='YELLOW' AND result='ENABLED'
    AND after_ref->>'schema'='sam.owner_report_email.v1' AND after_ref->>'recipient'=$3
    AND (after_ref->>'activatedAt')::timestamptz=$4::timestamptz AND timestamp >= $4::timestamptz
    AND after_ref->>'dataClassification'=$5`,[config.activationAuditId,config.legalEntityId,config.recipient,config.activatedAt,config.dataClassification]);
   if(!activation.rowCount)throw Error('BINDING_NOT_APPROVED');
   return fn(c);
  });
  const claimed=await scoped(async c=>{
   const row=(await c.query(`SELECT n.*,r.id AS report_id,r.report_hash,r.decision
    FROM owner_notifications n JOIN goals g ON g.id=n.goal_id AND g.company_scope=n.legal_entity_id
    JOIN goal_read_reviews r ON r.id::text=n.body->'report'->>'id' AND r.goal_id=g.id
      AND r.report_hash=n.body->'report'->>'hash' AND r.decision->>'status'='complete'
    WHERE n.legal_entity_id=$1 AND n.kind='COMPLETED' AND n.created_at >= $2::timestamptz
      AND r.created_at >= $2::timestamptz
      AND ((n.status='UNROUTED' AND n.attempt=0 AND n.channel IS NULL AND n.recipient_ref IS NULL)
       OR (n.channel='gmail' AND n.recipient_ref=$3 AND
        ((n.status='RETRY' AND n.next_attempt_at<=now() AND n.attempt<$4) OR
         (n.status='SENDING' AND n.lease_until<=now()))))
    ORDER BY n.created_at,n.id LIMIT 1 FOR UPDATE OF n SKIP LOCKED`,[config.legalEntityId,config.activatedAt,config.recipient,MAX_ATTEMPTS])).rows[0];
   if(!row)return null;
   const reconcile=row.status==='SENDING',attempt=Number(row.attempt)+(reconcile?0:1),params=ownerReportEmailParams(row,config.recipient);
   const updated=await c.query(`UPDATE owner_notifications SET status='SENDING',channel='gmail',recipient_ref=$2,
    attempt=$3,lease_until=date_trunc('milliseconds',clock_timestamp())+interval '60 seconds',updated_at=now() WHERE id=$1 AND legal_entity_id=$4 RETURNING lease_until`,[row.id,config.recipient,attempt,config.legalEntityId]);
   if(!reconcile)await c.query(`INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome)
    SELECT id,$2,'SENDING' FROM owner_notifications WHERE id=$1 AND legal_entity_id=$3`,[row.id,attempt,config.legalEntityId]);
   return {...row,attempt,params,reconcile,lease:updated.rows[0].lease_until,key:'owner-report-email:'+row.id};
  });
  if(!claimed)return {enabled:true,processed:false};
  const finish=async(outcome:string,receipt:string|null,error:string|null)=>scoped(async c=>{
   const changed=await c.query(`UPDATE owner_notifications SET status=$5,receipt_id=$6,last_error_code=$7,
    lease_until=NULL,updated_at=now(),next_attempt_at=now()+interval '60 seconds',
    accepted_at=CASE WHEN $5='ACCEPTED' THEN now() ELSE accepted_at END,
    confirmed_at=CASE WHEN $5='CONFIRMED' THEN now() ELSE confirmed_at END
    WHERE id=$1 AND legal_entity_id=$2 AND attempt=$3 AND lease_until=$4 AND status='SENDING' RETURNING id`,
    [claimed.id,config.legalEntityId,claimed.attempt,claimed.lease,outcome,receipt,error]);
   if(changed.rowCount)await c.query(`UPDATE notification_delivery_attempts a SET outcome=$4,receipt_id=$5,error_code=$6,finished_at=now()
    FROM owner_notifications n WHERE a.notification_id=n.id AND n.id=$1 AND n.legal_entity_id=$2 AND a.attempt=$3`,
    [claimed.id,config.legalEntityId,claimed.attempt,outcome,receipt,error]);
   return {enabled:true,processed:true,outcome:changed.rowCount?outcome:'FENCE_LOST',inboxDeliveryProven:false as const};
  });
  const reconcile=async()=>{
   try{
    const found=await adapter.reconcile({capabilityId:'gmail_send',providerReference:claimed.receipt_id,idempotencyKey:claimed.key});
    const receipt=typeof found.evidence.provider_message_id==='string'?found.evidence.provider_message_id:null;
    return await finish(found.result==='CONFIRMED'?'CONFIRMED':'UNKNOWN',receipt,'SENT_MAIL_ONLY_NO_INBOX_PROOF');
   }catch{return await finish('UNKNOWN',null,'RECONCILIATION_INCONCLUSIVE')}
  };
  if(claimed.reconcile)return await reconcile();
  // Dedicated owner standing consent authorizes only this derived report message, never a business tool call.
  try{
   await scoped(async c=>{
    const live=await c.query(`SELECT id FROM owner_notifications WHERE id=$1 AND legal_entity_id=$2 AND attempt=$3
      AND status='SENDING' AND lease_until=$4 AND lease_until>clock_timestamp() FOR UPDATE`,[claimed.id,config.legalEntityId,claimed.attempt,claimed.lease]);
    if(!live.rowCount)throw Error('LEASE_LOST');
    await c.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
     VALUES('runtime-owner-report-email','OWNER_REPORT_EMAIL_ADMITTED','legal_entity',$1,$2::jsonb,
      'owner_report_standing_consent','YELLOW','ADMITTED')`,[config.legalEntityId,JSON.stringify({
       schema:'sam.owner_report_email_admission.v1',activationAuditId:config.activationAuditId,
       notificationId:claimed.id,goalId:claimed.goal_id,reportId:claimed.report_id,reportHash:claimed.report_hash,
       attempt:claimed.attempt,idempotencyKey:claimed.key,params:claimed.params,paramsHash:sha256Hex(claimed.params),
       dataClassification:config.dataClassification})]);
   });
  }catch{return await finish(claimed.attempt<MAX_ATTEMPTS?'RETRY':'FAILED',null,'PRE_SEND_ADMISSION_DENIED')}
  try{
   const sent=await adapter.execute({capabilityId:'gmail_send',params:claimed.params,idempotencyKey:claimed.key});
   if(!sent.providerReference)return await finish('UNKNOWN',null,'PROVIDER_RECEIPT_MISSING');
   return await finish('ACCEPTED',sent.providerReference,null);
  }catch{return await reconcile()}
 }catch{return {enabled:false,reason:'DELIVERY_UNAVAILABLE'}}
}
