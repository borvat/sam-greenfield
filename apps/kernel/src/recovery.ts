import { withTransaction } from "../../../packages/db/src/client";
import { transitionGoal } from "./stateMachine";
import { reconcileExpiredLeases } from "./reconciliation";
import { wakeDueGoals } from "./continuation";

export async function reconcileFinishedPlansAfterRestart(limit = 100): Promise<string[]> {
  return withTransaction(async (client) => {
    const rows = await client.query(
      `SELECT g.id
         FROM goals g
        WHERE g.state='EXECUTING'
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
      [limit]
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

export async function recoverKernelAfterRestart(): Promise<{
  expiredLeases: string[];
  dueGoals: string[];
  finishedPlans: string[];
}> {
  const expiredLeases = await reconcileExpiredLeases();
  const dueGoals = await wakeDueGoals();
  const finishedPlans = await reconcileFinishedPlansAfterRestart();
  return { expiredLeases, dueGoals, finishedPlans };
}
