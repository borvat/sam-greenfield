# Unified goal-family lifecycle checkpoint

Application: 9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 on feat/unified-goal-family.
Prior wire/accounting checkpoint 1370842 and its evidence a95e8e2 are unchanged;
PR55 f9c74cc and its audited evidence 8a083bc remain unchanged.

This evidence covers the disabled lifecycle integration, not delivery of the whole
general-agent objective. Read docs/fixes/unified-goal-family.md and the consolidated
assessment/contract on audit/general-agent-completion (5f0e5f4). Remaining obligations,
collection receipts, normalized union/chaining, safe recovery and full capability
composition must be completed and evaluated; a blocked nominal case is not success.

## Implemented/tested scope

- Actual runtime service + bootstrap + planner + reads + verification + reports +
  stop/drain, under the provisioned restricted fixture role. Same-company cancelled
  trial's due goal and events remain unchanged through startup and work ticks.
- Goal-scoped recovery, dependencies, outbox/event consumption; trial-only supervision
  explicitly does not claim tenant-wide operational coverage.
- Integration RLS and report SELECT/INSERT preflight; denied INSERT prevents callbacks.
- Raw receipt insertion/update revocation before/after final locks with knowledge off;
  existing derived replay, restricted-role knowledge and revocation races preserved.
- Durable tool/readback/iteration charges and evidence reservation links. Actual child
  reports seal/export/authenticate while the coordinator remains NEW. Missing operation
  links, nonterminal children, unsupported requirement citations and signature tampering
  are refused. Capture integrity is not objective fulfillment or model intelligence.

## Commands and failures retained

```
node_modules/.bin/tsc --noEmit
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/core/reviewReliability.ts
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/core/evidenceIntegration.ts
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
node /tmp/sam-unified-harness/verify-full.cjs --output /tmp/sam-unified-family-full
```

Supplementary precommit logs are in local/. The initial expanded lifecycle test hit
its old 45-second subprocess limit. The fixture subprocess limit is now 75 seconds;
provider/model/tool/trial production budgets did not increase. Expiry scenarios use
5-second fixture agent windows and wait for the recorded deadline rather than a
fixed 1.6-second delay after setup. All expiry assertions remain. A parallel local
schema run collided on pgcrypto extension lifecycle (digest function unavailable);
subsequent DB runs were sequential. These failures are retained, not counted as passes.

The external readiness.patch only relocates source/pin paths and waits for authenticated
TCP SELECT 1. Application test assertions/stages are not skipped. GitHub Actions is
billing-blocked; this is external isolated acceptance. Pinned Node 22 is retained.
No production data, credentials, grants, paid provider calls, activation, merge or deploy.

## Current full-suite result: FAIL, not stalled

Exact head 9dea66eadcdd0d3c8a080d1f974234f8a82c69d1: 27 stages PASS,
1 FAIL, 31 NOT_RUN. Run ended 2026-10-23T16:16:33.544Z; cleanup passed.
Failure: render-google-oauth-contracts, test isolated PostgreSQL: observation commits
next plan, final report gates completion and survives reconstruction. At
 tests/isolated/sam_google_review.ts:69, expected continue, actual blocked.
The PGlite fixture constructs minimal execution/verification tables and inserts
VERIFIED without execution/plan receipt hashes. The new raw-receipt gate requires
those real fields and integrity. Diagnosis: update this fixture to valid hashed
execution/verification records and preserve its rollback/continuation assertions;
do not bypass or weaken the raw-receipt gate. This correction is still pending.
No verifier process remains running, and no replacement full run was started.
