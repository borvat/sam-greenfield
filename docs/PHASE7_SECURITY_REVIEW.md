# Phase 7 security review

This is a separate security-focused review pass over the implementation and
adversarial acceptance evidence. It is performed by the implementation assistant;
it does **not** substitute for independent human approval or penetration testing.
The exact accepted SHA, commands, results and hashes are in the generated final
acceptance report, not inferred from this document.

## Security verdict

The implementation is suitable for isolated **fixture engineering acceptance**
when all required stages pass. Live activation stays release-disabled. No
provider credential was needed for implementation tests, and no live reasoning,
provider billing behavior or production readiness is certified.

Reviewed boundaries include the existing planner/composition, specialist engine
and scoped work claimant, Model Gateway attempt loop, new trial/profile SQL and
runtime access, frozen source factory, owner permits, operator capture/export,
standalone authenticated scorer and PostgreSQL/recovery tests.

| Threat | Implemented control | Reproducible evidence |
| --- | --- | --- |
| Bootstrap/replan bypasses specialist budget | Unique durable root-goal ledger exists before planning; production planner uses trial Gateway for that root only. All later families reserve against the same row. | `tests/evaluation/orchestration.ts`: real Executive Brain + specialist/kernel scenario; bootstrap included in aggregate. `budgets.ts`: reopening/replanning cannot reset model allowance. |
| Concurrency, retry or fallback overspends | Shared/per-agent atomic reservations; full input/output/cost quote before every attempt; no refunds on ambiguity; one invocation per reservation. | Budget race, fallback and exhausted-fallback tests; tool/readback quotas; PostgreSQL guards reject decrement/limit/deadline edits. |
| Crash resets budget | Commit-before-invoke event/counters, immutable root/spec/deadlines; unknown reservation remains charged and cannot be success-sealed. | Actual SIGKILL plus a fresh process, and actual PostgreSQL restart in `verify:full`. |
| Cancellation/timeout admits a late result | Admission serialized on trial row, deadline checked before handoff; abort-aware model signal, post-response check and SQL guards on successful execution/root plan. | Cancel-before-call, late-response, elapsed/agent-time and cancelled execution tests, plus existing specialist cancellation suite. |
| Side-effect adapter hidden behind GREEN metadata | Only registered reasoning capabilities and `source.read`; source reader/verifier must be the local frozen factory. Custom operational, authorization and learning-projection callbacks are rejected. | Unsafe replacement reader and learning callback are refused before invocation. Factory has no external transport or business dependency. |
| A provider is merely relabeled as a fixture | Opaque permit identity, registered adapter identity and mode matching; live adapter has a hard release interlock before credentials. | Forged permit, relabeled adapter, missing bounds, price/model mismatch and release-off tests in `adapters.ts`. |
| Forged/expired owner authorization | Ed25519 signature over the exact immutable trial/root/company/spec/commit/corpus/endpoint/prices/expiry tuple; trusted public key supplied outside the payload. | Correctly signed fixture approval still cannot enable this release; wrong scope/signature/expired approval rejected. |
| Company/customer data appears in model context | Operator-only unused-company enrollment, fixed non-owner LOGIN and restrictive FORCE RLS. Frozen source normalization removes extra adapter fields. Root and descendant work scope excludes unrelated queues. | Populated foreign company, spoofed GUC, wrong root, unsafe source envelope and untouched unrelated-work tests. |
| Temporary relation shadows counters | Controller pins its application schema before `pg_temp`; trigger functions use fixed search paths with invoker rights. | `budgets.ts` creates a fake temporary ledger and changes search_path; real exhausted allowance still rejects. |
| Runtime rewrites evidence or counter history | No trial creation/spec/root/expiry/seal grants; monotonic counter trigger; append-only event table with contiguous hash chain. | Restricted runtime DML denial, operator normal-DML mutation denial, missing receipt/fence admission refusal. |
| A self-reported JSON file manufactures acceptance | Operator reads current-plan independently verified rows and receipt IDs, seals only complete settled trials, signs outside runtime. Scorer independently verifies key, chain, conservation, deadline and authenticated projection. | Real signed fixture capture, standalone no-DB CLI, wrong key/payload/hash tampering rejection. |
| Failed trial is presented as passed | Pending attempts block complete sealing. Explicit incomplete signed exports always score FAIL and retain pending reservations without inventing usage. | SIGKILL incomplete capture is authenticated, retained and asserted to score FAIL. |

Costs in fixture ledgers use invented provider price configurations and are
reserved upper bounds, not actual invoices or paid activity. The complete
orchestration case currently reserves ten model attempts (one bootstrap plus
nine specialist calls), twelve tool/readback attempts and eight delegations.
The final acceptance artifact, not this description, is authoritative if a
fixture evolves.

## Limits of the claim and remaining gates

- A database superuser can disable triggers/drop tables, and a host administrator
  can change code. Trace signatures attest the operator's capture, not an
  uncompromised machine. Protect the operator connection, immutable deployment
  identity, trusted public keys and private signing keys separately from runtime.
- Existing core runtime identities still participate in kernel verification and
  approval data. They remain trusted application identities; arbitrary SQL or
  filesystem access must never become a model capability. This change adds no
  such capability. A broader split of all core verifier/approver identities is
  still a staging/production security review item.
- Fixture transports are trusted test doubles. Their responses do not establish
  real specialist reasoning, model-quality success rates or resistance of an
  actual language model to adversarial instructions. The capability gates, not
  model compliance with prompt text, enforce the test profile's action limits.
- A quotation verified by retrieval/readback is not universal truth. Older or
  secondary documents may be quoted as such; the scorer requires the final
  benchmark answer to use fresh expected evidence. Topic semantics, relevance,
  causal inference, units and business judgment need independent human review.
  No automatic policy/permission/business action follows from learned quotes.
- Physical network transmission and database cancellation are separate systems.
  Durable INVOKING admission is the ordering point: cancellation winning before
  admission denies the call; an already admitted request may incur its reserved
  maximum. Abort is best effort and never justifies a refund. Generic read
  callbacks may ignore cancellation; this profile uses only the local frozen
  reader, and rejects late results.
- Live HTTP endpoint behavior, exact provider/model response identity, pricing,
  request framing/tokenizer overhead, output-limit compliance, credential
  delivery and network egress have not been validated against a live service.
  They require separately approved review before any release activation. A
  malicious provider's billing cannot be certified by fixture token counters.
- Limits cover one durable root trial and its work. Multiple roots/studies need
  separate signed approvals and an owner-approved aggregate spend ceiling;
  creating a new trial must not be used to evade a study authorization.
- Effective GitHub protections/reviews remain a governance gate. GitHub Actions
  account restriction is reported by the owner; local evidence is not a hosted
  status and cannot bypass required checks. PR #47 remains Draft; PR #46 and
  protected/stability branches are not changed.

Before live use, follow `PHASE7_LIVE_EVALUATION_RUNBOOK.md`: independent review,
separate release decision, positive current prices and model-specific transport
bounds, isolated identities/data, exact signed owner approval and a separately
authorized test credential. No live activation, deployment or merge is part of
Phase 7 acceptance.
