# General-agent completion assessment

Reviewed application: 1370842ad3d3f0ecf63ef5227e10386a69690b74, following
independently audited PR55 f9c74cc and evidence 8a083bc. This is an assessment,
not a completion announcement, release approval, or proof of model autonomy.

## Technical verdict

The repository contains usable safety and execution foundations: fenced work,
tenant isolation, independent verification, durable accounting, bounded planning,
and deterministic derived evidence. It does not yet contain one demonstrated
end-to-end composition that meets the owner's general-agent objective. A full
rewrite or new infrastructure is not justified by the evidence. Integration and
completion-contract redesign is necessary; further isolated adapter patches alone
will not close the gap. Existing-service live activation must stay blocked.

The repeated defects came from testing modules and historical harnesses more
thoroughly than the exact proposed entrypoint. Green totals were overinterpreted as
coverage. Provider compatibility was treated as a universal wire contract; runtime
admission was mistaken for durable resource accounting; multiple report/goal
lifecycles were composed without a common terminal protocol. These are engineering
and coverage failures, not established provider faults or insufficient user prompts.

## Whole-path findings and boundaries

1. Goal understanding and planning: planner.ts passes catalog descriptors rather
   than business-keyword forced routing. Requirements are still model-generated
   strings, not a durable typed deliverable/coverage contract established before
   execution. A second model critique is useful but not an independent semantic
   oracle. Arbitrary natural-language correctness remains unproven.
2. Provider wire: 1370842 corrects exact reviewed endpoint/model output-limit
   profiles and Qwen tolerance. Exact body tests prove serialization, not actual
   provider billing, tokenizer framing or autonomous reasoning. Existing signed
   budgets remain; unknown models/endpoints fail closed. No paid calls occurred.
3. Selection/composition: boundedEvaluationCompositionModule constructs only
   frozenGoalEvaluationBundle, whose sole capability is source.read. It does not
   install withVerifiedEvidence, real source discovery or intelligent specialists.
   Default production exposes additional metadata but does not install derivation.
   Thus neither entry demonstrates the requested whole capability graph.
4. Ingestion: reviewedOutputContracts maps only supported fields. Actual Google
   MCP content remains opaque except runtime-bound artifact metadata; existing Bol
   order prices have UNKNOWN monetary/VAT semantics. Source readback verifies
   retrieval consistency, not business truth, full pagination or completeness.
   These are real source-contract gaps, not report-wording problems.
5. Transformations: grammar, exact arithmetic, semantic uncertainty, scope-reducing
   joins, row provenance and replay exist. Integration tests directly supply
   transformation plans. This does not establish that a model can discover and
   compose them from a novel objective. The proposed entry never exposes them.
6. Delegation: the ordinary goal entry enrolls exactly three goal IDs; the frozen
   bundle has no specialist delegation capabilities. Specialist engines and signed
   delegation accounting exist elsewhere. Their tests do not prove this entry can
   delegate, collect evidence and synthesize it under the same trial.
7. Accounting: 1370842 closes confirmed missing goal-iteration, source and readback
   reservations. Shared trial reservations now precede those callbacks; crashes
   retain consumption. Exact composition zero-limit tests are required, not merely
   direct calls to the reservation API. Derived operations and delegated descendants
   still need the same whole-path accounting contract and conservation proof.
8. Verification/reporting: source/derived hashes, exact cell citations, current
   verification and locked final replay are enforced. Honest blocked reports are
   valid outcomes. Completion guards do not turn missing EUR/VAT/coverage into facts.
9. Capture mismatch (confirmed code path; executable repro accompanies this audit):
   goalEvaluationComposition deliberately leaves the root NEW and writes three
   goal_read_reviews. sealEvaluationTrial instead requires a COMPLETED root with a
   VERIFIED execution.result.report and specialist report/evidence shape. These
   lifecycles cannot seal through the current shared API. A model run would not fix it.
   trace.ts also projects tool results and readback execution IDs from specialist
   reservation metadata; ordinary adapter accounting needs explicit ledger linkage.
10. Learning: derived findings are intentionally excluded from SOURCE_FACT-only
    knowledge capture. Reports retain their provenance. verifiedLearning is refused
    by the evaluation composition; specialist learning uses a different report path.
    Neither is proof of a unified learning loop. No grants/triggers should be relaxed
    to make a test pass; unsupported learning must remain an explicit limitation.
11. Recovery: SIGKILL model reservation tests exist. Ordinary composition also invokes
    tenant-visible recovery, dependency reconciliation and event relay without a
    trial goal filter. Trial row admission does not itself limit their affected rows.
    This is a static scope concern requiring a two-trial same-tenant regression,
    not a claimed executed exploit. Source/readback crash points and derived artifact
    recovery require whole-path tests too.
