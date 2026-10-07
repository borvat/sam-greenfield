# Phase 4 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Trusted Tool Registry
- Exact authority match between capability catalog and tool definition
- Exact approval consumption for non-GREEN side effects
- Approval bound to capability + params hash + legal entity + expiry + usage budget
- Semantic operation_key created before external side-effect call
- Provider idempotency key propagation
- Duplicate CONFIRMED side effects deduplicate without re-send
- Existing PENDING/SENT operations fail closed and require reconciliation
- Independent tool readback reconciliation
- SENT -> CONFIRMED / RECONCILED transition
- Failed readback -> FAILED / FAILED_PERMANENT support
- Crash-window no-resend behavior
- Read-only tools bypass side-effect ledger correctly
- Existing Phase 0/1/2/3 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against a brand-new isolated database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- 6/6 suites PASS

Phase 3:
- 4/4 suites PASS

Phase 4:
- tool_gateway.ts PASS
- reconciliation.ts PASS

## Architecture invariants
- Brain cannot call tools directly.
- Specialist Agents execute only through trusted capability executors.
- Tool authority cannot disagree with the capability catalog.
- Non-GREEN approvals are consumed exactly before first side-effect attempt.
- Side-effect retries never blindly re-send an unresolved operation.
- External adapters receive a semantic idempotency key.
- Independent reconciliation is separate from execution result.
- Goal completion still requires independent verification.
- Fencing and durable queue ownership remain authoritative.

## External limitation
GitHub Actions remains blocked by the GitHub account billing lock. This is external to SAM code. Phase 4 is technically proven in a real PostgreSQL 15.17 environment; GitHub-hosted CI proof remains pending until billing is unlocked.
