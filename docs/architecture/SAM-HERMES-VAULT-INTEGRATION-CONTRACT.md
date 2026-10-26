# SAM–Hermes–AI infrastructure contract, revision 3 (PROPOSED)

Date: 2026-10-26. PR83 owns this extension. No acceptance by the Hermes engineer is recorded.
This document does not activate or authorize a shared schema/runtime change.

## Responsibility map

| Operation | Responsible component | Evidence / boundary |
|---|---|---|
| Submit model task and own goal/plan | SAM executive/runtime | Existing goals, work_queue, execution IDs and fencing token |
| Execute delegated work | Hermes under SAM | Existing protocol unchanged; no model-provider or Vault credential |
| Authenticate caller | Existing SAM OAuth verifier | Signature, issuer, audience, subject, client, scope and expiry; opaque branded identity |
| Resolve project/environment/service rights | SAM persisted authorization mapping | Verified actor + org/legal entity matched to enabled DB grant/project; body fields ignored |
| Select provider/model | Existing SAM ModelGateway registry/router | Extension has no routing or fallback loop |
| Admit/reserve/update cost | PostgresModelLedger extending model_calls | Atomic locks over global/project/goal/task budget periods; existing approvals consumed |
| Read provider credential | Trusted server-side provider adapter | Project/environment Vault reader, no list/write rights; test adapter is loopback-only |
| Persist result usage/accounting | SAM model_calls + existing audit_log | One canonical row; result digest, usage, requested/reported identity, exact costs |
| Cancel invocation | SAM invocation owner | AbortSignal; possible sends retain reservation and cannot automatically fall back |
| Rotate/revoke provider key | Separate Vault writer/operator | Existing Vault ACL/CAS/audit; no migration of real keys in this phase |
| Set limits/reconcile evidence/revoke service | Approved SAM administrator | Existing approvals bound to exact operation, project scope and append-only audit |

## Authentication and authoritative scope

`authenticateSamModelToken` reuses `apps/mcp/src/oauthResource.ts`. It does not issue credentials or add a
login/certificate authority. The accepted interface in this phase is SAM's signed synthetic-submit scope.
The opaque identity cannot be made by passing project_id/service_id fields. It must be re-authenticated
following a process restart; durable grants, revocations and project enablement live in PostgreSQL.
Internal/live SAM OAuth wiring is not claimed implemented. Production identities remain an integration gate.

The trusted SAM composition supplies goalId, queueId, optional executionId, fencing attemptId, approvalId
and stable logical requestKey. Derive requestKey from the logical goal/queue/operation, not an HTTP retry
UUID. A restarted attempt with altered content/fence must not silently receive a new logical request key.
The ledger checks actual goal company_scope, work_queue goal/fence and optional execution linkage.

Request fingerprints bind task type, canonical JSON content, capability/privacy/model requirements,
ceiling, verified actor/project/environment and SAM identifiers. Unsupported JSON objects/nonfinite numbers
are rejected; prototype-named JSON keys remain part of the fingerprint. Duplicate IDs never send again;
a different content hash is rejected explicitly. No automatic cached model output replay is implemented.

## Storage and accounting

`model_calls` remains the single call/spend record. Proposed additive SQL is in
`packages/ai-infrastructure/sql/001_durable_model_calls.sql`, outside the shared migrator's discovery path.
Auxiliary tables contain authorization, approved limits, call-to-budget membership and evidence only.
They are not a second spending ledger. Existing `approvals`, `audit_log`, goals and work_queue are reused.

| Value | Meaning |
|---|---|
| ai_estimated_microusd | Planning estimate using actual text envelope and a small expected output allowance |
| ai_reserved_microusd | Conservative UTF-8-plus-approved-framing input bound and capped maximum output |
| ai_exposure_microusd | Amount counted against budget now; full reserve for unknown possible sends |
| ai_input/output/cached_tokens | Provider-reported validated usage, NULL when unknown |
| ai_computed_microusd | Calculated charge using the frozen reviewed tariff; not an invoice |
| ai_invoiced_microusd | Only separately approved verified invoice evidence; otherwise NULL |

Amounts use BIGINT micro-USD + BigInt arithmetic, conservative ceiling of sub-micro amounts. Tariff rates
are exact micro-USD per million tokens. No floating legacy cost is treated as authoritative for this path.
Request input and provider raw output/headers/errors are not stored here. Requested and reported model
identities are separate. Missing reported identity is an error; aliases require an explicit reviewed allowlist.
Provider identity/usage are provider claims, not independent proof. The legacy chat adapter does not expose
all receipt identifiers; absent request identity remains NULL, never invented.

Budget periods for GLOBAL/PROJECT/GOAL/TASK are locked in deterministic order, then exposure is summed
from model_calls within the transaction. Missing/overlapping/expired/unapproved periods fail closed.
Limit revisions use CAS + audit. Expiry/new periods do not delete or reassign historical calls/reservations.
Unallocated legacy model_calls cause admission to close; allocating historical charges requires a separately
reviewed migration/evidence decision, not an assumed zero or wiping history.

