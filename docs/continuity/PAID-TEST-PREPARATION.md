# SAM paid test preparation — 25 October 2026
Status: PREPARATION ONLY. No paid action, deployment or database mutation.
Base: PR63 e8663a6701b1acb86146aaaffd66395422c1169e.

## Owner scope revision
The owner explicitly permits losing the two current disposable test goals after preserving available evidence without delaying development. A complete backup or migration of those goals is no longer a prerequisite. Preserve their source-bound UI/audit observations in PR62/63; these are partial evidence, never a restorable database backup. No reset has been performed in this preparation.

The permission applies only to the disposable test container. Do not drop or reset the existing external PostgreSQL schema, historical financial ledger, production goal, Runtime or MCP services. A fresh fixture is a new test and never a successful migration.

## Concrete proposal
Reuse sam-isolated-test in Frankfurt; upgrade its compute from free to 0.5c-512mb (one instance). Reuse existing sam-trial-postgres in the same workspace/region at its current 0.1c-256mb / 1GB settings. No new service/database/disk/workspace subscription, no autoscaling change.
Additional base compute: USD7/month before tax and usage overages. Existing database charges remain existing charges, not another USD6 increment. Current official pricing and resource inventory were checked on 25 October. This is an estimate, not an invoice or all-workspace total.

512MB is the smallest paid service and a starting capacity proposal. It is not load acceptance. Inspect actual memory, CPU, DB size and connection headroom privately before starting; stop and propose separately if inadequate. Do not silently upgrade.

The hosted Render SQL connector could not inspect capacity or role expiry because this database refuses external connections. Do not open an external allowlist for convenience. Use authorized operator access from the paid test service over its existing private network after approval. Paid compute alone neither supplies a database connection nor repairs an expired role.

## Prepared verification code
storageCheckpoint.cjs reads one scoped goal, its nonempty current plan, linked audit, one synthetic evaluation trial and a nonzero reserved budget event. It compares counts and SHA256 digests, never emits row contents or connection values. Its CLI uses the existing private restricted-binding admission and a repeatable-read read-only transaction. It never creates data, grants privileges, renews a role or invokes a model.

Four focused injected-query tests passed. They verify retained data, reject changed audit/budget, reject missing/null/zero prerequisites, and reject malformed IDs. These are not native PostgreSQL or hosted-container acceptance. CJS syntax passed. An attempted TypeScript transpiler check was unavailable because the local compiler package was missing; the final added executable is CJS and no full repository typecheck is claimed.

## Execution after explicit cost approval
1. Recheck exact current service/database/branch; retain existing auto-deploy OFF. Preserve available old-goal evidence already recorded; use any authorized current UI readback if available without requesting secrets in chat. No provider-support dependency remains.
2. Apply only the approved paid plan to the existing test service. Keep its existing safe disposable candidate until operator and restricted-connection delivery are ready. Loss of old container goals is authorized; claim no migration.
3. Through a private authorized operator session, inspect existing external scope/ledger and available capacity. Do not reuse an admin connection as runtime configuration. Renew the existing approved role for ONE 60-minute window only when all artifacts and fixtures are ready. Reuse its reviewed grants; never silently broaden access or reset its budget. If the existing schema cannot safely host a fresh goal under those permissions, stop with the exact prerequisite.
4. Seed one distinctly marked synthetic goal, nonempty plan, goal-linked audit and nonzero artificial reservation using existing operator fixture mechanisms; keep live adapters/interlock disabled. No billable model calls or historical budget reset. Start with the canonical schemas/profile and preserve original RLS/immutability guards.
5. Deliver only that role's exact scoped private binding via the existing secret mechanism. Select provisioned-postgres and the fresh goal ID in SAM_TEST_PERSISTENT_SMOKE_GOAL_ID. Pin the reviewed candidate; /readyz and authenticated API/native readback must pass. Never fall back to disposable on a connection failure.
6. Capture baseline on the operator host:
   node --import tsx deploy/render-test/storage-checkpoint.cjs capture GOAL_UUID /private/checkpoint.json
   Securely retain this private file OUTSIDE the replaceable container before replacement; it contains identifiers and hashes, not a full backup. Re-deliver privately to the same verified test host for comparison after replacement. Never commit it or expose it through a public endpoint.
7. Restart, then explicitly redeploy/replace the actual hosted instance within the SAME original expiry. Record old/new deploy and instance identities independently via Render. After each:
   node --import tsx deploy/render-test/storage-checkpoint.cjs compare GOAL_UUID /private/checkpoint.json
   Also authenticate through UI/API and verify the same goal/state/plan and no extra startup goals/audits. A matching fingerprint alone never proves that replacement happened.
8. Independently verify role identity, public-table/DDL/company denial and that the trial's reservation is marked synthetic. Record native row continuity separately from model intelligence. New native code/build tests must pass on this exact candidate.
9. At the existing deadline preserve the role's expiry and test-service shutdown. Do not renew or reinterpret cost approval as continuous credential authorization. Export synthetic evidence privately before shutdown.

## Recovery and limits
Keep the external synthetic data on failure; roll back only the test code/config. A rollback to the old disposable profile is explicitly disposable and does not recover either old goal or the new persistent fixture. Code rollback is not data rollback.
Actual long-running service requires a separately approved restricted-identity lifecycle/rotation and native failure/recovery/backup/restore evidence. The 60-minute test guard remains unchanged. Storage approval grants no live model activation, owner signer trust, production change, merge or additional purchase.

## Acceptance still NOT_RUN
Native fixture creation/connection, hosted restart, actual container replacement, independent retained plan/audit/nonzero budget, and current-source full build. This preparation performs no such claim.

## Concurrent WMS update (read-only review)
WMS eaba5258 CURRENT was read: code507c6f50; original Accounting f03dd2fc has 11 successful programs and one failed site-selection program. All12 passed only with a local one-line proposed test patch; remote Accounting is not certified by that result. WMS published app remains older2a1adc7. No Accounting/WMS modification is part of this SAM preparation.

