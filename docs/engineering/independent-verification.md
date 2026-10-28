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

No live service, model, business database, paid resource or external write was used by this verifier. At that local stage, native PostgreSQL role deployment, real Google/provider operation, real browser layout, container replacement and hosted persistence were not proved; subsequent root-observed native evidence is recorded below. Startup principal/profile tests use SQL-response stubs; PGlite RLS/ACL tests do not replace hosted admission evidence. Public staging surfaces are read-only, while the selected maintenance composition still performs isolated kernel/supervisor maintenance.

Root separately reported that the hosted test role `sam_eval_runtime_20261024` expired at `2026-10-26T23:09:02.511Z` and knowledge is feature-disabled. That was the initial deployment state reported by root, not a native check independently performed here. The renewal and completed bounded hosted acceptance below supersede that initial state; execution knowledge remains intentionally disabled.

## 2026-10-28 native acceptance plan and additional local check

The owner renewed the existing restricted role, and root reported an expiry of `2026-10-28T01:00:25.521Z`. This supersedes the previous expired-role blocker; this verifier did not handle its credentials or perform renewal. Local `9f2ef44a856e0710abd5b5a75890b82fbfd68e3b` and deployed target `929593ff14c5ad33479a69826b394154d17fbab3` have identical tree `5dde779836452470033f2f65e45b312070de13ce` before this additional test/report update.

One additional meaningful check was added to the independent test file, exercising the actual MCP HTTP server and SDK with synthetic database responses:

```sh
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test --test-name-pattern='staging MCP exposes' tests/isolated/sam_reliability_independent.ts
npm run typecheck
```

Result: **1 test, 1 passed, 0 failed, 0 skipped**, exit 0, 1.120 seconds; fresh typecheck exit 0. The check verifies the seven-tool read allowlist, read-only annotations, missing bearer 401, foreign Origin 403, exact scoped report replay, and denial of submit/continuation tools without any source/model call. This is local HTTP plus SQL-response stubs, not hosted evidence.

Root's native acceptance sequence, with this verifier reviewing forwarded sanitized output only:

1. Require `/readyz` 200, exact target revision, `services:[200,200,200]`, mode `SYNTHETIC_PERSISTENT_READ_ONLY`, zero model calls, and false live-reasoning/container-replacement flags. Match the UI Build revision. Root forwarded exactly this readiness result for deploy `dep-dbgjmi08v5cc73fs5be0`, LIVE at `00:03:01Z`, plus maintenance-only logs with planning/capability execution/external adapters disabled. **Root-observed startup/readiness passed; this verifier did not make the hosted request.**
2. Check unauthenticated `/api/goals` and `/mcp` return 401, foreign Origin returns 403, and public POST `/api/goals` returns 405. List exactly `sam_list_goals`, `sam_get_goal`, `sam_get_goal_timeline`, `sam_get_report`, `sam_memory_status`, `sam_recall_memory`, `sam_list_notifications`; all have read-only annotations. Submit and continuation calls must be denied.
3. Read one preexisting synthetic report twice by ID: identical decision/report hash, no new execution. Missing or RLS-hidden IDs must return null with `NOT_FOUND_OR_NOT_VISIBLE_UNDER_CURRENT_RLS`; authorized-read errors must not be described as absent records.
4. Inspect memory status and recall: engineering remains `SEPARATE_GIT_SYSTEM`; execution knowledge and notifications are intentionally `FEATURE_DISABLED` because startup strips integration flags. Operational memory must retain its company, statement, source, timestamps and approval status. Notifications must say `POLLING_ONLY` and `pushPerformed:false`.
5. Root alone handles the separately authorized synthetic sentinel. Compare its exact ID/hash/created timestamp before and after an independently evidenced container replacement. Same-process readback proves only readback; a code flag remaining `containerReplacementValidated:false` is expected and must not be promoted into persistence evidence. Retain the distinct container/deploy/boot identity alongside the matching row evidence.

