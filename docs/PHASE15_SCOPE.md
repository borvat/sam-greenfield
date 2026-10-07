# Phase 15 — Real bol Retailer Read-Only Adapter

## Objective
Connect SAM to the bol Retailer API for the operational reads needed by sales, returns, invoices, and retailer status without enabling marketplace writes.

## Initial capabilities
- bol_list_orders — GREEN, read-only
- bol_list_returns — GREEN, read-only
- bol_list_invoices — GREEN, read-only
- bol_get_retailer — GREEN, read-only

## Invariants
- bol client credentials are environment-only.
- OAuth2 client-credentials tokens are cached and reused.
- One 401 triggers one token refresh + retry.
- Retailer API media type is pinned to v10 for these read resources.
- No bol write endpoint is present in the production bundle.
- No arbitrary API path/query is exposed to the model.
- Pagination and enum filters are validated and bounded.
- Invoice date-range input is validated and capped at 31 days.
- Verification performs a fresh independent bol API read.
- Missing credentials mean no bol capabilities.
- Existing Phase 0–14 invariants remain green.

## Environment
Required:
- BOL_CLIENT_ID
- BOL_CLIENT_SECRET

Optional:
- BOL_TOKEN_URL (default https://login.bol.com/token)
- BOL_RETAILER_BASE_URL (default https://api.bol.com/retailer)
