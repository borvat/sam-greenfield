# Generic review input budgeting evidence

Application base: `d08b1041c982c88bc43353a6ea4658c77d7a38df`.
Application head: `49ec0ebd0ff979587d6600ca9c00754679b52adb`.
Draft PR: https://github.com/borvat/sam-greenfield/pull/54

This separate evidence branch adds documentation and logs only. No application
changes follow the tested application commit on this branch.

## Final acceptance result

**PASS 59/59 stages**, exact clean application commit
`49ec0ebd0ff979587d6600ca9c00754679b52adb`, started 2026-10-23
05:54:01.830 UTC, completed 06:06:25.313 UTC. No unresolved defects reported.
See [report](full/report.md), [machine report](full/report.json),
[logs](full/logs), and [hash manifest](full/SHA256SUMS). All artifact hashes
verified. Pinned Node 22.23.4 / PostgreSQL 15.19; source integrity, restricted-role
orchestration, tenant isolation, fail-closed security, image/startup/restart and
cleanup all passed. The disposable local fixture database was stopped afterward.
Only hosted GitHub/merge governance and live/staging/production/paid-provider checks
were outside scope; all 59 local application acceptance stages ran.

## Local commands

```sh
npm run typecheck
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:input-test-fixture@127.0.0.1:55439/sam_core_test npm run test:core-reliability
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:input-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/core/reviewReliability.ts
DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node --import tsx --test tests/isolated/sam_google_review.ts
node /tmp/sam-planning-harness/verify-full.cjs --output /tmp/sam-input-full > /tmp/sam-input-full.log 2>&1
```

All shown credentials are disposable local fixture values. The full runner uses
the repository verify-full.cjs with only the attached readiness.patch: external
root/pins paths, and TCP authenticated SELECT 1 readiness rather than accepting
the PostgreSQL temporary initialization socket. Retry counts/timeouts and all
application tests are unchanged. No test stage is weakened or skipped. The full
runner snapshots the exact clean application commit into isolated pinned
containers and records runtime versions, source integrity and cleanup.

Local typecheck PASS; core reliability 10/10 files PASS; isolated Google review
2/2 PASS. New synthetic four-source prompt sizes are 21,006 bytes (proposal) and
18,665 bytes (critique), including the existing taskPrompt wrapper. Both are below
the 48,000-byte ceiling. These are not token counts, live task measurements, or a
latency guarantee. Sources include large analysis/products, order listings, stock
and settlement invoice shapes. Twenty-source coverage, Unicode/escaping budget
checks, no-call oversize handling, critique oversize suppression, essential
metadata/provenance retention and honest monetary blocking also pass.

The one-line integration scenario fixture adaptation reads lines[0] instead of
lines[0].text to match the compact string-array contract; all assertions and
restricted runtime permissions remain unchanged. Existing isolated continuation
and citation tests are unchanged and pass.

## Scope and remaining limitations

This is a generic model-context reliability change, not a task-specific workflow,
bol sales solver, scripted tool sequence or special prompt for the live goal.
Dynamic capability selection and follow-up read schemas remain in the reviewer
input. The 16,000-character evidence allowance is shared equally across sources;
a source whose essential metadata cannot fit its share blocks honestly. Large
schemas/history/report content may hit the global limit and block rather than
silently discard constraints. Unused evidence shares are not redistributed.

The parent's live diagnosis found quantities/stock, no prices in order lists and
no invoice results. Those sources cannot establish EUR/VAT. The existing monetary
completion gate remains unchanged except for an actionable missing-data reason.
The local bol_get_order contract is GREEN/read-only and accepts order_id; the
adapter returns the raw GET /orders/{id} response and the client types it any.
No output price, currency or VAT field is guaranteed by that contract. This is a
catalog/schema gap for reliable dynamic composition, not proof the upstream API
lacks money fields. Returned money would still require explicit semantics and
complete requested-period coverage. No financial calculation or new capability
was added, and no live API calls were made to investigate it.

Forty-second call deadlines, two attempts/four calls, models, permissions,
acceptance contracts and legacy budget rules remain intact. No old-goal replay,
budget reset, production access, live provider calls, merge or deployment occurred.
GitHub Actions is billing-blocked; this evidence is local synthetic acceptance,
not hosted CI or proof of commercial/live objective completion.
