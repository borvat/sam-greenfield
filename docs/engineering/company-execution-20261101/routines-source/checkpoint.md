# Executive routines, levels and reviewed skills — source checkpoint

Baseline: `01e712ed5a7689a7186c8675c2b50e9bfac76753`. Isolated source development only. Parent owns coordination, independent review/verifier and any authorized GitHub publication. No commit is made by this implementer.

## Source slice

The existing daily/weekly scheduler now selects the latest due local-calendar date by actual instant, including the first occurrence of a DST fold and the first representable later minute of a clock gap. Default configuration remains 08:00 Asia/Damascus daily, Sunday 08:00 weekly. Older ungenerated missed periods are not backfilled; existing generated pending records retain their saved states. An existing report for the company/type/date is reused even if the schedule changes. Full skipped calendar dates return an explicit error rather than fabricate a planned instant.

Report generation remains local and model-free. Approved settings are required, settings-row locking plus the unique period key deduplicates concurrent/restarted ticks, and saved artifact/hash/timezone/planned/generated timestamps remain unchanged on repeat. Evidence includes persisted task/execution/verification/plan references, errors and the top three blocked decisions. Weekly achievements require current-plan matching-hash independent verification, with unknown sales/cash/shipments/cost coverage stated. Dates are serialized before hashing so native PostgreSQL Date values and stored JSON have the same canonical hash. No raw provider result, credentials or model prose is copied into reports.

Delivery requires both saved owner-approved channel/recipient references and a separately configured matching adapter. There is no default transport, credential or external endpoint. A durable SENDING token/attempt is committed before the adapter call; an adapter gets the report ID as its idempotency key plus an abort signal. Calls time out after 45 seconds, below the 60-second send lease. Exceptions/timeouts become UNKNOWN, expired SENDING records become UNKNOWN even with no adapter, and late/fenced completion cannot overwrite them. UNKNOWN is never automatically replayed. RETRY requires explicit `retrySafe:true` (meaning acceptance is known not to have occurred), backs off and stops after three attempts. ACCEPTED/CONFIRMED require an opaque receipt ID; transport acceptance does not imply owner confirmation. A stored artifact whose hash changed is FAILED before any send. A transport that ignores abort can still finish externally after timeout; this remains ambiguous and requires outside reconciliation, not a blind retry.

Five rank criteria now have an integrated but explicitly reviewed source path through the existing append-only audit log, with no new schema. Counts remain current-plan independently verified evidence within the latest 500 company queue items. Every observed executed/failed/in-flight queue item must have known linked ledger costs before cost-coverage review is eligible; empty/missing/unknown calls never become zero. An authenticated independent assessor must explicitly approve complete cost coverage and a nonnegative authority-breach assessment, cite existing same-company audit evidence, and submit the exact current source hash. Executors and their specialist identities cannot assess their own work. The audit record binds verification/ledger IDs and the source hash; changed execution/result/evidence, verification, plan or ledger data invalidates the displayed rank. No automatic assessment is created and no rank changes capability permissions. Assessments are human-reviewed assertions about the listed evidence, not an automated proof of external billing completeness or authority compliance. Missing data, incomplete review or fewer than five independent results keeps the rank unassessed. Review evidence must be available in the existing audit log; no assessment is configured here.

Skill proposal/review/adoption/pin-replacement operations now append safe pin/status/review-digest audit evidence in the caller's existing transaction. Replacing a source preserves previous/current pin metadata and the original review's digest in the audit history while invalidating review/adoption. The office shows current reviewed/adopted pins, reviewer/adopter, rollback reference and `NOT_INSTALLED`. It does not install, execute or dynamically register code. The Command Center's fixed owner identity still cannot independently review its own proposal; a separately authorized reviewer context is needed. Review/adoption records alone are not execution approval.

The existing Arabic office now reads persisted executive reports with coverage, hashes and delivery/receipt status and shows reviewed-skill metadata. No routine activation, proposal submission, skill execution or assessment is triggered by reading the UI. The new performance-assessment POST uses the same authentication, fixed company, feature-off and read-only denial guards as other company mutations.

## Focused checks

Combined affected run (8 tests PASS):

```sh
DATABASE_URL=postgresql://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/executive_reports.ts tests/isolated/company_staff.ts tests/isolated/company_office_ui.ts tests/isolated/command_center_company_gate.ts
```

After the final narrow actor-scope/stored-assessment hardening, only its affected file was repeated (2 tests PASS):

```sh
DATABASE_URL=postgresql://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/company_staff.ts
npm run typecheck
git diff --check
```

The new scheduler tests use real existing `00107` SQL inside PGlite fixtures, persisted restart/dedup states, DST clocks, scoped RLS, receipt/fencing/retry/ambiguity/hash checks and in-process adapters with mocked timeout timers. UI tests execute the embedded source with synthetic DOM/API data. No provider network call, real channel send or production database is involved. PGlite parallel calls do not establish native multi-connection lock/concurrency behavior; that remains independently reserved. Unaffected authentication, PR86 and rollback suites were not rerun. The parent verifier should execute the affected command against the final manifest hashes.

## Gates and boundaries

Both feature flags remain off by default. There is no configuration/activation or database migration in this task, and no new or edited migration file. Existing draft `00107` is loaded only into isolated disposable fixtures for tests. Existing intelligence remains synthetic/evaluation-only. No external messages, new service/cost, paid/model calls, production/main/push or `sam-rollback` changes occur. No actual delivery receipt, native deployment, live operational cycle, restoration/rollback or owner-browser visual acceptance is claimed. Existing backup/release blockers remain under the parent.

`source-manifest.json` pins the exact slice files; `secret-scan.json` records the final scoped full-file scan without history/whole-repository claims. Source readiness remains subject to independent review and verification.
