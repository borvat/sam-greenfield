# Phase 21 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL 15.17

## Scope completed
- Real PostgreSQL migration runner
- Advisory-lock serialized migrations
- Migration filename + SHA256 ledger
- Hash-drift refusal
- Idempotent re-run support
- Self-host Docker production stack
- Internal-only PostgreSQL/runtime/MCP/Command Center networking
- Caddy TLS ingress on 80/443 only
- Health-gated startup order
- Production environment template
- Health-gated deploy script
- Production runbook update
- Existing Phase 0–20 invariants remain green

## Migration evidence
On a fresh disposable PostgreSQL 15.17 database:
- First run applied 00001..00010 in order.
- sam_schema_migrations recorded 10 rows with 10 distinct hashes.
- Second run skipped all 10 and passed.
- Tampering the recorded hash for 00005 caused a hard failure before continuing.
- Missing DATABASE_URL fails closed.

## Full acceptance
A separate fresh PostgreSQL 15.17 database was used for the full suite.
All tests Phase 0 through Phase 21 PASS.
Phase 21 result: PHASE21_PRODUCTION_DEPLOYMENT_PACKAGE PASS.

## Deployment package evidence
- docker-compose.live.yml validates.
- Only Caddy publishes ports 80/443.
- postgres/migrate expose no host ports.
- runtime 8080, MCP 8081 and Command Center 8082 stay private to sam-internal.
- migrate waits for PostgreSQL health.
- runtime/MCP/Command Center wait for successful migrate completion.
- Caddy waits for Command Center and MCP health.
- Required production values fail closed.
- Caddyfile validates.
- deploy.sh shell syntax validates.

## Safety
- Real secrets are never committed.
- env.production.example contains placeholders only.
- No public PostgreSQL port.
- No public direct runtime/MCP/Command Center ports.
- Production is not LIVE_PROVEN until deploy.sh runs on a real Docker host and Phase 20 live acceptance returns LIVE_GOLDEN_CHAIN PASS.

## External limitation
The verifier environment has no usable Docker daemon, so actual container build/start, TLS issuance and deploy.sh execution are still pending on the real production host.
