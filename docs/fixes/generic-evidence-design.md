# Generic verified-evidence slice: design and acceptance

Base: deployed d08b1041c982c88bc43353a6ea4658c77d7a38df. PR54 remains independent.

## Design

1. Stop business-keyword forced routing of the eligible read catalog.
   Preserve explicit caller tool scope and recovery alternatives.
   Existing scope, availability, authority and side-effect checks remain binding.
2. Catalog output contracts describe schema knowledge, units, time and coverage.
   Existing undeclared outputs are explicitly UNKNOWN; never infer missing fields.
3. Model-proposed deliverables describe required fields and evidence gaps. These
   are planning hypotheses, not owner authorization or proof of completion.
4. Add an internal, **unregistered** deterministic relational interpreter. A
   trusted caller loads only same-goal/same-tenant latest-VERIFIED execution
   snapshots through existing RLS. Reviewed extraction contracts define record
   paths/columns; unknown contracts refuse transformation. No arbitrary code,
   network, credentials, SQL from model input or external writes.
5. A finite declarative plan selects/filter/joins/groups/deduplicates records and
   derives decimal values with explicit units. Decimal strings use exact BigInt
   arithmetic; no binary-floating money arithmetic or implicit rounding. Unknown
   units/VAT/time/coverage are retained or block an operation. No business formula
   is embedded. Joins/fan-out, records, operations, input/output sizes and numeric
   precision are bounded. Every output has execution/row lineage and content,
   contract, plan and output hashes; replay must match exactly.
6. Deliverable assessment reports missing columns, unknown semantic metadata and
   incomplete coverage. It does not assert arbitrary natural-language fulfillment.
   Existing monetary review guards remain unchanged. Connecting derived results
   to production review requires a separately reviewed capability/contract release;
   no production capability, migration, permission or integration is enabled here.

## Acceptance matrix

| Case | Evidence and variations | Required proof | Model-quality boundary |
| --- | --- | --- | --- |
| Two-period commerce comparison | Decimal amounts; changed IDs; complete vs missing page; unknown VAT | Exact period sums/difference; lineage; incomplete case blocked | Natural-language fixture goal; model decisions are explicit test doubles |
| Supplier promise versus delivery documents | Join by varying reference; missing supplier/source; unmatched deliveries | Bounded left join; cited mismatch/unmatched rows; missing coverage exposed | Same interpreter, no supplier-specific operator |
| Duplicate-document inventory | Changed IDs; content hashes; pagination incomplete | Group/count inventory; no deletion; citations | Same interpreter, no document-specific solver |
| Isolation | Foreign goal/entity, failed/revoked verification, injected IDs/paths | Loader refuses; no source data escape | Real isolated PostgreSQL |
| Determinism and limits | Replay, permutations, decimals, overflow, many-to-many join | Stable hashes; exact arithmetic; bounded rejection | No live inference |
| Authority | Read-only catalog with write/unknown tools | Safe alternatives visible; writes remain excluded | Synthetic planner adapter captures actual prompt |

Held-out fixture goal text contains no tool names or plan. Test-only scripted
model decisions demonstrate contract plumbing and safety, **not** autonomous
understanding or held-out model generalization. Live model evaluation remains
unauthorized. The fixture plans are outside implementation; no objective-keyword
router or test-answer lookup is allowed in production code.

## Implemented slice and deliberate limits

The internal service recomputes the execution content hash and checks latest
VERIFIED execution/plan hashes before extracting any row. Query scope requires
one goal and legal entity, in addition to the caller's existing RLS. The trusted
caller supplies reviewed extraction contracts; the model cannot supply a schema
that upgrades unknown fields/units/coverage. No production extraction contracts or
transformation tool are registered. Default existing output metadata is UNKNOWN.

Operators: select/rename, scalar filters, decimal add/subtract/multiply/divide,
calendar-day date difference, group sum/count, distinct, bounded left/inner join,
and bounded named intermediate relations. No implicit currency conversion or
rounding. Date arithmetic requires known matching time-zone metadata. Null join
values remain missing; source completeness is retained separately from explicit
filter selections, which require objective-scope review. Unknown VAT is preserved
through arithmetic and fails monetary structural readiness. The three goal
families use these same operations; no business-specific operation exists.

Limits: SQL admission rejects stored results over 250 KB and params/evidence over
16 KB each before transferring rows; 8 input sources, 500 rows/40 columns per relation, 12 operations/relations,
10,000 join comparisons per operation, 16 KB plan, 1 MB aggregate input and 250 KB
per relation/output, 30 integer and 12 decimal digits. Non-terminating division
fails with ROUNDING_REQUIRED. No arbitrary expression, JavaScript, SQL or shell
execution exists. Outputs are internal derived artifacts with citations/hashes,
not automatically accepted reports or learned facts.

The existing reviewer can still request up to four authorized reads per round.
The single-report monetary guard is not removed. Bridging raw tool envelopes,
derived artifacts and final objective review remains a separate reviewed release
step. Autonomous natural-language decomposition, unseen-goal adaptation and live
provider reliability are **not proven** by these scripted model fixtures. This
slice provides generic evidence machinery and removes forced business routing;
it is not a claim that the complete general-agent objective is finished.

Semantic guards: date subtraction dispatches on date operand kinds, never unit labels. Unknown VAT lineage survives dimensionless ratios and downstream scaling. Inner joins record a scope selection and unmatched counts; complete input coverage cannot certify population-wide deliverables after that selection.

## Integration follow-up

The subsequent [verified-evidence integration](verified-evidence-integration.md) connects the internal interpreter to an explicitly opted-in existing work/review composition and persists artifacts in the execution ledger. Production registration remains disabled; the original unregistered-slice results alone do not certify this follow-up.
