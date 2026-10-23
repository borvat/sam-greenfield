# Normalized connector and monetary evidence slice

Application: `cd5b76aa73dabdf9b64e6a63a4392657cdbb917a`, tree `54671761dc392130fb9dcc83f5f357d23766a08d`, based on the immutable shared-entry checkpoint `f8b570ac80158303993c3156872c76401ff965f9`.

This separate candidate supplies reviewed, opt-in normalization for the existing native bol order-detail and legacy Drive search response shapes, and a shared completion contract for raw structured reports and exact replayed derived monetary evidence. It does not register capabilities, activate extraction contracts, rebind Google MCP wrappers, add permissions, access production or call providers. Application details and official schema links are in [the design](../../../fixes/normalized-business-evidence.md).

## Required behavior and evidence

| Contract | Positive case | Failure cases retained |
| --- | --- | --- |
| Order normalization | Real documented response shape; item/order identity, exact canonical parsed decimal, VAT-inclusive customer price meaning, hash-bound provenance | Currency unknown; optional field null; unsafe/sub-cent/exponent/string values rejected; repeated row identity rejected; no daily-sales completeness |
| Native Drive collection | Same authorized query and page token in source and independent readback; false incompleteSearch; connected pages with terminal cursor | Missing/true incompleteSearch, missing page, query mismatch; no metadata-to-content inference |
| Monetary completion | Restricted-role ordinary continuation, persisted bound obligation, exact replayed customer-charge sum and row/field citations can complete without a preassembled report | Unknown currency/VAT, wrong period, commission/settlement or unit-price meanings cannot stand in for sales; revocation/citation/tenant guards retained |
| Existing generic path | Full acceptance includes shared discovery, derive, specialist, verification, capture and restart | No live model-quality claim; deliberate incomplete captures remain incomplete |

The new contracts are explicitly separate from the default registry. Old verified Drive results lacking incomplete_search may fail a new independent readback comparison; the candidate does not rewrite old execution evidence or silently infer search completeness. Opt-in schema activation requires its own reviewed release selection.

## Diagnostic history

Initial local working-tree core run passed 14 suites; targeted run passed 9 tests; typecheck passed. These are supplemental, not substitutes for the frozen-commit full report.

Preserved earlier local failures were fixture/harness problems: shared-goal-contract import without its required synthetic DATABASE_URL; invalid empty group keys in a new fixture; an attempted sum with UNKNOWN currency correctly rejected by the interpreter; and a test expecting canonical `0.1` where selection correctly preserved source `0.10`. Fixtures were corrected to valid grouping, selection for unknown units and exact selected representation. Assertions for the safety behavior were retained. No application tests were skipped to obtain a pass.

## Genuine remaining boundaries

- The reviewed bol order schema establishes VAT inclusion, but not currency, VAT rate, refund-adjusted/net revenue or complete requested-day population. Values remain unknown rather than deriving EUR from a marketplace/country or pretending orders are paid net revenue.
- Native Drive list metadata and a connected exact-query page chain do not establish supplier promise semantics, document content identity or a transactional snapshot. The default Google MCP wrapper still lacks a reviewed structured semantic output contract. Legacy Gmail readback verifies IDs, insufficient for new body or exhaustive-list guarantees.
- Monetary request classification retains the existing guard; this slice does not claim arbitrary natural-language obligation refinement or autonomous model evaluation.
- No trusted owner-signing mechanism/public-key provenance, eligible existing synthetic principal/profile or deployed coordinator guard has been established through available operator interfaces. QNAN is operational and ineligible for synthetic enrollment. A live workflow is unverified, not proven impossible or a Render restriction. See the separate operator plan at evidence commit `35f27f239e061375b90242e6e7f714ec916bfd8b`, `docs/evidence/shared-goal-path/BOUNDED-LIVE-OPERATOR-PLAN.md`.
- An authorized operator must verify/reuse the eligible scope and trusted organizational approval mechanism, or propose its exact custody/provenance/rotation/revocation setup for specific approval. The current create/sign/restart ceremony has not been demonstrated executable inside its five-minute deadline. A future single-use launch approval before atomically starting the unchanged clock is a proposal, not implemented authorization or permission to bypass existing interlocks.

No credentials, grants, security settings, time/spending limits, model selection, infrastructure, production configuration or production data were changed. Synthetic fixtures and signed fixture traces establish implementation behavior only.

The final follow-up corrects model input guidance to recognize already replayed eligible monetary evidence. The same source must still be cited with validated monetary row/field claims for completion. A nominal-case prompt assertion reproduced the old misleading limitation; final integration passes that assertion and rejects a report citing only a non-monetary field. Superseded diagnostics are preserved in ../candidate-f2123ea/.

Repeated normalized row identities across source observations are now conservatively ambiguous. A regression unions two independent reads of the same item and sums two plus two: arithmetic remains four, but scope fulfillment rejects it rather than treating the set of identities as proof of a single-item quantity. Unknowns and contradictory observations require disambiguation; no automatic deduplication is invented. The prompt-input correction remains. Both superseded full runs preserve their interruption and successful cleanup, not false pass labels.
