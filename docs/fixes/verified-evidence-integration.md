# Verified evidence integration slice

Continues PR55 from tested `9da55fc3d075a1776acf3162397c8b1f17e602b2`.
Existing repository, Render services and database remain the architecture.
No production registration, permission, credential, migration or model change.

## Implemented path

A trusted composition can explicitly call `withVerifiedEvidence` with reviewed,
versioned output/extraction contracts. No production entrypoint calls it. The
factory publishes only reviewed extraction metadata; undeclared fields remain
unknown. Contract IDs bind to exact capability IDs and full configuration hashes.
Models choose contract IDs and finite operations, never source semantics.

The existing reviewer can request `derive_verified_evidence` as an ordinary GREEN,
sideEffect=false continuation. Normal scope/authority/lease checks apply. The tool
receives queue identity and fencing token only from the runtime executor, resolves
its goal/entity from that active work, and rejects mismatched parameters. It never
accepts model-supplied goal/entity context. Inputs are current latest-VERIFIED raw
executions in that exact goal/entity, checked by existing RLS and content hashes.
Nested derived inputs are refused; a single bounded plan can compose intermediate
relations, avoiding unbounded provenance graphs.

Derived artifacts contain canonical request, contract bindings, verified execution/
verification/row references, result metadata, source/plan/output/provenance hashes
and a deterministic content identity. The existing fenced execution ledger is the
artifact store: no new table or storage permissions. Repeated adapter evaluation
replays locally with the same artifact identity and no source work; duplicate
commit for a queue item is refused by the kernel. Distinct separately authorized
queue items remain distinct execution audit records, even if content identities
match. This is not a claim of cross-queue execution-row deduplication.

Independent verification replays against current inputs and contract versions.
Review rechecks both the stored execution hash and the underlying raw lineage,
then checks again before committing its report. Changed contracts, tampering or
revocation fail closed. Invalid derived sources are not passed to the model and
produce a persisted blocked report with a sanitized reason. Mid-review invalidation
prevents completion. Existing 40-second model deadlines, call/round limits and
48 KB total input ceiling remain unchanged.

A derived finding must identify an exact row/field/value and a literal quotation.
The runtime checks it and copies original input-row citations plus artifact/output
hashes into the report. Fulfilled requirements citing a derived execution need a
corresponding derived finding. Unknown semantic lineage and VAT, missing values,
partial coverage and selected scope block structural completion. Objective critique
still decides whether supported claims address the actual requested deliverables.
Arithmetic is not treated as independent business truth.

Knowledge capture retains a literal derived quotation as INFERENCE, not SOURCE_FACT.
Default memory recall excludes derived executions because it has no reviewed contract
registry for replay. Reuse in the goal's review occurs through the execution ledger
and fresh replay; no stale derived knowledge is promoted to an external fact.

## Acceptance matrix

| Scenario | Required isolated result |
| --- | --- |
| Two-period monetary records | Exact decimal sums; unknown VAT remains blocked |
| Supplier promises/deliveries | Exact day difference; unavailable page remains blocked |
| Duplicate inventory | Group counts, original-row citations, completed report; no deletion |
| Persistence/retry | Same artifact identity on retry, one queue commit, cold replay; no repeated raw reads |
| Scope | Non-owner/non-bypass role: own tenant succeeds; missing/foreign context denied |
| Integrity | Stored hash tampering, changed contracts, forged values and revoked inputs denied |
| Report/knowledge | Derived provenance preserved; inference label; invalid lineage blocks before model call |
| Compatibility | Full exact-head acceptance including prior PR54 citation/knowledge tests |

Natural-language fixture goals have no tool names or plans. Their model decisions
are scripted test doubles, not evidence of autonomous planning or generalization.
No paid or live inference is performed.

## Remaining boundaries and next bounded live evaluation

No real-source extraction contracts are installed. An operator-reviewed adapter
contract must establish actual fields, units/VAT meanings, date and pagination
coverage before registration. Unknown fields cannot be filled in from assumptions.
The existing conservative monetary guard is unchanged: computed monetary output
alone does not bypass its requested-period sales proof. An equivalent general
monetary proof contract remains necessary before broad financial completion can be
claimed. Filtered/inner-join scope likewise remains conservative until objective
scope is independently established.

After independent code review, production activation requires an explicit decision
to register this capability, its existing-style verification contract and reviewed
source contracts within the current bundle. This slice does not perform that step.
No broader persistent privileges or infrastructure are required by its storage path.

A subsequent authorized evaluation should freeze the reviewed candidate and contract
versions, use the existing services, specify tenant and read-only data scope, and set
an explicit model/spend ceiling without changing current call limits. Use the same
three unseen goal families with changed IDs/pages/unavailable sources. Require
ordinary intake, dynamic model-chosen operations, traceable raw and derived claims,
restart/replay consistency, no duplicate external work, and honest incompleteness.
Only those live results could establish autonomous quality; synthetic acceptance
cannot. No old goal replay, budget reset or production evaluation is authorized here.

## Independent review corrections

Monetary columns are identified by reviewed `semantic: monetary`, a VAT declaration,
or conservatively currency-shaped units, independent of objective keywords. Missing
VAT stays unknown through aggregation and downstream arithmetic. A generic invoice
sum with EUR but no VAT is blocked even without sales keywords.

Derived source rendering uses bounded canonical cell quotations containing artifact
identity, output hash, row, field and value. Quotes cannot be borrowed from another
field or row with the same scalar. Projection omissions remain explicit; only whole
canonical cells are citable. Knowledge uses this same canonical representation.

A two-connection barrier reproduced a revocation committed after final replay but
before report commit, with a COMPLETED report and latest raw FAILED verification.
Final review now locks all participating executions in sorted order before the goal,
then locks verification receipts, replays, and holds locks through report/knowledge
commit. Execution locks block new receipt FK inserts; receipt locks block updates.
This uses existing runtime SELECT/UPDATE privileges, not new grants. Regression
barriers verify both insert and update are blocked until commit. This establishes
validity at report commit, not immunity to later revocation of historical evidence.

The model-visible capability now exposes a full discriminated operation grammar, including required join keys, aggregate fields, comparisons and arithmetic operands. The same JSON schema is enforced by the ordinary executor; missing fields and unsupported operators are rejected before adapter execution.
