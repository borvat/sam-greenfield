# PR83 durable accounting increment — explicit acceptance status

The storage implementation and integration package are prepared. **PostgreSQL persistence/atomicity is
not verified in this environment, so this increment does not meet the full database acceptance gate.**
No existing service or secret source was changed. No production readiness or Hermes acceptance claimed.

## What changed

The existing `model_calls` table is the proposed single authoritative call/spend record. New PostgreSQL
columns separate estimate, reserve, current budget exposure, reported usage, calculated cost and verified
invoice. Auxiliary tables hold project/service authorization, approved budget periods, membership links
and append-only billing evidence. Existing SAM OAuth, approvals, audit_log, goals, queue and fencing IDs
are reused. There is no second model-selection gateway or parallel spend log.

The implementation commits reservation before credential use and DISPATCHING before possible send.
Full exposure is held after ambiguous failures; missing usage remains NULL. Known pre-dispatch failure
can release exposure without destroying original reservation history. Duplicate request IDs are rejected;
altered content/scope/fence conflicts. Budget limits use exact BigInt/BIGINT micro-USD, deterministic
locking and revisioned audited changes. Database unavailability closes admission.

Durable service/project revocation, approval consumption, period rollover, SIGKILL recovery, database crash,
invoice evidence and real integrated Gateway/PostgreSQL behavior have executable acceptance cases.
They remain unverified until those cases actually execute on PostgreSQL.

## Evidence matrix

| Property / component | Status | Evidence and limits |
|---|---|---|
| Existing 40 tests, including real local Vault | LOCAL_VERIFIED | Preserved; actual Vault file storage/ACL/CAS/restart, synthetic provider HTTP |
| Exact monetary calculation, SAM signed-token verification, content/scope fingerprint | LOCAL_VERIFIED | 3 new unit cases; signature expiry/forgery/audience/project denial; no new login issuer |
| Actual PR83-base ModelGateway integration | LOCAL_VERIFIED | 7 cases; opt-in minimal patch in disposable actual source; SQL/storage explicitly mocked |
| Actual Hermes gateway integration | LOCAL_VERIFIED | Same 7 cases on 2a488c8; 3570e30 gateway blob identical, intervening commit docs-only |
| Vault-bound credential access/rotation and pre-send denial | LOCAL_VERIFIED | Real Vault and authenticated loopback mock provider; no live provider key |
| Fallback after timeout/error/missing usage/missing identity/cancel | LOCAL_VERIFIED | Existing Gateway loop stops after one possible provider call; reservation held in test double |
| Previous Gateway with extension disabled | LOCAL_VERIFIED | Old fallback and legacy recording behavior retained; no runtime rollback executed |
| Proposed PostgreSQL migration/ledger/admin code | IMPLEMENTED_NOT_VERIFIED | TypeScript and PostgreSQL syntax parser checked; parser is not a database engine test |
| Real PostgreSQL concurrency, restart, SIGKILL, revocation, reconciliation and integrated Gateway | BLOCKED | 15 cases skipped explicitly, zero engine cases passed |
| Shared RLS/runtime/admin role grants and legacy history allocation | BLOCKED | Coordination/deployment design only, no shared role/schema change |
| Hermes contract acceptance | BLOCKED | Proposal/handoff only; no recorded acceptance |
| Live SAM/Hermes/provider integration | BLOCKED | No live activation or provider inference performed |

Logs: [local unit/Vault](evidence/pr83-durable/local-unit-and-vault.log),
[new exact-money/identity checks](evidence/pr83-durable/exact-money-and-identity.log),
[base Gateway](evidence/pr83-durable/gateway-base.log),
[Hermes Gateway](evidence/pr83-durable/gateway-hermes.log),
[PostgreSQL blocked cases](evidence/pr83-durable/postgres-blocked.log),
[root typecheck](evidence/pr83-durable/typecheck.log),
[Hermes isolated typecheck](evidence/pr83-durable/hermes-typecheck.log),
[SQL parsing only](evidence/pr83-durable/sql-parse-only.log).

## Why PostgreSQL did not run

The isolated binary package integrity was verified and `postgres --version` reported PostgreSQL 17.10.
The host user namespace contains only UID 0 (`0 0 1`). PostgreSQL refuses a root process; switching to
an unprivileged UID is impossible because no such UID is mapped. The harness reports this precise blocker.
No root-check patch, permission escalation, SQLite/memory substitute, hosted/shared database, renewed
role or new infrastructure resource was used. The 15 skipped tests are not PASS evidence.

