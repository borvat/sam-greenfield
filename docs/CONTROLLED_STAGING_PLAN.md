# Controlled staging integration plan

Prepared 2026-10-22 (Asia/Damascus). **Plan for review; no staging deployment or
remote database/identity change was performed.** Scope: PR #46, with a separate
review for each later feature integration. This plan does not authorize billing
changes, paid resources, live company data, provider consent or external actions.

## Entry gates and first profile

1. An authorized account owner confirms that the GitHub Actions account lock is
   resolved within existing authorization. A maintainer then authorizes one run
   on the frozen candidate. All three jobs must actually start and pass; a green
   local replay or a missing log is insufficient. Do not skip required checks or
   move work to another account/runner to evade the lock.
2. An authorized maintainer verifies effective main-branch rules, required checks,
   approvals and draft state. The public branch page currently reports no classic
   branch protection; inherited rules and approval requirements are unverified.
   Record the accepted gate configuration without changing it in this task.
3. Identify an existing, approved isolated staging resource and its database/server
   identity. If unavailable, staging remains blocked. No paid provisioning,
   production clone or production credential is part of this plan.
4. Freeze source SHA, dependency lockfile, migration manifest and built image
   digest. Keep the current twelve-migration core profile separate from each
   future combined profile. Obtain specific execution authorization for staging
   before starting services, creating remote roles or applying SQL.

First profile: **synthetic data, one synthetic company, local arithmetic, no model
adapter and no business connector**. Reuse
[`localReleaseBundleModule.ts`](../apps/production/src/localReleaseBundleModule.ts)
and [`releaseCompositionModule.ts`](../apps/runtime/src/releaseCompositionModule.ts).
The release composition rejects side-effect tools and unauthorized capabilities.
Do not use the broad production compose/default bundle as a staging shortcut:
it includes provider configuration and an optional financial operational loop.

The local release bundle has no natural-language planner. NEW owner goals will
not become autonomously planned simply because services are healthy. Use reviewed
structured fixtures through the existing kernel test harness for execution proof;
do not expose arbitrary SQL or claim autonomous goal intake. Initial MCP is the
existing read-only release surface, not an action or synthetic-planner surface.

## Database identities and tenant boundaries

| Identity | Intended scope | Required evidence |
| --- | --- | --- |
| Staging owner/migrator | Reviewed schema/extensions/metadata, no application use | Separate credential and target identity; no startup migration hook |
| Worker application login | Operational tables for exactly one synthetic org/entity | Direct LOGIN, non-owner, NOSUPERUSER/NOBYPASSRLS, no role memberships, no DDL/TRUNCATE/TRIGGER privileges |
| Command Center / MCP logins | Distinct service credentials, same explicitly bound synthetic company | Fixed policies and scoped negative tests; MCP never inherits migrator credentials |
| Observer | Selected redacted counters through authenticated endpoints or a separately reviewed read-only role | No SQL mutation, secrets, message bodies or cross-company aggregation |

Reuse the operator-only
[`provisionRuntimeAccess`](../packages/db/src/runtimeAccess.ts) with its existing
transaction contract. It creates neither roles nor credentials. Its CREATE POLICY
operations are not a blind retry/idempotency interface: inspect existing policies
and compare them before any authorized repeat. Never use GRANT ALL or weaken RLS.

Startup must pass `assertRuntimeTenantBinding`, including all provisioned fixed
restrictive policies and trusted org/entity context. Merely setting session GUCs
or using a non-superuser is insufficient. Bootstrap metadata separately through
the authorized migrator; runtime provider/verification synchronization validates
preprovisioned rows in production mode instead of writing them.

The current provisioner grants operational approval/receipt writes to trusted
application code. It does not provide database-level approver/executor/verifier
separation. Review finer service ACLs against actual call paths; do not revoke
approval-consumption writes blindly and declare the worker operational. External
writes remain disabled in this staging profile.

Use direct connections with verified TLS/DNS identity for remote staging,
following [`scripts/release/contract.cjs`](../scripts/release/contract.cjs).
No transaction-pool proxy is approved by that contract. The contract's existing
`production` mode/target names describe its strict security envelope; they do
not authorize connecting to production. Independently verify the staging target.

Capacity must be approved before startup: the current pg pool defaults to ten
connections **per process**, with 5-second connection acquisition and 30-second
statement limits. A worker plus Command Center can therefore require up to twenty
connections; enabling MCP adds another pool. Four tenants in a unit workload are
not proof that twelve service processes fit a staging database. Start with one
company and minimal services; reserve operator/observer headroom. There is no
implemented generic pool-size environment setting to assume here.