12. Operation: the optional module replaces ordinary composition on the same runtime
    service. Explicit drain/pause/restore is required. Current scoped principal is
    unverified, not proven absent; checked-in ordinary roles do not prove evaluation
    access. No blocked database access may be bypassed. Node22 remains pinned.

## Proposed single production-shaped composition

Use one goal lifecycle and one runtime composition builder in the existing service.
Its immutable composition manifest must bind: goal enrollment/delegation policy,
capability/input/output/extraction schemas, adapters/verifiers, model wire profile,
trial budget scope, report/citation protocol and terminal capture version.
All authorized decisions, source calls, readbacks and local derivations must pass
one accounting/admission boundary; none may be hidden in an adapter or supervisor.

The same builder must expose authorized discovery, reads, generic transformations
and bounded specialist delegation. Offline mode substitutes only provider transport
and source transport with fixture implementations behind the same schemas and
verifiers. It must not substitute a different planner, report shape, scheduler or
budget path. Where an actual output schema is unknown, expose UNKNOWN and require
an honest evidence gap; do not fabricate an extraction mapping.

Choose the ordinary goal/read-review lifecycle for the three held-out goals. Add a
versioned goal-family capture contract that snapshots actual child reports, source
and derived execution/verification identities, all reservation links and terminal
states. A coordinator can be terminal only after every enrolled goal is terminal;
it is an evaluation outcome, not a fabricated business execution. Preserve the
specialist capture version for its existing callers. Do not force an ordinary report
into execution.result.report or mark the root COMPLETED merely to satisfy a query.

Nested specialists must be explicitly enrolled under parent goals, with conserved
shared/per-agent budgets and bounded depth/fan-out. Either implement this under the
same manifest or state that delegation is unsupported; do not silently substitute
three preselected independent goals for dynamic specialist decomposition.

Persistent learning remains within existing source-fact privileges. Derived lessons
remain cited report artifacts unless a separate narrowly reviewed learning policy is
approved. Learning quality is separately measured, not inferred from row insertion.

## Completion sequence and stop conditions

A. Freeze and audit the manifest/lifecycle/capture design above, including negative
   scope and accounting tests. Do not label 1370842 release-ready because two local
   corrections pass. Preserve its evidence as a diagnostic checkpoint.
B. Implement the unified disabled composition and versioned terminal capture. Reuse
   existing executor, verifier, trial ledger and report persistence. No SQL privilege
   expansion or production registration. Prove a whole trial can seal/export/verify
   actual reports and that omitted/altered claims or events fail verification.
C. Wire reviewed source contracts, generic transformations and bounded delegation
   into that same builder; add goal-family recovery isolation. Unsupported real
   source schemas must yield an explicit actionable blocker, not synthetic semantics.
D. Run the matrix below on one frozen commit with randomized fixture IDs, source
   order, pagination, missing sources and injected failures. Preserve all failed
   attempts. Independent review must follow the actual composition, not helper mocks.
E. Only after offline gates pass: propose a separately authorized bounded model
   evaluation over frozen sources on that exact version. Three held-out objectives,
   no supplied tool names/plans, fixed call/token/spend ceiling, retained failures,
   independent human scoring. The numeric fixture limits are not spending approval.
F. Customer-source evaluation is a further boundary after schema/coverage contracts
   are established. No live general-agent success can be inferred from step D or E.

Routine authorized work: code/design/fixture tests, exact-head acceptance and review.
Operator-only boundaries: deployment/activation, scoped profile access if absent,
trusted signed authorization material and paid provider evaluation. Reuse existing
services/database. No new host or credential is presumed necessary.

## Must-pass regression and evaluation matrix

