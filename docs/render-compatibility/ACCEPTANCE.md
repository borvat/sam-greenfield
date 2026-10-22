# External compatibility acceptance

**56/56 required stages PASS; 0 FAIL; 0 required NOT_RUN.**

Tested implementation: `23524531860221189f517c43fdbdb6a3b1bf408f`.
Clean source tree: `bacae7bc65c3fbeb0ae3231ca4f23e5533c790fb`.
Implementation digest (all tracked files excluding docs): `044aabd47365186727ee49f0e8c2ae5bccec843ba65f67dacee90fac855d2a4b`.
Run: 2026-10-22T15:11:54.044Z to 2026-10-22T15:27:06.787Z.
Command: `npm run verify:full -- --output /workspace/sam-render-compatibility-acceptance/complete`.

The subsequent publication commit adds only this evidence documentation. No implementation, tests, dependencies, configuration or migration changes follow the tested source. Exact head/readback details are in the Draft PR.

- 49 historical regression suites and 8 core reliability suites pass.
- 37 Google/OAuth/interface fixture tests pass. These use mock transports/stores and PGlite where applicable; they are not live Google grants or business activity.
- Real disposable PostgreSQL migration compatibility passes fresh bootstrap, deployed-ledger adoption, repeated application, preserved OAuth sentinel and hash refusals. The original launcher rollback incompatibility is explicitly tested/documented.
- Restricted-principal integration, specialist provenance/fairness/recovery and signed-budget/trace checks pass.
- Three authenticated synthetic commercial scenarios and 39 negative cases pass; 21 hostile signed-trace regressions pass. Scripted provider responses do not establish live reasoning quality.
- Real PostgreSQL restart, Phase0, tenant isolation and fail-closed security pass.
- Clean Docker image and two startup/shutdown rounds through Render's exact runtime/MCP wrapper pass. The smoke uses maintenance-only/synthetic configuration, not the production principal or live provider composition.
- Source integrity and owned-resource cleanup pass. The evidence manifest was independently recomputed after completion.

[Structured report](evidence/report.json) includes exact commands, stage outcomes, source/image/runtime hashes and artifact digests. [Full evidence archive](evidence/external-acceptance.tar.gz) includes complete logs/metadata and separate earlier-failure evidence. Archive SHA256: `e83c01f4091b31ff868360fe33922170e7466975bfc9cd0754840c6c871b9741`. [Artifact hashes](evidence/SHA256SUMS).
The readable report inside the archive has working relative log links; the committed [report summary](evidence/report.md) retains those original paths.

Earlier failed full runs are not acceptance: `160dd9b…` exposed schema/verifier mismatches; `9d131f1…` stopped at an unclassified release-contract fixture failure (unchanged standalone host and Node 22 checks passed); `c2454d2…` exposed the obsolete bound-write assertion. Further targeted checks caught composition retry/report-polling integration mismatches. Fixes and limitations are described in [COMPATIBILITY.md](COMPATIBILITY.md). No failing assertion was removed to claim success, and no trial/agent/test timing limit was increased.

## Remaining gate

This is an AI-reviewed offline compatibility candidate, not production readiness. No production database/credentials, Render changes, merge, deployment, live provider/model calls, billing/security setting changes, hosted reruns or business writes occurred. Actions is unavailable due billing according to the owner; external acceptance does not rewrite hosted history or prove effective repository rules. Existing final 24-hour endurance PASS evidence remains unavailable and concerns a different deployed SHA.

Before a separately authorized release, obtain only the nominated read-only ledger/principal/policy/registry proof in [PRODUCTION_PREFLIGHT.sql](PRODUCTION_PREFLIGHT.sql), confirm configuration presence without secret values, disposition unbound pre-upgrade Google evidence, and approve a rollback-compatible artifact/database recovery procedure. See the exact [two-service rollout/readback plan](COMPATIBILITY.md). No new soak, provider activation or PR49 public lookup activation is required by this package.
