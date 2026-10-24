# Hosted sandbox smoke — 2026-10-24

Tested application source: `a7e73234acf75e0d4833770cb4f5b8b6ee6aee0d`.
Render service `sam-isolated-test`, deploy `dep-dbe2cp0m7kps73c3qcbg`: Live.

Observed externally over HTTPS:

- Root dashboard returns 200.
- Combined `/readyz` returns 200 with three service statuses `[200,200,200]`.
- Authenticated `/api/overview` returns 200; unauthenticated returns 401.
- MCP initialize returns 200, protocol `2025-03-26`.
- Initialized notification returns 202.
- MCP tools/list returns the two existing sanitized development tools only.
- MCP sam_development_service_status returns commandCenter/worker/mcp READY.
- MCP request without bearer returns 401.

PostgreSQL initialization applied all 12 canonical migrations. Runtime logs show maintenance-only ticks with planning/capability execution/external adapters disabled. No live model, commercial integration, autonomous goal completion, load, endurance or production acceptance is claimed. No token or response containing credentials is retained here.
