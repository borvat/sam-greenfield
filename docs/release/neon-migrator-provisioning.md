# Neon pilot migration authentication — standalone preparation

This helper is not a runtime service, migration runner, or deployment command.
Local/mock verification is not evidence of Neon authentication or migration.
Nothing should invoke this helper automatically.

## Approved preparation versus separate execution approval

The current approval covers implementation and local synthetic tests only.
Do not add credentials or run `--apply` until the owner separately authorizes
the exact pilot endpoint, bounded authentication window, session termination/recovery, and
provider-side logging risk. Connecting can wake compute/consume Free quota;
there is no guarantee of zero metered usage. No Publish is authorized.

The owner-reported baseline is PostgreSQL 18, database `neondb`, `pgcrypto` 1.4
owned by `neondb_owner` in `public`, and empty schema `sam_pilot` owned by
`sam_pilot_migrator`. Both pilot roles must be NOLOGIN, NOINHERIT and non-admin,
have no parent-role memberships, no database/public CREATE, and have CONNECT.
The application must have schema USAGE without CREATE.

## Private one-shot inputs after separate approval

**Do not add these credentials to this project's Replit Secrets.** Replit
documents Secrets as project environment variables available to running
processes. Development versus published scope is not per-script isolation.
The previous shared-Secrets instructions are superseded.

The isolated launcher obtains two values with hidden terminal prompts:

- `SAM_PILOT_PROVISIONER_DATABASE_URL`: existing administrator's **direct**
  connection URL, user `neondb_owner`, database `neondb`, port 5432/default,
  with exactly `sslmode=verify-full` and no other URL options.
- `SAM_PILOT_MIGRATOR_PASSWORD`: password-manager-generated random password,
  32–256 characters without control characters. Length alone is not entropy proof.

These names describe private packet fields, not environment settings. The
launcher sends them only through a private pipe (fd 3), never argv/files or
child environment. It never changes the parent environment, so existing SAM
services do not inherit newly entered inputs. Direct helper application has
no shared-environment-secret fallback. The launcher refuses shared credential
keys or NODE_OPTIONS before prompting. No-apply reads no credential inputs.

Never overwrite the
Replit-managed/development `DATABASE_URL`. The administrator needs CREATEROLE
and direct ADMIN OPTION on the existing migrator; SET permission alone does
not authorize password changes in PostgreSQL 18. Existing pg_signal_backend
privileges are required for cleanup; the helper does not grant them.

Pin the actual direct endpoint hostname from the approved project/branch's
Connect dialog. An `ep-...neon.tech` hostname alone cannot prove project,
branch or region; owner confirmation of the exact hostname remains necessary.
No pooler endpoint or relaxed certificate verification is permitted.

## Commands

Safe default (no secret reads, no pg client loaded, no connection):

```sh
node scripts/provisioning/neon-migrator.cjs
```

Only after the separate approval, in a trusted private terminal supporting
hidden/raw input (not a logged shell command, recorded terminal, or chat):

```sh
node scripts/provisioning/neon-migrator-once.cjs \
  --apply --host=THE_APPROVED_DIRECT_ENDPOINT \
  --ack-provider-audit-risk
```

The host argument is public metadata, not a credential. Do not put a URL/password
in the command. Enter them only in the subsequent hidden prompts. If the terminal
does not support private input, stop; do not substitute SQL Editor/shared Secrets.
The child has an allowlisted credential-free environment, no inherited stdin,
bounded wall time, and non-forwarded stderr. The parent allowlists result codes
and never forwards arbitrary child output. No automatic retry is performed.

The same OS user, a malicious collaborator, debugger, terminal recorder or
compromised Node process can still inspect memory/pipes. This is process-private
transport, not an OS security boundary against untrusted project code.

## Write and verification boundaries

The helper uses the existing `pg` dependency, verified TLS, bounded connection/
query/lock timeouts and a transaction advisory lock. It checks metadata only,
never company rows. It sets LOGIN/password only for `sam_pilot_migrator`.
`sam_pilot_app` is checked but never altered. No memberships, grants, schemas,
extensions, application tables, migrations, workers or model calls are created.

