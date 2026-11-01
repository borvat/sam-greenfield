---
title: SAM digital company on the existing executive runtime
type: feature
ticket: ''
created: 2026-11-01
status: in-review
baseline_revision: 2ad20d267e629909087ff3befa4e6ad216b31494
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - '{project-root}/docs/engineering/sam-digital-company-audit-20261101.md'
  - '{project-root}/docs/engineering/review-recovery-progress-20261028.md'
---

<frozen-after-approval reason="Owner approved the comprehensive scope and autonomous routine progression on 2026-11-01">

## Intent

Owner update on 2026-11-01 adds Nadr.ai AI Company HQ as a functional reference: delegation, company manual, job descriptions, unified reporting, live office, scheduled routines, experience levels, approval controls. Latest owner steering permits parallel source development of the 15 staff roles and integrated live office despite the backup/release blocker. PR86 closure and a real multispecialist end-to-end goal remain required live acceptance gates. Keep all new features off by default and preserve draft routines without activation.

Extend existing SAM Greenfield into an evidence-backed digital company: SAM supervises 15 staff roles, persistent delegated work, scoped memory/performance/experience, an authenticated live office, secure skill proposals, scheduled owner reports and bounded self-monitoring/recovery. Finish the existing PR86 recovery instead of replacing it. The prior audit is the accepted requirements companion. Deliver working integrated code and evidence; source-only success never establishes live acceptance.

## Boundaries & Constraints

Always reuse capability ownership, authority guards, goal/plan/execution/verification, immutable reports, leases/fencing, budgets and current memory. Preserve original evidence. Existing intelligence composition is synthetic/evaluation-only; do not relabel or silently remove its gate. Staff profiles may delegate through existing capability owners; profile registration alone is not actual employee execution. Fail closed if capability, ledger, delivery or data are absent. Root coordinates independent review/verification.

Never merge main, publish production, change production DB/network/secrets/privileges, incur new paid resources/model cost, or weaken safeguards. No new repo/framework. No outside sends while testing. Actual report delivery must use a configured owner-approved channel with durable receipt and ambiguity handling; absent configuration remains explicitly blocked. Scheduler defaults 08:00 Asia/Damascus daily and Sunday08:00 configurable; do not activate production here. New skills require pinned source, review and explicit adoption; rank grants no permissions. No repeated broad baseline tests; test only additions/affected logic and genuine uncovered native acceptance.

Owner authorizes all routine development phases and review fixes without intermediate confirmation. Production gates do not block independent development. Keep all seven goals in one coordinated staged delivery; no workflow approval pauses.

## I/O & Edge-Case Matrix

| Scenario | State | Behavior | Failure |
|---|---|---|---|
| Office | authentic company-scoped persisted work | 15 stable profiles with evidence-linked status, task IDs, results, timestamps | stale/unknown/unconfigured cannot appear actively working |
| Performance | verified/unverified execution and ledger | only verified attributable results count; actual known cost or UNKNOWN | no rank based on fabricated/missing data; no permission escalation |
| Skills | unreviewed proposal or source hash change | quarantine/pending review until source/security/adoption checks match | prevent self-approval and invalidate changed-source approvals |
| Reports | due daily/weekly schedule, concurrent ticks or restart | durable one run per company/type/local calendar period; persisted artifact/hash and retry state | missed-run policy explicit; ambiguous send never blindly resent |
| Tenant | foreign company IDs | authenticated company scope and RLS enforced | no cross-company reads/writes |
| Recovery | worker failure or expired lease | reuse current bounded recovery/fencing and surface incident | no fresh infinite retry or repeated side effects |

</frozen-after-approval>

## Code Map

- `apps/agents/src/{registry,capabilityCatalog,runtime,supervisor,executiveFlow}.ts`: exclusive capability owners, maxConcurrency<=4, durable handoff.
- `apps/production/src/{composition,readGoalReview,readReviewContinuation}.ts`: normal tick and existing PR86 fix; native deployment gate remains.
- `apps/agents/src/intelligence/{composition,learning}.ts`: existing scoped learning and evaluation restrictions; preserve.
- `apps/command-center/src/{store,http,ui}.ts`: authenticated company-bound API and existing UI. Add office here, not another app.
- `apps/notifications/src/center.ts`: existing polling is not external delivery. Reuse projection/receipts when appropriate.
- `packages/db/{migrations,integration-migrations}`: additive scoped schemas, transactional and idempotent; inspect current schema patterns before writing.
- `packages/db/src/{modelCalls,client}.ts`, `apps/kernel/src/{recovery,failures}.ts`: actual model-ledger attribution and bounded recovery.

## Tasks & Acceptance

