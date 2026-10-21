# Actual upstream MCP servers for isolated SAM staging

This pack contains pinned installation manifests, reviewed schema snapshots and
an adapter that starts real upstream servers over stdio and registers selected
reads in SAM's existing bundle. It builds on draft PR #41, remains opt-in, and is
not imported by the production default bundle. No paid service is created.

| Upstream | Pinned version | License described upstream | Recorded outcome |
| --- | --- | --- | --- |
| [Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) | 2.0.0 | MIT | Connected; SAM file read + fresh verification; scoped local write probe + SAM readback |
| [Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git) | 2026.10.19 | MIT | Connected; SAM repository status + fresh verification |
| [Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) | 2026.10.19 | MIT | Connected/discovered; internet read failed, NOT accepted |
| [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) | 0.0.83 | Apache-2.0 | Connected/discovered 25 tools; actual navigation blocked by missing Chrome; Chromium headless-shell download was truncated/invalid |

The primary repository documentation was read on 2026-10-21. Licenses are upstream
claims, not an independent legal review. We install the packages, not copy upstream
source. npm package-lock pins the dependency integrity hashes; requirements.lock
pins Python versions but does not provide hashes or a full supply-chain audit.

## Repeat this local lab

Requires Node 24+, Python 3.12+, git, uv and the repository's existing test dependencies.
No business credentials are required. Replace /absolute/lab with a new disposable
directory, outside production. The scripts use only that directory as their working
repository/filesystem fixture. Install directories stay separate from SAM runtime.

```bash
npm ci --prefix /absolute/lab/oss-mcp-lab --ignore-scripts --no-audit --no-fund
```

Before that command, copy this directory's package.json and package-lock.json into
/absolute/lab/oss-mcp-lab. Then:

```bash
uv venv /absolute/lab/oss-mcp-python
uv pip sync --python /absolute/lab/oss-mcp-python/bin/python integrations/oss-mcp/requirements.lock
SAM_OSS_LAB_ROOT=/absolute/lab node --import tsx scripts/oss-mcp-discover.ts
SAM_OSS_LAB_ROOT=/absolute/lab SAM_OSS_LAB_REPORT=/absolute/lab/acceptance.json node --import tsx scripts/oss-mcp-acceptance.ts
```

Discovery validates tool availability but is not execution acceptance. The second
script verifies installed direct-package versions, then registers seven reviewed
reads from three actual servers, using their installed binaries, actual discovery,
exact pinned schemas, trusted local descriptions and narrower path/repo/URL
constraints. The script uses PGlite for persisted SAM work preflight and the actual
SAM executor/verifiers. Its planner uses a deterministic model double, not live
DeepSeek. The public URL is the explicit example.com test page, not business data.

The public Fetch read remains BLOCKED. A bounded direct upstream diagnostic
reported a connection issue while fetching example.com/robots.txt. The underlying
connection cause was not established; do not label it a successful web integration
or an authentication failure. See docs/acceptance/oss-fetch-diagnostic.json. No robots/private-address checks
were disabled to make it pass. Web search is not implemented by Fetch.

The Playwright probe uses a new isolated profile, --sandbox and --no-webmcp; it does
not connect to a user browser/session. No executable browser was available. The
headless-shell installer returned an invalid ZIP and the actual navigation returned
an error. No browser click/action or production mobility is claimed.

Any blocked execution marks the acceptance outcome PARTIAL and exits 2. This is an
honest partial diagnostic, not a passing readiness suite. See the committed
[recorded result](../../docs/acceptance/oss-mcp-live-local.json).

## Boundaries

- New code does not automatically spawn a process in production. `OssStdioProfile`
  is trusted local executable configuration, never a tool exposed to model/source
  text. No arbitrary shell tool is registered. Caller must supply a minimal
  explicit child environment; the lab supplies PATH and network/certificate
  configuration only, no business API keys. Upstream process isolation is a
  directory policy and minimal environment, **not an OS/container sandbox**.
- Only seven reviewed read names are eligible. Schema drift or references fail
  closed; JSON Schema 2020's dialect annotation is removed only for the reviewed
  simple schemas, leaving validation and exact pin comparison in place. Runtime
  constraints and company are checked in direct adapters and verification reads,
  with persisted work/lease/plan/fence checks in SAM's executor from PR #41.
- The filesystem write probe is an explicit local owner action through upstream
  MCP to a generated disposable file, then read by SAM. It is not registered as a
  SAM write tool and does not prove autonomous approval/side-effect reconciliation.
  External writes remain outside this pack. No general file-edit permission is
  introduced for production.
- No new automatic monitoring/event ingestion exists here. Existing perception and
  notification drafts remain the intended path. Render/GitHub are additional
  candidate examples, not the whole scope; their primary repos are in
  cloud-candidates.json. They were researched, not installed or connected with
  the user's account. Connected ChatGPT authorization is not transferred to SAM.
- New subprocess reads use SDK deadlines and output checks after protocol parsing;
  there is no hard OS memory/CPU/egress boundary or automatic reconnect manager.
  A production worker/container lifecycle, audit storage and model-driven recovery
  still need separate staging acceptance.

## Activation gates

Close/review the fixed-release soak; review PR #41 and dependency drafts; isolate
these subprocesses with mounted company roots, minimal credentials, resource and
egress restrictions; fix public Fetch and browser execution; provide independent
GitHub/Render or other provider runtime authorization; then test real model choice,
same-goal follow-up, provider failures, reconciliation for any approved actions,
restart, bounded monitoring and owner delivery. These gates are not waived by
local package installation or tool discovery. No production change was performed.
