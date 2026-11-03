import {describeSavedReports} from '../../../packages/shared/src/savedReportSemantics';
import {withTransaction} from "../../../packages/db/src/client";
import type {PoolClient} from "pg";
import { autonomyEnabled } from "../../development/src/autonomyBoundary";
import { assertSafeScalar } from "../../development/src/planningPolicy";
import { encodeGoalAcceptance } from "../../kernel/src/goalAcceptance";

function restrictedReadScope(){
  return autonomyEnabled()||process.env.SAM_RELEASE_SYNTHETIC_PLANNER==="1";
}

export interface OwnerGoalInput{
  objective:string;
  domain?:string;
  priority?:number;
  authorityCeiling?:"GREEN"|"YELLOW";
  acceptanceContract?:unknown;
}

function boundedPriority(value:unknown):number{
  const n=Number(value??50);
  if(!Number.isFinite(n)) return 50;
  return Math.max(0,Math.min(100,Math.trunc(n)));
}

export async function commandCenterOverview(legalEntityId:string){
  return withTransaction(async client=>{
    const r=await client.query(`SELECT
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state NOT IN ('COMPLETED','CANCELLED','FAILED')) AS active_goals,
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state='WAITING_OWNER') AS waiting_owner,
      ${restrictedReadScope()?"NULL::int":"(SELECT COUNT(*)::int FROM approvals WHERE legal_entity_id=$1 AND status='PENDING')"} AS pending_approvals,
      (SELECT COUNT(*)::int FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE g.company_scope=$1 AND w.status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')) AS active_work,
      ${restrictedReadScope()?"NULL::int":"(SELECT COUNT(*)::int FROM side_effect_operations WHERE legal_entity_id=$1 AND reconciliation_state='NEEDS_RECONCILIATION')"} AS unresolved_side_effects,
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state='FAILED') AS failed_goals`,[legalEntityId]);
    return r.rows[0];
  });
}

export async function commandCenterGoals(legalEntityId:string,limit=100){
  const capped=Math.max(1,Math.min(200,Math.trunc(Number(limit)||100)));
  return withTransaction(async client=>{
    const r=await client.query(`SELECT id,business_id,domain,objective,state,priority,authority_ceiling,
      created_at,updated_at,next_wake_at,current_plan_id,parent_goal_id,replan_attempts,replan_reason
      FROM goals WHERE company_scope=$1
      ORDER BY priority DESC,updated_at DESC LIMIT $2`,[legalEntityId,capped]);
    return r.rows;
  });
}

export async function commandCenterGoalTimeline(legalEntityId:string,goalId:string){
  return withTransaction(async client=>{
    const goal=await client.query("SELECT * FROM goals WHERE id=$1 AND company_scope=$2",[goalId,legalEntityId]);
    if(goal.rowCount!==1) return null;
    // Integration tables are optional for the core-only Command Center role.
    // Resolve the relation before checking its OID privilege: naming a missing
    // table directly in has_table_privilege would abort this transaction.
    const reportAccess=(await client.query(`SELECT relation IS NOT NULL AS present,
      CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
      FROM (SELECT to_regclass('goal_read_reviews') AS relation) access`)).rows[0];
    const reportsAvailability=!reportAccess.present?'MISSING_INTEGRATION_TABLE':!reportAccess.allowed?'PERMISSION_UNAVAILABLE':'CURRENT_ROLE_RLS_VISIBLE_REPORTS';
    const [plans,work,executions,verifications,audit,approvals,reports]=await Promise.all([
      client.query("SELECT * FROM plans WHERE goal_id=$1 ORDER BY version",[goalId]),
      client.query("SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY queued_at,id",[goalId]),
      client.query("SELECT * FROM executions WHERE goal_id=$1 ORDER BY started_at,id",[goalId]),
      client.query(`SELECT v.* FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 ORDER BY v.checked_at,v.id`,[goalId]),
      client.query("SELECT * FROM audit_log WHERE goal_id=$1 ORDER BY timestamp,id",[goalId]),
      restrictedReadScope()?Promise.resolve({rows:[]}):client.query("SELECT * FROM approvals WHERE goal_id=$1 AND legal_entity_id=$2 ORDER BY created_at,id",[goalId,legalEntityId]),
      reportAccess.allowed?client.query("SELECT * FROM goal_read_reviews WHERE goal_id=$1 ORDER BY round,created_at,id",[goalId]):Promise.resolve({rows:[]})
    ]);
    return {
      goal:goal.rows[0],
      plans:plans.rows,
      reports:reports.rows,
      reportInterpretations:describeSavedReports(reports.rows),
      reportsAvailability,
      reportRetrieval:{executionPerformed:false,meaning:"SAVED_RESULTS_WITH_ORIGINAL_IDS_AND_HASHES",semanticValidation:"Historical narrative is not newly validated; preserve each report coverage and limitations."},
      work:work.rows,
      executions:executions.rows,
      verifications:verifications.rows,
      approvals:approvals.rows,
      approvalsDisabled:restrictedReadScope(),
      audit:audit.rows
    };
  });
}

