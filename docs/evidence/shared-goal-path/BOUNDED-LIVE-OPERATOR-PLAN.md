# One bounded frozen-source model evaluation — operator decision package

Prepared 2026-10-23. **Proposal only: no activation, signature, production access, grants, credentials or paid calls performed.** This is one three-goal trial on the existing SAM repository/runtime/database, not another architecture phase or proof of business integration.

## Pins and scope

- Reviewed disabled application: `f8b570ac80158303993c3156872c76401ff965f9`; tree `d611d900909a5673db71d36fbff5e787a620dca7`.
- Exact-head evidence: `28d7e2e14ede356f39826e19b4a262907d2a199e`, `docs/evidence/shared-goal-path/service-f8b570a/`: 60/60 stages, 49 regression, 14 core and 49 isolated contract tests. Eight authenticated traces are fixture evidence only.
- Source manifest SHA256: `d45f9df1fe8b8a1ce7ad31faa4ef3baab990494f034aed7a58209e84f8d7823e` (764 tracked paths).
- Frozen case: `shared-records-v1`; corpus hash `bf388ec787578c345279f39684df6aa0cccae932bf15e5465bc81fbffcf45dc0`.
- Only `records.search`, `derive_verified_evidence`, `reason.records`; frozen search/readback and local deterministic derivation. No real Google, Gmail, Drive, bol, search/fetch API or external tool transport.
- `f8b570ac` cannot make live calls: `LIVE_EVALUATION_ENABLED=false`. Activation requires a separately reviewed minimal release commit R. Pin R, its exact manifest and applicable full acceptance before deployment; do not describe f8 acceptance as testing R. The signed spec.commit and SAM_EVALUATION_COMMIT must equal actual RENDER_GIT_COMMIT=R.
- Compute capabilityHash using `evaluationBundleHash(frozenSharedGoalEvaluationBundle(actualSyntheticEntityId))` from R. Company scopes affect the hash, so it cannot be truthfully prefilled without the verified entity ID. Do not use fixture UUIDs as production identifiers.

## Independent authentication gate

Parent-relayed independent review of application `f8b570ac` and evidence `28d7e2e` passes: **96/96 package hashes, 88/88 report artifacts, eight signatures and 757 events**, exact commit/tree, the 764-path source manifest and implementation digest, and reservation reconciliation. The shared capture contains three owners, ten executions, twenty model attempts and eighteen tool/readback charges. Deliberate incomplete captures remain incomplete. No authentication blocker was found.

Scope limit: that reviewer did **not** independently rehash all 764 source-file contents or rerun PostgreSQL. The earlier source-content rehash and 60-stage execution are implementation-side evidence, not additional independent execution. Authentication verifies the recorded fixture evidence; it does not prove autonomous model quality, production readiness, or grant permission to spend. **Fixture signatures and fixture public keys are not owner authorization** and must never be reused as the live approval trust anchor.

## Three natural-language inputs

Submit these exact goals once, with ordinary `sam.read_report.v1` completion contracts, GREEN authority and the verified synthetic company. Supply no tool names, schema paths, operation plans, expected values or fixture-decision callbacks.

1. “Using the supplied ledger records, compare the net EUR amounts for January and February 2026. Show each period's total, explain which is higher, cite the supporting records, and state the limits of the comparison.”
2. “For the supplied supplier delivery records, compare promised dates with actual delivery dates. Identify which deliveries were late and by how many calendar days, citing the evidence and any uncertainty.”
3. “Make an inventory of duplicate supplied documents using their content identity. Show the duplicate groups and counts with supporting evidence. Do not delete or modify anything.”

These are unseen goal phrasings for a real model, but the corpus/task families are public checked-in fixtures, not a blind benchmark. No claim of broad generalization is justified. The model must discover records and pages, choose transformations and recognize missing evidence. If obligation refinement or period semantics prevent completion, record a functional failure/limitation; do not supply a hidden plan, force UNKNOWN, weaken obligations or turn a blocked result into nominal success.

## Provider and hard ceilings

Proposed single existing provider: `deepseek`, model `deepseek-flash`, endpoint `https://api.deepseek.com/chat/completions`. Prior task evidence identifies Flash use; current deployed metadata has NOT been re-read here. Operator must confirm the existing model/base URL and price registry nonsecret metadata. Do not swap a different model or silently normalize a different endpoint. The allowlisted /v1 endpoint is distinct and would need an exactly matching signed payload if that is the verified existing configuration.

