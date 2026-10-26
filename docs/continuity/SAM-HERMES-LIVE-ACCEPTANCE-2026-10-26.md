# SAM × Hermes live acceptance — 2026-10-26

Stage: PREFLIGHT COMPLETE; NEW 60-MINUTE WINDOW NOT STARTED.

Application deployment remains 47ec9df. Repository evidence checkpoint before this file: c7b4967. No deployment or runtime patch was repeated.

Read-only direct internal PostgreSQL inspection confirms the existing limited role is expired, with superuser/create-db/create-role/replication/bypass-RLS/inherit flags all false. There are no sessions for that role. The current queue has one EXECUTED and two FAILED rows, zero live leases and no pending work.

A preserved arithmetic probe is already COMPLETED. Its saved receipt has output 42, completed status, served provider nous, served model poolside/laguna-s-2.1:free, model_lock confirmed and route_source session_model_lock. The two earlier failed receipts retain empty served identities and were correctly rejected. Further independent-verification/report inspection and restart continuity are pending; this discovery alone is not new final acceptance.

Hermes direct configuration readback shows an empty API tool profile, no MCP servers, null fallback model, no fallback providers, pinned free Nous model and concurrency one. Its authenticated toolsets API reports no enabled tools. Native Runs ledger shows three completed runs, no worker executions and zero active turn leases. No competing deploy appears in current deployment listings.

The existing startup script and model-lock patch were inspected on disk by hash; the startup invokes the saved patch then the native entrypoint. No disk policy file was changed. SAM's Shell is unavailable while startup fails. A temporary PostgreSQL client was installed under a temporary directory on the healthy test host for operator inspection only; the owner URL was passed through hidden input, never printed or persisted, and was not used to run the application. Initial diagnostics encountered missing optional YAML imports and an incorrect clipboard transfer; those failed locally before any database mutation. The copy path was corrected and the database read succeeded.

Next: finish all possible preparation of existing private probe-window timestamps; renew the existing role deadline once for at most 60 minutes without changing password/grants/networking; verify grants unchanged and effective policy; submit one new bounded arithmetic goal through SAM; independently inspect execution/verification/receipt; restart SAM only after no active work and compare identifiers/content afterward.

Do not: automatically renew; reset existing failed goals; repeat the already-deployed model-lock patch; use owner credentials for application execution; open coding tools; change production, scheduling, resource plans or database networking. If interrupted, inspect the current role deadline and new evidence before any renewal or submission. This preflight checkpoint does not authorize a second window.

Additional paid resources, paid model calls and deployments introduced in this stage: zero. Final live cycle and post-restart persistence: PENDING.
