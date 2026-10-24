# Existing Render Shell owner handoff

Preparation artifact only. The owner has approved the existing-service release/setup and three read-only goals capped at USD 0.30 total. This procedure does not create another principal, signer, service, or evaluation system. The parent remains the single production executor. Do not run until it has paused worker/intake, reconciled pending operations and recorded rollback release/configuration.

The **owner**, not an agent, enters their existing database administrator **internal** connection URL in the runtime Render Shell. Never send it in chat, an automation argument, terminal command line, environment variable, or file. No automatic prompt is launched by this document. Do not use the restricted runtime URL as administrator. No external connection/network change is involved.

## Stage the reviewed files without changing the live checkout

Run these nonsecret commands from the existing runtime repository Shell, after operator coordination. They require available git, Python 3, Node 22 and npm and existing authorized Git access. They do not switch the live checkout or deploy. The temporary directory must be writable.

```sh
set -eu
sam_source=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0
sam_bootstrap=213c7c65f7bc6d77d92ce7ae8973dc7917c1ac40
git fetch --no-tags origin "$sam_source" "$sam_bootstrap"
sam_stage=$(mktemp -d /tmp/sam-owner-setup.XXXXXX)
git worktree add --detach "$sam_stage/source" "$sam_source"
mkdir -p "$sam_stage/source/docs/operator/bootstrap"
for sam_file in owner-setup.py owner-setup.ts; do
  git show "$sam_bootstrap:docs/operator/bootstrap/$sam_file" > "$sam_stage/source/docs/operator/bootstrap/$sam_file"
done
cd "$sam_stage/source"
npm ci --omit=dev
python3 docs/operator/bootstrap/owner-setup.py
```

The final command first checks the existing `DATABASE_URL` without printing it, requires `sam_runtime_app`, the exact internal host `dpg-db37k3rbc2fs73csjung-a`, database `sam_trial_postgres`, and existing fixed-tenant/RLS admission. It prints only role/database/schema/tenant IDs and source pin. It then requires `APPLY` and opens a hidden prompt for the owner. Failure to disable terminal echo aborts; no fallback to visible input. Owner connection must target the same internal host/database, without query-string connection overrides. If the existing connection uses a different legitimate host spelling or requires options, stop and review that exact nonsecret compatibility issue; do not change database/network policy or guess a new route.

Administrator session must already own the database and affected execution table (or inherit those rights) and have schema CREATE. This conservative bootstrap may reject an otherwise capable delegated administrator; it does not grant extra rights to get around that check. It sets only the verified tenant context, checks the existing entity, obtains a setup advisory lock, rejects pending queue work and existing/partial specialist setup, and validates existing verification definitions/provider metadata. **Stopping services remains mandatory**: the database check alone cannot prevent new work from another running process.

The script reuses `applySpecialistProfile` for only 00106/00107, then `provisionSpecialistAccess` for the existing `sam_runtime_app`, three verification registrations and the approved positive DeepSeek price metadata. Existing mismatched contracts stop setup; no historical contract is overwritten. It does not install evaluation tables, create accounts, change base-role rights, deploy, configure services or invoke a model.

## Result and rollback boundary

`ordinary-setup-before.json` is created exclusively with mode 0600 in the staging directory **before mutations**. It contains nonsecret tenant/provider/registration rollback metadata, no connection URL/password. Preserve it in the operator's controlled record along with terminal phase markers. Do not include Shell environment dumps.

Expected phase markers: `MIGRATIONS`, `PROFILE_COMMITTED`, `COMMIT_PENDING`, `SETUP_COMMITTED`, then `RUNTIME_PROFILE_READBACK_PASS`. The migration function commits independently. A later failure can leave the profile installed but grants/registrations/prices absent; do not rerun blindly. Failure at `COMMIT_PENDING` is an uncertain transaction outcome and requires readback. Failure after `SETUP_COMMITTED` requires runtime admission diagnosis, not an automatic downgrade. This script intentionally refuses preexisting/partial setup.

On stop, keep intake/worker paused and report the sanitized phase/code to the parent. Retain receipts; do not drop schema, erase historical goals, reset allowances or restore the old worker over unresolved work. After successful setup the parent performs the configuration/deployment and exclusive three-goal procedure in `../ordinary-three-goals.md`. No live test is started by this script.

## Unavoidable owner step and limitations

Only the owner can supply the existing administrator connection directly in their trusted Shell. The current tools do not have that session; browser login does not imply SQL administrator authority. If the owner does not have access to the existing administrator connection, this path cannot run. No new account or credential is proposed.

Hidden terminal input prevents echo/history and the wrapper uses an anonymous stdin pipe, not argv/environment/files. It does not promise protection against privileged host/process inspection, memory retention, browser recording, or Render audit mechanisms. The owner must use their own trusted session; an agent must not inspect, type, capture or forward the secret. No production credential has been requested or processed during preparation.

Focused evidence is in `evidence/README.md`; its PostgreSQL and PTY results are isolated, not hosted acceptance. The reviewed application and its original 60-stage evidence are unchanged.
