# Focused bootstrap checks — isolated only

The application remains frozen at bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0. No hosted setup or secret was used.

- `python3 docs/operator/bootstrap/test_prompt.py`: four passing fake-child PTY checks (hidden delivery, cancellation, failed preflight, noninteractive refusal). Synthetic marker never appears in terminal output.
- TypeScript transpilation passed with the existing esbuild binary. An initial invocation mistakenly passed the binary to Node; the corrected direct invocation passed. This was a test command error, not a source change.
- PostgreSQL 15 fixture on an internal-only Docker network; no published ports. Applied base schema and created a synthetic restricted LOGIN only in this disposable database. Ran the actual setup script with real pg transport and original pinned profile functions. `apply.log`: both migrations, narrow access/registrations/prices committed; restricted LOGIN `assertSpecialistAccess` passed.
- `readback.log`: exactly 00106/00107 receipts, eight specialist policies, matching positive prices and three verification registrations.
- `repeat.log`: a second invocation refused existing setup before mutations.
- `postgres.log`: initial fixture directory was unwritable, so receipt creation failed **before migrations**. Retried the isolated container with writable /app as fixture root; no change to hosted privileges or code was required.

The fixture image lacks git: only its git command was substituted to return the independently verified frozen SHA and a clean profile diff. Thus database setup/readback were exercised, but this rehearsal does not independently validate the Git command's source-authentication result or hosted Render execution. The PTY used a fake child, not production authentication. No live provider calls. Application full acceptance was not repeated for these operator-only artifacts.

## Maintenance command correction

`python3 docs/operator/bootstrap/test_maintenance.py` passed locally: `/readyz` and `/livez` GET return explicit maintenance JSON; other routes/methods return 503; bogus inherited NODE_OPTIONS/NODE_PATH cannot preload application code; SIGTERM closes cleanly. The exact command imports only `node:http`. No Render mutation or hosted Shell test was performed. The corrected procedure keeps runtime unsuspended, suspends MCP intake, and requires old-instance termination plus queue/callback reconciliation before setup. This is prepared for review, not an executed pause.

## Explicit post-setup readback

`readback.sql` was executed using the actual isolated restricted LOGIN: three registrations, one provider, five table-grant rows and 38 column-grant rows passed. In the disposable database only, removing a registration, zeroing the input price, revoking a table INSERT and revoking one UPDATE column produced exactly four false results (`negative-readback.log`). These are diagnostic assertions for the operator to evaluate, not an automatic activation command. Both migration-COMMIT and provisioning-COMMIT acknowledgement loss require reconciliation; no new claim of simulated commit-response loss is made.
