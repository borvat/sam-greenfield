# Neon pilot migration authentication — standalone preparation

This helper is not a runtime service, migration runner, or deployment command.
Local/mock verification is not evidence of Neon authentication or migration.
Nothing should invoke this helper automatically.

## Approved preparation versus separate execution approval

The current approval covers implementation and local synthetic tests only.
Do not add credentials or run `--apply` until the owner separately authorizes
the exact pilot endpoint, credential change, two connection attempts, and
provider-side logging risk. Connecting can wake compute/consume Free quota;
there is no guarantee of zero metered usage. No Publish is authorized.

The owner-reported baseline is PostgreSQL 18, database `neondb`, `pgcrypto` 1.4
owned by `neondb_owner` in `public`, and empty schema `sam_pilot` owned by
`sam_pilot_migrator`. Both pilot roles must be NOLOGIN, NOINHERIT and non-admin,
have no parent-role memberships, no database/public CREATE, and have CONNECT.
The application must have schema USAGE without CREATE.

## Inputs after separate approval

Use Replit Tools → Secrets; never chat, SQL Editor, command arguments, `.env`
files, or tracked files:

- `SAM_PILOT_PROVISIONER_DATABASE_URL`: existing administrator's **direct**
  connection URL, user `neondb_owner`, database `neondb`, port 5432/default,
  with exactly `sslmode=verify-full` and no other URL options.
- `SAM_PILOT_MIGRATOR_PASSWORD`: password-manager-generated random password,
  32–256 characters without control characters. Length alone is not entropy proof.

These are new helper inputs, not runtime settings. Never overwrite the
Replit-managed/development `DATABASE_URL`. The administrator needs CREATEROLE
and direct ADMIN OPTION on the existing migrator; SET permission alone does
not authorize password changes in PostgreSQL 18.

Pin the actual direct endpoint hostname from the approved project/branch's
Connect dialog. An `ep-...neon.tech` hostname alone cannot prove project,
branch or region; owner confirmation of the exact hostname remains necessary.
No pooler endpoint or relaxed certificate verification is permitted.

## Commands

Safe default (no secret reads, no pg client loaded, no connection):

```sh
node scripts/provisioning/neon-migrator.cjs
```

Only after the separate approval and protected secret entry:

```sh
node scripts/provisioning/neon-migrator.cjs \
  --apply --host=THE_APPROVED_DIRECT_ENDPOINT \
  --ack-provider-audit-risk
```

The host argument is public connection metadata, not a credential. Do not put a
URL/password in this command. No automatic retry is performed.

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

After commit, a fresh migrator connection runs read-only metadata checks,
including actual session identity, search_path, restricted privileges and the
unchanged application role. PASS means authentication and these checks only,
not migration/RLS/backup/runtime/release acceptance.

Failures before commit roll back. Failed authentication or uncertain commit
triggers one compensating NOLOGIN/password-clear attempt on the same admin
connection. If compensation cannot be confirmed, `REMOTE_STATE_UNKNOWN`
requires owner inspection; no safety claim or automatic retry is made.
A process kill after commit can leave LOGIN enabled before verification.
Recovery needs administrator inspection; this cannot be made atomic across
two independent connections. The migrator is a DDL-owning maintenance identity,
not an RLS-restricted application identity, and must never be given to a worker.

## Secret and audit caveats

Output contains only controlled codes and metadata. No raw pg errors, stack
traces, SQL, configuration, URLs, passwords or credential files are emitted.
The helper never executes SQL in SQL Editor, so it does not create an
SQL Editor command-history entry. This is **not** a guarantee against
provider statement/parameter/error auditing, monitoring or server memory
exposure: Neon requires plaintext password input over TLS. Review provider-side
logging/access before execution; the acknowledgement flag is mandatory.
Replit Secrets are process environment values, not per-script isolation.
Restrict collaborator access and do not start unrelated services with the
temporary administrator secret present. Remove it after provisioning.

No password/connection string is printed for copying or written to disk.
The migrator authentication uses the supplied password in memory. Future
migrations need a separately authorized process-local migrator `DATABASE_URL`
and `search_path=sam_pilot,pg_catalog`; the helper does not run migrations.

Local checks:

```sh
node --test tests/release/neon-migrator.test.cjs
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
and local HTTP provider fixtures only. Its installed local PostgreSQL version
is not Neon PG18 acceptance.

## Preparation evidence

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
