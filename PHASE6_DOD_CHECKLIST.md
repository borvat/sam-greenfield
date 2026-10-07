# Phase 6 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Deterministic runtime health snapshot
- Operational thresholds for stale goals, stale verification, expired leases, outbox backlog, unreconciled side effects, provider health, and model failure rate
- Append-only incident lifecycle in audit_log
- Deduplicated INCIDENT_OPENED records
- INCIDENT_RESOLVED records only after the triggering condition clears
- Durable incident outbox events for downstream alerting
- Structured owner-facing operational brief
- Model-independent health supervision
- Shared-database-safe acceptance coverage
- Existing Phase 0/1/2/3/4/5 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against a brand-new isolated database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- 6/6 suites PASS

Phase 3:
- 4/4 suites PASS

Phase 4:
- 2/2 suites PASS

Phase 5:
- 2/2 suites PASS

Phase 6:
- operational_supervision.ts PASS
- policy_evaluation.ts PASS
- final_acceptance.ts PASS

## Architecture invariants
- Supervisor performs no business side effects.
- Incident state is append-only.
- Duplicate supervisor ticks do not duplicate already-open incidents.
- Incident resolution requires the health condition to clear.
- Health evaluation is deterministic and does not depend on a model.
- Critical faults remain visible even when model providers are unavailable.
- Incident events are published durably through the outbox.
- Existing Kernel, Brain, Specialist, Tool, Verification, Reconciliation, and Learning boundaries remain intact.

## External limitation
GitHub Actions remains blocked by the GitHub account billing lock. This is external to SAM code. Phase 6 is technically proven in a real PostgreSQL 15.17 environment; GitHub-hosted CI proof remains pending until billing is unlocked.
