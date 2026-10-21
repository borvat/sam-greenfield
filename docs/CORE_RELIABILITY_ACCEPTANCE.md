# Core reliability acceptance — 2026-10-21 UTC

Local engineering checks pass. Production readiness is **not established**.
GitHub API publication remains blocked; no PR was created automatically.

Requested starting commit: `12f988f81dfa5a203eda14f9ad3d320d991a9ab0`.
Tested implementation commit: `3aee07abf2d7f48a3f8f90f02602ddd263ebf2bd`
on `codex/sam-core-reliability`. Later commits record documentation/evidence only.
Remote main was still `b55da2761e8fd1de3833be55f03d4fdd268cd0a3`.

## Docker diagnosis and correction

Reproduced the original Dockerfile failure with `docker build --no-cache`, the
existing proxy build arguments and the ephemeral organization CA, both with the
default build network and with `--network=host`. npm 10.9.9 on Node 22.23.4
reported `Exit handler never called`. Capturing npm's debug log exposed repeated
`EAI_AGAIN` failures. A bounded `npm view pg version` probe isolated
`getaddrinfo EAI_AGAIN proxy`. The host resolves that configured hostname; BuildKit
did not. Supplying the host-resolved address using `--add-host` made the same probe
and clean installation pass. No proxy endpoint, authentication or permissions
were replaced; TLS and lockfile integrity verification remained enabled.

The first successfully built image then failed at runtime: root-owned copied
files retained the checkout's owner-only modes; `USER node` could not read
`/app/package.json` (`EACCES`) or traverse source directories. Dockerfile copies
now explicitly use `--chown=node:node`.

`scripts/development/build-image.cjs` makes this environment correction reusable:
it resolves only configured HTTP(S) proxy hostnames through the host, supplies
supported Docker host mappings and predefined proxy arguments, optionally mounts
`NODE_EXTRA_CA_CERTS` as a BuildKit secret, and propagates build failure status.
It always uses `--no-cache`; it never starts a service or deploys an image.

Actual successful command:

```sh
node scripts/development/build-image.cjs sam-core-reliability:acceptance
```

Result: exit 0; fresh `npm ci --omit=dev` installed 23 packages, audited 24,
reported zero known vulnerabilities at that time, and exported image
`sha256:1aae1f38a51cae00d6ef6d9a095a592752e6ec9d33cf4659c67906372a135d5e`.
The npm install layer ran; no host `node_modules` or npm cache was copied/mounted.
Base-image reuse is intentional. No claim of image pinning or a full security
assessment follows from npm's audit summary.

The runtime image contains `USER node`, no proxy variables in its image config,
and no `/run/secrets/registry_ca`. The original Dockerfile and clean builds were
tested directly before introducing the helper.

## Executed acceptance checks

All databases and provider results below are disposable local fixtures. The only
network registry activity was dependency/image acquisition; no paid model or
business connector was invoked. Commands captured their underlying exit status. Archived logs normalize trailing
whitespace and final blank lines; output content is retained.

| Command / check | Actual result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | exit 0 | [log](acceptance/2026-10-21/typecheck.log) |
| `npm run test:core-reliability` | 15 assertion groups; exit 0 | [host log](acceptance/2026-10-21/core.log) |
| `npm run test:core-regression` | all 38 phase 1–21 suites pass | [log with individual results](acceptance/2026-10-21/regression.log) |
| Clean image build command above | exit 0 | [build log](acceptance/2026-10-21/build-fixed.log) |
| Core runner inside that image, as `node` | 15 groups; exit 0, fresh production dependencies | [image log](acceptance/2026-10-21/image-core-fixed.log) |
| Baseline migrations 00001–00010 → 00012/00013, then repeat apply | 12 receipts; second apply skips all; sentinel preserved | [log](acceptance/2026-10-21/migrations.log), [executed fixture](acceptance/2026-10-21/migration-upgrade-fixture.cjs) |
| PostgreSQL container restart, sentinel/ledger checks, repeat migrate | preserved row and all 12 receipts; exit 0 | [log](acceptance/2026-10-21/postgres-restart.log) |
| Runtime image default `npm start`, health checks and container restart | `/livez` 200, `/readyz` 200, unauthenticated `/statusz` 401 before and after restart; SIGTERM handled | [log](acceptance/2026-10-21/image-smoke.log) |
| `provider_auth.ts`, `postgres_tls.ts`, `contracts.ts`, `synthetic_pilot.ts`, `managed_schema_source.cjs` via isolated runner | all 5 pass | [logs directory](acceptance/2026-10-21) |
| Four Phase 0 commands below | all pass on isolated PostgreSQL 15.19 | [logs directory](acceptance/2026-10-21) |
| `git diff --check`, `node --check scripts/development/build-image.cjs` | exit 0 | checked before implementation commit |

