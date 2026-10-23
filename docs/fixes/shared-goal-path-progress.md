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

## Compatibility follow-up in progress (17:46 UTC)

`66c937fef92e42b7271e67a8f930bf62e9e4ea3c` full acceptance ended with 13 PASS, 1 FAIL, 46 NOT_RUN. All 49 legacy regressions passed; 12/13 core tests passed. `reviewReliability.ts` failed `assert(fired)` because its barrier recognized only the old scalar goal SQL, not the descendant-aware ANY form. The follow-up updates that exact barrier matcher; no revocation assertions are removed.

A separate opt-in profile implementation is being tested locally. It preserves the existing execution guard, permitting a NEW ancestor only when it is the live evaluation coordinator for the immutable enrolled owner, with matching tenant, active trial and owner deadline. It adds no roles, grants, RLS policies, credentials or startup activation. Existing production is unchanged. Application composition checks the exact invoker-rights function body and fixed search path before calls; a future reviewed release would require explicit operator application of this profile.

The shared path now completes one of the three fixture goals; the other two reach honest WAITING_EXTERNAL after verified source and derived executions. Their persisted review diagnostics are under investigation. This is FAIL, not nominal acceptance. The test's restricted-role PostgreSQL session disables JIT to avoid compilation overhead from repeated RLS queries; this is a synthetic harness setting, not a production configuration change. The orchestration test process limit is 150 seconds (outer runner 180); provider deadlines, 24-call total, 8-call owner limits, 20-tool ceiling and signed 300-second trial limit are unchanged.

The frozen checkpoint's full evidence remains at `/tmp/sam-shared-66c937f-full` pending durable packaging. No full pass or general-agent completion is claimed.

## Combined candidate (2026-10-23 18:11 UTC)

The earlier failure statuses above are retained as history, not current readiness claims. The current working candidate passed the actual shared-builder three-family fixture test at 18:10:26 UTC: 3 completed goals, 10 persisted executions, 18 source/readback reservations including one rejected transform, process SIGKILL and restart without duplicate source executions, 3 raw SOURCE_FACT knowledge records and no inference learning records, signed descendant capture and original obligations. Failed, waiting, cancelled and blocked owner snapshots retain historical assigned evidence while ordinary dispatch authorization rejects those states. Due review continuation is admitted only for the enrolled owner through existing bounded continuation accounting.

Bounded derived chaining now replays raw leaves and intermediate artifacts, with three artifact levels, cycle and visit limits, exact tenant/assignment scope and revocation checks. Its targeted PostgreSQL regression passed. The review revocation race suite passed, retaining insert/update assertions. Evidence projection prioritizes bound requested fields across records and checks the conservative evaluation envelope before reserving a model attempt; model deadlines and signed budgets are unchanged. Explicit known requested periods must match source context. Missing monetary semantics remain unknown.

These are scripted decision fixtures, not autonomous model-quality evidence. The full exact-head suite is pending. No production activation or model call occurred. The opt-in coordinator profile remains an unapplied production operator boundary; no existing production grants or security settings were changed. The local synthetic role uses JIT off only for test query performance. Capture tests use rollback-only terminal-state variants of the completed fixture ledger, not production goal mutation.
