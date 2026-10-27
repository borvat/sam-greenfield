# Independent reliability verification

Verified 2026-10-27 UTC against the working changes based on `e0eb20a6637b3ba4221172b341c8a27e156b9528`, using Node v24.22.1/npm 11.9.0. Read `plan-sam-reliability.md` and `/tmp/sam-reliability-review.diff` (SHA-256 `85210135cf2f829e2f8248234a68a6e10de43695de067bf1f351289be813f0c6`), then inspected subsequent fixes. This verifier changed only this report and `tests/isolated/sam_reliability_independent.ts`.

## Executed proof

All test commands ran from the repository root. The dummy URL below exists solely to satisfy module imports; test SQL uses isolated PGlite or explicitly stubbed clients.

```sh
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/hermes_analysis_contract.ts tests/isolated/hermes_business_report.ts tests/isolated/hermes_source_followup.ts tests/isolated/sam_google_review.ts tests/isolated/sam_reliability.ts deploy/reliability-test/startup.test.ts
```

Initial implementation: **47 tests, 47 passed, 0 failed, 0 skipped**, 41.892 seconds. Subsequent changes to affected retrieval/startup paths were rechecked below; unchanged Hermes suites were not repeated.

```sh
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/sam_reliability_independent.ts
```

Independent pre-fix baseline: **5 tests, 4 passed, 1 failed**, exit 1. The intended rejection of duplicate connection URL settings failed with `Missing expected exception`. `URLSearchParams.get()` validated the first `options`/`sslmode` value while the PostgreSQL driver consumes the last. Root fixed this by rejecting duplicate URL keys. The same retained test now rejects both duplicated fixed-scope options and duplicated TLS settings.

```sh
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/sam_google_review.ts tests/isolated/sam_reliability.ts tests/isolated/sam_reliability_independent.ts tests/isolated/command_center_reports.ts deploy/reliability-test/startup.test.ts
npm run typecheck
```

Final affected run after optional-table/RLS metadata, enrollment and startup fixes: **20 tests, 20 passed, 0 failed, 0 skipped**, exit 0, 5.308 seconds. Fresh final typecheck: **exit 0**, no TypeScript errors. `git diff --check` also passed. An intermediate affected run was 19/20 because this verifier's old permission stub lacked the new `present` field; the independent test now uses real PGlite role/ACL changes, and the final run above passed.

## Behaviors checked

- V2 accepts only one to eight unique scalar references; arbitrary summary/comment fields, unsupported contextual/object references, malformed output and size overflow fail. Code derives facts and unknown values; 43 source products versus 30 submitted products and full-source totals remain explicit. Source/receipt binding, tamper rejection, rollback, deduplication and replay are exercised by synthetic integration fixtures.
- Bounded Arabic Gmail searches proceed without implicit research activation. Explicit invalid saved research plans fail before reservation/model invocation and retain sanitized actionable diagnostics. Independent tests enforce inbox-only/page-only caveats and preserve existing limitations.
- Continuation rejects absent proof, wrong company, exhausted/nonretryable usage, unfinished work, failed verification and existing reports. Positive preflight recovery and partially consumed retry preserve historical reservations; scheduling failure rolls state/outbox back. No continuation test invokes a model.
- Report/hash replay remains exact with zero execution; wrong-company/absent/earlier-plan RLS-hidden IDs reveal no report. PGlite role policies verify visible-only report and knowledge metadata. Missing/denied optional tables remain explicit. Operational memory keeps scope, timestamps and approval status; cross-company reinforcement is rejected.
- Notification polling returns only the authorized company's UNROUTED record, rejects tenant overrides/bad limits and reports permission denial without claiming push delivery. Google stored authorization does not claim a live probe or send authority.
- The emitted UI script parses through `node:vm`; a synthetic DOM exercises report ID/hash/summary/coverage/limitations/wait rendering through text content. Staging tests verify credential/autonomy stripping, opt-in, duplicate-setting rejection, monotonic lease expiry, read-only admission rollback, restricted principal/profile/public-ACL checks, and absent/wrong synthetic enrollment rejection.

## Proof limits and deployment blockers

These are **local synthetic, stub, PGlite and local HTTP results**. The Gmail test named “isolated PostgreSQL” uses PGlite. Hermes/bol responses and model receipts are injected fixtures. Conditional private-source/rejected-output replay tests were not activated; zero registered skips does not prove those scenarios.

No live service, model, business database, paid resource or external write was used by this verifier. No native PostgreSQL role deployment, real Google/provider operation, real browser layout, container build/replacement or hosted persistence was proved. Startup principal/profile tests use SQL-response stubs; PGlite RLS/ACL tests do not replace hosted admission evidence. Public staging surfaces are read-only, while the selected maintenance composition still performs isolated kernel/supervisor maintenance.

Root separately reported that the hosted test role `sam_eval_runtime_20261024` expired at `2026-10-26T23:09:02.511Z` and knowledge is feature-disabled. Those are deployment blockers reported by root, not native checks independently performed here. All final local checks above pass; hosted acceptance remains outstanding.