| Path | Required evidence on the same composition | Current status |
| --- | --- | --- |
| Natural-language goals | Two-period comparison; promises versus deliveries; duplicate-document inventory without deletion; varied IDs/pages/unavailable sources; no supplied plan/tool names | Scripted fixture safety only; model autonomy untested |
| Goal contract | Explicit deliverables, period/timezone, units, coverage and unresolved meanings retained through replans | Redesign/integration needed |
| Provider wire | Exact serialized bodies for approved model/endpoint; tolerance within reservation; unknown combos denied before credential access | Targeted tests pass at 1370842; no live transport proof |
| Tool selection | Same capability graph in offline and prospective live composition; unauthorized/unknown capability denied | Entry graph incomplete |
| Source ingestion | Actual schema fixtures; upstream artifact injection refused; pagination/absence/ambiguous identity preserved | Partial contracts; Google content and money meanings unknown |
| Generic arithmetic | Model-visible full grammar; exact replay; date/decimal separation; no VAT laundering; partial joins not complete | Deterministic component/integration tests pass; entry lacks derivation |
| Delegation | Dynamic children use enrolled budgets, depth/fan-out caps; parent synthesis cites independently verified child evidence | Existing separate specialist tests; unified path absent |
| Durable limits | Zero total/per-agent tools, readbacks, iterations, models and spend deny callbacks; concurrency/retry/fallback conservation | New actual-composition tests cover tools/readbacks/iterations; unified delegation pending |
| Verification | Latest receipt, hash/tenant/goal/contract binding; revocation races through final commit; no invented financial claims | Existing isolated tests; final composition must exercise all |
| Reports/citations | Blocked/incomplete is persisted; exact raw/derived citations; oversize evidence blocked honestly | Existing isolated tests |
| Terminal capture | Actual three-goal reports seal/export/authenticate; root not fabricated; missing/altered events/claims rejected | Blocking lifecycle mismatch |
| Learning | Existing restricted-role source facts preserved; unsupported derived learning excluded; report provenance retained | Limited behavior tested; no unified learning-quality proof |
| Recovery | Kill before/after each reservation/dispatch/verification/report commit; no refunds/duplicate source work; two-trial isolation | Model SIGKILL covered; other windows and maintenance scoping pending |
| Service operation | Stop drains; ordinary work paused; exact config restored; no old-goal replay; scoped principal verified by authorized operator | Offline runbook only; no production action |
| Acceptance integrity | Full applicable isolated suite, exact source tree/artifact hashes and cleanup; independent whole-path audit | Corrected-head full suite pending infrastructure resolution |

A missing capability or correctly reported data gap can pass safety acceptance but
cannot count as fulfilled commercial/general-agent functionality. No readiness label
is warranted until the selected composition's required rows above have direct proof.

## Requested-scope seam from independent review

Confirmed in readGoalReview.ts: every derived finding currently calls
assessDeliverables with completeCoverage:true, while current real-source extraction
contracts conservatively retain unknown coverage. This prevents completion even for
a user asking only about an explicitly named bounded subset. Removing the guard
would be unsafe. The goal contract needs scope semantics: enumerated identities,
requested subset or full population, period/timezone, and required evidence fields.
Collection receipts must bind query/filter, page traversal/cursors, identities and
terminal conditions. A subset can be fulfilled only when every requested member is
accounted for; it must never imply full-population completeness. Unknown monetary/VAT
or supplier-promise meaning remains unknown independently of coverage. Add paired
regressions: same evidence fulfills the enumerated subset and blocks the broader
population claim, with missing members, partial pages and conflicting periods.

## Consolidated independent findings and implementation boundaries

Independent whole-path review agrees with the no-go verdict and reuse recommendation.
Additional seams: the transformation grammar has no general multi-page union and
stored derived artifacts cannot be chained as inputs through the current raw-source
contract resolver. Ordinary work failures are recorded terminally; the narrow missing-
Drive recovery case is not generic recovery from a rejected safe transformation.
These must be designed together rather than disguised by fixtures supplying a finished
aggregate or calling internal transform APIs directly.

The durable obligation should be versioned and bound to the original objective hash,
with each deliverable declaring requested scope, evidence fields, units/meaning,
period/timezone and unresolved questions. Model proposals may refine requirements but
must not silently weaken them after a failure. Preserve predecessor hashes and reasons
across continuations. Use existing authorized persistence or a reviewed migration;
do not turn ordinary rows into authority grants.

Normalized evidence must separate observed provider fields, deterministic derived
values and interpretations. A collection receipt is evidence about acquisition, not
a model assertion: bind authorized query, filters, every page/execution hash, cursor
chain, identity deduplication and termination/omissions. Union must retain all inputs,
reject incompatible units/schemas and preserve unknown coverage. Derived chaining
must replay the entire bounded acyclic lineage under same-goal/tenant constraints;
no cross-goal record access is implied by specialist delegation.

Safe recovery must use typed failures (schema-invalid proposal, missing authorized
read, incomplete collection, revoked evidence, ambiguous semantics). Only reviewed
read-only/derive categories can request replanning within the remaining budget.
Authorization failures, cancellation, exhaustion and writes with uncertain side effects
must never become retryable through this route. A rejected transform should produce
an actionable evidence gap; no goal-specific formula or hidden repair script.

Nominal fixtures must supply sufficient reviewed evidence and require correct complete
reports. For each nominal case, generate missing-page, unknown-unit/VAT, contradiction,
revocation and unavailable-source variants that require correction or honest partial
reports. Passing only blocked variants is insufficient. Scripted model decisions test
this mechanism; a separately authorized fixed-version held-out model evaluation tests
whether an agent actually chooses and composes it.
