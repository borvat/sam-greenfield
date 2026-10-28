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

The local test runs above used no live service, model, business database, paid resource or external write. At that local stage, native PostgreSQL role deployment, real Google/provider operation, real browser layout, container replacement and hosted persistence were not proved; subsequent root-observed native evidence is recorded below. Startup principal/profile tests use SQL-response stubs; PGlite RLS/ACL tests do not replace hosted admission evidence. Public staging surfaces are read-only, while the selected maintenance composition still performs isolated kernel/supervisor maintenance.

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

## Production promotion baseline and clearance, 2026-10-28

The owner separately authorized promotion of reviewed application revision `f859fda054f0d367c983e131feee6e6ddd7ae861` to the three existing production services, with no model/Hermes admission, email resumption, main merge or configuration changes. This does not inherit the staging read-only environment: normal Runtime has no persistent pause gate.

This verifier performed four read-only calls through the connected production SAM plugin: system status, the exact parked email goal, its stored timeline, and the exact existing report goal's stored timeline. No source capability, submission, continuation, credentials, browser or configuration operation was used. The connected baseline was:

- System counts: 17 active goals, zero active work, one pending approval, zero unresolved side effects and zero down model providers; no revision metadata yet from the old service.
- Email goal `53424b11-c854-40e4-a264-14af2b7d33b0`: `WAITING_EXTERNAL`, null wake time, current plan `c3a09dab-968f-4e44-9a25-39db8d2278f6`; exactly two EXECUTED work/execution rows and two VERIFIED rows; no report, review-budget entry or diagnostic. No preflight recovery proof exists in that timeline, so absent budget must remain fail-closed.
- Report goal `c8346c6c-67ef-412e-9689-5e94acd31fba`: COMPLETED, null wake time. Report `1ed20021-9b0d-47f8-904b-cd72e3d0846f` retains hash `b7f7602baf275cc8c2a604e230859b22477c99fab64ec1f11f24d66cd6031de7`; authorized execution `c3db36d6-d55e-4b9e-8a83-3fa17529ce3f` and verification `fb93d579-81a7-4e50-9b23-2c14f343551a` are present. Raw responses are retained in this verifier's session for later comparison; source contents were not re-fetched.

Coarse counts alone did not clear a normal Runtime restart. Root then forwarded an actual native read-only transaction baseline, rolled back without mutation: 369 COMPLETED, 30 FAILED, 16 WAITING_EXTERNAL, one WAITING_OWNER; zero planning candidates/future retries, VERIFYING/EXECUTING goals, scheduled waits, active work, pending outbox/wake events and unresolved effects. The model ledger was 29 rows with reserved amount 0.75; review-budget history contained nine entries. `financeTickConfigured:false` was established from presence booleans only for its four prerequisites, without exposing values or secrets.

Independent assessment: that native baseline clears Command Center then MCP, with Runtime last **only if the same zero-eligibility/finance gate is freshly rechecked immediately before restarting Runtime**. This is point-in-time clearance, not an execution pause; a later incoming goal/event can make ordinary work eligible. Post-deployment acceptance must match the exact revision on all three health surfaces, retain authentication, preserve the original report/hash and parked email timeline, and leave model-ledger/reservation/review-budget counts unchanged after normal ticks. Production post-deployment acceptance is pending at this baseline checkpoint.


## Independent production MCP acceptance after promotion

At 2026-10-28T00:40:26.336255Z, this verifier independently made three connected SAM reads: system status and the same two authorized stored goal timelines. No company/source capability, model, submission, continuation, configuration, credentials or browser operation was used.

- MCP status reports exact revision `f859fda054f0d367c983e131feee6e6ddd7ae861`, revision status KNOWN. Counts remain 17 active goals, zero active work, one pending approval, zero unresolved side effects and zero down providers. Root identified this production deployment as `dep-dbgk81m7bikc73ae2ok0`, LIVE at `2026-10-28T00:39:15Z`.
- Report `1ed20021-9b0d-47f8-904b-cd72e3d0846f` retains exact hash `b7f7602baf275cc8c2a604e230859b22477c99fab64ec1f11f24d66cd6031de7`. The entire returned report serializes identically to the saved pre-promotion response; its goal remains COMPLETED/null wake, and all returned work, execution and verification arrays are unchanged.
- Email goal `53424b11-c854-40e4-a264-14af2b7d33b0` remains WAITING_EXTERNAL/null wake under the same plan. Its two work rows, two execution rows and two verified rows are unchanged; reports, review-budget entries and review diagnostics remain absent.

**Independent connected MCP acceptance passed.** This is not clearance of all three production services. Root reported that Command Center's owner-level login is correctly rejected by `RELEASE_APPLICATION_ROLE_UNSAFE`; it needs the owner's secure binding to the existing restricted application role, without grants, DDL or a weakened guard. Runtime promotion remains subject to the fresh zero-eligibility/finance checkpoint and unchanged ledger counters after deployment. No new report/memory connector tools were exposed in the cached connected metadata, and this verifier made no connector changes.


## Independent comparison after production Runtime promotion