## Lifecycle

RESERVED commits before secret access. The real wire adapter obtains its scoped credential and then commits
DISPATCHING immediately before a possible send. A proven failure while still RESERVED becomes NOT_SENT
with zero exposure while retaining the original estimate/reserve. DISPATCHING/unknown response, missing
usage, cancellation or storage trouble remains held as UNRESOLVED (or DISPATCHING until recovery marks it).
No provider exactly-once guarantee is asserted. A timeout does not prove the provider did not execute.

Validated usage becomes SUCCEEDED with calculated exposure. A revoked caller still has its accounting
record retained, but must not receive the result. Optional approved receipt/invoice reconciliation appends
evidence and updates exposure; it never deletes the request or authorizes a resend. The administrator can
prove NOT_SENT only for an atomic RESERVED row, preventing a racing old worker from dispatching it later.

## Actual Gateway integration change (not applied to shared files)

The minimal proposed hook is `ModelGateway.withModelCallBoundary(boundary)`. Selection is unchanged.
The existing Gateway calls reserve -> execute -> finish; any boundary-controlled error invokes fail(), which
throws terminally before the legacy fallback/write path. Thus there is one model_calls row, not a new legacy
row for the same cost. Missing adapter and mixed boundedEvaluation/boundedSynthetic contracts fail closed.

Exact-source patches are in `packages/ai-infrastructure/integration/`. They were applied only to disposable
copies of the actual PR83 base and Hermes 2a488c8 gateway. Hermes 3570e30 has the identical gateway blob
769d2d3774aa3eac81e07d9e25ea9ce6a6093d8b; its intervening change was documentation only.
Seven local Gateway cases per source passed using a storage test double, real Vault and synthetic HTTP.
The PostgreSQL + actual Gateway + Vault acceptance case now PASSED on real PostgreSQL 15.19 + real Vault 1.21.0 with synthetic HTTP. All 15 engine cases passed at a644ba6158c1fdd7e49c7332ff74782726c79ff2. The 52 related regressions passed at f27152e271e3945a89dbc2bbaa6f54ab7d05a97a; the seven Gateway control-flow cases still use explicitly doubled storage. The actual Hermes fixture was 57a19d8; final observed head ffa0fd4 has the same Gateway blob. No shared file was patched.

## Disable / rollback

Do not hot-swap a boundary during a running request. Drain/fence new admission, preserve unresolved rows,
and stop attaching the hook in the next coordinated composition. Restore SAM's existing adapter map and
existing secret source. Omission of the hook retains old behavior (locally regression-tested). Do not DROP
columns/tables, clear exposure, reset counters or delete evidence when disabling. Existing spending records
remain; the old path cannot be claimed governed by new limits. Re-enable only after legacy-history allocation.

## Unmet compatibility/operation gates

- Real PostgreSQL 15.19 concurrency, process/server-crash, persisted service/project revocation, usage/invoice history and the integrated Gateway case: LOCAL_VERIFIED in a fully isolated sandbox. This is not live shared-runtime verification.
- Shared schema, tenant RLS, least-privilege runtime/admin roles: proposed only; no role or shared table changed.
- Existing circuit-breaker query counts success=false reservations; its handling of pending AI rows needs owner review
  before concurrent pilot use. No shared health-query change was made here.
- Internal/live identity bootstrap and any real-provider bounded wire profile: not activated. DeepSeek's existing
  DEEPSEEK_API_KEY environment path remains untouched; no value was requested, read, copied or rotated.
- Central hosted Vault, seal/recovery/backups and operator audit retention remain deployment decisions. Disposable
  local Vault tests do not establish hosted availability. No publisher/GitHub secret group was linked.
- Hermes protocol/owner acceptance: PROPOSED. A repository handoff/comment is not approval.

One separately authorized PR83-only Modal Sandbox was used for the real-engine test and has finished. No live inference, paid fallback, TestSprite tunnel, Zvec deployment, shared migration, existing service configuration change, merge or production deployment was performed.

Final source recheck: Hermes e7a746aec41654c026337bb06c746bcb073e8fe7 has the same Gateway blob as 2a488c8 and 3570e30; intervening changes were continuity documents only. Reserved-path overlap remains empty.


## Connection recovery and current delivery

A crashed server may leave stale idle sockets in the driver pool. The ledger bounds replacement checkouts by the initial idle count plus one, only before BEGIN succeeds and before running the transaction body. Checked-out connection errors are observed and broken clients are discarded. The transaction body, COMMIT acknowledgement, reservation and provider send are never automatically replayed. A failure after a possible commit remains a failure/uncertainty requiring durable identity lookup, not a new logical request.

See [PostgreSQL delivery and exact reproduction](AI-INFRASTRUCTURE-POSTGRES-DELIVERY-2026-10-26.md). This revision remains PROPOSED until the Hermes engineer records acceptance or specific requested changes. No shared role/schema activation is authorized by the test result.
