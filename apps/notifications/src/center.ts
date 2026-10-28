import { pool } from '../../../packages/db/src/client';

export const notificationsEnabled=()=>process.env.SAM_INTEGRATION_ENABLED==='1'&&process.env.SAM_NOTIFICATIONS_ENABLED==='true';
export async function transaction<T>(db:any,fn:(client:any)=>Promise<T>):Promise<T>{
 const c=await db.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}
 catch(error){await c.query('ROLLBACK');throw error}finally{c.release()}
}
const labels={COMPLETED:'اكتملت المهمة',FAILED:'تعذّرت المهمة',APPROVAL:'المهمة تحتاج قرارك',PROGRESS:'تحديث مهم للمهمة'};

async function suppressObsoleteGoalNotifications(client:any,companyId:string|null=null){
 await client.query(`UPDATE owner_notifications n SET status='SUPPRESSED',last_error_code='GOAL_STATE_CHANGED',updated_at=now()
  FROM goals g WHERE n.goal_id=g.id AND ($1::uuid IS NULL OR (n.legal_entity_id=$1 AND g.company_scope=$1))
   AND n.kind IN ('APPROVAL','PROGRESS') AND n.body->>'state'<>g.state
   AND n.status IN ('UNROUTED','PENDING','RETRY') AND n.body->>'requiredAction' IS DISTINCT FROM 'REVIEW_OBSERVATION'`,[companyId]);
}

