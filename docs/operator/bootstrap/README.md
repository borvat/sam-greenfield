# Existing Render Shell owner handoff

Preparation artifact only. The owner has approved the existing-service release/setup and three read-only goals capped at USD 0.30 total. This procedure does not create another principal, signer, service, or evaluation system. The parent remains the single production executor. Do not run until it has paused worker/intake, reconciled pending operations and recorded rollback release/configuration.

The **owner**, not an agent, enters their existing database administrator **internal** connection URL in the runtime Render Shell. Never send it in chat, an automation argument, terminal command line, environment variable, or file. No automatic prompt is launched by this document. Do not use the restricted runtime URL as administrator. No external connection/network change is involved.

## Keep the executor Shell available during the pause

**Do not suspend runtime or use SIGTERM as a reversible pause.** SIGTERM exits the worker; Render suspension also removes the Shell required below. The following is an operator configuration change on the same existing service, not an application patch. Wait for final review and the owner's presence before executing it.

1. Record the exact current start command, build command, health-check path, auto-deploy setting, environment changes and live deploy ID for runtime `srv-db37vbvlk1mc739o0b70` and MCP `srv-db37vbvlk1mc739o0b7g`. Verified normal commands are `sh deploy/render/start.sh runtime` and `sh deploy/render/start.sh mcp`; compare current readback before acting. Preserve existing secrets in place. Do not alter the command-center, connector services, plans, or database networking.
2. Suspend **MCP only**, to close authenticated goal intake; verify suspension and no ongoing submission. Its Free-plan Shell is not needed. Parent coordinates all submissions and confirms no alternate writer is active.
3. In runtime Settings → Build & Deploy → Start Command, save the **exact one-line command in [maintenance-start-command.txt](maintenance-start-command.txt)**. Retain build command, health path `/readyz`, environment and automatic-deploy setting. Never replace it with `npm start` or an application import. This command uses only Node's HTTP module and PORT, clears Node preload settings, serves explicit maintenance readiness, and rejects application routes. Keep runtime **not suspended**.
4. Apply the configuration using a Dashboard deploy of the recorded current application commit (currently `8ebbe5ab5caf53a870cd252441e6199a08b3b5af`). If saving the start command already initiated that deploy, observe its outcome instead of triggering a duplicate. Do not use a restart that preserves stale configuration. Confirm the resulting deploy's effective command is the health-only command, its log contains `SAM_OPERATOR_MAINTENANCE_READY worker=false intake=false`, and `/readyz` returns the matching JSON. A 200 response alone is insufficient.
5. Render's rolling replacement may keep the old instance running for 60 seconds after traffic switches, then send SIGTERM and allow the configured shutdown delay before SIGKILL. The old `8ebbe5ab` release uses the exec-node signal path. **Do not run setup merely because the maintenance deployment is live.** Verify the old instance has terminated using deployment/instance events and shutdown logs; inspect the replacement Shell process names/arguments without environment output to confirm no `apps/runtime/src/main.ts` worker or manually launched SAM process remains. If old-instance termination cannot be established, stop here. Read the existing runtime-scoped queue to confirm zero `QUEUED`, `LEASED`, `EXECUTING`, `HANDBACK` work and no remaining callback/lease requiring reconciliation. Do not erase rows or equate expired leases with completed operations. The bootstrap repeats a pending-work check, but that is not a substitute for stopping all writers.
6. Open the **new maintenance instance's runtime Shell**. It retains the existing restricted DATABASE_URL and has no SAM worker running. Follow the staging/hidden-owner-input procedure below. Do not restore the normal start command while setup or rollback reconciliation is pending.

After successful setup: keep the maintenance command while configuring and staging frozen `bc95f24`; only restore `sh deploy/render/start.sh runtime` as the parent deliberately opens the bounded run. Restore MCP's normal pinned configuration and resume it only for the controlled submissions. Any intermediate maintenance deployment remains a pause, not proof of SAM readiness. Record effective commands and instance transitions each time. If setup fails, leave runtime health-only and MCP suspended until reconciliation.

