---
title: 'Complete verified read reports and bounded recovery'
type: 'bugfix'
ticket: ''
created: '2026-10-28'
status: 'built'
baseline_revision: 'f3539d7b1f154758449f32ba7f9c93fb43579077'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="user authorized complete repair, reviewed deployment and bounded recovery in initial task">

## Intent

**Problem:** Independently verified read results cannot close because oversized review context is rejected after an attempt reservation. An immutable blocked report then prevents recovery despite zero dispatched calls; notifications incorrectly specify no action.

**Approach:** Measure the exact saved-evidence request without provider calls, minimize review context with explicit coverage, move preflight before reservation, and provide a finite audited recovery through existing owner continuation. Preserve prior reports and all operational authority. Use deterministic closure only if a general explicit eligibility contract is safe; interpretation and comparison retain model review.

## Boundaries & Constraints

**Always:** Existing tenant RLS, trusted tool authorization and full source immutability; exact UTF-8 accounting at taskPrompt boundary; finite historical attempts/calls; useful source-linked reports and actionable notifications; independent review and verification. Existing goal must recover from its saved execution and independent verification, with old report linked, no new source reads. Deploy only reviewed changes to affected existing services with rollback prepared. One newly submitted read-only bol acceptance goal may perform its original and independent verification reads under existing budgets.

**Never:** Push/merge main, new resources/plans/budgets/grants/secrets, Hermes consumption, external messages or commerce writes, silent truncation, raised input ceiling, weakened tests, product/goal-specific hardcoding, direct COMPLETED mutation, forged historical preflight or budget reset, automatic repetition of failed live acceptance.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Saved verified read | One current plan, immutable source and CONTENT_MATCH | Accurate source-linked final report; normal state transition | Missing values explicitly unknown |
| Large context | Large source/catalog/history or Arabic UTF-8 | Explicit projection and omission metadata; total byte bound enforced | Useful blocked report, no call consumed before dispatch |
| Money/identity gaps | Missing currency/tax/stock or mismatching EAN | No inferred currency/tax/zero or expected-product attribution | Unmet requested proof remains blocked |
| Recovery | Existing size failure, historical reservation, calls zero | Bounded authorized reuse and append-only report revision | Exhaustion denied; retry returns same outcome |
| Scoped continuation | Wrong company/role, changed plan or incomplete verification | No mutation or execution | Existing authorization rejects |

</frozen-after-approval>

## Code Map

- `apps/production/src/readGoalReview.ts`: locked source loading, projection, review and critique, immutable report and atomic state transitions. Initial input contains full scoped GREEN catalog; measure before assuming its contribution.
- `apps/production/src/reviewInputBudget.ts`, `packages/model-providers/src/common.ts`: 48000-byte serialized taskPrompt boundary; chars and tokens are different units.
- `apps/production/src/reviewEvidence.ts`: deterministic evidence projection, raw citation mapping and monetary limits; preserve.
- `apps/production/src/readReviewContinuation.ts`, `apps/kernel/src/readReviewBudget.ts`, `readReviewDiagnostic.ts`, `continuation.ts`: existing owner recovery, append-only audit, waking and two-attempt/four-call caps.
- `packages/db/integration-migrations/00101_goal_read_reviews.sql`: unique goal/plan prevents immutable recovered revision. Add minimal compatible migration only if required; inspect consumers for latest semantics.
- `apps/notifications/src/center.ts`: align WAITING_EXTERNAL with actionable next step and existing notification dedup.
- `tests/core/reviewReliability.ts`, `reviewFixture.ts`, isolated tests: reuse disposable DB and synthetic providers, never live business reads.

## Tasks & Acceptance

