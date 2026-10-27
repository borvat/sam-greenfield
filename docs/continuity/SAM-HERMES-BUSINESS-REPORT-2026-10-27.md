# SAM business report — bounded continuation, 2026-10-27

## Intake repair checkpoint — 2026-10-27; local only, no deployment

Base: 92c6fe301569777e0e78b59b63ac1999ab4a0461. Tested code commit:
d1e74027c9f43d7aa2401ce8c08968a611766253, local branch
work/hermes-intake-fix-20261027-92c6. The subsequent documentation-only commit
is recorded as delivery HEAD in the intake package manifest. No remote push.

IMPLEMENTED / LOCAL_VERIFIED: close the incomplete typed-analysis admission gap.
The actual connected caller declaration still exposes sam_submit_goal with only
objective and optional legal_entity_id. Source 92c6fe3 already advertises all
four fields. An unmodified source-92 control over the actual SDK HTTP transport
preserves acceptance_contract and analysis_request through tool registry, handler,
dispatcher and stored bounded goal when sent. A MODELLED two-key caller projection
loses the two fields before HTTP and reproduces the incident's generic domain /
sam.read_report.v1. The original live ingress was not captured: the exact
closed-source filtering component is NOT established. This is a boundary finding,
not a claim that the controlled projection observes ChatGPT internals.

Separately, a red test against source 92 proves an application fail-open: an
analyst acceptance contract without analysis_request creates a generic goal with
9 SQL queries. The repair refuses this partial typed request before any query.
When BOTH optional fields disappear, an ordinary sam_submit_goal request is
indistinguishable from a generic objective. To preserve ordinary SAM goals, the
bounded caller now uses sam_submit_data_analysis: a thin tool identity over the
SAME registry authorization, handler and production dispatcher, with all four
fields required. Identity preserves bounded intent even when both fields vanish.
No prose inference or generic fallback is allowed. The legacy generic tool still
accepts ordinary objectives; complete typed requests still reach the bounded path.
Other Hermes agent roles are not reclassified as data analysis.

assertDataAnalysisSubmission checks at handler AND dispatcher before SQL/provider
lookup. Owner authorization, actor/company scope, original contract validation,
closed window, task ceiling and existing bol/Hermes implementation remain intact.
prepareDataAnalysisCall requires the dedicated tool in the current catalog and
all four required properties, otherwise ANALYSIS_CONNECTOR_SCHEMA_STALE. It uses
the existing trusted builder BEFORE execution. The prepared original nine-constraint
contract is unchanged; generated call equality was checked without tools/call.
MCP metadata version is 1.0.2; version/description alone is not a transport fix.

Changed source: apps/chatgpt-tools/src/actionTools.ts, types.ts;
apps/mcp/src/server.ts; apps/production/src/dataAnalysisContract.ts, dispatcher.ts.
Targeted tests: tests/isolated/hermes_business_report.ts. No collector, source
arithmetic, model adapter, SQL, PR83, isolation or publisher source changed.

Evidence (all logs included in SAM-Hermes-intake-fix-20261027.zip):
- intake-before-fix.log: one red reproduction, exit 1 EXPECTED; fallback/9 queries.
- intake-intermediate.log: exit 1; assertion initially included SDK-added _meta;
  corrected to compare tool name and exact original arguments at each boundary.
- intake-after-fix.log: 8/8 selected tests, 0 fail/skip/cancel, exit 0.
- intake-typecheck.log: npx tsc --noEmit, exit 0 (npm proxy-config warning only).
- intake-baseline-control.log: 2/2 isolated HTTP controls on original 92, exit 0;
  probe source included separately, not a change to the baseline worktree source.
- local-http-catalog.json: corrected SDK tools/list output; no tools/call.
- prepared-call-NOT-SUBMITTED.json: current-catalog trusted preparation only;
  original acceptance deep-equal, zero dispatcher or model invocations.

Green command, using existing dependencies; no install:
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic
SAM_TEST_PGLITE_MODULE=<existing private testdeps>/@electric-sql/pglite/dist/index.cjs
SAM_REQUIRE_GOAL_ACCEPTANCE=1 node --import tsx --test
--test-name-pattern='^intake:|^MCP schema and actual HTTP|^bounded source|^sam_submit_goal is exposed'
tests/isolated/hermes_business_report.ts tests/phase22/submit_goal_surface.ts

