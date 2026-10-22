# PR49 external acceptance — 2026-10-22

## Exact tested source and result

**PASS: 54/54 required stages; zero failures; zero required stages not run.**

- Tested source: `f12ea08f761ca67d4cdfa45d45436bd0f2204615`.
- Parent containing PR48 fixes: `99672635c51b000a16c5c3d6c69c95768cc319f5`.
- Source tree: `64339c901723d3c037f382f73f53a9a19a65ed63`.
- Run: **2026-10-22 13:52:03.276–14:10:45.162 UTC**.
- Command: `npm run verify:full -- --output /workspace/pr49-external-acceptance`.
- Fresh supplemental PR49 adapter suite: **55 scenarios PASS**,
  13:52:32.161–13:52:43.670 UTC; deterministic planner/executor integration:
  **PASS**, 13:52:43.671–13:52:44.357 UTC. Both used synthetic fixtures.

The full run includes 38 regression suites, eight core reliability suites,
21 hostile signed-trace cases and three synthetic commercial scenarios.
PR48's earlier acceptance is historical context only: inherited tests were
executed afresh on this exact PR49 source, including learning fairness and
signed-budget validation. Source integrity and owned-resource cleanup passed.
No fixes or source changes were needed for this run.

This acceptance document is published afterward in a **documentation-only commit**.
That publication head was not freshly code-tested. The tested identity remains
`f12ea08f761ca67d4cdfa45d45436bd0f2204615`; the publication delta adds only this
Markdown document. No runtime, test, dependency, workflow or configuration change
is included in that delta.

## All full-run stage outcomes

| Stage | Result |
| --- | --- |
| preflight | PASS |
| snapshot | PASS |
| images | PASS |
| isolated-postgres | PASS |
| node-dependencies | PASS |
| python-dependencies | PASS |
| runtime-versions | PASS |
| workflow-tool | PASS |
| workflow-validation | PASS |
| configuration-validation | PASS |
| typecheck | PASS |
| regression | PASS |
| core-reliability | PASS |
| provider-auth | PASS |
| postgres-tls | PASS |
| contracts | PASS |
| synthetic-pilot | PASS |
| managed-schema | PASS |
| local-bundle | PASS |
| closed-setup | PASS |
| database-contract | PASS |
| prelaunch-gate | PASS |
| integration-migrations | PASS |
| integration-oauth-mcp | PASS |
| integration-orchestration | PASS |
| specialist-reasoning | PASS |
| specialist-gateway | PASS |
| specialist-provenance | PASS |
| specialist-learning-fairness | PASS |
| specialist-evaluation | PASS |
| evaluation-budget | PASS |
| evaluation-adapter | PASS |
| evaluation-orchestration | PASS |
| evaluation-independent-review | PASS |
| evaluation-commercial-market | PASS |
| evaluation-commercial-profitability | PASS |
| evaluation-commercial-suppliers | PASS |
| migration-upgrade-rollback | PASS |
| specialist-restart-prepare | PASS |
| evaluation-restart-prepare | PASS |
| postgres-restart | PASS |
| migration-after-restart | PASS |
| specialist-restart-check | PASS |
| evaluation-restart-check | PASS |
| phase0-migrations | PASS |
| phase0-acceptance | PASS |
| phase0-postgres | PASS |
| tenant-isolation | PASS |
| fail-closed-security | PASS |
| clean-image | PASS |
| image-contract | PASS |
| application-startup-restart | PASS |
| source-integrity | PASS |
| cleanup | PASS |

## GitHub workflow coverage and environment differences

Compared with `.github/workflows/phase0-postgres-verification.yml` at the tested SHA:

| GitHub job | External coverage | Differences / exclusions |
| --- | --- | --- |
| `test` | Same SQL migrations/vector extension and all four Phase 0 Python suites, including tenant isolation and fail-closed security | Pinned pgvector PG15/Python 3.11 containers and hash-locked psycopg dependency, rather than hosted VM, floating image and pip resolution |
| `core-reliability` | Typecheck, 38 regressions, eight core suites, provider-auth, PostgreSQL TLS, contracts, synthetic pilot and managed-schema tests | Pinned Node 22 Debian and pgvector PG15; hosted job uses `postgres:15-alpine`; OS/library parity is not claimed |
| `clean-image` | Same no-cache `scripts/development/build-image.cjs`, plus image contract and real application startup/restart | Generated verification Dockerfile replaces only FROM with a digest pin; original Dockerfile unchanged; no hosted Actions execution |

Additional external checks cover actionlint, compose/configuration, integration,
specialist provenance, fairness, signed traces, commercial scenarios, migration
rollback, database/specialist/evaluation recovery and source hashes. Actionlint
ran without optional shellcheck/pyflakes. Application startup/restart exercised
real entrypoints and read-only MCP against disposable infrastructure.

Runtime versions: Node 22.23.4, npm 10.9.9, OpenSSL 3.0.22, Python 3.11.17,
PostgreSQL 15.19, vector 0.8.7, actionlint 1.7.7. Image references are pinned in
`scripts/testing/verification-images.json` at the tested source. Clean application
image ID: `sha256:d44e4ca44d6d92f4419c62483a86d2440dab360b2edbb8babfe031ad7b541c52`.
Tests ran on an internal Docker network with no published ports or inherited
production credentials. Dependency/tool downloads occurred during setup;
"offline" describes test execution without live business/model providers, not
a wholly disconnected dependency-install process.

## Evidence preservation

Executor-local archive: `/workspace/pr49-external-acceptance-evidence.tar.gz`.
SHA256: `2d8dde534976d3ab68113c3e1fa34c714d07e7fb43241dc000b6a2e1e7d79ca9`.
The archive is retained locally, **not uploaded as a GitHub artifact**. This
sanitized document is the repository-readable acceptance record.

The archive contains exact command arguments, timestamps, per-stage outcomes/logs,
image identities, a tracked-source hash manifest, supplemental test logs and a Git
bundle. Runner evidence hashes (78 entries) and supplemental log hashes were
independently verified after completion. Earlier PR49 evidence was preserved.
No raw environment, credentials, customer identifiers or private test data is
published in this document.

## Exclusions and readiness

- **External technical acceptance: PASS** for the exact tested SHA and scope above.
- **Formal merge eligibility: not established.** Owner reports Actions unavailable
  due to billing. External tests proceeded; no GitHub status was posted or marked
  successful and no branch protection/billing/permission setting changed. Hosted
  runner/actions orchestration, caches, floating resolution and governance were
  not reproduced. External PASS does not itself satisfy a mandatory hosted status.
- **Live-provider readiness: not established.** No live VAT, currency retry or paid
  model call. The earlier currency HTTP 403 was not retried or bypassed. Adapters
  remain unexposed; activation, privacy/consent, tenant scope, shared-IP limiting
  and permitted live verification remain separate requirements. Scripted model
  output is not evidence of autonomous live reasoning.
- **Endurance: not executed.** Short startup/restart recovery is not a sustained
  stability result. A minimal proposed next check is a separately bounded
  30-minute synthetic-only soak on the immutable candidate image and disposable
  internal PostgreSQL, hard stop at 35 minutes, explicit resource limits, readiness
  and authenticated read-only MCP probes every 30 seconds, recorded error/latency/
  memory/CPU samples, and one planned application and database restart. No provider
  keys or live transports; fail on stalled recovery, unexpected egress, tenant
  leakage or unbounded growth; preserve samples and clean up labeled resources.
  This proposal was not run and would not certify 24-hour or production stability.
- No merge, deployment, production change, security change or provider activation.
