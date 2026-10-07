# Phase 3 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Specialist Agent Registry
- Single-owner capability mapping with ambiguity rejection
- Capability Catalog combining authority class + specialist ownership + version
- Capability-filtered queue claims
- Durable specialist handoff metadata on work_queue
- Specialist execution actor identity persisted in executions
- Specialist Supervisor for deterministic pickup
- Catalog-driven Brain -> Authority -> Kernel -> Specialist flow
- Independent verification remains outside executing specialists
- Cross-capability isolation
- Unknown specialist/capability paths fail closed

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against a brand-new throwaway database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- 6/6 suites PASS

Phase 3:
- capability_catalog.ts PASS
- specialist_delegation.ts PASS
- specialist_supervisor.ts PASS
- final_acceptance.ts PASS

## Architecture invariants
- Brain still proposes only.
- Kernel remains the sole durable execution authority.
- Specialist agents cannot claim capabilities outside their catalog ownership.
- Ambiguous capability ownership is rejected at startup.
- Authority policies are derived from the same catalog used for specialist ownership.
- Worker leases and fencing remain authoritative.
- Specialist assignment is durable and auditable.
- Independent verification remains mandatory before COMPLETED.
- Existing Phase 0/1/2 invariants remain green.

## External limitation
GitHub Actions remains blocked by the GitHub account billing lock. This is external to SAM code. Phase 3 is technically proven in a real PostgreSQL 15.17 environment; GitHub-hosted CI proof remains pending until billing is unlocked.
