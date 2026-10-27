# SAM business report — bounded continuation, 2026-10-27

## Exact scope and source

Code checkpoint: b02f35a7bbef8769457666a4184cd1158b423e44.
Code tree: 4a0c67f2d9e65f92348036c6d995ab8d73d52da2.
Base: 8ebbe5ab5caf53a870cd252441e6199a08b3b5af, independently observed as
the current live source of BOTH services behind the working SAM connection:

| Service | Resource | Existing deployment |
| --- | --- | --- |
| sam-mcp | srv-db37vbvlk1mc739o0b7g | dep-dbf9rc67bikc73cndrpg |
| sam-runtime | srv-db37vbvlk1mc739o0b70 | dep-dbdg2d0ae00c7382vba0 |

Both are running, configured branch deploy/sam-free-trial-ready, autoDeploy=no.
The runtime's read-only Shell probe confirmed production=true,
SAM_PRODUCTION_BUNDLE_MODULE=apps/production/src/defaultBundleModule.ts,
SAM_COMPOSITION_MODULE=apps/runtime/src/productionCompositionModule.ts.
Existing bol credential pair is present (boolean check only). No Hermes
environment variable or /etc/secrets/sam-hermes-test.json exists on sam-runtime.
No credential value was read or printed.

Working SAM verification-contract inventory returned 94 records, none for
Hermes. The analyst verification contract therefore requires an operator insert
into the EXISTING verification_contracts table before enabled runtime startup.
No table, migration, role, grant, credential, window or service was changed.

The frozen recovery branch remains at 29d36e16fa91c323e2b86b9812a696319b18473a.
No PR67/main/PR83 branch was updated. No Modal/publisher/isolated-code feature
was expanded. No SUM/model-lock acceptance or frozen 24-case suite was rerun.

## IMPLEMENTED

- sam_submit_goal advertises acceptance_contract and analysis_request; handler
  validates them and forwards actor/company/context to the existing dispatcher.
  Generic contracts use the existing validate/encodeGoalAcceptance mechanism.
- The bounded report request builds its substantive contract in trusted SAM
  code BEFORE execution. An explicitly supplied different contract is refused.
  This is not a model-generated success condition or an empty contract.
- Admission uses one transaction for goal/contract/audit/plan/delegation; no NEW
  goal is exposed to the general model planner. The existing dependency graph
  waits for the verified bol_sales_stock_report source before Hermes executes.
- Exact request: QNAN entity 73aa81c6-3a23-4369-9408-8bea0956d399,
  startDate=endDate=2026-10-26, Europe/Amsterdam. Dates are never inferred as
  yesterday during continuation.
- Reuses bol_sales_stock_report, its pagination, deduplication, placement-date
  filtering and independent full readback. Added optional source-unit-price
  arithmetic in integer hundredths and explicit missing-price unit coverage.
  Totals with missing prices stay unknown, while known subtotals remain labelled.
  Currency/tax basis, commissions, returns and net profit are not established by
  this collector and remain null, never silently zero or claimed as net profit.
- Reused client.ts from PR67 unchanged, withHermesCandidate and existing durable
  queue receipts, leases, fencing, single-flight, model lock, free Nous selection
  and empty tool profile. Added trusted work context to ordinary tool dispatch.
  No new agent engine, connector, provider, service or ledger.
- Hermes receives only selected aggregate fields and source execution/hash
  references. No customer identity/address/email/order-id, bol key or repository
  scope. Up to 30 product rows are sent; subset coverage is explicit. SAM retains
  the full collected product report.
- Hermes supplies actual interpretation JSON; figures in observations are copied
  by SAM from checked references. Numeric narrative/invented references/malformed
  output are rejected. Narrative is MODEL_INFERENCE; verification does not
  establish independent truth of prose. Source facts have their own readback.
- Verification binds company/goal/plan/queue, the original task hash, full
  source hash, returned candidate, free served runtime, run ID and stored receipt.
  The report is persisted in the same goal's execution result and is retrievable
  through the existing SAM goal timeline/execution reads.
- Activation is opt-in, single task, fixed company and at most one hour. General
  model planning/replanning excludes this bounded domain; no paid-model fallback.
  An expired admission preserves the ordinary SAM bundle on restart.
- MCP dispatch-only registration needs no Hermes credential. The existing SAM
  runtime alone needs its existing Hermes private configuration delivered safely.

## LOCAL_VERIFIED

