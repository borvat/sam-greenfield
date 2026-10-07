# Phase 20 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL 15.17

## Scope completed
- Live Golden Chain acceptance runner
- Runtime /readyz gate
- Command Center /readyz gate
- Optional MCP /livez gate
- GREEN-only acceptance canary creation through Command Center
- Timeline polling through the owner surface
- Completion evidence requirements:
  - persisted plan
  - persisted work
  - execution record
  - at least one VERIFIED independent verification
- WAITING_OWNER fail-fast for GREEN canary
- terminal failure fail-fast
- timeout fail-safe
- observed Golden Chain state evidence
- Command Center readiness tied to active configured legal entity
- production command-center healthcheck upgraded from /livez to /readyz
- Existing Phase 0–19 invariants remain green

## Acceptance evidence
Fresh PostgreSQL 15.17.
Migrations 00001..00010 applied from zero.
All 42 test files across Phase 0 through Phase 20 PASS in one shared database.
Phase 20 result: PHASE20_LIVE_GOLDEN_CHAIN_GATE PASS.
Production compose validation PASS.

## Proven failure paths
- Runtime not ready => FAIL
- Command Center not ready => FAIL
- MCP not alive => FAIL
- GREEN canary enters WAITING_OWNER => FAIL
- COMPLETED without VERIFIED independent evidence => FAIL

## Successful canary evidence
The acceptance test observes:
PLANNING → EXECUTING → COMPLETED

and requires:
- at least one plan
- at least one work item
- at least one execution
- at least one VERIFIED verification

Transient PLANNING/EXECUTING observation is recorded but is not a hard production requirement because a fast live chain may reach COMPLETED between polls. Persisted plan/work/execution/verification evidence is the authoritative completion proof.

## Safety
- Canary uses GREEN authority only.
- No approval is auto-granted.
- No RED or YELLOW side effect is introduced.
- The gate uses the same Command Center and runtime surfaces that production uses.
- No database shortcut can mark the canary successful.

## External limitations
- The acceptance runner has not yet been executed against a publicly deployed SAM environment.
- Docker image build/run is still not proven because the verifier sandbox has no Docker daemon.
- Current Phase 20 acceptance HTTP services are local test doubles, except the real Command Center readiness test.
- Live production credentials remain deployment-time configuration.
- GitHub hosted Actions remains externally blocked by the account billing lock.