Green HTTP traces use synthetic actor/company and real MCP SDK serialization.
Acceptance hash at prepared/wire/handler/dispatcher/stored boundaries:
ad51ff53f36e18ed621cebd7ad6f727566a738deeae30a04c48ffbb4c38aed27.
Request hash at prepared/wire/handler/dispatcher boundaries:
f32e6515a97ec1feb70f717918ed71c7894cd6a2e97e9b25b6e7fbcf0c137e1e.
Queued source parameters also match. Both tool routes preserve exact payloads.
Deletion of either field, both fields, objective or company is tested AFTER SDK
client validation by changing actual outgoing RPC arguments; server rejects the
request. Direct-handler and direct-dispatcher bypass checks also reject. Zero SQL
queries, goals, work or model calls in rejected cases. Owner/company denial and
contract mismatch pass. Ordinary goals and other Hermes roles remain compatible.
PGlite is LOCAL_VERIFIED, NOT NATIVE_DB_VERIFIED. These tests do not run a worker,
read live bol, invoke Hermes, prove billing or produce a business report. The
frozen 24-case suite, prior full suites and PR83 tests were not repeated.

Official metadata-refresh mechanism was checked using the OpenAI Docs skill:
https://developers.openai.com/plugins/deploy/connect-chatgpt
For the existing Sam Mcp Reder connection, Settings > Plugins > Sam Mcp Reder >
"تحديث الأدوات" (Update tools / Refresh) is present. Verified endpoint:
https://sam-mcp-cn7q.onrender.com/mcp, OAuth, DEVELOPMENT, version id
asdk_app_v_6ad5b85978c081918fe66a693a64d0e7.
ONE authorized metadata refresh was attempted; visible result:
"تعذّر تحديث التطبيق. حاول مرة أخرى". No new schema import is claimed. No
reconnect, token, OAuth, permission or scope change; no automatic retry. Even a
successful refresh against the current 8eb baseline cannot import unpublished
code. After future publication, Refresh and a new conversation are required;
verify the actual caller schema rather than relying on the page label/version.

LIVE_VERIFIED this batch is limited to read-only service/deployment identity:
- sam-runtime srv-db37vbvlk1mc739o0b70 / dep-dbfvaeec6qcc73dqefog.
- sam-mcp srv-db37vbvlk1mc739o0b7g / dep-dbfvan0m7kps73atk810.
Both latest deployments remain LIVE at full 8ebbe5ab5caf53a870cd252441e6199a08b3b5af,
branch deploy/sam-free-trial-ready, autoDeploy=no/off, in Sam's workspace
tea-db35rbflot8c739g8rhg. No config/deployment was changed. The documented closure
(enabled=0, expiry 00:49:55.666Z) was left intact; no new native flag read was
performed in this repair batch. Existing verification row and runtime secret
remain untouched. No DDL, live goal, model, worker or paid resource was launched.
No operations started by this repair remain running; local HTTP servers closed.

DEPLOYMENT REVIEW ONLY — NOT AUTHORIZED OR EXECUTED IN THIS BATCH:
1. Restore the bundle/patch and verify manifest final tree. Recheck service
   identities, branch heads, autoDeploy=no and workflow behavior. Publish to a
   unique delivery branch only after authorization; never change #67/main/#83.
2. On approval, target that exact content on sam-mcp and sam-runtime, retaining
   current build/start commands, closed analysis flags, dispatch-only MCP and
   execute runtime. Keep the existing private config and contract; no DDL,
   activation, model execution or business submission. Record actual published
   SHA/tree and deployments; do not redeploy a config-triggered build twice.
3. Verify health, tools/list four sam_submit_goal properties, and dedicated
   sam_submit_data_analysis with ALL FOUR required properties. Use the official
   connection Update tools once, then a new conversation; verify actual callable
   declaration has both typed fields. If stale/refresh fails, STOP; no fallback,
   reconnect or new token based only on that error. Tools/list/preparation only.
4. If deployment verification fails, restore both services to the existing
   deploy/sam-free-trial-ready branch ONLY after verifying its HEAD is still exact
   8ebbe5a, with flags closed and autoDeploy off. Preserve all receipts. No goal
   can be sent until a separate explicit business-trial authorization.

