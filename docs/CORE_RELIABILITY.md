# Core reliability engineering

Current merge review: [Phase 2 independent review](PHASE2_INDEPENDENT_REVIEW.md).
The earlier acceptance snapshot is historical; Phase 2 records subsequent fixes.

## Scope and source baseline

Development branch: `codex/sam-core-reliability`, based on main
`b55da2761e8fd1de3833be55f03d4fdd268cd0a3` (remote HEAD confirmed).
No deployment, production data/credential/role changes, business actions, or paid
provider calls are part of this work.

Relevant fetched branches were inspected without checking them out or merging:
`fix/planning-deadline-20261021`, `fix/runtime-tick-error-containment-20261020`,
and `test/recovery-report-control-history-20261021`. The latter is treated as
protected stability work. The feature branches contain substantial changes not
on main, including Render/OAuth work. They are not production evidence for main.
GitHub GraphQL access returned Forbidden; current PR status/reviews/checks and
branch protection settings are unverified. No existing remote branch is changed.

## Architecture impact

The existing Brain, Model Gateway, catalog, specialist workers, kernel and MCP
remain. Model output still proposes plans; trusted kernel code persists and
executes them. No additional externally actionable capabilities are registered.

- Planning reserves an attempt durably before a model request. Defaults: three
  consecutive attempts, 30-second proposal deadline, exponential backoff from one
  second to one minute. Success resets consecutive failures. Existing two-replan
  budget remains independent. Crash reservations defer another attempt until the
  deadline. Last-attempt ordering and short row-locked deadline reservations prevent a
  repeatedly failing high-priority goal monopolizing planning. Connections are
  released before model work and nested kernel operations.
- Cancellation reaches standard model HTTP transports; proposal timeout racing
  also prevents a late custom adapter response from persisting a plan. Database
  statements and connection acquisition are bounded. Custom adapters must honor
  cancellation to stop their own resource use.
- Replanning receives the previous plan and up to 16 execution/verification
  records, bounded to 64 KiB. Development and synthetic projections retain their
  stricter existing boundaries. Error records contain classified codes, not raw
  upstream messages.
- Production ticks relay outbox events and consume kernel events. Independent
  execution, verification, learning and operational errors are contained by stage.
  Kernel recovery/stream failures stop that tick rather than proceed blindly.
- Steps have durable keys, predecessor queue IDs and typed result references.
  Claims require the current EXECUTING plan and independently verified
  predecessors. Failed/cancelled/obsolete prerequisites stop dependent work.
  Resolution records an audit entry; invalid values fail the work and goal.
- Side-effect keys bind goal, capability and exact resolved parameters, surviving
  replans. A new PENDING operation is immediately reconcilable; legacy PENDING/NONE
  operations are admitted to reconciliation by the additive migration. Live
  leases are excluded. Confirmed operations reuse evidence without consuming a
  second approval. Unknown outcomes require owner review and are never resent. Reservation, approval
  consumption and live-work binding now commit atomically after lease validation.
- Standard read verifiers compare original content with a fresh read. Missing
  originals are INCONCLUSIVE; mismatches FAIL. Gmail checks sent label, operation
  identity, recipients, subject and plain-text content, with no existence-only
  success path. Required evidence fields and capability binding are enforced.
- New production owner/MCP goals need a machine-readable acceptance contract.
  `sam_execute` adds optional `acceptance_contract` (required in production).
  Unverified/uncompleted goals and mismatched receipt hashes cannot feed learning.
- Standard capability descriptions/schemas are shared with planning and validated
  before execution. Existing custom bundles retain adapter-owned validation when
  no schema is supplied. Ordinary connector requests have explicit deadlines and
  upstream error bodies are withheld.

Example dependency contract:

```json
{
  "steps": [
    {"stepKey":"research","capabilityId":"example_read","params":{}},
    {"stepKey":"analysis","capabilityId":"example_analyze","params":{},
     "dependsOn":["research"],
     "resultRefs":{"input":{"step":"research","path":["summary"],"type":"string"}}}
  ]
}
```

Top-level `dependencies` can alternatively map step keys to predecessor key arrays.
Both forms are normalized and checked for unknown keys and cycles. Typed result
references are limited to direct declared predecessors. All steps are bounded to
64; no implicit conversion of malformed parameters to empty objects occurs.

## Database and rollout contract

Existing migrations 00001–00010 are unchanged. Additions are 00012 and 00013;
00011 is reserved to avoid the observed unmerged OAuth migration numbering.
These two migrations add columns/functions/policies, not roles or credentials.

Operational RLS policies cover queue, plan, execution, verification, facts,
scoped memory, approvals, side effects and tenant-labeled event/model streams.
Legacy unlabeled stream rows remain retained and invisible to restricted runtime
roles until a separately reviewed ownership/backfill decision. No automatic
business-data copying or tenant inference is performed.

`provisionRuntimeAccess` is an operator-only transactional provisioning helper,
never a startup hook. It accepts an already-created restricted role and a validated
schema/org/entity, rejects privileged roles, memberships and ownership, grants
operational access, and adds restrictive per-role fixed-principal policies.
A caller cannot switch tenants merely by changing session settings. Model/contract
registries are SELECT-only, with runtime startup checking provisioned metadata
instead of mutating it. No user or financial-write grants are introduced.
Dedicated roles must be newly provisioned: this helper does not remove arbitrary
pre-existing grants and is intentionally not idempotent over an existing binding.

The standard production composition now runs the same non-owner/NOBYPASSRLS
admission checks as the guarded release path and requires tenant context. The
self-hosted Compose example requires `SAM_APP_DATABASE_URL` for services and keeps
migration credentials confined to the migration service. Production operators
must provision reviewed model/verification metadata separately; runtime does not
receive permission to alter it. Bound runtime business IDs include the org UUID
and use a tenant counter, retaining global uniqueness without global-counter access.
Unbound legacy IDs keep their prior format.

