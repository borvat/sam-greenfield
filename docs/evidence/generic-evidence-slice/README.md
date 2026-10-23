# Generic evidence slice: isolated acceptance

Base: deployed `8ebbe5ab5caf53a870cd252441e6199a08b3b5af`, merged without conflicts into the generic branch.
Application head: `9da55fc3d075a1776acf3162397c8b1f17e602b2`.
Draft PR: https://github.com/borvat/sam-greenfield/pull/55
Design/acceptance matrix: [generic-evidence-design](../../fixes/generic-evidence-design.md).
PR54 citation/input fixes are included through the deployment-base merge.

## Final result

**PASS 59/59** on clean exact application commit
`9da55fc3d075a1776acf3162397c8b1f17e602b2`, tree
`7812b9291e67c71106ff8e2499aca3bdab94f1ef`.
Run: 2026-10-23 06:42:28.610–06:55:32.671 UTC.
Pinned runtime: Node 22.23.4, PostgreSQL 15.19. Regression: 49/49;
core reliability: 11/11 files. All 59 stages, source integrity and cleanup PASS.
Artifact SHA256SUMS verification PASS. See [full report](full/report.md),
[machine report](full/report.json), [logs](full/logs), and [checksums](full/SHA256SUMS).

The [next integration slice](NEXT-SLICE.md) is a proposal with measurable acceptance,
not implemented or production-activated by this PR.

## Reproduction

```sh
npm run typecheck
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/core/evidenceTransforms.ts
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/phase22/planner_scope.ts
node /tmp/sam-generic-harness/verify-full.cjs --output /tmp/sam-generic-full-v5 > /tmp/sam-generic-full-v5.log 2>&1
```

Credentials shown are disposable fixtures. The external runner differs from the
repository runner only in checkout/pins paths and TCP authenticated SELECT 1
readiness, preserving retry/time bounds; see readiness.patch. Application tests
are not removed or skipped. The obsolete phase22 bol-analysis assertion requiring
only the fixed report was replaced with an assertion that both eligible read
alternatives remain visible. Its execution/verification assertions remain intact.
The unchanged explicit-tool-scope tests (5/5) pass.

Two earlier acceptance runs were deliberately interrupted for correctness fixes:
`d5c3ad2` to keep literal UNKNOWN units/VAT/time zones unknown; `030ac40` to bound
stored result/params/evidence bytes at SQL admission before transfer. Their
unmodified reports/logs are retained under interrupted-first/second, including
exit 143 and successful cleanup. They are not passes or unexplained application
failures. Release evidence must use only the final exact application commit.

## What the three goal fixtures prove

The goal texts contain no tool names or plans. Same implementation handles:
- Two-period decimal grouping, bounded intermediate relations, join and difference
  (0.10 + 0.20 = 0.3; 1.05 - 0.3 = 0.75), with cited raw rows and unknown VAT.
- Supplier references joined to delivery dates with calendar-day differences,
  changed IDs, missing/unmatched records and partial-page coverage.
- Duplicate-document groups/counts with changed IDs and incomplete pagination,
  without deletion or any side-effect operation.

Tests verify deterministic hashes/replay, source tamper detection, latest FAILED
verification/revocation refusal, wrong goal/entity refusal, explicit UNKNOWN output
schemas, invalid paths, unknown units/time zones, exact decimal/rounding/zero
boundaries, output and join limits, no eval and no external executor calls.
The source loader uses actual isolated PostgreSQL and existing kernel execution
and independent verification records. Scope predicates supplement existing RLS.

**These decisions are scripted TEST DOUBLES.** They prove deterministic contract
plumbing and safety, not autonomous language understanding, actual model tool
selection, adaptive live planning or held-out generalization. No live model calls
were authorized or performed. Every derived row carries execution/verification/
row/source-hash citations; business claims still require objective review.

## Production boundaries and unfinished work

The interpreter is an internal API, not registered in any production capability
bundle. Trusted extraction contracts are supplied by the caller; no production
contracts are invented or installed. Model operations cannot supply schemas that
upgrade unknown units, VAT, time or coverage. No migration, permissions, external
integration, budget reset or goal replay is enabled. Existing reviewer follow-up
reads and monetary guards are unchanged.

The planner/catalog changes expose safe alternatives and explicit unknown outputs;
this does not prove output schema completeness or model-quality improvement.
Derived artifact integration into production report review, reviewed output
contracts, and independently authorized live evaluation remain unfinished. No
claim is made that the complete general-agent objective is achieved by this slice.

This separate evidence branch is documentation/logs only. GitHub Actions remains
billing-blocked. No production data/model access, merge or deployment occurred.

The third run on ce4356c was deliberately interrupted after independent semantic review found date dispatch, VAT ratio lineage, and inner-join scope defects. Its evaluation-budget stage exited 143; cleanup passed. The untouched report is retained under interrupted-third and is superseded, not readiness evidence. Corrected head 32ae2ac adds regressions for all three, including absent VAT and both multiplication operand orders.

Separate capability gap: repository BolOrderDetailAdapter forwards getOrder(order_id) as raw result.data; the client returns Promise<any>. Its current catalog does not declare guaranteed monetary fields, currency or VAT semantics. This does not establish that the upstream API lacks such fields. Reviewed extraction/output contracts and authorized evidence are still needed; no live read or financial solver was added.

The fourth run on 32ae2ac passed the new semantic regressions but was interrupted after the parent required integration of newly deployed PR54. Its logs are retained under interrupted-fourth; it cannot prove combined compatibility. Final acceptance uses combined exact head 9da55fc (merge of semantic fix 32ae2ac and deployed 8ebbe5ab).
