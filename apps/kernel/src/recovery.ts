import { withTransaction } from "../../../packages/db/src/client";
import { transitionGoal } from "./stateMachine";
import { reconcileExpiredLeases } from "./reconciliation";
import { wakeDueGoals } from "./continuation";

export async function reconcileFinishedPlansAfterRestart(limit = 100, goalIds?:readonly string[]): Promise<string[]> {
  return withTransaction(async (client) => {
    const rows = await client.query(
      `SELECT g.id
         FROM goals g
        WHERE g.state='EXECUTING' AND ($2::uuid[] IS NULL OR g.id=ANY($2::uuid[]))
          AND g.current_plan_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM work_queue w
             WHERE w.goal_id=g.id AND w.plan_id=g.current_plan_id
          )
          AND NOT EXISTS (
            SELECT 1 FROM work_queue w
             WHERE w.goal_id=g.id
               AND w.plan_id=g.current_plan_id
               AND w.status <> 'EXECUTED'
          )
        ORDER BY g.updated_at,g.id
        FOR UPDATE OF g SKIP LOCKED
        LIMIT $1`,
      [limit,goalIds??null]
    );

    const ids: string[] = [];
    for (const row of rows.rows) {
      await transitionGoal(
        client,
        row.id,
        "EXECUTING",
        "VERIFYING",
        "restart_reconciled_finished_plan"
      );
      ids.push(row.id);
    }
    return ids;
  });
}

export async function recoverKernelAfterRestart(goalIds?:readonly string[]): Promise<{
  expiredLeases: string[];
  dueGoals: string[];
  finishedPlans: string[];
}> {
  const expiredLeases = await reconcileExpiredLeases(100,goalIds);
  const dueGoals = await wakeDueGoals(100,goalIds);
  const finishedPlans = await reconcileFinishedPlansAfterRestart(100,goalIds);
  return { expiredLeases, dueGoals, finishedPlans };
}
