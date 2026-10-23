# Phase 7: whole-trial budgets and authenticated evaluation

Baseline: `f182c5c696e7e70885638da0b215f29f0575de3e`. Development branch:
`codex/sam-phase7-evaluation-infrastructure`. This branch does not change PR #47's
source branch or PR #46. Both integration/merge decisions remain separate.

Live activation is **release-disabled**. No environment flag, fixture permit,
owner signature or CLI option can enable the live adapter in this release.
No real provider credentials or paid calls are used by acceptance tests.

## Architecture and contracts

```mermaid
flowchart TD
  Operator[Isolated operator: enroll unused synthetic company and create trial]
  Operator --> Ledger[(Root-goal trial ledger and immutable spec)]
  Executive[Existing Executive Brain bootstrap / replan] --> Gateway[Existing Model Gateway with bounded evaluation contract]
  Agents[Existing specialist reasoning and delegation] --> Gateway
  Gateway --> Reserve[Atomic shared and agent reservation before each attempt]
  Reserve --> Ledger
  Reserve --> Adapter[Fixture transport or release-disabled live adapter]
  Agents --> Reads[Frozen source tools and independent readbacks]
  Reads --> Reserve
  Reserve --> Events[(Append-only hash chain)]
  Adapter --> Events
  Reads --> Events
  Capture[Separate operator: verified final snapshot, seal, Ed25519 signature] --> Events
  Capture --> Scorer[Authenticated trace verification and existing offline scorer]
```

No replacement executive/planner, router or kernel was introduced. Optional
planning and work-scope hooks preserve ordinary composition behavior. The
existing specialist composition accepts an opaque trial opened through
`openEvaluationTrial`; it pins the complete capability descriptors/tool
metadata, scopes planning and work claims to that root and descendants, and
wraps both executive and specialist calls through the existing Model Gateway.

Important entry points:

- `packages/db/src/evaluationProfile.ts`: explicit opt-in migration, enrollment,
  runtime grants and immutable company/org RLS admission.
- `apps/agents/src/evaluation/trialSpec.ts`: `TrialSpec` validation, shared and
  per-agent limits, exact commit, corpus, prices and capability hash.
- `trial.ts`: operator trial creation, opaque runtime controller, reservation,
  deadline, cancellation, bounded Gateway and frozen-source normalization.
- `packages/model-gateway/src/evaluationPermit.ts`: in-process permit identity,
  signed exact owner scope and hard release interlock.
- `evaluationAdapter.ts`: provider-independent fixture request contract and
  dormant OpenAI-compatible HTTPS transport; no provider SDK dependency.
- `capture.ts`: operator-only verified database snapshot, sealing and signing.
- `trace.ts`: credential-free signature/hash-chain/ledger verification and
  deterministic projection into the existing offline scorer.

`TrialSpec` binds version/mode, `syntheticOnly`, exact commit, case ID, corpus
hash, company, root reasoning capability, capability hash, complete limits,
per-agent limits and exact provider/model prices. Live specs additionally pin
one HTTPS endpoint. Corpus hash uses the existing `contentHash(publicCases())`
serialization; spec/capability/signature payloads use `stableStringify` SHA-256.

## Durable accounting

The operator creates a trial against a NEW root goal **before** Executive Brain
planning. Root goal identity is unique. Runtime cannot insert another trial,
change its root/spec/deadline, decrement counters, refresh agent deadlines,
un-cancel, reopen a sealed ledger or edit/delete audit events. Initial planning,
root retry/replan and every specialist family under the root share this ledger.
A new plan or work queue does not create a new allowance.

Counters: model attempts, tools including verification readbacks, iterations,
reserved input+output tokens, reserved USD and delegations. Every agent has its
own counters and first-reservation deadline, narrowed by the trial deadline.
The deadline uses database `clock_timestamp`; attempts are checked again before
invocation. Family/session and trial reservations commit in one transaction for
specialist work. Concurrent attempts serialize on the trial row. Provider calls
execute outside database transactions.

Every fallback/retry reserves the full upper bound before adapter invocation. Adapter identity is registered in-process, rather
than inferred from a caller-supplied mode label.
No token/cost refund is made after a timeout, ambiguous result or crash. Bootstrap
iterations and specialist iterations are also charged. Tool execution and
independent readback each reserve separately. One reservation permits at most
one invocation; a unique append-only event prevents ticket reuse. Usage and
model identity are checked after return; missing/malformed usage cannot produce
an accepted success. Actual provider billing is not inferred from fixture cost
counters.

A cancelled or expired trial rejects subsequent admissions. Abort-aware model
transport receives a deadline signal; late results cannot produce a successful
application execution or root plan. A generic read adapter may continue after
timeout if it ignores cancellation, but its late result is rejected. Only
frozen local source adapters belong in this evaluation profile.

A SIGKILL leaves its reservation pending and charged. Recovery can reserve a
new bounded attempt only within remaining limits; it cannot reset the old one.
A pending/uncertain reservation prevents sealing and authenticated scoring.
There is deliberately no automatic refund or "mark unknown as success" API.
An uncertain live attempt requires owner review, provider reconciliation and a
new separately approved trial if needed. `exportEvaluationTrace(...,{incomplete:true})`
can authenticate a read-only point-in-time failure snapshot without sealing or
inventing outcomes. Its scorer verdict is always FAIL and pending reservations
remain charged; the signed artifact is immutable even though the database may
receive later audit events.

## Isolation and immutable evidence