`ALTER ROLE ... PASSWORD $1` is not valid utility-statement parameterization.
A temporary SECURITY INVOKER function accepts a bound password and uses
PostgreSQL `format('%I', identifier)` / `format('%L', password)` for the fixed
role. The temporary function is dropped before commit; it is not a permanent
SECURITY DEFINER backdoor.

The committed password expires after 120 seconds. The migration role has
CONNECTION LIMIT 1, read-only session default, 15s idle timeout and 5s query
timeout. These role settings are temporary. After commit a fresh connection runs read-only metadata checks,
including actual session identity, search_path, restricted privileges and the
unchanged application role. PASS means authentication and these checks only,
not migration/RLS/backup/runtime/release acceptance. **Success also closes the
verifier, commits NOLOGIN/PASSWORD NULL/expired password/CONNECTION LIMIT 0,
resets the three helper-installed defaults, terminates remaining migrator
sessions and confirms zero sessions.** The result is
`MIGRATOR_AUTHENTICATED_AND_CLOSED`; no usable migration credential is left.

Failures before commit roll back. Failed authentication or uncertain commit
triggers one compensating NOLOGIN/password-clear attempt on the same admin
connection. If compensation cannot be confirmed, `REMOTE_STATE_UNKNOWN`
requires owner inspection; no safety claim or automatic retry is made.
SIGKILL/power loss after commit can still leave LOGIN enabled for the bounded
password window. VALID UNTIL limits password authentication only, does not
disable LOGIN or terminate existing sessions, and is not enforced for other
authentication methods. CONNECTION LIMIT is approximate, not a security sandbox;
read-only/default timeouts can be overridden by the authenticated role.
The owner must confirm password-based authentication and accept the residual
window. This is containment, not atomic/fail-closed crash recovery.

After interruption/unknown result, do NOT retry --apply or run migrations.
The separately approved operator reconciliation is:

```sh
node scripts/provisioning/neon-migrator-once.cjs \
  --reconcile --host=THE_APPROVED_DIRECT_ENDPOINT \
  --ack-provider-audit-risk
```

It asks only for the administrator URL, checks identity/administration/schema
owner, disables/clears/expires only the migrator, terminates its existing sessions
and verifies closure. It does not require an empty schema, so it remains usable
after later migrations. Failure stays blocked and requires administrator
inspection; no reconnect/rotation loop occurs. NOLOGIN alone is not proof that
sessions are gone. Role/session changes are branch-wide, across databases for
this specific role; the owner must authorize that cleanup scope.

The migrator is a DDL-owning maintenance identity,
not an RLS-restricted application identity, and must never be given to a worker.

## Secret and audit caveats

Output contains only controlled codes and metadata. No raw pg errors, stack
traces, SQL, configuration, URLs, passwords or credential files are emitted.
The helper never executes SQL in SQL Editor, so it does not create an
SQL Editor command-history entry. This is **not** a guarantee against
provider statement/parameter/error auditing, monitoring or server memory
exposure: Neon requires plaintext password input over TLS. There is no
plaintext password literal in **client query text**; the server-side dynamic
ALTER ROLE necessarily constructs a quoted plaintext literal. Catching and
rethrowing a constant function error reduces client error-context exposure,
but does not guarantee that internal/provider audit hooks never see it.

Before transmitting the password, read-only pg_settings checks require bind
parameter logging/error parameters disabled, ordinary/duration/parse logging
disabled, and reject known active pgAudit/auto_explain logging. Missing/mismatched
settings yield SERVER_LOGGING_REVIEW_REQUIRED. The helper never changes logging,
grants SET privileges, disables audit, or escalates to bypass this guard.
Neon may not permit the owner to configure these settings: if so, this path
remains BLOCKED. Settings observed in one session do not prove control over
provider/internal/proxy/third-party logging or subsequent configuration changes.
Owner review of provider logging, retention and access is still mandatory.

No password/connection string is printed for copying or written to disk.
The migrator authentication uses the supplied password in memory. Future
migrations need a separately authorized bounded credential window and process-local migrator `DATABASE_URL`
and `search_path=sam_pilot,pg_catalog`; the helper does not run migrations.

Local checks:

```sh
node --test tests/release/neon-migrator.test.cjs
node --test tests/release/neon-migrator-isolation.test.cjs
node --check scripts/provisioning/neon-migrator.cjs
```

