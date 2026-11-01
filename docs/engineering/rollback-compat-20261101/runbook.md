# Pinned application rollback candidates

Prepared locally only. Forward remains exact `8a08e6163516f30f37c65313134170744330c4f4`; its source is unchanged. No branch was pushed, merged or deployed. Retain additive00106 and every immutable report/audit record. Never redeploy the unpatched baseline after00106: its Hermes report save reproduces SQLSTATE42P10.

| Service | Captured baseline | Minimal compatible fallback |
|---|---|---|
| Runtime srv-db37vbvlk1mc739o0b70 | 62ccbdbb94e080f22425f64396c894270ee551aa | 2d4d32e286ff71307417f7375985b85214c7a2e6 |
| CC srv-db37vbvlk1mc739o0b6g, MCP srv-db37vbvlk1mc739o0b7g | 1e4e21a773c88e2366915edd3bb2e307fddaa157 | 0f056d36f98413b7590a405294693c0b5fc18885 |

Candidate branches are `rollback/runtime-62ccbdb-compat-20261101` and `rollback/surfaces-1e4e21a-compat-20261101`. Each is a direct child of its captured baseline and changes only two SQL lines in `apps/production/src/hermesSourceFollowup.ts`. Exact patches and SHA256 measurements accompany this runbook in source-evidence.json.

The INSERT uses untargeted `ON CONFLICT DO NOTHING`, which respects either the old pair uniqueness or new triple uniqueness without naming a nonexistent constraint. Replay selects only original revision1 using `COALESCE(to_jsonb(r)->>'revision','1')='1'`; missing revision on00101 means1. The existing hash comparison rejects a different accepted payload. No UPDATE/DELETE, schema detection framework, migration, grant or policy change was introduced.

The sole caller is verifier.ts's accepted independently verified Hermes follow-up callback. All source/canonical hash, company, receipt, independent verification and expected payload/context checks remain identical. Other old report reads/writes were inspected: readGoalReview.ts, legacyReadDiagnostic.ts, readReviewContinuation.ts, kernel continuation.ts, continuityReadSidecar.ts, reliabilityReadTools.ts and command-center/store.ts. Existing old read-review paths conservatively block on an existing report; append-only ordinary writes default to revision1. They do not provide the forward revision recovery feature. This candidate repairs the actual Hermes save/replay path; it does not assert forward feature equivalence or native/service acceptance.

Focused reproduction uses the full exact pinned TypeScript modules (only import/export wrappers replaced), actual source/provenance/report queries, and unchanged00101+00106 SQL in disposable PGlite. The fixture seeds synthetic accepted execution/verification rows and invokes no source/model provider. Seven tests cover each baseline before/after00106, original42P10 after00106, candidate original first save/replay, revision2 physically preceding revision1, changed accepted hash rejection, foreign company and source independent-verification denial, forward-to-rollback replay, and pre00106-to-migration-to-forward-to-rollback history preservation. Existing original evidence history and report snapshots remain equal. Both candidate affected functions pass focused strict TypeScript checks.

Reproduce from the evidence checkout:

```sh
DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/hermes_rollback_compat_sql.ts
```

The unreachable synthetic pool URL only permits importing the existing fixture; all queries are routed to PGlite. Dependencies reuse the existing locked sam-company node_modules via temporary links, with no installation or modifications to that worktree.

Before any production mutation, parent must obtain recoverable current backup, independently review/verify these pins, validate native rollback under the existing restricted role and production service configuration, and complete the authorized release gate. No native role/RLS/concurrency, current backup/restore, service build/deploy/health or real report delivery has been demonstrated here. Preserve existing services/plans/environment and autoDeployoff; do not roll back schema or business history. Parent owns backup access, secret scan, publication and final evidence-linked archive.
