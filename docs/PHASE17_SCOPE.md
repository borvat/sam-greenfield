# Phase 17 — Finance Reconciliation Preview

## Objective
Give SAM a deterministic, read-only cross-source accounting view between bol and e-Boekhouden without creating or mutating accounting records.

## Capabilities
- finance_reconciliation_preview — GREEN, read-only
- finance_outstanding_snapshot — GREEN, read-only

## Reconciliation policy
- Exact-reference matching only.
- No amount-only or fuzzy matching is allowed.
- Ambiguous references remain unmatched.
- No automatic journal, invoice, mutation, payment, VAT, or bank write is performed.
- The output is a preview for evidence-based accounting follow-up.

## Sources
- bol Retailer invoice list
- e-Boekhouden mutations
- e-Boekhouden outstanding invoices

## Invariants
- Both bol and e-Boekhouden credentials must be configured before these capabilities are registered.
- All reads remain bounded.
- Independent verification re-runs both source reads.
- Existing Phase 0–16 invariants remain green.
