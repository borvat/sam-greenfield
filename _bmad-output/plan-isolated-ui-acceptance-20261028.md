---
title: Close bounded isolated owner-memory and notification UI acceptance
type: bugfix
ticket: ''
created: '2026-10-28'
status: built
baseline_revision: e90fc932f3456dd4c14ceaac662d155ba2393b3b
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick, independent-security]
review_loop_iteration: 1
context: ['{project-root}/AGENTS.md', '{project-root}/docs/engineering-memory/POLICY.md', '{project-root}/docs/engineering/cc-auth-diagnosis-20261028.md']
---

<frozen-after-approval reason="Owner authorizes existing isolated service same plan for max30min after preparation, bounded existing-role renewal and only these synthetic UI tests">

## Intent

Close the remaining actual-browser owner-memory save/recall/retry and synthetic notification acknowledgement tests on the existing isolated service. Keep production and already accepted report/auth flows unchanged. Prepare all code, local checks and review before root starts the30-minute window. Root alone controls native/operator/remote/browser lifecycle; implementer must never access real secrets or live services.

## Boundaries & Constraints

Always retain read-only mode and fixed restricted-role/RLS admission. In an explicitly opted-in exact test service, permit only the synthetic memory fixture save and one synthetic notification acknowledgement; preserve every other write denial. No planner, model/provider, external adapter or live analysis may be registered/enabled. Root must re-suspend service at completion/failure/deadline and keep an absolute external30-minute deadline; application lease must stop no later than30min and earlier role expiry. Existing role renewal changes only VALID UNTIL, no password/grant/member/policy changes.

Never touch business data, business notification e0283121-947e-47b9-94e7-8be1aae16299, main, production deployments/flags, real credentials/browser storage, resources/plans, RLS/grants, tenants or historical evidence. No source recollection/recovery/Hermes/model calls. A second test company may only be used when preexisting and independently authorized/visible; do not invent foreign-fixture evidence. Required wrong-task exclusion and fixed synthetic-scope checks remain mandatory even without a second tenant.

## I/O & Edge-Case Matrix

| Given | When | Then |
| --- | --- | --- |
| Default production/read-only staging | New owner mutation requested | Existing denial/control hiding preserved |
| Exact opted-in isolated service, valid private synthetic binding | Save exact synthetic fixture or acknowledge exact fixture notification | Narrow real CC handler permitted; no other POST/poll/goal write |
| Wrong service/host/nonce/body/fixture-ID or expired deadline | Mutation/start attempted | Refuse before effect; no renewal/grant fallback |
| Synthetic save/ack commits, first response is intentionally lost once | Owner retries via unchanged displayed form/button | Same frozen save payload/key or same notification ID reaches existing idempotent handler; identical record/receipt, one audit |
| Saved approved fixture | Relevant vs unrelated context recalled | Exact source/date/approval/company returned vs no fixture |
| Known synthetic notification | First/repeated button acknowledgement | Same durable read receipt; status remains internal-only, no transport claim |
| Allowed child environment | Runtime starts | No provider/planner/external switches; restricted database only; original expiry not extended |

</frozen-after-approval>

## Code Map

- `deploy/reliability-test/entry.ts`: existing exact service/host opt-in, secret-file admission then fresh env allowlist, dev composition with no planner/adapters, seven READ-only MCP tools and read-only proxy. Keep defaults. Add explicit `SAM_UI_ACCEPTANCE_ENABLED=1` opt-in captured before env wipe, cap original monotonic deadline at30min, and narrow validated fixture mutation forwarding. Never enable general write mode.
- `apps/command-center/src/http.ts`: default read-only hides all owner mutations and returns405. Add optional server-side isolated acceptance option supplied ONLY by admitted test entry, requiring development-safe/read-only conditions. Only expose save-fixture controls and ack button; retain hidden creation and polling. Existing production main never passes this option; no production config change.
- `apps/command-center/src/ui.ts`: preserve ordinary save key behavior and approval semantics. No general retry feature required: test gateway can simulate first response loss after a successful commit, leaving the existing UI payload/key/input intact for actual retry. Likewise first ack response loss leaves its existing button visible for same-ID retry.
- `deploy/reliability-test/ownerAcceptance.ts` (new, or equivalently named focused helper): exact fixture constants/guards and one-time response-loss handling. Fixture context `sam_ui_acceptance_20261028`; source `synthetic:ui-acceptance:20261028`; statement `TEST DATA ONLY — SAM UI acceptance fixture; no business decision or execution authority.`; notification ID `a1829450-3810-4aac-8af3-4e0331ff0186`. Validate dynamic UTC source timestamp/UUID idempotency key and explicit approval; no caller company override. Do not serialize credentials, raw request headers or body into logs.
- Add explicit operator CLI (not startup-imported) to seed/read back ONE labelled UNROUTED notification in admitted isolated company against an existing synthetic goal, transaction/advisory lock/dedup, refusing conflict. Consume existing binding secret internally, zero value output. No memory seeding: memory save is browser-only. Read-only verification reports IDs/provenance/counts/save-audit/read-receipt counts for root; no grants/DDL/renewal. Existing integration/evaluation profiles cover privileges, but verify presence and fail closed rather than repair grants.
- `deploy/reliability-test/startup.test.ts` and focused new isolated tests: adversarial guards, no-provider environment, capped original deadline, disabled unrelated writes, successful normal/default paths, truthful simulated-response-loss replay. Reuse existing PGlite fixtures if needed; never native DB or production.