export async function commandCenterLatestFinanceBrief(legalEntityId:string){
  if(restrictedReadScope())return null;
  return withTransaction(async client=>{
    const r=await client.query(`SELECT id,goal_id,after_ref,result,timestamp
      FROM audit_log
      WHERE entity_type='legal_entity'
        AND entity_id=$1
        AND action='FINANCE_OPERATIONAL_BRIEF'
      ORDER BY timestamp DESC,id DESC LIMIT 1`,[legalEntityId]);
    return r.rowCount===1?r.rows[0]:null;
  });
}

export async function createOwnerGoal(legalEntityId:string,input:OwnerGoalInput,
  intake?:{client:PoolClient;goalId:string;actor:string}){
  const objective=String(input.objective??"").trim();
  if(autonomyEnabled()){
    assertSafeScalar(objective);
    if(legalEntityId!==process.env.SAM_DEV_LEGAL_ENTITY_ID)throw new Error("AUTONOMY_ENTITY");
    if(input.authorityCeiling!==undefined&&input.authorityCeiling!=="GREEN")throw new Error("AUTONOMY_AUTHORITY");
    if(input.domain!==undefined&&input.domain!=="development_probe")throw new Error("AUTONOMY_DOMAIN");
  }
  if(objective.length<3||objective.length>2000) throw new Error("objective must be 3-2000 characters");
  const domain=autonomyEnabled()?"development_probe":String(input.domain??"owner_command").trim();
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(domain)) throw new Error("invalid domain");
  const authority=autonomyEnabled()?"GREEN":input.authorityCeiling??"YELLOW";
  if(authority!=="GREEN"&&authority!=="YELLOW") throw new Error("authority ceiling must be GREEN or YELLOW");
  const priority=boundedPriority(input.priority);
  if((process.env.SAM_REQUIRE_GOAL_ACCEPTANCE==="1"||process.env.NODE_ENV==="production")&&input.acceptanceContract===undefined){
    throw new Error("GOAL_CONTRACT_REQUIRED");
  }
  // The isolated autonomy intake deliberately retains its existing field boundary.
  if(autonomyEnabled()&&input.acceptanceContract!==undefined)throw new Error("AUTONOMY_INTAKE_FIELDS");
  const completion=input.acceptanceContract===undefined?
    "Owner goal must complete with independently verified evidence.":encodeGoalAcceptance(input.acceptanceContract);

  const write=async(client:PoolClient)=>{
    const exists=await client.query("SELECT id,org_id FROM legal_entities WHERE id=$1 AND status='ACTIVE'",[legalEntityId]);
    if(exists.rowCount!==1) throw new Error("configured legal entity is not active");

    const scopedId=autonomyEnabled()||process.env.SAM_RELEASE_SYNTHETIC_PLANNER==="1";
    const next=await client.query("SELECT next_business_id('goal',$1::uuid) AS business_id",[scopedId?exists.rows[0].org_id:null]);
    const inserted=await client.query(`INSERT INTO goals
      (business_id,company_scope,domain,objective,state,priority,authority_ceiling,completion_definition,id)
      VALUES($1,$2,$3,$4,'NEW',$5,$6,$7,COALESCE($8::uuid,gen_random_uuid()))
      RETURNING id,business_id,company_scope,domain,objective,state,priority,authority_ceiling,created_at,updated_at`,
      [next.rows[0].business_id,legalEntityId,domain,objective,priority,authority,completion,intake?.goalId??null]
    );
    const goal=inserted.rows[0];
    await client.query(`INSERT INTO audit_log
      (actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
      VALUES($4,$1,'OWNER_GOAL_CREATED','goal',$1,$2::jsonb,$5,$3,'CREATED')`,
      [goal.id,JSON.stringify({business_id:goal.business_id,domain,objective,priority,authority_ceiling:authority}),authority,
        intake?.actor??"command-center-owner",intake?"chatgpt_mcp":"command_center"]
    );
    return goal;
  };
  return intake?write(intake.client):withTransaction(write);
}


export async function commandCenterReadiness(legalEntityId:string){
  return withTransaction(async client=>{
    const db=await client.query("SELECT 1 AS ok");
    const entity=await client.query("SELECT id,status FROM legal_entities WHERE id=$1",[legalEntityId]);
    const ready=db.rowCount===1&&entity.rowCount===1&&entity.rows[0].status==="ACTIVE";
    return {
      ready,
      database:db.rowCount===1,
      legalEntityActive:entity.rowCount===1&&entity.rows[0].status==="ACTIVE"
    };
  });
}

