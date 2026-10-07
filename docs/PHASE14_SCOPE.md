# Phase 14 — Real bol Retailer Read Surface

## Objective
Connect SAM to bol Retailer API v10 with a production-grade read-only surface before any marketplace write action is enabled.

## Capabilities
- bol_list_orders — GREEN
- bol_get_order — GREEN
- bol_list_returns — GREEN
- bol_list_shipments — GREEN
- bol_get_offer — GREEN

## Invariants
- OAuth2 client credentials remain deployment secrets only.
- All calls use the bol v10 vendor media type.
- No cancel, shipment creation, offer mutation, inventory mutation, invoice upload or other write is enabled in this phase.
- Pagination and filters are bounded by the adapter.
- Verification performs independent API readback and never trusts execution output.
- No side-effect ledger entries are created by these capabilities.
- Missing bol credentials means no bol capability is registered.
