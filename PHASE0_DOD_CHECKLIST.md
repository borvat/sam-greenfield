# Phase 0 DoD - Actual Current State

Status: Architecturally sound + Security fixed (fail-closed) + Mechanically tested
NOT LIVE_PROVEN yet - requires real GitHub Actions run

Migrations: 9 canonical 00001..00009
- 00001 orgs, legal_entities, users, business_id_sequences transactional never MAX()+1
- 00002 audit_log append-only
- 00003 event_fabric event_seq BIGINT monotonic, dedup_key UNIQUE, inbox per-consumer UNIQUE
- 00004 outbox, side_effect_operations operation_key UNIQUE semantic, work_queue fencing_token
- 00005 world_facts append-only + deterministic view
- 00006 policy_envelopes, approvals bound scope, verification_contracts
- 00007 goals, plans, financial_documents immutability
- 00008 RLS tenant isolation FAIL-CLOSED IS NOT NULL AND =
- 000009 Fix confirmation clean final state each policy created once

RLS: fail-closed USING (current_org_id() IS NOT NULL AND org_id = current_org_id()) etc.
Security tests: No context -> 0 rows, INSERT/UPDATE/DELETE blocked, A cannot read B, B cannot read A, A can read own, service bypass explicit never NULL

Tables: 22 total, all 22 rowsecurity=true after 00009, business_id_sequences infrastructure exception

No LIVE_PROVEN claim until actual CI execution
Content hash != Git commit SHA - real SHA via git rev-parse HEAE

Phase 1 NOT started