For rollback, reconcile the new goal families on the reviewed candidate before restarting the old worker. Restore the saved runtime start command **and** saved release/configuration explicitly; a code rollback alone must not be assumed to restore the command. Restore MCP last after verifying old-runtime health and tenant binding. Preserve ledger/schema evidence. Do not restore normal intake over unresolved work.

Render documents [specific-commit deployment and rolling replacement](https://render.com/docs/deploys) and the [web-service start command/port contract](https://render.com/docs/web-services). Hosted instance drain, Shell availability and effective configuration still require operator observation; the local health-only test does not prove those hosted outcomes.

## Stage the reviewed files without changing the live checkout

Run these nonsecret commands from the existing runtime repository Shell, after operator coordination. They require available git, Python 3, Node 22 and npm and existing authorized Git access. They do not switch the live checkout or deploy. The temporary directory must be writable.

```sh
set -eu
sam_source=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0
sam_bootstrap=a798f9a671c3a2a580968de1eb88b2ad8094edc0
git fetch --no-tags origin "$sam_source" "$sam_bootstrap"
sam_stage=$(mktemp -d /tmp/sam-owner-setup.XXXXXX)
git worktree add --detach "$sam_stage/source" "$sam_source"
mkdir -p "$sam_stage/source/docs/operator/bootstrap"
for sam_file in owner-setup.py owner-setup.ts readback.sql; do
  git show "$sam_bootstrap:docs/operator/bootstrap/$sam_file" > "$sam_stage/source/docs/operator/bootstrap/$sam_file"
done
cd "$sam_stage/source"
npm ci --omit=dev
python3 docs/operator/bootstrap/owner-setup.py
```

The final command first checks the existing `DATABASE_URL` without printing it, requires `sam_runtime_app`, the exact internal host `dpg-db37k3rbc2fs73csjung-a`, database `sam_trial_postgres`, and existing fixed-tenant/RLS admission. It prints only role/database/schema/tenant IDs and source pin. It then requires `APPLY` and opens a hidden prompt for the owner. Failure to disable terminal echo aborts; no fallback to visible input. Owner connection must target the same internal host/database, without query-string connection overrides. If the existing connection uses a different legitimate host spelling or requires options, stop and review that exact nonsecret compatibility issue; do not change database/network policy or guess a new route.

Administrator session must already own the database and affected execution table (or inherit those rights) and have schema CREATE. This conservative bootstrap may reject an otherwise capable delegated administrator; it does not grant extra rights to get around that check. It sets only the verified tenant context, checks the existing entity, obtains a setup advisory lock, rejects pending queue work and existing/partial specialist setup, and validates existing verification definitions/provider metadata. **Stopping SAM work while retaining the maintenance executor remains mandatory**: the database check alone cannot prevent new work from another running process.

The script reuses `applySpecialistProfile` for only 00106/00107, then `provisionSpecialistAccess` for the existing `sam_runtime_app`, three verification registrations and the approved positive DeepSeek price metadata. Existing mismatched contracts stop setup; no historical contract is overwritten. It does not install evaluation tables, create accounts, change base-role rights, deploy, configure services or invoke a model.

## Result and rollback boundary

`ordinary-setup-before.json` is created exclusively with mode 0600 in the staging directory **before mutations**. It contains nonsecret tenant/provider/registration rollback metadata, no connection URL/password. Preserve it in the operator's controlled record along with terminal phase markers. Do not include Shell environment dumps.

Expected phase markers: `MIGRATIONS`, `PROFILE_COMMITTED`, `COMMIT_PENDING`, `SETUP_COMMITTED`, then `RUNTIME_PROFILE_READBACK_PASS`. The migration function commits independently. A later failure can leave the profile installed but grants/registrations/prices absent; do not rerun blindly. A lost acknowledgement in **`MIGRATIONS` is also uncertain**, because `applySpecialistProfile` performs its own COMMIT before returning; absence of `PROFILE_COMMITTED` does not prove rollback. A lost acknowledgement at `COMMIT_PENDING` likewise requires fresh readback. A subsequent ROLLBACK or closed connection does not prove that either COMMIT failed. Failure after `SETUP_COMMITTED` requires runtime admission diagnosis, not an automatic downgrade. This script intentionally refuses preexisting/partial setup.

On stop, keep intake/worker paused and report the sanitized phase/code to the parent. Retain receipts; do not drop schema, erase historical goals, reset allowances or restore the old worker over unresolved work. After successful setup the parent performs the configuration/deployment and exclusive three-goal procedure in `../ordinary-three-goals.md`. No live test is started by this script.

## Mandatory independent readback before activation

`RUNTIME_PROFILE_READBACK_PASS` verifies receipts and runtime tenant/RLS policy admission only. It is **not** proof of every grant, verification registration, or provider row. While runtime remains health-only and MCP intake remains closed, run [readback.sql](readback.sql) through the existing restricted runtime connection. This is read-only. Require:

- The same runtime role/database/schema/tenant as recorded before setup.
- Exactly the two pinned receipt names and SHA-256 values from `sha256sum packages/db/specialist-migrations/*.sql` in the frozen checkout.
- Exactly three registration rows, each `expected_ok=true`, with no missing registration.
- Exactly one `deepseek` row, `expected_ok=true`. Compare models/privacy/health with `ordinary-setup-before.json`; they must remain unchanged. Capabilities must equal the original list with only `specialist_reasoning` appended if absent, and runtime environment capabilities/prices must match this row.
- All five table-grant rows and every column-grant row `expected_ok=true`. No extra UPDATE columns or table-level UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES privileges are permitted. Re-run the existing read-only runtime/profile admission after configuration changes.

Missing rows, SQL errors, mismatches or uncertain commits block activation. Preserve readback and phase receipts; do not repeat the write bootstrap to discover what happened. Reconcile actual migration receipts, tables/policies, grants, registrations and pricing first, including if interruption happened during `MIGRATIONS`. The old phase message mentioning only `COMMIT_PENDING` is incomplete; this procedure governs recovery for both commit boundaries.

Use the restricted connection already in the maintenance Shell; never substitute the owner URL for this readback:

```sh
node --input-type=module <<'JS'
import pg from 'pg';
import {readFileSync} from 'node:fs';
if(!process.env.DATABASE_URL)throw Error('RUNTIME_CONNECTION_REQUIRED');
const c=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try {
 await c.connect();
 const who=(await c.query('SELECT current_user role')).rows[0];
 if(who.role!=='sam_runtime_app')throw Error('RESTRICTED_RUNTIME_REQUIRED');
 const results=await c.query(readFileSync('docs/operator/bootstrap/readback.sql','utf8'));
 for(const result of (Array.isArray(results)?results:[results]))if(result.rows.length)console.log(JSON.stringify(result.rows));
} catch {console.error('READBACK_FAILED: keep services in maintenance; do not activate');process.exitCode=1;}
finally {await c.end().catch(()=>{});}
JS
```

## Unavoidable owner step and limitations

Only the owner can supply the existing administrator connection directly in their trusted Shell. The current tools do not have that session; browser login does not imply SQL administrator authority. If the owner does not have access to the existing administrator connection, this path cannot run. No new account or credential is proposed.

Hidden terminal input prevents echo/history and the wrapper uses an anonymous stdin pipe, not argv/environment/files. It does not promise protection against privileged host/process inspection, memory retention, browser recording, or Render audit mechanisms. The owner must use their own trusted session; an agent must not inspect, type, capture or forward the secret. No production credential has been requested or processed during preparation.

Focused evidence is in `evidence/README.md`; its PostgreSQL and PTY results are isolated, not hosted acceptance. The reviewed application and its original 60-stage evidence are unchanged.