The core suite exercises actual child-process exit 72 after a synthetic provider
commit and before its receipt, lease expiry/recovery, reconciliation with consumed
approval, no resend across restart/replan, unknown-outcome escalation, dependency
gating and typed propagation. Restricted application-role tests execute the
CommandCenter → planning → execution → independent verification workflow and
reject foreign, missing and spoofed tenant context and protected registry writes.
This is process-level and database-level evidence with synthetic providers.

Actual fixture startup and host commands:

```sh
docker run --detach --name sam-core-reliability-pg \
  --label sam.scope=core-reliability-test --publish 127.0.0.1:55432:5432 \
  --env POSTGRES_PASSWORD=sam-local-fixture --env POSTGRES_DB=sam_core_test \
  postgres:15-alpine
export SAM_CORE_TEST_DATABASE_URL=postgres://postgres:sam-local-fixture@127.0.0.1:55432/sam_core_test
npm run test:core-reliability
npm run test:core-regression
npm run typecheck
node /tmp/sam-migration-acceptance.cjs
docker restart sam-core-reliability-pg
# Assert pre-upgrade organization sentinel and 12 receipts using pg/assert.
DATABASE_URL=postgres://postgres:sam-local-fixture@127.0.0.1:55432/sam_core_test_upgrade \
  node packages/db/src/migrate.js --check-deterministic --apply
```

The executed `/tmp` migration fixture is archived in the evidence directory. It
creates only a new `sam_core_test_upgrade` database on loopback, records original
migration hashes, upgrades through the actual repository migration runner, and
asserts repeat apply. For a fresh rerun, copy it to `/tmp` and use a new disposable
container; it intentionally refuses reuse through PostgreSQL's existing-database
error. Never point these fixture commands at another service. The resulting
deterministic schema hash was
`46b5b2ea30b893050cccef71e5f82c1cac406a51f72b66696f31cb5540a1a8c4`.

Actual image test command after the PostgreSQL restart:

```sh
docker run --rm --network container:sam-core-reliability-pg \
  --mount type=bind,src=/workspace/sam-greenfield/tests,dst=/app/tests,readonly \
  --mount type=bind,src=/workspace/sam-greenfield/scripts,dst=/app/scripts,readonly \
  --env NODE_ENV=test \
  --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:sam-local-fixture@127.0.0.1:5432/sam_core_test \
  sam-core-reliability:acceptance node scripts/testing/core-reliability.cjs
```

Only tests/scripts were mounted; application source and dependencies came from
the built image. The default-start health smoke used an explicitly empty fixture
composition, its own loopback port 18080, and the isolated upgraded database.
It proves image packaging/startup/recovery/health and restart, not live production
composition behavior. The separate restricted-role core workflow tests that
execution boundary with fixtures.

The executed startup/restart smoke commands were:

```sh
cat > /tmp/sam-acceptance-composition.ts <<'EOF'
export default {async runWorkTick(){},supervisorOptions:{monitorSideEffects:false}};
EOF
chmod 644 /tmp/sam-acceptance-composition.ts
docker run --detach --init --name sam-core-reliability-runtime \
  --label sam.scope=core-reliability-test --network container:sam-core-reliability-pg \
  --mount type=bind,src=/tmp/sam-acceptance-composition.ts,dst=/tmp/sam-acceptance-composition.ts,readonly \
  --env DATABASE_URL=postgres://postgres:sam-local-fixture@127.0.0.1:5432/sam_core_test_upgrade \
  --env SAM_WORKER_ID=acceptance-only \
  --env SAM_COMPOSITION_MODULE=/tmp/sam-acceptance-composition.ts \
  --env PORT=18080 sam-core-reliability:acceptance
docker exec sam-core-reliability-runtime node -e \
  'Promise.all(["livez","readyz","statusz"].map(async p=>{const r=await fetch("http://127.0.0.1:18080/"+p);console.log(p,r.status,await r.text());if(r.status!==(p==="statusz"?401:200))process.exitCode=1})).catch(()=>{process.exitCode=1})'
docker restart sam-core-reliability-runtime
# Repeat the same docker exec health assertions after restart.
```