const commandCenterOwner=(legalEntityId:string)=>({actor:'command-center-owner',systemOwner:true,legalEntityId});
export async function commandCenterOwnerMemory(legalEntityId:string,query:string){
 const {authorizedCompany}=await import('../../../packages/shared/src/ownerScope');
 const {recallApprovedOwnerDecisions}=await import('../../brain/src/memory');
 if(typeof query!=='string'||query.length>4000)throw Error('INVALID_MEMORY_QUERY');
 return withTransaction(async client=>{await authorizedCompany(client,commandCenterOwner(legalEntityId));return {records:await recallApprovedOwnerDecisions(client,legalEntityId,query),approvalMeaning:'Explicitly approved owner decisions only; never expands execution authority.'}});
}
export async function commandCenterSaveOwnerDecision(legalEntityId:string,body:Record<string,unknown>){
 const {saveApprovedOwnerDecision}=await import('../../brain/src/learning');
 const allowed=['statement','context_key','source','source_timestamp','idempotency_key','approved'];
 if(Object.keys(body).some(k=>!allowed.includes(k)))throw Error('INVALID_OWNER_DECISION_FIELDS');
 return withTransaction(client=>saveApprovedOwnerDecision(client,commandCenterOwner(legalEntityId),{statement:body.statement as string,contextKey:body.context_key as string,source:body.source as string,sourceTimestamp:body.source_timestamp as string,idempotencyKey:body.idempotency_key as string,approved:body.approved as boolean}));
}
export async function commandCenterNotifications(legalEntityId:string,action:'list'|'poll'|'ack',notificationId?:string){
 const {listOwnerNotifications,pollScopedOwnerNotifications,acknowledgeOwnerNotification}=await import('../../notifications/src/center');
 return withTransaction(async client=>{
  if(action==='poll')return pollScopedOwnerNotifications(client,commandCenterOwner(legalEntityId));
  if(action==='ack')return acknowledgeOwnerNotification(client,commandCenterOwner(legalEntityId),notificationId??'');
  return listOwnerNotifications(client,commandCenterOwner(legalEntityId));
 });
}

/**
 * One read-only executive snapshot for the owner dashboard. Every field is derived
 * from stored rows; anything the schema cannot answer is returned as null so the
 * interface can show an honest unavailable state instead of an invented number.
 */
