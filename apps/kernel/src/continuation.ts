import {hasPreflightRecoveryEvidence} from './readReviewDiagnostic';
import {readReviewBudget} from './readReviewBudget';
import type { GoalState } from "../../../packages/shared/src/types";
import { withTransaction } from "../../../packages/db/src/client";
import { insertOutboxEvent } from "../../../packages/db/src/outbox";
import { transitionGoal } from "./stateMachine";

export async function scheduleContinuationAtomic(
  goalId: string,
  expectedState: GoalState,
  waitingState: Extract<GoalState, "WAITING_EXTERNAL" | "WAITING_OWNER" | "BLOCKED">,
  wakeAt: Date,
  reason: string
): Promise<void> {
  await withTransaction(async (client) => {
    await transitionGoal(client, goalId, expectedState, waitingState, reason, {
      next_wake_at: wakeAt.toISOString()
    });
    await client.query(
      "UPDATE goals SET next_wake_at=$2 WHERE id=$1",
      [goalId, wakeAt]
    );
  });
}

export async function wakeDueGoals(limit = 100): Promise<string[]> {
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT id, state, completion_definition, current_plan_id
         FROM goals
        WHERE next_wake_at IS NOT NULL
          AND next_wake_at <= now()
          AND state IN ('WAITING_EXTERNAL','WAITING_OWNER','BLOCKED')
        ORDER BY next_wake_at, id
        FOR UPDATE SKIP LOCKED
        LIMIT $1`,
      [limit]
    );

    const ids: string[] = [];
    for (const row of res.rows) {
      const from = row.state as GoalState;
      if(row.completion_definition==='sam.read_report.v1'&&from==='WAITING_EXTERNAL'){
        const review=(await client.query('SELECT decision FROM goal_read_reviews WHERE goal_id=$1 AND plan_id=$2',[row.id,row.current_plan_id])).rows[0];
        const budget=await readReviewBudget(client,row.id,row.current_plan_id);
        if(review||budget||await hasPreflightRecoveryEvidence(client,row.id,row.current_plan_id)){
        const retry=review?undefined:budget;
        if(retry?.retryable===true&&retry.attempts<2&&retry.callsUsed<4){
          await transitionGoal(client,row.id,'WAITING_EXTERNAL','VERIFYING','read_review_continuation_due');
          ids.push(row.id);
        }
        // Never send a completed-read report back through MODELING/planning.
        await client.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[row.id]);
        continue;
        }
      }
      await client.query(
        "UPDATE goals SET state='MODELING', next_wake_at=NULL, updated_at=now() WHERE id=$1",
        [row.id]
      );
      await insertOutboxEvent(client, {
        aggregateType: "goal",
        aggregateId: row.id,
        eventType: "GOAL_CONTINUATION_DUE",
        payload: { from, to: "MODELING" }
      });
      ids.push(row.id);
    }
    return ids;
  });
}


export async function wakeGoalFromEventAtomic(
  goalId: string,
  sourceEventSeq: number,
  sourceEventType: string
): Promise<boolean> {
  return withTransaction(async (client) => {
    const goal = await client.query(
      "SELECT id,state,completion_definition,current_plan_id FROM goals WHERE id=$1 FOR UPDATE",
      [goalId]
    );
    if (goal.rowCount !== 1) return false;
    if (!["WAITING_EXTERNAL","WAITING_OWNER","BLOCKED"].includes(goal.rows[0].state)) {
      return false;
    }

    if(await isWaitingReadReview(client,goal.rows[0]))return false;
    const from = goal.rows[0].state as GoalState;
    await client.query(
      "UPDATE goals SET state='MODELING',next_wake_at=NULL,updated_at=now() WHERE id=$1",
      [goalId]
    );
    await insertOutboxEvent(client, {
      aggregateType: "goal",
      aggregateId: goalId,
      eventType: "GOAL_WOKEN_BY_EVENT",
      payload: {
        from,
        to: "MODELING",
        source_event_seq: sourceEventSeq,
        source_event_type: sourceEventType
      }
    });
    return true;
  });
}

/** Generic events must not reset report-review budgets or repeat verified reads. */
export async function isWaitingReadReview(client:any,goal:any):Promise<boolean>{
 if(goal?.state!=='WAITING_EXTERNAL'||goal.completion_definition!=='sam.read_report.v1')return false;
 return Boolean(await readReviewBudget(client,goal.id,goal.current_plan_id))||await hasPreflightRecoveryEvidence(client,goal.id,goal.current_plan_id)||(await client.query('SELECT 1 FROM goal_read_reviews WHERE goal_id=$1 AND plan_id=$2',[goal.id,goal.current_plan_id])).rows.length>0;
}
