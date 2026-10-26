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

Run `node --import tsx --test tests/ai-infrastructure/*.test.ts` from the repository root.
The Vault test requires `AI_TEST_VAULT_BIN` pointing to the independently checksum-verified Vault 1.21.0 binary;
it starts a normal encrypted file-backed server on loopback, initializes a disposable store and destroys it afterwards.
No repository configuration or dependency/lock file was changed.
