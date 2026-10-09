import type {PoolClient} from "pg";
import {insertOutboxEvent} from "../../../packages/db/src/outbox";
import {canTransition,transitionGoal} from "./stateMachine";
import type {GoalState} from "../../../packages/shared/src/types";

// Opt-in release contract. Unconfigured original compositions retain their
// existing behavior; malformed configured limits always fail closed.
export function leaseAttemptLimit():number|null {
  const raw=process.env.SAM_WORK_LEASE_MAX_ATTEMPTS;
  if(raw===undefined)return null;
  if(!/^[1-9][0-9]?$/.test(raw)||Number(raw)>20)throw new Error("LEASE_ATTEMPT_LIMIT_INVALID");
  return Number(raw);
}
export async function stopExhaustedLease(client:PoolClient,work:{
  id:string;goal_id:string|null;fencing_token:number
}):Promise<void>{
  const stopped=await client.query(`UPDATE work_queue SET status='FAILED',lease_owner=NULL,
    lease_timestamp=NULL,lease_expiry=NULL,wake_reason='LEASE_ATTEMPTS_EXHAUSTED'
    WHERE id=$1 AND fencing_token=$2 AND status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')
    RETURNING goal_id`,[work.id,work.fencing_token]);
  if(stopped.rowCount!==1)throw new Error("LEASE_BUDGET_FENCE_CHANGED");
  const goalId=stopped.rows[0].goal_id;
  if(goalId){
    const goal=(await client.query("SELECT state FROM goals WHERE id=$1 FOR UPDATE",[goalId])).rows[0];
    if(goal&&canTransition(goal.state as GoalState,"FAILED"))
      await transitionGoal(client,goalId,goal.state,"FAILED","lease_attempt_budget_exhausted");
  }
  await insertOutboxEvent(client,{aggregateType:"work_queue",aggregateId:work.id,
    eventType:"WORK_ATTEMPTS_EXHAUSTED",payload:{fencing_token:work.fencing_token}});
}
