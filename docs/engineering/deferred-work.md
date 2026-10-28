- source_plan: plan-sam-reliability.md
  summary: Historical reports from earlier plans may be hidden by the existing fixed integration RLS.
  evidence: integrationProfile.ts requires goal.current_plan_id=report.plan_id. The owner forbids weakening RLS; preserve policy and expose visibility limits. Any future history-access design needs separate review and authorization, not an implicit grant.
- source_plan: plan-sam-reliability.md
  summary: Bounded testing and owner-approved production promotion passed; email recovery and disabled integrations remain separately scoped.
  evidence: Owner approved one existing-service resume and existing-role renewal ending 2026-10-28T01:00:25.521Z. Native protected reads, report replay and memory persistence across distinct Render containers passed. A later explicit owner decision authorized promotion; all three production services passed acceptance. No automatic test renewal or original email replay occurred. The expired test was re-suspended. See hosted-reliability-evidence.json and production-promotion-evidence.json.
