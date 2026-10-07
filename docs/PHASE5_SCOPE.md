# Phase 5 — Verified Learning + Memory

## Objective
Turn verified execution outcomes into durable operational knowledge without allowing model hallucinations or unverified execution claims to poison SAM's memory.

## Architecture
Verified execution / owner decision
  -> Learning Gate
  -> World Facts / Memory Records
  -> Context Assembler
  -> Brain planning

## Invariants
- Learning from execution requires an independent VERIFIED verification.
- FAILED / INCONCLUSIVE / NOT_OBSERVABLE execution outcomes cannot reinforce memory.
- World facts are append-only; a new verified fact supersedes the previous active fact for the same entity + attribute + scope.
- Conflicting unverified observations never replace a VERIFIED fact.
- Operational/commercial observations require repeated verified support before becoming REINFORCED.
- OWNER_DECISION and FORMAL_RULE do not auto-promote from observations.
- Approved rules must be explicitly promoted by a trusted owner/authority path.
- Context assembly continues to load only VERIFIED world facts and REINFORCED / APPROVED_RULE memory.
- Learning never performs external side effects.

## Phase 5 foundation
1. Verified learning gate from executions + verifications
2. Deterministic world-fact supersession
3. Evidence-bound memory observation and reinforcement
4. Explicit owner/formal-rule approval path
5. Conflict-safe context behavior
6. Real PostgreSQL acceptance proof