Official pricing checked 2026-10-23: Flash peak uncached input **US$0.30 per million**, output **US$1.20 per million**; off-peak rates are US$0.15/US$0.60. Reserve at the higher peak/cache-miss rates irrespective of timing or cache. Exact registry/environment/signed rates: inputPer1k=0.0003, outputPer1k=0.0012. Pricing source: https://api-docs.deepseek.com/quick_start/pricing/ . The advertised Flash version is DeepSeek-V4.1-Flash-1017; the alias is provider-managed, so record returned model/version/fingerprint and do not claim an immutable provider snapshot.

| Limit | Whole trial | Each of three enrolled goal owners |
| --- | ---: | ---: |
| Provider attempts, including retries/fallback attempts | 24 | 8 |
| Goal decisions/iterations | 24 | 8 |
| Reserved input+output tokens | 672,000 | 224,000 |
| Model cost reservation ceiling (USD) | 0.30 | 0.10 |
| Charged source operations + readbacks combined | 20 | 20, additionally constrained by whole trial |
| Delegations | 16 | 16, additionally constrained by whole trial |
| Trial/agent elapsed limit | 300,000 ms | 300,000 ms, clipped to trial expiry |
| Per-attempt input allowance | 24,000 | 24,000 |
| Per-attempt total generated-token allowance | 4,000 | 4,000 |
| Model-call / tool-call deadline | 20,000 ms each | 20,000 ms each |

No calls for executive-bootstrap: models/tools/iterations/tokens/cost/delegations all zero; positive timing/envelope fields retain valid limits. Three immutable goal.<UUID> keys own all delegated work. No extra specialist quota or second trial is authorized. All lower existing runtime/per-call limits still apply.

The input check uses a conservative serialized UTF-8 envelope plus framing allowance before transport; it does not claim an exact tokenizer count. DeepSeek wire field is `max_tokens=4000`; JSON-only output and default provider thinking behavior remain unchanged. See https://api-docs.deepseek.com/api/create-chat-completion/ . No server-side tools, search/fetch, model switch or Qwen fallback are selected.

Worst-case reserved call cost is 24,000/1000×0.0003 + 4,000/1000×0.0012 = **US$0.012**. Twenty-four attempts reserve at most **US$0.288**, within the **US$0.30** owner-approved ceiling. Aborts/uncertain outcomes remain charged; no refunds/reset to squeeze in another call. This bounds the application's admission using the documented provider contract; it is not a provider account-wide billing cap or a guarantee of immediate remote cancellation. Stop if pricing/wire behavior differs. No credit purchase/top-up is authorized.

## Nonsecret operator preflight — fill once before the owner decision

Use the already existing runtime service and database. Repository configuration names sam-runtime and sam-trial-postgres are references, not evidence that a particular current service/principal exists. Parent/operator must bind the exact existing service ID, current release/config snapshot, database schema, organization/entity UUIDs and existing scoped principal. Reuse verified resources only. An inaccessible principal is **unverified**, not absent; do not route around access denial or create a replacement credential.

Required checks/actions, only where missing and explicitly included in the final authorization:

- Existing integration + specialist + evaluation profile receipts, fixed tenant RLS/fences and report SELECT/INSERT permission. Ordinary integration access alone is insufficient. Do not broaden the serving role to every tenant.
- Existing unused synthetic company enrolled via the supported evaluation mechanism. Operational goals/knowledge make enrollment fail; do not relabel a business tenant or clear its data.
- Exact opt-in `packages/db/shared-goal-profile/001_shared_coordinator.sql` applied by the existing function owner through `applySharedGoalProfile`, if not already identical. This replaces an execution guard function; it is a persistent security-relevant operator action, not a routine runtime setting. It does not add grants, but requires explicit review/authorization. Snapshot the old definition/search_path for restoration.
- Independent verification rows: records.search/db_query/{readback:boolean}; derive_verified_evidence/db_query/{replayed:boolean}; reason.records/db_query/{grounded:boolean}; must_not_trust_execution_result=true. Validate or provision only these exact rows through the existing operator mechanism. Preserve originals for restoration.
- Existing provider registry, exact one-model configuration, nonsecret endpoint and price metadata must match the signed manifest. If prices/config differ, include the concrete nonsecret diff and restore values in the single decision package before execution; no silent update.
- Existing trusted Ed25519 owner-signing process/public key. The coding agent must not mint a key, sign as owner, or substitute a test key. If no process is verified, that is a specific blocker, not permission to create credentials.

The actual principal/access tuple is currently unverified. Therefore no definite new grant or credential requirement can be asserted. If no suitable existing principal can pass admission, stop and return the exact missing existing-profile access; do not execute an unspecified permission expansion under this plan.

## Ordered operation on the same service