export async function projectOwnerNotifications(db:any=pool){
 if(!notificationsEnabled())return {enabled:false,created:0};
 return transaction(db,async c=>{
  // Separate observer: never claim, publish, acknowledge or mutate the runtime outbox.
  const lock=await c.query("SELECT pg_try_advisory_xact_lock(hashtext('sam-owner-notifications')) AS locked");
  if(!lock.rows[0].locked)return {enabled:true,created:0,busy:true};
  if(!(await c.query("SELECT id FROM notification_settings WHERE id='owner'")).rowCount)throw new Error("NOTIFICATION_OPERATOR_ENABLEMENT_REQUIRED");
  await suppressObsoleteGoalNotifications(c);
  const events=await c.query(`SELECT o.* FROM outbox_events o
    WHERE o.created_at >= (SELECT enabled_at FROM notification_settings WHERE id='owner')
      AND o.aggregate_type='goal' AND o.event_type='GOAL_STATE_CHANGED'
      AND NOT EXISTS(SELECT 1 FROM notification_event_receipts r WHERE r.event_id=o.id)
    ORDER BY o.created_at,o.id LIMIT 100`);
  let created=0;
  for(const event of events.rows){
   if(await projectGoalNotificationEvent(c,event))created++;
  }
  // Perception uses the existing event fabric, not the Outbox delivery receipt.
  // Correlate the exact latest verified execution and company before owner review.
  const attention=await c.query(`SELECT f.event_seq,f.payload,f.occurred_at,e.id AS execution_id,g.id AS goal_id,g.business_id,g.state,g.company_scope
    FROM event_fabric_events f
    JOIN perception_observations observation ON observation.event_seq=f.event_seq
      AND observation.classification='CHANGED'
    JOIN perception_sources source ON source.id=observation.source_id
      AND source.id::text=f.payload->>'source_id'
    JOIN executions e ON e.id=observation.execution_id AND e.id::text=f.payload->>'execution_id'
    JOIN goals g ON g.id=e.goal_id
    JOIN LATERAL(SELECT id,result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE f.event_type='PERCEPTION_ATTENTION' AND f.created_at >= (SELECT enabled_at FROM notification_settings WHERE id='owner')
      AND f.source='perception:'||g.company_scope::text||':'||(f.payload->>'source_id')
      AND f.payload->>'legal_entity_id'=g.company_scope::text
      AND source.legal_entity_id=g.company_scope
      AND observation.verification_id=v.id
      AND observation.fingerprint=f.payload->>'fingerprint'
      AND f.payload->>'verification_id'=v.id::text AND v.result='VERIFIED'
      AND NOT EXISTS(SELECT 1 FROM owner_notifications n WHERE n.dedup_key='fabric:'||f.event_seq::text)
    ORDER BY f.event_seq LIMIT 100`);
  for(const row of attention.rows){
    const inserted=await c.query(`INSERT INTO owner_notifications(legal_entity_id,goal_id,dedup_key,kind,severity,title,body)
      VALUES($1,$2,$3,'PROGRESS','WARNING',$4,$5::jsonb) ON CONFLICT(dedup_key) DO NOTHING RETURNING id`,
      [row.company_scope,row.goal_id,'fabric:'+row.event_seq,`تغيّر في مصدر مراقب يحتاج مراجعة — ${row.business_id}`,
       JSON.stringify({schema:'sam.owner_notification.v1',goalId:row.goal_id,businessId:row.business_id,state:row.state,
        summary:'رُصد تغيّر في قراءة متحقق منها. راجع التقرير والمصدر؛ هذا تنبيه للمراجعة ولا يمنح صلاحية التنفيذ.',
        requiredAction:'REVIEW_OBSERVATION',sourceId:row.payload.source_id,evidenceExecutionIds:[row.execution_id],
        verificationId:row.payload.verification_id,previousHash:row.payload.previous_hash,fingerprint:row.payload.fingerprint,eventAt:row.occurred_at})]);
    if(inserted.rowCount)created++;
  }
  // One overdue update per active plan/state, not a message on every runtime tick.
  const overdue=await c.query(`SELECT g.* FROM goals g WHERE company_scope IS NOT NULL
    AND created_at >= (SELECT enabled_at FROM notification_settings WHERE id='owner')
    AND created_at < now()-interval '30 minutes'
    AND state IN ('NEW','MODELING','PLANNING','EXECUTING','VERIFYING','REPLANNING')
    AND NOT EXISTS(SELECT 1 FROM owner_notifications n WHERE n.dedup_key='long:'||g.id::text||':'||g.state||':'||COALESCE(g.current_plan_id::text,'none'))
    ORDER BY created_at,id LIMIT 50`);
  for(const goal of overdue.rows){
   const key=`long:${goal.id}:${goal.state}:${goal.current_plan_id??'none'}`;
   const result=await c.query(`INSERT INTO owner_notifications(legal_entity_id,goal_id,dedup_key,kind,severity,title,body)
     VALUES($1,$2,$3,'PROGRESS','WARNING',$4,$5::jsonb) ON CONFLICT(dedup_key) DO NOTHING RETURNING id`,
     [goal.company_scope,goal.id,key,`المهمة مستمرة منذ أكثر من ٣٠ دقيقة — ${goal.business_id}`,
      JSON.stringify({schema:'sam.owner_notification.v1',goalId:goal.id,businessId:goal.business_id,state:goal.state,
        summary:'المهمة ما زالت جارية؛ تجاوز المدة لا يثبت فشلها.',requiredAction:'NONE',observedAt:new Date().toISOString()})]);
   if(result.rowCount)created++;
  }
  return {enabled:true,created};
 });
}
async function projectGoalNotificationEvent(c:any,event:any,companyId?:string){
   const goal=(await c.query('SELECT * FROM goals WHERE id=$1',[event.aggregate_id])).rows[0];
   if(companyId&&goal?.company_scope!==companyId)return false;
   let created=0;
   const state=event.payload?.to;
   const kind=state==='COMPLETED'?'COMPLETED':state==='FAILED'?'FAILED':state==='WAITING_OWNER'?'APPROVAL':
     ['WAITING_EXTERNAL','BLOCKED'].includes(state)?'PROGRESS':null;
   let notificationId:string|null=null;
   // Old requests for approval must not notify after the task has already resumed.
   if(goal?.company_scope && kind && goal.state===state && !(goal.domain==='sam_perception'&&kind==='COMPLETED')){
    const report=kind==='COMPLETED'?(await c.query(`SELECT id,report_hash,decision FROM goal_read_reviews
      WHERE goal_id=$1 AND plan_id=$2 AND decision->>'status'='complete'
        AND ($3::text IS NULL OR report_hash=$3) ORDER BY round DESC,created_at DESC,id DESC LIMIT 1`,[goal.id,goal.current_plan_id,event.payload?.report_hash??null])).rows[0]:null;
    const verified=await c.query(`SELECT e.id,v.result FROM executions e
      LEFT JOIN LATERAL(SELECT result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1) v ON true
      WHERE e.goal_id=$1 ORDER BY e.started_at,e.id`,[goal.id]);
    const failedWork=(await c.query(`SELECT capability_id,wake_reason,attempt FROM work_queue
      WHERE goal_id=$1 AND status='FAILED' ORDER BY queued_at,id LIMIT 10`,[goal.id])).rows;
    const approvals=kind==='APPROVAL'?(await c.query(`SELECT id,capability_id,expiry_at FROM approvals
      WHERE goal_id=$1 AND legal_entity_id=$2 AND status='PENDING' AND expiry_at>now() ORDER BY created_at,id LIMIT 10`,[goal.id,goal.company_scope])).rows:[];
    const attempts=Number(goal.replan_attempts??0);
    const summary=kind==='COMPLETED'&&report?String(report.decision.summary).slice(0,1800):
      kind==='COMPLETED'?'اكتملت المهمة بحسب سجل الحالة؛ راجع التنفيذ والأدلة. لا يوجد تقرير نهائي موحّد مرتبط بهذا الإشعار.':
      kind==='FAILED'?'توقفت المهمة دون اكتمال. راجع سبب الانتقال ومحاولات التنفيذ في سجل المهمة.':
      kind==='APPROVAL'?'توقفت المهمة بانتظار قرارك. راجع الطلب والتفاصيل قبل الموافقة.':'تحتاج المهمة متابعة بسبب عائق أو اعتماد خارجي.';
    const body={schema:'sam.owner_notification.v1',businessId:goal.business_id,goalId:goal.id,state,
      summary,reasonCode:reasonCode(event.payload?.reason),reason:reasonLabel(event.payload?.reason),replans:attempts,
      failedAttempts:failedWork.map((r:any)=>({capabilityId:r.capability_id,reasonCode:reasonCode(r.wake_reason),attempt:Number(r.attempt)})),
      verifiedExecutions:verified.rows.filter((r:any)=>r.result==='VERIFIED').length,
      totalExecutions:verified.rows.length,requiredAction:kind==='APPROVAL'?'REVIEW_OWNER_DECISION':kind==='FAILED'?'REVIEW_FAILURE':'NONE',
      approvalRequests:approvals,report:report?{id:report.id,hash:report.report_hash}:null,
      evidenceExecutionIds:verified.rows.filter((r:any)=>r.result==='VERIFIED').map((r:any)=>r.id),
      eventAt:event.created_at,deliveryMeaning:'UNROUTED means stored internally, not sent to the owner'};
    const inserted=await c.query(`INSERT INTO owner_notifications
      (legal_entity_id,goal_id,source_event_id,dedup_key,kind,severity,title,body)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT(dedup_key) DO NOTHING RETURNING id`,
      [goal.company_scope,goal.id,event.id,'event:'+event.id,kind,kind==='APPROVAL'?'URGENT':kind==='COMPLETED'?'INFO':'WARNING',
       `${labels[kind]} — ${goal.business_id}`,JSON.stringify(body)]);
    notificationId=inserted.rows[0]?.id??(await c.query('SELECT id FROM owner_notifications WHERE dedup_key=$1',['event:'+event.id])).rows[0]?.id;
    if(inserted.rowCount)created++;
   }
   await c.query(`INSERT INTO notification_event_receipts(event_id,notification_id,disposition)
     VALUES($1,$2,$3) ON CONFLICT(event_id) DO NOTHING`,[event.id,notificationId,notificationId?'CREATED':'SKIPPED']);
   return created>0;
}

