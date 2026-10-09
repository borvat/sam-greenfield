import type { HealthSnapshot } from "./types";

async function count(client:any,sql:string,params:any[]=[]):Promise<number>{
  const res=await client.query(sql,params);
  return Number(res.rows[0].count ?? 0);
}

export async function captureHealthSnapshot(
  client:any,
  options:{
    staleGoalMinutes?:number;
    staleVerificationMinutes?:number;
    oldOutboxMinutes?:number;
    modelLookbackMinutes?:number;
    monitorSideEffects?:boolean;
  }={}
):Promise<HealthSnapshot>{
  const staleGoalMinutes=options.staleGoalMinutes ?? 30;
  const staleVerificationMinutes=options.staleVerificationMinutes ?? 15;
  const oldOutboxMinutes=options.oldOutboxMinutes ?? 5;
  const modelLookbackMinutes=options.modelLookbackMinutes ?? 15;

  const queuedReady=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM work_queue
      WHERE status IN ('QUEUED','HANDBACK')
        AND (due_at IS NULL OR due_at<=now())`
  );

  const expiredLeases=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM work_queue
      WHERE status IN ('LEASED','EXECUTING')
        AND lease_expiry IS NOT NULL
        AND lease_expiry<now()`
  );

  const staleActiveGoals=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM goals
      WHERE state IN ('MODELING','PLANNING','EXECUTING','REPLANNING')
        AND updated_at < now() - ($1 || ' minutes')::interval`,
    [staleGoalMinutes]
  );

  const staleVerifications=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM goals
      WHERE state='VERIFYING'
        AND updated_at < now() - ($1 || ' minutes')::interval`,
    [staleVerificationMinutes]
  );

  const oldPendingOutbox=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM outbox_events
      WHERE status='PENDING'
        AND created_at < now() - ($1 || ' minutes')::interval`,
    [oldOutboxMinutes]
  );

  const unresolvedSideEffects=options.monitorSideEffects===false?null:await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM side_effect_operations
      WHERE reconciliation_state='NEEDS_RECONCILIATION'`
  );

  const downProviders=await count(
    client,
    `SELECT COUNT(*)::int AS count
       FROM model_providers
      WHERE health='DOWN'`
  );

  const modelStats=await client.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE success=false)::int AS failures
       FROM model_calls
      WHERE created_at >= now() - ($1 || ' minutes')::interval`,
    [modelLookbackMinutes]
  );
  const recentModelCalls=Number(modelStats.rows[0].total ?? 0);
  const recentModelFailures=Number(modelStats.rows[0].failures ?? 0);
  const recentModelFailureRate=recentModelCalls===0 ? 0 : recentModelFailures/recentModelCalls;

  return {
    capturedAt:new Date().toISOString(),
    queuedReady,
    expiredLeases,
    staleActiveGoals,
    staleVerifications,
    oldPendingOutbox,
    unresolvedSideEffects,
    excludedMetrics:options.monitorSideEffects===false?["unresolvedSideEffects"]:[],
    downProviders,
    recentModelCalls,
    recentModelFailures,
    recentModelFailureRate
  };
}
