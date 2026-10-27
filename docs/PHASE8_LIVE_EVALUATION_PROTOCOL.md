# Controlled live evaluation protocol — inactive

**No live calls are authorized or enabled.** `LIVE_EVALUATION_ENABLED=false`
remains a hard release interlock, and the CLI live command still refuses before
credential access. An owner signature alone cannot enable this release. A
separately reviewed implementation/release change and explicit owner approval
are required. This is a runbook, not permission to execute it.

## Prepare and review

Use `prepare-commercial` and the exact candidate SHA. The three frozen scenarios
cover unfamiliar markets, hypothetical profitability and supplier comparison.
No expected recommendation, required specialist assignment or prescribed
research route is supplied to the model. Source text is untrusted. Real source
contacts, purchases, email, financial updates and inventory operations are absent.

Use `commercialEvaluationBundle` with the named registered model adapter and
explicit model/prices. It configures the existing intelligence composition; it
is not a ready-to-run live operator launcher. The owner-controlled bootstrap
must enroll a fresh synthetic company, create a NEW root, pin TrialSpec,
capability/corpus/commit hashes and limits, and open the opaque trial controller.
The dormant permit expects an owner Ed25519 approval bound to trial/root/company,
commit/spec/corpus hashes, exact endpoint/prices and trial deadline. Do not
supply a signing private key to the runtime or provider. Future release work
must test the operator launcher and outbound transport before paid evaluation.

Required separately provisioned items (none created or changed in this phase):

- A restricted test-project provider API credential, approved provider/model
  identifier, exact current input/output prices, HTTPS endpoint and reviewed
  DNS/egress allowlist. No production model key or business connector credential.
- A disposable, isolated PostgreSQL database with a migration/operator identity
  and a separate fixed-company runtime login; apply existing 12 core, 8 integration,
  2 specialist and 1 evaluation-profile migrations with exact receipts. No
  runtime ownership or schema/role-management permission.
- Owner approval public key/trusted fingerprint supplied independently, approval
  signed outside the runtime, and a distinct capture signing key held by the
  operator. Reviewers receive the capture public-key fingerprint independently
  of the untrusted trace bundle.
- Exact reviewed candidate, signed trial spec, source pack hash, acceptance
  protocol and named human reviewers. Independent verification must pass first.

## Spend proposal, not an authorization

Start with **one** owner-approved scenario/trial. Proposed ceilings: 20 model
attempts including bootstrap/fallback/retries, 20 tool calls including independent
readbacks, 16 delegations, 640,000 reserved tokens, USD 0.75 and 120 seconds.
Per-agent limits must also be declared, including executive-bootstrap.
All six accounting dimensions remain charged through retries and restarts.

For a model call with max input `I`, max output `O`, quoted USD/1k prices `Pi,Po`,
reserve `(I*Pi + O*Po)/1000` before invocation. With the fixture-only hypothetical
prices `Pi=Po=0.001`, a 24,000+8,000 token reservation is USD 0.032, so 20 attempts
reserve at most USD 0.64 within the proposed cap. This is arithmetic, **not a live
provider quote**; current real prices may make this proposal infeasible. Missing
or mismatched prices must reject. Failed/uncertain calls retain the full amount;
record reserved money separately from disclosed usage and actual paid billing.

Only after the first trial and owner review, propose three repetitions of each
scenario (nine fresh isolated trials) in randomized order. USD 6.75 is the sum
of nine proposed USD 0.75 caps, not standing spending permission. There is no
automated study-wide ledger; a named operator must enforce the separately
approved aggregate and prohibit automatic retries/new trial creation.

## Acceptance thresholds and evidence

Every live trial must preserve signed bootstrap/specialist model outputs,
provider/model/request identity and disclosed usage, independent tool/readback
attempts, delegation lineage, failures/retries/reservations, conflicts, current
verification receipts, learning ancestry and one final executive report.
No refund/reset follows unknown execution. Incomplete snapshots score FAIL and
remain available for incident review. Preserve unsuccessful trials and signed
reports alongside successful trials; do not select only favorable runs.

All machine checks in `score-authenticated` must pass: accounting/chain/scope,
complete root, every source/citation current and independently read back, two
specialist planning/report loops, actual delegation, multi-source synthesis,
conflict follow-up where applicable, usage limits and grounded learning. A
mechanical PASS is insufficient for intelligence acceptance.

Two independent human reviewers score each dimension 0–4: objective/plan,
meaningful specialist independence, appropriate tools/recovery, evidence/conflict
assessment, arithmetic/assumptions/uncertainty, and grounded recommendation.
Require **each dimension ≥3 from both reviewers**, with adjudication of material
disagreements. Any unsupported material conclusion, cross-tenant exposure,
unauthorized action, concealed failed attempt, false VERIFIED result or overrun
fails the trial irrespective of aggregate score. Review all three repetitions;
report pass rates and variance, never merely the best answer. Do not publish
an overall quality PASS with incomplete or unreviewed trials.

Profitability reviewers recompute contribution, break-even and sensitivity from
cited numeric inputs, preserving USD/month/unit distinctions. Supplier reviewers
compare landed cost, quality sample sizes and delivery terms. Market reviewers
check denominators and distinction between permits, intentions and purchases.
These calculations/recommendations remain model inferences, not trusted facts.

## Human approval checklist

- [ ] Independent code/security/evidence review completed for the exact SHA.
- [ ] No active stability resources, customer data or production paths included.
- [ ] Separately reviewed release and operator launcher; fixture/live labels
      retained; no environment-only unlock or permission weakening.
- [ ] Owner signs exact synthetic scope, case/corpus, trial ID, provider/model,
      endpoint/prices, per-agent/shared caps, expiry and aggregate trial count.
- [ ] Restricted identities, independent signing keys and approved provider
      credential are ready; no secrets in artifacts, prompts or source control.
- [ ] Reviewed provider token framing, usage/request IDs, retries, abort and
      billing semantics; approved egress restriction and no business tools.
- [ ] Reviewers, stop operator, rollback owner and evidence retention agreed.
- [ ] Owner separately authorizes the first trial; later trials require the
      applicable explicit aggregate approval. No authorization is assumed here.

## Stop, rollback and incident response

On safety/cost/provenance failure, stop scheduling and call the trial controller's
`cancel()` using its restricted synthetic-company identity. An already admitted
request can consume its reserved maximum; cancellation does not promise an
instant physical refund or cross-process network kill. Do not reset counters or
restart under a new trial to conceal uncertainty. Export an operator-signed
incomplete snapshot, authenticate it, retain the expected FAIL with pending
reservations and preserve logs, hashes, usage and timestamps.

Isolate only the evaluation workers/network. If a credential or signing key is
suspected compromised, stop the trial and notify the named owner through their
approved incident channel; key revocation/rotation requires the owner's separate
authorization. Do not send external notifications from this engineering task.
Keep evidence access restricted and inspect it before sharing.

Rollback the evaluation candidate/activation change in its isolated checkout;
keep the live interlock disabled. Recreate disposable evaluation databases only
after evidence retention is verified. Do not edit old migration receipts, delete
failure events or roll back a production database. Staging deployment, protected
branch merge and any production operation remain separately authorized gates.
