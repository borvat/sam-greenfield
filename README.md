# SAM Greenfield

Greenfield implementation of SAM as a durable Executive Agent system.

## Current status
- Phase 0 Foundation: PASS on real PostgreSQL 15.17
- Phase 1 Executive Kernel: PASS on real PostgreSQL 15.17
- Phase 2 Brain + Model Gateway: PASS on real PostgreSQL 15.17
- GitHub Actions: externally blocked by GitHub billing lock; hosted CI proof remains pending

## Architecture
SAM separates reasoning from execution:

```
Owner / Event
  -> Brain
  -> Model Gateway
  -> Candidate Plan
  -> Executive Kernel
  -> Durable Queue
  -> Worker Lease + Fencing
  -> Execution Record
  -> Independent Verification
  -> Continuation / Replan
  -> Final Result
```

The model layer proposes. The kernel persists, authorizes, executes, verifies, and recovers.

## Phase 0 — Foundation
- 9 canonical migrations: 00001..00009
- 22 tables with fail-closed RLS
- monotonic event_seq + dedup_key
- transactional outbox/inbox
- fencing tokens
- side-effect operation ledger
- append-only audit
- financial immutability
- real PostgreSQL security and concurrency tests

See `PHASE0_DOD_CHECKLIST.md`.

## Phase 1 — Executive Kernel
Implemented and real-PostgreSQL tested:
- durable goal state machine
- persisted plans
- multi-step execution
- queue leasing and fencing
- crash/restart recovery
- event-driven continuation
- transactional outbox relay
- worker runtime
- side-effect deduplication
- bounded replanning
- independent verification gating
- runtime supervisor
- final end-to-end acceptance

Phase 1 tests live under `tests/phase1/`.

## Phase 2 — Brain + Model Gateway
Implemented and real-PostgreSQL tested:
- provider-agnostic Model Gateway
- providers: OpenAI / Anthropic / Google / DeepSeek / Qwen IDs supported by registry
- deterministic routing by task capability, health, privacy class, cost, and preference
- provider fallback
- cumulative fallback cost ceiling
- recent-failure circuit breaker
- durable model_calls audit
- structured CandidatePlan validation
- Brain -> Kernel handoff only through persisted plan APIs
- versioned Brain replanning
- trusted capability authority policies
- exact approval binding for non-GREEN actions
- fail-closed unknown capability handling
- blocked plans move to WAITING_OWNER with zero work queued
- end-to-end Brain -> Gateway -> Kernel -> Worker -> Independent Verification -> COMPLETED

See `docs/PHASE2_SCOPE.md` and `PHASE2_DOD_CHECKLIST.md`.

## Quick PostgreSQL verification
```bash
for f in packages/db/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

python3 tests/phase0/phase0_acceptance.py
python3 tests/phase0/test_business_id_concurrency.py
python3 tests/phase0/test_fencing.py
python3 tests/phase0_postgres/real_postgres_test.py
python3 tests/phase0_postgres/test_rls_fail_closed_security.py
python3 tests/phase0_postgres/test_rls_tenant_isolation.py

# With temporary tsx + pg runtime available:
for t in tests/phase1/*.ts; do npx tsx "$t"; done
for t in tests/phase2/*.ts; do npx tsx "$t"; done
```

## CI status
The repository workflow exists, but GitHub-hosted Actions are currently prevented from starting by an account billing lock. Real PostgreSQL 15.17 verification has been completed successfully outside GitHub Actions.

Do not label GitHub CI as green until an actual hosted run completes successfully.
