# Pinned application rollback candidates

Source checkpoint on 2026-11-01, before authenticated publication: candidates were prepared locally and no branch had yet been pushed, merged or deployed. Forward remains exact `8a08e6163516f30f37c65313134170744330c4f4`; its source is unchanged. The dated publication update below records subsequent isolated branch publication. Retain additive00106 and every immutable report/audit record. Never redeploy the unpatched baseline after00106: its Hermes report save reproduces SQLSTATE42P10.

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
# Authenticated publication and operational gate update

2026-11-01: reviewed source is now saved on isolated GitHub branches. The connector generated new commit metadata; exact trees and baseline parents were read back. Use the **remote** identities below when referring to published source. Original local identities in older receipts remain historical tested-source pins.

- Runtime: remote `53d37468807f79ae1ef27fa4de9221b35b684488`, tree `9cb7c3708b816c62c25fceb626d688e0317cb095`, parent `62ccbdbb94e080f22425f64396c894270ee551aa`; local tested `2d4d32e286ff71307417f7375985b85214c7a2e6`.
- Command Center/MCP: remote `2bdb33821ab913770e5f80860c21cf6501509a95`, tree `9c6e9b9dabbb68ae83db0fd054b6a6c143f3edfa`, parent `1e4e21a773c88e2366915edd3bb2e307fddaa157`; local tested `0f056d36f98413b7590a405294693c0b5fc18885`.

Both exact local candidates passed actual `npm ci --omit=dev` on Node24.22.1/npm11.9.0, preserving lockfile and source hashes. This closes dependency preparation only. Neither production entrypoint was started; no native report replay/service rollback was performed. Keep migration00106 additive during application rollback; do not attempt schema reversal or restoration over current production data.

Official Render login now succeeds. A current export `2026-11-01T19:34Z.dir.tar.gz` completed in the Recovery UI; it was not downloaded, checksum-verified or restored. PITR supports the last3days but creates a **new database**. Existing `sam-isolated-test` uses the production database with a synthetic schema and is not a restore destination; the other connected database belongs to WMS and is outside this task. No safe authorized existing native restoration target is evidenced. Do not click Start Recovery or deploy until that gate and native/service rollback acceptance close. See backup-recovery-observation.json and github-source-publication.json; historical statements above are superseded only where this dated update states new evidence.

Authenticated Customize Recovery cost observation (2026-11-01): root expanded all 23 compute plans in the official New Postgres recovery form at https://dashboard.render.com/d/dpg-db37k3rbc2fs73csjung-a/recovery/new/database/. No free plan was offered. The cheapest displayed configuration was 0.1 CPU / 256 MB compute at $6/month plus 1 GB storage at $0.30/month, displayed total **$6.30/month**, billed prorated by the second. Root clicked Cancel; Create Database was not clicked. No database was created or restoration completed. The specific paid alternative requires separate approval of that configuration, bounded lifetime and cleanup; current no-new-database/no-cost authority does not cover it. Recheck the displayed price before any approved creation.

## Completed authorized restoration trial and source-identity boundary

The owner subsequently authorized one monitoredUSD7, maximum24h restoration destination. Actual native restoration, full COPY-row equality, mapped ACL replay, isolated00106 and the synthetic CC/MCP/Runtime report/process rehearsal have now passed. The single temporary resource was deleted and independently observed absent at2026-11-01T21:59:55Z; its deleted billing row displaysUSD0.02 unbilled, not a final invoice. Metadata evidence is preserved; temporary raw data/credential copies were removed. These facts supersede only the historical uncompleted restoration/service assertions above. See [the final trial result](../restore-release-20261101/native-actual/RESULT.md) and linked receipts.

No production migration or deployment occurred. Exact8a-only forward authority does not include deliberate predeployment of the compatible fallback commits as a temporary bridge. A narrow owner source-SHA exception is required for runtime53d3746 and CC/MCP2bdb338 before00106, followed by exact8a for allthree. Retire unpatched instances beforeDDL; never infer worker drain from HTTP maintenance or a rolling deploy. Keep existing services, plans, environment and autoDeployoff. PR97 and main remain isolated/unchanged.
