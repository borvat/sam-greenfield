# Phase 14 — Real e-Boekhouden Read-Only Accounting Adapter

## Objective
Connect SAM to e-Boekhouden REST v1 as QNAN's accounting source without enabling accounting writes.

## Initial capabilities
- eboekhouden_list_mutations — GREEN, read-only
- eboekhouden_outstanding_invoices — GREEN, read-only
- eboekhouden_list_ledgers — GREEN, read-only
- eboekhouden_list_relations — GREEN, read-only

## Invariants
- The long-lived API token is environment-only.
- SAM exchanges the API token for a short-lived session token.
- The session token is cached and refreshed automatically.
- One 401 response triggers one session refresh + retry.
- No e-Boekhouden write endpoint is present in the production bundle.
- No arbitrary API path or query language is exposed to the model.
- All queries are bounded by explicit limit/offset inputs.
- Verification performs a fresh independent API read.
- Missing token means no e-Boekhouden capabilities.
- Existing Phase 0–13 invariants remain green.

## Environment
Required:
- EBOEKHOUDEN_API_TOKEN

Optional:
- EBOEKHOUDEN_SOURCE (default SAM, max 10 characters)
- EBOEKHOUDEN_API_BASE_URL (default https://api.e-boekhouden.nl)
