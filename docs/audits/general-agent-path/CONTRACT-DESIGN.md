# One composition: concrete implementation contract

This design is disabled/offline work. It does not authorize activation, new grants,
credentials or model spend. The current 1370842 entry does not implement this contract.

## Builder and dependency boundary

Introduce one builder receiving an immutable manifest and implementations of model
transport, discovery/read adapters, verifier adapters, persistence, clock and trial
admission. Production and fixture callers use the same capability catalog, planner,
execution queue, transformations, review, recovery and capture. Fixture transports
must implement the same declared input/output/extraction contract IDs, never a second
report/planner shape. Keep trusted adapter identities; never accept arbitrary caller
callbacks as a way around fixture/live admission.

A manifest binds version, implementation commit, capability-schema digest, extraction
registry digest, wire-profile digest, goal-family scope and report/capture version.
Selecting it cannot widen existing caller authority or tenant access. Unsupported
contracts remain discoverable as UNKNOWN and cannot supply fabricated normalized
fields. No runtime import chooses a different graph based on business keywords.

## Durable obligations

A goal obligation contains objective hash, version, predecessor hash and deliverables.
Each deliverable has an ID, description, evidence fields, requested scope and semantic
requirements. Scope is one of: enumerated identities; explicitly selected subset;
full population under an authorized filter. Period includes endpoints and timezone
or explicit UNKNOWN. Units, currency/VAT interpretation and identity semantics are
known only through reviewed evidence contracts; absent information stays UNKNOWN.

Initial model output proposes obligations alongside a plan. Runtime validates their
structure and binds them durably to the goal before execution. A continuation carries
the same obligation hash. Refinement is monotonic: adding evidence/questions is
allowed; dropping a requested deliverable or expanding authority is not. Ambiguous
intent is recorded and may require user clarification; the system cannot silently
reinterpret success. A durable source is required, using existing permitted goal/audit
persistence if its immutability/access semantics suffice, otherwise a reviewed schema
migration with no implicit privilege expansion.

## Normalized evidence and collection receipts

Every record retains execution/verification IDs, extraction-contract hash, record
pointer, source hash and semantics. Collection receipts are runtime-built from actual
read executions: requested filter, page/cursor sequence, deduplicated identities,
provider terminal indicator and explicit omissions/errors. A model cannot declare a
collection complete. For enumerated scope, coverage means every requested identity is
accounted for. For population scope, coverage requires a defensible terminal receipt.
The same subset can satisfy its own obligation and fail a broader population claim.

Add bounded union to the transformation grammar: compatible schemas/units only,
explicit identity conflict policy, all input provenance retained and maximum total
rows enforced. Add bounded acyclic derived chaining with recursive current-lineage
replay and scope checks. Do not overload existing raw-source contract IDs or strip
unknown VAT/coverage during union, ratios or joins. Model chooses the operations.

## Admission, recovery and persistence

Create one goal-family execution scope used by planning, dispatch, readback, local
derivation, delegation, maintenance and report commit. Every consuming operation
has a durable reservation before entry, an invocation identity and a terminal result
or retained unknown outcome. Link source reservations to queue/execution IDs and
readbacks to execution/verification IDs; capture verifies conservation against actual
rows. Retry/fallback consumes remaining budget, never a fresh copied allowance.

Scope recovery and event consumers to the same enrolled family; trial A must neither
wake nor reconcile trial B even in the same tenant. Bounded descendants require
explicit conserved enrollment and delegation reservation. All final commits recheck
scope/liveness/current verification. Write reconciliation stays on its existing
separate path; an uncertain write is never retried as a safe read.

Typed recoverable failures are limited to reviewed read-only operations: invalid
candidate/transform, missing authorized evidence, incomplete page collection and
conflicting evidence. They become durable evidence gaps and bounded replanning input.
Denied authorization, revoked trial scope, exhausted budgets and cancellation stop.
Unknown monetary meaning produces incomplete findings, not an invented calculation.

## Terminal capture and acceptance

Add a versioned ordinary goal-family capture, preserving specialist capture v1.
Capture reads actual terminal goal_read_reviews and current raw/derived verification
lineage, obligations, reservations, operations and learning/report references under
consistent locks/snapshot. All enrolled goals must be accounted for, including honest
blocked/failed outcomes. The coordinator remains NEW; trial sealing records the evaluation outcome without
inventing a completed coordinator execution or claiming every task succeeded.

Authenticated capture scoring separates integrity, safety, functional fulfillment
and human/model quality. A valid blocked report passes honesty but fails a nominal
sufficient-evidence objective. No scripted expected answer may enter model prompts.
Raw observation, deterministic derivation and interpretation stay distinguishable in
reports and persistent learning. Existing restricted SOURCE_FACT storage remains
unchanged; unsupported derived learning is retained only in report provenance.

## Required implementation order

1. Manifest + obligations + family-scoped maintenance; prove no cross-trial mutation.
2. Ordinary family capture with operation/receipt linkage; seal/export/authenticate the
   actual three-goal path and reject tampering or missing operations.
3. Same builder exposes discovery, generic derivation and bounded delegation; wire
   reviewed schemas and receipts, then union/chaining and typed safe recovery.
4. Run complete nominal and adversarial matrix on that one disabled composition;
   independent code/capture audit, then full exact-commit acceptance.