**Execution:**
- [ ] Preserve PR86 repair and document exact native/release requirements without rerunning its unchanged passing source suites.
- [ ] `apps/agents/src/company*.ts` plus minimal migration if needed: immutable roster15, role-capability delegation, scoped performance/memory view, explainable five ranks, quarantined pinned skill proposal/security/adoption workflow.
- [ ] Extend authenticated Command Center store/http/ui: live office snapshot from persisted work/verification/ledger; polling with stale indicators; accessible Arabic labels, responsive cards and drill-down using existing timeline. No demo data in normal mode.
- [ ] `apps/notifications/src/executive*.ts` plus minimal migration: persistent daily/weekly calendar scheduling, evidence-bounded report snapshots, deduped artifacts, bounded retries, delivery adapter contract and explicit delivery receipts. Wire enabled runtime ticks only with existing configuration/authority. No credentials in DB artifacts.
- [ ] Add scoped health/incident view using current recovery/failed work; never widen retry count or reset provider reservations.
- [ ] Add affected tests covering every matrix row and integrated snapshot/schedule/restart/authorization behavior. Mark native/live gates separately. Run typecheck and secret scan before deliverable publication.
- [ ] Prepare pinned release/runbook/rollback and acceptance manifest, then independent review and verifier execution. No remote operations in implementation step.

**Acceptance Criteria:**
- Given existing capability owners, when staff work is assigned, then it uses current authorized queue/handoff and appears under the responsible profile without copying ownership or permissions.
- Given a verified execution, when office/performance reads it, then IDs, result/verification, actual cost attribution and freshness match durable records.
- Given restart/concurrent schedule ticks, when reports become due, then exactly one durable report exists per period and ambiguous delivery is not replayed.
- Given incomplete sources or unreviewed skill, when reporting/adoption occurs, then unknown coverage or required review is explicit and cannot silently pass.
- Given the live release prohibition, when isolated checks pass, then acceptance stays partial until real published goal intake/delegation/verification/closure/restart and owner delivery are independently proved.

## Implementation Notes

Original BMAD6.13.0-next setup repaired ignored runtime and render_skill activated successfully. Startup resume/audit/brief loaded; five candidate lessons, zero verified. Current owner overrides routine HALT approvals and authorizes full scope. Independent baseline review found no new confirmed PR86 defect; verifier confirmed old live SHAs and blocked native/live acceptance. No need to rerun unchanged successful PR86 tests.

## Plan Change Log

## Review Triage Log

2026-11-01 follow-up: owner explicitly authorizes publication of reviewed, secret-scanned isolated branches. This supersedes historical no-push notes; no main merge, production feature deployment, added cost or financial authority follows. Official Render browser authentication succeeded. Current UI-completed export download became available at19:34UTC; archive contents/checksum/restoration remain unverified. PITR dialog creates a new database. No authorized existing native restoration target was found, so only production release remains stopped.

Routines/levels/skills source slice:12 files independently reviewed with no new blocking findings;8 affected tests and typecheck independently pass. Exact file hashes and scope are in routines-source/source-manifest.json and independent-verification.json. All activation flags remain off; real delivery and native/live acceptance remain open.

## Verification

New focused node:test cases plus TypeScript; use existing PGlite for isolated integrated tests and clearly label session-lock/native limits. Independent verifier runs the affected new acceptance separately. Stage/read all diffs, secret-scan changed full files, retain exact source IDs. Live migration/deploy/owner UI/report receipt remain reserved gates, not substituted by mocks.

## Owner steering checkpoint

- 2026-11-01: explicit owner update supersedes earlier independent parallel preparation. Advanced WIP preserved unactivated and incomplete; no UI delivery or tests/acceptance claimed. Safety-gate patch only is allowed before preserving checkpoint.
- Foundation has no new confirmed source defect; 18 prior-tested source/operator/test hashes match. Native DB/migration and production deployment are reserved gates. Do not advance later stages before actual operational proof.
- Nadr.ai eight functions are owner-supplied requirements, not proof of that implementation or authority to copy code/install dependencies.

- 2026-11-01 latest explicit owner steering supersedes the earlier source-development freeze: authorize parallel staff15 and office implementation/tests on this isolated branch. Harden scoped memory/performance/skill guards as part of this checkpoint; no production writes, deployment, main/push, sends, paid resources or intelligence-gate removal. Parent owns backup/release and independent review. Live acceptance remains unproved.

## Staff / office source checkpoint

2026-11-01: integrated staff15/office source checkpoint is recorded in `docs/engineering/company-execution-20261101/staff-office-source-checkpoint.md` with hashes in `staff-office-source-manifest.json`. Nine focused isolated tests, typecheck and diff check pass. New ledger links remain explicit subtotals; unassessed coverage/authority cannot cause promotion. Company and report flags remain off. Independent review, native migrations, original PR86 recovery and real multispecialist/owner UI proof remain pending. No live acceptance is marked complete.

## Review triage — 2026-11-01 office source pass1

| Finding | Verdict | Route | Evidence/action |
|---|---|---|---|
| Skill DB guard SQL NULL on missing checks | high | patch | SQL three-valued logic lets missing checks skip IF; source review verified this exact predicate and existing constraints. Implementer to reject missing/null checks and add real SQL regression. |
| Stale task summaries remain working | medium | patch | Only profile nodes carried data-office-state; summaries use separate state text. Mark/invalidate those labels and extend UI execution test. |

No source/live acceptance claimed from earlier9-test receipt after these patches; unchanged parts retain historical source-bound evidence. Owner permits routine review patches without further approval.