BLOCKED: live connector verification requires separately authorized publication;
metadata refresh currently fails with an unspecific UI error. This batch closes
the local fail-open path, not the historical attribution gap or live acceptance.
The incident, time-only model-call correlation, unverified provider billing and
selective-redaction limitations BELOW are preserved unchanged. No secret was
extracted into source/package; package secret scan is recorded in its manifest.
Next step: review the saved intake package/deployment procedure; do not repeat
DDL, the consumed sales attempt, activation, successful unaffected suites or
cleanup of inaccessible operator/provider history.


## Trial stopped and rollback verified — 2026-10-27 00:54 UTC

FINAL STATUS: BLOCKED at submission-field transport, not at bol or Hermes.
No sales report and no Hermes run/receipt exist. Do not call this integration
LIVE_VERIFIED. No request was resubmitted after the failure.

The prepared request (all nine acceptance constraints and analysis_request) was
passed once to the connected sam_submit_goal wrapper at 00:47:28Z. The wrapper's
advertised argument schema still listed ONLY objective/legal_entity_id. The
created goal was chatgpt_goal_submission with completion_definition=sam.read_report.v1,
not hermes_data_analysis / encoded acceptance. Returned status SUBMITTED / planning
SAM_RUNTIME_WORKER, not expected QUEUED / TRUSTED_DATA_DEPENDENCY_PLAN.
This proves the typed fields did not reach the intended dispatcher path. A stale
caller catalog/argument filtering is the leading cause; raw HTTP ingress arguments
were not logged, so exact stripping component is not independently proven.
The operator should have treated the stale caller schema as a submission blocker.

Goal: 0800c382-d55a-4255-98f0-cc0ef0fc31af
Business ID: G-566baa67-5d93-4195-a1d0-18c1649154bf-000004
Native state-machine transition fenced ONLY this goal from PLANNING to FAILED,
reason operator_stopped_business_trial, cause connected_tool_wrapper_omitted_
analysis_request_and_acceptance_contract. Final normal SAM readback: FAILED,
zero plans/work/executions/verifications/reports. No source collection or Hermes
request occurred, and no task was sent again.

Unexpected general-planning calls were found in the trial period:
- 683d837c-a208-41a2-b8cf-57029ea10ea9: deepseek / deepseek-flash,
  00:47:59.458Z, aborted, tokens=0, cost=null.
- 3c977248-5452-4d04-bd2d-022c9cd4d6ba: deepseek / deepseek-flash,
  00:48:21.826Z, GATEWAY_ACCEPTED, tokens=14483, recorded cost=0.
These are NOT authorized Hermes free-model evidence. The model_calls schema has
no goal_id, so this is time-correlated evidence, not a direct receipt binding.
Recorded zero/null does not establish provider billing. No billing/top-up/plan
change was made. Preserve this incident; do not silently relabel it Hermes.

The single window was closed early at 2026-10-27T00:49:55.666Z on BOTH service
configs: enabled=0 and expiresAt moved to closure. Rollback branch was first
verified to still point to exact baseline 8ebbe5a, then restored on both services.
The closing config updates automatically deployed baseline (no duplicate trigger):
- sam-runtime: dep-dbfvaeec6qcc73dqefog LIVE, finished 00:50:52.408Z.
- sam-mcp: dep-dbfvan0m7kps73atk810 LIVE, finished 00:51:34.074Z.
Both current commit 8ebbe5ab5caf53a870cd252441e6199a08b3b5af,
branch deploy/sam-free-trial-ready, autoDeploy=no. Native runtime probe at
00:53:51.113Z confirms enabled=0, expired admission, FAILED goal, no work or
execution rows, and FORCE RLS=true with RLS=true. Normal SAM is reachable;
bol_sales_stock_report remains advertised, Hermes analysis is no longer advertised.
Existing private config remains mounted on runtime ONLY, unused by baseline;
it was not copied to MCP, model input or deliverables. The approved one-row
verification metadata remains for continuity; no data or history was deleted.

Native DB verification: ONLY the 111ms metadata transaction / restored protection
and final fail/empty-work reads. LOCAL_VERIFIED remains the earlier 14 cases and
typecheck; code unchanged, no repeat suite. Activation deployments had verified
fixed free Nous config, empty tools, single concurrency and no fallback, but no
Hermes model invocation was reached. No PR83/Modal/publisher work or change.

