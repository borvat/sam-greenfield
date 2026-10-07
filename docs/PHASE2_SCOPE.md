# Phase 2 — Brain + Model Gateway

## Objective
Add a provider-agnostic reasoning layer above the Phase 1 Executive Kernel without weakening kernel authority, verification, durability, or audit guarantees.

## Boundary
The model layer may propose plans, classifications, summaries, or decisions. It may not directly perform side effects, mutate kernel state outside approved interfaces, self-verify execution, or bypass authority gates.

## Phase 2 foundation
1. Provider registry backed by model_providers.
2. Deterministic router by task, capability, health, privacy class, cost ceiling, and policy preference.
3. Provider abstraction with fallback.
4. Every model call persisted to model_calls with selection reason, latency, tokens, cost, success, retry count, data classification.
5. Structured planner contract that produces candidate plan steps only.
6. Candidate plans still enter Phase 1 through persistPlanAndDelegateAtomic; the model never writes work_queue directly.

## Initial provider IDs
- openai
- anthropic
- google
- deepseek
- qwen

Credentials and concrete SDK adapters are deployment configuration, not source-controlled secrets.

## Acceptance
- deterministic routing
- unhealthy/incompatible provider excluded
- privacy class enforced
- cost ceiling enforced
- fallback works without duplicate model_call success records
- failed calls are audited
- structured output rejected when invalid
- planner cannot bypass kernel persistence/delegation
- Phase 0 and Phase 1 suites remain green
