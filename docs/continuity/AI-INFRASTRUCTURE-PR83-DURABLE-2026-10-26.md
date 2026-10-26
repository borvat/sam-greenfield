# PR83 durable infrastructure continuation checkpoint

Parent: a4a960d2e90c4bc10b120e2f078cbb9074449025. Work remains on PR83's own scope.
Date: 2026-10-26. No deployment, migration of a shared DB, real credential access or inference call.

## Completed local stage

- Read PR83 and the current Hermes head 2a488c8fbf617a510b863e5042ddee9965b70bac.
- Existing canonical cost store is `model_calls`; existing authority is `approvals`, `audit_log`, goals/work_queue and SAM OAuth verifier.
- Added an opt-in PostgreSQL model_calls extension with exact micro-USD fields, immutable request scope/content,
  row-locked budget periods, durable authorization mappings, lifecycle and billing evidence. No parallel spend ledger.
- Added a typed middleware contract and minimal gateway patches. Shared source files remain untouched;
  patched copies of the actual base and Hermes gateway were tested in disposable directories.
- 40 original tests retained; 3 new exact-money/signature/hash tests passed. Actual gateway/Vault contract
  tests use an explicit memory/SQL test double and loopback synthetic provider. They do not prove PostgreSQL.
- Six gateway cases initially passed on the base, then a real Vault rotation case was added. Seven cases
  passed on Hermes 2a488c8 after installing that snapshot's own locked dependencies in its disposable directory.
- Root TypeScript check passed. Prior provider-auth/build/private-pipe regressions passed.

## PostgreSQL gate: BLOCKED, not verified

Verified npm package integrity for test binary @embedded-postgres/linux-x64 17.10.0-beta.17;
actual binary reports PostgreSQL 17.10. It was not used against any existing database.
The execution environment maps only UID 0 (`/proc/self/uid_map`: `0 0 1`). PostgreSQL refuses root.
Changing to an unprivileged UID cannot succeed: nonzero UIDs are unmapped. No privilege escalation,
root-check bypass, alternate SQL database or external/shared database was used.

Fifteen executable PostgreSQL acceptance tests are explicitly skipped with this BLOCKED reason.
Zero PostgreSQL behavior tests passed. SQL syntax parsing is separate and is not engine evidence.
Concurrency, SIGKILL/server-crash recovery, persisted revocation, monetary settlement and integrated
Gateway+PostgreSQL+Vault therefore remain IMPLEMENTED_NOT_VERIFIED.

## Resume

1. Read delivery/contract/handoff docs and the PR head; refresh Hermes ownership snapshot.
2. Run PostgreSQL tests as a non-root OS user against the disposable cluster harness. Do not use a shared URI.
3. Resolve any engine-level failure; do not weaken tests or replace PostgreSQL with a memory double.
4. Refresh the exact-source gateway patch against the Hermes engineer's accepted head and obtain recorded acceptance.
5. Coordinate schema, RLS, legacy-history allocation, provider health-query semantics and operational bootstrap
   before any shared migration/runtime activation. The current extension is test-loopback-only.

No running test process, pending database operation, live provider request or temporary authority remains.
Code and logs are in this PR; original Zvec/TestSprite evidence is preserved and was not rerun.

Publication checkpoint: final Hermes head e7a746aec41654c026337bb06c746bcb073e8fe7, Gateway source blob unchanged. Base/current Gateway cases each 7 PASS; 3 new pure checks PASS; 15 PostgreSQL cases BLOCKED/skipped, 0 PASS. Both typechecks passed. No live operation pending.
