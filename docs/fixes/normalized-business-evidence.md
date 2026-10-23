# Bounded normalized business-evidence slice

Base: immutable `f8b570ac80158303993c3156872c76401ff965f9`. This separate branch adds no registration, permissions, credentials, live reads, model calls or deployment. It is not the bounded-live evaluation checkpoint.

## Evidence reviewed

- Official [bol Retailer v10 OpenAPI](https://api.bol.com/retailer/public/apispec/Retailer%20API%20-%20v10), OrderOrderItem, checked 2026-10-23: unitPrice and totalPrice include VAT. Commission does not have the same declared tax basis. Currency is not established by this reviewed schema. [Order visibility](https://api.bol.com/retailer/public/Retailer-API/v10/functional/retailer-api/orders-shipments.html) is limited and does not prove historical all-order coverage. No market/country-to-currency assumption is made. A direct documentation download returned HTTP 403; the official specification was read through the web reader, not through a retailer API call.
- Official [Drive v3 files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list): nextPageToken identifies another page; incompleteSearch can invalidate completeness. Page size is not a terminal-page test and pagination is not a transactional snapshot.
- [Gmail list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list) describes IDs and a next-page token. The existing legacy verifier checks message identities, not complete list/metadata equality; no new body, promise-date or complete-collection contract is claimed for it.

No live response or private business data was captured. Tests use invented records with documented response shapes. Official schemas and checked-in adapters are distinct: opaque google_mcp_* text/structuredContent wrappers cannot borrow native Drive/Gmail contracts.

## Implementation

`normalizedConnectorContracts.ts` contains opt-in versioned contracts, separate from the existing registry:

- `bol.order.fields.v2`: verified item/order identities, quantities, raw placement-time text and canonical parsed price values. VAT inclusion is declared only for the two documented customer price fields; currency stays UNKNOWN. Unit prices, customer item charges and commission have distinct monetary meanings. Missing optional fields remain null. Unsafe numeric magnitudes, exponent notation and sub-cent precision reject; original JSON numeric lexemes cannot be recovered from already parsed responses. No refund/net revenue calculation is invented.
- `drive.search.collection.v2`: exact-query verified page receipts, explicit incomplete-search guard and record identities. The existing read-only Drive client/adapter/verifier now forward the same optional page_token and retain incompleteSearch. An absent/true flag blocks complete-collection assessment. Changed query, missing page and duplicate identities remain failures. No integration is activated or rebound.

A shared monetary-evidence contract now evaluates structured report observations and cited replayed derived output against the same amount/currency/VAT/calendar-period/scope requirements. Derived sales evidence must carry reviewed customer-charge semantics, all required fields, bound collection/identity coverage and citations for every monetary output row. A unit-price sum, settlement invoice, unknown currency/VAT or wrong period cannot satisfy sales revenue. Reviewer input recognizes already replayed eligible evidence instead of incorrectly repeating the old missing-preassembled-report limitation. Final completion still requires validated monetary cell citations; citing only a non-monetary field does not pass. Original monetary trigger behavior and independent critique remain; the old preassembled-report requirement no longer rejects an otherwise valid replayed derivation merely for its representation.

Exact ISO day/range objects can match a persisted period string without interpreting free-form dates or timezone offsets. Existing exact source-period labels still match themselves. Repeated normalized identities across reads remain ambiguous; union and sum cannot turn two observations of one item into a fulfilled single-item quantity. Row identity is separate from population completeness: a verified single-order item set can support enumerated identities, but cannot claim all daily sales.

## Acceptance and limits

Tests include official-shape synthetic bol values and unknowns; Drive cursor/readback equality and incomplete/missing pages; shared monetary assessment; and actual restricted-role review/persistence through ordinary continuation and replay. The integration variants require a generic EUR/net/customer-charge aggregate to complete without a preassembled report, while missing currency/VAT, wrong period, settlement and unit-price variants stay blocked. Existing tenant, source revocation, citation and duplicate-execution assertions remain.

The working-tree targeted tests are not exact-head full acceptance. Final test evidence must identify the committed candidate and preserve failed fixture runs. No synthetic result proves autonomous tool composition or production business correctness.

Remaining gaps: no reviewed order-currency guarantee, no complete daily-sales collection receipts from the current bol listing, no return/refund or VAT-rate/net conversion, and no normalized semantic document/message schema for default Google MCP. These are explicit evidence gaps, not proof that upstream APIs cannot provide the fields. Live launch signing/principal setup is independently unresolved and is not a Render limitation; see the operator-plan follow-up on evidence/shared-goal-path.
