# Phase 5 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Verified learning gate from executions + independent verifications
- Deterministic VERIFIED world-fact supersession
- Semantic JSONB scope matching
- Evidence-bound memory observations
- Duplicate execution evidence does not inflate support count
- Operational/commercial memory requires repeated verified support before REINFORCED
- OWNER_DECISION / FORMAL_RULE require explicit approved insertion
- Explicit approved-rule supersession with prior rule marked SUPERSEDED
- Context assembly loads only VERIFIED facts and REINFORCED / APPROVED_RULE memory
- Newer INFERRED facts cannot override VERIFIED context
- FAILED verification cannot create world facts or reinforced memory
- Existing Phase 0/1/2/3/4 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against a brand-new isolated cluster with migrations 00001..00009 applied from zero.

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
- verified_learning.ts PASS
- final_acceptance.ts PASS

## Architecture invariants
- Models cannot directly promote memory into trusted context.
- Execution claims alone are insufficient for learning.
- Independent VERIFIED evidence is mandatory for execution-derived learning.
- Failed/inconclusive outcomes cannot poison learned context.
- VERIFIED world facts are append-only and superseded explicitly.
- Repeated verified support is required before operational/commercial memory is reinforced.
- Owner/formal rules do not auto-promote from observations.
- Approved rules are explicitly superseded rather than silently overwritten.
- Learning performs no external side effects.
- Existing kernel, authority, specialist, tool, reconciliation, and verification boundaries remain intact.

## External limitation
GitHub Actions remains blocked by the GitHub account billing lock. This is external to SAM code. Phase 5 is technically proven in a real PostgreSQL 15.17 environment; GitHub-hosted CI proof remains pending until billing is unlocked.
