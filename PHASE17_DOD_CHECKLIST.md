# Phase 17 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL 15.17

## Scope completed
- finance_reconciliation_preview — GREEN, read-only
- finance_outstanding_snapshot — GREEN, read-only
- Exact-reference-only bol ↔ e-Boekhouden reconciliation
- Ambiguous references remain ambiguous
- bol-only and accounting-only records remain visible
- Outstanding total includes only known numeric amounts
- Independent source readback verification for both capabilities
- Verification contracts persisted
- Both bol and e-Boekhouden credentials required before registration
- No accounting, payment, VAT, journal, bank, or marketplace write introduced
- Existing Phase 0–16 invariants remain green

## Acceptance evidence
Fresh PostgreSQL 15.17 with migrations 00001..00009 from zero.
All 40 test files Phase 0 through Phase 17 PASS.
Phase 17 result: PHASE17_FINANCE_RECONCILIATION PASS capabilities=2.
Production compose validation PASS.

## Safety
- No fuzzy or amount-only auto-match.
- No automatic accounting write.
- No automatic invoice creation.
- No automatic payment reconciliation.
- No tax filing action.
- Cross-source output is a deterministic preview only.

## External limitations
- Acceptance used local bol/e-Boekhouden protocol mocks.
- Real production credentials/accounts were not contacted.
- Docker image build/run remains pending because the verifier sandbox has no Docker daemon.
- GitHub hosted Actions remains externally blocked by the account billing lock.