Optional real SQL fixture, requiring already installed PostgreSQL utilities:

```sh
node --test tests/release/neon-migrator-postgres.test.cjs
```

This creates/removes its own private loopback PostgreSQL cluster, uses synthetic
credentials only, and checks actual `%I/%L` quoting, restricted SCRAM login and
rollback. It also runs the original migrations as the restricted migration role
and the original model-adapter regression against the private synthetic database
and local HTTP provider fixtures only. It also kills a real process after
credential commit, proves password expiry does not end an existing session,
then checks actual closure/session termination and denied future login.
Its installed local PostgreSQL version
is not Neon PG18 acceptance.

## Previous preparation evidence (before security hardening)

On the preparation based on repository HEAD
`d62f8af0adaf66c3dc519ac96177de99ea6e4cd3`:

- 13 mock/unit tests and one real private PostgreSQL 16.10 fixture passed.
- The private fixture applied all 10 original migrations under the restricted
  migrator and passed `tests/phase11/model_adapters.ts` with local HTTP fixtures.
- Existing release contracts, Setup Mode (16 refusal cases), PostgreSQL TLS
  negotiation, prelaunch (115 refusal cases), and provider-auth fixtures passed.
- Repository TypeScript no-emit check and helper syntax check passed.
- Default CLI returned `NOT_APPLIED`, `connectionAttempts: 0`.
- Dependency and privacy scanners reported zero findings. Replit SAST reported
  40 Critical findings under `javascript.express.db.pg-express.pg-express`,
  with no findings referencing the new helper. This does not close the existing
  project security ledger or prove scanner coverage of every new code path.

The existing database-backed regression runner was not used because it reads
workspace database/bearer settings. Existing services were not started or
restarted. No real secret was requested/read, no external Neon connection was
attempted, and no remote role, migration, resource or deployment was changed.

## Official sources reviewed for hardening

- PostgreSQL 18 [logging](https://www.postgresql.org/docs/18/runtime-config-logging.html):
  extended-protocol Bind values can be logged; parameter length 0 disables
  those ordinary/error values, not every possible audit sink.
- PostgreSQL 18 [role attributes](https://www.postgresql.org/docs/18/sql-createrole.html):
  VALID UNTIL applies only to passwords; CONNECTION LIMIT is approximate.
- Neon [roles](https://neon.com/docs/manage/roles): supplied plaintext passwords
  are required; pre-hashed passwords are documented as unsupported.
- Replit [Secrets](https://docs.replit.com/core-concepts/project-editor/app-setup/secrets):
  Secrets are project process environment values, not per-process vaults.

## Security-hardening acceptance

Classification: LOCAL SYNTHETIC / PostgreSQL 16.10, not live Neon PG18.
The base source commit was `801b283726fb3a25092ecd49c84f09bea9a682f5`.

| Gate | Status and evidence |
| --- | --- |
| Client secret handling | PASS: parameter-bound adversarial values, constant error handling, no raw output |
| Provider audit guarantee | PARTIAL/BLOCKED: known unsafe logging fails before password transmission; internal provider auditing remains unverified |
| Crash containment/reconciliation | PASS locally: actual SIGKILL after commit, 120s lease/connection bound, expiry rejects new login but existing session persists, then cleanup terminates and verifies zero sessions |
| Atomic crash-proof closure | NOT GUARANTEED: two-session verification and SIGKILL cannot be made atomic; expiry does not close sessions |
| One-shot transport/environment | PASS locally: hidden prompt, private fd round trip, credential-free child environment, no shared-secret fallback, arbitrary child errors discarded |
| Actual browser terminal/operator trust | NOT VERIFIED: TTY support/recording and same-UID/memory observers require owner review |
| Schema/SAM regressions | PASS: original 10 migrations/model-adapter fixture, release contracts, Setup Mode, TLS, preflight and provider-auth fixtures; no existing runtime changes |
| Typecheck/syntax | PASS |
| Whole-project security | BLOCKED: dependency/privacy zero findings; SAST still 40 Critical under the existing pg-express rule; no helper findings reported, not complete coverage proof |
| External execution | NOT RUN; no real secrets, external DB calls, provider/model calls, provisioning, purchase or Publish |

The standard credential-dependent full regression runner was deliberately not
used. Final test counts are in the accompanying task report.
