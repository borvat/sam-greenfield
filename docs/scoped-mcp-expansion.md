# Scoped MCP expansion for SAM — staged implementation

This draft builds on PR #40 at `a3c5977a68d7789d1d273eb91964f8340c7fc6d8`,
which itself depends on PR #37. It adds a reviewed multi-server connector to the
existing SAM planner, specialist/executor and independent-verifier path. It does
not replace SAM or create a second agent, scheduler, paid service or database.

**No production connections were added.** No merge, Render deploy/restart,
environment change, migration, permission expansion, provider write or soak-task
change was performed. The current fixed-release soak remains separate.

## Existing access versus this change

| Need | Existing code / evidence | This draft | Still required |
| --- | --- | --- | --- |
| Gmail / Drive | Existing SAM Google bridge; baseline G000134 previously read Drive and recovered in the same goal | Remains intact; regression suite run | Recheck live authorization at activation |
| bol.com | Existing 77-capability bundle including report; 54 GREEN, 23 approval-gated in local surface test | Remains intact; no new write grants | Live account/company binding and acceptance |
| Web research | PR #40 stages a single generic research MCP | Multiple explicitly reviewed MCP servers, bounded discovery and fresh readback | Select authorized server, credentials, exact schemas and source coverage |
| PDF / Excel / CSV / documents | Existing Google content/export mechanisms; not all formats guaranteed | Can expose a reviewed file-reader MCP with pinned parameters | Actual parser server, fixture corpus, size/format/fidelity acceptance |
| Accounting | Existing e-Boekhouden adapter code; current read-only bundle skips its registration | New scoped MCP read path can host a reviewed accounting server | Account-specific credentials, schema review, reconciliation acceptance |
| Warehouse / shipping | No dedicated new connector proven by this work | Supported manifest categories and same execution path | Actual authorized endpoints, account mapping and reviewed read tools |
| Browser mobility | Separate local perception branch contains an evaluation harness with a browser-execution blocker | Only a `browser_read` category, not a working browser or browser sandbox | Disposable browser worker, working sandbox and explicit navigation/data policy |
| Actions / hands | Existing approval and side-effect-ledger paths | New connectors expose GREEN reads only | Per-action provider adapter, exact approval and independent outcome/reconciliation tests |
| Events / owner attention | Separate perception and notification drafts | No new scheduler or webhook added | Review and integrate those drafts separately |

A ChatGPT connector does not supply runtime credentials or a runtime MCP endpoint.
No connector available to this conversation is silently forwarded to Render.
Manifest categories describe intended roles; they do not implement providers.

## Implemented boundaries

1. `SAM_SCOPED_MCP_ENABLED` is off unless exactly `true`. With the flag off, the
   function returns the same bundle without parsing config, DNS, authentication or
   discovery. This does not disable PR #40's separate legacy research connector.
2. With the flag on, `SAM_SCOPED_MCP_MANIFEST` is validated completely before network
   access. Each server fixes one legal-entity UUID, unique stable ID, endpoint,
   category and 1–24 reviewed tools. At most eight servers are admitted. Unknown
   fields and write declarations are rejected.
3. Deployment controls the exact HTTPS origin allowlist in
   `SAM_SCOPED_MCP_ALLOWED_ORIGINS`. Credentials are referenced by an environment
   name beginning `SAM_MCP_SECRET_`; tokens are never in URLs or the manifest.
   A credential environment name cannot be reused across distinct companies.
   Different names do not prove different upstream accounts: independently verify
   provider account ownership before granting access. The endpoint allowlist trusts
   the operator's endpoint/DNS/TLS and is not a complete egress sandbox.
4. The raw remote tool list cannot grant access. Only tools listed in the local
   reviewed manifest become capabilities. Their complete input schemas must match
   the pinned schemas exactly. Remote descriptions/annotations are not planner
   instructions or evidence of read-only behavior. Local review must establish that
   the provider actually performs reads. A misleading tool cannot be made safe by
   its name, annotations or this bridge alone.
5. Discovery is limited to five pages / 200 listed tools. Duplicate/cyclic cursors,
   tool-name normalization collisions and changed schemas fail closed. Calls have a
   15-second hard deadline; discovery/read errors are sanitized. No read retries are
   added. A timed-out session closes and requires a reviewed reconnect/reload; there
   is no autonomous reconnection state machine in this draft.
6. HTTP uses the exact configured endpoint, rejects redirects, and bounds streamed
   bodies to 1 MiB. Input schemas have size/depth/reference limits and reject extra
   root parameters. Remote reads must have content and no error result. Result
   content is untrusted data, not authority. URL/path restrictions inside a remote
   tool must be pinned in its reviewed schema and enforced by that server; this is
   particularly necessary for browser and filesystem readers.
