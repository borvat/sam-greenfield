# Phase 6 — Operational Supervision + Incident Control

## Objective
Add a durable operational supervisor that continuously evaluates SAM's runtime health, opens deduplicated incidents, records recoveries, and produces an owner-facing operational brief without bypassing the Executive Kernel.

## Architecture
Runtime state
  -> Health Snapshot
  -> Deterministic SLO/threshold evaluation
  -> Append-only Incident Events in audit_log
  -> Owner Brief / Operations View

## Invariants
- Supervisor is read-mostly and never performs business side effects.
- Incident state is append-only: OPENED / RESOLVED events, never mutable incident rows.
- Repeated ticks do not duplicate an already-open incident.
- Resolution is recorded only after the triggering condition clears.
- Health decisions are deterministic from database state, not model judgment.
- Critical runtime faults are visible even if no model provider is available.
- Owner brief is generated from persisted runtime truth.
- Existing Phase 0–5 invariants remain green.

## Phase 6 foundation
1. Runtime health snapshot
2. Deterministic operational policies
3. Deduplicated append-only incidents
4. Recovery/resolution events
5. Structured owner brief
6. Real PostgreSQL acceptance proof
