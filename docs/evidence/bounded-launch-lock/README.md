# Launcher lock correction — focused exact-head evidence

Application: `d2170eb8d2588ee8eeaa99b3c30e074d8f06d5d5`, branch `feat/bounded-trial-launcher`.

The exact old acquire function from `08369e4e0d11b6cb0d22fc7596c82db18b59bd8c` is retained only as a test fixture. Deterministic filesystem interleaving reproduced **two concurrent owners**, matching independent review. Source SHA-256: `2db4d8a8707a0ac50f5266f71828354af27084b35d8382bba54b507d3f8adf70`.

The replacement never unlinks the lock inode. Linux flock serializes recovery; parent and keeper retain the same open file description. Keeper loss aborts operations and fences journal use while the parent retains exclusion until close. Parent crash releases its descriptor and closes keeper stdin. Recovery acquires a fresh exclusive lease before cleanup. Missing flock fails closed. This requires a local Linux filesystem, not a distributed lock service.

## Exact-head result

Pinned `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`, Node **22.23.4**, readonly application mount and existing dependency mount, isolated PostgreSQL container.

- TypeScript typecheck: PASS.
- Lock regressions: **3/3 PASS**, including exact old-race reproduction, eight concurrent stale-recovery rounds with exactly one owner, persistent inode/successor safety, and unexpected keeper death with fencing.
- PostgreSQL launcher rehearsal: **15/15 scenarios PASS**. Includes failed/invalid signing, delivery/restart/observation, uncertain create, expiry, restore/quiesce failure, cancellation, process crash after insert/restart, and lease loss during signing followed by exclusive recovery.
- Each scenario: exactly one trial, unchanged 300000 ms deadline, zero model calls and $0 cost. Nominal insertion-to-fixture-restoration: **544 ms**.
- The full acceptance suite was not rerun for this focused lock repair. Prior acceptance is not presented as exact-head full-suite evidence.

`exact-head.log` contains commands executed by the PostgreSQL harness, outcomes, timings and the old-race source hash. `journals/` contains all 15 journals, results and a fixture-only public key. No private signing material is published. `source-files.json` binds every tracked source file to the tested commit. `SHA256SUMS` authenticates this evidence package.

Two development diagnostics are retained: the first test used an unavailable host /proc path; the next exposed synchronous rejection versus the promised journal API. Both were corrected before the frozen passing run. These failed runs are not acceptance evidence.

## Reproduction

With the pinned image, /app readonly candidate, /app/node_modules readonly existing dependencies, writable /tmp, and SAM_CORE_TEST_DATABASE_URL pointing only to isolated test PostgreSQL:

```sh
node --version
./node_modules/.bin/tsc --noEmit
node --import tsx --test tests/isolated/launch_journal_race.ts
node scripts/testing/core-reliability.cjs --suite tests/evaluation/operatorLaunch.ts
```

The exact run used `SAM_VERIFICATION_SOURCE_SHA=d2170eb8d2588ee8eeaa99b3c30e074d8f06d5d5` and exited 0. No production or paid provider was accessed.

## Remaining actual-binding requirements

The fixture uses a constant snapshot and launches a new ordinary heartbeat process. Approval files remain until fixture teardown. This does **not** demonstrate restoration of real release/configuration/credentials, production approval-file revocation, or Render restart latency. An authorized real operator binding must demonstrate those properties and timely startup within the unchanged deadline. Trusted owner signing, privileged setup and bounded spending remain separate unapproved operator actions; the live interlock remains disabled. Fixture signatures are not owner authority.

The original `08369e4` application and `ecf0abb10bf55e34c3f87fcc851b8994d58a0e93` evidence remain immutable; their lock-safety result is superseded by this correction.
