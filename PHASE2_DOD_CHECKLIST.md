# Phase 2 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Provider-agnostic Model Gateway
- Deterministic routing by capability, health, privacy class, cost ceiling, and provider preference
- Fallback across providers
- Cumulative fallback budget enforcement
- Recent-failure circuit breaker
- Durable model call audit in model_calls
- Structured planner contract and validation
- Brain -> Kernel handoff only through persisted plan APIs
- Brain replanning with versioned plans and bounded replan budget
- Trusted capability authority guard before plan persistence
- Exact approval binding by capability + params hash + legal entity for YELLOW/RED
- Blocked candidate plans move to WAITING_OWNER and create no work_queue rows
- End-to-end Brain -> Gateway -> Plan -> Kernel -> Worker -> Independent Verification -> COMPLETED

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against a brand-new throwaway database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- model_gateway.ts PASS
- brain_kernel_handoff.ts PASS
- brain_replanning.ts PASS
- authority_guard.ts PASS
- gateway_resilience.ts PASS
- final_acceptance.ts PASS

## Security and architecture invariants
- Models cannot write work_queue directly.
- Models cannot execute side effects directly.
- Models cannot self-verify execution.
- Invalid planner output is rejected before persistence.
- Unknown capability policy fails closed.
- Provider privacy eligibility is enforced before routing.
- Provider health and fallback budget are enforced before invocation.
- Independent verification remains required for goal completion.
- Phase 0 and Phase 1 invariants remain green.

## External limitation
GitHub Actions remains blocked by the GitHub account billing lock. This does not indicate a SAM code failure. Phase 2 is technically proven in an external real PostgreSQL 15.17 environment; GitHub-hosted CI proof remains pending until billing is unlocked.
