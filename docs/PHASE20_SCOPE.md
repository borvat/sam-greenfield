# Phase 20 — Live Golden Chain Acceptance Gate

## Objective
Add a production acceptance gate that can prove SAM end-to-end after deployment, using the real runtime and Command Center rather than database shortcuts.

## Live gate
The acceptance runner:
1. Requires runtime /readyz = 200.
2. Requires Command Center /readyz = 200.
3. Optionally requires MCP /livez = 200.
4. Creates one GREEN canary goal through the owner Command Center API.
5. Polls the legal-entity-scoped Golden Chain timeline.
6. Passes only if the goal reaches COMPLETED with persisted plan, work, execution and at least one VERIFIED independent verification.
7. Fails immediately on FAILED, CANCELLED or WAITING_OWNER.
8. Times out deterministically if the chain stalls.

## Safety
- Canary authority is GREEN only.
- No approval is auto-created or auto-granted.
- No RED/YELLOW side effect is allowed by the canary.
- The runner cannot bypass the Command Center, kernel, planner, specialist, tool gateway or verifier.
- The live gate is not claimed PASS until run against an actual deployed environment.

## Environment
- SAM_LIVE_RUNTIME_URL
- SAM_LIVE_COMMAND_CENTER_URL
- SAM_LIVE_COMMAND_CENTER_TOKEN
- SAM_LIVE_MCP_URL (optional)
- SAM_LIVE_CANARY_OBJECTIVE
- SAM_LIVE_ACCEPTANCE_TIMEOUT_MS (default 120000)
- SAM_LIVE_ACCEPTANCE_POLL_MS (default 1000)
