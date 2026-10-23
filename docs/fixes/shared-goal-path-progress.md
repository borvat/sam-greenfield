# Shared goal path: work in progress

Base checkpoint: 5bfe7b8342756623f77f4c3d158a12b7435d32d1. Its audited 59-stage result does not cover this branch.

The disabled shared builder now assembles the ordinary goal planner, specialist engine, read adapters, verified derivation and objective review. Goal-agent reservations own specialist decisions and source/readback charges. Completed children are excluded from recovery admission; exhausted active owners terminate without resetting allowance. No startup registration, grants, provider calls or production changes are included.

The planner exposes and requires durable interpretation obligations. Parent review resolves only persisted specialist assignments with matching tenant, capability, parameters and plan authority. Continuations carry immutable prior assignment-plan hashes in a runtime-reserved field. Interpretations cannot alone fulfill source requirements. Original obligations are included in capture, including blocked review accounting.

Added bounded union without silent deduplication. Requested population coverage requires the exact bound query plus connected terminal pagination receipts and accounting for cited identities. Enumerated scope requires its exact identities. Unknown units/VAT remain gaps. This does not yet establish autonomous goal understanding.

Current validation: TypeScript check passes; 7 focused isolated tests pass (shared planner contract, interpretation rejection, union/requested scope, existing obligations and collection receipts). Full acceptance has NOT run for this working candidate.

Still required before readiness: actual three-family shared-builder lifecycle test; frozen discovery corpus and transport; derived chaining; descendant-aware authenticated capture; continuation/revocation/concurrency regressions; full exact-head acceptance and durable artifacts. Generic monetary fulfillment must be integrated without weakening the legacy evidence guard. The current branch is not a release candidate and does not complete the general-agent objective.

## Reproduced integration boundary (2026-10-23 17:31 UTC)

The restricted-role three-family test reached ordinary planning and specialist dispatch, consuming 6 fixture model decisions and reserving 3 source operations. Source execution persistence was rejected by the existing `specialist_execution_live_guard` with `SPECIALIST_EXECUTION_CANCELLED_OR_EXPIRED`.

The guard in `packages/db/specialist-migrations/00106_specialist_intelligence.sql:88` walks all goal ancestors up to depth 3 and rejects any state other than EXECUTING. The existing evaluation contract deliberately retains its coordinator in NEW, with three enrolled children underneath it. Thus a delegated source's ancestor chain includes that NEW coordinator. This is a concrete conflict between the existing specialist profile and the audited child-family evaluation contract, not provider latency or missing credentials.

No guard, RLS policy, grant, coordinator state, enrollment, or admission flag was changed to bypass this rejection. A narrow reviewed profile compatibility decision is needed: either recognize a trial coordinator only through immutable enrolled-child ownership while preserving all real specialist ancestor cancellation checks, or redesign coordinator ownership consistently across trial scope, execution admission and capture. Merely setting the coordinator EXECUTING would invalidate the audited contract and is not an accepted workaround.

The integrated nominal test remains FAIL. Its completion assertions are retained. Diagnostics are in `docs/evidence/shared-goal-path/diagnostics`. The first failure was a fixture request-envelope error (corrected); the second and third runs hit the 70-second test limit, with the third exposing the profile rejection. No live model calls or production access occurred. Additional independent scope/capture code and tests remain in progress; this is not general-agent readiness.
