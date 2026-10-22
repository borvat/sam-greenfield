# Phase 6 review and controlled model evaluation

Review baseline: `4b498ab7fb9e2775affe0aa5f236856bbd4863ce`, development
branch `codex/sam-phase5-specialist-intelligence`, draft PR #47. The final tested
SHA and actual stage results are in the generated independent acceptance report;
this document does not certify an untested future commit. PR #46 is unchanged.

## Review findings and corrections

| Finding | Reproduction and correction | Evidence |
| --- | --- | --- |
| Earlier third source incorrectly resolves conflicting reports | Root first delegates two reasoning agents and an unrelated background read. Both agents disagree. A report citing the background read used to complete without corrective research. Require a direct read delegated after the conflicting reports, and repeat that gate during independent report verification. | `apps/agents/src/intelligence/engine.ts` context/assertConflictCorrections/verifyReport; `tests/specialists/worker.ts` collaboration |
| JSON keys/substrings accepted as verified learning | Direct restricted-runtime INSERT of observation `value` against result `{"value":"27"}` used to succeed. New SQL guard accepts exact primitive values, requires an observation parent for new hypotheses, and links a lesson to its actual observation through evaluation/hypothesis. An unrelated matching observation cannot complete the cycle. | `packages/db/specialist-migrations/00107_learning_provenance.sql`; worker collaboration learning regressions |
| Source fields interpreted as specialist report control structure | A legitimate read payload with `status: COMPLETE` and string `report` caused context parsing errors and WAITING_EXTERNAL instead of completion. Only registered reasoning capabilities may produce specialist report structures. Leaf fields remain untrusted data. | engine context/projection; worker read adapter includes adversarial source text and reserved-looking keys |

Failing-before logs and successful focused results are retained in
`.local/verification/phase6-review/`. The SQL upgrade test also reproduces the
published SQL weakness directly before installing the corrected guard. These are
architecture tests with fixture model responses, not evidence of live judgment
or prompt-injection resistance in an actual model.

The upgrade is additive. Published core12, integration8 and specialist00106 files
remain byte-for-byte unchanged. `specialistMigrationManifest` and the atomic
operator-only applicator support the old one-receipt prefix and new two-receipt
profile. Unknown receipts, gaps and changed hashes fail closed. The legacy
`specialistManifest()` base receipt and applicator filename/hash fields are
preserved; the latter adds a `migrations` receipt list. Startup never migrates.
Specialist startup requires both exact receipts. Operator provisioning grants
read-only access to the nonsecret migration ledger; a missing or corrupt upgrade
receipt fails admission. Existing runtime identities need that operator-reviewed
metadata grant when the profile is upgraded.

Migration 00107 refuses existing malformed observed/evaluated/trusted records
with `SPECIALIST_LEGACY_LEARNING_REVIEW_REQUIRED`, rolls back fully, and leaves
records/receipts intact. An operator must review and remediate from an approved
backup/change plan; migration never deletes or repairs learning data. Existing
untrusted hypotheses without observation parents are preserved as untrusted;
new such hypotheses are refused. Disable the opt-in composition or restore an
approved database backup for rollback. Never edit an applied receipt.

## Scope of engineering review

The review inspected existing specialist contracts/engine/composition, Model
Gateway routing/reservation/fallback, kernel execution/recovery/verification,
operator migration/access helpers and SQL, and the acceptance/restart tests.
No second executive, model router, tool gateway or permission system was added.

| Control | Evidence and boundary |
| --- | --- |
| Planning and delegation | Strict JSON decisions, catalog/schema checks, immutable delegated parameter hash, real child goals and current-plan kernel transitions. Specialist loop tests include invalid capability refusal, replanning after failed independent readback, concurrent reasoning and executive synthesis. |
| Concurrency and recovery | Model calls outside transactions; family advisory locks serialize reservation/mutation; work leases and fencing reject stale commits. Real SIGKILL retains ambiguous-call reservation and resumes through kernel recovery. Actual PostgreSQL restart checks persisted sessions/counters and both receipts. |
| Specialist model budgets | Gateway reserves every provider attempt before invocation, including fallback/retry, conservative input/output token ceilings and quoted cost. Unknown/failed attempts are not refunded. Shared and per-specialist counters are atomic; the collaboration test reconciles the family against all session reservations. |
| Reads and independent readbacks | `beforeTool` and `verifyRead` each reserve one tool call and quoted cost against the delegating specialist and shared family. Exhaustion refuses the callback; timeouts become INCONCLUSIVE. Late results after cancellation/deadline cannot commit. |
| Authorization/company scope | Entire opt-in catalog requires GREEN, explicit no side effects and exactly one admitted company. Fixed restricted LOGIN, FORCE RLS and immutable restrictive org/entity fences remain required. Tests use populated foreign-company records and spoofed session settings. |
| Learning | Typed records, same-goal lineage, current latest VERIFIED receipt, freshness, exact quotation and immutable runtime grants. Cold-process recall works; revocation hides lessons and invalidates reports. Verified quotation means retrieval/quotation integrity, not universal factual truth. |

