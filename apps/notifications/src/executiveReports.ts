import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {authorizedCompany,type OwnerContext} from '../../../packages/shared/src/ownerScope';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
export type ReportSchedule={timezone:string;daily_time:string;weekly_time:string;weekly_day:number};
const instantCache=new Map<string,number>();
const dateKey=(d:Date)=>d.toISOString().slice(0,10);
function localParts(at:Date,timezone:string){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at);
 const value=(key:string)=>parts.find(p=>p.type===key)!.value;
 return {date:value('year')+'-'+value('month')+'-'+value('day'),time:value('hour')+':'+value('minute')};
}
function addDays(date:string,days:number){return dateKey(new Date(Date.parse(date+'T12:00:00Z')+days*86400000));}
/** Earliest occurrence on folds; first representable later minute on a clock gap. */
function localInstant(date:string,time:string,timezone:string){
 const key=JSON.stringify([date,time,timezone]),cached=instantCache.get(key);if(cached!==undefined)return new Date(cached);
 const save=(at:Date)=>{if(instantCache.size>=128)instantCache.delete(instantCache.keys().next().value!);instantCache.set(key,at.getTime());return at;};
 const guess=Date.parse(date+'T'+time+':00Z');
 let candidate=guess;
 for(let i=0;i<4;i++){
  const p=localParts(new Date(candidate),timezone);
  const difference=guess-Date.parse(p.date+'T'+p.time+':00Z');
  if(difference===0)break;candidate+=difference;
 }
 let gap:Date|undefined;
 for(let offset=-180;offset<=180;offset++){
  const at=new Date(candidate+offset*60000),p=localParts(at,timezone);
  if(p.date===date&&p.time===time)return save(at);
  if(p.date===date&&p.time>time&&(!gap||at<gap))gap=at;
 }
 if(!gap)throw Error('REPORT_LOCAL_TIME_UNREPRESENTABLE');return save(gap);
}
export function dueReportPeriods(schedule:ReportSchedule,now:Date){
 if(!schedule||typeof schedule.timezone!=='string'||schedule.timezone.length>100||!Number.isFinite(now.getTime())||!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.daily_time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.weekly_time)||!Number.isInteger(schedule.weekly_day)||schedule.weekly_day<0||schedule.weekly_day>6)throw Error('REPORT_SCHEDULE_INVALID');
 let local:ReturnType<typeof localParts>;try{local=localParts(now,schedule.timezone);}catch{throw Error('REPORT_SCHEDULE_INVALID');}
 let dailyDate=local.date;
 // Compare real instants so a restart inside a repeated DST hour keeps today's run.
 if(localInstant(dailyDate,schedule.daily_time,schedule.timezone)>now)dailyDate=addDays(dailyDate,-1);
 let weeklyDate=local.date;
 while(new Date(weeklyDate+'T12:00:00Z').getUTCDay()!==schedule.weekly_day)weeklyDate=addDays(weeklyDate,-1);
 if(localInstant(weeklyDate,schedule.weekly_time,schedule.timezone)>now)weeklyDate=addDays(weeklyDate,-7);
 return [{type:'DAILY',period:dailyDate,plannedAt:localInstant(dailyDate,schedule.daily_time,schedule.timezone)},
  {type:'WEEKLY',period:weeklyDate,plannedAt:localInstant(weeklyDate,schedule.weekly_time,schedule.timezone)}];
}
export async function configureExecutiveReports(c:PoolClient,context:OwnerContext,input:ReportSchedule&{enabled:boolean;approved:boolean;channel?:string;recipientRef?:string}){
 const company=await authorizedCompany(c,context);dueReportPeriods(input,new Date());
 if(input.approved!==true||typeof input.enabled!=='boolean')throw Error('REPORT_OWNER_APPROVAL_REQUIRED');
 // References only; transport credentials are never stored in reports/settings.
 if((input.channel!==undefined&&(typeof input.channel!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(input.channel)))||(input.recipientRef!==undefined&&(typeof input.recipientRef!=='string'||!/^[a-zA-Z0-9:_./-]{1,200}$/.test(input.recipientRef))))throw Error('REPORT_CHANNEL_REFERENCE_INVALID');
 return (await c.query(`INSERT INTO executive_report_settings(legal_entity_id,enabled,timezone,daily_time,weekly_time,weekly_day,channel,recipient_ref,approved_by)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(legal_entity_id) DO UPDATE SET enabled=excluded.enabled,timezone=excluded.timezone,daily_time=excluded.daily_time,
 weekly_time=excluded.weekly_time,weekly_day=excluded.weekly_day,channel=excluded.channel,recipient_ref=excluded.recipient_ref,approved_by=excluded.approved_by,updated_at=now() RETURNING *`,
 [company,input.enabled,input.timezone,input.daily_time,input.weekly_time,input.weekly_day,input.channel??null,input.recipientRef??null,context.actor])).rows[0];
}
export async function generateExecutiveReports(c:PoolClient,context:OwnerContext,now=new Date()){
 const company=await authorizedCompany(c,context);
 const settings=(await c.query("SELECT * FROM executive_report_settings WHERE legal_entity_id=$1 AND enabled=true AND length(trim(approved_by))>0 FOR UPDATE",[company])).rows[0];
 if(!settings)return {generated:0,reason:'DISABLED_OR_UNCONFIGURED'};
 let generated=0;
 for(const due of dueReportPeriods(settings,now)){
  if((await c.query('SELECT id FROM executive_reports WHERE legal_entity_id=$1 AND report_type=$2 AND period_key=$3',[company,due.type,due.period])).rowCount)continue;
  const evidence=(await c.query(`SELECT w.id task_id,w.goal_id,w.capability_id,w.status,w.wake_reason,w.plan_id,e.id execution_id,e.finished_at,v.id verification_id,v.result verification_result,v.checked_at,
    coalesce(v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash AND v.verifier<>e.actor AND e.plan_id=g.current_plan_id,false) independently_verified
   FROM work_queue w JOIN goals g ON g.id=w.goal_id LEFT JOIN LATERAL(SELECT * FROM executions WHERE queue_id=w.id ORDER BY started_at DESC,id DESC LIMIT 1)e ON true
   LEFT JOIN LATERAL(SELECT * FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
   WHERE g.company_scope=$1 ORDER BY w.queued_at DESC,w.id DESC LIMIT 200`,[company])).rows;
  const decisions=(await c.query("SELECT id,state,updated_at FROM goals WHERE company_scope=$1 AND state IN('WAITING_OWNER','FAILED','WAITING_EXTERNAL') ORDER BY priority DESC,updated_at DESC LIMIT 3",[company])).rows;
  const artifact=JSON.parse(JSON.stringify({schema:'sam.executive-report.v1',companyId:company,type:due.type,period:due.period,plannedAt:due.plannedAt.toISOString(),generatedAt:now.toISOString(),timezone:settings.timezone,
   coverage:{tasks:'Latest 200 durable queue records; current-plan matching-hash independent verification, not period totals',sales:'UNKNOWN',cash:'UNKNOWN',shipments:'UNKNOWN',cost:'UNKNOWN'},
   tasks:evidence,errors:evidence.filter(e=>e.status==='FAILED'||e.verification_result==='FAILED'),decisions,
   meeting:due.type==='WEEKLY'?{achievements:evidence.filter(e=>e.independently_verified),failures:evidence.filter(e=>e.verification_result==='FAILED'),actions:decisions.map(d=>({goalId:d.id,owner:'SAM / owner escalation',deadline:'UNKNOWN',cause:'Inspect linked goal timeline'}))}:null,
   missedRunPolicy:'LATEST_DUE_PERIOD_ONLY; older missed periods are not replayed',deliveryMeaning:'Artifact generation is not delivery'}));
  const r=await c.query(`INSERT INTO executive_reports(legal_entity_id,report_type,period_key,timezone,planned_at,generated_at,artifact,artifact_hash,status,channel,recipient_ref,next_attempt_at)
   VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$6) ON CONFLICT(legal_entity_id,report_type,period_key) DO NOTHING RETURNING id`,
   [company,due.type,due.period,settings.timezone,due.plannedAt,now,JSON.stringify(artifact),sha256Hex(artifact),settings.channel&&settings.recipient_ref?'READY':'BLOCKED',settings.channel,settings.recipient_ref]);
  generated+=r.rowCount??0;
 }
 return {generated,missedRunPolicy:'LATEST_DUE_PERIOD_ONLY'};
}
export type ExecutiveDeliveryOutcome={outcome:'CONFIRMED'|'ACCEPTED';receiptId:string}|{outcome:'RETRY';retrySafe:true;errorCode?:string}|{outcome:'FAILED'|'UNKNOWN';errorCode?:string};
export type ExecutiveDeliveryAdapter={channel:string;send(input:{reportId:string;artifact:unknown;hash:string;recipientRef:string;idempotencyKey:string;signal:AbortSignal}):Promise<ExecutiveDeliveryOutcome>};
export async function recoverExecutiveDeliveries(c:PoolClient,context:OwnerContext,now=new Date()){
 const company=await authorizedCompany(c,context);
 // A crashed sender may already have produced an outside effect. Never replay it blindly.
 const expired=await c.query(`UPDATE executive_reports SET status='UNKNOWN',last_error_code='SENDER_LEASE_EXPIRED',lease_until=NULL
  WHERE legal_entity_id=$1 AND status='SENDING' AND lease_until<=$2 RETURNING id,attempt`,[company,now]);
 for(const row of expired.rows)await c.query("UPDATE executive_report_attempts SET outcome='UNKNOWN',finished_at=$3 WHERE report_id=$1 AND attempt=$2 AND outcome='SENDING'",[row.id,row.attempt,now]);
 return {ambiguous:expired.rowCount??0};
}
export async function claimExecutiveDelivery(c:PoolClient,context:OwnerContext,channel:string,now=new Date()){
 const company=await authorizedCompany(c,context);
 await recoverExecutiveDeliveries(c,context,now);
 const row=(await c.query(`SELECT r.* FROM executive_reports r JOIN executive_report_settings s USING(legal_entity_id)
 WHERE r.legal_entity_id=$1 AND s.enabled AND s.approved_by IS NOT NULL AND r.channel=$2 AND r.channel=s.channel AND r.recipient_ref=s.recipient_ref
 AND r.status IN('READY','RETRY') AND r.attempt<3 AND r.next_attempt_at<=$3 ORDER BY r.planned_at,r.id FOR UPDATE OF r SKIP LOCKED LIMIT 1`,[company,channel,now])).rows[0];
 if(!row)return null;
 if(sha256Hex(row.artifact)!==row.artifact_hash){await c.query("UPDATE executive_reports SET status='FAILED',last_error_code='ARTIFACT_HASH_MISMATCH' WHERE id=$1",[row.id]);return null;}
 const token=randomUUID(),attempt=row.attempt+1;
 await c.query("UPDATE executive_reports SET status='SENDING',attempt=$2,delivery_token=$3,lease_until=$4 WHERE id=$1",[row.id,attempt,token,new Date(now.getTime()+60000)]);
 await c.query("INSERT INTO executive_report_attempts(report_id,attempt,delivery_token,outcome,started_at) VALUES($1,$2,$3,'SENDING',$4)",[row.id,attempt,token,now]);
 return {...row,attempt,delivery_token:token};
}
export async function finishExecutiveDelivery(c:PoolClient,context:OwnerContext,claim:any,outcome:Awaited<ReturnType<ExecutiveDeliveryAdapter['send']>>,now=new Date()){
 const company=await authorizedCompany(c,context);
 let state:ExecutiveDeliveryOutcome['outcome']=outcome&&['ACCEPTED','CONFIRMED','RETRY','FAILED','UNKNOWN'].includes(outcome.outcome)?outcome.outcome:'UNKNOWN';
 if(state==='RETRY'&&(!('retrySafe' in outcome)||outcome.retrySafe!==true))state='UNKNOWN';
 const receipt=outcome&&'receiptId' in outcome&&typeof outcome.receiptId==='string'&&/^[a-zA-Z0-9._:/-]{1,200}$/.test(outcome.receiptId)?outcome.receiptId:null;
 if((state==='ACCEPTED'||state==='CONFIRMED')&&!receipt)state='UNKNOWN';
 if(state==='RETRY'&&claim.attempt>=3)state='FAILED';
 const error=outcome&&'errorCode' in outcome&&/^[A-Z0-9_]{1,100}$/.test(outcome.errorCode??'')?outcome.errorCode:null;
 const r=await c.query(`UPDATE executive_reports SET status=$4,receipt_id=$5,sent_at=CASE WHEN $4 IN('CONFIRMED','ACCEPTED') THEN $6 ELSE NULL END,
 lease_until=NULL,next_attempt_at=$7,last_error_code=$8 WHERE id=$1 AND legal_entity_id=$2 AND delivery_token=$3 AND status='SENDING' AND lease_until>$6 RETURNING id`,
 [claim.id,company,claim.delivery_token,state,receipt,now,new Date(now.getTime()+Math.min(3600,60*2**claim.attempt)*1000),error]);
 if(r.rowCount!==1)throw Error('REPORT_DELIVERY_FENCE_REJECTED');
 await c.query('UPDATE executive_report_attempts SET outcome=$3,receipt_id=$4,finished_at=$5 WHERE report_id=$1 AND delivery_token=$2',[claim.id,claim.delivery_token,state,receipt,now]);
 return {reportId:claim.id,status:state,receiptId:receipt};
}
