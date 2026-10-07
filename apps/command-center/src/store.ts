import {withTransaction} from "../../../packages/db/src/client";

export interface OwnerGoalInput{
  objective:string;
  domain?:string;
  priority?:number;
  authorityCeiling?:"GREEN"|"YELLOW";
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
      (SELECT COUNT(*)::int FROM approvals WHERE legal_entity_id=$1 AND status='PENDING') AS pending_approvals,
      (SELECT COUNT(*)::int FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE g.company_scope=$1 AND w.status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')) AS active_work,
      (SELECT COUNT(*)::int FROM side_effect_operations WHERE legal_entity_id=$1 AND reconciliation_state='NEEDS_RECONCILIATION') AS unresolved_side_effects,
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
    const [plans,work,executions,verifications,audit,approvals]=await Promise.all([
      client.query("SELECT * FROM plans WHERE goal_id=$1 ORDER BY version",[goalId]),
      client.query("SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY queued_at,id",[goalId]),
      client.query("SELECT * FROM executions WHERE goal_id=$1 ORDER BY started_at,id",[goalId]),
      client.query(`SELECT v.* FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 ORDER BY v.checked_at,v.id`,[goalId]),
      client.query("SELECT * FROM audit_log WHERE goal_id=$1 ORDER BY timestamp,id",[goalId]),
      client.query("SELECT * FROM approvals WHERE goal_id=$1 AND legal_entity_id=$2 ORDER BY created_at,id",[goalId,legalEntityId])
    ]);
    return {
      goal:goal.rows[0],
      plans:plans.rows,
      work:work.rows,
      executions:executions.rows,
      verifications:verifications.rows,
      approvals:approvals.rows,
      audit:audit.rows
    };
  });
}

export async function commandCenterLatestFinanceBrief(legalEntityId:string){
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

export async function createOwnerGoal(legalEntityId:string,input:OwnerGoalInput){
  const objective=String(input.objective??"").trim();
  if(objective.length<3||objective.length>2000) throw new Error("objective must be 3-2000 characters");
  const domain=String(input.domain??"owner_command").trim();
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(domain)) throw new Error("invalid domain");
  const authority=input.authorityCeiling??"YELLOW";
  if(authority!=="GREEN"&&authority!=="YELLOW") throw new Error("authority ceiling must be GREEN or YELLOW");
  const priority=boundedPriority(input.priority);

  return withTransaction(async client=>{
    const exists=await client.query("SELECT id FROM legal_entities WHERE id=$1 AND status='ACTIVE'",[legalEntityId]);
    if(exists.rowCount!==1) throw new Error("configured legal entity is not active");

    const next=await client.query("SELECT next_business_id('goal',NULL) AS business_id");
    const inserted=await client.query(`INSERT INTO goals
      (business_id,company_scope,domain,objective,state,priority,authority_ceiling,completion_definition)
      VALUES($1,$2,$3,$4,'NEW',$5,$6,$7)
      RETURNING id,business_id,company_scope,domain,objective,state,priority,authority_ceiling,created_at,updated_at`,
      [next.rows[0].business_id,legalEntityId,domain,objective,priority,authority,"Owner goal must complete with independently verified evidence."]
    );
    const goal=inserted.rows[0];
    await client.query(`INSERT INTO audit_log
      (actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
      VALUES('command-center-owner',$1,'OWNER_GOAL_CREATED','goal',$1,$2::jsonb,'command_center',$3,'CREATED')`,
      [goal.id,JSON.stringify({business_id:goal.business_id,domain,objective,priority,authority_ceiling:authority}),authority]
    );
    return goal;
  });
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
