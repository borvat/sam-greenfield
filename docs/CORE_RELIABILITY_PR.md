A failing planner could abort a runtime tick, dependent steps could run before their prerequisites, and uncertain writes could be stranded outside reconciliation. This change preserves SAM’s Brain/kernel/gateway architecture while making planning attempts durable and bounded, enforcing independently verified step dependencies and typed result references, wiring production events, and reconciling uncertain writes without resending them.

Independent Phase 2 review found and corrected additional concurrency/security defects: short committed planning reservations replace a connection held across nested operations; side-effect reservation, exact approval consumption and live-work binding commit atomically; production entrypoints require fixed-principal tenant policies and refuse role memberships; deadlines are checked again before plan persistence; unfinished legacy work cannot starve learning from completed goals.

Verification compares independent content and checks typed evidence and explicit goal criteria. Standard capability schemas, bounded connector calls, goal-bound approvals and restricted database admission strengthen execution boundaries. No new externally actionable capability or business permission is added. Production startup intentionally refuses unbound/owner application identities; operator provisioning and trusted tenant context are prerequisites.

Validation at tested source/test commit `bdab0758c130d6f499a40437f43a12798beb857c`:

- TypeScript and all 38 phase 1–21 regression suites pass.
- Eight core suites pass on host and inside a fresh Node 22 image after PostgreSQL restart: original 15 assertion groups plus concurrency, reconciliation race/concurrent deduplication, four-tenant workload, bounded event backlog, learning scheduling, startup refusal and post-proposal deadline tests.
- Four newly targeted tests fail against archived original PR head `8b235bd` and pass on the corrected implementation.
- Clean no-cache image build passes; dependencies are freshly installed with TLS/checksum validation and non-root source access.
- Migration upgrade/repeat apply, transactional migration rollback and database restart persistence pass. Four Phase 0 commands and five focused protocol/security/schema suites pass.
- Five combined migration sets (OAuth through perception/research/notification work) apply in disposable schemas; their source combinations still have 5–32 conflicts and are not integration-ready.

**Merge-readiness verdict: CONDITIONAL. Production readiness: NOT ESTABLISHED.** Hosted checks, branch protection and reviews cannot be inspected because the configured proxy denies GitHub API access. The existing CI workflow now includes bounded/read-only jobs, the expanded core tests, focused security fixtures and a clean-image build. Local passes do not establish hosted CI success.

Before a future standalone merge decision, an authorized integration/reviewer must verify green checks on the final head and required protections/reviews, and review the deliberate admission/client-contract and rollout changes. Do not combine conflicting branches without separate integration work. Rollback must drain/cancel dependency-bearing plans before restoring old workers: the exact main worker query was shown to ignore the new dependency gate. No production downgrade/restore has been tested.

All providers/data are synthetic local fixtures. See the [independent review](docs/PHASE2_INDEPENDENT_REVIEW.md), [machine-readable evidence](docs/PHASE2_REVIEW_EVIDENCE.json), [112-file inventory and captured logs](docs/reviews/2026-10-22), and [design/rollout constraints](docs/CORE_RELIABILITY.md). Migrations 00001–00010 remain unchanged; 00012/00013 reserve 00011 for OAuth work. Newly combined feature tables require separately reviewed fixed-principal policies/grants.

No production service, database, credential, commercial transaction, paid model/service, protected stability branch, or external action permission was changed. No deployment or PR merge occurred.
