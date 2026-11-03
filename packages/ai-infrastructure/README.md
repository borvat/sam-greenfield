# Isolated AI infrastructure extension

This package is **not registered** with SAM, Hermes, a runtime, tool registry or HTTP server.
It reuses the existing `ModelProviderAdapter` contract and `OpenAICompatibleChatAdapter`.
Never expose `VaultAiSecrets`, `ServiceIdentities`, constructor dependencies or admin methods to agents.
Only the server binding result (`providerId`, `invoke`) belongs in the existing gateway registry.

The operator supplies a fresh reviewed model profile and a Vault client scoped to one project/environment.
No default live keys, unknown tariffs, paid tests, provider auto-discovery or production calls.
Production is explicitly denied until the compatibility gate is accepted. Test budgets/identities are process-local;
production requires durable transactional reservations, durable audit, external OIDC/mTLS and revocation.
The current gateway's automatic retry behavior must be reconciled with ambiguous/charged attempts before wiring.

Vault KV-v2 supplies encryption/versioning/CAS. Use a distinct mount or instance/policy domain for financial,
identity/signing, GitHub, Render, database and accounting credentials. This package only addresses `surooh-ai`.
Render env groups may hold short-lived bootstrap credentials for a dedicated trusted broker, not for every project.

Run the original local tests with `node --import tsx --test tests/ai-infrastructure/infrastructure.test.ts tests/ai-infrastructure/benchmark.test.ts` from the repository root.
The Vault test requires `AI_TEST_VAULT_BIN` pointing to the independently checksum-verified Vault 1.21.0 binary;
it starts a normal encrypted file-backed server on loopback, initializes a disposable store and destroys it afterwards.
No repository configuration or dependency/lock file was changed.

## Durable increment (not activated)

Read docs/architecture/AI-INFRASTRUCTURE-DURABLE-DELIVERY-2026-10-26.md and the revised integration contract.
PostgresModelLedger extends SAM model_calls; production schema/RLS/identity/runtime are not activated.
Original process-local classes remain fixtures, never a fallback for database failure in the durable path.

- New pure checks: `node --import tsx --test tests/ai-infrastructure/durable-unit.test.ts`.
- Actual Gateway tests: set AI_TEST_GATEWAY_ROOT to a disposable source prepared by integration/prepare-gateway-fixture.py,
  set AI_TEST_VAULT_BIN, then run gateway-contract.test.ts. Storage is an explicit test double there.
- Engine acceptance: under a non-root OS user, set AI_TEST_POSTGRES_BIN and AI_TEST_GATEWAY_ROOT, then run
  durable-postgres.test.ts. The harness creates its own fresh local cluster, not a shared database.
- PostgreSQL tests are BLOCKED in root-only UID namespaces. Zero engine properties were verified in the current host.
- Patches are proposals to the existing actual Gateway, not automatically applied modifications or an alternative Gateway.

Do not enable both durable admission and boundedEvaluation/boundedSynthetic on one request.
Disable by omitting the opt-in hook in a coordinated future composition, preserving all historical/pending records.
Do not interpret the legacy cost column as zero for a durable row: typed exposure/computed/invoice fields differ.
Existing report/health queries must be reviewed before shared activation.
