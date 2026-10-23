# Normalized connector and monetary evidence slice

Application: `f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8`, tree `2c457d3ea68e7268d4aad61bfc476421f2a43b92`, based on the immutable shared-entry checkpoint `f8b570ac80158303993c3156872c76401ff965f9`.

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

Local working-tree core run passed 14 suites; targeted run passed 9 tests; typecheck passed. These are supplemental, not substitutes for the frozen-commit full report.

Preserved earlier local failures were fixture/harness problems: shared-goal-contract import without its required synthetic DATABASE_URL; invalid empty group keys in a new fixture; an attempted sum with UNKNOWN currency correctly rejected by the interpreter; and a test expecting canonical `0.1` where selection correctly preserved source `0.10`. Fixtures were corrected to valid grouping, selection for unknown units and exact selected representation. Assertions for the safety behavior were retained. No application tests were skipped to obtain a pass.

## Genuine remaining boundaries

- The reviewed bol order schema establishes VAT inclusion, but not currency, VAT rate, refund-adjusted/net revenue or complete requested-day population. Values remain unknown rather than deriving EUR from a marketplace/country or pretending orders are paid net revenue.
- Native Drive list metadata and a connected exact-query page chain do not establish supplier promise semantics, document content identity or a transactional snapshot. The default Google MCP wrapper still lacks a reviewed structured semantic output contract. Legacy Gmail readback verifies IDs, insufficient for new body or exhaustive-list guarantees.
- Monetary request classification retains the existing guard; this slice does not claim arbitrary natural-language obligation refinement or autonomous model evaluation.
- No trusted owner-signing mechanism/public-key provenance, eligible existing synthetic principal/profile or deployed coordinator guard has been established through available operator interfaces. QNAN is operational and ineligible for synthetic enrollment. A live workflow is unverified, not proven impossible or a Render restriction. See the separate operator plan at evidence commit `35f27f239e061375b90242e6e7f714ec916bfd8b`, `docs/evidence/shared-goal-path/BOUNDED-LIVE-OPERATOR-PLAN.md`.
- An authorized operator must verify/reuse the eligible scope and trusted organizational approval mechanism, or propose its exact custody/provenance/rotation/revocation setup for specific approval. The current create/sign/restart ceremony has not been demonstrated executable inside its five-minute deadline. A future single-use launch approval before atomically starting the unchanged clock is a proposal, not implemented authorization or permission to bypass existing interlocks.

No credentials, grants, security settings, time/spending limits, model selection, infrastructure, production configuration or production data were changed. Synthetic fixtures and signed fixture traces establish implementation behavior only.
