# Isolated Render test environment

Owner requested separate Render test environments on 2026-10-24. This branch is independent; no main merge or production cutover.

Service: `sam-isolated-test` (Frankfurt, free). URL: https://sam-isolated-test.onrender.com

Dockerfile: `deploy/render-test/Dockerfile`. Start: `node deploy/render-test/start.cjs`.

A fresh local PostgreSQL 15 cluster is initialized for each startup with the repository's canonical migrations and TEST-SAM organization/entity. Existing runtime, recovery, supervisor and command-center code are reused in maintenance-only development mode. Planning, capability execution, external adapters and live evaluation remain disabled. This is infrastructure testing, not proof of live model reasoning.

Only the command center is public. API requests require the separate Render-managed `SAM_TEST_BEARER_TOKEN`; the root page and `/readyz` are available without it. No production credentials or database are loaded. Test records are disposable and reset on startup/redeploy; no durable-data guarantee.

Checks: verify live deployment; GET `/readyz`; authenticated GET `/api/overview`; unauthenticated API returns 401. Production services are unchanged.
