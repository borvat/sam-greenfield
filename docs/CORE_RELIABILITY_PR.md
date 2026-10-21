A failing planner could abort a runtime tick, dependent steps could run before their prerequisites, and uncertain writes could be stranded outside reconciliation. This change preserves SAM’s Brain/kernel/gateway architecture while making planning attempts durable and bounded, enforcing independently verified step dependencies and typed result references, wiring production events, and reconciling uncertain writes without resending them.

Verification compares independent content and checks typed evidence and explicit goal criteria. Standard capability schemas, bounded connector calls, goal-bound approvals, restricted database admission and fixed-principal tenant provisioning strengthen execution boundaries. Learning accepts only verified, current-plan, tenant-scoped evidence. No new externally actionable capability or business permission is added.

Clean Docker builds now pass. The cloud build failure was proxy DNS (`EAI_AGAIN`) hidden behind npm’s `Exit handler never called`; the build helper resolves the existing configured proxy through the host, preserves its authorized route and mounts the existing CA ephemerally. Docker copies explicitly set `node` ownership so restrictive checkout modes remain readable by the non-root runtime user.

Validation at implementation commit `3aee07abf2d7f48a3f8f90f02602ddd263ebf2bd`:

- All 38 phase 1–21 regression suites and TypeScript pass.
- All 15 core assertion groups pass on the host and inside the freshly built Node 22 image with production dependencies. These include real process loss after a synthetic provider commit, consumed-approval recovery, no resend across restart/replan, dependency/result propagation and restricted-role end-to-end tenant isolation.
- Clean no-cache image build, non-root default startup, health endpoints and runtime restart pass.
- Isolated PostgreSQL 15 migration from zero and upgrade from 00001–00010, repeat apply and database restart persistence pass. Four Phase 0 commands and five focused protocol/security/schema suites pass.

All providers/data are isolated fixtures. Exact commands and captured logs are in [the acceptance report](docs/CORE_RELIABILITY_ACCEPTANCE.md) and [machine-readable evidence](docs/CORE_RELIABILITY_EVIDENCE.json). See [design and rollout/rollback constraints](docs/CORE_RELIABILITY.md) and [per-file rationale](docs/CORE_RELIABILITY_FILES.md).

Keep this PR **draft**. Hosted CI/reviews remain unverified because the environment proxy denies GitHub API CONNECT requests (403); Git access works. Live providers, Replit-specific identity tests, combined unmerged branches, production grants/backfill/rollback and sustained-load/stability results remain unverified. Local passing tests do not establish production readiness.

Additive migrations use 00012/00013, reserving 00011 for observed unmerged OAuth work; review combined branches before merge. Rollback must drain/review dependency-bearing plans before restoring old workers. No deployment, production database/credential change, paid model call, external message/business action or PR merge was performed. Ongoing stability tests were not touched.
