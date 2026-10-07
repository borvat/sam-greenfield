# SAM Greenfield

Greenfield implementation of SAM as a durable Executive Agent system.

## Current status
- Phase 0 Foundation: PASS on real PostgreSQL 15.17
- Phase 1 Executive Kernel: PASS on real PostgreSQL 15.17
- Phase 2 Brain + Model Gateway: PASS on real PostgreSQL 15.17
- Phase 3 Specialist Agents + Capability Execution: PASS on real PostgreSQL 15.17
- Phase 4 Tool Gateway + Side-Effect Contracts: PASS on real PostgreSQL 15.17
- Phase 5 Verified Learning + Memory: PASS on real PostgreSQL 15.17
- Phase 6 Operational Supervision + Incident Control: PASS on real PostgreSQL 15.17
- Phase 7 Production Readiness + Deployment Hardening: TECHNICALLY PASS; live deployment proof pending
- Phase 8 ChatGPT Tool Surface + Capability Gateway: PASS on real PostgreSQL 15.17
- Phase 9 Production Wiring + Kernel-backed Dispatch: PASS on real PostgreSQL 15.17
- Phase 10 MCP Transport Bridge for ChatGPT: PASS on real PostgreSQL 15.17 + real MCP HTTP handshake
- Phase 11 Real Model Provider Adapters: PASS on real PostgreSQL 15.17
- Phase 12 Real Gmail Adapter + Independent Verification: PASS on real PostgreSQL 15.17
- Phase 13 Real Google Drive Adapters + Verification Contracts: PASS on real PostgreSQL 15.17
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


## Phase 3 — Specialist Agents + Capability Execution
Implemented and real-PostgreSQL tested:
- Specialist Agent Registry
- fail-closed capability ownership
- Capability Catalog as the shared source for authority class + specialist ownership
- capability-filtered queue claims
- durable specialist handoff metadata
- specialist version + actor auditability
- Specialist Supervisor
- Brain -> Catalog -> Authority -> Kernel -> Specialist execution flow
- independent verification preserved outside executing specialists
- cross-capability isolation
- ambiguity rejection at registry construction

Phase 3 tests live under `tests/phase3/`.

See `docs/PHASE3_SCOPE.md` and `PHASE3_DOD_CHECKLIST.md`.


## Phase 4 — Tool Gateway + Side-Effect Contracts
Implemented and real-PostgreSQL tested:
- trusted Tool Registry
- catalog/tool authority consistency
- exact approval consumption for YELLOW/RED side effects
- semantic operation keys created before external calls
- provider idempotency-key propagation
- duplicate CONFIRMED side-effect deduplication
- fail-closed unresolved PENDING/SENT operations
- independent tool readback reconciliation
- crash-window no-resend behavior
- read-only vs side-effect execution separation
- reconciliation to CONFIRMED / RECONCILED

Phase 4 tests live under `tests/phase4/`.

See `docs/PHASE4_SCOPE.md` and `PHASE4_DOD_CHECKLIST.md`.


## Phase 5 — Verified Learning + Memory
Implemented and real-PostgreSQL tested:
- independent-verification learning gate
- VERIFIED world-fact append/supersession
- semantic JSONB scope matching
- repeated-support reinforcement for operational/commercial memory
- duplicate evidence does not inflate support counts
- explicit OWNER_DECISION / FORMAL_RULE approval path
- explicit approved-rule supersession
- VERIFIED facts only in world-model context
- REINFORCED / APPROVED_RULE memory only in planning context
- FAILED verification cannot poison durable learning

Phase 5 tests live under `tests/phase5/`.

See `docs/PHASE5_SCOPE.md` and `PHASE5_DOD_CHECKLIST.md`.


## Phase 6 — Operational Supervision + Incident Control
Implemented and real-PostgreSQL tested:
- deterministic runtime health snapshot
- stale-goal and stale-verification detection
- expired-lease detection
- old outbox backlog detection
- unreconciled side-effect detection
- provider-down detection
- recent model failure-rate policy
- append-only incident OPEN / RESOLVED lifecycle
- deduplicated repeated supervisor ticks
- durable incident outbox events
- structured owner operational brief
- model-independent supervision path

Phase 6 tests live under `tests/phase6/`.

See `docs/PHASE6_SCOPE.md` and `PHASE6_DOD_CHECKLIST.md`.


## Phase 7 — Production Readiness + Deployment Hardening
Implemented and production-like tested:
- strict production configuration validation
- required composition module in production
- startup database connectivity + restart recovery gate
- liveness and readiness endpoints
- graceful shutdown and readiness drain
- runtime tick overlap protection
- signal-aware process entrypoint
- production Dockerfile
- production compose configuration with required-variable guards
- deployment / rollback / backup / restore runbook

Phase 7 tests live under `tests/phase7/`.

Container files passed static lint/config validation and simulated production dependency installation. A real Docker build/run and a real production deployment remain pending because the verifier environment has no Docker and no production system was changed.

See `docs/PHASE7_SCOPE.md`, `docs/PRODUCTION_RUNBOOK.md`, and `PHASE7_DOD_CHECKLIST.md`.


