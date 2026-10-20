# Read-only bol sales and stock report

`bol_sales_stock_report` accepts concrete inclusive `startDate` and `endDate`
in Europe/Amsterdam, within the preceding 31 days. Today must be excluded.
The production planner selects this executable capability for read-only bol
analysis/report objectives, rather than treating prose as an analysis step.

The collector checks the connected retailer identity, enumerates every exact
latest-change day from the start through collection day, and follows every
order and FBB inventory page to an empty response. It deduplicates order IDs,
fetches complete order details and filters the placement date in Amsterdam.
The report groups quantities by EAN and fulfilment, subtracts cancellations,
and calculates current stock coverage from that period's daily net ordered
units. FBR stock is read only for sold offers; ambiguous shared stock is unknown.
Candidates require known stock, positive demand and less than seven days'
coverage. The report returns up to three; it never invents missing candidates.

This is an operational quantities/replenishment report, not a profit or settled
revenue statement. Returns, product costs and fees are not reconciled. Missing
FBB inventory rows and ambiguous FBR stock remain unknown, never zero.
No offer export, writes, purchases or customer communication is performed.
Customer details are discarded; retained read evidence contains tool names,
parameters, response hashes and pagination counts, not addresses or names.

Each collection has a four-minute deadline, 100-page limit per collection and
1,500-read total limit. An error, malformed/repeated page or missing required
quantity fails the work rather than accepting a partial report. The bol-enabled
bundle uses at least a five-minute worker lease to exceed this deadline; restart
recovery for all work in that bundle may therefore wait five minutes for a lease.
Verification independently rereads and recomputes the entire business report.
Source changes produce INCONCLUSIVE rather than a false VERIFIED result. The API
has no atomic snapshot; current-day movement remains a stated data limitation.

Validation:

- `node --import tsx --test tests/phase22/bol_analysis.ts`
- `node --import tsx tests/phase22/bol_analysis_bridge.ts`
- `npm run test:phase17:bol-sam`
- Existing runtime recovery, goal planner and tick-containment regressions.

The raw upstream tool inventory remains 76. SAM adds one read-only report,
making 77 bol capabilities and 77 exposed tools; the 23 approval-gated raw
capabilities retain their authority classes. No database migrations or new
environment settings are required.
