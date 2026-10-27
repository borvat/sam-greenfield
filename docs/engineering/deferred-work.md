- source_plan: plan-sam-reliability.md
  summary: Historical reports from earlier plans may be hidden by the existing fixed integration RLS.
  evidence: integrationProfile.ts requires goal.current_plan_id=report.plan_id. The owner forbids weakening RLS; preserve policy and expose visibility limits. Any future history-access design needs separate review and authorization, not an implicit grant.
- source_plan: plan-sam-reliability.md
  summary: Hosted acceptance needs an explicitly resumed existing test service and valid existing test-login lease.
  evidence: service is suspended; read-only application-host inspection confirmed the old role expired. No role/window renewal, deployment or container replacement was performed. Prepared exact rollout and synthetic sentinel procedure are in deploy/reliability-test/.