## What is durable, and what remains in process memory

No running SAM service became durable through this increment: nothing was deployed or migrated there.
The **proposed** PostgreSQL path stores grants/revocation, enabled projects, approvals/use counts, periods,
limit revisions/audit, request scope/hash, reservation/state, usage/cost and evidence across connections.
That behavior is implemented but has not passed engine verification.

AbortSignal, verified-token object branding, private one-process ticket capability and adapter closures
remain in memory. They contain no authoritative spending totals. A restart deliberately cannot recreate
a dispatch ticket or resend an existing request. A new verified identity can inspect/reconcile durable rows
after authorization. The old LocalAdmissionLedger/ServiceIdentities remain only for the original isolated
prototype tests, not as a fallback for the new PostgreSQL path.

The credential stays inside the trusted provider adapter. Hermes, Modal and generated code receive no
provider key or Vault token. There is no secret-list/read agent tool. Reader/writer Vault permissions are
separate. The existing DeepSeek environment path was inspected in source only; its actual key value and
storage were neither requested, read, moved nor rotated. The publisher Vault group was not accessed.

## Review package / rollback

- New storage code: `durableLedger.ts`, `durableAdministration.ts`, `exactMoney.ts`, `samIdentity.ts`.
- Proposed schema: `packages/ai-infrastructure/sql/001_durable_model_calls.sql`; not auto-loaded by SAM's migrator.
- Gateway middleware/wire binding: `samBoundary.ts`; external endpoints are disabled, test loopback only.
- Exact-source review patches: `packages/ai-infrastructure/integration/gateway-*.patch`.
- [Responsibility and data contract](SAM-HERMES-VAULT-INTEGRATION-CONTRACT.md).
- [Hermes handoff](PR83-HERMES-HANDOFF.md).
- [Continuation checkpoint](../continuity/AI-INFRASTRUCTURE-PR83-DURABLE-2026-10-26.md).

Disable by omitting the opt-in hook in a future coordinated composition; preserve all rows/evidence and
pending exposure. Do not drop schema or reset counters. Shared gateway/provider/runtime files in this
branch remain untouched; only disposable test copies received the proposed hook. Existing circuit-breaker
handling of pending false-success rows and legacy history allocation are explicit owner-review gates.

## Reproduction and smallest remaining step

Use the repository's existing dependencies; test binaries/caches are external scratch dependencies.
Set AI_TEST_VAULT_BIN to an independently verified Vault 1.21.0 binary.
Prepare a disposable actual Gateway source with integration/prepare-gateway-fixture.py and use its path
as AI_TEST_GATEWAY_ROOT. Local contract tests deliberately inject a SQL/storage test double.

For engine acceptance, run as an unprivileged OS user, set AI_TEST_POSTGRES_BIN to PostgreSQL bin,
and execute `node --import tsx --test tests/ai-infrastructure/durable-postgres.test.ts`.
Its harness creates only a fresh disposable local cluster with fsync/synchronous_commit enabled and
uses the actual SAM schema plus the proposed additive migration. It does not accept a shared DB URI.
No production/customer data is present. Fault tests destroy only that disposable cluster/process.

The first remaining step is that PostgreSQL run and repair of any resulting engine defect. Then obtain
explicit Hermes-owner acceptance of the narrow hook/identity/schema/health-query contract. Shared
activation remains a separate coordinated step. No new spending approval is reused from Hermes.

## Scope and cost

No merge, main push, deployment, service config, shared PostgreSQL role/table, network, job schedule,
real secret, default DeepSeek model or Nous free path changed. No GitHub Actions, Modal or live paid/free
inference was run. No Zvec or TestSprite evaluation was repeated. No new hosted resource or subscription.
New infrastructure/provider expense: **$0**. Local dependency downloads used existing execution capacity.

Primary PostgreSQL references used for the design:
[row locks](https://www.postgresql.org/docs/17/explicit-locking.html) and
[exact numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html).

Final source recheck: Hermes e7a746aec41654c026337bb06c746bcb073e8fe7 has the same Gateway blob as 2a488c8 and 3570e30; intervening changes were continuity documents only. Reserved-path overlap remains empty.
