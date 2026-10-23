# Read-review reliability acceptance evidence

Application base: `26c50497fd9cbe37b3abfe44753d281b00a07605`.
Final application commit: `3a00d1db402bf2dad80d5cd8002789754860edcf`.
Draft PR: https://github.com/borvat/sam-greenfield/pull/53

This evidence branch adds documentation/logs only after the application commit.
All runs are local synthetic acceptance, not hosted CI or live task evidence.
GitHub Actions remains unavailable because of billing. No production access,
model provider requests, current-goal mutation, merge or deployment was performed.

## Final result

**PASS: 59/59 stages** on exact clean application commit
`3a00d1db402bf2dad80d5cd8002789754860edcf`, 2026-10-23
05:17:59.482–05:30:00.162 UTC. See [full report](final/report.md),
[machine-readable report](final/report.json), [logs](final/logs), and
[artifact hashes](final/SHA256SUMS). Every artifact hash verified successfully.
Source integrity and cleanup passed; no unresolved defects were reported.
Pinned runtimes: Node 22.23.4 and PostgreSQL 15.19.

Targeted checks: typecheck PASS; core reliability 10/10 files PASS; unchanged
restricted-role integration orchestration PASS; isolated Google review 2/2 PASS.
The full acceptance core stage includes the new review-reliability regression.
The only excluded categories are hosted GitHub/merge governance and
staging/production/live providers/paid models/customer data. No application
acceptance stage was skipped. The separate evidence commit is documentation only;
the Draft PR application head remains exactly the tested commit.

## Commands and isolated harness

```sh
node /tmp/sam-planning-harness/verify-full.cjs --output /tmp/sam-review-full-v2 > /tmp/sam-review-full-v2.log 2>&1
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:review-test-fixture@127.0.0.1:55439/sam_core_test npm run test:core-reliability
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:review-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node --import tsx --test tests/isolated/sam_google_review.ts
npm run typecheck
```

All database passwords above are disposable synthetic fixture values.
The external runner is the repository's `scripts/testing/verify-full.cjs` with
only the attached `readiness.patch`: root/pins point to the checkout and readiness
requires successful authenticated TCP `SELECT 1`, instead of the temporary
initialization server's Unix-socket pg_isready response. Retries and timeouts are
unchanged. No application checks are removed or skipped. The runner snapshots the
clean exact commit and uses pinned Node/PostgreSQL containers. Local targeted
runs use host Node 24; the full report records pinned runtime versions and hashes.

## Initial failure and correction

`initial-failed/` is the unmodified full-run artifact set for
`662e38ef3a0f29d70fd449b73beef7a9efcdffaa` (run ID
`sam-verify-1792732156177-8799d080`). It failed at integration orchestration:
`tests/integration/scenario-worker.ts:87` expected `COMPLETED`, actual
`WAITING_EXTERNAL`; the parent assertion `restricted worker execute` expected
exit 0, actual 1. Cleanup passed. Remaining stages were not run.

The reservation upsert required UPDATE on `goal_read_reviews`, but the existing
restricted integration role deliberately has SELECT/INSERT only. This was a
regression in the new implementation, not attributed to the base. The correction
stores only runtime budget metadata in existing append-only audit records and
inserts a terminal report atomically once. No permission grants changed. The
unchanged restricted-role integration test passes after this correction.

The isolated Google review test still asserts atomic follow-up/report storage;
it now asserts a durable audit reservation survives rollback and no terminal
report is inserted on rollback. Its synthetic critique-rejection scenario resets
its fixture budget along with its deleted report, and explicitly asserts the
critic is called, so exhausted-budget blocking cannot mask that assertion.

## Limits

Calls retain a 40-second ceiling, 80 seconds per review attempt, at most two
attempts/four calls per plan. Continuation reuses verified executions without
replanning or new source work. Legacy reports without a recorded budget remainder
are rejected with `REVIEW_BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION`; the existing
live legacy goal requires a separately reviewed bounded authorization. This PR
does not grant/reset that allowance or bypass GOAL_CONTRACT_REQUIRED.

Structured projection retains essential fields and caveats, samples whole detail
items with explicit omissions, and derives no aggregates. Missing/unrecognized
EUR/VAT/coverage or matching sales period blocks monetary completion. Unsupported
valid evidence structures may conservatively block and need a reviewed contract
extension. Synthetic success cannot establish live provider timing or task success.