Focused commands used the same host test URL:

```sh
node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```

Phase 0 used a separate `sam_core_test_security` database with all 12 SQL files
applied from zero. The legacy suite asserts every public table has RLS, so this
fixture uses raw SQL application without adding the owner's migration ledger to
that public schema; the ledger itself is tested by the separate upgrade check.
Each command used a sanitized environment: `PATH`,
`PYTHONPATH=/tmp/sam-python-fixtures`, and only these disposable URLs as
`DATABASE_URL` / `DATABASE_URL_APP`. The app URL used the legacy fixture's
`app_tenant_test:test_password` NOSUPERUSER/NOBYPASSRLS role; this is separate from
the stricter runtime role exercised by the core suite.

```sh
python3 tests/phase0/phase0_acceptance.py
python3 tests/phase0_postgres/real_postgres_test.py
python3 tests/phase0_postgres/test_rls_tenant_isolation.py
python3 tests/phase0_postgres/test_rls_fail_closed_security.py
```

Legacy test output still mentions historical migration counts/hashes in labels;
the measured current migration count/hash above comes from the actual runner.

## GitHub access and manual Draft PR

`git ls-remote origin refs/heads/main refs/heads/codex/sam-core-reliability`
succeeded. These read-only API probes failed:

```sh
gh api -i repos/borvat/sam-greenfield
gh api graphql -f query='{ viewer { login } }'
curl --silent --show-error --max-time 15 \
  --dump-header /tmp/sam-github-transport-headers.log \
  --output /tmp/sam-github-transport-body.log \
  --write-out 'HTTP response=%{http_code}; proxy CONNECT=%{http_connect}\n' \
  https://api.github.com/repos/borvat/sam-greenfield
```

curl exited 56, proxy CONNECT returned 403 (`server: envoy`), and the upstream
HTTP response remained 000. This identifies a configured API transport denial,
not proof of missing repository membership/token scope; GitHub authorization was
not reached. [Recorded responses](acceptance/2026-10-21/github-api.log).
Earlier REST/GraphQL PR creation attempts were also Forbidden. No credentials
were extracted, new tokens requested, alternative network routes used or
permissions bypassed. Current PR/check/review state cannot be verified.

[Open the manual PR creation form](https://github.com/borvat/sam-greenfield/pull/new/codex/sam-core-reliability).
Choose base `main`, compare `codex/sam-core-reliability`, paste the complete
[PR description](CORE_RELIABILITY_PR.md), then select **Create draft pull request**
from the create-button menu. Suggested title: **Harden SAM planning, execution,
verification and tenant boundaries**. This link opens a creation form; it is not
an existing PR, and draft status must be selected in the UI. Browser UI access
could not be validated here. Git push supplies this canonical branch form link.

## Compatibility and remaining blockers

All 38 current regression entry points pass and TypeScript checks pass. Original
migrations 00001–00010 remain unchanged; only 00012/00013 are added. Migration
00011 is reserved for the observed unmerged OAuth branch. Those other branches
were not merged or rewritten, and ongoing stability tests were not touched.

Remaining external validation: hosted CI/reviews (API blocked), live providers,
platform-specific Replit identity tests, combined unmerged branch integration,
production role/data/backfill/rollback compatibility and sustained-load/stability
results. No production readiness, exactly-once external delivery or production
backup/restore claim is made. API automation requires authorized environment/API
access; the manual Draft PR path is available without changing permissions.

No production deployment, database or credential change, PR merge, paid service
use, external message or business action occurred. Only containers created for
this acceptance run are stopped/removed at completion; the image is retained
locally. The implementation commit is distinct from evidence-only documentation
commits so the tested source SHA remains explicit.

Cleanup completed: both labeled acceptance containers and their disposable volumes
were removed; the runtime stopped with exit 0. Reusable `start_skill` instructions
were saved successfully as an environment configuration draft. This does not
apply/publish the configuration or establish fresh-task restoration. Review/save
and publish the draft in environment settings to retain that configuration.
