# Phase 4 — Tool Gateway + External Side-Effect Contracts

## Objective
Add a fail-closed tool/connector execution layer below Specialist Agents and above external APIs.

## Architecture
Brain -> Kernel -> Specialist Agent -> Tool Gateway -> External Adapter -> Independent Verification

## Invariants
- Tool capability must exist in the trusted catalog.
- Tool authority class must match the capability catalog.
- Non-GREEN tools require an exact live approval bound to capability + params hash + legal entity.
- Approval use is consumed atomically before first side-effect attempt.
- A semantic operation_key is inserted before the external call.
- Existing PENDING/SENT operation is never re-sent automatically; it requires reconciliation.
- Existing CONFIRMED operation is treated as deduplicated and is not sent again.
- External adapters receive the semantic operation key as their idempotency key.
- Specialist and Kernel fencing rules remain authoritative.
- External tool result cannot self-complete a goal; independent verification is still required.

## Phase 4 foundation
1. Tool registry
2. Exact approval consumption
3. Side-effect safe executor factory
4. Crash-safe no-resend semantics
5. Provider idempotency key propagation
6. Real PostgreSQL acceptance proof
