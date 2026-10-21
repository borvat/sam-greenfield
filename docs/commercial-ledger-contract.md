# Commercial learning source contract (draft v1)

Read the Arabic delivery report for acceptance and gaps. This library is staged on PR37, not registered as an MCP tool, not deployed, and disabled unless `SAM_COMMERCIAL_LEARNING_ENABLED=true`. Learning also requires `SAM_KNOWLEDGE_ENABLED=true`. Neither flag was changed in any production environment.

## Invocation and authority

The four internal entry points in `apps/commercial/src/service.ts` accept a dedicated database connection and an authenticated `{legalEntityId, actor}`. They open/commit their own transaction; do not nest them in another transaction or pass actor/entity from source documents or untrusted model arguments. Provision the per-company account binding and ANALYZE / EXPERIMENT / LEARN grants through an owner-reviewed internal administration path; none is created by the migration. There is no generic granting API here.

`analyzeCommercial` takes a goal ID, exact evidence references, a closed Amsterdam date range, and at most 100 product mappings. Each reference has `{executionId, path}` using a bounded JSON pointer. Supported sources are explicit registered read capability IDs. Executions must belong to the same goal and company as the analysis, be EXECUTED and latest VERIFIED with matching plan/execution hashes. Legacy bol full readback is compared for equality rather than trusting its VERIFIED flag. Hashed readback must match the stored response. Inputs, response hashes, read timestamps and output hash are persisted for reproduction. No upstream read is issued by this library.

Existing bol execution envelope `{tool, data}` and its structured JSON are supported. Drive content must be JSON in the existing `structuredContent.result` text envelope after `--- CONTENT ---\n`. Free-text documents, CSV/PDF invoice extraction, guessed VAT/currency conversion and arbitrary embedded JavaScript are unsupported. A hand-authored JSON claim remains an attributed source claim even after a verified file read.

## JSON ledger product

See `tests/commercial/lab.ts` for a complete **synthetic** example. A product node must include:

- `schema: "sam.commercial.ledger.v1"`, explicit `retailerId`, `sku`, `ean`, `currency: "EUR"`, `period: {start,end}`.
- `costBasis: "NET_PLUS_NONRECOVERABLE_VAT"`, `taxTreatment: "EXPLICIT_VAT_AMOUNTS"`. These state how the exporter supplied amounts; the code does not determine tax law.
- `orderItemIds`: exact unique cohort references from the supplied bol order detail executions. Revenue belongs to this shipped cohort. `returnedUnits` is this cohort's returned quantity, not all returns received in the period from unrelated sales.
- `salesGrossCents`, `outputVatCents`, `refundGrossCents`, `refundVatCents`: integer period totals. Refund VAT cannot exceed original VAT; refunds cannot exceed sales. Zero shipment requires zero revenue/refund values. Partial refunds and units need explicit source reconciliation, not inferred unit pricing.
- `costs`: `{id, category, amountCents}` array of actual allocated period costs. A negative line is an explicit cost credit. IDs are unique over the whole analysis. The exporter must not duplicate the same economic cost under a new ID or allocate it twice across separate cohorts. That invoice-allocation reconciliation is a live-data prerequisite, not proven by unique IDs alone.
- `coverage`: every category from `COST_CATEGORIES` with COMPLETE, PARTIAL or UNKNOWN. UNKNOWN cannot have known lines; use PARTIAL. COMPLETE with no lines is an explicit zero assertion by this source, not absence interpreted as zero. Other unmodelled expenses must be reconciled in `other` before calling the declared scope complete.

A product mapping reference must resolve to a node with exact retailer/SKU/EAN identity. No fuzzy identity matching is performed. Multiple SKUs sharing an EAN in one analysis fail closed until an unambiguous variant contract exists. Shipped items for a selected product cannot be omitted. The library does not page orders itself; scope is the supplied cohort, never the full account. FBB inventory requires explicit BSKU identities; FBR inventory is not inferred.

## Experiments and knowledge

`registerCommercialExperiment` locks an explicit future window, SKU, hypothesis ID from a stored analysis, expected signed contribution range in cents, and minimum positive net-unit sample. Only CONTRIBUTION_CENTS and OBSERVATION_ONLY are accepted. Baseline and outcome windows have equal duration and do not overlap; registration must precede the first Amsterdam business date. There is no scheduler or action executor.

`evaluateCommercialExperiment` uses the matching independently read, closed future cohort. Every outcome read must be after the outcome window. Missing cost coverage or insufficient sample in either cohort gives INCONCLUSIVE. It preserves negative outcomes and midpoint error, not only successes. Expected ranges are supplied by the caller before outcomes; they are not trained forecasts or calibrated statistical intervals. A matched before/after observation is not an A/B test and makes no causal claim.

`learnCommercialLesson` generates its statement from the stored result and revalidated analyses, never caller prose. One experiment yields at most one lesson and one PR37 INFERENCE annotation; both commit atomically. `assembleContext` enriches recalled commercial annotations with their evidence, reconstructs analyses, and omits lessons with invalidated evidence. Feature-off recall omits reserved commercial lesson annotations without touching the new tables. PR37 raw knowledge inspection remains history, not commercial revalidation. Ordinary PR37 recall keeps its existing lexical search and 30-day expiry.

All five new tables use company RLS. Database owners bypass RLS; grants/account mappings must not be writable by an untrusted SQL role. A future runtime tool must enforce authenticated company context before these functions. Provider identity/credential binding needs live staging acceptance. This change does not grant external authority or add any paid dependency, provider writes, browser actions, notifications or new model invocation.