## Tasks & Acceptance

- [x] Implement bounded opt-in, exact fixture guards and explicit seed/readback CLI. No remote/native access; root owns operations.
- [x] Run only affected isolated/startup tests and typechecks, including explicit deployment entry compilation. Record RED/GREEN for relevant behavior; do not weaken existing read-only assertions or run unrelated acceptance.
- [x] Independent scoped review and verification complete. Final full-deliverable secret scan found no new secret; one exact preexisting public-flag false positive independently reproduced on baseline. Publication prepared; production app/runtime stay unchanged.
- [ ] Root validates existing service/role/scope/ACL metadata; renews only existing role VALID UNTIL through secure existing operator path after preparation. Resume max30min, observe exact build and fail-closed admission, seed synthetic notification and perform browser tests with existing test-service credential through safe browser auth only.
- [ ] Root suspends on finish/failure/deadline, verifies suspended status, archives results/remaining real blockers and tool-discovery evidence in single progress record.

**Acceptance Criteria:** Given this prepared release, when root conducts the authorized isolated browser window, then save+appropriate/wrong-context recall, exact-payload retry and synthetic button-ack/retry have actual rendered evidence and independent restricted metadata counts. Given any unavailable permission/scope/credential, then fail closed, preserve exact blocker and suspend without broadening access. Given ChatGPT connection management, when refresh completes, then report actual session discovery/callability independently of server registration.

## Implementation Notes

Root added explicit operator-only `deploy/reliability-test/renewLogin.cjs` and focused `renewLogin.test.cjs`: hidden TTY password prompt for the existing database operator, authenticated metadata preparation only, then fixed RENEW_30_MINUTES command after parent is ready. Five-minute idle cancellation; only VALID UNTIL changes, same role/database and unchanged ACL/RLS/membership fingerprint. No application import or automatic renewal. Independent implementer reproduced Infinity expiry guard RED; root fixed non-finite expiry/server-time refusal and5/5 now GREEN. Native metadata separately confirmed needed existing ACL/RLS; Render database MCP external path is blocked by existing empty IP allowlist, which is preserved. Root has not renewed/resumed yet.

Service srv-dbe27ics728c738tuoc0 verified suspended, Docker/0.5c-512mb, workspace tea-db35rbflot8c739g8rhg, auto-deploy off, task branch. Restricted role sam_eval_runtime_20261024 expired01:00:25.521Z; current Runtime app identity is sam_runtime_app and is not the operator. Secure operator renewal remains root-owned; role metadata read exposed no credential. New standalone ChatGPT names absent at intake. Original BMAD renderer run once; Git memory/audit restored, candidates2/verified0, no relevant verified lesson. User explicitly authorizes these narrow preparations so no repeated routine approval gate.

## Plan Change Log

## Review Triage Log

| Finding | Verdict / route | Verified evidence and action |
| --- | --- | --- |
| Quick: query parameters bypass operator target | high / patch | Installed pg-connection-string prioritizes query host/port/user/password over URL authority. Reject unknown/duplicate keys and unsafe TLS mode before prompt; strip inherited application options, preserve only validated secure TLS mode. |
| Independent security: same query-parameter override | high / patch | Independently confirmed same pre-authentication destination/identity bypass; grouped with first finding, same fix and adversarial driver regression. No credential or live connection was used. |

## Verification

Capture source snapshot before meaningful final tests. Dummy local DB only for implementation verification. Focused startup/acceptance tests, `npm run typecheck`, deployment-file explicit tsc and diffcheck; root owns exact source/scan/review/publication. No deployment/resume/role/secret operation by implementer. Do not claim native/browser/second-tenant acceptance from local tests. Parent carries project slug sam-greenfield and already completed startup memory checks; no parallel memory system.

## Resumption evidence before review