Root reported production Runtime deployment `dep-dbgk8ul9el5s73d1duf0` LIVE at `2026-10-28T00:41:29Z`, revision `f859fda054f0d367c983e131feee6e6ddd7ae861`, with new instance suffix `64b847fcdb-qqsqp`. Its fresh native read-only check retained the same goal states, zero eligible/future planning, reviews, executing work, scheduled waits, active work, pending outbox/wake events and effects. Model-ledger rows remained 29, reserved amount 0.75, review-budget entries nine, and automatic finance remained unconfigured. Root observed application role `sam_runtime_app`; no credential value was shared with this verifier.

At 2026-10-28T00:52:05.405997Z, this verifier independently repeated only connected system status and the same two stored goal timelines. Status returned the exact promoted revision/KNOWN and unchanged counts (17 active goals, zero active work, one approval, zero unresolved effects/down providers). Historical report `1ed20021-9b0d-47f8-904b-cd72e3d0846f` retained hash `b7f7602baf275cc8c2a604e230859b22477c99fab64ec1f11f24d66cd6031de7`; its complete returned reports, work, executions, verifications and audit arrays match the original pre-promotion response. Email goal `53424b11-c854-40e4-a264-14af2b7d33b0` remains WAITING_EXTERNAL/null wake under the same plan, with the same two work/execution/verification rows and no report, review budget or diagnostic. Its reports/work/execution/verification/audit arrays also match the original baseline exactly.

**Independent post-Runtime comparison passed**, supported by root's separate native unchanged-ledger/zero-eligibility evidence. No observed existing-goal resumption, new report or additional reserved model usage resulted in this bounded window. This verifier made three authorized read calls and no source, model, submission, continuation, configuration, browser or credential operation.

Command Center acceptance is still pending at this checkpoint. Root found an existing Blueprint service-to-service restricted database binding, so a user secret copy is no longer required; its proposed configuration change is being reviewed separately. No guard relaxation, DDL/grants, main merge or new resource is part of this verification. MCP/Runtime acceptance does not by itself establish completion of all three services.

## Final production acceptance: all three existing services

**Production deployment and bounded read acceptance passed for all three services at application revision `f859fda054f0d367c983e131feee6e6ddd7ae861`.** The earlier Command Center blocker and pending checkpoints above are superseded by this final record. This verifier audited matching sanitized private/public production records (`docs/engineering/production-promotion-evidence.json`), with local assertions returning exit 0 and `PASS FINAL_PRODUCTION_EVIDENCE_AUDIT`.

| Production service | Successful deployment | LIVE time, UTC |
|---|---|---|
| MCP | `dep-dbgk81m7bikc73ae2ok0` | `00:39:15.971327Z` |
| Runtime | `dep-dbgk8ul9el5s73d1duf0` | `00:41:29.993502Z` |
| Command Center | `dep-dbgkfjs9v7es738fp7rg` | `00:55:12.404363Z` |

Root's final native HTTP checks returned 200 and the exact revision for every service; unauthenticated Command Center goals returned 401. The CC owner-role guard remained intact. The existing Blueprint applied only two reviewed CC actions: restore its normal start command and reference the existing Runtime database connection inside Render. Sync `exe-dbgkeqmi0phs73amc9v0` exposed no secret value, generated no credential, changed no grants/schema/plans, and created no resource. Application branches remain pinned to the reviewed revision with automatic deployment/sync off and no main merge. The initially rejected old-path Blueprint validation was not applied.

Root's post-CC native read-only snapshot matches the preflight fields exactly: the same 369 completed, 30 failed and 17 parked goals; zero eligible/future planning, reviews, execution, scheduled waits, active work, pending outbox/wake events or effects; automatic finance unconfigured. Model-ledger rows remain **29**, reserved amount **0.75**, and review-budget entries **9**. The record reports zero new model calls, Hermes policy attempts or external business effects, with the email goal not resumed.

The final native production-role handlers fetched report `1ed20021-9b0d-47f8-904b-cd72e3d0846f` twice with the original `b7f7602baf275cc8c2a604e230859b22477c99fab64ec1f11f24d66cd6031de7` hash, identical content and `executionPerformed:false`. Its `HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED` marker correctly preserves the original narrative without retroactive validation. CC's actual database timeline returned that same hash. Operational memory is AVAILABLE with zero currently visible records; the staging synthetic nonce returns no production record. Execution knowledge and notifications remain FEATURE_DISABLED, with notifications POLLING_ONLY and push false. Connected Google status says no live probe was performed and send capability is NOT_AUTHORIZED; the capability manifest contains 84 capabilities and no Hermes capability.

Evidence origins remain distinct. This verifier's direct connected pre-/post-MCP and post-Runtime comparisons established unchanged report, work, execution, verification and audit arrays and the parked email goal. They were not repeated after the CC-only binding fix. Root observed the final native database-handler, HTTP, configuration and public-browser results; this verifier audited that record without additional hosted access. Cached ChatGPT metadata does not yet expose the new report/memory tool names, so native handler success is not claimed as a new connected-tool invocation. The browser showed the correct production Build and AUTH_REQUIRED with the normal creation form; **an authenticated Command Center browser session was not verified**. No live model/provider reasoning, company source re-fetch, submission or continuation was used for acceptance. The checks cover this deployment window; normal Runtime remains capable of processing later eligible work.

The temporary test role expired at `2026-10-28T01:00:25.521Z`. Root re-suspended the existing test service after expiry and verified suspension, retained PostgreSQL data, and left production services running. No automatic role renewal or further test resumption is part of this result.
