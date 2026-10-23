# Reviewed source mappings and next evaluation boundary

These contracts are code only. Production startup does not install the transform
capability or these mappings. Existing services, repository and database suffice.
No new grants, policies, triggers, credentials, provider or model configuration.

## Mapping evidence and limits

| Existing capability | Checked-in response path | Guarantees and unknowns |
| --- | --- | --- |
| bol_get_order | Both legacy adapter and default bolMcpBundle wrap orderItems under data | Required item identity; safe integer quantities only; no declared price, currency or VAT; single order, period and population coverage unknown |
| bol_sales_stock_report | buildBolAnalysis report.products | Integer quantities/stock; source period, retailer identity and limitations retained; sold products are not all catalog items; no money or returns proof |
| drive_search / drive_get_metadata | Legacy Drive adapters files / file | Required ID and optional metadata; no content hashes; pagination/collection coverage unknown |
| gmail_list_messages / gmail_get_metadata | Legacy Gmail adapters messages / root | Required message identity only; body, promise and delivery semantics unknown |
| finance_reconciliation_preview | preview.matched | Exact reference matches only; unmatched population excluded, no financial equivalence claim |

Default Google wiring is samGoogleBundle, with google_mcp_* capabilities and MCP
text/content responses. Legacy Drive/Gmail contracts MUST NOT be rebound to those
IDs or used to activate an alternative integration. No stable structured document
or message record schema is declared by that wrapper, so those mappings remain
unavailable there. googleReadEvidence retains verified artifact hashes/text, but
that does not establish document identity, promise/delivery extraction, or complete
pagination. A reviewed versioned parser/extraction contract with representative
checked-in response fixtures is still needed. Unknown schemas remain explicit.

The bol wrapper's order response is not a reviewed monetary schema. This does not
mean the upstream API lacks money fields. Monetary interpretation requires actual
field, currency, VAT, period and coverage guarantees before financial completion.
The quantity report cannot establish EUR revenue; empty invoices cannot fill it.
No business routing, special goal prompt, inferred prices or task-specific solver
is introduced. Missing required identities reject extraction. Optional missing
values remain null; unsafe/fractional numeric quantities reject exact-integer
conversion. Period and identity context are source-attributed, never promoted to
proof of requested scope. Every mapping conservatively retains unknown coverage.

## Prospective bounded live acceptance (not authorized or performed)

Routine code preparation is separate from production activation. Freeze a reviewed
application commit and exact contract hashes. Activation would require a separately
approved composition change calling withVerifiedEvidence with only present,
authorized capability IDs and reviewed contracts; synchronize the exported
DERIVED_VERIFICATION_CONTRACT through the existing verification-contract mechanism.
Any capability scope binding must be reviewed explicitly; this patch creates none.
No privilege expansion is needed for the execution/report storage path. Derived
findings are intentionally excluded from persistent knowledge capture under the
existing SOURCE_FACT-only profile. Broader learning semantics need separate review.

Before live evaluation, require an enforced evaluation-wide gateway ceiling of
24 calls total, at most 8 per goal, using the existing provider/model and lower of
existing per-call cost ceilings and an explicitly approved evaluation spend limit.
These are proposed upper bounds, not a claim that current per-plan counters enforce
a cross-goal ceiling. A reviewed evaluation gate must count and refuse calls before
sending them; if no such gate is approved/configured, live evaluation is blocked.
Existing 30-second planning and 40-second review deadlines and smaller runtime
limits still apply. No budget resets, old-goal replay, automatic unrelated retries
or paid calls are authorized by this document.

Run three previously unseen natural-language goals sequentially on that same fixed
version: two-period comparison, promises versus delivery documents, and duplicate
inventory without deletion. Do not supply tool names, operations or hidden plans.
Vary identifiers, pages and one unavailable source. Require model-chosen reads and
operations, reproducible decimal output and exact citations, no duplicate source
work on continuation, correct tenant scope, and explicit blockers for absent schema,
coverage or money/VAT. With current default Google schema gaps, an honest blocker
is acceptable safety behavior but is NOT completion of the general-agent objective.
Synthetic scripted decisions prove constraints and replay, not autonomous quality.

Stop on the first authority, lineage, budget or false-completion failure. Rollback
means removing the explicit capability composition/availability binding through the
normal reviewed release path, retaining immutable reports and executions; no data
erasure, schema rollback or budget reset. Parent coordinates any approved release
and live run. This child does neither.
