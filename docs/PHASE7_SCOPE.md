# Phase 7 — Production Readiness + Deployment Hardening

## Objective
Make SAM safe to operate continuously in a production-like environment with deterministic startup validation, readiness/liveness checks, graceful shutdown, restart recovery, and explicit operational runbooks.

## Invariants
- Production mode fails closed when required environment variables are missing.
- Readiness is false until database connectivity and startup recovery complete.
- Liveness is process-local and does not depend on model providers.
- Startup recovery runs before the process becomes ready.
- Shutdown stops new work before draining and closing resources.
- No secret values are logged.
- Health endpoints expose status only, never credentials or sensitive payloads.
- Existing Phase 0–6 behavior remains green.

## Phase 7 foundation
1. Strict runtime configuration validation
2. Startup recovery gate
3. Liveness/readiness state machine
4. Graceful shutdown lifecycle
5. Production-safe health endpoint
6. Backup/restore and rollback runbooks
7. Real PostgreSQL acceptance proof
