# Corrected wire/accounting checkpoint — not general-agent readiness

Application: 1370842ad3d3f0ecf63ef5227e10386a69690b74 on
feat/bounded-goal-evaluation-release. Prior PR55 f9c74cc/evidence8a083bc remain
immutable. This checkpoint corrects reviewed wire caps and missing source/readback/
goal-iteration charges; it does not close the whole-path architecture gaps.

Changes: exact provider/model/endpoint allowlists; DeepSeek max_tokens; Qwen combined
output cap with its documented 10-token tolerance subtracted from the unchanged
reservation; unknown combinations denied. No model swap/interlock activation.
Source calls and independent readbacks each reserve/begin/finish durable tool work;
goal model decisions reserve iterations. Zero-budget actual-composition regressions
assert callbacks do not run. Same-service pause/restore is documented.

Commands:

```
node_modules/.bin/tsc --noEmit
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
node /tmp/sam-generic-harness/verify-full.cjs --output /tmp/sam-wire-budget-full-v3
```

The local targeted adapter and final budget tests pass. The initial new budget test
repeated denied verification ticks until the existing 45-second subprocess limit;
the final test runs each of the three enrolled goals once, preserving its negative
callback assertions. Initial failure retained. Typecheck is clean. Full exact-head
results below are authoritative rather than these precommit supplementary logs.

Two full attempts failed during dependency setup with ENOSPC, before application
tests. Both reports/logs are retained. Clearing disposable SAM verification image/
build caches resolved the isolated Docker storage exhaustion; repository files,
database volumes and published evidence were preserved. A diagnostic unpinned Node
image was pulled for df only and removed; the actual acceptance retains its original
pinned Node22 digest. No harness test/timeout/assertion was weakened. readiness.patch
is the previously documented source/pin relocation and authenticated TCP SELECT1.
GitHub Actions remains billing-blocked; this is external isolated acceptance.

Whole-path assessment and executable diagnostics are on audit/general-agent-completion
under docs/audits/general-agent-path. They reproduce a terminal capture mismatch and
cross-trial recovery mutation; document the incomplete composition graph, goal-scope/
coverage contracts, generic recovery, delegation/learning and capture gaps. A green
suite does not cover or clear those independently identified blockers. No readiness,
autonomous model quality, commercial success or production success is claimed.

No production access, grants, credentials, paid model calls, activation, merge or
deployment. Scoped principal availability remains unverified. Existing infrastructure
is retained. Live activation and new spending are not authorized by these fixtures.

## Exact-head full-suite result

PASS 59/59 stages. Started 2026-10-23T15:32:24.388Z; completed 2026-10-23T15:46:30.265Z.
Source tree `3deb7d17120aff5f72e4d48cae23a4fcc71c616b`. Node v22.23.4.
All 81 report artifact hashes recomputed and matched.
Source integrity and cleanup passed. No application changes after the tested head.
This does not clear the documented holistic blockers.
