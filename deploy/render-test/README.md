# Isolated Render test environment

Owner requested separate Render test environments on 2026-10-24. This branch is independent; no main merge or production cutover.

Service: `sam-isolated-test` (Frankfurt, free). URL: https://sam-isolated-test.onrender.com

Dockerfile: `deploy/render-test/Dockerfile`. Start: `node deploy/render-test/start.cjs`.

A fresh local PostgreSQL 15 cluster is initialized for each startup with the repository's canonical migrations and TEST-SAM organization/entity. Existing runtime, recovery, supervisor and command-center code are reused in maintenance-only development mode. Planning, capability execution, external adapters and live evaluation remain disabled. This is infrastructure testing, not proof of live model reasoning.

A single public HTTP proxy serves the command center and the development-only MCP endpoint `/mcp`. The worker (8080), command center (5000), MCP (3001) and PostgreSQL are local to the sandbox. `/readyz` checks all three HTTP services. MCP exposes only the existing sanitized development service-status/test-results tools; no action dispatcher is configured. API requests require the separate Render-managed `SAM_TEST_BEARER_TOKEN`; the root page and `/readyz` are available without it. No production credentials or database are loaded. Test records are disposable and reset on startup/redeploy; no durable-data guarantee.

Checks: verify live deployment; GET `/readyz`; authenticated GET `/api/overview`; unauthenticated API returns 401. Production services are unchanged.

## Read-only candidate verification

The candidate uses the existing Command Center's read-only natural-language intake and evidence-aware progress. Its maintenance worker deliberately leaves goals unplanned. This is not a live-agent release or paid-model activation.

During image build, four bounded engineering suites run sequentially against a separate local `sam_core_test` database: core reliability, tenant workload, shared-goal fixture composition, and evaluation budgets. They use the canonical local-database harness; no production connection or provider credential enters the child environment. The database/cluster is disposable, not a durable deployment.

These suites run in the Docker build environment, before serving processes exist, rather than consuming the small web container's CPU and memory. A failure stops the build and preserves the preceding deployed version. Only the nonsecret Render source commit is referenced as a build argument. The resulting private report is baked into the image and startup refuses a source-commit mismatch or a failed/missing suite. Disposable build database data is removed before the layer completes.

At runtime, the application worker, MCP server and Command Center start against a separate fresh synthetic database, then the authenticated HTTP/API probe runs. Its outcome is combined with the pinned build report; build tests never count as live reasoning or as API acceptance. Data still resets on container restart. This arrangement does not prove durable task state across a full Render container replacement.

`GET /api/test-verification` requires the existing sandbox bearer token and returns sanitized per-suite status, source commit, timings, and the explicit `liveReasoningValidated:false` marker. Full logs remain private on that container. The shared-path suite contains actual PostgreSQL/runtime process restart, specialist evidence and signed fixture capture; its scripted model decisions do not establish live tool selection. A suite failure is retained and does not silently become a successful readiness result.

`/test/viewport` embeds the actual application at 390px for CSS layout review. It does not simulate a physical phone or replace a separate review of database/API fidelity. No fixture response interceptor or private token is embedded in the page.
