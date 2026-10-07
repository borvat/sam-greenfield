# Phase 21 — Production Deployment Package

## Objective
Make SAM deployable on a real Linux Docker host with PostgreSQL 15, TLS ingress, deterministic migrations, health-gated startup and a post-deployment Golden Chain acceptance command.

## Critical hardening
The previous db:migrate command only printed migration hashes; it did not apply SQL. Phase 21 replaces it with a real migration runner that:
- requires DATABASE_URL,
- serializes with a PostgreSQL advisory lock,
- records filename + SHA256 in sam_schema_migrations,
- refuses hash drift for previously applied files,
- applies each pending migration transactionally,
- verifies the recorded migration count.

## Deployment package
- deploy/production/docker-compose.live.yml
- deploy/production/Caddyfile
- deploy/production/env.production.example
- deploy/production/deploy.sh

The live compose exposes only Caddy on ports 80/443. Runtime, MCP and Command Center remain on the internal Docker network.

## Live acceptance
After deployment, run the Phase 20 live Golden Chain gate against the real HTTPS endpoints. Production is not LIVE_PROVEN until that gate passes with real services and real configured credentials.
