# Launch preparation: current SAST change review

Latest raw scan: **40 Critical / 0 Medium**, rule
`javascript.express.db.pg-express.pg-express`, engine version not exposed.
38 fingerprints match the prior reviewed scan. The previous local-capability
fingerprint was replaced after the import/line move, and the shared aggregate
now has one additional finding. No scanner suppression or rule disablement.
See `security-scanners.json` for exact current fingerprints and coordinates.

| Changed site | Source-to-sink trace and decision |
|---|---|
| `apps/development/src/localCapabilities.ts:18` | Existing scoped knowledge resolution: decoded key, configured entity and optional fact UUID are `$1/$2/$3` values in literal SQL. Sandbox/RLS/provenance checks unchanged. Original injection/isolation suites passed. **FALSE_POSITIVE_REVIEWED**, position replacement. |
| `packages/shared/src/localMath.ts:14` | Release numeric list is checked for safe integers, bounds/length and unknown fields; development keeps original scoped resolution. Independent algorithm uses literal `SELECT ... FROM unnest($1::double precision[])`, with `[values]` binding; no identifiers/fragments are constructed. Real PostgreSQL aggregates and 12 hostile/malformed parameter cases passed. **FALSE_POSITIVE_REVIEWED**, added finding. |

Raw Critical findings persist; this review is not a clean scanner result or
production authorization. Dependency/privacy scans: zero findings.

# Security findings ledger — SAM Greenfield

Baseline: `45294e263f497fb7a6e69e86264d0709756d5e16`, independently fetched
and matched to GitHub before editing (ahead/behind 0/0). The previous remote
`fa271f2` was no longer current. An ignored baseline archive was retained locally.

Scanner: **Replit SAST / `runSastScan`**. Engine/version is not exposed in the
callback; no other scanner engine is claimed. Baseline: **33 Critical + 1 Medium**.
Critical rule: `javascript.express.db.pg-express.pg-express`.
Medium rule: `javascript.pg.node-pg-hardcoded-secret.node-pg-hardcoded-secret`.
These are scanner severities, not proof of exploitable SQL injection.

## Individual source-to-sink review of all 34 baseline findings

Each Critical below is **REVIEWED_FALSE_POSITIVE for SQL injection** after
inspection of its actual callers, SQL text and parameter array. None was closed
solely because another query was safe. The driver is a real PostgreSQL client
from the pool/transaction or a pinned administrative development connection,
not an Express request. This is not a certification that every other security
property of these functions is correct.

Baseline line numbers identify the original scan; the machine scan snapshot
records current locations/fingerprints. `SQL` refers to the real PostgreSQL
adversarial suite, not a mocked database.

