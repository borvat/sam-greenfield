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
blocked/failed outcomes. Coordinator terminality represents an evaluation outcome;
it is not a synthetic business execution or proof that all tasks succeeded.

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