## Remaining security and live-readiness blockers

Historical Phase 6 assessment: the [Phase 7 implementation](PHASE7_EVALUATION_INFRASTRUCTURE.md)
addresses the whole-trial ledger and gated adapter/capture infrastructure. Live
activation and independent model-quality evaluation remain unexecuted.

1. **Whole-evaluation budget is not enforced.** The Executive Brain's bootstrap
   planning has separate attempt/deadline/cost controls in the existing
   production planner. It precedes creation of the specialist family; its model
   calls are not charged to that family's counters. The collaboration test
   prints the actual bootstrap count separately. Any future live trial must add
   a durable goal/trial reservation covering bootstrap, root retries, all
   specialist families, tools and readbacks, and prove it survives crashes.
   A report scorer detects excessive *recorded* usage; it is not an execution
   spending control. This blocks a claim that all requested inclusive budget
   guarantees are complete.
2. **No reviewed live specialist adapter or activation path.** The intelligence
   composition and bounded Gateway still require synthetic adapters. Do not
   relabel a live provider as synthetic or remove this guard. A separately
   reviewed, explicitly authorized evaluation-only Gateway path needs provider
   token/output enforcement, prices, cancellation and ambiguous-attempt
   accounting before any actual model invocation. No credentials were loaded
   and no paid provider was called in this work.
3. **Semantic verification is limited.** Exact primitive quotations, exact topic
   labels and new-read chronology cannot prove the subject, units, source
   independence, factual truth or sufficiency of a business recommendation.
   A model can use inconsistent topic labels. Independent human review and
   bounded evaluation must measure this; deterministic fixture success cannot.
4. **Trusted adapters and database identities remain a boundary.** A malicious
   trusted adapter can mislabel a side effect or underquote its cost. Current
   runtime SQL identities still participate in verification/approval data; a
   separate verifier/approver identity and TEMP/search_path hardening need
   staging review. A read timeout cannot forcibly abort an adapter without an
   abort contract, although the late result is rejected. Do not expose arbitrary
   SQL, filesystem, arbitrary HTTP, email, inventory or payment tools.
5. **Hosted/governance gates are unresolved.** User reports the GitHub billing
   restriction. Earlier run 39678917418 had three failed jobs with empty step
   arrays and BlobNotFound logs; runner/timing/annotation fields were unavailable,
   not confirmed null. That evidence never demonstrated an application test
   failure. In this session public PR HTML and native Git are accessible, while
   the api.github.com CONNECT tunnel is rejected by the environment proxy
   (curl 56, HTTP 000). Effective branch protection, required reviews/checks and
   merge authorization cannot be certified. No checks/statuses were written.
6. Staging roles/TLS, OAuth/MCP with test identities, backup restoration,
   operational alerts and any deployment acceptance remain unexecuted. Follow
   `docs/PHASE4_STAGING_SPECIFICATION.md` only after separate authorization.

This is an engineering code review by the implementation assistant. It does not
replace independent human approval, penetration testing or a live-model study.

## Provider-independent evaluation preparation

`apps/agents/src/evaluation/` supplies executable preparation and offline trace
scoring. There is no provider SDK, HTTP client, secret loader or model invocation
in this harness. It cannot spend money or perform business actions. The live CLI
fails immediately with `LIVE_EVALUATION_NOT_AUTHORIZED`.

```sh
npm run evaluate:specialists -- prepare --commit "$(git rev-parse HEAD)" --output .local/evaluation-preparation
npm run evaluate:specialists -- score --commit "$(git rev-parse HEAD)" --input trace.json --output .local/evaluation-score
npm run verify:full
```

Use a new output directory for each run. Preparation emits three invented,
closed-world industry scenarios: industrial refrigeration, battery solvent
recovery and photonics supply. Sources include dates/reliability, conflicting
claims and malicious instruction text. The expected answer key stays in the
scorer and is omitted from exported model input. These are benchmark documents,
not actual market intelligence. No arbitrary Internet research is enabled.

