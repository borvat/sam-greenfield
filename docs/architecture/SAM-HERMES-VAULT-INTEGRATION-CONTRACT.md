# Proposed SAM–Hermes–Vault contract (not activated)

Status: isolated extension passes local tests; the SAM–Hermes owner has not accepted this contract.
No changed runtime, startup, environment variable, database, deployment, tool or Hermes message format.

## Ownership and API boundary

SAM remains the executive and the sole model-routing owner. Hermes submits a model task to SAM;
it never receives provider keys, Vault tokens or an admin/read-secret tool. There is no second gateway.
The isolated package implements SAM's existing `ModelProviderAdapter` interface. `scopedAiAdapter`
returns `providerId` and `invoke(task, model)` only. The privileged constructors are server dependencies.

## Proposed flow

1. **Task request:** the current Hermes owner maps its existing task/request ID into a SAM invocation.
   No Hermes protocol changes are implemented here. Require task, capability, input, classification,
   deadline/cancellation and stable idempotency identity. Caller cannot choose a project/secret path.
2. **Identity:** independently verify a project/environment/service identity. The process-local test
   identity registry is not production authentication. Production needs reviewed short-lived OIDC/mTLS,
   audience binding, issuer validation, revocation and operational credential rotation.
3. **Selection:** existing SAM registry/router remains authoritative. The optional eligibility extension
   requires measured quality, success rate, latency, privacy permission and fresh reviewed tariffs
   before cost ranking. Unmeasured quality, unknown pricing and stale profiles remain ineligible.
4. **Credential use:** a trusted fixed mapping selects a separate Vault reader for exactly the verified
   project/environment. Vault KV-v2 ACL grants `read` on explicit AI provider paths only. No list, write,
   sys, auth, cross-project, GitHub, Render, financial, signing, accounting or DB privileges.
5. **Usage:** provider prompt/completion/cache-hit tokens must be valid integers. Absent usage remains
   an error, never zero. Cache discounts require an explicit reviewed hit tariff and measured hits.
   Explicit cache-creation requests are unsupported because they can incur separate billing.
6. **Budgets:** reserve conservative full context-input capacity plus capped output before dispatch;
   check task and project budgets. Current ledger is single-process/test only. Production requires a
   transactional shared ledger, durable idempotency and reservation recovery across restarts/replicas.
   Do not open production using the local ledger. Current local ledger has a lifetime ceiling and fixed
   rolling minute limits; it does not implement a monthly budget reset.
7. **Failure:** network timeout, provider 429/5xx, malformed data, absent usage, ambiguous billing or
   failed audit retain the full reservation. No automatic repeat or fallback under the same task ID.
   Provider 429 imposes a cooldown. The existing gateway's fallback loop needs coordinated admission
   and failure classification; this task does not modify it. Explicit proof of a pre-dispatch failure
   could permit later manual reconciliation; no automatic refund is implemented.
8. **Return:** pass only accepted model output, model identity and normalized usage through SAM's
   existing result contract. Reject known credential echoes. Audit includes fixed scope, hashed request
   identity, usage and costs; no prompt, response body, headers, arbitrary errors or raw keys.
9. **Revocation/cancel:** revoked/expired identity or disabled/deleted key denies the next request.
   Identity is rechecked before dispatch and before response delivery. A dispatched request cannot be
   un-sent by revoking its key. Optional AbortSignal cancels local in-flight transport; ambiguous spend
   remains reserved. Vault reader revocation and provider-side key revocation are separate controls.
10. **Acceptance:** execute unchanged contract tests, isolated live free-quota checks, independent SAM
    receipt verification, cancellation/duplicate/crash tests and explicit runtime coordination before
    wiring. Mocked provider results are wire-contract evidence only, never live model-quality evidence.

## Compatibility gate

| Gate | Current state |
|---|---|
| SAM–Hermes base integration accepted by its owner | Pending; PRs 65–67 still open at audit |
| Stable task/result/cancellation interfaces | Local adapter compatibility only; owner review pending |
| Shared DB/schema compatibility | No shared changes; durable ledger schema intentionally absent |
| Identity/delegation policy accepted | Test identities only; production OIDC/mTLS pending |
| Contract/security tests | Local tests with real Vault + synthetic provider HTTP |
| Live provider/free account quota | Not established; all external calls default-denied |
| Runtime coordination | Not granted for existing services; none changed |

## Deployment proposal, requiring a separate decision

Use a dedicated trusted credential broker/worker isolated from agent execution. Keep Vault's
encryption/seal lifecycle, persistent encrypted storage, TLS, backups and audit with a mature manager.
Separate mount/policy/identity domains for financial and administrative secrets. Render stores only the
minimum broker bootstrap credential; agents/projects receive scoped invocation authority.
Do not attach the existing Hermes publisher vault group or its private key to this package.
No paid resource, external account, secret migration or runtime publication was created here.
