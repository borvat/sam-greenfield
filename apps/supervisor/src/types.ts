export type IncidentSeverity = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface HealthSnapshot {
  capturedAt: string;
  queuedReady: number;
  expiredLeases: number;
  staleActiveGoals: number;
  staleVerifications: number;
  oldPendingOutbox: number;
  unresolvedSideEffects: number|null;
  excludedMetrics?:string[];
  downProviders: number;
  recentModelCalls: number;
  recentModelFailures: number;
  recentModelFailureRate: number;
}

export interface IncidentCandidate {
  incidentKey: string;
  severity: IncidentSeverity;
  code: string;
  title: string;
  detail: Record<string, unknown>;
}

export interface ActiveIncident {
  incidentKey: string;
  severity: IncidentSeverity;
  code: string;
  title: string;
  detail: Record<string, unknown>;
  openedAt: Date;
}
