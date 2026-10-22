# Phase 8 security review

Scope: Phase 7 controller, Gateway, adapter/permit, evaluation profile/capture,
specialist engine/composition/learning, plus the Phase 8 commercial path.
This is an independent review pass by the engineering assistant, not an
independent human sign-off, penetration test or production certification.

## Reviewed boundaries and evidence

| Boundary | Enforcement and acceptance evidence | Limit |
| --- | --- | --- |
| Whole-trial money/tokens/calls | Row-locked durable ledger, immutable spec, monotonic global and declared-agent counters; family reservation shares transaction with trial reservation | Reservation quotes are conservative ceilings, not paid invoices; provider billing behavior remains untested |
| Bootstrap, fallback and retries | Existing Gateway wraps bootstrap and specialists; each actual attempt reserved, failed attempts retained, readbacks separately charged | Separate new trials have separate budgets; there is no automated study-wide spend ledger |
| Invocation admission | Rechecks reserved agent deadline and trial state, ticket metadata binding, one-use invocation, no successful completion before invocation | Admission is a transaction boundary, not a guarantee of instantaneous physical network cancellation |
| Recovery/cancellation | Actual SIGKILL and fresh-process recovery; actual isolated PostgreSQL restart; immutable deadline/agent deadlines and unknown reservations | Abrupt kill may leave unknown attempts. Never refund them or certify incomplete traces. Already admitted requests might consume their reserved maximum |
| Signed capture | Separate operator role/key, append-only chained events, operator seal, exact current verification IDs; trusted-key signature check plus strict accounting/state validation | A privileged DB owner/superuser or compromised signing operator is trusted; signatures do not attest objective truth or genuine provider identity by themselves |
| Model proposals | Strict Decision schema; authorized capabilities and immutable delegation links; field-bound commercial quotations; same-topic conflicting final claims rejected | Semantic persuasion, poor plans, bad math in summaries and topic-alias conflicts require human model-quality review |
| Scope/authentication | Existing fixed company/org RLS and migration admission; opaque trial/adapter/permit identity; source canonicalization; populated foreign-tenant negative tests | Evaluation setup is an operator process, not a new public login endpoint; arbitrary compromised host code is outside the model-only threat boundary |
| External side effects | Catalog only configured reasoners + source.read; registered frozen reader/verifier; callback overrides refused; all tools GREEN/read-only; no side-effect operation records | New providers/tool adapters need separate security review; no authorization is inferred from source text |
| Memory | Current verification, scoped exact quotations, observation→hypothesis→evaluation→lesson ancestry, revocation and tenant tests | Verified quotation means a supported observation, not general market truth, successful experimentation or permission to change policy |
| Live activation | `LIVE_EVALUATION_ENABLED=false`, no environment override; valid owner-signed fixture approval still denied before credential access | Live transport, actual provider token accounting, request IDs, timeout/cancellation billing and model quality are NOT validated |

The reproduced corrections and their negative tests are listed in
[Phase 8 review](PHASE8_INDEPENDENT_REVIEW.md). New commercial source readbacks
reject archive/untrusted records. Final evidence verification checks every
citation and every captured source, including unused receipts. The frozen
observation date is explicit so reproducibility cannot be confused with live
freshness.

## Remaining security and production gates

- Independent human review of code, signed evidence and semantic scoring is
  pending. Preserve all failure history; do not replace it with a passing summary.
- Real activation requires a separately reviewed release change, explicit owner
  scope/spend approval, trusted public keys, exact prices, isolated credentials
  and provider-specific framing/usage/fallback review. This phase supplies none
  of the credentials and makes zero live requests.
- The dormant HTTP adapter supports an OpenAI-compatible wire protocol. Other
  provider protocols need a registered bounded adapter and acceptance coverage.
  Review approved endpoint host/DNS/egress restrictions and secret redaction
  before enabling outbound transport. HTTPS and redirect refusal alone are not
  a complete egress policy.
- Frozen, invented source readback cannot establish independent real-world
  sourcing, supplier truth or current market validity. External research access
  requires separate authorization and source provenance/freshness controls.
- Study-wide repetition limits remain an owner/operator control. Do not assume
  a per-trial cap authorizes unlimited trials or automated reruns.
- GitHub billing restriction, effective branch rules/required checks and review
  approvals remain governance gates. Local evidence cannot manufacture hosted
  statuses, authorize merge or waive protections.
- No staging, production, OAuth/MCP live integration, production backup/restore,
  live operational monitoring or 24-hour stability outcome is certified here.
  Existing protected stability-test branches and services are untouched.
