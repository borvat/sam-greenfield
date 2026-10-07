# SAM Production Runbook

## Startup
1. Load secrets from the deployment secret store; never commit them.
2. Set NODE_ENV=production, DATABASE_URL, SAM_WORKER_ID, and SAM_PRODUCTION_BUNDLE_MODULE.
   Use the repository's canonical composition module at /app/apps/runtime/src/productionCompositionModule.ts.
   The production bundle must contain only reviewed real capability/tool/model/verifier adapters; test fakes are forbidden.
3. Apply migrations before starting the runtime.
4. Start the runtime process.
5. Do not route traffic/work until /readyz returns 200.
6. Startup recovery must finish before readiness becomes true.

## Health
- /livez: process is alive.
- /readyz: database reachable, startup recovery completed, not shutting down.
- Operational health and incidents remain available through Phase 6 supervisor data.

## Deployment
- Deploy immutable build artifact.
- Apply database migrations once.
- Start new runtime.
- Wait for /readyz=200.
- Shift work/traffic only after readiness succeeds.
- Keep previous artifact available for rollback.

## Rollback
- Stop assigning new work to the new runtime.
- Gracefully shut it down.
- Roll back application artifact only.
- Do not reverse an already-applied migration unless a separately reviewed reverse migration exists.
- Start previous artifact and wait for /readyz=200.

## Backup
- Use provider-managed PostgreSQL backups plus scheduled logical backups.
- Test restore into an isolated database before relying on a backup.
- Never run restore against production as a validation test.

Example logical backup:
pg_dump --format=custom --no-owner --file=sam.backup "$DATABASE_URL"

Example isolated restore:
createdb sam_restore_test
pg_restore --no-owner --dbname=sam_restore_test sam.backup

## Shutdown
- Flip readiness false first.
- Stop taking new work.
- Allow in-flight work to finish within the grace window.
- Close HTTP listener.
- Close database pool.
- Rely on lease expiry + Phase 1 restart recovery if the process is terminated before clean completion.


## ChatGPT MCP bridge
SAM exposes its ChatGPT tool surface from a separate MCP process on port 8081.

Required production values:
- SAM_MCP_BEARER_TOKEN
- SAM_MCP_ALLOWED_HOSTS

Optional:
- SAM_MCP_ALLOWED_ORIGINS
- SAM_MCP_ACTOR

Operational checks:
1. Confirm GET /livez returns 200.
2. Connect ChatGPT to the /mcp endpoint using the approved secure path.
3. Verify read tools are listed.
4. sam_execute is advertised only when a validated production dispatcher is present.
5. Never place the bearer token in source control, logs, or tool output.

The MCP process and executive worker are deliberately separate. Restarting the MCP bridge must not interrupt the executive worker.


## Real model providers
The production bundle may call `withStandardModelProvidersFromEnv(...)` to register the five supported real provider adapters.

A provider is enabled only when its API key and model name are set. Qwen also requires an explicit compatible-mode base URL.

Provider registry metadata is synchronized into `model_providers` at production composition startup. Default privacy is PUBLIC + INTERNAL only. CONFIDENTIAL or RESTRICTED must be opted in explicitly per provider after policy review.

Never place provider keys in source control, the production bundle file, logs, audit payloads, or tool responses.
