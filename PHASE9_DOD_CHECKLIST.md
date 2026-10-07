# Phase 9 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Trusted production bundle contract
- Production bundle validation for capability/tool/adapter authority consistency
- Production capability requires a concrete adapter
- Kernel-backed ChatGPT sam_execute dispatcher
- Direct capability requests create durable goals/plans/queue work
- No direct provider call from sam_execute
- GREEN capability path reaches execution + independent verification
- YELLOW/RED capability path remains approval-gated
- Missing approval creates WAITING_OWNER + pending approval request
- No queued work is created for blocked approval-gated execution
- Production side-effect reconciliation wired through trusted ToolRegistry
- Autonomous planning hook for NEW goals when real model adapters are registered
- Independent verifier hook for VERIFYING executions when real verifier adapters are registered
- Canonical production composition module added
- Production compose now points at canonical composition module and requires SAM_PRODUCTION_BUNDLE_MODULE
- Cross-organization goal business ID collision fixed by using the canonical global goal sequence

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against one brand-new shared database with migrations 00001..00009 applied from zero.

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
- 1/1 suite PASS

Phase 9:
- production_wiring.ts PASS

## Critical acceptance properties
- sam_execute persists kernel work; it never invokes provider adapters directly.
- GREEN capability can complete through an independent verifier.
- YELLOW capability without approval becomes WAITING_OWNER.
- Approval-gated blocked goals have zero queued work.
- A pending approval record is created for the owner.
- Production bundle validation fails closed when a declared capability lacks a concrete adapter.
- Shared-database execution passes after the global goal business ID fix.

## Architecture invariants
- No synthetic/test adapter is promoted into production.
- Missing production adapters mean no production action.
- Planning requires registered real model adapters.
- Verification requires registered real independent verifiers.
- All side effects remain behind ToolGateway + authority + reconciliation.
- ChatGPT remains a client of the kernel, not a bypass around it.

## Remaining production work
Phase 9 provides the production wiring framework, not the actual external provider implementations.

Still required:
- real model-provider adapters
- real business tool adapters/connectors
- real independent readback verifiers per capability
- production capability bundle populated with those real adapters
- transport bridge for ChatGPT/OpenAI MCP/app exposure
- live container deployment and live acceptance

GitHub Actions remains externally blocked by the account billing lock.