TypeScript: exit 0. Changed-scope acceptance/regressions: 14/14, zero failed,
skipped or cancelled, exit 0. See SAM-HERMES-BUSINESS-VALIDATION-2026-10-27.log.
Node 24.22.1, PGlite 0.5.10 in a separate private test dependency directory;
root package/lock unchanged. Real local MCP HTTP and actual SAM handler/kernel
SQL; bol/Hermes transport responses are synthetic. Covers contract persistence,
invalid/empty contract denial, owner/company checks, source dependencies, task
ceiling, money/unknown limits, receipt/source/task-hash tampering, no private
customer data in model input, and closed/credential-free registration paths.

NATIVE_DB_VERIFIED: not claimed. PGlite is not a native multi-session PostgreSQL
server and does not prove production role/RLS/concurrency behavior. Earlier
PR83 or storage results are not acceptance for this change.

Intermediate local failures were corrected without weakening acceptance:
schema brace syntax, CJS test top-level await, local fixture SELECT rowCount
mapping and inferred aggregate/result types. No independent live test was edited.

## LIVE status and single proposed activation (NOT authorized/performed)

No live sales/Hermes task was submitted after this repair: the working connector
still points to the old code. No live report or new Hermes run receipt exists.
No current authentication failure was proven, so no replacement token is needed
or requested. No new paid operation was initiated.

One explicit operational approval is required for the following bounded set:

1. Make the reviewed source available on a NEW delivery branch with [skip ci];
   do not push over main, #67, #83 or the existing deploy branch. Deploy ONLY
   this immutable reviewed version to sam-mcp and sam-runtime, with automatic
   deploy off. If using a temporary service branch setting, name and record it;
   this approval must cover that setting. Do not merge main or trigger Actions.
2. Reuse the existing SAM→Hermes private configuration on sam-runtime only,
   at /etc/secrets/sam-hermes-test.json, using a secure operator path. Do not
   reveal/extract it into logs/chat/Git/model input, create a token, expose bol
   keys to Hermes, or give the credential to MCP.
3. Register exactly HERMES_VERIFICATION_CONTRACTS from hermesDataAnalysis.ts in
   the existing tenant verification_contracts, using existing operator authority.
   INSERT only if absent; verify the existing row on conflict, never overwrite
   unknown metadata. No DDL/grants/shared migration/PR83 changes. Production
   runtime startup only validates this record; it never provisions it.
4. On BOTH services set the existing-feature flag and QNAN entity plus ONE
   explicit activatedAt/expiresAt interval (maximum 60 minutes), max task count
   is hard-coded to one. MCP mode dispatch-only; runtime mode execute.
   SAM_HERMES_TEST_CONFIG_PATH is needed on runtime only. Preserve normal
   NODE_ENV, tenant/auth bindings, DeepSeek configuration and all other services.
5. Refresh the existing connector tool definitions without changing OAuth scope,
   submit the prepared fixed-period request once, inspect source/reconciliation
   and free-model receipts, and retrieve the stored report from that same goal.

Budget: existing Render plans and approved free Nous model only; no new resource,
plan/credit upgrade or new spend authorization. Verify included deployment/build
capacity before a potentially metered build; stop if an extra charge is required.
The 60-minute application admission is not a renewal of any PostgreSQL role or
old financial approval. No sam-isolated-test resume is necessary.

Rollback/cleanup: close new analysis admission. If the bounded goal is still
nonterminal, fence ONLY that goal using SAM's existing state transition to
FAILED (operator_stopped_business_trial), let its existing Hermes client request
stop and retain any uncertain receipt. Never roll back to the old general
planner with this goal left NEW/REPLANNING, because the old planner lacks the
new domain exclusion. Then restore BOTH services to exact baseline 8ebbe5a and
their original branch/settings, autoDeploy=no. Retain all source/goal/queue/
execution/verification/receipt rows and the one metadata contract; do not delete
or reset history, rotate a key, terminate unrelated sessions or change grants.

Success: a real SAM request for the fixed company/date produces complete or
explicitly limited source coverage, code-computed figures, an actual free Hermes
run linked by task/source hashes, and a stored report read back from the same SAM
goal. A mock, metadata inventory, code deployment or Hermes prose alone is not
success. On any failure, report the exact boundary and do not silently rerun.

Next: request the single bounded operational approval above. Until then, retain
this package locally and as deliverable attachments; do not deploy/enable or
repeat successful local checks without a new change or concrete concern.
