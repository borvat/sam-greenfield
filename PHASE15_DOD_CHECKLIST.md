# Phase 15 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Real bol Retailer API OAuth2 client-credentials authentication
- Access-token caching and one-time 401 refresh + retry
- Retailer API v10 media type
- Four GREEN read-only capabilities:
  - bol_list_orders
  - bol_list_returns
  - bol_list_invoices
  - bol_get_retailer
- Bounded orders pagination/filter inputs
- Returns filters
- Invoice date-range validation with 31-day maximum
- Four independent readback verifiers
- Four exact verification contracts
- Canonical production bundle registration
- Worker and MCP receive bol environment configuration
- No bol write/side-effect capability in the production bundle
- Existing Phase 0–14 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against one brand-new shared database with migrations 00001..00009 applied from zero.

All Phase 0 through Phase 15 test suites PASS.

Phase 15 acceptance:
- OAuth Basic client credentials PASS
- grant_type=client_credentials PASS
- Bearer reuse PASS
- one forced 401 refresh+retry PASS
- v10 Accept media type PASS
- page clamp PASS
- change interval clamp PASS
- returns read PASS
- invoices read PASS
- 31-day period accepted PASS
- 32-day period rejected PASS
- current retailer read PASS
- exact 4 read contracts PASS
- all 4 independent verifiers PASS
- all bol production capabilities GREEN PASS
- no bol side effects/writes PASS

## Production compose evidence
docker-compose config PASS.
Both sam and sam-mcp receive:
- BOL_CLIENT_ID
- BOL_CLIENT_SECRET
- BOL_TOKEN_URL
- BOL_RETAILER_BASE_URL
Secrets remain empty unless explicitly supplied.

## External limitations
- No real bol Retailer API account was contacted during acceptance.
- Container image build/run remains pending because Docker is unavailable in the verifier sandbox.
- GitHub Actions remains externally blocked by the account billing lock.