7. Company filters apply before initial planning, replanning and read continuation.
   At execution a scoped tool rereads the persisted work/goal and requires the
   current active plan, unexpired lease, exact capability/params/goal/plan/fence and
   company. Model-supplied parameters cannot substitute a company. This is a
   point-in-time preflight; it does not revoke an already in-flight read. Legacy
   tools without explicit scope retain their existing behavior; this draft does
   not retrofit all Google/bol credentials with new company isolation.
8. Evidence records company, MCP server, tool, source origin, domain, retrieval time
   and response hash. Verification requires persisted company plus matching company
   evidence and repeats the exact read. Changed data or a failed readback remains
   INCONCLUSIVE. Hash equality establishes repeatability, not truth or independent
   publisher corroboration. API reads are MCP protocol POSTs, not business writes.
9. These new reads reuse PR #40's `research_mcp_*` verification contract and namespace.
   No additional database migration is introduced. Runtime and MCP shutdown close
   their added integrations; setup failure closes previously opened sessions.

## Configuration contract (staging only after the soak)

Use trusted deployment configuration, never source documents/model output. Example
below is **synthetic**, uses a documentation domain, and is not a live provider:

```json
{
  "version": 1,
  "servers": [{
    "serverId": "reviewed_web_qnan",
    "companyId": "11111111-1111-4111-8111-111111111111",
    "domain": "web",
    "endpoint": "https://reviewed.example/mcp",
    "credentialEnv": "SAM_MCP_SECRET_QNAN_WEB",
    "tools": [{
      "name": "search",
      "description": "Search the reviewed source service",
      "inputSchema": {
        "type": "object",
        "properties": {"query": {"type": "string", "maxLength": 120}},
        "required": ["query"],
        "additionalProperties": false
      }
    }]
  }]
}
```

Do not copy this fixture UUID or invent a production tool name. For each actual
provider: obtain its supported MCP endpoint and independent runtime authorization;
confirm the target company's account; review exact discovery schemas and read
semantics; pin a bounded tool subset and document limits; stage separate tokens;
then run live read, failure and readback acceptance on an isolated deployment.
OAuth lifecycle for new servers is not implemented here; servers needing OAuth
must use a separately reviewed token/refresh integration. Existing Google OAuth
is unchanged. No Render credential was read or installed by this work.

## Acceptance evidence and limits

`npm run test:mcp-expansion`: 13 passing isolated tests. See
[recorded output](acceptance/scoped-mcp-tests.txt).

The integration test starts **two real HTTP MCP fixture servers**, initializes and
lists tools through the installed SDK, offers a company-filtered trusted catalog
to the existing planner with a deterministic model double, and executes work after
SQL preflight using PGlite. Both companies use separate fixture bearer tokens;
both return actual MCP responses and independently verified readbacks. Changing
source content becomes INCONCLUSIVE. Cross-company, wrong work identity, stale
fencing, changed params and expired leases perform zero remote reads. Unreviewed
`send_mail`, despite a read-only annotation, performs zero calls. A hanging read
closes its session at the actual hard deadline without a retry. The suite also
checks disabled startup, schema drift, connection cleanup, pagination, limits,
URL policy and redaction of provider exceptions.

Regression commands passed during this change:

- `npm run test:research`: 6 passing.
- `npm run test:knowledge`: 15 passing.
- `npm run test:sam-google`: 36 passing.
- `npm run test:phase17:bol-sam`: PASS, 77 exposed, 54 GREEN, 23 approval-gated.
- `git diff --check`: PASS.

Counts above are per command and include overlapping review tests; do not add them
as distinct live trials. PGlite is single-process isolated SQL, not multiprocess
PostgreSQL. The planner model is deterministic, not live DeepSeek. No live search,
accounting, file parser, browser, provider identity, service restart, cold start,
end-to-end owner delivery or 24-hour stability is established by these tests.

## Integration / release gates

Close and review the fixed-release soak first. Review PR #37 and #40 dependencies;
reconcile migration numbering and shared-file edits with perception/notification
branches on an isolated integration branch. Those branches already touch catalog,
executor, composition and read-review paths. Preserve their stricter approval,
reconciliation and monitoring controls when integrating; do not blind-merge.

Then select the first actual authorized web source and file-reader provider; prove
same-company live account binding, real model selection, same-goal follow-up,
independent readback, error recovery and service restart on staging. Follow with
accounting/warehouse/shipping as real providers become available. Browser operation
and external writes each require their own acceptance; neither is enabled here.
Keep rollout off until these gates pass. Elapsed soak time alone is not approval
to merge or deploy.
