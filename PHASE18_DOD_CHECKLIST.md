# Phase 18 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL 15.17

## Scope completed
- Autonomous finance observation loop
- Bounded bol orders, returns and invoice reads
- Bounded e-Boekhouden mutation and outstanding-invoice reads
- Exact-reference reconciliation
- Deterministic structured owner brief
- Material-variance classification
- Append-only FINANCE_OPERATIONAL_BRIEF audit event
- Deduplicated internal finance_reconciliation goal creation
- Recent-run suppression
- Concurrent-run serialization with PostgreSQL advisory lock
- Production environment gating
- Single-flight bol OAuth token acquisition
- Single-flight e-Boekhouden session acquisition
- Global NULL-scoped business ID sequence hardening
- Migration 00010 for global business ID uniqueness
- Existing Phase 0–17 invariants remain green

## Acceptance evidence
Fresh PostgreSQL 15.17.
Migrations 00001..00010 applied from zero.
All Phase 0 through Phase 18 tests PASS in one shared database.
Phase 18 result: PHASE18_OPERATIONAL_FINANCE_LOOP PASS.
Production compose validation PASS.

## Finance loop behavior
- First material run creates one NEW finance_reconciliation goal.
- Same variance fingerprint reuses the active goal.
- High materiality threshold creates no goal.
- Recent runs are skipped.
- Concurrent same-entity runs serialize: one EXECUTED, one SKIPPED_LOCKED.
- Owner brief exposes orders, returns, invoices, mutations, outstanding invoices, known outstanding amount and reconciliation variance counts.
- The loop is disabled unless legal entity + bol + e-Boekhouden configuration are all present.

## Hardening evidence
- Exactly one bol OAuth sign-in is reused in acceptance.
- Exactly one e-Boekhouden session is reused in acceptance.
- Exactly one NULL-scoped goal business-ID sequence row exists after the full suite.
- All goal business IDs remain unique across the full suite.
- Phase 0 business-ID concurrency test remains green.

## Safety
- No accounting writes.
- No payment writes.
- No VAT filing.
- No bank writes.
- No marketplace writes.
- No fuzzy or amount-only automatic reconciliation.
- Material variance creates only an internal follow-up goal.

## External limitations
- Acceptance used local protocol mocks for bol and e-Boekhouden.
- Real production credentials/accounts were not contacted.
- Docker image build/run remains pending because the verifier sandbox has no Docker daemon.
- GitHub hosted Actions remains externally blocked by the account billing lock.