Migration `00108_evaluation_trials.sql` is a separate operator-only profile.
Published core12, integration8 and specialist00106/00107 SQL files remain
unchanged. Apply the existing profiles first, then `applyEvaluationProfile`.
It is atomic, advisory-locked, checksum-checked and repeat-safe. No startup
migration occurs. Unknown receipts or missing fixed fences deny admission.

The operator enrolls only an unused company, rejecting pre-existing goals,
world facts, scoped memory, knowledge or financial records. Runtime cannot
enroll companies. Use a fresh isolated database and synthetic company for each
study; do not enroll or copy any production/customer data. The operator's
synthetic-data attestation remains a trust boundary; a compromised operator
must not be able to supply the signing key or credentials to the model process.

New company/trial/event tables have FORCE RLS plus immutable restrictive
org/company role fences. Runtime gets SELECT on enrollment/receipts, SELECT and
monotonic counter/cancellation updates on trials, SELECT/INSERT on events, and
no trial creation, sealing, event mutation or destructive grants. Existing core
runtime grants are not broadened. Evaluation controller transactions explicitly
place the pinned application schema before `pg_temp`; trigger functions have
fixed search paths and invoker rights. Temporary-table shadowing is tested.

Only configured reasoning capabilities and the registered local `source.read`
factory are accepted. Arbitrary tool/verifier replacements and business
projection/operational callbacks are refused before execution. The frozen
factory has no external service, transport or user callback.

All capabilities remain GREEN, explicit side-effect-free, pinned to one company
and pinned by metadata hash. Bootstrap can propose only the approved single
root specialist with the unchanged objective. Claim selection excludes unrelated
work even within the same synthetic company. A source adapter must return an
approved source ID and matching frozen data. Extra adapter fields are removed;
only approved corpus bytes and controlled parameters reach model context.
Sources may contain adversarial instructions, but they cannot grant capabilities.

Events bind trial ID, sequence, kind, reservation ID, payload and server time in
canonical PostgreSQL JSON text. Each SHA-256 hash includes the previous hash.
Rows cannot be updated/deleted, including through normal operator DML. Database
superusers can still alter/drop objects: immutability is against the restricted
runtime, not an omnipotent administrator.

For complete acceptance, the capture operator locks the trial, refuses pending attempts, reads the latest
independent verification and current-plan final report, checks source receipt
revocation, captures the report/learning/source rows, then seals. Export is a
consistent read-only snapshot signed with an Ed25519 key kept outside runtime.
The signature authenticates provenance and integrity; it does not establish
semantic truth or prove an uncompromised operator/provider.

## Trace format and scorer

`SignedEvaluationTrace` format `sam-evaluation-v1` contains `keyId`, `payload`
(trial row and ordered database events) and base64 Ed25519 signature. The trusted
public key is supplied separately, never selected from an untrusted trace.

Verification checks signature/key fingerprint, commit/spec/corpus, sealed final
snapshot, contiguous chain, reservation/completion uniqueness, unresolved
attempts, shared/per-agent counter conservation and limits, and deadline bounds.
The scorer projection is derived entirely from authenticated events and the
operator snapshot. A caller cannot supply a substitute scored report or omit
bootstrap, failed reservations or delegated work. Actual child records must
conserve delegation counters. Current source receipts and linked learning records
are projected into the existing scorer, which also checks grounded quotation,
corrective research, scope, source freshness and readback evidence.

```sh
npm run verify:full
npm run evaluate:specialists -- prepare --commit "$(git rev-parse HEAD)" --output NEW_DIRECTORY
npm run evaluate:specialists -- score-authenticated --commit EXACT_SHA \
  --input evaluation-signed-trace.json --trusted-key evaluation-fixture-public.pem \
  --output NEW_SCORE_DIRECTORY
```

The old unsigned `score` command remains an explicitly unverified diagnostic.
Authenticated fixture captures are labeled `AUTHENTICATED_FIXTURE_CAPTURE`.
A future live capture remains labeled quality-review-pending. Both keep
`liveReasoningValidated: false`; deterministic fixtures cannot certify model
quality. The CLI makes no model calls, loads no credentials and connects to no
database when verifying/scoring a capture.

## Acceptance and evidence

`verify:full` now includes **49 required stages**, adding whole-trial budgets,
adapter gates, authenticated orchestration and two checks around the existing
actual PostgreSQL restart. Existing suites are preserved. The source SHA is
forwarded as validated metadata into isolated tests, rather than trusting an
unavailable Git checkout inside the archived container.

Focused tests:

```sh
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:LOCAL_FIXTURE_PASSWORD@127.0.0.1:5432/sam_core_test \
  node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
# Repeat with tests/evaluation/adapters.ts or tests/evaluation/orchestration.ts.
```

For a container without a readable Git checkout, provide the exact 40-character
`SAM_VERIFICATION_SOURCE_SHA`. Full verification supplies it automatically.
The orchestration case reuses the actual Executive Brain/specialist/kernel
fixture suite, adding the real ledger and captured scorer. It feeds adversarial
source instructions, conflicting market claims, rejected earlier evidence and
corrective research through actual database/kernel execution. Independent fixture
reasoning calls overlap. Model decisions are simulated; model-quality and actual
prompt-injection resistance are not validated.

The full runner exports the signed fixture trace, fixture public key and scored
JSON/Markdown into its metadata directory, alongside commands, images, runtime
versions, per-stage logs and SHA256SUMS. No private key is exported. Retain all
failed focused/full attempts alongside successful acceptance; unexecuted checks
are never passed. Final results refer only to the exact final tested commit.