Future deployment requires a separate approval, backup, immutable image and:

1. Rebase/review against any newly merged OAuth/Render/stability changes. Test
   combined migrations and release admission; do not cherry-pick unrelated actions.
2. Stop/drain workers, preserve the side-effect ledger and pending work, and apply
   the two additions through the authorized migration identity.
3. Provision dedicated application identities/fixed tenant bindings and reviewed
   capability/provider/verification metadata. Require verified TLS for external DBs.
4. Supply application-only connections with trusted org/entity context. Update
   clients to submit acceptance contracts. Internal finance-resolution goals also
   require reviewed goal-specific criteria; do not infer success from a read.
5. Run isolated acceptance and staging negative tenant tests before any separately
   authorized, read-only live canary. No such staging/live deployment was performed.

Rollback: stop workers first; do not drop receipts, ledger, columns or policies.
Restore the previous image only after schema/permission compatibility checks.
Do not run old workers against plans containing dependencies: they do not enforce
this contract. Drain/cancel such plans through an approved operational procedure,
or roll forward. Recover from a reviewed backup only under a separate approved
restore procedure. This is a rollback plan, not a tested production rollback.

## Reproducible local checks

Install with `npm ci --include=dev` and use Node 22 (CI/Docker). Current local
validation used Node 24.19.0 and PostgreSQL 15.19 from a disposable Docker container.
The host has no PostgreSQL server/client installation. Test runners sanitize child
environments and reject non-loopback or non-`sam_core_test*` database targets.

```sh
npm run typecheck
# Set SAM_CORE_TEST_DATABASE_URL to an independently created disposable local DB.
npm run test:core-reliability
npm run test:core-regression
# Focused local protocol/security fixtures:
node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```

Baseline: all 38 original phase 1–21 TypeScript entry points passed on an archived
copy of main in isolated schemas before final comparisons. Baseline typecheck
passed. The final results and exact commands are recorded in `CORE_RELIABILITY_EVIDENCE.json`.

The core suite exercises failure isolation/fairness/backoff/redaction, late-response
timeout, attempt exhaustion, invalid graphs/parameters, verified dependency order,
typed propagation/restart, content/evidence rejection, Gmail content, real child
process loss after synthetic provider commit, consumed-approval recovery, same-goal
replan deduplication, event delivery, restricted application workflow, cross-tenant
and spoofed-context rejection, lease budgets and request timeout. Fixtures only.

Legacy tests were updated to supply actual comparison results/required evidence,
explicit tenant-scoped memory, and the new migration count. The Drive mock now
honors filename filtering rather than returning unrelated newly created folders.
Assertions were not disabled to accommodate weaker verification.

## Remaining limits

This is not production-ready acceptance. Live provider behavior, existing Render
services, current production grants/data, continuous stability tests, production
backup/restore and hosted GitHub CI have not been verified. Replit-specific launch
and development fixtures require their platform-specific identity/policy setup.
The repository has no lint script or compiled build target; typecheck and the
frozen dependency/container contract are the relevant build checks.

Readback equality deliberately treats changing source content as a mismatch;
resource-specific version/as-of rules are a future extension. Gmail HTML-only or
insufficiently observable content remains INCONCLUSIVE. Exactly-once effects at
external providers are not claimed: uncertain outcomes block for owner review.
Same-goal identical writes collapse to one operation; intentionally repeating an
identical write needs a separately authorized goal. Formal policy administration,
general autonomous research and multi-specialist reasoning are not added here.
Model-price defaults and provider billing hard caps still require a separate cost
control phase before broad live model use.

## Acceptance rerun

The acceptance blockers were investigated on the requested `12f988f` baseline.
Tested implementation commit: `3aee07abf2d7f48a3f8f90f02602ddd263ebf2bd`.
The clean Docker build now passes with the reusable
`node scripts/development/build-image.cjs sam-core-reliability:acceptance` command.
BuildKit's configured proxy DNS failure caused npm's misleading exit-handler
error. The helper supplies the host-resolved address of that same proxy and the
existing CA without disabling verification. Docker copies now set ownership so
owner-only checkout modes remain readable by the non-root runtime user.

All 38 regression suites, 15 core groups on host and freshly built Node 22 image,
TypeScript, five focused suites and four Phase 0 commands pass. Isolated migration
upgrade/repeat apply, PostgreSQL restart persistence and image startup/restart
checks pass. GitHub API transport still fails with proxy CONNECT 403, so no PR
creation or hosted CI success is claimed. A manual Draft PR form link and full
command/output evidence are in [the acceptance report](CORE_RELIABILITY_ACCEPTANCE.md).

These are local fixture results, not production readiness. No live providers,
production services/data/credentials or ongoing stability tests were changed.

## Independent review follow-up

Phase 2 corrected pool starvation, reconciliation interleaving, missing fixed-tenant
startup attestation, post-proposal deadline persistence and learning candidate
starvation. Production runtime/release compositions, ordinary MCP and Command
Center refuse missing fixed-principal policies; role memberships are forbidden.
Provision identities and trusted tenant context through a separately authorized
operator workflow; startup does not mutate grants or policies.

The default core command now runs eight isolated suites. The clean image passes
all eight with fresh production dependencies; 38 regression suites, TypeScript,
Phase 0 and focused security checks pass. Hosted checks remain unverified.
See the Phase 2 report for exact source SHA, negative original-head reproductions,
small-workload thresholds, cross-branch conflicts and conditional merge verdict.
