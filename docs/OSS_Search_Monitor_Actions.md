# SAM: actual search, monitored observations and guarded local actions

Staged on draft PR #42 at 3cdb5e8f33b8615d39987376ad91684f8aa11d99. This
branch remains separate from main and the fixed-release Render deployment. Nothing
here creates a paid service, changes a runtime secret or updates the soak task.

## What is implemented and exercised

| Area | Actual implementation | Evidence / limit |
| --- | --- | --- |
| Search | Installed [nickclyde/duckduckgo-mcp-server](https://github.com/nickclyde/duckduckgo-mcp-server) 0.7.0, Python version lock, real stdio connection, pinned schemas, bounded query/results, company-scoped SAM execution and fresh verifier | Public search returned three links. First SAM test VERIFIED; repeat executed but fresh response changed, so INCONCLUSIVE. Exact-match reliability gate is still open. |
| Web page reading | Installed Fetch plus DDG fetch_content; error-shaped outputs cannot become successful evidence just because isError=false | Public content reads remain blocked. DDG diagnosed missing socksio (fixed) then local DNS failure under its SSRF guard. Guard and TLS verification remain enabled. |
| Monitoring | Reuses the existing staged perception design, integrated with current SAM goal factory, planner, specialist, verifier, final read-report and event fabric | A real upstream Filesystem source produced BASELINE -> UNCHANGED -> CHANGED. One internal attention event, no repeated event. Test advances poll due timestamps; this is not elapsed scheduling proof. |
| Actions | Opt-in real Filesystem write to exactly one target, YELLOW, exact company/goal/parameter owner approval, existing side-effect ledger, independent MCP readback and reconciliation | Actual approved write succeeded. Wrong-goal approval denied. Confirmed replay did not write again. Actual write + simulated lost receipt was quarantined; a newly constructed MCP adapter confirmed from a fresh read, then a new work-queue replay deduplicated. |
| Accounting | `withCompanyAccountingReads` wraps the existing e-Boekhouden client and four existing reads, with company checks and exact fresh-response equality | Real client against a local synthetic HTTP API. Changed data INCONCLUSIVE; other company denied before call. Session POST only, no business mutation. No live account authorization installed or account ownership proof. |
| Other business sources | Existing bol and Google adapters remain; explicit staging mappings in business-systems.json | No live WMS or shipping provider/account selected or connected. Reviewed filesystem exports are a possible future source, not a claim of live integration. |
| Browser | Pinned Playwright package and disabled worker contract | Still BLOCKED: executable missing, prior download invalid, user namespace creation denied in this execution environment. No sandbox disabled, no user session attached, no navigation/actions claimed. |

These are real upstream MCP processes and local SQL execution, not fixture MCP
servers returning canned tool results. Source business data is synthetic except
public search. The planner/critic in workflow tests is a deterministic test gateway,
not a live LLM. PGlite is isolated single-process SQL with advisory locks stubbed.
A reconstructed adapter is not a proven production service restart.

## Integration and authority

`SAM_PERCEPTION_ACTION_ENABLED` is off by default. The default runtime calls a
contained perception tick; with the flag off, it performs no monitor SQL. Migration
00104 adds disabled source registrations/bindings and observation/poll journals;
it was applied only to isolated databases. There are no default account grants.
Sources support the earlier Gmail/bol reads plus explicitly company-scoped OSS
reads that have a verifier. The tick creates at most five bounded GREEN goals;
an outstanding poll blocks a replacement. It records observations only from
matching company/source/capability/params and the latest VERIFIED execution.

The monitor implementation reuses the earlier unmerged perception/action candidate,
with current PR #41 company guards preserved. No parallel scheduler or action engine
was introduced. Shared composition/planner/executor/schema edits must be reviewed
with the other perception/notification drafts instead of blind-merging.

Before a claimed action, the existing persisted work/goal/plan/fence/lease is checked
against company bindings and the goal ceiling. Approval planning/consumption now
also checks goal scope, including for legacy non-feature calls. This is a shared
behavior correction that would apply on a future deployment even with monitoring
off. An explicitly global approval with goal_id=NULL remains allowed within the
same company. A source observation or attention event never generates approval.

Action intent keys are stable for identical params within a goal, preserving issued
keys if the flag is later disabled. Pending/ambiguous outcomes require reconciliation
instead of another send. Reconciliation uses SAM's durable expected request hash
and an actual upstream file read, without an in-memory success map. No exactly-once
network promise, intentional-repeat contract, rollback, cross-goal deduplication or
multi-process/crash-window completeness is claimed. A separate production hardening
review remains necessary, particularly around pre-dispatch approval races.

The file action is not in the default bundle. It is bound to one disposable target
in the lab; it does not grant general filesystem, email, price, inventory, purchasing,
payment, cloud deployment or bank powers. Fixture approvals are local test records,
not an authenticated production owner-intake proof.

The event fabric and SIDE_EFFECT_OUTCOME_UNKNOWN outbox record provide internal
attention/review evidence. No external notification delivery, phone alert, webhook,
user message or autonomous owner follow-up was sent. The existing notification
center draft still needs isolated integration and a separately authorized channel.

## Search/network corrections

The initial DDG probe disclosed missing socksio for the environment's proxy. The
pinned search environment now includes socksio==1.0.0. It explicitly uses the normal
httpx backend and a configured CA bundle; TLS, robots and private-host protections
were not disabled. Tools returning text beginning Error: or an ambiguous bot-blocked
empty-search diagnostic are rejected even when the server sets isError=false.

DDG search and content fetching are different network paths. Search succeeded;
fetch_content's own local DNS/SSRF guard still rejected unresolved example.com.
Neither bypassing the guard nor a passing search proves content acquisition.

Exact-response verification is intentionally conservative. Public result ranking,
URLs or snippets can change between calls. We preserve the strict live gate's
nonzero result for the second attempt rather than loosen verification or relabel
it a pass. See oss-search-history.json, oss-search-sam.json and
oss-live-search-inconclusive.txt under docs/acceptance. First-attempt evidence is
recorded from the session's actual passing test output; latest result is saved in
full separately. No claim of a successful multi-source research report is made.

## Validation

- `SAM_OSS_LAB_ROOT=/absolute/lab npm run test:oss-extended`: 3 behavioral tests
  (accounting API, monitor rejection/off switch, real MCP monitor/action chain).
- `SAM_OSS_LAB_ROOT=/absolute/lab npm run test:oss-live-search`: strict live
  readiness gate. Earlier attempt passed; repeated attempt failed its VERIFIED
  assertion because SAM correctly recorded INCONCLUSIVE. This gap is retained.
- MCP expansion regression: 13 passing.
- Knowledge: 15 passing; Google: 36 passing; research: 6 passing; bol surface PASS
  (77 exposed, 54 GREEN, 23 approval-gated). Per-command counts overlap.
- `git diff --check`: PASS. No CI runner, production PostgreSQL, live model,
  credential binding, elapsed monitoring, external delivery or browser success
  is established.

The meaningful workflow evidence is in docs/acceptance/oss-workflow-evidence.json;
recorded local tests are in oss-extended-tests.txt. The accounting test's remote
HTTP implementation is a synthetic local API, not the actual accounting service.

## Reproduce and activate later

Follow integrations/oss-mcp/README.md for the existing Node/Python environments.
Create another isolated environment at /absolute/lab/oss-search-python and use
`uv pip sync --python /absolute/lab/oss-search-python/bin/python
integrations/oss-mcp/search-requirements.lock`. Never install these into production
just to run the tests. Supply only a minimal child environment and reviewed proxy/CA
configuration. No ChatGPT account token is copied to a subprocess.

After the soak is closed and reviewed: resolve dependency/shared-file edits; stage
a disposable worker with real process/resource/egress isolation; fix webpage DNS
and browser execution; prove live company/account ownership and authorize actual
providers; decide source registration and meaningful projections; prove real model
planning/recovery and persistent restarts; then verify an authorized notification
channel. Monitor fairness beyond 50 sources and multi-process locking remain gaps.
Elapsed soak time is not automatic approval to merge or activate.