**Execution:**
- [ ] `docs/engineering/review-recovery-*` -- record redacted saved-state baseline and exact original request attribution; no bol/model invocation.
- [ ] `apps/production/src/readGoalReview.ts`, `reviewInputBudget.ts` -- reduce necessary context with explicit omission/authority contract; preflight before attempt/call reservation, including critique; preserve bounded failures.
- [ ] `apps/production/src/readReviewContinuation.ts`, kernel budget/diagnostic/wake files -- finite idempotent recovery retaining all historical counters and source references.
- [ ] `packages/db/integration-migrations`, report consumers -- smallest immutable revision compatibility change needed for same-plan recovery; no permission expansion.
- [ ] `apps/notifications/src/center.ts` -- actionable truthful waiting outcome.
- [ ] `tests/core`, `tests/isolated` -- reproduce baseline failure, verify matrix, immutable references, dedup and tenant authority.
- [ ] `docs/engineering/review-recovery-*` -- reviewed release/rollback, deployed identities, recovered report and one live acceptance evidence; maintain resume checkpoint.

**Acceptance Criteria:**
- Given saved real goal/source and scoped catalog, when the old request is reconstructed locally, then its exact final byte count and component attribution explain rejection; corrected input fits or explicitly blocks without provider calls.
- Given preparation refuses input, when budget history is read, then actual calls remain unchanged and no historical reservation is rewritten or fabricated.
- Given existing blocked report, when authorized recovery is repeated, then verified execution, verification, source, old report and original hash remain unchanged, and at most one recovered report/notification is added.
- Given reviewed deployed source, when original report is retrieved through ChatGPT and authenticated interface, then report IDs/hashes and limits agree; a new bounded acceptance reaches its real final result through planning, reading, independent verification and closure.
- Given affected code changes, when independent verifier runs scoped tests, then no reduced acceptance/assertions/skips or tenant-permission regression exists.

## Implementation Notes

Parent owns coordination, baseline reproduction, release and continuity. Implementation agent owns production/kernel/schema/notification code and affected tests. Reviewer is read-only. Independent verifier owns `docs/engineering/review-recovery-independent-*`, with no service writes. User's initial explicit end-to-end authorization covers implementation and reviewed release; no repeated approval gate is introduced. Engineering memory restored and recalled; audit valid four inactive candidates, zero verified lessons. Original BMAD6.13.0-next setup repaired only ignored runtime scripts, tracked customization unchanged.

## Plan Change Log

## Review Triage Log

Original Quick pass: high1, medium1, false1, operational-pending1. Every finding retained separately:
- high / patch: dropped two-column uniqueness invalidated an existing ON CONFLICT in hermesSourceFollowup; changed target to revision uniqueness, exact SQL regression passes without Hermes invocation.
- false / rejected: slow audit can retain a reserved callsUsed1 with gatewayInvocations0; this is a conservative historical reservation, not an executed model call. Explicit persisted meanings and independent counter tests prove the distinction; input refusal before preparation reserves nothing. Reviewer withdrew the finding.
- medium / patch: waiting notifications omitted the newly saved blocked-report link; now select latest scoped blocked revision and test exact ID/hash.
- operational pending: deployed retrieval, recovery and new acceptance unverified; concrete migration/authentication gate retained in progress checkpoint, no delivery claim.

Final original Quick inspection: no remaining source findings. Separate independent reviewer and executable verifier used. Operator secret-encoding finding separately fixed and synthetic roundtrip tested.

## Verification

- `npm run typecheck` -- zero errors.
- `SAM_CORE_TEST_DATABASE_URL=<disposable local DB> node scripts/testing/core-reliability.cjs --suite tests/core/reviewReliability.ts` -- affected review acceptance passes; extend only affected suites.
- Independent source-bound review and verification; final scoped secret scan before publish/deploy.
- Native stored evidence hashes/counts before/after; exact live service versions; authenticated retrieval distinct from public health. Existing unrelated acceptance reused as historical evidence.

Code built and locally verified; release and full task acceptance remain blocked on necessary private operator authentication. See docs/engineering/review-recovery-progress-20261028.md.