| ID | Baseline location | Actual input → sink and individual evidence | Verification |
|---|---|---|---|
| 01 | apps/brain/src/authorityGuard.ts:34 | Executive brain/replanner passes goal UUID to `evaluatePlanAuthority`; fixed SELECT, `id=$1`. No goal text enters SQL syntax. | SQL goal/UUID rejection |
| 02 | apps/brain/src/authorityGuard.ts:69 | Capability, canonical params hash, entity UUID and authority enter four bound values in the approval SELECT; conditions/order are constant. | SQL approval lookup |
| 03 | apps/brain/src/learning.ts:10 | Both verified learning functions pass execution UUID to private `requireVerifiedExecution`; fixed lateral verification SELECT, `$1`. | SQL verified execution fixture |
| 04 | apps/brain/src/memory.ts:29 | Context assembler supplies the count to `loadApprovedMemory`; constant predicates/order, `LIMIT $1`. Bad limit is a PostgreSQL type rejection, not another statement. | SQL memory/limit |
| 05 | apps/brain/src/worldModel.ts:19 | Context assembler's entity type/UUID are `$1/$2`; verification predicates and order are constant. | SQL world-model canary |
| 06 | apps/development/src/localCapabilities.ts:17 | `resolveValues` receives validated knowledge references from local executor/verifier. Reference key, fixed scope entity and snapshot fact UUID are bound; provenance joins are constant. | data boundaries/local capabilities regression; source trace |
| 07 | apps/development/src/planningPolicy.ts:81 | `assertDevelopmentGoal` uses goal UUID and fixed policy entity as `$1/$2`; owner objective/domain decisions happen after SELECT, not in SQL text. | data boundaries regression; source trace |
| 08 | apps/development/src/planningPolicy.ts:96 | Approved policy entity and fact allowlist enter `$1/$2::uuid[]`. Exact allowed values/statuses are checked separately; no memory query is synthesized. | data boundaries foreign facts regression |
| 09 | apps/event-fabric/src/index.ts:22 | `ingestEvent` binds source, external event reference, type, timestamp, JSON, dedup/provenance and internal outbox UUID. INSERT column list is fixed. | SQL event canary |
| 10 | apps/event-fabric/src/index.ts:42 | Duplicate event branch binds dedup key `$1`; fixed SELECT. Stored hostile text is not reinterpreted. | SQL duplicate event |
| 11 | apps/event-fabric/src/index.ts:50 | `nextEventForConsumer` binds consumer identity `$1`; selection and ordering are fixed. | SQL consumer |
| 12 | apps/event-fabric/src/index.ts:65 | Selected event fields plus consumer identity enter bound INSERT parameters; JSON remains data. | SQL inbox |
| 13 | apps/event-fabric/src/index.ts:79 | Consumer identity/dedup key bind to `$1/$2`; UPDATE statement is fixed. | SQL processed event |
| 14 | apps/kernel/src/queue.ts:18 | Planner/delegator's goal, plan, step, capability, JSON, priority, times and idempotency/operation references are bound; INSERT shape is fixed. | SQL queue/idempotency |
| 15 | apps/supervisor/src/health.ts:4 | Private `count(client,sql,params)` is only called inside this file with literal SQL statements. Its SQL argument is not exported or populated from HTTP/model/DB fields; thresholds are parameter arrays. | SQL health/count; all callers inspected |
| 16 | apps/supervisor/src/health.ts:81 | Lookback is `$1` in a fixed interval expression; multiplying/concatenating an interval value is not SQL text construction. | SQL invalid interval |
| 17 | apps/supervisor/src/incidents.ts:8 | Native supervisor/core read tools supply actor `$1`; active-incident CTE and ordering are constant. | SQL incident actor |
| 18 | apps/supervisor/src/incidents.ts:50 | Incident candidates use actor `$1` and JSON `$2`; INSERT does not turn incident content into SQL. | SQL incident opening |
| 19 | apps/supervisor/src/incidents.ts:83 | Resolution uses the same fixed INSERT and two bound data values, including old stored candidate content. | SQL incident resolution |
| 20 | packages/db/src/approvals.ts:15 | Native executor's capability, hash, legal entity, authority are four bound approval-selection values; locking/predicates constant. | SQL consume approval |
| 21 | packages/db/src/approvals.ts:38 | Approval UUID read under lock, derived counter, time/status are UPDATE parameters; no stored approval field becomes SQL text. | SQL approval update |
| 22 | packages/db/src/client.ts:31 | `setTenantContext` uses constant `set_config` calls; organization/entity are GUC **values** `$1/$2`, not identifiers/statements. | SQL GUC canary; separate RLS proof |
| 23 | packages/db/src/fencing.ts:8 | Queue UUID, lease owner text, numeric TTL are `$1/$2/$3` to fixed `acquire_lease`. Its original PL/pgSQL body contains no dynamic EXECUTE; TTL constructs an interval value only. | SQL lease owner; native stale fence regression |
| 24 | packages/db/src/modelCalls.ts:18 | All 12 model receipt fields, including names/reasons/JSON, are INSERT parameters. Unknown cost now remains NULL, not fabricated zero. | SQL model record/cost |
| 25 | packages/db/src/outbox.ts:9 | Native producers bind aggregate type/UUID/event type/JSON in fixed INSERT. | SQL outbox |
| 26 | packages/db/src/outbox.ts:32 | Batch limit is `$1`; locked selection/update SQL is fixed. No caller supplies SQL text. | SQL outbox batch |
| 27 | packages/model-gateway/src/health.ts:11 | Gateway passes lookback/threshold as `$1/$2`; window/circuit query is fixed. | SQL circuit breaker |
| 28 | scripts/development/autonomy-sessions.cjs:13 | Private migration helper issues a literal advisory-lock query; no goal/request values. Administrative entry is development-target pinned. | source call graph; sessions regression |
| 29 | scripts/development/autonomy-sessions.cjs:14 | Schema-column existence query is entirely literal; no request parameters. | source trace; sessions regression |
| 30 | scripts/development/autonomy-sessions.cjs:17 | Existing session metadata query is literal. Returned values are not reused as SQL syntax here. | source trace; sessions regression |
| 31 | scripts/development/autonomy-sessions.cjs:20 | Multi-statement administrative DDL contains config UUID interpolation, **not** arbitrary request text. `scope(config)` first enforces the two exact schema/role pairs and hex/hyphen-only UUID length; quote/semicolon/control characters cannot pass. No HTTP/model caller. | SQL denied session scope; sessions regression; lexical proof |
| 32 | scripts/development/environment.cjs:52 | Database/cluster identity query is literal. Pinned target fields are compared in JavaScript after execution, never inserted into SQL. | all development harness identity checks |
| 33 | scripts/development/goal-cycle-rls.cjs:9 | Private policy builder receives only closed local table/command/expression lists. Role matches the fully anchored finite `sam_(goal_cycle\|drive_read\|drive_content)_(app\|test_app)` family before interpolation. Arbitrary identifiers/expressions have no public caller. | SQL real policy installation + hostile role denied |
| 34 | packages/db/src/client.ts:7–9 | **FIXED: hardcoded credential-bearing fallback was executable development behavior.** Entire fallback removed in all modes; DATABASE_URL is required. This does not assert that the old default was a valid production credential or rewrite old Git history. | Child imports without DATABASE_URL fail closed in development/production; full regression uses explicitly scoped URLs |