## Phase 8 — ChatGPT Tool Surface + Capability Gateway
Implemented and real-PostgreSQL tested:
- 31 ChatGPT-facing tools at foundation
- broad read coverage across runtime, goals, queue, verification, approvals, incidents, memory, models, finance, company state, and reliability data
- fixed-query read tools only
- explicit system-owner guard
- `sam_capability_manifest`
- `sam_execute`
- `sam_reconcile_side_effects`
- fail-closed UNAVAILABLE state when production dispatcher/reconciler is absent
- unknown tools and unknown capabilities fail closed
- no synthetic/test adapter promoted into production

Phase 8 tests live under `tests/phase8/`.

The tool surface is ready, but real action availability still depends on production capability wiring and a transport bridge such as MCP/OpenAI app integration.

See `docs/PHASE8_SCOPE.md` and `PHASE8_DOD_CHECKLIST.md`.


## Phase 9 — Production Wiring + Kernel-backed Dispatch
Implemented and real-PostgreSQL tested:
- trusted production bundle contract
- capability/tool/adapter consistency validation
- concrete-adapter requirement for every production capability
- kernel-backed ChatGPT sam_execute
- durable direct capability goals/plans/queue work
- approval-gated YELLOW/RED path
- pending approval creation with zero queued work while blocked
- production side-effect reconciliation hook
- autonomous planning hook when real model adapters exist
- independent verifier hook when a real verifier exists
- canonical production composition module
- production compose wiring via SAM_PRODUCTION_BUNDLE_MODULE
- canonical global goal business-ID generation for cross-org safety

Phase 9 tests live under `tests/phase9/`.

Phase 9 closes the production orchestration boundary. Real external model/tool/verifier adapters are intentionally still separate from this foundation and must be added without synthetic substitutes.

See `docs/PHASE9_SCOPE.md` and `PHASE9_DOD_CHECKLIST.md`.


## Phase 10 — MCP Transport Bridge for ChatGPT
Implemented and protocol-tested:
- official MCP TypeScript SDK v2
- Streamable HTTP transport
- real MCP HTTP handshake with the official client
- 28 read tools advertised without a production dispatcher
- 30 tools advertised with a production dispatcher
- sam_execute hidden when unavailable
- bearer-token protection
- allowed-host protection
- optional origin allow-list
- dedicated MCP process and /livez endpoint
- separate production sam-mcp service on port 8081

The MCP transport delegates every tool call to the Phase 8 ChatGPTToolRegistry and preserves the Phase 9 kernel-backed execution boundary.

Phase 10 tests live under `tests/phase10/`.

A public HTTPS endpoint / secure MCP tunnel and a real ChatGPT live connection remain deployment tasks, not protocol implementation gaps.

See `docs/PHASE10_SCOPE.md` and `PHASE10_DOD_CHECKLIST.md`.


## Phase 11 — Real Model Provider Adapters
Implemented and protocol-tested:
- OpenAI Responses API adapter
- Anthropic Messages API adapter
- Google Gemini generateContent adapter
- DeepSeek OpenAI-compatible Chat Completions adapter
- Qwen / Alibaba Model Studio OpenAI-compatible adapter
- environment-only credentials
- deployment-configured model names
- normalized token usage
- JSON output parsing
- one-to-one production adapter/provider-config validation
- startup synchronization into model_providers
- PUBLIC + INTERNAL default privacy
- fail-closed provider absence when credentials/config are incomplete

Phase 11 tests live under `tests/phase11/`.

The adapters were verified against local HTTP protocol mocks matching each provider's wire contract. No live provider keys or paid API calls were used during acceptance.

See `docs/PHASE11_SCOPE.md` and `PHASE11_DOD_CHECKLIST.md`.


## Phase 12 — Real Gmail Adapter + Independent Verification
Implemented and protocol-tested:
- Google OAuth refresh-token flow
- Gmail REST client
- gmail_send as YELLOW side-effect capability
- deterministic Message-ID + X-SAM-Operation-Key
- users.messages.send integration
- reconciliation by provider message id
- reconciliation fallback by RFC822 Message-ID
- independent Gmail readback verification
- production bundle registration from environment only
- external AI-assistant wording guard
- shared canonical production bundle path for worker and MCP services

Phase 12 tests live under `tests/phase12/`.

The adapter was verified against a local Gmail/OAuth protocol mock. No real Gmail account or production credentials were used during acceptance.

See `docs/PHASE12_SCOPE.md` and `PHASE12_DOD_CHECKLIST.md`.


## Phase 13 — Real Google Drive Adapters + Verification Contracts
Implemented and protocol-tested:
- drive_get_metadata (GREEN)
- drive_search (GREEN)
- drive_create_folder (YELLOW)
- Google OAuth refresh-token reuse
- deterministic hashed Drive appProperties operation marker
- crash-window side-effect reconciliation without providerReference
- independent Drive readback verification
- runtime synchronization of Drive verification contracts
- canonical production bundle registration

Phase 13 tests live under `tests/phase13/`.

The adapters were verified against a local Drive/OAuth protocol mock. No real Google Drive account or production credentials were used during acceptance.

See `docs/PHASE13_SCOPE.md` and `PHASE13_DOD_CHECKLIST.md`.