The database role must still have more than five and no more than sixty minutes remaining at startup. Its monotonic lease includes import time and stops the staging process before expiry; no automatic renewal is permitted. A readiness array `[503,200,200]` points to runtime/dependency readiness; `[200,200,503]` points to Command Center database/entity-ACTIVE readiness. A 401/403 is an auth/host/origin failure before data access. `SCOPED_READ_UNAVAILABLE` is an unavailable read, not an empty result. Those were the pre-replacement acceptance criteria; the completed root-observed evidence follows.


## Completed bounded native acceptance, 2026-10-28

**Root-observed native acceptance passed.** This verifier read the updated sanitized `private-evidence/hosted-reliability.json`, checked its fields against root's forwarded output, and ran local assertions confirming their consistency (exit 0, `PASS ROOT_EVIDENCE_CONSISTENCY`). This verifier did not independently operate a hosted browser, open a database connection, use credentials or write a sentinel.

| Evidence | Initial deployment | Replacement deployment |
|---|---|---|
| Deployment | `dep-dbgjmi08v5cc73fs5be0` | `dep-dbgjpu88v5cc73fsg410` |
| Revision | `929593ff14c5ad33479a69826b394154d17fbab3` | `f859fda054f0d367c983e131feee6e6ddd7ae861` |
| Instance suffix | `55b5ff5fb7-g4jp4` | `6bc877c9fc-q97ck` |
| LIVE time, UTC | `00:03:01Z` | `00:09:05Z` |
| Readiness | All three services 200 | All three services 200; all health revisions match replacement |

The distinct service instances establish replacement rather than same-process replay. The replacement code matches inspected local `ba344f104fb596add765dfd965f0b31f9adb64cf`, tree `add7ef3bb27e0136a4eccbdf0f85100f8b9ba945`, as reported by root. Root's post-replacement shell acceptance marker was `POST_CONTAINER_REPLACEMENT_ACCEPTANCE`, `passed:true`.

- Synthetic memory ID `91f50960-3004-4833-86a0-1c9b00dcaf25` retained hash `00c73718b3d192f7aec140245092115c6758747b2f9f13f52d22722a8a308ae6` and creation time `2026-10-28T00:03:45.811Z` after replacement. Native readback and MCP recall agreed on the single matching visible record, company `2796e0d9-1701-4e53-a7ac-d198c0e44c01`, source `operator_synthetic_sentinel:reliability_20261028proof001`, status `OBSERVED`, synthetic true and owner-approved false.
- Existing synthetic report `b901c6c3-473f-4ab0-a25c-900205d9144d` retained hash `09dd65715597f890ae1855b5bac7abb3b3c3f77539a8a09c8b7faa636550d974`; repeated native MCP reads were identical before and after replacement, with `executionPerformed:false`. The foreign production report remained hidden.
- Exactly seven read tools were exposed; submit/continuation tools were denied. Unauthenticated goals/MCP returned 401, foreign Origin 403, public writes 405. After replacement, direct authenticated Command Center POST still returned 405; the actual browser showed the new revision/read-only banner and no creation form.
- Root reported zero model calls and unchanged production. No `WORK_TICK_FAILED` entries matched the bounded log search from `2026-10-28T00:02:50Z` through `2026-10-28T00:10:20.874411657Z`.

This proves the bounded synthetic row survived one real container replacement in the existing operator-bound PostgreSQL test storage, and that existing report retrieval remained exact. It does not prove indefinite retention, disaster recovery, live reasoning, Google/Hermes/provider success, or production behavior. Execution knowledge and notification integration remain disabled; stored observations remain unapproved. The role expiry stays `2026-10-28T01:00:25.521Z`, with no automatic renewal. Application health fields intentionally still say live reasoning/container replacement were not validated by the application itself; the replacement proof is the separate observed evidence above. Only the existing test service and explicitly authorized synthetic fixture were involved.
