# Independent engineering verification

The opt-in [Phase 5 specialist candidate](PHASE5_SPECIALIST_INTELLIGENCE.md)
added four required stages, including reasoning, Gateway budgets and specialist
state checks around the existing PostgreSQL restart. The
[Phase 6 review](PHASE6_REVIEW_AND_LIVE_EVALUATION.md) adds provenance-upgrade and
offline evaluation-contract checks for **44 required stages**. Live models remain
unexecuted and are not part of local acceptance.

The isolated [Phase 4 integration candidate](PHASE4_INTEGRATION_ACCEPTANCE.md)
adds three required integration stages. Use that document's candidate branch and
commands when accepting the combined profile; PR #46 remains unchanged.

GitHub stores source and PRs. Engineering acceptance can run in the authorized
Codex workspace or another approved **local Linux amd64 Docker environment**,
without GitHub Actions, billing access, Render, a CI provider or production keys.
No running services or databases from a previous task are prerequisites.

## Execute from a clean checkout

Install Git, Node.js 22 or newer (including npm), curl, GNU tar and Docker Engine
with BuildKit and Compose v2 supporting `config --no-env-resolution`. Use a local Unix-socket Docker context, not a remote production
daemon. The pinned containers supply Node 22, Python 3.11, PostgreSQL 15/pgvector
and OpenSSL. Host npm dependencies are not required for this command:

```sh
git checkout codex/sam-core-reliability
git status --short
npm run verify:full
```

Commit and review source changes before running. The runner rejects a dirty tree,
archives the exact HEAD into a fresh temporary directory, then runs `npm ci
--include=dev` there. Existing `node_modules`, untracked files, `.env` files and
local database URLs are not used. This tests the committed candidate, not an
uncommitted editor buffer. Run it again for each new implementation SHA.

```sh
# Optional new report directory; it must not already exist. Prefer outside Git.
npm run verify:full -- --output /tmp/sam-verification-candidate
node tests/testing/runner-contract.cjs
```

Default artifacts: `.local/verification/<run-id>/report.md`, `report.json`,
`SHA256SUMS`, `logs/` and `metadata/`. The directory is ignored by Git. Copy the
whole directory to the approved review channel; reports are not posted to GitHub
as status checks. Verify evidence integrity from within the report directory:

```sh
sha256sum --check SHA256SUMS
```

The machine report records source SHA/tree, a per-file source hash manifest,
implementation digest, commands/arguments, check timestamps, process exit codes,
individual regression/core suite results, runtime versions and container IDs.
PASS requires every required stage, including cleanup, to pass. A failure stops
subsequent stages: they remain `NOT_RUN`. Forbidden live/hosted checks are
explicitly `SKIP`, never PASS. A process killed with SIGKILL or a machine loss
cannot promise cleanup/final evidence; `RUNNING` or incomplete evidence is not
acceptance. SIGINT/SIGTERM request cleanup; rerun after diagnosing interruption.

## Required acceptance envelope

| Stage | Existing implementation reused / evidence |
| --- | --- |
| Tooling and source | Clean HEAD, local Docker availability, frozen archive, digest-pinned images |
| TypeScript | `npm run typecheck` |
| Regression | `npm run test:core-regression`, all phase 1–21 entrypoints |
| Reliability/security | `npm run test:core-reliability`, including crash/reconciliation without resend, restricted principals, bounded concurrency, leases and planning deadlines |
| Focused fixtures | Existing provider auth, real pg TLS positive/negative negotiation, contracts, synthetic pilot, managed schema, local bundle, closed setup, database contract and prelaunch gate tests |
| Migration lifecycle | Real migrator: baseline 00001–00010 → current, repeat apply, checksum tamper refusal, failing-batch DDL/receipt rollback, sentinel and every receipt retained after actual PostgreSQL restart |
| Phase 0 and tenants | Existing four Python commands, actual pgvector image, SQL migrations, app-login isolation and fail-closed tests |
| Clean image | Existing `build-image.cjs`, no build cache, fresh production dependencies, base digest pinned in a generated Dockerfile, non-root/image-env checks |
| Startup/restart | Actual image entrypoints: runtime, Command Center and MCP, two starts/stops, HTTP readiness/auth checks and retained synthetic sentinel; maintenance-only profile |
| Configuration | Existing build/preparation contracts, deterministic migration check, all workflow files through actionlint, three Compose configurations parsed without environment interpolation/resolution (no services started) |

