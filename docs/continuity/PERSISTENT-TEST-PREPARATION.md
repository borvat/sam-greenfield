# Provisioned test-storage preparation

This candidate adds a read-only bootstrap for an operator-provisioned synthetic PostgreSQL binding. It does not create a database, role, scope, trust root, signature, trial, model call or live permit at startup.

## Runtime contract

Default `SAM_TEST_STORAGE_PROFILE=disposable` retains the existing infrastructure sandbox. Opt-in `provisioned-postgres` requires `SAM_TEST_RESTRICTED_CONFIG_PATH` pointing to the private connection file produced by `scripts/evaluation/provision-isolated.ts` on its authorized host. The file is not a deployment artifact and must not be committed or exported between services. File identity, bounded size, owner-only permissions, role name, tenant IDs and exact connection context are checked.

The provisioned role must be non-owner and non-administrative, NOINHERIT, fixed to one synthetic tenant, unable to create schemas and unable to read/write public tables. Existing integration, specialist, evaluation and shared-goal profiles are verified in a read-only transaction. Five minutes of role lifetime must remain. Failure refuses startup; it never falls back to disposable data, renews a credential, runs migrations or grants rights.

The admitted connection replaces only test storage. The maintenance-only worker, disabled external adapters and disabled live-evaluation interlock remain unchanged. Persistent storage is a prerequisite, not live reasoning activation. Runtime bootstrap and the operator's privileged one-time setup remain distinct.

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
