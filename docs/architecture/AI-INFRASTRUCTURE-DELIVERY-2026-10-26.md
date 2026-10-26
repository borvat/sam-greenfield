# Surooh isolated secrets and AI infrastructure — delivery

Scope: draft-only additive implementation on main b55da2761e8fd1de3833be55f03d4fdd268cd0a3.
No SAM/Hermes runtime registration, production deployment, merge or shared-secret migration.
Local security and adapter evidence is not evidence of live provider quality.

## Component status

| Component | Status | Evidence / tests | New cost |
|---|---|---|---|
| Secrets Vault | PARTIAL | Real normal file-backed Vault 1.21.0: ACL separation, CAS rotation, disabled secrets, encrypted-at-rest canary check, audit redaction and restart/re-unseal verified. No hosted central vault or production identity lifecycle. | $0 |
| Model Gateway | PARTIAL | Additive registry eligibility, capability/privacy/health gates, conservative project/task reservations, rate limits, cached usage accounting, idempotency, cancellation, sanitized audit and model-list health checks; existing gateway untouched. Durable budget/fallback wiring pending. | $0 |
| Qwen | PARTIAL | Existing chat adapter reused; local HTTP wire/usage/max-output tests pass. Region-specific live key, model version, quota and price tier not verified for account. | $0 |
| DeepSeek | PARTIAL | Same existing adapter reused; synthetic contracts pass; current official pricing/version research recorded. No live comparison or cache-hit experiment. | $0 |
| Kimi | PARTIAL | Compatible adapter extension and local contract pass; official endpoint/model/pricing researched. No live key or inference evidence. | $0 |
| AMD Token Factory | PARTIAL | Official endpoint, model list, trial restrictions, rate-limit/rotation/data policies researched; local adapter passes; production forbidden by policy. Account quota not proven and no external call made. | $0 |
| Zvec-Grep | PASS | Actual zg 0.2.1/native 0.7.0 + local Model2Vec on 10 synthetic files; 96 measured searches (8 cases × 3 repeats × 4 modes). PASS means isolated evaluation completed, not approved production adoption. | $0 |
| TestSprite | PARTIAL | Package 0.0.47/BSL inspected; pricing/privacy reviewed; synthetic PRD and independently reproduced 3 defects plus positive control. Actual TestSprite cloud execution BLOCKED: no connected key/free quota proof. Real Chromium run also blocked by host process/socket restrictions. | $0 |
| Compatibility contract | PASS | Proposed contract documented; runtime linkage and Hermes-owner acceptance remain pending. | $0 |

## Implementation and verification

- `packages/ai-infrastructure/src/security.ts`: scoped test identities, whole-service disabling, administrative events, credential-safe audit and synchronous reservation ledger.
- `vault.ts`: mature Vault KV-v2 client, per-project/environment AI-only policies, mandatory compare-and-swap writes and fresh reads. No custom encryption/storage design.
- `catalog.ts`: unknown/stale tariff rejection; quality/privacy/latency/stability eligibility before cost ranking; cache billing math.
- `adapters.ts`: existing adapter decorator for Qwen/DeepSeek/Kimi/AMD; output cap, endpoint allowlist, redirects denied, usage/model validation, secret-echo rejection, health checks and cancellation.
- `benchmark.ts` / `model-cases.json`: independent structured-output evaluator for eight task dimensions; long-context fixture actually materializes 10,000 distractors. Evaluator unit tests use synthetic adapters. No real model was scored.
- `tests/ai-infrastructure`: 40 local tests passed, none skipped. Real Vault was used; provider HTTP was synthetic. See [test log](evidence/vault-tests.log).
- Repository TypeScript check passed: [log](evidence/typecheck.log).
- Unchanged regression checks passed: existing provider 401/403/429/503 behavior, build configuration and six private-pipe credential-isolation tests: [log](evidence/regression.log).
- [Ownership audit](PARALLEL-DEVELOPMENT-OWNERSHIP.md) records all 34 open PRs and reserved paths. Main and Hermes heads were re-fetched; no owned path overlapped their changes.

## Zvec measured result and recommendation

| Mode | Recall@3 | MRR@3 | p50 CLI ms | p95 CLI ms | Maximum peak RSS KiB |
|---|---:|---:|---:|---:|---:|
| Literal rg | 0.125 | 0.125 | 4.906 | 6.581 | 44,928 |
| BM25 | 0.750 | 0.583 | 1,036.310 | 1,208.034 | 329,136 |
| Semantic | 0.875 | 0.729 | 1,194.526 | 1,361.990 | 407,256 |
| Hybrid | 0.750 | 0.688 | 1,222.238 | 1,399.374 | 406,372 |

Indexing this measured run took 3,093.748ms and peaked at 1,648,892KiB RSS. All searches exited successfully.
Source data and per-case/repeat paths are in [raw measured evidence](evidence/retrieval-results.json).
Metrics include cold CLI/native/model startup on each invocation. Literal rg matches the full query phrase;
it is not a ranked semantic baseline. The corpus is tiny, English and synthetic; no inference about production
accuracy or large-repository scaling is warranted. SAM SQL memory and Hermes memory were not accessed.

