# Candidate verification results

Application commit: `2f0997de35a1f119f56b32f369305954c64883cc`.
Application tree: `62d21a84cc103535eda317e1e4133c7db14fa64a`.
Application branch: `deploy/isolated-render-test-20261024`.
This evidence-only file does not change the deployed application or start another acceptance series.

## Verification matrix

| Check | Result | Scope |
|---|---|---|
| TypeScript | PASS | Final candidate source tree |
| Isolated tests | 105 passed, 0 failed | WASM SQL boundaries, contracts, routing, report progress and simulated transport recovery |
| Hosted native PostgreSQL core reliability | PASS, 5206ms | Build fixture, no paid inference |
| Hosted native tenant workload | PASS, 548ms | Build fixture |
| Hosted native shared path | PASS, 61671ms | Scripted model decisions; specialist evidence and recovery mechanics |
| Hosted native evaluation budgets | PASS, 59232ms | Build fixture |
| Authenticated runtime API smoke | PASS | Nine checks listed below |
| Test deployment | LIVE | Exact application commit above |
| Public desktop layout | REVIEWED | Authentication screen and public controls |
| Public 390px layout | REVIEWED | Actual page inside 390px iframe; not a physical-device test |
| Authenticated browser goal/report flow | BLOCKED | No authenticated test-dashboard session in this execution |
| Hosted full-container restart continuity | NOT PROVEN | Test database resets at startup |
| Live reasoning/specialist collaboration | NOT RUN | Release/permit/operator admission unavailable |
| Ten live acceptance goals | 0/10 RUN | All ten remain NOT_RUN; engineering tests are not substitutes |
| Actual provider billing | UNKNOWN | No live provider invocation in this series; configured pricing is not an invoice |

Hosted build suite results were explicitly bound to the application commit. Runtime API smoke passed at 2026-10-24T13:50:39Z; native fixture verification recorded four passed, zero failed and liveReasoningValidated=false. Deployment reached live at 13:50:18Z, before that separate runtime smoke completed. A prior intermediate candidate is excluded from this matrix.

Runtime API checks: unauthenticated denial; read-only UI; elevated-authority denial; natural-language intake persisted; timeline agrees with database; absent verification does not become verified; unknown budget is not zero; missing-goal 404; independent database connection readback. These demonstrate service/intake behavior, not autonomous goal planning.

## Commands and evidence limits

`npm run typecheck`

`DATABASE_URL=postgres://unused:unused@127.0.0.1:1/unused node --import tsx --test tests/isolated/*.ts tests/isolated/*.cjs`

The URL is a dummy unused test sentinel, not a working credential. Hosted native commands are defined by `deploy/render-test/build-verify.cjs`, runtime smoke by `deploy/render-test/api-smoke.cjs`. Startup binds the baked report to the image source commit. No application budget, deadline or release lock was relaxed.

Browser review confirmed the new bilingual objective label and readable report region on the running page. Protected reports and real goal execution were not exercised in that browser. No physical-phone or full Arabic localization claim is made.

## Remaining dependencies

The existing live release remains disabled. No attested signer/approval, scoped persistent evaluation binding or accepted operator transport was established. Real-source semantic contracts and complete monetary/VAT coverage remain unproven. Direct capability probing was refused by the goal-contract guard; this refusal is not proof that the upstream connection works.

Use the existing bounded protocol after those prerequisites are concrete. A conversational approval, a generated key, a green health check or a fixture signature cannot substitute for live admission. Preserve old goals and consumed budgets.

Rollback: retain the previous test image and restore it if needed. No production cutover was performed. Test-code rollback cannot restore disposable database records or reverse external effects.
