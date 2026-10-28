---
title: SAM usable saved results and executive continuity
type: feature
ticket: ''
created: '2026-10-28'
status: in-progress
baseline_revision: a55fe807827d0f6869c8bc313ae00ffb5672d207
route: full
route_source: auto
risk: high
review: thorough
review_source: auto
lenses_ran: []
review_loop_iteration: 0
context: ["{project-root}/AGENTS.md", "{project-root}/docs/engineering-memory/POLICY.md"]
---

<frozen-after-approval reason="Explicit continuation, implementation and staged existing-service deployment authority in owner request">

## Intent

Make existing SAM saved results usable from the connected ChatGPT tools and Command Center, safely finish the bounded parked diagnostic, and activate scoped approved-owner recall and honest internal notifications. Resume the reviewed application; preserve all earlier acceptance and immutable source evidence.

## Boundaries & Constraints

Always preserve company isolation, source/date/approval provenance, current budgets and permissions, existing login secrets, historical reports and their limits. Use actual independent implementation/review/verification workers with root as coordinator. Preserve adopted BMAD Git memory separately. Publish to a non-main branch, keep PR86 Draft/unmerged, stage existing-service deployment with f859fda054f0d367c983e131feee6e6ddd7ae861 rollback. Owner explicitly covers routine implementation, recovery and production deployment; no further routine approval gate.

Never add resources, subscriptions, budget, grants/RLS relaxation, owner application roles, model/Hermes calls, fresh business collection, external messages, historical preflight, budget resets, direct success-state edits, main integration or reuse of expired test leases. Unknown pagination/mailbox/semantic limits remain explicit. No automatic rule promotion.

## I/O & Edge-Case Matrix

| Given | When | Then |
|---|---|---|
| Historical report ID | Retrieve via connected timeline | Same original ID/hash; no execution; unsupported narrative clearly bounded |
| Parked diagnostic with exact verified reads | Authorized deterministic recovery | Sanitized diagnostic accepted, persisted atomically, legal state transitions; no model/read/budget mutation |
| Altered source/plan/latest verification | Recovery requested | Refuse unchanged; never infer authority from absent reservation |
| Approved owner statement | Save and recall | Actor/company/source/date/status retained; stable idempotence |
| Other company or irrelevant task | Recall | No matching owner statement disclosed; observations remain unapproved |
| Synthetic internal event | Poll and acknowledge | One notification; durable idempotent read receipt; no external delivery claim |
| No authenticated browser session | Inspect UI | Preserve login; API and browser evidence reported separately |

</frozen-after-approval>

## Code Map

- `apps/production/src/readReviewContinuation.ts`, `readGoalReview.ts`: retain model recovery/budget rules. `kernel/stateMachine.ts`, shared stableJson hashing: reuse legal transitions/canonical bindings.
- `apps/production/src/legacyReadDiagnostic.ts` (new): exact goal/plan/execution/verification recovery; `scripts/release/` operator dry-run/apply.
- `apps/brain/src/learning.ts`, `memory.ts`: existing OWNER_DECISION/APPROVED_RULE storage; add strict owner wrapper and relevant scoped recall. `knowledge.ts` source-fact RLS remains unchanged.
- `apps/notifications/src/center.ts`: existing dedup projector. Existing update grants omit read_at; use append-only scoped audit receipts rather than wider grants.
- `apps/chatgpt-tools/src/{coreReadTools,reliabilityReadTools}.ts`, `apps/mcp/src/server.ts`, `releaseReadSurface.ts`: existing timeline/status compatibility and new read handlers; distinguish cached discovery from server list.
- `apps/command-center/src/{store,http,ui}.ts`: existing authenticated surfaces; expose approved owner memory and internal notification/read status.
- `packages/db/src/{integrationProfile,runtimeAccess}.ts`: inspect grants/policies only; do not change.
- `docs/engineering/` existing evidence: inherited checks remain historical and source-bound. BMAD PR87 engineering continuity was merged into this non-main continuation without app changes.

## Tasks & Acceptance

**Execution:**
- [ ] Recovery worker: implement exact deterministic diagnostic and focused rejection/atomicity/idempotency tests; preserve original records.
- [ ] Memory worker: implement trusted scoped owner write/recall using existing memory_records; tests for two companies, wrong context, unapproved/irrelevant exclusion and provenance.
- [ ] Surface worker: integrate MCP/CC saved-result limits, memory and notification polling/receipt path; test auth, dedup and no false delivery.
- [ ] Root: investigate actual ChatGPT discovery/automation and existing secure Render access; record baseline counters/current service identities; no repeated acceptance unrelated to changes.
- [ ] Independent reviewers/verifier: inspect full delta, run affected suite/typecheck and adversarial isolation tests; resolve actionable findings without weakening checks.
- [ ] Root: publish reviewed branch, stage MCP/CC then Runtime as justified, verify exact LIVE revisions and perform bounded diagnostic recovery and synthetic scoped acceptance within existing role. Keep rollback ready and stop outside authorization.

**Acceptance Criteria:**
- Given existing connection, when requesting saved analysis, then original report and limits return with identical hash and zero new calls/executions/reports.
- Given original narrow mail objective, when exact saved evidence is accepted, then only that diagnostic closes through legal transitions and a retrievable report; original parent goal is preserved.
- Given two synthetic companies, when owner decisions are saved/recalled in relevant tasks, then scope/approval/source/time persist and wrong-company/task recall returns nothing.
- Given synthetic event, when polled twice then acknowledged twice, then one visible notification and durable receipt remain; no push is claimed.
- Given reviewed application, when existing three services become LIVE, then UI/API/connected reads prove the deployed revision and actual behavior; unavailable auth/discovery is an explicit remaining limit.

## Implementation Notes

Intake: report v3 read fully; PR86 unchanged Draft/open at baseline; three services still f859fda; isolated test suspended. Existing connected system_status succeeded. New tool names absent in this session registry. Two read-only workers established bounded deterministic mail evidence and owner-memory route without RLS expansion. Root coordinates a single plan; workers may not independently deploy or alter budgets.

## Plan Change Log

## Review Triage Log

## Verification

Capture `tools/project_memory.py snapshot` before meaningful tests. Run affected isolated node tests with dummy DB URL/PGlite, `npm run typecheck`, operator dry-run/rejection tests and `git diff --check`. Independent verification owns source-bound counts/evidence. Native reads/mutations use the existing restricted application identity through the authorized secure path only. Synthetic live tests must be isolated, labelled and rolled back where possible; no business memory contamination. Final evidence records exact commits/deploy IDs/report IDs/hashes/receipts, user availability and unresolved external steps. Archive real outcome with existing engineering-memory contract after delivery evidence is settled.
