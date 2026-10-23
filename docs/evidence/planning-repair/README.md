# Planning repair verification evidence

Application PR: https://github.com/borvat/sam-greenfield/pull/52

This evidence branch is separate from the fix branch. It contains local synthetic
verification artifacts only; it does not represent hosted checks, deployment or
live goal success. All database URLs/passwords and provider responses in these
logs are disposable synthetic fixtures. No production credentials or data were
used.

## Application commits

- Deployed base: `67f528d4da989740fc542b817c4f38402db635fe`.
- Initial fix: `00b821d73a764d2c89c0a3f1e6e3535642fa5349`.
- Replan repair protection follow-up: `3d8de1c2620cc519926e608bc66018edc6df0e9e`.

## Isolated harness change

The original full runner polled Unix-socket `pg_isready`. The pinned PostgreSQL
image temporarily starts a socket-only server with `listen_addresses=''` during
initialization. That server can accept connections before `sam_core_test` exists,
and the original runner failed twice at the next database creation command.

`harness/readiness.patch` shows every change to the external runner copy. It
requires an actual `SELECT 1` over TCP against the target disposable database,
keeping the same retry/timeout limits. The other two lines relocate the repository
root and unchanged image-pin file for external execution. Application snapshots,
image pins, test selection, assertions and required checks remain unchanged.
The repository verification runner itself was not edited in the fix PR.

Commands (each run began from a clean checkout at its recorded application SHA):

```sh
node /tmp/sam-planning-harness/verify-full.cjs --output /tmp/sam-planning-full-ready
node /tmp/sam-planning-harness/verify-full.cjs --output /tmp/sam-planning-full-replan
```

Each report records exact subprocess argv, exit statuses, source commit/tree/file
manifest hashes, pinned images and runtime versions. Its SHA256SUMS file covers
all original output artifacts. Each top-level console.log is supplemental.

## Separate pre-existing assertion failure

`base-assertion.log` records a failure on the unchanged deployed base:

```sh
git worktree add --detach /tmp/sam-planning-base-check 67f528d4da989740fc542b817c4f38402db635fe
ln -s /workspace/sam-greenfield/node_modules /tmp/sam-planning-base-check/node_modules
DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node --import tsx /tmp/sam-planning-base-check/tests/isolated/replan_fault_injection.ts
```

Exit 1, `tests/isolated/replan_fault_injection.ts:30:9`:
expected `/Previously failed read/`, actual `PLAN_FAILED_READ_REPLAY`.
The same assertion fails on the initial fix and on final application commit
`3d8de1c2620cc519926e608bc66018edc6df0e9e` (`final-assertion.log`, same
command from the main checkout, exit 1). This test concerns direct-call
failed-read feedback; the deployed base already emits the code while the test
expects prose. That behavior was not changed here. This extra test is not selected
by the existing full runner, and its failure is reported separately, not hidden
by claiming every repository test passes.

## Replan regression

`replan-targeted-pass.log` records the expanded planningRepair suite passing with
the follow-up fix. `replan-negative-control.log` records the same test failing
when only apps/production/src/planner.ts was temporarily restored to the initial
fix version, then restored before commit. Both use:

```sh
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:planning-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/core/planningRepair.ts
```

The test starts with a failed Drive metadata read, rejects an empty first replan
candidate, rejects a `file_id` alias replay of the original `fileId` read on the
next reservation, and accepts a safe alternative on the third. Every call checks
failed-read exclusions, recovery capability selection and previous-plan context.
The replan count remains one; no invalid candidate persists or executes.

## Full acceptance results

- `00b821d73a764d2c89c0a3f1e6e3535642fa5349`: **PASS**, 59/59 stages PASS. [Report](00b821d/report.md), [structured commands/results](00b821d/report.json), [console log](00b821d/console.log), [artifact hashes](00b821d/SHA256SUMS).
- `3d8de1c2620cc519926e608bc66018edc6df0e9e`: **PASS**, 59/59 stages PASS. [Report](3d8de1c/report.md), [structured commands/results](3d8de1c/report.json), [console log](3d8de1c/console.log), [artifact hashes](3d8de1c/SHA256SUMS).

These results use the isolated readiness-adjusted harness described above. They
do not assert that the unmodified full runner is free of the startup race, that
the separately documented assertion passes, or that the live sales goal succeeds.
No tests were removed or weakened. GitHub hosted checks, release and live retest
remain separate gates.
