# Provisioned test-storage preparation

Current source-pinned state supersedes the historical preparation counts below: application `3e0efe72a2e54ba015c81d4d145b0771d4169fc6` is LIVE on the existing isolated service after the owner's approved USD 7/month base compute upgrade to `0.5c-512mb`. TypeScript, 119 isolated tests, all five native Docker-build PostgreSQL suites and the deployed nine-check API smoke pass. Storage is still DISPOSABLE. Hosted persistence/replacement acceptance is NOT_RUN; the approved one-time 60-minute role window remains unopened because authorized database-owner access is unavailable. No live-release signature or further cost approval is required for this storage-only window. See the final checkpoint in SAM-2026-10-24.md before resuming; do not create a new schema or role under this existing-scope authorization.

This candidate adds a read-only bootstrap for an operator-provisioned synthetic PostgreSQL binding. It does not create a database, role, scope, trust root, signature, trial, model call or live permit at startup.

## Runtime contract

Default `SAM_TEST_STORAGE_PROFILE=disposable` retains the existing infrastructure sandbox. Opt-in `provisioned-postgres` requires `SAM_TEST_RESTRICTED_CONFIG_PATH` pointing to the private connection file produced by `scripts/evaluation/provision-isolated.ts` on its authorized host. The file is not a deployment artifact and must not be committed or exported between services. File identity, bounded size, owner-only permissions, role name, tenant IDs and exact connection context are checked.

The provisioned role must be non-owner and non-administrative, NOINHERIT, fixed to one synthetic tenant, unable to create schemas and unable to read/write public tables. Existing integration, specialist, evaluation and shared-goal profiles are verified in a read-only transaction. Five minutes of role lifetime must remain. Failure refuses startup; it never falls back to disposable data, renews a credential, runs migrations or grants rights.

The admitted connection replaces only test storage. The maintenance-only worker, disabled external adapters and disabled live-evaluation interlock remain unchanged. Persistent storage is a prerequisite, not live reasoning activation. Runtime bootstrap and the operator's privileged one-time setup remain distinct.

## Pending restart-safety candidate

Provisioned startup additionally requires `SAM_TEST_PERSISTENT_SMOKE_GOAL_ID` naming an existing migrated synthetic goal. Runtime smoke performs GET-only checks and independent database readback of its ID, state and plan; it never creates a replacement goal or denial audit at persistent startup. The disposable fixture path still exercises intake and elevated-authority denial separately.

Provisioned role admission rejects replication authority and a password window longer than 60 minutes. A conservative monotonic lease is anchored before connection preflight using the database's remaining lifetime, so import/validation delays cannot restart its clock. The test proxy refuses work when the lease ends and its bounded child shutdown starts two seconds early. No new children start after shutdown. This does not renew credentials. Data persists externally after expiry, while a subsequent bootstrap refuses the expired login. Continuous operation requires its own approved restricted-identity lifecycle.

These changes are prepared only: 116 isolated tests and TypeScript pass. The HTTP lease and startup tests use an injected database client/clock and are not proof of actual PostgreSQL expiry or hosted replacement. No deployment, full source backup, restoration or migration has occurred on this candidate. See the canonical SAM-2026-10-24.md checkpoint for the source-container backup blocker and remaining acceptance.

The later owner scope permits loss of the two disposable source goals after retaining partial evidence, so the old full-backup blocker is superseded. Paid upgrade approval remains pending. The extended `tests/core/persistentStorage.ts` now prepares a NEW fixture plan/audit and reserves USD 0.03 through the existing restricted trial path without invocation. The shared operator helper performs read-only complete-row comparison of goal/plan/audit/trial/events. Native execution is pending; the latest isolated suite has 119 passing tests and TypeScript passes. A new fixture is not a migration, a reservation is not an invoice, and a process restart is not a hosted container replacement.

## Verification plan

`tests/isolated/persistent_binding.ts` tests invalid identities/context, exposed files, symlinks, expired/admin/inherited principals, profile failure and rollback-only behavior. The complete isolated suite currently passes 109 tests. TypeScript covers the new deployment entry and binding.

`tests/core/persistentStorage.ts` uses the existing isolated provisioner against a local disposable native PostgreSQL database, verifies the actual restricted profile, creates a goal over authenticated HTTP, SIGKILLs the server process, starts a replacement and independently reads back the same goal with no duplicate goal/execution. It additionally tests DDL/public-table denial. This is build-time application-process replacement, not proof of a Render container replacement or real-provider inference.

The native test is added as a fifth build gate. The existing four suites remain. Startup requires five successful suites bound to the exact deployed source commit. Current and future results must be recorded by application SHA, including failures.

## Operator actions after scoped authorization

1. Use an already-authorized database-owner connection inside its existing private environment. Never export a production/admin credential or open a public database allowlist.
2. Reuse the isolated provisioner for one unused synthetic scope and expiring runtime principal. Its operator preflight, immutable fences and independent restricted-login validation remain authoritative.
3. Deliver only the new test-scoped connection through the approved secret mechanism to the existing test service. Keep all production connections and Runtime/MCP releases unchanged. Configure the profile/path, deploy the exact reviewed test commit and independently verify the admitted principal.
4. Create a test goal, replace the actual hosted container, and verify goal, execution, reservation and audit continuity before live reasoning admission. Do not infer this from the build fixture.
5. Use the reviewed signing, trial, operator-launch and release mechanisms for live reasoning. This storage candidate does not enable them.

## Transition and rollback

Snapshot the existing test configuration and image before changing its storage profile. Preserve the synthetic schema and evidence if startup fails; never destroy it as a recovery shortcut. Restore the previous test image/config only, and label the returned disposable profile explicitly. No production cutover, old-goal replay, role renewal or budget reset is part of this candidate.

Operational targets, private connection values and owner trust material are deliberately excluded from this public document.
