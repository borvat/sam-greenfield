# Synthetic pilot: real development PostgreSQL acceptance

## Result

On 2026-10-10 at 22:53:45 UTC, the bounded case passed against the pinned
Replit DEVELOPMENT PostgreSQL database, heliumdb. It did not contact the
separate Neon pilot, a paid model, Google, or any company account.

Classification: **REAL_DEVELOPMENT_POSTGRES_LOCAL_MOCK_MODEL_NOT_NEON_NOT_PUBLISHED**.
This proves the existing release bundle/kernel integration, NOT the production
launcher, live model intelligence, Neon deployment, or production readiness.

The tested application/test source was based on commit
`100f74f48bd349fa35288037299df6bf240d44fb` with the intake fix and new test
in the worktree. The test was not a frozen-build live-model acceptance.

## Actual path and captured evidence

The model is a loopback HTTP mock, exercised through the existing DeepSeek
OpenAI-compatible adapter and original planner/plan validation. The mock derives
its proposal from the numeric objective received; the real local capability and
independent PostgreSQL verifier perform the calculation.

The ordinary authenticated HTTP goal endpoint receives a structured synthetic
sum objective and an independently supplied owner acceptance contract. An
unauthenticated request returns 401. The original planner persists and delegates
the plan. A real child process is SIGKILLed after plan commit, before ACT.
A new worker process runs the existing production composition and normal
work ticks; no test directly calls the tool executor or verifier.

The captured SQL assertions, before deleting the test schema, were:

| Evidence | Count/result |
| --- | --- |
| Primary goal | COMPLETED |
| Persisted plans | 1 |
| Delegated work items | 1 |
| Executions | 1 |
| Independent verifications | 1 |
| Goal-linked audit rows | 1 |
| Verification receipts | 1 (the same verification row, not another receipt table) |
| Actor distinct from verifier, matching plan/execution hashes, VERIFIED | 1 |
| Local model HTTP requests | 1 |
| Durable model reservations | 2 |
| Accepted model proposals | 1 |
| Real provider calls / paid model cost | 0 / $0 |

The second reservation represents an intentionally interrupted mock transport
with unknown outcome. No HTTP request is made for that attempt. A further new
process is refused before transport by the persisted two-attempt budget.
An extra normal worker tick after completion does not duplicate the execution.

There are 9 negative-test groups: four missing/foreign/sibling context
configurations, each checking zero visibility in six core/audit tables; plus
five refused DELETE/reservation UPDATE/TRUNCATE/DDL operations. These are
read-isolation and privilege tests, not a claim that every CRUD operation or
every production table has been exhaustively tested.

The sanitized runtime report is ignored by Git:
`.local/sam-dev/synthetic-pilot-postgres-acceptance.json`.
It preserves counts/assertions, not passwords, connection strings, raw errors,
model prompts, or a complete event timeline. The audit count is one; do not
describe it as a newly implemented full transition-audit system.

## Isolation and cleanup

Only a newly created `sam_replit_test_<numeric suffix>` schema and
`sam_pilot_test_<numeric suffix>` LOGIN role are used. No IF NOT EXISTS is used
to take ownership of pre-existing objects. Original migrations run only in the
new schema; pre-existing pgcrypto is required before migration.

The runtime genuinely authenticates as its non-admin, non-bypass, non-owner
LOGIN, not an owner connection with SET ROLE. Original release database admission
and inference-ledger ACL checks run against it. Temporary restrictive principal
policies supplement, rather than remove, original policies. Model reservations
cannot be deleted or have task/cost updated by this role. No privilege to read
pre-existing non-system tables is accepted.

The parent does not pass its administrative database URL or real model/OAuth
secrets to children. The model key and owner bearer are explicitly synthetic
fixtures. The temporary LOGIN password is generated in memory, never output
or written to the report, and ceases to be useful when the role is dropped.
This is test-only credential setup, not a new real-credential provisioning tool
or a guarantee about database-provider internal logging.

The schema marker is checked before DROP; only successfully test-created
objects are cleaned up. Captured result: schema removed=true, role removed=true.
The existing autonomy schema/role OIDs remain unchanged. This is a metadata
check, not a claim of a before/after row hash while existing workers run.
No existing development-service data is selected or modified by the test.

## Root cause repaired

The restricted principal correctly refused ordinary pilot intake because it
requested the global business-ID sequence. Only synthetic-pilot intake now
uses the validated legal entity's organization-scoped sequence. The global
sequence remains inaccessible. Ordinary non-pilot behavior is unchanged.

Fixture preparation initially used a nonexistent receipt-table name; this was
corrected to SAM's existing verification receipts. Both unsuccessful preparation
attempts were cleaned up and made no model HTTP request. Only the subsequent
successful case created the primary goal.

## Gates and limitations

- PASS: actual PostgreSQL persistence, restricted LOGIN admission, scoped RLS
  read negatives, authenticated intake, normal planner/delegation/worker,
  independent verification, owner criteria, completed goal, persisted receipts,
  real process restart after PLAN and no duplicate execution, durable budget.
- BLOCKED: production launcher TLS. The existing private development URL is not
  `sslmode=verify-full`. It is not relabelled as production readiness. Fixture
  environment flags select the release bundle in isolated child processes;
  no `start:release`/Publish command or production URL preflight is bypassed.
- NOT TESTED: ACT/VERIFY interruption, concurrent reservation races, every
  negative write path, a fresh complete SAST scan, real provider authentication/
  intelligence/billing, external Neon TLS/RLS, production hosting.
- Historical raw Replit SAST evidence remains 40 Critical / 0 Medium at
  2026-10-10T18:35:08.593Z; this case does not close those findings.

## Reproduction and focused regression

With an explicitly authorized development-only test session in the editor:

```
node --import tsx tests/release/synthetic_pilot_postgres.ts
```

It refuses any database URL host other than `helium` or database other than
`heliumdb`, then checks the saved cluster/database identity before any write.
It needs permission for a temporary test LOGIN/schema, not external resources.
Do not run it against Neon or production, or use its fixtures as deployment
credentials/configuration.

Focused checks after the fix:
- TypeScript --noEmit: PASS.
- Existing synthetic pilot unit test: PASS, 37 refusal cases / 7 local mock calls.
- Existing release contracts: PASS, fixture-backed process tests.
- Original phase19 command-center regression: PASS, separate disposable schema.
- Working-tree secret-pattern scan: 419 files, no detected token literals;
  real secret values were deliberately not loaded, full history not requested.
- Unauthenticated preview loads and remains AUTH REQUIRED; no signed-in visual
  acceptance is claimed.

No model fees, purchase or Publish was initiated. Existing Replit database and
Agent usage may consume account allowances; no account-wide billing audit or
zero-total-cost guarantee was performed.