Required negative checks: other entity in the same org, another org, missing
context, spoofed context, foreign goal/plan/receipt IDs, role membership, metadata
mutation and owner-login startup. Require zero unauthorized rows or writes.

## Migrations and data

- Current profile: immutable 00001–00010 plus additive 00012/00013; 00011 is
  reserved for the unmerged MCP OAuth work. Record every filename and checksum.
- Test clean creation, upgrade with a preexisting synthetic sentinel, repeat
  apply/checksum matching, transaction rollback of the new batch, then restart.
  Phase 2 provides local evidence; repeat against the specifically authorized
  staging target before claiming staging acceptance.
- For a later OAuth profile, test both fresh sorted order including 00011 and
  adding 00011 after an already-applied 00012/00013 ledger. Schema coexistence is
  established locally; that does not prove all upgrade/permission combinations.
- 00013 leaves old unlabeled operational rows invisible to restricted principals.
  No automatic JSON-based tenant inference or bulk backfill is authorized.
  Staging should use fresh synthetic data; any retained historical row needs a
  reviewed provenance-based labeling decision before it can be processed.
- The managed development-schema generator intentionally accepts exactly twelve
  reviewed migrations. It is not a remote staging/prod migration command. Any
  combined migration set needs an explicit manifest/guard/test update; never
  remove the count/hash/empty-source checks merely to admit another branch.

Do not copy real QNAN, BORVAT, NAN Trading or other Surooh records into staging.
No finance/inventory/pricing/purchase mutations, outbound mail or customer messages
are allowed. Preserve ledger/audit semantics even for synthetic provider fixtures.

## OAuth, MCP and provider identity

First profile: no provider credentials, paid model adapter or Google/Bol/accounting
connection. Keep `SAM_MCP_SYNTHETIC_TOOLS` and paid synthetic planner activation
off. Current synthetic OAuth fixtures can validate issuer/audience/scope refusals
locally without enabling a live model-backed submission endpoint.

For each later separately authorized auth integration:

1. Choose one reviewed authentication contract. The current synthetic JWT resource
   and the unmerged internal opaque-code OAuth server are different mechanisms;
   do not combine them through permissive fallback authentication.
2. Use test identities, exact HTTPS resource/issuer/client/redirect allowlists and
   short lifetimes. Test PKCE/state/code single use, redirect mismatch, wrong
   issuer/audience/company, expired or missing claims and denied scopes. Store
   authorization artifacts hashed and provider tokens sealed as designed; no
   token enters a prompt, memory, URL log or evidence artifact.
3. Ordinary production MCP and Command Center must use bound application logins,
   separate bearer secrets and exact host/origin settings. The initial release
   MCP surface exposes only release observations. Do not turn its read-only
   profile into `sam_execute` by adding a mutation dispatcher to it.
4. Before any future provider read, independently bind the test provider account
   to the synthetic company. DB RLS does not prove that a process-configured
   Google/Bol/accounting credential belongs to that entity. Do not share one
   unconstrained bundle/credential across company instances.
5. Request only specifically approved test scopes. Metadata-only Drive reads do
   not imply consent for file contents; a read-only adapter does not prove the
   upstream OAuth grant is narrow. No send/write grant or live customer account
   validation is authorized by this plan.

## Safe integration order and conflict decisions

The [frozen conflict manifest](phase3/2026-10-22/cross-branch-conflicts.json)
records the current SHA and every conflicting path. These are cumulative branches,
not independent modules that can be merged wholesale in the table's order.
Future integration must isolate a coherent change into a separate reviewed PR,
resolve its explicit overlaps, and rerun the full acceptance envelope. **No such
branch merge, cherry-pick or conflict resolution was performed here.**

| Order | Work to integrate | Current conflicts | Acceptance decision before advancing |
| --- | --- | ---: | --- |
| 0 | Standalone core reliability PR #46 | Clean Git test-merge observed; hosted checks blocked | Account gate cleared, hosted checks pass, governance verified |
| 1 | `fix/render-chatgpt-mcp-auth-design` (`66188db`) | 5 | Preserve fixed-principal admission, async composition loading, MCP auth and current lockfile; admit 00011 through reviewed metadata/grants |
| 2 | Google read/review foundations represented by `feat/perception-action-layer-20261021` (`af4be2e`) | 27 | Review 00099/00100 token storage and 00101 read reviews; fixed tenant policies and provider/account binding, mock reads only |
| 3 | `feat/scoped-knowledge-cycle-20261021` (`cacc3a0`) | 30 | 00102, verified lineage/expiry/entity constraints; no unverified inference promoted to fact |
| 4 | `feat/autonomous-research-learning-20261021` (`a3c5977`) | 31 | 00103, operator allowlisted MCP source/capabilities; retain current-plan/hash and fresh evidence checks |
| 5 | Actual monitors/actions/notifications in `feat/cloud-mcp-autonomy-acceptance-20261021` (`583f71d`) | 32 | 00104/00105; tenant bindings, disabled action routing, no duplicate ledger or event consumer |

