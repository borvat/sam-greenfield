# Integration verification and delivery boundary

Date: 28 October 2026, Asia/Damascus. Baseline: `e0eb20a6637b3ba4221172b341c8a27e156b9528`.

The independent report records 47 initial focused tests and 20 final affected tests. After the last world-fact compatibility correction, the integration owner reran the affected batch: **21 tests passed, zero failures/skips**, exit 0, 8.087 seconds. These counts overlap; they are not added together as unique tests.

```sh
DATABASE_URL=postgres://fixture:fixture@127.0.0.1:1/fixture node --import tsx --test tests/isolated/sam_google_review.ts tests/isolated/sam_reliability.ts tests/isolated/sam_reliability_independent.ts tests/isolated/command_center_reports.ts deploy/reliability-test/startup.test.ts
npm run typecheck
node_modules/.bin/tsc --noEmit --target ES2023 --module ESNext --moduleResolution Bundler --lib ES2023,DOM,DOM.Iterable --types node --esModuleInterop --strict --skipLibCheck deploy/reliability-test/entry.ts deploy/reliability-test/persistentBinding.ts deploy/reliability-test/memorySentinel.ts deploy/reliability-test/startup.test.ts
git diff --check
```

Both typechecks and whitespace validation passed. The separate deployment typecheck is necessary because the repository's ordinary tsconfig does not include deploy/. The Dockerfile now runs it and the four startup tests during a future build; no Docker build or hosted deployment was run here.

An additional **3/3 offline analysis-contract run** used a private local copy of the previously saved verified business source. It verified prompt/schema compatibility, preservation of the complete 43-product source and exact file bytes, with synthetic transport only. No source recollection, provider inference, original report rewrite or Hermes-policy consumption occurred. Private source bytes are not committed. The original rejected-output conditional test was not activated.

Review was performed by an actual independent inspection agent. The first pass found four issues; each was triaged in the plan. Independent tests additionally reproduced duplicate URL-key admission. The subsequent inspection pass returned no further findings. A final root inspection preserved world-fact scope identity while retaining scope validation; its dedicated local regression passed.

## Historical pre-activation acceptance (superseded by the native results below)

- The existing test service remains suspended. Its database login was observed expired using the existing application principal in a read-only transaction; no role was modified. Startup refuses expired or wrongly scoped storage.
- No hosted visual QA, native role acceptance, test deployment or Render container-replacement persistence is claimed. The non-sensitive sentinel procedure is prepared but unexecuted.
- Earlier-plan reports can remain invisible under the existing integration RLS. The read API states that limitation; no policy or grant was weakened.
- New semantic safety deliberately reduces model output to reference selection and source-derived Arabic statements. Existing free-prose reports remain immutable and visibly labelled as historical narrative without the new semantic validation.
- Existing source account association does not independently prove a legal merchant identity. No send capability was established by Google read access.
- Notifications remain internal/polled. Inspection of the existing Activepieces scheduler showed an hourly heartbeat code step, not a ChatGPT wake or SAM-result delivery action. No flow was changed or test-triggered.

The code is built and reviewable; the owner's requested operational delivery remains **blocked**, not closed. No production deployment, main push/merge, live model call, business effect, new paid resource, credential exposure, or write to concurrent engineering-memory work occurred.


## Completed bounded native test acceptance — 2026-10-28

Owner-approved service resume and one existing-role renewal were completed without grants/password changes. Render built the reviewed Docker candidate and passed its four startup tests. First deploy `dep-dbgjmi08v5cc73fs5be0` ran `929593ff14c5ad33479a69826b394154d17fbab3`; the reviewed read-only UI correction deployed as `f859fda054f0d367c983e131feee6e6ddd7ae861` in `dep-dbgjpu88v5cc73fsg410`. The locally tested follow-up tree is `add7ef3bb27e0136a4eccbdf0f85100f8b9ba945`, identical to that published application commit.

Root directly observed hosted readiness, protected native SDK calls, 401/403/405 gates, the exact seven read-only tools, immutable preexisting synthetic report replay, and scoped memory recall. Two distinct Render container identities prove replacement; the same synthetic memory ID/hash/company/source/created timestamp/status survived. All three native application services reported the final exact revision. Browser inspection confirmed the read-only banner and hidden creation form; no authenticated browser session was claimed. A separate inspector reviewed sanitized evidence consistency without accessing hosted credentials or database.

Fresh follow-up TypeScript and read-only HTTP/UI regression passed. The independent additional local MCP HTTP check passed 1/1 with synthetic database responses. Full local suite counts above overlap and are not summed. Native evidence is in `hosted-reliability-evidence.json`; detailed proof boundaries are in `independent-verification.md`.

The test lease expires at **2026-10-28T01:00:25.521Z** without automatic renewal. This completes the bounded test deployment, not production promotion or general executive readiness. The original email goal remains unmodified; no live model call, analysis credit, new business goal, external send/write, new paid resource, main merge or production deployment was performed. Legal merchant identity, earlier-plan report visibility and push delivery remain disclosed limitations.


## Subsequent owner-approved production promotion — completed

This section supersedes the earlier phase's production-pending status. The owner explicitly approved the same reviewed application on the three existing production services, keeping Hermes closed and email recovery uninvoked. All three are LIVE at f859fda054f0d367c983e131feee6e6ddd7ae861. Root observed their three200 health responses and protected CC401; the independent verifier directly compared existing ChatGPT report/email/status reads with its baseline. Report decision/hash and execution/verifier/audit arrays remained identical, and native model ledger29/cost-field sum0.75/nine review-budget events stayed unchanged.

The CC owner-login blocker was repaired with an existing-Blueprint fromService reference to Runtime's restricted DATABASE_URL, without revealing a credential or changing grants/RLS. Current-schema validation, an independent two-field diff review and the actual two-change Render preview preceded approval. The successful config sync and deploy IDs are in production-promotion-evidence.json. The rejected old-root validation and its no-applied-downgrade outcome are recorded separately. All original compute/database plans and resources remain.

Production native reads proved original report-by-ID replay with executionPerformed=false and a historical-narrative marker, scoped operational memory availability/count0, no leakage of the synthetic test record, and feature-disabled execution knowledge/notifications. CC's underlying store returned the same report/hash under the identical restricted connection; no authenticated CC browser session or new-tool call through cached ChatGPT metadata is claimed. Existing ChatGPT timeline/status paths are proven.

The synthetic test login was not renewed. Its lease ended2026-10-28T01:00:25.521Z and its existing service was re-suspended, retaining PostgreSQL data. Production uses its existing restricted application role and is independent of that test lease. The original email stays parked, legal merchant identity is unresolved, earlier-plan RLS visibility is unchanged, and push delivery is not implemented. No main merge, new model use, source recollection, external business write or new resource/budget was introduced.
