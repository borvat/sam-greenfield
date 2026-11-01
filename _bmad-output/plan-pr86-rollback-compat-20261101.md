---
title: Restore PR86 application rollback compatibility across00106
status: in-progress
route: full
route_source: auto
risk: high
baseline_revision: 8a08e6163516f30f37c65313134170744330c4f4
context:
  - '{project-root}/docs/engineering/review-recovery-progress-20261028.md'
---
<frozen-after-approval>
## Intent
Owner explicitly authorizes fixing the42P10 rollback root cause and independently testing real SQL in isolation; no production mutations until recoverable current backup and validated rollback pass. Keep forward release exact8a08e6163516f30f37c65313134170744330c4f4. Prepare separate pinned minimal rollback candidates derived from exact deployed runtime62ccbdbb94e080f22425f64396c894270ee551aa and surfaces1e4e21a773c88e2366915edd3bb2e307fddaa157. No company drafts, new DB/services/cost, main merge, grants/RLS/network/credentials changes or data deletion. User permits automatic routine progression and parallel independent staff development.
## I/O matrix
|Scenario|Expected|
|pre00106 first insert/replay|Save once, same id/hash; no schema error|
|post00106 first insert/replay|Save original revision1 once; preserve all rows|
|existing revision1+revision2|Return original revision1 consistently; never overwrite or confuse revised hash|
|changed report payload|Reject hash conflict as existing contract requires|
|new then rollback application|Old-compatible candidate runs actual report path after migration; all hashes/revisions unchanged|
|foreign company/mismatched provenance|Existing source binding and independent verification rejection retained|
</frozen-after-approval>
## Code Map
apps/production/src/hermesSourceFollowup.ts:saveAcceptedFollowupReport: pair ON CONFLICT breaks after00106 drops unique; fallback SELECT currently unqualified for revision. Inspect every caller/old report read/write before patching. Existing8a08 has triple target; do not modify forward release identity.
packages/db/integration-migrations/00101_goal_read_reviews.sql and00106_read_review_revisions.sql: actual SQL, unchanged.
tests/isolated/hermes_report_revision_sql.ts and hermes_source_followup_fixture.ts: reuse only relevant fixture patterns, do not rerun prior suites unnecessarily.
## Execution
Implement minimal compatible Hermes save SQL for baseline snapshots, not schema rollback: use conflict behavior that works with old pair and new triple unique, deterministic original report retrieval when revision2 exists, original hash/provenance checks unchanged. Inspect whether untargeted ON CONFLICT DO NOTHING plus original-revision selection via to_jsonb(row) is adequate; avoid unnecessary schema detection/helper frameworks. Prepare exact baseline-to-candidate patches and clean non-main Git candidate branches if safe; never deploy/push. Use actual function/code extraction in isolated PGlite tests, not just approximate SQL. Test scenarios above, including multiple revisions and byte-identical history. Produce source hashes, minimal diff evidence, runbook mapping old SHA/new fallback SHA, and identify remaining native/service/backup limitations. Dependency installation may use existing sam-company node_modules via temporary link (same locked dependencies), no new dependency needed. Make no changes in sam-company; that is another agent's worktree.
## Acceptance
Given exact old source and real00101+00106, candidate report save must pass both schemas and replay while original old source reproduces42P10 only post00106. Given revision2, candidate returns original id or safely rejects content mismatch without altering either report. Given source identity change, existing guards still reject. Runtime and surface candidate diffs must contain only this repair, and hashes/main/worktree source not mixed. Passing isolated SQL is not native/RLS/backup/live acceptance. Report every remaining blocker.
## Verification
Focused new node:test/PGlite only, affected function typecheck where needed, diff-check, independent reviewer+verifier later. Do not repeat unrelated successful baseline suites. Do not install/run external code or models. Parent owns backup access, production release gate, secret scan and final archive.

## Owner scope update and actual archive progress

2026-11-01: owner now conditionally authorizes exactly one temporary isolated Render PostgreSQL15 restoration destination with totalspend<=7USD, provided allcharges/billingbounds/deletion are verified beforecreation. This supersedes the historical no-new-DB/cost wording only in that bounded scope. Keep exact forward8a08e61; no main merge/GitHubbillingchange/PR97production release. Proceed automatically only inside satisfied gates.

NativePG15.19 clients were built locally from checksum-verified officialsource, without a service/securityoverride. Current Render logicalexport was downloaded privately; SHA256 matches copies, gzip/tar checks and native pg_restore fullSQLdecode independently pass. These establish archive readability, not database restoration, row/schema/ACL/RLS completeness or operationalrollback. See docs/engineering/restore-release-20261101/.

Existing inventory has no safe isolatedPG15 destination. Ordinarylocalunprivileged execution is denied; no bypass attempted. CurrentRenderAdmin/Hobby/deletecontrol eligibility is observed, but all-in7USD cannotbeproved: applicabletax/otherfees and DBhardspendcap/TTL are unverified. Independentfinancialreview rejects creation under the strict currentcondition. Noresourcecreated/cost/migration/deployment occurred. The narrow additionaldecision is toaccept a monitored<=24h estimate ratherthan provider-guaranteedallincap, or supply anenforcedfixedquote/safe existingnative target. Do not silentlyreinterpret this asfinancialapproval. OldpassingSQLtests andunchangedPR97tests were notrerun.

## Subsequent explicit owner approval and actual isolated execution

The owner subsequently accepted the absence of a provider hard spending cap and explicitly authorized ONE isolated temporary PostgreSQL15 resource, monitored USD7 operational budget, maximum24h, with mandatory verified deletion. This supersedes the preceding financial blocker only for this single restoration test. Existing production/no-main/no-PR97-release restrictions remain.

Resource `dpg-dbjpqkutlv9c73dup8lg-a` was created at2026-11-01T20:13:07Z; deletion deadline2026-11-02T20:13:07Z. Native PostgreSQL15.19 restore committed on this destination only. Archive-to-target sorted COPY bytes match all91tables/11034rows; temporary RLS changes rolled back and a fresh connection confirmed identical security metadata. Independent checker verified pinned hash pairs and execution receipts. ACL semantics replay passed with explicitly documented managed-provider/database-owner mappings and NOLOGIN source roles. Exact8a08 migration00106 committed on the disposable target with schema/constraint assertions, unchanged ACL/RLS/owners and DML counters; no production migration or release has occurred. Runtime/application rollback rehearsal and resource deletion are still pending. Latest observed temporary-resource unbilled amountUSD0.01 is not a final invoice. Customer data and credentials remain excluded from repository evidence.