The strict versioned `EvaluationTrace` schema in `harness.ts` is independent of
provider. A later authorized SAM capture bridge must export exact commit,
company/root queue, timestamps/deadline, model/provider and usage per attempt,
reservations for every model/tool/readback/delegation, per-agent and shared
limits, independent verification IDs/content hashes, contradiction/corrective
read timing, final model-inference report and linked learning cycle. Failed,
timed-out and cancelled attempts remain in the trace. Captures must include
bootstrap and all delegated work; incomplete captures cannot establish budget
compliance. Attach raw Gateway audit/kernel/SQL logs and their hashes separately.

Scoring checks the candidate, timing, reservations/ceilings, scope, read-only
capabilities, independently read-back source content, benchmark answers,
and source publication within 30 days of the trial (refresh this frozen corpus
under a new reviewed hash when it expires),
corrective research and observation-to-lesson linkage. Both fixture and captured
trace scores have `liveReasoningValidated: false` and human review PENDING.
Captured provenance is explicitly UNVERIFIED: a JSON file can be forged or omit
attempts. These scores are diagnostic and do not authorize merge or deployment.
The actual SAM kernel/orchestration fixture suite remains separate; the scorer
is not another agent engine or a scripted demonstration of autonomy.

Reports include machine JSON, human Markdown, input/corpus/trace hashes, times,
runtime and SHA256SUMS. Offline failures exit nonzero; malformed/oversize traces
are refused. `tests/specialists/evaluation.ts` tests all scenarios and negative
cases, including readback accounting, retries, foreign company, external write,
untrusted memory, late correction and the live-call refusal.

## Bounded live evaluation plan — not authorized or executed

1. Complete the whole-trial budget and reviewed Gateway/capture bridge blockers
   above on a development branch; rerun exact-commit `verify:full` and obtain
   independent security review. Keep the existing Executive Brain and kernel.
2. Nominate one provider/model/version, explicit synthetic-only corpus,
   fresh isolated company database and restricted test service identity. Review
   prices, tokenizer/output caps, response schema, retry/timeout behavior,
   retention policy and network allowlist. No production/customer data or write
   tools. Source tools read only the frozen benchmark documents.
3. Seek separate written authorization for that exact candidate/corpus,
   provider, credentials, endpoint, dates and maximum spend. Proposed ceiling:
   three cases × three trials × $0.25 = **$2.25 total**. This is a proposal, not
   permission to incur costs. Per-trial proposal: 20 model attempts, 20 reads
   including readbacks, 200,000 reserved tokens and 120 seconds; per-specialist
   ceilings must be no broader. Provider prices may make these ceilings too
   small; stop rather than exceed them. No automatic fallback provider.
4. Execute through the existing SAM planner/Model Gateway/kernel using the
   reviewed evaluation-only path. Record all attempts before transport;
   cancellation/timeouts retain reservations. Never automatically rerun an
   ambiguous paid call. Stop on scope breach, ungrounded claim, exhausted
   budget, missing evidence, cancellation or missing audit capture.
5. Export the trace and audit artifacts, run offline scoring, then independently
   review tool choice, actual specialist independence/cooperation, contradiction
   handling, answer relevance/units, calibrated uncertainty and learning
   grounding. Report every trial and failure; no cherry-picking. Require zero
   authorization/tenant/write violations and complete budget/evidence capture.
   Define a model-quality threshold before seeing outputs; synthetic contracts
   provide no estimated live success rate.
6. Review results and make a separate authorized integration/staging decision.
   No local score or live trial grants production or merge permission.

## Reproduction and acceptance

```sh
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:LOCAL_TEST_PASSWORD@127.0.0.1:5432/sam_core_test \
  node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:LOCAL_TEST_PASSWORD@127.0.0.1:5432/sam_core_test \
  node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
node --import tsx tests/specialists/evaluation.ts
npm run typecheck
npm run verify:full
```

Only disposable local databases are accepted by the core harness. The full
runner creates them itself, starts pinned containers and tests a clean archived
commit without production credentials. It now has 44 required stages, adding
specialist-provenance and specialist-evaluation to the previous 42. Existing
suites are preserved. A complete local pass establishes synthetic engineering
acceptance only; live intelligence, hosted CI, merge, staging and production
remain distinct gates.
