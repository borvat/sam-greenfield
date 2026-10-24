# Ordinary root lifecycle correction acceptance

Application source: `bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0`.
Previous application checkpoint: `172a990d6d84eaa917b6974316180d349c3c73ee`.
The previous 60/60 run is preserved but superseded as release evidence: independent review identified four correctness gaps it did not cover.

## Final exact-head result

**60/60 stages PASS**, including 49/49 regression suites and 31/31 core suites.
Started 2026-10-24T00:26:40.825Z; completed 2026-10-24T00:48:28.142Z.
[Full report](acceptance/report.md), [structured commands/results](acceptance/report.json),
[source manifest](acceptance/metadata/source-files.json), [artifact hashes](acceptance/SHA256SUMS).
Runtime: Node 22.23.4 and PostgreSQL 15.19.
Later publication commits change evidence/documentation only.

## Coherent correction

1. Root closure: legitimate state-machine terminal/waiting transitions commit atomically. Admission tracks the exact inserted outbox receipt privately by client and PostgreSQL transaction identity. Prior committed events, later outbox updates, rolled-back savepoint receipts, and cancelled/closed late writes do not grant authority. Closing a failed root fences remaining authorized read work and preserves per-obligation incomplete reporting when a plan exists. Planning exhaustion before any plan persists its failure state/diagnostics without inventing a plan/report.
2. Review lifecycle: only an authenticated previously admitted waiting root with its unchanged allowance, valid remaining review budget and due database timestamp resumes directly into VERIFYING. The same plan and verified executions are reused. Unsupported continuation or expiry produces a terminal incomplete outcome. Cancellation does not resume. Existing waiting goals, including a submission marker without an allowance, are not adopted.
3. Schema semantics: compaction visits JSON Schema nodes, never literal const/annotation objects or property-name maps. AJV equivalence regressions cover consts, repeated properties, references, patterns and negation, plus the full derive grammar.
4. Local read ceilings: startup rejects specialist tool-count, tool-call-time or elapsed-time ceilings narrower than the enforced shared root limit. Every readback is charged to the root. This is explicit fail-closed compatibility admission, not a claim that local readback ledger entries were added. The reported defect did not establish root overspending.

## Focused evidence and limitations

`diagnostics/` preserves the reproduced old PostgreSQL commit rejection and object-valued const mismatch. It also preserves the development fixture's UUID/text parameter error, corrected with explicit fixture casts; no application assertion was removed. Focused development results are supplementary, not a substitute for the frozen-head full run.

The core traces include actual authenticated MCP submission, the ordinary production composition module/runtime service, restricted-role execution, two reasoning specialists, deterministic verified derivation, reports, concurrent restart, cancellation, unknown semantics and revocation. Model decisions and connector data remain synthetic. This establishes integration/safety behavior, not live autonomy or real commercial-data completeness.

The external readiness patch still changes only the harness root/import and TCP readiness probe. Production deadlines, models, permissions and accounting ceilings were not enlarged. The old evaluation launcher and authorization gates remain unchanged.

The minimal existing-service setup proposal remains `docs/ordinary-general-agent.md`: approved specialist migrations/profile rights for the existing runtime identity, exact verification registrations, positive reviewed prices and explicit opt-in configuration. No new signer, principal, host or evaluation coordinator is required. No production writes, activation, hosted deployment or paid model calls occurred. Live evaluation and setup remain pending separate reviewed authorization; unknown connector coverage/currency/VAT/content semantics remain honest blockers.