Recommendation: keep exact rg for identifiers and bounded reads. Semantic retrieval merits a separately
isolated evaluation; hybrid did not beat semantic in this sample. Do not place this observed indexer in the
existing 512MB SAM/Hermes services. A warm daemon, bounded indexing and a larger corpus must be measured
before any capacity or resource decision. No resource was created to do that.

Upstream identity and Apache-2.0 metadata were read from
[zvec-ai/zvec-grep](https://github.com/zvec-ai/zvec-grep) at 3a8e513d4ccca55baef53c9438db943bbb887ec8.
Evaluation uses the separately published pinned npm 0.2.1 CLI. The upstream head's CLI differs from that
release, so installed `index/query --help` supplied the actual executed interface.
An initial native binding omission was repaired in a scratch-only tool installation. The initial model download
failed; the two model artifacts were then fetched and SHA256-verified against upstream's pinned manifest,
cached locally, and actual indexing/search rerun successfully. No remote embedding API was used.

## TestSprite evaluation boundary

The pinned npm package is `@testsprite/testsprite-mcp@0.0.47`, metadata/license `BUSL-1.1`; its bundled license
restricts production/commercial use pending a separate commercial license. This is a package inspection,
not a conclusion about any existing customer agreement. Its README requires a TestSprite account/API key
and describes cloud testing/tunnels. No account, key, tunnel, app connection or paid plan was created.

[Official pricing](https://www.testsprite.com/pricing) listed a $0/150-credit tier at review time.
Available account credits were not checked. [Privacy](https://www.testsprite.com/privacy) describes US
processing/storage and retention beyond the customer relationship; a production source-code retention
agreement was not established. Only synthetic test-app data is prepared for future use.

Independent [ground truth](evidence/testsprite-fixture-ground-truth.json): health-only smoke passes even in
the faulty variant. Paid-order filtering, project isolation and invoice total each fail the PRD there and pass
with the positive control. The client script was exercised with mocked DOM and actual local HTTP, not a
real browser. Chromium startup failed on host Unix socket/process permissions after a valid browser archive
was obtained. No privilege escalation or runtime workaround was attempted.

Recommendation: no TestSprite production/CI wiring now. A connected free account, inspected credit limits,
TLS-only tunnel configuration and actual cloud finding/repair results are prerequisites. Its inspected release
documents a legacy plaintext data-plane fallback, so do not assume every tunnel is TLS by default.

## Provider research and restrictions

[Research manifest](ai-provider-research.json) contains primary-source URLs, observed model IDs and pricing
caveats. No live profile is enabled. Qwen pricing depends on region/tier and explicit cache creation can add
charges. DeepSeek peak/off-peak differs. Kimi maximum output for the selected current model still needs
verification. Current-model marketing context sizes are not a tested capability of this extension.

AMD's [official Token Factory guide](https://amd-aim.github.io/radeon-cloud-docs/guides/token-factory/)
describes a free development/trial API, with account daily points and rate limits. Its
[terms](https://amd-aim.github.io/radeon-cloud-docs/api/terms/) exclude production and reselling access.
Points must not be treated as USD. No evidence established this account's quota or a guaranteed
111-million-token grant. External calls require separately verified free test quota and public synthetic input.

## Material limitations and pending work

1. Local test identities, admin events, audit sink and admission ledger are process-local. They are not a
   durable central service; restart-safe production accounting, external identity and operations are pending.
2. Real Vault supplied encryption and administrative audit in a disposable isolated store. The test store
   was destroyed after verification. No production secrets were read, copied, initialized or migrated.
3. The extension is not registered with the current gateway; existing fallback needs a coordinated guard
   so timeouts/charged failures cannot cause duplicate paid attempts. Production is explicitly denied.
4. All four provider connections/quality/cost-per-success/cache economics remain unproven live. Zero
   paid or free live inference calls were made. The local benchmark grader is not a quality result.
5. Final Hermes linkage requires acceptance of the [proposed contract](SAM-HERMES-VAULT-INTEGRATION-CONTRACT.md)
   by its owner plus the compatibility gate. No changes to that protocol, its tests or its branches.

## Resources, cost and publication

Existing local workspace CPU/memory and internet downloads only; scratch-only Vault binary, zg/native/model
cache and browser/tool inspection. Vault's official 1.21.0 ZIP SHA256 was verified:
`5a91c93a9949ed8863ee4b91cfc30640bc49ab04225f0b1c5a0650c4d6e10171`.
No new Render services, DBs, disks, env groups, secrets, subscriptions or hosted CI runs were requested.
No deployment, main push, merge, force push, branch-protection change or other repository modification.
New provider/API/hosting expense: **$0**. Existing-plan tool credits/network capacity are not a new billing commitment.
All deliverable paths are new and additive; see the Draft PR Files tab for the complete list.