No running operation created by this trial remains; both rollback deployments
finished. No financial/PG window was renewed. The one report attempt is consumed
and not a basis for an automatic retry. Next bounded work is to reconcile the
working connector's tool schema/transport with deployed tools/list and prove that
missing acceptance cannot silently enter generic planning, BEFORE any newly
authorized live submission. No new connector/engine/infra service is required.

## Authorized activation checkpoint — 2026-10-27 00:40 UTC

User explicitly authorized the one-table DDL exception, selective credential
redaction, same-code activation and one <=60-minute report trial in this turn.
The one implicit PostgreSQL transaction committed in 111 ms at
2026-10-27T00:40:46.710Z. Server statement_timeout=9500ms, lock_timeout=1000ms,
client watchdog=10000ms. ACCESS EXCLUSIVE lock; RLS stayed enabled; FORCE was
restored before commit. Post-read relrowsecurity=true, relforcerowsecurity=true;
policy inventory exactly unchanged. Contract id ac6b82de-4c26-4068-afb6-6586a460fdc6,
all reviewed metadata fields matched, must_not_trust_execution_result=true.
Normal SAM connector read confirmed this exact row (95 total contracts).

No activation window or business goal yet. Published code still f5b88e9;
autoDeploy remains off. Before submission, recent SAM goal/work lists had no
hermes_data_analysis goal or hermes.generate_candidate queue row. An oversized
terminal entry was interrupted by UI timeout BEFORE Enter; visible partial input
and absent contract proved it was unsubmitted. It did not consume a DDL attempt.
Fresh-shell paste then sent the authorized transaction ONCE. Do not repeat it.
No successful test suite or completed source deployment was rerun.

Full tenant DB check before admission: zero hermes_data_analysis goals and zero
hermes.generate_candidate work rows. No prior run was found.
Selective credential redaction limits: configured/default Bash history file does
not exist; current operator shell memory contains zero target connection entries.
Original prior terminal view/session is no longer reachable after navigation;
no full-history/scrollback erase was performed. Provider-internal capture/audit
copies are inaccessible, so no deletion claim is made. Redacted incident evidence
retains original failure SQLSTATE 42501 and rollback; original attempt occurred
after runtime deployment 00:13:33Z and before checkpoint commit 00:23:34Z;
an exact per-attempt timestamp was not available. No new auto-review rejection.

ONE activation interval is fixed at 2026-10-27T00:45:05.990Z through
2026-10-27T01:45:05.990Z (04:45 Damascus). Runtime execute, MCP dispatch-only;
environment updates started required activation builds automatically despite
autoDeploy=off. Do NOT trigger another deployment for those same updates.
runtime: dep-dbfv864ipgvc73e0soa0; MCP: dep-dbfv88om7kps73atcn30.
Both target unchanged f5b88e9. Need terminal live/readiness and mount check, then
send prepared request once. Source deployment and successful tests not repeated.

## Deployment checkpoint — 2026-10-27, supersedes pre-deployment status below

Authorization: user explicitly replied “انشر” to the bounded activation proposal.
No fresh financial, role/grant, DDL, migration, PostgreSQL-window, Modal or
PR83 authority was inferred.

LIVE_VERIFIED (deployment only):
- Reviewed local delivery: 471727b14ca9da3acfcd7e1e6ac122bce37c59cc.
- Published commit: f5b88e9f6787122374644e1607289613844f87ab, parent
  8ebbe5ab5caf53a870cd252441e6199a08b3b5af.
- Published tree: 215bd0c437ba9900d6e7d965fc1223c3fb7c6052, EXACTLY matches
  reviewed local delivery tree. Remote commit metadata differs; content does not.
- New branch: delivery/hermes-business-471727b-20261027-4e95.
- Existing branches main/PR67/PR83 untouched. Native git push failed once
  (CLI credentials absent); authenticated GitHub connection published the exact
  tree with [skip ci]. No workflow was manually triggered.
- sam-runtime srv-db37vbvlk1mc739o0b70:
  dep-dbfup0t9el5s73bc68dg, LIVE, finished 00:13:33 UTC.