export async function commandCenterExecutive(legalEntityId:string){
  return withTransaction(async client=>{
    const restricted=restrictedReadScope();
    const overview=(await client.query(`SELECT
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state NOT IN ('COMPLETED','CANCELLED','FAILED')) AS active_goals,
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state='COMPLETED') AS completed_goals,
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state='FAILED') AS failed_goals,
      (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND state='WAITING_OWNER') AS waiting_owner,
      ${restricted?"NULL::int":"(SELECT COUNT(*)::int FROM approvals WHERE legal_entity_id=$1 AND status='PENDING')"} AS pending_approvals,
      (SELECT COUNT(*)::int FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE g.company_scope=$1 AND w.status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')) AS active_work,
      ${restricted?"NULL::int":"(SELECT COUNT(*)::int FROM side_effect_operations WHERE legal_entity_id=$1 AND reconciliation_state='NEEDS_RECONCILIATION')"} AS unresolved_side_effects
    `,[legalEntityId])).rows[0];

    const approvalRows=restricted?[]:(await client.query(`
      SELECT a.id,a.capability_id,a.authority_class,a.created_at,a.expiry_at,
             g.id AS goal_id,g.business_id,g.objective
      FROM approvals a JOIN goals g ON g.id=a.goal_id
      WHERE a.legal_entity_id=$1 AND a.status='PENDING' AND g.company_scope=$1
      ORDER BY a.created_at DESC LIMIT 20`,[legalEntityId])).rows;

    const waitingRows=(await client.query(`
      SELECT id,business_id,objective,replan_reason,updated_at,state
      FROM goals WHERE company_scope=$1 AND state IN ('WAITING_OWNER','BLOCKED')
      ORDER BY updated_at DESC LIMIT 20`,[legalEntityId])).rows;

    const failedRows=(await client.query(`
      SELECT id,business_id,objective,replan_reason,updated_at
      FROM goals WHERE company_scope=$1 AND state='FAILED'
      ORDER BY updated_at DESC LIMIT 5`,[legalEntityId])).rows;

    const agents=(await client.query(`
      SELECT e.actor,
        COUNT(*)::int AS executions,
        COUNT(*) FILTER (WHERE e.status='EXECUTED')::int AS executed,
        COUNT(*) FILTER (WHERE COALESCE(v.result,'')='VERIFIED')::int AS verified,
        COUNT(*) FILTER (WHERE COALESCE(v.result,'') IN ('FAILED','INCONCLUSIVE'))::int AS failed,
        COUNT(*) FILTER (WHERE e.status IN ('PENDING','RUNNING') AND e.started_at > now() - interval '30 minutes')::int AS running,
        MAX(COALESCE(e.finished_at,e.started_at)) AS last_at,
        MAX(e.capability_id) AS last_capability
      FROM executions e
      JOIN goals g ON g.id=e.goal_id
      LEFT JOIN verifications v ON v.execution_id=e.id
      WHERE g.company_scope=$1
      GROUP BY e.actor
      ORDER BY MAX(COALESCE(e.finished_at,e.started_at)) DESC LIMIT 20`,[legalEntityId])).rows;

    const reportAccess=(await client.query(`SELECT relation IS NOT NULL AS present,
      CASE WHEN relation IS NULL THEN false ELSE has_table_privilege(current_user,relation,'SELECT') END AS allowed
      FROM (SELECT to_regclass('goal_read_reviews') AS relation) access`)).rows[0];
    const reports=reportAccess.allowed?(await client.query(`
      SELECT r.id,r.goal_id,r.decision,r.report_hash,r.created_at,r.revision,
             g.business_id,g.objective,g.state
      FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id
      WHERE g.company_scope=$1 ORDER BY r.created_at DESC LIMIT 12`,[legalEntityId])).rows:[];

    // model_calls carries no company column. A system-wide total inside a company-scoped
    // dashboard could disclose another tenant's spend, so the snapshot does not read it at
    // all; the interface reports an explicit unavailable state until the schema can attribute
    // a call to a company (a migration that needs separate owner approval).
    const activity=(await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM executions e JOIN goals g ON g.id=e.goal_id
          WHERE g.company_scope=$1 AND e.started_at > now() - interval '24 hours') AS executions_24h,
        (SELECT COUNT(*)::int FROM verifications v JOIN executions e ON e.id=v.execution_id JOIN goals g ON g.id=e.goal_id
          WHERE g.company_scope=$1 AND v.result='VERIFIED' AND v.checked_at > now() - interval '24 hours') AS verified_24h,
        (SELECT COUNT(*)::int FROM goals WHERE company_scope=$1 AND created_at > now() - interval '24 hours') AS goals_24h,
        (SELECT MAX(e.started_at) FROM executions e JOIN goals g ON g.id=e.goal_id WHERE g.company_scope=$1) AS last_execution_at
    `,[legalEntityId])).rows[0];
    const recent=(await client.query(`
      SELECT e.actor,e.capability_id,COALESCE(e.finished_at,e.started_at) AS at,
             COALESCE(v.result,e.status) AS result
      FROM executions e
      JOIN goals g ON g.id=e.goal_id
      LEFT JOIN verifications v ON v.execution_id=e.id
      WHERE g.company_scope=$1
      ORDER BY COALESCE(e.finished_at,e.started_at) DESC LIMIT 5`,[legalEntityId])).rows;
    const reportTotal=reportAccess.allowed?(await client.query(`
      SELECT COUNT(*)::int AS n FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id WHERE g.company_scope=$1`,[legalEntityId])).rows[0].n:null;

    const trend=(await client.query(`
      SELECT to_char(date_trunc('day',created_at),'YYYY-MM-DD') AS day, COUNT(*)::int AS created
      FROM goals WHERE company_scope=$1 AND created_at > now() - interval '14 days'
      GROUP BY 1 ORDER BY 1`,[legalEntityId])).rows;
    const completions=(await client.query(`
      SELECT to_char(date_trunc('day',updated_at),'YYYY-MM-DD') AS day, COUNT(*)::int AS completed
      FROM goals WHERE company_scope=$1 AND state='COMPLETED' AND updated_at > now() - interval '14 days'
      GROUP BY 1 ORDER BY 1`,[legalEntityId])).rows;

    const brief=await commandCenterLatestFinanceBrief(legalEntityId);
    // Stored finance briefs for this legal entity only (audit_log.entity_id is the entity).
    const briefHistory=(await client.query(`
      SELECT id,goal_id,timestamp,after_ref
      FROM audit_log
      WHERE entity_type='legal_entity' AND entity_id=$1 AND action='FINANCE_OPERATIONAL_BRIEF'
      ORDER BY timestamp DESC, id DESC LIMIT 6`,[legalEntityId])).rows;

    return {
      generatedAt:new Date().toISOString(),
      counts:overview,
      decisions:{approvals:approvalRows,waiting:waitingRows,failed:failedRows,approvalsDisabled:restricted},
      agents,
      reports:{available:reportAccess.allowed,items:reports,total:reportTotal},
      finance:{brief,history:briefHistory,usage:null,usageUnavailable:"NOT_TENANT_SCOPED"},
      trend:{created:trend,completed:completions},
      activity:{...activity,recent}
    };
  });
}
