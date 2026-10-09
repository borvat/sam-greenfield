# Local Release Readiness Evidence Pack

## Decision

**PASS_LOCAL_WITH_REVIEWED_SCANNER_WARNINGS / BLOCKED_PRODUCTION.**

Baseline: `068b1d142cd837b713a3f7d4d9ce13daca7aefc0`, independently matched
GitHub main before edits. The resulting commit carries this pack; its exact
identity is reported after committing and checking the remote. The tested code
digest is included in `local-gates-evidence.json`; generated receipts are not
claims of live model acceptance.

## Gates and limits

| Gate | Result | Actual evidence / boundary |
|---|---|---|
| Regression / typecheck | PASS | 28 suites, strict typecheck, SQL tests, auth/isolation suites. Full log `.local/sam-dev/local-readiness-regression.log`. |
| Isolated restore | PASS_SYNTHETIC_REAL_POSTGRES | Three new scratch databases, original ten migrations only on fresh source, real pg_dump/pg_restore into two clones. 23 tables, row hashes, policies/RLS and detected SQL sequence states compared. UUID generation and native transactional business-ID counter advance tested. No production database. |
| Rollback | PASS_READ_ONLY_SURFACE | Actual archived code for 45294e2 and 068b1d1, then baseline→current working code→baseline, using the native DB client and native incident reader under direct nonowner/nonbypass LOGIN and READ ONLY transactions. Nonempty audit and synthetic legacy model receipt hashes invariant; worker never started on restore. This does **not** prove whole-app/production worker rollback. |
| Quarantine / ACL | PASS_FIXTURE | PUBLIC table access and schema CREATE revoked; restore-clone PUBLIC CONNECT revoked; reader only SELECT on goals/audit/model_calls. Missing/foreign goal context denied; queue/outbox reads/writes, DDL, audit/receipt writes denied; append-only trigger tested even with administrator. Fixture-scoped policies are not production policy approval. Pending work preserved and zero restored executions. Three databases / role / current dump+archives removed. |
| Fault matrix | PASS_REAL_LOCAL_WITH_PLAN_FIXTURES | Four actual SIGKILL points: before ACT; after execution commit; during native independent VERIFY readback; after verification commit. Native restart recovery, one local artifact/execution/verification, completed goals. Earlier artifact-before-execution crash and actual DB TCP refusal rerun. |
| Concurrent VERIFY | PASS_AFTER_ROOT_FIX | Two native SQL readers race on one execution while a second plan step is outstanding. Before fix: 2 verification rows. Now same independent receipt reused under execution lock, one row; conflicting result rejected. No mock verification result. |
| Lease/retry/fencing | PASS_OPT_IN | Two natural expiries under configured limit 2; terminal FAILED goal/work, no execution, one exhaustion event, stale fence rejected. Malformed limits and two SQL payloads rejected. Unconfigured original behavior remains available and tested. Release default 3; separate from process restart/model budgets. |
| Observability | PASS_LOCAL | Old/stuck/in-flight/error conditions, future-clock rejection, provider 401/403/429/503 fixtures, secrets-canary exclusion, scope mismatch and foreign receipt exclusion. Real PostgreSQL 1000 vs 1001 receipt limit: truncation sets total cost NULL and alerts, not zero. Unknown usage/tariff stays NULL. No external alert/outbox write. |
| Preflight contracts | PASS_LOCAL_ONLY | Fail-closed configuration/target/login/tenant/host/origin/bundle/capability/MCP-token gates, stripped provider/OAuth child environment, lease budget validation. Synthetic configuration only: no real credentials generated, new OAuth grant, or production preflight connection. |
| Security | PASS_REVIEWED_NOT_ZERO_SAST | Raw 39 Critical / 0 Medium, all individually reviewed (37 inherited, 2 new). No suppression. Dependency/privacy scans zero. Scope-limited secret/history/log scan reports no matches, not a guarantee for every unknown secret format. |
| LIVE model acceptance | NOT_RUN | Zero new paid/model calls; all plans and provider receipts in these tests are declared synthetic fixtures. |
| Production restore / rollout | BLOCKED | No production backup, restore, RPO/RTO, hosting, credentials, bundle or Publish decision established. |

## Root fixes, not replacement implementation

- Verification receipt idempotence under the existing execution lock, with
  conflicting evidence/result rejected and independence requirements preserved.
- Opt-in lease attempt budget in native claim/recovery; authoritative returned
  goal ID, stale/terminal fence refusal, ordinary terminal state transition.
- Future heartbeat no longer appears healthy; 5xx provider errors have an
  actionable local alert. No network retry or external notification added.
- Each fault scenario uses its own sandbox; the original two-goal intake guard
  was not raised. Additional policies/grants exist only in disposable synthetic
  restore fixtures. Original migrations unchanged.

## Separate owner decisions still required

1. Fresh frozen-build live-model acceptance with a new explicit model/budget
   authorization; previous closed sessions stay closed.
2. Independent production database/provider, least-privilege roles and migration
   approval; isolated production-like backup/restore, retention, RPO/RTO.
3. Approved production capability bundle/data scope, separate real credentials
   and auth/optional OAuth contracts, without importing development fixtures.
4. Hosting price/resource decision and production monitoring/alert delivery;
   historical/scoped estimates do not prove a complete tenant invoice.
5. Security policy acceptance of documented raw scanner warnings (or independent
   review if required), then a separate explicit Publish approval.

No Publish, production migration, company data, commercial Gmail/Drive, email,
financial/legal operation, Lovable change, purchased resource or wider OAuth
permission occurred in this task.
