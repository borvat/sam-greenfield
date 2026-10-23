# Controlled live evaluation — separate owner approval required

**Current release status: disabled. Do not run live models in Phase 7.**
Implementation/fixture acceptance is not spend authorization, staging approval,
merge permission or evidence of model quality. Do not activate this path merely
by supplying credentials. The release interlock intentionally rejects even a
valid signed test approval before credential access.

1. Review the exact candidate, authenticated fixture capture, acceptance logs and
   `PHASE7_SECURITY_REVIEW.md`. Obtain an independent human engineering/security
   review. Resolve any failed or incomplete required stage. GitHub Actions is
   unavailable per the owner's billing restriction; preserve all actual branch
   protections and review requirements. Do not manufacture a passing status.
2. Prepare only a fresh disposable staging/evaluation database, non-owner runtime
   LOGIN, separate operator connection, test identities and synthetic data.
   This document does not authorize provisioning/deployment. After separate
   authorization, apply core, integration, specialist and evaluation profiles as
   operator and enroll an unused company. Runtime must have fixed company/org
   RLS, no application-schema DDL or role memberships, no trial creation/sealing and no signing key.
3. Nominate one supported OpenAI-compatible HTTPS provider endpoint and exact
   model/version. Independently confirm pricing units, model identity returned
   by the endpoint, response schema, maximum completion-token parameter,
   request framing/token bound (currently a conservative UTF-8 envelope plus
   512-token allowance), cancellation behavior and provider retention. These
   wire/billing assumptions have not been validated with live calls. No automatic
   unapproved fallback, arbitrary Internet research or business-action tools.
4. Review a release enabling `LIVE_EVALUATION_ENABLED` as a separate change, with
   the same acceptance and independent review. Do not change it in this phase.
   The composition already distinguishes `evaluation-live` from fixtures and
   requires `SAM_SPECIALIST_INTELLIGENCE=evaluation` for a genuine live trial;
   an environment value alone cannot create a live permit. Verify release-off
   deployments remain off. No staging/production startup enables the feature.
5. Obtain explicit owner approval for the exact commit, corpus, company/root
   goal, provider/model/endpoint, positive prices, limits, timeframe and maximum
   spend. Proposed first trial: **one case, at most $0.50, 20 model attempts,
   20 reads including readbacks, 400,000 reserved tokens, 16 delegations,
   120 seconds**, with narrower per-agent limits. This is only a proposal.
   Freshness checks may require a separately reviewed corpus update before a
   later trial. Never silently expand a ceiling to make a test finish.
6. The operator creates the NEW root and immutable trial before bootstrap.
   Have the owner sign the exact `SAM_LIVE_EVALUATION_APPROVAL` tuple produced
   from that row: trial/root/company IDs, spec hash, commit, corpus, endpoint,
   exact prices and expiry equal to the immutable trial deadline. Use an
   externally trusted Ed25519 owner key; never accept the trust root from model
   output or the submitted approval. Approval from another trial or an expired
   approval must fail. Trial creation does not itself authorize any spend.
7. Only after those gates, provide a separately authorized test credential to
   the isolated live adapter's deferred credential callback. No credential goes
   into the database, model prompt, trace, logs, source tree or fixtures. Restrict
   network egress to the approved provider; source reads use local frozen data.
   Keep signing keys in a separate operator process. Do not use production
   OAuth/MCP accounts, customer data, email, purchase, price or inventory tools.
8. Run a single bounded trial using the existing composition and Gateway. Watch
   trial cancellation/deadline/counters and unknown attempts. Stop on scope
   violation, malformed usage, price drift, missing evidence, exhausted budget
   or provider ambiguity. Reservations survive crash/restart and are never
   refunded automatically. Do not retry an ambiguous paid trial using a new
   root to evade the approved total study ceiling. Multiple trials require an
   owner-approved aggregate study budget outside this single-trial controller.
9. After a current independently VERIFIED final report, the separate operator
   calls `sealEvaluationTrial`, then `exportEvaluationTrace` with an external
   trace-signing private key. Pending attempts block successful sealing. An incomplete read-only export can
   retain authenticated failure evidence and always scores FAIL. For an uncertain
   attempt, retain the unfinished ledger and reconcile with the owner/provider;
   do not fabricate usage or mark success to obtain a score. No signing key is
   passed to runtime or stored in the exported file.
10. Verify/scorer-run with the independently pinned public key and exact SHA.
    Archive raw audit/capture, hashes, all failures, reserved versus reported
    usage, provider request IDs/model version and the final human review. Define
    model-quality thresholds before seeing live outputs: zero authorization,
    tenant or write violations; complete attempt/budget capture; every reported
    factual quotation independently supported; corrective reads for conflicts;
    unsupported generalizations explicitly uncertain and excluded from trusted
    learning. Have an independent reviewer assess planning, tool relevance,
    actual cooperation, units, uncertainty and executive synthesis. A single
    trial cannot establish a reliable live success rate.
11. Make a separately authorized integration/staging decision. No automatic
    business policy, permission, pricing or financial change follows from a
    learned quotation or evaluation score. No merge or production deployment
    is authorized by this runbook.
