# Reproduce PR83 PostgreSQL acceptance

Use a fresh independent Linux x86_64 host that supports a real non-root OS user. No shared database URI is accepted.
The existing harness creates and destroys its own cluster, truncates only that cluster and performs immediate crash stops.
Keep its fsync/synchronous_commit/full_page_writes settings enabled.

## Tested pins

- PostgreSQL 15.19, Debian package 15.19-0+deb12u1.
- pgvector 0.8.1, official repository https://github.com/pgvector/pgvector, commit 778dacf20c07caf904557a88705142631818d8cb.
- Node 22.23.4 (official linux-x64 archive; published SHA-256 verified during setup).
- Vault 1.21.0, official linux_amd64 archive, SHA-256 5a91c93a9949ed8863ee4b91cfc30640bc49ab04225f0b1c5a0650c4d6e10171.
- Acceptance source a644ba6158c1fdd7e49c7332ff74782726c79ff2.
- Regression source f27152e271e3945a89dbc2bbaa6f54ab7d05a97a (same runtime code).
- Actual Gateway source 57a19d8fd42167d76b97298a4f0031c7b8153d0d; blob 769d2d3774aa3eac81e07d9e25ea9ce6a6093d8b.

Install normal PostgreSQL server binaries and the genuine matching pgvector extension in the disposable host.
On Debian 12 the test preparation installed postgresql, postgresql-server-dev-15 and build-essential, then built the pinned upstream pgvector with make / make install.
No root-check modification or dummy VECTOR type is permitted. Start the test command as the non-root user, with a writable HOME and checkout.
Vault is the normal binary, not dev mode; the existing vaultHarness initializes file storage and synthetic credentials.

## Prepare the existing Gateway fixture

In a disposable clone pinned to the desired test source, with the Hermes snapshot fetched:

```sh
npm ci --no-audit --no-fund
export PR83_FIXTURE_ROOT=/tmp/pr83-gateway-fixture
python3 packages/ai-infrastructure/integration/prepare-gateway-fixture.py \
  --ref 57a19d8fd42167d76b97298a4f0031c7b8153d0d \
  --out "$PR83_FIXTURE_ROOT" --patch /tmp/pr83-gateway-review.patch
test -L "$PR83_FIXTURE_ROOT/node_modules"
unlink "$PR83_FIXTURE_ROOT/node_modules"
(cd "$PR83_FIXTURE_ROOT" && npm ci --no-audit --no-fund)
export AI_TEST_GATEWAY_ROOT="$PR83_FIXTURE_ROOT"
export AI_TEST_POSTGRES_BIN=/usr/lib/postgresql/15/bin
export AI_TEST_VAULT_BIN=/opt/vault/vault
node --import tsx --test tests/ai-infrastructure/durable-postgres.test.ts
```

The fixture directory must not already exist. The helper patches only the disposable copy of the actual gateway.
Each snapshot uses its own locked dependencies (38 packages for the PR83 source, 121 for the tested Hermes snapshot).
The production/shared gateway file is not patched.

Expected final acceptance: 15 tests, 15 pass, 0 fail, 0 skipped, 0 cancelled, exit 0.
If any prerequisite is missing and the runner skips cases, that is BLOCKED, not success.

## Actual settings check used before the run

```sh
node --import tsx --input-type=module <<'JS'
import {postgresHarness} from "./tests/ai-infrastructure/postgresHarness.ts";
const pg=await postgresHarness();
try {
  const r=await pg.pool.query("SELECT current_setting('fsync') fsync,current_setting('synchronous_commit') synchronous_commit,current_setting('full_page_writes') full_page_writes");
  console.log(r.rows[0]);
  if(Object.values(r.rows[0]).some(v=>v!=="on"))throw Error("UNSAFE_TEST_SETTINGS");
} finally {await pg.close();}
JS
```

The saved run reports fsync=on, synchronous_commit=on, full_page_writes=on and vector_version=0.8.1.

## Related regression command actually executed in Work

Work used Node 24.22.1 + real Vault 1.21.0, same Gateway source, and a clean checkout at f27152e.
Set the two Vault/Gateway paths above for that host, then:

```sh
node --import tsx --test --test-concurrency=1 \
  tests/ai-infrastructure/infrastructure.test.ts \
  tests/ai-infrastructure/benchmark.test.ts \
  tests/ai-infrastructure/durable-unit.test.ts \
  tests/ai-infrastructure/durable-transaction.test.ts \
  tests/ai-infrastructure/gateway-contract.test.ts
npm run typecheck
(cd "$AI_TEST_GATEWAY_ROOT" && npm run typecheck)
```

Observed: 52 pass / 0 fail / 0 skipped, exit 0; both typechecks exit 0.
This command intentionally excludes PostgreSQL: that proof is the separate real-engine run above, not root-only Work.
No cloud model is called by either command. Keep all provider credentials synthetic.

## Cloud lifecycle

The owner authorized one sandbox only, USD 1 total, one core / 4 GiB hard limits and a one-hour hard lifetime.
Its three-minute idle timeout ended it during evidence publication after PostgreSQL success.
No second sandbox was created; a later remote regression exec returned NotFound before starting any test.
SDK poll exit 0 and the dashboard's zero active container count confirm cleanup.
Any future resource needs authorization that covers that run; do not silently reuse an earlier financial approval.
