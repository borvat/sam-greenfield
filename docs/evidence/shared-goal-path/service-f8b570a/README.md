# Shared service exact-head acceptance

Application: `f8b570ac80158303993c3156872c76401ff965f9`, branch `feat/shared-service-entry`.
Tree: `d611d900909a5673db71d36fbff5e787a620dca7`. Clean exact-head full acceptance: **60/60 PASS**.
Started: 2026-10-23T18:19:55.462Z; completed: 2026-10-23T18:34:24.229Z.
All 88 report artifact hashes and 764 tracked source hashes were recomputed.

[Full report](full/report.md) · [Machine report](full/report.json) · [Manifest](SHA256SUMS) · [Trace verification](local/trace-verification.log).

- 49/49 legacy regressions; 14/14 core suites; 49/49 expanded isolated contract tests.
- Actual shared bootstrap and runtime service: three completed fixture goal families, startup/recovery, SIGKILL/restart, no duplicate source execution, rejected-transform repair, raw-only knowledge and signed descendant capture.
- Eight authenticated traces, 757 hash-chain events. The shared trace has 188 events and three declared completed children. The two deliberate incomplete/crash traces correctly retain FAIL / AUTHENTICATED_INCOMPLETE_CAPTURE; this is expected safety behavior.
- Node 22.23.4, pinned container images, local isolated PostgreSQL. GitHub Actions remains billing-blocked. No application tests skipped or assertions weakened.
- Only external harness changes: checkout/pins relocation and authenticated TCP SELECT 1 readiness. [Exact patch](readiness.patch).

## Application changes

The prior [39db476 checkpoint](../candidate-39db476/README.md) implements durable obligations, assignment-scoped descendant evidence, requested collection coverage, bounded union/chaining, raw fact capture and historical terminal-owner capture. Its [implementation matrix](../candidate-39db476/IMPLEMENTATION-AND-LIMITS.md) remains valid, except the service-entry gap is now addressed by this follow-up.

`apps/production/src/frozenSharedGoalEvaluationBundle.ts` contains the common frozen discovery/derive/specialist factory, previously defined in tests. `boundedEvaluationBootstrap.ts` binds existing reviewed providers while preserving trusted bundle identity, checks exact capability/verification contracts, then selects the shared composition. `apps/runtime/src/boundedEvaluationCompositionModule.ts` selects that same factory from the immutable signed case. `tests/evaluation/sharedPath.ts` now starts the actual runtime service rather than manually invoking a work loop. No goal-specific runtime formulas or commercial routing were added.

The local service-path log is pre-commit working-tree evidence; the full report above is the exact committed-head result. Earlier failed runs remain preserved under the checkpoint evidence folder and are not promoted to passes.

## Remaining boundaries

The entry is still release-disabled (`LIVE_EVALUATION_ENABLED=false`), absent from ordinary production selection, and accepts frozen sources only. No production activation, model calls, grants/security changes, credentials, merge or deployment occurred. Disposable fixture roles/profiles are provisioned only inside isolated test databases.

A production evaluation would require separate reviewed application of the explicit coordinator compatibility profile, existing scoped integration/specialist/evaluation access, existing independent verification rows for records.search / derive_verified_evidence / reason.records, a fixed-version signed trial and trusted approval, and the existing-service pause/restore procedure. No current production principal's evaluation access has been established. The child did not inspect credentials or bypass blocked access.

Scripted model decisions prove wiring and safety only. Autonomous interpretation/composition quality is NOT evaluated. Real Google MCP structured extraction and monetary/VAT/period/coverage guarantees remain explicit unknowns where checked-in contracts are opaque. This candidate does not claim the full general-agent objective is proven in live use.