## Four new scanner findings, independently reviewed

The new read-only telemetry module triggers the same rule at four query calls:

| Current location | Actual source → sink | Verdict/evidence |
|---|---|---|
| apps/supervisor/src/developmentTelemetry.ts:8 | Entire role/schema/GUC metadata query is literal; no input values or string composition. | REVIEWED_FALSE_POSITIVE; real non-owner role test |
| apps/supervisor/src/developmentTelemetry.ts:15 | Fixed queue aggregate; trusted entity/org UUIDs are `$1/$2`; explicit entity/org/domain joins plus existing RLS. | REVIEWED_FALSE_POSITIVE; foreign queue excluded, context mismatch denied |
| apps/supervisor/src/developmentTelemetry.ts:23 | Literal relation-availability query, no request or model input. | REVIEWED_FALSE_POSITIVE; fixture/current service execution |
| apps/supervisor/src/developmentTelemetry.ts:27 | Fixed receipt query; entity/org `$1/$2`, claim/goal/session equality, fixed window/limit. No legacy unscoped model-call aggregation. | REVIEWED_FALSE_POSITIVE; foreign provider fixtures excluded |

**Raw SAST remains 37 Critical, 0 Medium, incomplete=false.** No rule
suppression, finding deletion, scanner configuration change or query renaming
to evade detection was used. Manual closure is in this ledger; this is **not
“SAST returned zero”**. The four additions are reviewed, not silently discarded.
Dependency audit: no critical/high/moderate findings. Privacy scan: no findings.

## Executed evidence and limits

### Local readiness extension — 2026-10-09

The 37 previously reviewed Critical findings remain visible. The new scan has
**39 Critical / 0 Medium**, incomplete=false; no suppression was added.
The two additional findings use the same rule
`javascript.express.db.pg-express.pg-express`:

| Location | Fingerprint | Source → sink / disposition |
|---|---|---|
| `apps/kernel/src/leaseBudget.ts:17` | `fa8288d6fdde50c196894051ac0f1efed98e55eb03828fc0f8a2eab521f11315` | Typed PoolClient from native transactions; work identifier/fence from a locked PostgreSQL queue row. Constant UPDATE, `$1/$2` binding, status guard, RETURNING authoritative goal_id. Zero updated rows abort before goal/outbox changes. **Reviewed false positive for SQL injection.** |
| `apps/kernel/src/leaseBudget.ts:24` | `6702dc9e78753895e3dbd762fc9a64b492f5ea22923124dbe23b0a3ddb5b5d91` | goal_id comes from the successful UPDATE RETURNING, not the caller-supplied goal_id. Constant SELECT with `$1`, under the same transaction/RLS and row lock. **Reviewed false positive for SQL injection.** |

`fault_matrix.ts` checks two adversarial bound parameters against the real
database (invalid UUID / bigint SQL payloads → 22P02), stale-budget fencing
rejection, unchanged goal before valid exhaustion, exactly one exhaustion event,
and no execution after the attempt limit. This is additional to the 21 original
SQL-injection cases / 44 observed native-helper queries.

This is **manual source-to-sink closure, not a clean raw scanner result**.
Engine version is not exposed. Dependency audit: zero findings at all levels;
privacy scan: zero findings. See `security-scanners.json` for the fresh snapshot.

- `npm run test:development`: 27 suites passed; `npm run typecheck`: passed.
- SQL injection: 21 cases / 44 observed real PostgreSQL helper queries; hostile
  text remained bound, typed inputs rejected; no additional SQL statement or
  destructive effect. This suite uses an isolated administrative fixture schema;
  it is **not** the independent application-role RLS proof.
- Backup/restore: actual `pg_dump` + `pg_restore` between two newly created,
  independently checked synthetic databases; 23 tables/data hashes and policy/
  RLS metadata matched. Actual separate LOGIN/NOBYPASS/non-owner role: missing
  and foreign contexts denied; queue/outbox SELECT and UPDATE denied. Both
  databases and the temporary role were dropped.
- Quarantine lesson: a permissive policy is ORed with existing permissive
  policies and did not prevent a foreign GUC context in the first test.
  The synthetic restore fixture now uses a **restrictive** fixed-scope policy;
  the negative test subsequently passed. No existing development or production
  policies were changed.
- Native SIGKILL-during-ACT/lease recovery/idempotency and semantic wrong-intent
  rejection were rerun. These use real local processes/PostgreSQL with owner
  plan fixtures, not a new live model acceptance.
- Provider auth/usage tests use local HTTP and receipt fixtures. No provider
  authentication, paid call, OAuth, company document or model input was sent.
- Secret review checks known environment secrets and recognizable token forms
  across working files, evidence/logs and reachable Git blobs up to 2 MB.
  It cannot certify every unknown historical secret format or revoke an old
  credential. Values are never printed.

Production remains blocked pending independent production target/restore,
owner-approved least-privilege bundle/secrets, monitoring delivery and hosting
cost decision, fresh frozen-build live acceptance authorization and a separate
Publish decision. A reviewed development code gate is not production approval.