function reasonCode(value:unknown){
 // Never copy arbitrary provider error bodies, secrets or model text into alerts.
 const known=new Set(['WORK_EXECUTION_FAILED','PLANNING_FAILED','READ_ONLY_NOT_FOUND_REPLAN',
  'replan_budget_exhausted','candidate_plan_requires_authority','replanned_candidate_requires_authority',
  'chatgpt_direct_requires_authority','evidence_report_saved','objective_review_blocked',
  'objective_review_runtime_failed','independent_verification_inconclusive']);
 return typeof value==='string'&&known.has(value)?value:'SEE_GOAL_TIMELINE';
}
export async function runOwnerNotificationTick(db:any=pool){
 try{return await projectOwnerNotifications(db)}catch{return {enabled:notificationsEnabled(),created:0,errorCode:'NOTIFICATION_PROJECTION_FAILED'}}
}

function reasonLabel(value:unknown){
 const labels:Record<string,string>={
  WORK_EXECUTION_FAILED:'فشلت إحدى عمليات التنفيذ؛ راجع الأدوات التي جُرّبت في سجل المهمة.',
  PLANNING_FAILED:'تعذّر إنشاء خطة قابلة للتنفيذ.',
  replan_budget_exhausted:'نفدت محاولات إعادة التخطيط المسموح بها.',
  candidate_plan_requires_authority:'الخطة تحتاج موافقة تتجاوز الصلاحيات الحالية.',
  chatgpt_direct_requires_authority:'التنفيذ المطلوب يحتاج موافقتك.',
  evidence_report_saved:'حُفظ التقرير النهائي المرتبط بالأدلة.',
  objective_review_blocked:'لم يثبت اكتمال كل المطلوب من الأدلة المتاحة.',
  objective_review_runtime_failed:'تعذّر اعتماد التقرير النهائي.'
 };
 return typeof value==='string'&&labels[value]?labels[value]:'راجع تفاصيل الحدث والتنفيذ في سجل المهمة.';
}

