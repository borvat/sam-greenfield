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

## PostgreSQL acceptance completed — 2026-10-26T22:15Z

**LOCAL_VERIFIED in an isolated remote sandbox:** source `a644ba6158c1fdd7e49c7332ff74782726c79ff2`; all 15 acceptance cases PASS, fail 0, skipped 0, cancelled 0, test and remote exit 0. This is real PostgreSQL + real Vault + synthetic provider HTTP, not live SAM/Hermes/provider activation.

Environment: Linux 4.19.0-gvisor x86_64, Node 22.23.4, PostgreSQL 15.19 (Debian 15.19-0+deb12u1), pgvector 0.8.1 from upstream commit 778dacf20c07caf904557a88705142631818d8cb, Vault 1.21.0. SQL settings actually queried: fsync=on, synchronous_commit=on, full_page_writes=on. UID/GID 65534, supplementary groups empty.

Original run at 55eef92: 0 PASS / 15 hook failures / 0 skipped / exit 1; actual schema needs real vector extension. Harness now creates the installed real extension and cleans up its pool on failed setup; shared schema untouched.
After bootstrap at 69eb9ca: 12 PASS / 3 failures / 0 skipped / exit 1. Actual server crashes exposed stale idle clients and unhandled checked-out client errors.
Intermediate connection fix dd80f4b: 14 PASS / 1 failure / 0 skipped / exit 1. Two stale idle sockets required draining the bounded initial idle slots, rather than a fixed two-checkout assumption.
Final ledger fix bounds pre-BEGIN admission attempts by initial idleCount+1, discards broken clients and observes checked-out error events. It never retries fn, COMMIT, a reservation mutation or a provider request. Strengthened existing assertions additionally restart PostgreSQL after service revocation and reconciled consumption, and reject malformed usage. No assertions removed or weakened; 15 case identities retained.

Evidence: docs/architecture/evidence/pr83-postgres/. Regression runs and cleanup still pending at this checkpoint. Reattach only to the existing sandbox; do not create another. No shared operation authorized.


## Final regression and cleanup — 2026-10-26T22:22Z

52/52 related regressions PASS at f27152e271e3945a89dbc2bbaa6f54ab7d05a97a, 0 fail/skipped/cancelled, exit 0. Original 40 retained, plus 3 prior units, 2 new driver-fault guards and 7 actual Gateway cases. Both root and actual Hermes-fixture typechecks exit 0.

The sandbox's 180-second idle timeout ended it while the already successful acceptance evidence was being committed. A subsequent remote regression exec returned NotFound before test launch; no second sandbox was created. Regression instead ran in root-only Work (Linux 6.18.55 / Node 24.22.1) with real Vault 1.21.0 and the current actual Gateway fixture. This environment difference is explicit and does not replace the saved real PostgreSQL run.

Cleanup independently verified: SDK poll exit 0; Modal dashboard shows 0 active containers and 0 active sandboxes. Displayed remaining credits USD 0.94 from USD 1.00, approximately USD 0.06 usage, not a final verified invoice. No payment method, budget setting, persistent disk, snapshot or second sandbox created.

Final observed Hermes head ffa0fd480dd59ec64ae10ec7c060b558cbbe6e69 has the tested Gateway blob unchanged. No explicit contract acceptance appears in the reviewed comments/reviews. Existing coordination request is refreshed with the final report; acceptance remains pending.

Current delivery: docs/architecture/AI-INFRASTRUCTURE-POSTGRES-DELIVERY-2026-10-26.md. Reproduction and complete logs are in docs/architecture/evidence/pr83-postgres/. No runtime code changed after a644ba6; f27152e adds the targeted driver regression file and documentation.

No running test process, database, Vault server, model request or resource operation remains. Shared pilot/schema/RLS/identity/health-query coordination is the remaining separate step; do not recreate resources or deploy automatically.

The local temporary Modal credential file was removed after cleanup verification. Its issued token retains the original one-hour expiry; revocation is not claimed. No production/provider/Vault key was accessed.
