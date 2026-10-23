# Shared path checkpoint: 39db476

Application: `39db4769e498efe3287bee8216d2c6d0825b0706`.
Tree: `213a4e5401eba8d10b86b694b0e74191baf48869`. Clean exact-head full acceptance: **60/60 PASS**.
Started: 2026-10-23T18:11:12.664Z; completed: 2026-10-23T18:25:46.731Z.
All 88 report artifact hashes were recomputed. The source manifest and signed traces are retained.

[Full report](full/report.md) · [Machine report](full/report.json) · [Manifest](SHA256SUMS) · [Implementation and limits](IMPLEMENTATION-AND-LIMITS.md).

49/49 legacy regressions and 14/14 core suites passed. No application tests were skipped.
The harness uses pinned Node 22.23.4 and only the documented authenticated TCP-readiness adjustment plus checkout relocation; see [patch](readiness.patch).
GitHub Actions is billing-blocked; this is isolated local Docker acceptance, not hosted or production evidence.

Eight signed traces were authenticated, totaling 757 hash-chain events. The shared path declares three completed fixture children, with 188 events. Two negative crash/incomplete traces correctly score FAIL / AUTHENTICATED_INCOMPLETE_CAPTURE; those are expected fail-closed outcomes, not suite failures. See [verification log](local/trace-verification.log) and [command](local/verify-traces.cjs).

This checkpoint tests the shared builder directly. The service-entry follow-up `f8b570ac80158303993c3156872c76401ff965f9` is separate and requires its own acceptance; this pass does not establish that later head.

Preserved earlier full run [66c937f](failed-66c937f-full/report.md): 13 PASS, 1 FAIL, 46 NOT_RUN. The failure was `tests/core/reviewReliability.ts:63 assert(fired)`: its SQL barrier recognized only scalar goal scope and did not intercept the descendant-aware ANY query. The matcher was corrected, retaining all inserted/updated revocation assertions. Targeted development failures and their subsequent passing runs are retained in local/, including profile conflict, input projection and fixture issues. They are not presented as passes.

No live model calls, production data, activation, grants, deployment or merge occurred. Scripted decisions establish wiring and safety, not autonomous model quality. The optional coordinator profile remains an explicit production operator boundary, applied only to isolated test schemas.
