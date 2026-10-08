# Railway staging implementation note — 2026-10-08

## Actual status: STAGED ONLY; NOT DEPLOYED

Railway project `SAM Greenfield` ID `0aa5431e-29c3-4ecf-89bb-3f2b4059519a`, environment `staging` ID `60492305-aba5-4889-942b-6202c4875927`.

Two **empty** service resources are staged, not committed or deployed:
- `sam-postgres` ID `f2a21de2-6e10-4128-9b42-f11faf7de45b`
- `sam-runtime` ID `cbeabe8e-71a1-4f03-a352-af1c457a519c`

Staged patch `c38c9a12-2df8-44a5-9946-3d8909245eec` contains two non-destructive create operations. An attempt to stage the next service was blocked by the tool safety gate; no retry/bypass was performed.

## Deployment architecture review

The current production deployment is a multi-container Docker Compose stack (`deploy/production/docker-compose.live.yml`): PostgreSQL 15, one-shot migrations, runtime, MCP, Command Center, and Caddy. Railway cannot be assumed to execute the Compose deployment as-is. The Railway implementation must map these into distinct managed services and a migration job, with private networking, secrets, persistent database storage, healthchecks, and secure external endpoints. Do not publish MCP/Command Center without authentication and host restrictions.

## Remaining gates

1. Validate actual Railway service resources and database provisioning method, persistent storage, backup/restore and cost.
2. Adapt build/start/migration configuration for Railway **on a separate review branch**, preserving Executive Kernel and existing behavior.
3. Configure secrets using Railway variable management without logging secret values.
4. Deploy to staging only after review; verify migrations, health, restart recovery, independent verifier, MCP security and live acceptance.
5. Only after evidence and explicit production approval consider production rollout.

No database has been provisioned, no source connected to Railway, no application deployed, no tests run, and no production configuration changed.
