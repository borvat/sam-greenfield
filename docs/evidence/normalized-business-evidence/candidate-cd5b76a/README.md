# Exact-head normalized business-evidence acceptance

Application: `cd5b76aa73dabdf9b64e6a63a4392657cdbb917a`, branch `feat/normalized-business-evidence`.
Tree: `54671761dc392130fb9dcc83f5f357d23766a08d`. Full isolated acceptance: **60/60 PASS**.
Started 2026-10-23T19:36:47.779Z; completed 2026-10-23T19:51:20.140Z.

[Full report](full/report.md) · [Machine report](full/report.json) · [Package hashes](SHA256SUMS) · [Implementation and limits](IMPLEMENTATION-AND-LIMITS.md) · [Reproduction](RUN-COMMANDS.md).

- 49/49 legacy regressions, 14/14 core suites, 52/52 isolated contract tests.
- Actual restricted-role report continuation/replay, complete derived monetary report, unknown currency/VAT and wrong-period rejection, unit-price/settlement rejection, exact citations and source revocation races.
- New tests retain documented bol price meaning without inventing currency; verify native Drive cursor/readback and incomplete-search semantics; reject doubled quantities from repeated normalized identities; recognize available replayed monetary evidence in reviewer input while rejecting a report that cites only a non-monetary field.
- Existing shared three-family service path, restart, delegation, budgets, tenant isolation and capture also pass. Scripted model decisions prove plumbing/safety, not autonomous model quality.
- Implementation-side authentication rehashed all **88 report artifacts** and **769 source files**. Source manifest SHA256 `b99501b540970602ca2a804bcd11cf43acd5b0235ec0d0a3b56e93fe5cbfa52e`; implementation digest `90b5d28dffd1f0c4412bc78390e392ccc65c1da6b536b57c6c54aba01fe3e269`. [Verification log](local/package-verification.log).
- Eight signatures and **757 hash-chain events** verified. Deliberate incomplete/crash captures correctly remain `AUTHENTICATED_INCOMPLETE_CAPTURE` / FAIL; they are expected negative safety cases, not hidden successful trials. [Trace log](local/trace-verification.log).
- Pinned Node 22.23.4 and isolated PostgreSQL. GitHub Actions remains billing-blocked. No application tests skipped or weakened. External harness changes are only checkout relocation and authenticated TCP readiness; [exact patch](readiness.patch).

Earlier runs [f2123ea](../candidate-f2123ea/README.md) and [ffff6a8](../candidate-ffff6a8/README.md) were intentionally interrupted after local review exposed additional cases. Their original reports, failures, cleanup and NOT_RUN statuses remain intact. They are superseded diagnostics, not final acceptance.

No capability registration/activation, permissions, grants, credentials, live source/model calls, production mutation, merge or deployment occurred. New extraction contracts remain opt-in. Current bol currency/daily-population guarantees and default Google MCP semantic schemas remain unestablished; this is not delivery of complete live commercial autonomy.

The operator workflow is separately documented at commit `35f27f239e061375b90242e6e7f714ec916bfd8b`, `docs/evidence/shared-goal-path/BOUNDED-LIVE-OPERATOR-PLAN.md`: trusted signer provenance, eligible synthetic principal/profile and deployed guard remain unverified. No currently verified executable live ceremony is claimed, and QNAN is not a synthetic substitute.
