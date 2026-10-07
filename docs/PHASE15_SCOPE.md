# Phase 15 — bol.com Retailer API v10 Read Adapter

## Objective
Connect SAM to bol.com's Retailer API v10 for real read-only marketplace visibility over orders, returns and process-status data.

## Initial capabilities
- bol_list_orders — GREEN, read-only
- bol_get_order — GREEN, read-only
- bol_list_returns — GREEN, read-only
- bol_get_return — GREEN, read-only
- bol_get_process_status — GREEN, read-only

## Provider contract
- OAuth2 client-credentials token endpoint: https://login.bol.com/token
- Retailer API base: https://api.bol.com/retailer
- Shared process status base: https://api.bol.com/shared
- Media type: application/vnd.retailer.v10+json
- Access tokens are cached and reused.
- One 401 response triggers one token refresh + retry.

## Invariants
- No shipment, cancellation, return handling, offer, price, stock, invoice, or other marketplace write is enabled in this phase.
- Credentials are environment-only.
- No arbitrary API path or arbitrary query language is exposed to models.
- Order page is clamped to >=1.
- change-interval-minute is clamped to 1..60.
- Return page is clamped to >=1.
- Only documented fulfilment/status values are accepted.
- Independent verification performs a fresh API read.
- Missing bol credentials means no bol capabilities.
- Existing Phase 0–14 invariants remain green.