The historical Phase 0 suite prints old migration counts/hashes and a statement
that GitHub Actions is needed for `LIVE_PROVEN`. Those legacy labels are not the
independent runner's verdict. Its current source manifest and actual commands
determine local evidence. The SQLite/static Phase 0 check is distinct from its
real PostgreSQL checks. Legacy broad fixture grants are not staging ACL guidance;
the core suites separately exercise fixed, restricted runtime principals.

The new database lifecycle fixture generalizes the Phase 2 one-off upgrade
exercise; the actual migration algorithm remains `packages/db/src/migrate.js`.
The application lifecycle fixture adds real process coverage around existing
entrypoints; it does not substitute a fake service or planner for SAM.

The first independent run (`c08f9985dcc2bf97e2343ba7a0b3829a60f2ca78`)
passed the source suites, migrations, database restart, isolation and clean build,
then correctly failed real image startup. The image lacked `scripts/release`:
runtime composition imports reported `MODULE_NOT_FOUND` for
`synthetic-pilot.cjs`; MCP also imports `mcp-oauth.cjs` from that directory.
The Dockerfile now includes those existing helpers. This is a packaging
correction, without deployment or a change to production services. Retain that
failed run beside subsequent successful evidence; a successful build alone is
not application startup acceptance.

## Dependencies, isolation and reproducibility

`scripts/testing/verification-images.json` freezes the Linux amd64 image digests
and checksum-verified actionlint release. npm uses `package-lock.json` integrity;
Python uses a pinned CPython 3.11 wheel with `--require-hashes`. Dependency
installation/builds need access to the existing Docker registry, npm registry,
PyPI and the official actionlint GitHub release download. Source checkout/push
needs Git transport. No GitHub API or Actions endpoint is required. A denied
download is a prerequisite failure, not permission to bypass policy.

Use the environment's existing proxy and CA configuration. Only named transport
variables and the CA file are provided during installs/builds; no TLS or checksum
verification is disabled. Tests receive only generated fixture configuration,
run on an internal Docker network and publish no ports. The runner never accepts
an external database argument or mounts the Docker socket into a container.

Unique run names/labels prevent collisions. Cleanup verifies ownership before
removing its containers, anonymous volumes and network; it never globally prunes
Docker or stops another run. Temporary checkout/dependencies are removed. The
clean application image is retained by run-specific tag for inspection; shared
pinned base images/cache are retained. Delete only the recorded run image when
review is complete. An administrator may need to inspect labeled leftovers
after machine loss; never use a broad cleanup command on a shared host.

The generated verification Dockerfile changes only the production base FROM to
the reviewed digest. Its original/generated hashes are reported; the tracked
production Dockerfile is not rewritten by the runner. Pins must be deliberately
reviewed and revalidated for security updates. Exact dependencies improve
repeatability; CPU timing, machine capacity and image build timestamps still
vary. No bit-for-bit identical image or production performance claim is made.

Actionlint checks workflow syntax and Actions semantics. Optional shellcheck and
pyflakes integrations are not installed or claimed by this runner. It does not
execute GitHub-hosted jobs, discover private branch rules or prove runner OS parity.

## Reusable development and review gates

1. Codex implements on an authorized development branch, preserving existing
   suites and safety boundaries. Commit the candidate.
2. Run `npm run verify:full` against that exact commit in disposable infrastructure.
   Diagnose failures; rerun after a meaningful correction. Retain failed evidence.
3. Give the report directory and source SHA to an independent reviewer. They
   inspect changes, exclusions, hashes and failures; a second clean execution can
   independently reproduce the same candidate without copying dependencies.
4. An authorized maintainer decides merge only after effective rules/reviews are
   verified. A local report neither posts a status check nor satisfies a required
   GitHub Actions context. If current rules require hosted green checks while
   the account is locked, merge remains blocked. No protection changes, fake
   green checks, alternate-account rerouting or automatic merge are part of this.
5. Staging is separately authorized and follows
   [the controlled staging plan](CONTROLLED_STAGING_PLAN.md). Production readiness
   needs further operational/provider/restore/security evidence. Local acceptance
   grants no deployment, customer access or business-action authority.

PR #46 remains a Draft and must not be merged by this workflow. The account lock,
effective merge rules and staging/production authorization remain external gates.
