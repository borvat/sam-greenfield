import { transaction } from './center';

export interface OwnerNotificationTransport {
 channel:string;
 recipientRef:string;
 send(input:{idempotencyKey:string;title:string;body:unknown}):Promise<{receiptId:string;status:'ACCEPTED'|'CONFIRMED'}>;
}
// Use only when the provider can prove the send did not occur. All ambiguous
// exceptions (including timeouts) require reconciliation, never blind retries.
export class NotificationNotSentError extends Error {
 constructor(public readonly retryable:boolean){super('NOTIFICATION_NOT_SENT')}
}
export async function routeOwnerNotification(c:any,id:string,channel:string,recipientRef:string){
 if(!channel.trim()||!recipientRef.trim())throw new Error('NOTIFICATION_ROUTE_REQUIRED');
 const result=await c.query(`UPDATE owner_notifications SET channel=$2,recipient_ref=$3,status='PENDING',updated_at=now()
   WHERE id=$1 AND status='UNROUTED' RETURNING id`,[id,channel,recipientRef]);
 return result.rowCount===1;
}
export async function deliverNextOwnerNotification(db:any,transport:OwnerNotificationTransport,options:{timeoutMs?:number}={}){
 if(process.env.SAM_NOTIFICATION_DELIVERY_ENABLED!=='true')return {processed:false,disabled:true};
 const timeoutMs=options.timeoutMs??20000;
 if(!Number.isFinite(timeoutMs)||timeoutMs<1||timeoutMs>20000)throw new Error('NOTIFICATION_DEADLINE_INVALID');
 const item=await transaction(db,async c=>{
  // A crash can happen after the provider accepted a send. Do not resend it.
  const expired=await c.query(`UPDATE owner_notifications SET status='UNKNOWN',last_error_code='DELIVERY_LEASE_EXPIRED',
    lease_until=NULL,updated_at=now() WHERE status='SENDING' AND lease_until<now() RETURNING id,attempt`);
  for(const row of expired.rows)await c.query(`UPDATE notification_delivery_attempts SET outcome='UNKNOWN',error_code='DELIVERY_LEASE_EXPIRED',finished_at=now()
    WHERE notification_id=$1 AND attempt=$2 AND outcome='SENDING'`,[row.id,row.attempt]);
  await c.query(`UPDATE owner_notifications n SET status='SUPPRESSED',last_error_code='GOAL_STATE_CHANGED',updated_at=now()
    FROM goals g WHERE n.goal_id=g.id AND n.kind IN ('APPROVAL','PROGRESS') AND n.body->>'state'<>g.state
      AND n.status IN ('UNROUTED','PENDING','RETRY')`);
  const result=await c.query(`SELECT * FROM owner_notifications WHERE channel=$1 AND recipient_ref=$2
    AND status IN ('PENDING','RETRY') AND next_attempt_at<=now() AND attempt<5
    ORDER BY CASE severity WHEN 'URGENT' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,created_at,id
    FOR UPDATE SKIP LOCKED LIMIT 1`,[transport.channel,transport.recipientRef]);
  const row=result.rows[0];if(!row)return null;
  const claimed=(await c.query(`UPDATE owner_notifications SET status='SENDING',attempt=attempt+1,
    lease_until=now()+interval '60 seconds',updated_at=now() WHERE id=$1 RETURNING *`,[row.id])).rows[0];
  await c.query(`INSERT INTO notification_delivery_attempts(notification_id,attempt,outcome) VALUES($1,$2,'SENDING')`,[claimed.id,claimed.attempt]);
  return claimed;
 });
 if(!item)return {processed:false};
 let status:'RETRY'|'FAILED'|'UNKNOWN'|'ACCEPTED'|'CONFIRMED'='UNKNOWN',code:string|null=null,receipt:string|null=null;
 let timer:NodeJS.Timeout|undefined;
 try{
  const result=await Promise.race([transport.send({idempotencyKey:item.id,title:item.title,body:item.body}),
    new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),timeoutMs)})]);
  if(!['ACCEPTED','CONFIRMED'].includes(result?.status)||typeof result?.receiptId!=='string'||!result.receiptId.trim())throw new Error('invalid receipt');
  status=result.status;receipt=result.receiptId;
 }catch(error){
  if(error instanceof NotificationNotSentError){status=error.retryable&&Number(item.attempt)<5?'RETRY':'FAILED';code='PROVIDER_CONFIRMED_NOT_SENT'}
  else{status='UNKNOWN';code='DELIVERY_OUTCOME_UNCERTAIN'}
 }finally{if(timer)clearTimeout(timer)}
 const committed=await transaction(db,async c=>{
  const updated=await c.query(`UPDATE owner_notifications SET status=$3,receipt_id=$4,last_error_code=$5,
    accepted_at=CASE WHEN $3 IN ('ACCEPTED','CONFIRMED') THEN now() ELSE accepted_at END,
    confirmed_at=CASE WHEN $3='CONFIRMED' THEN now() ELSE confirmed_at END,
    next_attempt_at=now()+(LEAST(3600,30*power(2,attempt-1))::int*interval '1 second'),lease_until=NULL,updated_at=now()
    WHERE id=$1 AND attempt=$2 AND status='SENDING' RETURNING id`,[item.id,item.attempt,status,receipt,code]);
  if(!updated.rowCount)return false;
  await c.query(`UPDATE notification_delivery_attempts SET outcome=$3,receipt_id=$4,error_code=$5,finished_at=now()
    WHERE notification_id=$1 AND attempt=$2 AND outcome='SENDING'`,[item.id,item.attempt,status,receipt,code]);
  return true;
 });
 return {processed:true,id:item.id,status:committed?status:'UNKNOWN'};
}
