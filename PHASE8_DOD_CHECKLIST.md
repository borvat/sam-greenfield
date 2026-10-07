# Phase 8 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Broad ChatGPT-facing tool surface established
- 31 tools exposed at foundation
- Stable tool registry with duplicate-name rejection
- System-owner guard on all current tools
- Fixed-query read tools only; no arbitrary SQL tool
- Coverage for goals, plans, queue, executions, verifications, approvals, policies, audit, incidents, events, side effects, memory, world facts, model providers/calls, legal entities, users, finance, runtime health, and owner decisions
- sam_capability_manifest added
- sam_execute added as generic production capability gateway
- sam_reconcile_side_effects added
- Action tools fail closed when no production dispatcher is registered
- Unknown capabilities fail closed
- Tool surface cleanly separates read-only tools from capability execution
- No test/synthetic adapter promoted into production
- Existing Phase 0-7 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 with pgvector against a brand-new isolated database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- 6/6 suites PASS

Phase 3:
- 4/4 suites PASS

Phase 4:
- 2/2 suites PASS

Phase 5:
- 2/2 suites PASS

Phase 6:
- 3/3 suites PASS

Phase 7:
- 2/2 suites PASS

Phase 8:
- chatgpt_tool_surface.ts PASS
- Tool count: 31

## Architecture invariants
- ChatGPT never talks directly to external providers.
- Side effects are available only through a registered production dispatcher.
- Missing dispatcher means sam_execute is UNAVAILABLE.
- Unknown tool names and unknown capabilities fail closed.
- The tool surface does not invent unavailable integrations.
- Tool transport remains separate from SAM business logic.
- Existing Kernel, Brain, Specialist, Tool, Learning, Supervisor, and Runtime boundaries remain intact.

## Remaining production work
The broad ChatGPT surface is now ready at the SAM application layer. Real action availability still depends on production capability wiring:
- real capability catalog
- real tool adapters
- real model provider adapters
- verifier loop
- planning trigger
- production composition module
- transport bridge (for example MCP/OpenAI app connector)

These must be implemented before action tools can be marked AVAILABLE in production.