- sam-mcp srv-db37vbvlk1mc739o0b7g:
  dep-dbfup3e1egvs73a3jekg, LIVE, finished 00:13:45 UTC.
- BOTH service branches now point to the unique delivery branch, autoDeploy=no,
  original build/start commands, health checks and plans unchanged.
- Runtime Shell independently reported RENDER_GIT_COMMIT=f5b88e9..., and working
  SAM verification inventory remains reachable.
- Before deployment billing showed 152/500 included pipeline minutes used,
  about 348 remaining; additional monthly build spend limit $0. No plan or cap
  was changed. The two completed deployments took about 42s and 44s.
- Existing Hermes private config was checked for fixed free Nous model, no
  tools, single concurrency, no fallback, and saved ONLY as sam-runtime secret
  file sam-hermes-test.json using Save only. No value is included here.
  It is configured but NOT mounted in the current already-running deployment
  (secretMounted=false); it needs the authorized next activation deployment.
  No credential was sent to MCP or a model. No new token was created.

BLOCKED (metadata provisioning, before activation):
- Runtime role sam_runtime_app has no INSERT privilege on verification_contracts.
- Existing database owner sam_trial_postgres_user was used transiently for the
  approved single-row INSERT. The actual database refused it with SQLSTATE 42501:
  new row violates row-level security policy for table verification_contracts.
- Exact public.verification_contracts owner is sam_trial_postgres_user and
  relforcerowsecurity=true. Owner has no BYPASSRLS. Read-only catalog query found
  no existing public contract/provision/verification function to perform this.
- The transaction rolled back; SAM inventory confirms no hermes.generate_candidate
  contract. No row, policy, grant, role, table setting or schema was changed.
- An earlier terminal input failure produced ENOTFOUND host "base", before DB
  contact. The corrected standalone silent read reached PostgreSQL and exposed
  the RLS boundary above. Do NOT repeat either INSERT without new authority.
- Credential-handling incident: one failed input placed the existing internal
  operator connection string into this operator Shell's command/history display.
  No credential value is in this checkpoint, source, archive, model input or report.
  Attempted targeted history/scrollback cleanup was automatically REJECTED because
  it would irreversibly remove operational evidence without explicit approval.
  No cleanup workaround was attempted. A later successful silent input's shell
  variable was unset; browser clipboard cleared. Existing credential not rotated.
  Cleaning the sensitive line requires specific owner approval while preserving
  this redacted incident record.

Resource/operation state:
- Analysis admission remains CLOSED: runtime analysisEnabled=false,
  activationSet=false. No 60-minute window was opened on either service.
- No new business goal, bol collection, Hermes request, receipt or report exists.
  Thus native end-to-end DB acceptance and live Hermes report remain unverified.
- sam-isolated-test remains deliberately suspended; it was not resumed.
- hermes-isolated-test unchanged; no Modal/publisher service/tool change.
- Both deployments completed; no deployment or provisioning process left running
  by this handoff. Operator Shell session itself remains open; no old session or
  unrelated process was killed.
- Local code unchanged; the previous 14 cases/typecheck exit 0 remain the code
  evidence. No 24-case, SUM, model-lock or PR83 test suite was rerun.

Next permission, NOT executed: permit ONE owner transaction on ONLY
public.verification_contracts, with short lock/statement timeouts, to temporarily
remove FORCE ROW LEVEL SECURITY inside the transaction while RLS stays enabled,
INSERT the one reviewed metadata row only if absent, compare all metadata on
conflict, restore FORCE before COMMIT, and verify forced RLS remains true.
The ACCESS EXCLUSIVE table lock prevents other sessions observing an intermediate
setting. Any error/timeout rolls the transaction back, restoring original state.
No grant, role, other table, data deletion or persistent policy change.
This is DDL and therefore OUTSIDE the current no-DDL authorization; do not run
it under the existing deployment approval.

After that exception is authorized and succeeds, reuse the already approved
single <=60-minute QNAN/free-model window and prepared request, with runtime execute
and MCP dispatch-only, same published source. Do not open the window before the
metadata check passes. Success still requires independently verified bol data,
real task-linked Hermes receipt, and report readback. On any failure close only
this admission and preserve evidence; rollback deployments to exact 8ebbe5a only
after fencing any newly admitted nonterminal goal as described below.

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