/** Durable owner read receipts use the existing append-only tenant audit log.
 * Caller owns the transaction. Reading never changes delivery status/read_at. */
export async function acknowledgeOwnerNotification(client:any,context:import('../../../packages/shared/src/ownerScope').OwnerContext,notificationId:string){
 const {authorizedCompany,uuidPattern}=await import('../../../packages/shared/src/ownerScope');
 const company=await authorizedCompany(client,context);
 if(typeof notificationId!=='string'||!uuidPattern.test(notificationId))throw Error('NOTIFICATION_ID_INVALID');
 const visible=(await client.query('SELECT id FROM owner_notifications WHERE id=$1 AND legal_entity_id=$2',[notificationId,company])).rows[0];
 if(!visible)return null;
 const {sha256Hex}=await import('../../../packages/shared/src/stableJson');
 await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['notification-read:'+sha256Hex({company,actor:context.actor,notificationId})]);
 let receipt=(await client.query(`SELECT id,timestamp FROM audit_log WHERE action='OWNER_NOTIFICATION_READ'
  AND entity_type='legal_entity' AND entity_id=$1 AND actor=$2 AND after_ref->>'notificationId'=$3 ORDER BY timestamp,id LIMIT 1`,[company,context.actor,notificationId])).rows[0];
 if(!receipt)receipt=(await client.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES($1,'OWNER_NOTIFICATION_READ','legal_entity',$2,$3::jsonb,'internal_notification_poll','GREEN','READ') RETURNING id,timestamp`,[context.actor,company,JSON.stringify({schema:'sam.notification_read_receipt.v1',notificationId})])).rows[0];
 return {notificationId,receipt,delivery:'POLLING_ONLY',pushPerformed:false};
}

export async function listOwnerNotifications(client:any,context:import('../../../packages/shared/src/ownerScope').OwnerContext,limit=50){
 const {authorizedCompany}=await import('../../../packages/shared/src/ownerScope');
 const company=await authorizedCompany(client,context);
 if(!Number.isInteger(limit)||limit<1||limit>200)throw Error('INVALID_LIMIT');
 const access=(await client.query(`SELECT relation IS NOT NULL AS present,
  CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
  FROM (SELECT to_regclass('audit_log') AS relation) access`)).rows[0];
 const records=(await client.query("SELECT * FROM owner_notifications WHERE legal_entity_id=$1 AND status<>'SUPPRESSED' ORDER BY created_at DESC,id DESC LIMIT $2",[company,limit])).rows;
 const receipts=access?.allowed?(await client.query(`SELECT DISTINCT ON (after_ref->>'notificationId') id,timestamp,after_ref->>'notificationId' AS notification_id
  FROM audit_log WHERE action='OWNER_NOTIFICATION_READ' AND entity_type='legal_entity' AND entity_id=$1 AND actor=$2
  AND after_ref->>'notificationId'=ANY($3::text[]) ORDER BY after_ref->>'notificationId',timestamp,id`,[company,context.actor,records.map((r:any)=>r.id)])).rows:[];
 return {availability:'AVAILABLE',delivery:'POLLING_ONLY',pushPerformed:false,unroutedMeaning:'Stored internally; not sent to ChatGPT or owner',readReceiptAvailability:access?.allowed?'APPEND_ONLY_AUDIT':'UNAVAILABLE',records:records.map((r:any)=>({...r,readReceipt:receipts.find((x:any)=>x.notification_id===r.id)??null}))};
}

/** Company-local opt-in lives in the existing append-only audit log. */
export async function ownerContinuityActivation(client:any,companyId:string){
 const access=(await client.query("SELECT to_regclass('audit_log') IS NOT NULL AS present")).rows[0];
 if(!access?.present)return null;
 return (await client.query(`SELECT id,timestamp FROM audit_log WHERE action='OWNER_CONTINUITY_ENABLED'
  AND entity_type='legal_entity' AND entity_id=$1 AND after_ref->>'schema'='sam.owner_continuity.v1'
  ORDER BY timestamp,id LIMIT 1`,[companyId])).rows[0]??null;
}
async function projectScopedEvents(client:any,companyId:string,enabledAt:string){
 await suppressObsoleteGoalNotifications(client,companyId);
 const events=(await client.query(`SELECT o.* FROM outbox_events o JOIN goals g ON g.id=o.aggregate_id
  WHERE g.company_scope=$1 AND o.created_at >= $2::timestamptz AND o.aggregate_type='goal' AND o.event_type='GOAL_STATE_CHANGED'
  AND NOT EXISTS(SELECT 1 FROM notification_event_receipts r WHERE r.event_id=o.id)
  ORDER BY o.created_at,o.id LIMIT 100`,[companyId,enabledAt])).rows;
 let created=0;for(const event of events)if(await projectGoalNotificationEvent(client,event,companyId))created++;
 return created;
}
/** Explicit authenticated owner action. No historical replay or global feature activation. */
export async function pollScopedOwnerNotifications(client:any,context:import('../../../packages/shared/src/ownerScope').OwnerContext){
 const {authorizedCompany}=await import('../../../packages/shared/src/ownerScope');
 const company=await authorizedCompany(client,context);
 await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['owner-continuity:'+company]);
 let activation=await ownerContinuityActivation(client,company);
 if(!activation)activation=(await client.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES($1,'OWNER_CONTINUITY_ENABLED','legal_entity',$2,'{"schema":"sam.owner_continuity.v1","delivery":"POLLING_ONLY","historicalReplay":false}'::jsonb,'explicit_owner_poll','GREEN','ENABLED') RETURNING id,timestamp`,[context.actor,company])).rows[0];
 const created=await projectScopedEvents(client,company,activation.timestamp);
 return {...await listOwnerNotifications(client,{...context,legalEntityId:company}),enabled:true,activation,created};
}
/** Ordinary production hook: inert until the narrow flag AND explicit activation exist. */
export async function runScopedOwnerNotificationTick(db:any=pool){
 if(process.env.SAM_OWNER_CONTINUITY_ENABLED!=='true')return {enabled:false,created:0};
 try{return await transaction(db,async client=>{
  const company=(await client.query('SELECT current_legal_entity_id() AS entity')).rows[0]?.entity;
  const activation=company?await ownerContinuityActivation(client,company):null;
  if(!activation)return {enabled:false,created:0};
  const lock=await client.query('SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',['owner-continuity:'+company]);
  if(!lock.rows[0].locked)return {enabled:true,created:0,busy:true};
  return {enabled:true,created:await projectScopedEvents(client,company,activation.timestamp),delivery:'POLLING_ONLY',pushPerformed:false};
 })}catch{return {enabled:false,created:0,errorCode:'SCOPED_NOTIFICATION_PROJECTION_FAILED'}}
}
