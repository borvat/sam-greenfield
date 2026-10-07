# Phase 16 — bol Operational Intelligence Read Surface

## Objective
Extend the proven bol Retailer integration with the operational reads SAM needs for order detail, shipment tracking, margin checks and competitive offer analysis.

## Capabilities
- bol_get_order — GREEN
- bol_list_shipments — GREEN
- bol_get_commission — GREEN
- bol_get_competing_offers — GREEN

## Invariants
- Read-only: no marketplace mutation.
- Existing OAuth/token caching and one-time 401 retry remain authoritative.
- Inputs are bounded and validated.
- EAN must be 13 digits.
- Country, fulfilment and condition values are enumerated.
- Every capability has independent API readback verification.
- No arbitrary API path or query language is exposed.
- Existing Phase 0–15 invariants remain green.

Note: bol Offers v10 is deprecated and is intentionally not used for new write functionality. Any future offer mutation must target the supported offer API version available at implementation time.