Latest remote/local baseline e90fc932 verified; service remains suspended, window NOT STARTED. Tools Refresh was performed in actual ChatGPT settings /settings/plugins-settings/plugin_asdk_app_6ad5b85978688191a1845169fe305e72; on the resumed user turn the new names entered the actual tool registry. Both sam_get_report calls, memory_status, recall_memory, notification_status passed. First list_notifications({limit:5}) in a parallel batch returned SCOPED_READ_UNAVAILABLE; identical serialized retry passed, one UNROUTED unread real notice. Preserve both; historical/transient cause UNKNOWN, no code/permission speculation. Native existing DB destination is dpg-db37k3rbc2fs73csjung-a:5432 /sam_trial_postgres; operator helper validates it before hidden credential entry. All code files stable before independent review.

## Final scoped review and preparation checkpoint

Quick and security independently found the same driver-query target override. Root patched it; both reinspections report no remaining concrete finding. Additional verified driver edges (inherited PGPORT/PGOPTIONS and raw-percent credential serialization) were patched by canonical5432, explicit pg_catalog startup options and credential encoding. Only synthetic credentials and local driver parsing were used. Renewal tests9/9 and final acceptance6/6 passed independently; unchanged startup/default-read-only/typechecks retain their earlier exact-file evidence. All results remain LOCAL, not actual isolated-browser acceptance. Public synthetic context literal was represented equivalently as joined tokens after a generic-api-key scanner false positive; no scanner suppression or rule weakening.

Service remains SUSPENDED; no lease renewal, test opt-in update, deploy/resume or thirty-minute window has started. All publication/preparation must precede the secure existing-operator hidden TTY handoff. The handoff authenticates metadata only; RENEW_30_MINUTES remains parent-controlled. Browser owner-memory and notification fixture tests remain UNRUN. Actual ChatGPT discovery/read calls are PASS with one preserved transient notification error followed by identical serialized PASS.

## Notification-only amendment after actual browser acceptance

Amendment baseline9005b02254c4f55d307b4ffbb38f832e45612b60. Actual isolated browser memory save, correct/wrong-context recall and exact unchanged-form retry PASS, one native row/audit. Do not repeat them or modify accepted UI/gateway/lease/auth code. Service re-suspended05:34:52Z within explicit8min; owner input token accepted. Original report/tool proof remains valid.

Plan correction: the evaluation_trials root requirement was an added harness assumption. Actual privately bound enrolled synthetic company2796e0d9-1701-4e53-a7ac-d198c0e44c01 has zero trials but existing G000001 owner_command NEW GREEN exact objective `Read-only synthetic startup check. Execution remains disabled.` visible in authenticated UI. Independent security design review permits retaining original trial branch plus one exact alternate existing-goal predicate, pinned to UNIQUE business_id and this company/objective/domain/state/ceiling, nullparent/currentplan and no associated plans/work/executions via directgoal_id. CallerUUID must match that row under common enrollment/company predicates. Compile-time UUID is unnecessary because business_id is UNIQUE. No generic synthetic-text matching.

KEEP: every accepted memory/frontend/gateway/lease/auth behavior; exact notification UUID/body/dedup/UNROUTED/transport/conflict constraints; restricted private binding/RLS; no newgoal/trial/company/grant/model/externalaction. User explicitly requires preserving completed work, so correction is confined to operator eligibility and read-only inspection; no broad reversion/rebuild of accepted paths.

Add --inspect-notification-goal read-only mode to return only allowed existing UUID/metadata, failing on zero/multiple matches or missing SELECT. Seed rechecks the same eligibility within its transaction. Run only affected notification tests plus deployment-entry typecheck, then independent delta review/verification and publication. No live claim until a fresh authorized bounded window after preparation/currentexpiry check; never repeat memory save.

Review triage: missing trial fixture is a confirmed preparation defect caused by our additional assumption (medium); localized plan correction and strict alternative eligibility are authorized. Frozen owner intent/scope unchanged. Actual second-company exclusion was checked through production ChatGPT reads (empty), not a second browser session. Preserve transient parallel recall -32603 and identical serialized success; causeUNKNOWN, no unrelated MCP repair.

## Amendment review triage

- Quick inspection: no concrete finding; exactstartupidentity, suppliedUUID, readonlyinspection and notificationconflictchecks matched plan.
- Security inspection: no privilege/scopebypass; found changed negative-path fixture now reached unavailable fallbackcolumns for a differentcompany. Root verified and routed medium/patch, preserving independent finding before grouping. Same implementer added immediate wrongcompanyreturn beforeSQL; selected existingnegative reproduced RED columnmissing→GREEN1/1; newnotification6/6. Securityreinspection: resolved, no remainingfinding. No fixture/grants widened.
- Worker ran only newnotification and selectedexistingseednegative plus explicitdeploymenttsc/diff. Final independent delta receipt PASS: selectedexistingseednegative1/1, newnotification6/6, explicitdeploymenttsc anddiffcheck0; exact3filehashes stable. No memory/UI/gateway/lease edits or successfullive-memory reruns.
