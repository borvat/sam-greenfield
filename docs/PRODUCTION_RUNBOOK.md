# SAM Production Runbook

## Startup
1. Load secrets from the deployment secret store; never commit them.
2. Set NODE_ENV=production, DATABASE_URL, and SAM_WORKER_ID.
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
