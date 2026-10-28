---
title: SAM reliable evidence-to-result delivery
type: bugfix
ticket: ''
created: '2026-10-28'
status: built
delivery_status: bounded_test_verified
remaining_scope: "Production promotion, original email recovery, merchant legal identity and push delivery are not completed."
baseline_revision: e0eb20a6637b3ba4221172b341c8a27e156b9528
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick, independent-verification]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Owner engineering authorization in task">

## Intent

SAM must turn verified execution into an honest retrievable result or an actionable wait, retaining existing evidence and budgets. Repair proven semantic, lifecycle, retrieval and isolation defects in the existing application. The owner has authorized isolated implementation, review, PR publication and approved test deployment; production and main are excluded.

## Boundaries & Constraints

Preserve historical reports, contracts, source hashes, money reservations, tenant RLS and external effect idempotency. No live model calls, analysis-window activation, business reads/sends/writes, new paid resources or shared schema changes. Do not resume suspended services automatically. Keep unrelated BMAD engineering-learning work untouched; it remains a separate Git memory system. Unknowns stay unknown. Raw provider errors and credentials never enter diagnostics. Synthetic tests must be labelled as such.

## I/O & Edge-Case Matrix

| State | Action | Expected behavior |
|---|---|---|
| Unknown financial basis | Interpret verified source | No invented currency, tax treatment, commissions, profit or causal shipping claim |
| 43 source products, 30 selected | Render result | Code states both counts and separates full-source totals from interpreted subset |
| Verified bounded Gmail searches | Review without research mode | No accidental research-plan requirement; no repeated source reads |
| Preflight failure before reservation | Inspect/continue | Durable safe code and next action; preserve every existing consumption entry |
| Spent/exhausted review | Resume | Never reset attempts or authorize additional model usage |
| Report ID, wrong tenant | Retrieve | No row or content disclosed; no new execution or model call |
| Cross-company memory evidence | Observe | Reject scope mismatch; default scope derives from verified execution |
| Notification stored internally | Inspect | Explicit polling/UNROUTED meaning; no claim of ChatGPT push |

</frozen-after-approval>

## Code Map

Repository is the isolated `sam-greenfield` sibling of the BMAD runtime. `apps/production/src/hermesDataAnalysis.ts` has a digit-free prose schema, a misleading tax prompt and an intentional 30-product bound. Existing complete source and receipt hashes must remain. `apps/production/src/readGoalReview.ts` unconditionally detects research from any Arabic search wording, while planner validation is feature-gated; preflight failure is swallowed before reservation. `readReviewContinuation.ts` conflates absent budget with exhaustion. `samGoogleConnection.ts` hard-codes false without probing. `apps/mcp/src/coreReadTools.ts` (locate actual filename if necessary) contains table read surfaces; reports currently require whole-goal timeline. `apps/command-center/src/store.ts` omits reports. `apps/brain/src/learning.ts` ignores verified execution company in memory capture. `knowledge.ts` already separates attributed facts, inference and approved decisions. `apps/notifications/src/center.ts` explicitly stores UNROUTED notifications only.

## Tasks & Acceptance

Implementation agent owns application and focused test changes; root owns deployment packaging/docs and integration. Work sequentially; do not touch deploy/, docs/, .agents/, _bmad/, credentials, Git history or other worktrees. If a requirement needs unauthorized runtime/schema access, implement the safe read-only diagnostic and document the blocker.

