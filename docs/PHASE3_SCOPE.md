# Phase 3 — Specialist Agents + Capability Execution

## Objective
Add a deterministic specialist-agent layer between the Executive Kernel queue and tool/capability executors.

## Architecture
Brain proposes plans.
Kernel persists and authorizes them.
Specialist agents may only claim work for capabilities explicitly assigned to them.
Workers execute through registered capability executors.
Independent verification remains outside the executing specialist.

## Invariants
- Unknown capability -> fail closed.
- Ambiguous capability ownership -> rejected at registry construction.
- An agent cannot claim work outside its declared capabilities.
- Assignment is persisted on the work_queue row using worker_version + handoff metadata.
- Fencing-token protection remains authoritative after assignment.
- Specialist agents cannot bypass authority approval, queue persistence, side-effect ledger, or verification.
- Specialist execution actor identity is durable and auditable.
- Existing Phase 0/1/2 invariants must remain green.

## Phase 3 foundation
1. Specialist Agent Registry
2. Deterministic capability -> specialist ownership
3. Capability-filtered queue claims
4. Durable specialist handoff metadata
5. Specialist runtime wrapper over Phase 1 worker runtime
6. Real PostgreSQL acceptance proof with two specialists and cross-capability isolation
