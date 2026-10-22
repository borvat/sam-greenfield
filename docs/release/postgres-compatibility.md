# PostgreSQL compatibility preparation — local acceptance

Date: 2026-10-10. Candidate: Neon, **conditional**, not provisioned or LIVE_PROVEN.
Baseline local commit: `2088808`; cached `origin/main`: `f4caf82`.
Before this task the tree was clean with one local memory/budget commit above that
cached reference. No remote fetch, push or external database connection performed.
The preparation commit is the commit containing this document; tests ran against
its code in the working tree. Documentation-only additions followed verification.

## Changes and reasons

- Keep standard PostgreSQL `DATABASE_URL`, optional existing
  `SAM_RELEASE_DATABASE_URL` override, original migrations, original driver and
  executive agent. No Neon SDK, hostname assumptions or new goal implementation.
- Release admission now requires `sslmode=verify-full`, an unambiguous URL without
  account/host/SSL query overrides, and a DNS hostname. `require` is not proof of
  certificate identity: driver/libpq compatibility options can change its meaning.
  The installed pg driver's IP-literal TLS path can otherwise fall back to a
  `localhost` peer identity. Direct IP endpoints are deliberately not admitted.
- `SAM_DB_CONNECTION_MODE=direct` documents the transport. Missing mode preserves
  existing direct-connection behavior; transaction, session and unknown modes are
  rejected. **A declaration cannot detect a disguised provider pooler**: confirm
  the endpoint in provider settings and run independent session/transaction tests
  before enabling the worker. Do not use Neon `-pooler` endpoints.
- Shared read-only release checks reject elevated attributes, reachable privileged
  memberships, ownership (including inherited owner roles), schema/database CREATE,
  table TRUNCATE/TRIGGER and missing core RLS. Runtime never creates roles, applies
  migrations or repairs permissions. Safe failure codes are logged, not values.
- Only the disposable native-release test fixture lost broad TRUNCATE/TRIGGER
  permissions. Existing development roles and ordinary agent behavior unchanged.
- Optional regression infrastructure starts the **existing three service entry
  points** on a synthetic disposable schema, with original maintenance-only worker
  and no external credentials/autonomy switch. It refuses occupied ports, stops
  only its own children, and drops only its own schema. It is not a workflow or
  task-specific executive implementation.

## Evidence and limits

Commands:

```
npm run typecheck
npm run test:development -- --isolated-services
npm run test:development -- tests/development/postgres_compatibility.ts
node scripts/development/scan-secrets.cjs --history
```

| Gate | Result | Observed evidence |
|---|---|---|
| Development target identity | PASS | Pinned database and cluster independently matched before any fixture writes |
| Regression | PASS | 33 suites, original migrated disposable schemas; strengthened role suite separately rerun; typecheck passes |
| Runtime role | PASS local | Genuine restricted LOGIN, same-login admission; elevated CREATEDB/CREATEROLE, privileged membership, table owner and TRUNCATE rejected; DDL denied by PostgreSQL |
| Tenant/entity RLS | PASS local, conditional provisioning | Own-context read succeeds; absent context, foreign org/entity, sibling entity, foreign UPDATE/INSERT denied |
| Migration separation | PASS local | Administrative fixture migration identity separate from runtime LOGIN; runtime CREATE TABLE/SCHEMA/ROLE and TRUNCATE denied |
| Transactions/concurrency | PASS local | Actual commit and rollback; two real clients take different rows with FOR UPDATE SKIP LOCKED |
| TLS | PASS loopback protocol fixture | Real pg client negotiates PostgreSQL SSL; trusted matching cert reaches startup; untrusted and wrong-host certs fail before startup |
| Backup/restore/rollback | PASS local | Real pg_dump/pg_restore, three disposable test databases, 23 tables, sequences/IDs/ACL/RLS, quarantined queue/outbox, synthetic audit and receipt intact; original archived/native readers |
| Recovery/observability | PASS local | Existing ACT SIGKILL/recovery, fencing/deduplication, DB outage and metric-boundary suites pass; model/provider failures are explicit local HTTP fixtures |
| Setup Mode | PASS | 16 configuration refusals, real loopback HTTP, denied business routes, zero DB tripwire/worker/outbound connections |
| Dependency/privacy scans | PASS | Zero dependency vulnerabilities; zero HoundDog findings |
| SAST | PARTIAL / raw NOT CLEAN | Replit SAST still reports 40 Critical, 0 Medium, all fingerprints unchanged; prior per-location dispositions retained; no suppression |
| Neon live authentication/TLS/latency/quotas | BLOCKED | No account, project or database provisioned; no connection attempted |
| Publish/production | BLOCKED intentionally | No production resource/schema/permission change, model call, business data or purchase |

The RLS fixture supplements SAM's original context-based policies with an explicit
**test-only fixed-principal restrictive policy**. It does not prove that base RLS
alone pins a runtime LOGIN to one organization/entity. External provisioning must
review and install appropriate principal restrictions, preserve existing policies,
and rerun own/foreign/sibling/absent-context canaries using the actual application
LOGIN. RLS-enabled flags alone do not prove data isolation.

TLS fixture is not a PostgreSQL authentication test and not Neon proof. Synthetic
audit/model receipts in restore tests are not evidence of model API requests.
The native command-center login surface rendered; authenticated read-only HTTP
smoke passed. Signed-in UI was not visually verified in this task.

Full run log: `.local/sam-dev/postgres-compatibility-regression.log` (ignored).
Scanner inventory: `docs/release/security-scanners.json`; prior per-finding ledger
still applies. No claim that scanners or local fixtures guarantee production.
The optional integration services were stopped and their schema dropped; the new
compatibility LOGIN/migration roles were dropped; TLS files were deleted. The
existing regression harness removed its disposable schemas, and the restore
fixture removed its three databases. Configured editor workflows were not enabled.

## External approval gate — do not execute yet

Owner must separately approve an isolated Neon pilot account/project/database
(not a replacement SAM project), region and quota/billing policy; standard direct
DNS/TLS connection; distinct migration/owner and restricted application LOGINS;
reviewed organization/entity principal restrictions; synthetic-only migration,
backup/restore and connection acceptance tests. Store actual access credentials
only via Replit Secrets. Runtime uses the application `DATABASE_URL`; migration
and backup credentials must not be forwarded to executive children.

Keep Setup-only until live identity, least privileges, actual RLS canaries, SSL
identity, session semantics/SKIP LOCKED, pgcrypto support, independent synthetic
restore and worker health have passed. These approvals do **not** authorize a
model, company OAuth/data, production execution or Publish.

## Cost concerns (planning, not a bill or spend approval)

Use the dated provider comparison/official quote before provisioning. At the
previously verified Launch rate $0.106/CU-hour, constant 0.25 CU computes to
$0.636/24h or $19.345/730h, before storage/history/egress. Neon Free's 100 CU-hours
per project/month can cover a 24h quarter-CU synthetic pilot (6 CU-hours), but not
730h (182.5 CU-hours). Current account eligibility/quotas are unverified; 1GiB RAM
at 0.25 CU is not a demonstrated production capacity.

The one-second worker heartbeat/queue polling may keep compute awake; do not price
it as scale-to-zero without measurements. Free backup history is not equivalent
to tested scheduled off-provider backups. Check snapshot/history storage,
region/latency, direct-connection limits and backup egress.

Replit VM, Agent usage, models (none here), initialization and backup retention are
separate from DB compute. The owner's $10 pilot target is neither an enforceable
platform cap nor authority to provision, purchase, auto-upgrade or Publish.