- [x] Tighten analysis into versioned reference-only candidate selection (one to eight scalar refs); derive all user-facing facts, comments, summaries and coverage from source in code. Keep original raw candidate/receipt. Reject arbitrary summary/comment fields rather than silently deleting output. Preserve size/count/security bounds; explain reduced free-prose expressiveness. Correct prompt ambiguity. Add source-derived semantic-policy marker. Historical reports remain unchanged.
- [x] Align research validation with planner mode while validating explicit saved research plans. Persist sanitized preflight/runtime diagnostics and actionable wait without changing historical reservations. Any continuation with no budget must require positive evidence of a preflight failure before the first reservation; otherwise fail closed. Engineering recovery must not trigger a model or reset usage. Add coverage caveats for inbox-only/page-only email data to review guidance/validation.
- [x] Correct Google status semantics to unknown/NOT_PERFORMED when no probe occurred; distinguish authorization/discovery from historical independent evidence without inventing tenant/connection identity or send capability.
- [x] Add strict read-only report-by-ID and scoped memory-status/recall/notification surfaces reusing existing stores and RLS. Default listing stays compatible; separate engineering, execution and operational memory. Feature-disabled/permission-unavailable knowledge must be explicit, not silently zero. Bind all new queries to authorized context. Avoid new write tools.
- [x] Include reports in Command Center timeline and render summary, coverage, limitations, report ID and actual wait diagnostics. Add shared sanitized build-revision metadata to health/UI/MCP where appropriate; preserve authentication.
- [x] Bind verified-memory scope to execution company. Correct fixture that reinforced another company's evidence and add rejection coverage. Preserve owner approval distinction.
- [x] Run meaningful focused tests and typecheck; adapt existing analysis fixtures to tightened V2 selection without weakening assertions. Add tests for matrix rows, absent/consumed budgets, rollback, scoped retrieval and zero execution on replay. Do not rerun unrelated successful provider/sandbox suites.

Acceptance: Given unsupported narrative, when parsed, then it is rejected before report persistence. Given partial/unknown source, when rendered, then scope and unknown values remain explicit. Given a review preflight failure, when inspected, then a stable actionable diagnostic survives without resetting budget. Given an immutable existing report ID, when fetched, then exact original report/hash is returned within tenant context without new inference. Given verified test memory, when stored/recalled, then scope and approval status remain intact. Hosted acceptance is a separate root responsibility; local tests never claim container persistence or live provider success.

## Implementation Notes

Investigation used three actual read-only agents. Reproduced research-classification cause matches observed live event sequence; original exception was not logged, so it is not described as an observed database exception. Independent reviewer and verifier will follow implementation. No broad rewrite is justified.

## Plan Change Log

2026-10-28: Owner explicitly approved resuming only the existing test service and renewing only its existing restricted login once for at most 60 minutes. User completed hidden owner authentication; expiry is 2026-10-28T01:00:25.521Z, with unchanged privilege hash. Initial bounded test deployment and an actual container replacement passed native read-only acceptance. No production/model authorization was inferred. Hosted UI showed an enabled creation form despite read-only transport; the reviewed minimal HTTP/UI guard fixes this only when the existing read-only flag is enabled. See hosted-reliability-evidence.json for deployment and persistence evidence.

## Review Triage Log

| Finding | Verdict / route | Evidence and resolution |
|---|---|---|
| Optional report table breaks core timelines | high / patch | Safe relation/OID privilege probe preserves core timeline and explicit missing/denied state; focused regression. |
| Earlier-plan report invisible under existing RLS | medium / defer policy; patch diagnostic | Existing fixed policy restricts current plan. No policy change authorized; API explicitly labels visible-row scope and indistinguishable absent/hidden IDs. Same-plan immutable replay still proven. |
| Knowledge SELECT overstates category visibility | medium / patch | Count explicitly source facts only; other category visibility unknown. Recall retains every legitimately visible record and its interpretation. |
| Import time extends storage lease | high / patch | Timer now recomputes original absolute monotonic deadline after imports. |
| Duplicate URL query keys disagree with pg parser | high / patch | Independently reproduced rejection test failed first; all duplicate keys now rejected before connecting. |
| Optional knowledge/notification table absent | medium / patch | Safe relation probe distinguishes missing, denied and disabled while preserving operational memory. |
| Synthetic tenant not explicitly enrolled | high / patch | Startup now requires exact existing evaluation-company purpose; no enrollment or DDL performed. |

World-fact scope compatibility was also preserved after root inspection: validate company keys without changing historical scope identity; focused supersession/deduplication regression passes.

Independent inspection re-review reported no further findings. Bounded hosted read-only acceptance subsequently passed; production and general executive acceptance remain outside this completed test slice.

## Verification

Run `npm run typecheck` and affected `node --import tsx --test tests/isolated/...` suites with dummy DATABASE_URL when imports require it. Use existing local PGlite/native PostgreSQL fixtures only, never business DB. Capture exact commands, revision, counts, failures and skips. Root will inspect/stage the full diff, obtain independent review/test evidence, publish an isolated PR and prepare existing test-service rollout with models disabled.
