# Phase 8 — ChatGPT Tool Surface + Production Capability Gateway

## Objective
Expose a broad, stable, fail-closed ChatGPT-facing tool surface over SAM's real persisted runtime state without inventing integrations that do not exist yet.

## Principles
- ChatGPT gets many useful tools from day one.
- Tool names are stable even as adapters evolve behind them.
- Read tools use fixed queries; no arbitrary SQL tool exists.
- System-wide tools require an explicit owner/system context.
- Side-effect execution goes through one generic capability gateway, never directly to external providers.
- Unknown or unavailable capabilities fail closed.
- No test adapter is ever promoted into production.
- The surface distinguishes AVAILABLE, UNAVAILABLE, and READ_ONLY capabilities explicitly.
- Tool transport (MCP / OpenAI app bridge) is separate from business logic.

## Initial surface
System/status:
- sam_system_status
- sam_runtime_health
- sam_pending_owner_decisions
- sam_queue_backlog
- sam_unresolved_side_effects

Goals/plans/execution:
- sam_list_goals
- sam_get_goal
- sam_get_goal_timeline
- sam_list_plans
- sam_list_work_queue
- sam_list_executions
- sam_list_verifications
- sam_list_verification_contracts

Authority/audit:
- sam_list_approvals
- sam_list_policies
- sam_list_audit
- sam_list_open_incidents

Events/reliability:
- sam_list_events
- sam_list_inbox
- sam_list_outbox
- sam_list_side_effects

Knowledge:
- sam_list_world_facts
- sam_list_memory

Models:
- sam_list_model_providers
- sam_list_model_calls

Company/finance:
- sam_list_legal_entities
- sam_list_users
- sam_list_financial_documents

Capability control:
- sam_capability_manifest
- sam_execute
- sam_reconcile_side_effects

## Production rule
The read surface is real immediately because it is backed by existing PostgreSQL state.
Action tools are only AVAILABLE when a production dispatcher/reconciler is explicitly registered by the composition layer. Otherwise they return a fail-closed unavailable result.
