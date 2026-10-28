# Isolated UI acceptance checkpoint — 2026-10-28

Coordinator: root. Continue the original BMAD build plan `_bmad-output/plan-isolated-ui-acceptance-20261028.md`; no new project or general maintenance. PR86 stays Draft/open/unmerged. Baseline/evidence HEAD e90fc932f3456dd4c14ceaac662d155ba2393b3b. Production CC/MCP1e4e21a773c88e2366915edd3bb2e307fddaa157 and Runtime62ccbdbb94e080f22425f64396c894270ee551aa remain untouched.

## Actual acceptance

| Item | Result | Evidence/boundary |
| --- | --- | --- |
| ChatGPT discovers and invokes new reads | PASS | Actual Refresh tools UI, then actual session registry and calls to get_report (both saved reports), memory_status, recall_memory, notification_status, list_notifications. See chatgpt-discovery-acceptance-20261028.json. |
| Notification transient | Preserved, cause UNKNOWN | First parallel read returned SCOPED_READ_UNAVAILABLE / wrapper INVALID_ARGUMENT; identical serialized retry passed without code/config/permission change. No speculative repair. |
| Production login + both historical report UI reads | Prior PASS reused | cc-auth-diagnosis-20261028.md and cc-authenticated-ui-acceptance-20261028.json. No repeat login, analysis, mail collection or recovery. |
| Isolated browser save/recall/wrong-task/retry | UNRUN; authentication prerequisite | Reviewed candidate prepared. API/PGlite/catalog checks are not browser proof. |
| Isolated synthetic notification button/retry | UNRUN; same prerequisite | Reserved synthetic a1829450-3810-4aac-8af3-4e0331ff0186; business notification never acknowledged. |
| Test service lifecycle | SUSPENDED; window NOT STARTED | Existing srv-dbe27ics728c738tuoc0, same0.5c-512mb, same repo/branch/Dockerfile, auto-deploy off, workspace tea-db35rbflot8c739g8rhg. No resume/renewal yet. |

## Reviewed preparation

The exact existing test service opt-in admits only a frozen synthetic memory fixture and the reserved synthetic notification acknowledgement. All other writes stay denied; model/planner/external execution remain absent from fresh child environment. Application deadline is capped at30min or earlier storage expiry. Parent must also suspend the service by an absolute deadline including build time; application exit alone does not suspend billing.

The gateway intentionally withholds each first successful save/ack response once AFTER the genuine Command Center handler commits. Retry uses the unchanged browser form/idempotency key or same notification ID. This is disclosed fault injection, not a production failure. Operator --verify supplies adjunct row/audit counts; only actual browser interactions can close UI acceptance.

Independent Quick/security review and independent verifier found and closed an operator-target query-override defect. Canonical destination/port, query allowlist, safe startup options and encoded credential assignment are covered by local driver tests. No real credential was accessed. Final renewal9/9 and ownerAcceptance6/6 passed; unaffected earlier startup/read-only/typechecks remain valid for their exact files. See the two isolated-ui-independent-verification JSON receipts. Earlier failed/unfixed receipt is retained as historical.

## Native preflight already observed

Existing restricted role sam_eval_runtime_20261024 expired at2026-10-28T01:00:25.521Z. Current Runtime role sam_runtime_app cannot renew it. Existing database destination dpg-db37k3rbc2fs73csjung-a:5432/sam_trial_postgres was checked without displaying its connection string. Existing test-schema catalogs show needed memory SELECT/INSERT/UPDATE and audit/notification SELECT/INSERT with RLS; notification FORCE RLS remains. No grants, policies, membership, password or business data changed. Database MCP external path is blocked by existing empty IP allowlist, which remains intact.

Only existing operator sam_trial_postgres_user can use the bounded renewal path. The explicit helper prompts invisibly in the existing authenticated Render Runtime terminal, authenticates metadata only and waits at most5min for the parent command. The sole mutation, after preparation, is existing-role VALID UNTIL from server time+30min, checking unchanged role/ACL/RLS/policy/membership fingerprint. No credential belongs in chat or model-visible input. No secret extraction from dashboard/browser storage is permitted.

## Exact continuation

1. Publish the reviewed candidate to the existing non-main PR branch and verify its identity. Production release and Blueprint branches remain separate.
2. Stage only the pinned verified helper in existing Runtime Shell, prompt for the existing operator password through hidden TTY and hand off authentication if necessary. Service stays suspended until authentication is confirmed. Never treat opening a prompt as successful login/renewal.
3. After successful operator metadata preparation, renew once, record activation/deadline and resume existing test service for at most30min. Merge only SAM_UI_ACCEPTANCE_ENABLED=1; preserve all secrets/other config. Verify exact candidate readiness and existing scope.
4. Explicitly seed one test notification against an EXISTING enrolled synthetic evaluation-trial root goal. No new goal/company; fail closed if absent.
5. Use the actual authenticated test browser to save synthetic fixture, recall relevant context, exclude unrelated context, and replay the unchanged save after disclosed response withholding. Test foreign-company scope only if a preexisting independently authorized fixture exists; never claim positive two-company browser proof otherwise.
6. Display exact test notification UNROUTED, click Mark read internally, repeat same button after response withholding, verify same receipt and one audit via explicit read-only operator verification. Do not acknowledge business notification e0283121-947e-47b9-94e7-8be1aae16299.
7. Suspend on finish/failure/deadline, verify Render suspended status and archive observed result. Internal UNROUTED is not external delivery. No push project/resources introduced.

From ChatGPT request saved report by ID, memory status/recall, or internal notification list; these tools are actually callable now. From production UI use existing authenticated report/owner-memory/notification panels; isolated writes remain pending this controlled window.
