import type { HealthSnapshot,IncidentCandidate } from "./types";

export interface SupervisorPolicy {
  staleActiveGoalLimit:number;
  staleVerificationLimit:number;
  oldPendingOutboxLimit:number;
  unresolvedSideEffectLimit:number;
  expiredLeaseLimit:number;
  downProviderLimit:number;
  modelFailureRateLimit:number;
  modelFailureMinSamples:number;
}

export const DEFAULT_SUPERVISOR_POLICY:SupervisorPolicy={
  staleActiveGoalLimit:0,
  staleVerificationLimit:0,
  oldPendingOutboxLimit:0,
  unresolvedSideEffectLimit:0,
  expiredLeaseLimit:0,
  downProviderLimit:0,
  modelFailureRateLimit:0.5,
  modelFailureMinSamples:4
};

export function evaluateHealth(
  snapshot:HealthSnapshot,
  policy:SupervisorPolicy=DEFAULT_SUPERVISOR_POLICY
):IncidentCandidate[]{
  const incidents:IncidentCandidate[]=[];

  if(snapshot.expiredLeases>policy.expiredLeaseLimit){
    incidents.push({
      incidentKey:"runtime:expired_leases",
      severity:"CRITICAL",
      code:"EXPIRED_LEASES",
      title:"Expired worker leases require recovery",
      detail:{count:snapshot.expiredLeases}
    });
  }

  if(snapshot.staleActiveGoals>policy.staleActiveGoalLimit){
    incidents.push({
      incidentKey:"runtime:stale_active_goals",
      severity:"ERROR",
      code:"STALE_ACTIVE_GOALS",
      title:"Active goals are not progressing",
      detail:{count:snapshot.staleActiveGoals}
    });
  }

  if(snapshot.staleVerifications>policy.staleVerificationLimit){
    incidents.push({
      incidentKey:"runtime:stale_verifications",
      severity:"ERROR",
      code:"STALE_VERIFICATIONS",
      title:"Goals are stuck in verification",
      detail:{count:snapshot.staleVerifications}
    });
  }

  if(snapshot.oldPendingOutbox>policy.oldPendingOutboxLimit){
    incidents.push({
      incidentKey:"runtime:outbox_backlog",
      severity:"WARN",
      code:"OUTBOX_BACKLOG",
      title:"Old outbox events remain unpublished",
      detail:{count:snapshot.oldPendingOutbox}
    });
  }

  if(snapshot.unresolvedSideEffects>policy.unresolvedSideEffectLimit){
    incidents.push({
      incidentKey:"runtime:side_effect_reconciliation",
      severity:"CRITICAL",
      code:"SIDE_EFFECT_RECONCILIATION",
      title:"External side effects require reconciliation",
      detail:{count:snapshot.unresolvedSideEffects}
    });
  }

  if(snapshot.downProviders>policy.downProviderLimit){
    incidents.push({
      incidentKey:"runtime:model_providers_down",
      severity:"WARN",
      code:"MODEL_PROVIDERS_DOWN",
      title:"One or more model providers are down",
      detail:{count:snapshot.downProviders}
    });
  }

  if(
    snapshot.recentModelCalls>=policy.modelFailureMinSamples &&
    snapshot.recentModelFailureRate>policy.modelFailureRateLimit
  ){
    incidents.push({
      incidentKey:"runtime:model_failure_rate",
      severity:"ERROR",
      code:"MODEL_FAILURE_RATE",
      title:"Recent model failure rate exceeds policy",
      detail:{
        calls:snapshot.recentModelCalls,
        failures:snapshot.recentModelFailures,
        failure_rate:snapshot.recentModelFailureRate
      }
    });
  }

  return incidents;
}
