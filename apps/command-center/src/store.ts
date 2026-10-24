import {withTransaction} from "../../../packages/db/src/client";
import type {PoolClient} from "pg";
import { autonomyEnabled } from "../../development/src/autonomyBoundary";
import { assertSafeScalar } from "../../development/src/planningPolicy";
import { encodeGoalAcceptance } from "../../kernel/src/goalAcceptance";
import {goalProgress} from './goalProgress';

function restrictedReadScope(){
  return process.env.SAM_COMMAND_CENTER_READ_ONLY==='1'||autonomyEnabled()||process.env.SAM_RELEASE_SYNTHETIC_PLANNER==="1";
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
    const [plans,work,executions,verifications,audit,approvals,reports]=await Promise.all([
      client.query("SELECT * FROM plans WHERE goal_id=$1 ORDER BY version",[goalId]),
      client.query("SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY queued_at,id",[goalId]),
      client.query("SELECT * FROM executions WHERE goal_id=$1 ORDER BY started_at,id",[goalId]),
      client.query(`SELECT v.* FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 ORDER BY v.checked_at,v.id`,[goalId]),
      client.query("SELECT * FROM audit_log WHERE goal_id=$1 ORDER BY timestamp,id",[goalId]),
      restrictedReadScope()?Promise.resolve({rows:[]}):client.query("SELECT * FROM approvals WHERE goal_id=$1 AND legal_entity_id=$2 ORDER BY created_at,id",[goalId,legalEntityId]),
      client.query('SELECT id,plan_id,round,decision,created_at FROM goal_read_reviews WHERE goal_id=$1 ORDER BY created_at,id',[goalId])
    ]);
    let budget:any=null;
    const table=(await client.query("SELECT to_regclass('evaluation_trials') relation")).rows[0]?.relation;
    if(table&&(await client.query("SELECT has_table_privilege(current_user,$1::regclass,'SELECT') allowed",[table])).rows[0]?.allowed){
      const trial=(await client.query(`WITH RECURSIVE ancestors(id,parent_goal_id,depth) AS (
        SELECT id,parent_goal_id,0 FROM goals WHERE id=$1 AND company_scope=$2
        UNION ALL SELECT g.id,g.parent_goal_id,a.depth+1 FROM goals g JOIN ancestors a ON g.id=a.parent_goal_id WHERE a.depth<4 AND g.company_scope=$2)
        SELECT t.used,t.spec->'limits' limits,t.agent_used->('goal.'||$1::text) goal_used,t.deadline
        FROM evaluation_trials t JOIN ancestors a ON a.id=t.root_goal_id WHERE t.legal_entity_id=$2 LIMIT 1`,[goalId,legalEntityId])).rows[0];
      if(trial)budget={scope:'TRIAL',costBasis:'RESERVED_UPPER_BOUND_NOT_INVOICE',reservedUsd:Number(trial.used.costUsd),
        ceilingUsd:Number(trial.limits.costUsd),remainingReservedUsd:Math.max(0,Number(trial.limits.costUsd)-Number(trial.used.costUsd)),
        reservedModelAttempts:trial.used.models,goalUsage:trial.goal_used??null,deadline:trial.deadline,actualBilledUsd:null};
    }
    return {
      goal:goal.rows[0],
      plans:plans.rows,
      work:work.rows,
      executions:executions.rows,
      verifications:verifications.rows,
      approvals:approvals.rows,
      approvalsDisabled:restrictedReadScope(),
      audit:audit.rows,
      reports:reports.rows,budget,
      progress:goalProgress({goal:goal.rows[0],work:work.rows,executions:executions.rows,verifications:verifications.rows,reports:reports.rows})
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
  const readOnlyStage=process.env.SAM_COMMAND_CENTER_READ_ONLY==='1';
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
  const authority=autonomyEnabled()||readOnlyStage?"GREEN":input.authorityCeiling??"YELLOW";
  if(readOnlyStage&&input.authorityCeiling!==undefined&&input.authorityCeiling!=='GREEN')throw Error('READ_ONLY_STAGE_AUTHORITY_REQUIRED');
  if(authority!=="GREEN"&&authority!=="YELLOW") throw new Error("authority ceiling must be GREEN or YELLOW");
  const priority=boundedPriority(input.priority);
  if(!readOnlyStage&&(process.env.SAM_REQUIRE_GOAL_ACCEPTANCE==="1"||process.env.NODE_ENV==="production")&&input.acceptanceContract===undefined){
    throw new Error("GOAL_CONTRACT_REQUIRED");
  }
  // The isolated autonomy intake deliberately retains its existing field boundary.
  if(autonomyEnabled()&&input.acceptanceContract!==undefined)throw new Error("AUTONOMY_INTAKE_FIELDS");
  if(readOnlyStage&&input.acceptanceContract!==undefined)throw Error('READ_ONLY_STAGE_REPORT_CONTRACT_REQUIRED');
  const completion=readOnlyStage?'sam.read_report.v1':input.acceptanceContract===undefined?
    "Owner goal must complete with independently verified evidence.":encodeGoalAcceptance(input.acceptanceContract);

  const write=async(client:PoolClient)=>{
    const exists=await client.query("SELECT id,org_id FROM legal_entities WHERE id=$1 AND status='ACTIVE'",[legalEntityId]);
    if(exists.rowCount!==1) throw new Error("configured legal entity is not active");

    const scopedId=readOnlyStage||autonomyEnabled()||process.env.SAM_RELEASE_SYNTHETIC_PLANNER==="1";
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
