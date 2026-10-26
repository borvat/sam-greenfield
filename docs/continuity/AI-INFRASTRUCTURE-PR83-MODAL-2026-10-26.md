# PR83 authorized isolated PostgreSQL run — checkpoint

Date: 2026-10-26. Status: ENVIRONMENT_PREFLIGHT_VERIFIED; acceptance run pending.

The owner explicitly approved one PR83-only Modal Sandbox, maximum USD 1 total and 3600-second lifetime. This approval is separate from earlier Hermes budgets and does not authorize shared migration/deployment/inference.

Source read and cloned: `55eef92f497a49c7f4bb01583c12a391c187ca1d`. Latest observed PR67 head for an isolated gateway fixture: `57a19d8fd42167d76b97298a4f0031c7b8153d0d`; no PR67 branch/runtime change.

## Observed environment

- Modal account/workspace: ceo-53153 / Starter. Authenticated dashboard showed USD 1 usage limit set by Modal, USD 0.00 usage and no payment method; no billing setting changed.
- Official Modal SDK 1.6.2 installed only in scratch. Current proxy required official optional proxy dependencies and the platform-provided trusted CA in its local CA bundle; certificate verification remains enabled, no routing restrictions bypassed.
- Temporary client authentication expires after one hour. No credential value is saved in this document or passed into the sandbox.
- Sandbox ID: `sb-01M5X3T4F5VD1Z6XXQ2776D440`, app metadata `pr83-postgres-acceptance-20261026`.
- Explicit hard CPU limit 1 physical core; hard memory limit 4096 MiB; lifetime 3600 seconds; idle timeout 180 seconds.
- No GPU, persistent volume, snapshot, tunnel, injected secret or OIDC token; database/Vault tests use synthetic credentials and loopback endpoints only.
- Sandbox UID map: `0 0 4294967295`. Switching normally to UID/GID 65534 succeeded; preflight exit 0. This is a genuine supported non-root execution environment.

## Current operation / resume

Preparation is running inside that sandbox: real PostgreSQL from the Debian package repository, official Node 22 archive and Vault 1.21.0 archive with published SHA-256 verification, locked npm dependencies, disposable actual Gateway source fixture. No acceptance result yet.

Do not create a second sandbox. Reattach only to the ID above; if absent/expired, report the state rather than assume another creation is authorized. Export logs and record exact versions/source/counts/exit codes. Fix only actual PR83 defects, retaining original assertions. Run related regressions and preserve the original 40 tests.

All 15 engine cases remain pending; 0 engine cases have passed at this checkpoint. Previous mocked-storage Gateway evidence is unchanged. Hermes acceptance remains unrecorded/proposed.

On completion or failure: export evidence, terminate this sandbox and verify termination. The provider-enforced lifetime is the cleanup backstop. No shared database/service/role/secret/default model is in scope.
