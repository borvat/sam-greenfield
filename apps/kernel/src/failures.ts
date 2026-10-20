import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";

export function failureMessage(error:unknown):string{
  return (error instanceof Error?error.message:String(error)).slice(0,4000);
}

// A failed plan is retained intact. Pending siblings are stopped, not silently
// executed after a failed prerequisite. External side-effect ledgers are retained
// for reconciliation; this function never retries an external operation.
async function failGoal(client:any,goalId:string,reason:string,detail:Record<string,unknown>){
  const goal=await client.query("SELECT state,current_plan_id FROM goals WHERE id=$1 FOR UPDATE",[goalId]);
  if(goal.rowCount!==1||!["NEW","MODELING","PLANNING","EXECUTING","VERIFYING"].includes(goal.rows[0].state)) return false;
  await client.query(
    `UPDATE work_queue SET status='FAILED',fencing_token=fencing_token+1,
       lease_owner=NULL,lease_timestamp=NULL,lease_expiry=NULL,wake_reason=$3
     WHERE goal_id=$1 AND plan_id=$2 AND status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')`,
    [goalId,goal.rows[0].current_plan_id,reason]
  );
  await transitionGoal(client,goalId,goal.rows[0].state,"FAILED",reason,detail);
  await client.query(
    `INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,result)
     VALUES('sam-runtime',$1,'RUNTIME_FAILURE','goal',$1,$2::jsonb,'runtime','FAILED')`,
    [goalId,JSON.stringify({reason,...detail})]
  );
  return true;
}

export async function recordPlanningFailure(goalId:string,error:unknown){
  return withTransaction(async client=>{
    const goal=await client.query("SELECT state FROM goals WHERE id=$1 FOR UPDATE",[goalId]);
    if(!["MODELING","PLANNING"].includes(goal.rows[0]?.state)) return false;
    return failGoal(client,goalId,"PLANNING_FAILED",{error:failureMessage(error)});
  });
}

export async function recordWorkFailure(input:{queueId:string;fencingToken:number;error:unknown;actor:string}){
  return withTransaction(async client=>{
    const work=await client.query("SELECT goal_id FROM work_queue WHERE id=$1",[input.queueId]);
    const goalId=work.rows[0]?.goal_id;
    // Match the goal->work lock order used by failure/recovery paths.
    const goal=goalId?await client.query("SELECT current_plan_id FROM goals WHERE id=$1 FOR UPDATE",[goalId]):null;
    const locked=await client.query("SELECT * FROM work_queue WHERE id=$1 FOR UPDATE",[input.queueId]);
    const row=locked.rows[0];
    if(!row||Number(row.fencing_token)!==Number(input.fencingToken)||!["LEASED","EXECUTING"].includes(row.status)) return false;
    if(goal && goal.rows[0]?.current_plan_id!==row.plan_id) return false;
    const detail={queue_id:row.id,capability_id:row.capability_id,actor:input.actor,
      operation_key_ref:row.operation_key_ref,error:failureMessage(input.error)};
    await insertOutboxEvent(client,{aggregateType:"work_queue",aggregateId:row.id,eventType:"WORK_FAILED",payload:detail});
    if(goalId){
      // A missing Drive file is a safe, read-only recovery opportunity. Do not
      // re-execute writes, transient writes, or arbitrary failed tool calls.
      // Only replan the active goal with a bounded budget; leave the failed
      // attempt and its evidence intact for the operator.
      const state=await client.query(
        "SELECT state,replan_attempts,current_plan_id FROM goals WHERE id=$1 FOR UPDATE",
        [goalId]
      );
      const safeNotFound=row.capability_id==="drive_get_metadata" &&
        /^Google Drive API HTTP 404:/.test(detail.error) &&
        state.rows[0]?.state==="EXECUTING" &&
        Number(state.rows[0]?.replan_attempts??0)<2;
      if(safeNotFound){
        await client.query(
          `UPDATE work_queue SET status='FAILED',fencing_token=fencing_token+1,
             lease_owner=NULL,lease_timestamp=NULL,lease_expiry=NULL,
             wake_reason='READ_ONLY_NOT_FOUND_REPLAN'
           WHERE goal_id=$1 AND plan_id=$2 AND
             status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')`,
          [goalId,state.rows[0].current_plan_id]
        );
        const reason="Drive metadata lookup returned HTTP 404; choose a read-only search fallback instead of retrying the missing file";
        await client.query("UPDATE goals SET replan_reason=$2,updated_at=now() WHERE id=$1",[goalId,reason]);
        await transitionGoal(client,goalId,"EXECUTING","REPLANNING","READ_ONLY_NOT_FOUND_REPLAN",{failed_capability:row.capability_id});
        await client.query(
          `INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,result)
           VALUES('sam-runtime',$1,'RUNTIME_RECOVERY_REQUESTED','goal',$1,$2::jsonb,'runtime','REPLANNING')`,
          [goalId,JSON.stringify({reason,queue_id:row.id,capability_id:row.capability_id})]
        );
        return true;
      }
      return failGoal(client,goalId,"WORK_EXECUTION_FAILED",detail);
    }
    await client.query("UPDATE work_queue SET status='FAILED',wake_reason='WORK_EXECUTION_FAILED',lease_expiry=NULL WHERE id=$1",[row.id]);
    return true;
  });
}

export async function failInterruptedPlanning(staleMinutes=3,limit=25):Promise<string[]>{
  return withTransaction(async client=>{
    const stale=await client.query(
      `SELECT id FROM goals WHERE state IN ('MODELING','PLANNING')
        AND updated_at < now()-($1::int*interval '1 minute')
        ORDER BY updated_at,id FOR UPDATE SKIP LOCKED LIMIT $2`,[staleMinutes,limit]
    );
    const ids:string[]=[];
    for(const row of stale.rows){
      if(await failGoal(client,row.id,"PLANNING_INTERRUPTED",{error:"Planning did not finish within the recovery window; no successful plan was recorded"})) ids.push(row.id);
    }
    return ids;
  });
}