The branch named perception at `af4be2e` does **not** contain migration 00104;
the actual monitor tables are in the later cumulative cloud branch. Names alone
are not capability evidence. Reuse the existing specialist queue/orchestration;
do not create another executive or claim general multi-agent intelligence.

Every new table must get reviewed service grants and immutable principal binding
before access. Current absent grants make these features unavailable. Adding
grants to a new table with only mutable GUC policies could enable cross-company
spoofing. Reconcile perception's `action:` keys with the existing `tool:` operation
ledger, approval consumption and lease checks before even synthetic writes.
Notifications must observe durable outbox/fabric records without stealing delivery
receipts; keep routing disabled/UNROUTED and do not send messages.

## Rollback and recovery

1. Stop new intake and scheduled monitors; request graceful shutdown with the
   existing supervisor. Record the in-flight goal/plan/work IDs, fencing tokens,
   ledger states and last processed event cursor. Respect the bounded shutdown
   envelope; a forced process stop requires reconciliation, not resending work.
2. Preserve the additive schema and operation/evidence ledger. Do not run old
   workers against dependency-bearing plans: the exact old main SELECT was shown
   to claim an unverified dependent. Drain/cancel those plans through an approved
   scoped procedure or roll forward to a compatible image.
3. Restore only into a separate quarantined staging database. Restore/provision
   roles separately (a database dump does not create every cluster role), then
   verify owner separation, fixed policies, hashes, receipts and tenant boundaries.
   Keep workers, outbox delivery and provider actions stopped during validation.
4. Resume with exactly one compatible worker set after review of uncertain
   PENDING/SENT operations. Unknown outcomes require owner review. Never clear the
   ledger, reset approvals or replay notifications merely to obtain a passing run.

Define approved retention, RPO/RTO and backup/restore ownership before execution.
The transactional rollback fixture is not a backup restore or production rollback
rehearsal. These operational requirements remain staging execution blockers.

## Observability and bounded exit criteria

Reuse existing endpoints and structured logs; no monitoring subscription or new
telemetry service is required by this plan:

- `/livez`: process alive. `/readyz`: dependency/recovery readiness, not proof of
  goal success. `/statusz`: authenticated runtime counters; unauthenticated access
  must be 401. The release wrapper supplies the Command Center bearer for private
  worker status; MCP keeps its separate bearer. Do not expose worker internals.
- Retain `WORK_TICK_FAILED`, `RUNTIME_STAGE_FAILED`, planning failure codes,
  dependency/lease exhaustion and reconciliation-review events. Select only
  tenant-scoped IDs, counts, ages and reason codes; no raw params or provider body.
- Snapshot pending outbox/inbox counts and oldest age, queue state/lease attempts,
  planning backoff, uncertain operations, verification outcomes, pool waits and
  restart counts. The current status endpoint does not export every DB metric;
  use a separately reviewed scoped query rather than claiming an existing full
  observability stack.

Proposed staging exit gates (not executed staging results):

| Gate | Required evidence |
| --- | --- |
| Tenant boundary | Zero foreign rows/writes for four synthetic principals and missing/spoofed context; owner/membership startup refused |
| Execution integrity | One operation/approval consumption per identical goal/capability/parameter intent; no resend after synthetic process loss |
| Dependencies/evidence | Verified predecessors required, typed results propagated, wrong content/acceptance rejected, late plan not persisted |
| Bounded load harness | Existing 16-planner/two-connection, 80-row/four-company and 350-event/four-tick tests meet their encoded 3s/3s/5s limits on the nominated resource; failures remain failures, no automatic threshold relaxation |
| Service stability | Owner-approved bounded observation window with no unexpected egress, secret logging, stuck recovery or unbounded retry; duration/resource budget must be specified before launch |
| Recovery | Quiescent synthetic checkpoint, separate restore, policy/receipt validation, safe worker resume; agreed RPO/RTO measured |
| Cost/action boundary | Zero real model calls, external writes, messages or commercial changes; any unexpected attempt stops the rehearsal |

An existing production stability test is never a staging workload generator or
an acceptance dependency to interrupt. Preserve its branches, services, database
and schedule. Staging is **not ready to execute** until the above gates have
owners, approved resources and explicit authorization; this document alone grants
none of them.
