# Phase 18 — Operational Finance Loop

## Objective
Turn the proven bol + e-Boekhouden read integrations into an autonomous, durable finance-observation loop that detects reconciliation variances, produces a structured owner brief, and creates one internal follow-up goal when a material variance exists.

## Loop
1. Read bounded bol orders, returns and invoices.
2. Read bounded e-Boekhouden mutations and outstanding invoices.
3. Reconcile invoice/mutation references using exact-reference-only logic.
4. Build a deterministic owner brief with counts and outstanding totals.
5. Classify the variance as material/non-material using a configured count threshold.
6. Persist an append-only audit event for every executed loop.
7. If material, create one deduplicated internal finance_reconciliation goal.
8. Do not create accounting, payment, VAT, bank, or marketplace writes.

## Production controls
- SAM_FINANCE_LEGAL_ENTITY_ID — required to enable the loop.
- SAM_FINANCE_LOOP_INTERVAL_MINUTES — default 180.
- SAM_FINANCE_LOOKBACK_DAYS — default 30, max 31.
- SAM_FINANCE_MATERIAL_VARIANCE_COUNT — default 1.
- SAM_FINANCE_MAX_PAGES — default 5, max 20.

The loop is disabled if bol/e-Boekhouden credentials or the finance legal entity are missing.