1. After independent review and the single explicit authorization below, prepare release R with the reviewed live interlock change. Run exact-R checks, stage the existing service build and capture rollback release/configuration. Do this before creating the timed trial. Keep patched Node 22 selected and verify the actual build version.
2. Pause ordinary runtime scheduling and drain active work using existing shutdown/lease procedures. Verify no ordinary worker is claiming work. The evaluation composition replaces ordinary composition on this service; it is not a new parallel worker. Other services receive no new integration capabilities. Record the outage window.
3. Complete approved profile/row preflight on the verified synthetic scope; stage approval/public-key file paths through the existing authorized mechanism. Prepare one NEW coordinator and exactly three NEW enrolled children with the goals above. Do not mutate or replay old blocked goals.
4. Create ONE live trial with the fixed spec, prices, case/capability hashes and ceilings. Read its actual generated trialId and deadline. The five-minute clock starts at INSERT, not first model call; signing and service restart consume that same window. Prepare everything possible first. If startup cannot fit, report expiry and stop—do not extend/reset the deadline or silently create a second trial.
5. Authorized signer signs stable canonical JSON containing kind=SAM_LIVE_EVALUATION_APPROVAL, trialId, rootGoalId, companyId, specHash, commit=R, corpusHash, endpoint, prices, expiresAt=exact trial deadline. specHash binds all three child IDs, limits and capabilityHash. The coding agent does not perform this signature.
6. Select on the existing runtime only: SAM_COMPOSITION_MODULE=apps/runtime/src/boundedEvaluationCompositionModule.ts; SAM_SPECIALIST_INTELLIGENCE=evaluation; SAM_EVALUATION_TRIAL_ID; SAM_EVALUATION_COMMIT=R; SAM_EVALUATION_APPROVAL_PATH; SAM_EVALUATION_OWNER_PUBLIC_KEY_PATH. Reuse the verified scoped database connection and existing provider credential without exposing or replacing secrets. Runtime verifies all pins/admission before requests. No research/integration flag expansion.
7. Observe one bounded run. Stop immediately for authorization/tenant/lineage/false-completion/accounting failure. Exhaustion, cancellation, incomplete obligations or timeout must remain visible failures/blocked outcomes. Do not coach the model with a plan, edit reports or increase limits mid-run.
8. Stop/drain evaluation; seal/export through the existing operator capture route, or preserve the supported incomplete diagnostic capture if attempts are uncertain. Verify signatures, original obligations, source/artifact hashes, every reservation and disposition, exact provider request IDs/usage/version and final reports. Preserve the ledger; do not erase/reset it.
9. Restore the recorded ordinary composition, specialist setting, scoped connection/config and original reviewed release; restore any evaluation-specific verification/profile changes per the approved inverse diff after evaluation stops. Reconcile leases through existing recovery and verify readiness plus ordinary service operation. Preserve evaluation records and charged counters. No automatic replay of unrelated WAITING_EXTERNAL goals.

## Success, failure and evidence

Nominal functional success requires all three child reports complete with citations tied to current verified raw/derived evidence, replayable arithmetic, correct period/record coverage, full document pagination, no source duplication on continuation, and no false monetary/VAT claims. Coordinator remains NEW. A safety pass with a blocked nominal task is NOT functional success.

Save: exact R/tree/source manifest/build Node version, trial spec and signed authorization/public key, nonsecret preflight receipts/config diffs, sanitized execution/verification/report ledger, signed family trace, independent replay/scoring, budget counters/provider usage, start/end/abort timings and restoration evidence. Separate raw facts, derived facts and model interpretations. Source details here are synthetic only. Model quality requires human assessment of all three reports; fixture assertions and trace authentication alone do not certify it.

This evaluation does not solve real Google/bol normalized extraction, monetary/VAT semantics, production collection coverage, or general obligation refinement. Such failures must be diagnosed separately after the bounded run, not hidden by treating this corpus as business data.

## One unavoidable authorization package

After the verified resource tuple and any concrete missing-profile/config diffs are filled, request ONE approval for: the exact release R/interlock and same-service temporary pause/switch/restore; this one synthetic three-goal trial with at most 24 provider attempts and US$0.30 total reserved model spend; the exact coordinator compatibility/verification-row actions if absent; and signature through the existing trusted owner process. Enumerate any narrowly scoped existing-principal grant diff separately inside that same package only if preflight proves it necessary. No blanket grants, new signing key/password, new host/database, paid top-up, business-source access, second trial or automatic budget reset is included.

No owner decision is requested or inferred by this document. No operation above has been executed here. The remaining operator identifiers/signature and the release-enabled commit cannot be fabricated from unavailable metadata.