5. Request only genuinely required operator activation/evaluation scope after these
   gates pass. Existing service pause/restore and existing DB role boundary remain.

No step is satisfied solely by a new helper unit test or a fixture bypassing the
selected entrypoint. Preserve the prior checkpoints; report remaining gaps explicitly.

## Joint invariant gates from complementary independent audit

These must run through one positive service assembly with substituted fixture
transports, not only helper calls or disabled-import tests:

1. Reviewed model/endpoint cap includes reasoning and provider tolerance.
2. Every source, readback and goal decision reserves durably before entry; zero
   limits and crashes between every transition retain charges and deny dispatch.
3. Startup recovery, dependencies, outbox/event consumption and ongoing maintenance
   are confined to the enrolled family, including same-company cancelled/due goals.
4. Bootstrap validates the integration/report permissions actually used, as well as
   specialist/evaluation profiles. Test provisioning extra profiles cannot mask a
   missing production preflight. No grant expansion follows from this check.
5. Raw-only reports recheck latest source receipts under final commit locks even with
   knowledge capture disabled. Test both insertion and update revocation races.
6. Versioned capture certifies actual three child reports while the coordinator stays
   NEW; no fabricated specialist report or completed root.
7. A shared lifecycle harness crosses restart, concurrency, cancellation and receipt
   revocation with the exact same runtime assembly and immutable manifest.

These complement the goal-scope/collection/transform/delegation requirements above.
No green component total can substitute for the combined gates.

## Concrete delegation seam identified at 5bfe7b8 (not implemented)

The remaining shared graph cannot safely be implemented by concatenating bundles:

- `intelligence/engine.ts` reserves under `specialist_sessions.agent_id` and creates
  goals linked by `specialist_delegations`; its gateway uses the specialist ID.
- `withGoalEvaluation` authorizes exactly three `goal.<uuid>` principals and charges
  those immutable accounts. Adding specialist IDs would create a different budget
  contract, not merely expose a tool.
- `transformVerifiedSources` requires every raw execution to belong to the exact
  goal. Specialist child records cannot be silently read as parent records.
- Legacy intelligence composition hashes catalog/tool definitions differently,
  requires a root specialist report and has its own capture/learning semantics.
  The ordinary goal-family path uses goal_read_reviews and leaves its coordinator NEW.

The coherent adaptation must keep logical specialist identity distinct from its
budget owner. Resolve that owner from an immutable, bounded delegation chain rooted
in one of the three enrolled goals, not from model parameters. Each delegation
reserves once before inserting the child, shares remaining parent/trial allowance,
and is included in the same capture. No new allowance or late agent enrollment.

Verified descendant evidence needs a distinct scoped loader contract, not removal
of the same-goal check. Require current delegation receipts, same tenant, bounded
acyclic ancestry, active parent plan identity, the exact authorized assigned read,
current verification and hash, and original execution/goal IDs in every citation.
Revoke replay if any delegation, plan or raw receipt ceases to be current. Ordinary
same-goal callers retain their current stricter contract. Derived lineage locks must
include authorized descendant executions in deterministic order through report commit.

The shared entry builder must bind the above ownership protocol, obligations schema,
source/extraction schemas, collection semantics, provider wire profile and report/
capture versions in one manifest. It must install discovery, derived operations and
specialist advancers together; fixture substitution replaces transport bytes only.
A separate interpretation claim may never masquerade as a raw SOURCE_FACT. Existing
learning policies/grants remain unchanged.

Must-pass integrated tests before this graph is called a candidate:

1. Three unfamiliar objectives discover changed source IDs, collect multiple pages,
   derive reproducible outputs and optionally delegate reasoning on the same runtime.
   No tool names/plans supplied in goal text and no hidden expected-value solver.
2. Two logical specialists share one enrolled goal allowance; zero delegation,
   model, tool and readback budgets deny callbacks before dispatch. Restart cannot
   create fresh allowances; an unrelated same-company family remains untouched.
3. Parent transforms can use only explicitly delegated verified descendants;
   siblings, other trials, reparented goals, changed assignments and revoked source
   receipts fail replay and final commit. Preserve raw provenance rather than copy it.
4. Actual child reports feed the single ordinary objective review/capture route;
   coordinator stays NEW. Raw observations, deterministic results and interpretations
   stay distinct. Nominal sufficient-evidence variants must complete; missing-unit,
   VAT, period and unavailable-page variants must remain explicitly incomplete.

This is a bounded redesign of composition ownership and provenance contracts. It
reuses the queue, fencing, verifiers, exact arithmetic and ledger. No wholesale
replacement, permission bypass or new infrastructure is justified by this finding.
The offline redesign itself is authorized code work; production registration, scoped
profile admission and live spending remain separate operator decisions.

The same inspection also found a fixture-specific acceptance seam:
`createSpecialistIntelligence` selects `commercialScenario(trial.spec.caseId)` and
`claimSupportForScenario` invokes `commercialClaimSupported`. That oracle is suitable
for independent benchmark scoring, not for the shared general-agent runtime's claim
contract. The unified path must validate claims through generic exact source pointers,
reviewed semantics and replay. Golden scenario knowledge must stay outside planning,
specialist decisions and runtime completion. Reusing this engine without separating
that oracle would preserve a hidden task-specific acceptance path, even if its model
prompt contained no expected answer. This remains an implementation requirement,
not a claim that the current candidate has removed it.
