import { pool } from '../../../packages/db/src/client';

export const notificationsEnabled=()=>process.env.SAM_NOTIFICATIONS_ENABLED==='true';
export async function transaction<T>(db:any,fn:(client:any)=>Promise<T>):Promise<T>{
 const c=await db.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}
 catch(error){await c.query('ROLLBACK');throw error}finally{c.release()}
}
const labels={COMPLETED:'اكتملت المهمة',FAILED:'تعذّرت المهمة',APPROVAL:'المهمة تحتاج قرارك',PROGRESS:'تحديث مهم للمهمة'};

export async function projectOwnerNotifications(db:any=pool){
 if(!notificationsEnabled())return {enabled:false,created:0};
 return transaction(db,async c=>{
  // Separate observer: never claim, publish, acknowledge or mutate the runtime outbox.
  const lock=await c.query("SELECT pg_try_advisory_xact_lock(hashtext('sam-owner-notifications')) AS locked");
  if(!lock.rows[0].locked)return {enabled:true,created:0,busy:true};
  await c.query("INSERT INTO notification_settings(id) VALUES('owner') ON CONFLICT(id) DO NOTHING");
  await c.query(`UPDATE owner_notifications n SET status='SUPPRESSED',last_error_code='GOAL_STATE_CHANGED',updated_at=now()
    FROM goals g WHERE n.goal_id=g.id AND n.kind IN ('APPROVAL','PROGRESS') AND n.body->>'state'<>g.state
      AND n.status IN ('UNROUTED','PENDING','RETRY') AND n.body->>'requiredAction' IS DISTINCT FROM 'REVIEW_OBSERVATION'`);
  const events=await c.query(`SELECT o.* FROM outbox_events o
    WHERE o.created_at >= (SELECT enabled_at FROM notification_settings WHERE id='owner')
      AND o.aggregate_type='goal' AND o.event_type='GOAL_STATE_CHANGED'
      AND NOT EXISTS(SELECT 1 FROM notification_event_receipts r WHERE r.event_id=o.id)
    ORDER BY o.created_at,o.id LIMIT 100`);
  let created=0;
  for(const event of events.rows){
   const goal=(await c.query('SELECT * FROM goals WHERE id=$1',[event.aggregate_id])).rows[0];
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
  }
  // Perception uses the existing event fabric, not the Outbox delivery receipt.
  // Correlate the exact latest verified execution and company before owner review.
  const attention=await c.query(`SELECT f.event_seq,f.payload,f.occurred_at,e.id AS execution_id,g.id AS goal_id,g.business_id,g.state,g.company_scope
    FROM event_fabric_events f JOIN executions e ON e.id::text=f.payload->>'execution_id'
    JOIN goals g ON g.id=e.goal_id
    JOIN LATERAL(SELECT id,result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE f.event_type='PERCEPTION_ATTENTION' AND f.created_at >= (SELECT enabled_at FROM notification_settings WHERE id='owner')
      AND f.source='perception:'||g.company_scope::text||':'||(f.payload->>'source_id')
      AND f.payload->>'legal_entity_id'=g.company_scope::text
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
