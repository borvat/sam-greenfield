# PR #46 independent engineering review

Review date: **2026-10-22, Asia/Damascus**. Captured tools/database logs use UTC.
Verdict: **CONDITIONAL for a future standalone merge decision; not production-ready**.
No merge, deployment, production access or external business action was performed.

## Verified repository state and review scope

- PR: https://github.com/borvat/sam-greenfield/pull/46.
- Original reviewed head: `8b235bd887c2d86414a11bed5ffa625cba5b5d58`.
- Verified main/base: `b55da2761e8fd1de3833be55f03d4fdd268cd0a3`.
- GitHub's original test-merge ref: `bf587997c343d7d7a2f859289ede4b0099396b69`;
  its parents were exactly the above main and PR head. This confirms the observed
  base/head relationship through Git, without relying on the unavailable API.
- Corrective implementation: `4a3f35ae5b0888634958c67edff5e663ed577fe1`.
- Final tested source/test configuration: **`bdab0758c130d6f499a40437f43a12798beb857c`**.
  Subsequent evidence/documentation commits do not change application source.
- Original diff: exactly **112 files**, 2,404 insertions, 290 deletions. Each is
  recorded with a disposition, original content hash and diff hash in the
  [112-file inventory](reviews/2026-10-22/original-112-files.csv).

The review inspected the source/test/config diffs and relevant callers, checked
the historical log digests, reran tests, and challenged new failure cases against
an archived original PR head. Original passing results were not used as proof of
current correctness. Newly added review code/tests are separately recorded in
[machine-readable evidence](PHASE2_REVIEW_EVIDENCE.json). Draft/open status,
reviews and branch protection are reported by the requester or remain unverified
through the API; Git refs alone do not establish them.

The architecture remains a hybrid LLM planner plus trusted kernel, specialist
workers, tool gateway and independent readback adapters. No duplicate planning
engine, parallel persistence service or new external capability was added.

## Findings and scoped corrections

| ID | Severity | Finding, reproduction and resolution |
| --- | --- | --- |
| R1 | P1 | Planning held a transaction/connection while requesting nested transactions from the same pool. Sixteen concurrent calls with a two-connection pool caused 15 rejected calls in the archived-head rerun. Planning now commits one row-locked `SKIP LOCKED` deadline reservation, releases the connection, then runs the model/kernel work. Attempt/backoff/crash persistence remains durable; superseded reservations cannot overwrite the current attempt. [Planner](../apps/production/src/planner.ts), [failing original](reviews/2026-10-22/planningConcurrency-baseline.log), [regression](../tests/core/planningConcurrency.ts). |
| R2 | P1 | An operation's PENDING reservation committed before its approval and live-work binding. A real reconciler scheduled immediately after that commit observed the operation as unowned and reconciled it prematurely. Reservation, approval consumption and binding now commit atomically after rechecking the live lease. Missing approval rolls everything back; concurrent identical work consumes one approval and sends once per goal. [Executor](../apps/tools/src/executorFactory.ts), [shared transaction helpers](../apps/kernel/src/sideEffects.ts), [failing original](reviews/2026-10-22/reservationRace-baseline.log), [regression](../tests/core/reservationRace.ts). |
| R3 | P1 | Non-owner/non-bypass role flags plus valid tenant GUCs did not prove an immutable tenant binding. A synthetic unbound role passed the old admission check and could read another company's rows by setting its GUCs. A new read-only startup check requires the exact fixed restrictive policies for the current principal on every provisioned table, RLS, and no role memberships. Runtime/release compositions, ordinary production MCP and Command Center call it; Command Center also checks its configured company. [Admission](../packages/db/src/runtimeAccess.ts), [multi-tenant regression](../tests/core/tenantWorkload.ts), [entrypoint refusals](../tests/core/startupAdmission.ts), positive restricted workflow in [core child](../tests/core/restrictedChild.ts). |
| R4 | P1 | A deadline expiring after model success, while awaiting authority evaluation, could still persist a plan. A delayed real query reproduces the original failure. Both planning/replanning paths now recheck cancellation immediately before persistence. [Planning](../apps/brain/src/executiveBrain.ts), [replanning](../apps/brain/src/replanner.ts), [failing original](reviews/2026-10-22/deadline-baseline.log), [regression](../tests/core/planningDeadline.ts). |
| R5 | P2 | Learning selected an unfinished legacy goal's verified execution, then failed the stricter completed-goal check repeatedly, starving later completed work. Candidate selection now requires COMPLETED consistently with the learning boundary. [Selector](../apps/production/src/learning.ts), [failing original](reviews/2026-10-22/learningScheduling-baseline.log), [regression](../tests/core/learningScheduling.ts). |

Read executors also reuse the tenant already read during validation instead of
opening another nested transaction. Optional transaction-client arguments extend
the existing side-effect helpers without replacing their standalone callers.
No migration SQL or externally actionable permission was added by these fixes.

**Remaining reproduced P0/P1 defects in the isolated standalone PR scope: none.**
This is a bounded review conclusion, not proof that production or other branches
have no such defects. Combining the feature branches below remains blocked by
source conflicts and additional authorization work.

## Security assessment

Synthetic fixtures exercise four separately bound company principals. They are
not QNAN, BORVAT, NAN Trading or other real Surooh company data/accounts. Each
principal reads/writes only its own workload; spoofed and missing context are
denied. Non-owner/NOBYPASSRLS identity, privileged-role refusal, membership refusal,
protected metadata writes, explicit goal acceptance, stale leases, exact approval
matching, independent evidence and no-resend behavior are tested.

Production startup now deliberately rejects a legacy broadly granted or unbound
application login, including in ordinary MCP and Command Center. Migration and
application identities remain separate. An operator must provision reviewed
fixed-principal policies and trusted tenant startup context before a separately
authorized rollout. Startup performs no DDL, GRANT, role creation or backfill.
The synthetic-only MCP route keeps its existing narrower authorization/intake
contract; it is not converted into a general action surface.

Existing bearer, allowed-host/origin and synthetic OAuth issuer/audience/scope
boundaries are retained. OAuth/provider and MCP protocol fixtures were rerun with
local HTTP responses, including timeouts and refusal paths. No real token,
customer payload or credential store was read. Error paths keep upstream bodies
withheld. The image build retains TLS/checksum validation, uses the existing proxy
and an ephemeral CA secret, and runs as `node`.

Limits that remain material:

- Trusted runtime code/its database principal can write approval and receipt
  records; database-level separation of approver, executor and verifier identities
  is not implemented. No direct SQL tool is granted to model output. Separate
  identity/credential administration needs a dedicated threat-model phase.
- External provider credentials remain configured per process. Database tenant
  binding does not prove that the Google, bol.com or accounting account belongs
  to that company. Dedicated company compositions or explicit provider-account
  bindings must be verified before deployment; no live credential/account was
  inspected to establish that association.
- Independent readback is a separate query, not an independently secured process
  or cryptographic proof. Compromised trusted adapters are outside these tests.
- Provider exactly-once behavior is not claimed. Unknown outcomes require owner
  review; they are never automatically resent. Identical same-goal writes collapse
  intentionally; repeating one requires a separately authorized goal.
- Mutable list/readback ordering and eventual consistency can yield safe failures;
  provider-specific version/as-of rules, live scope validation and sustained
  provider behavior remain untested.
- The bounded parameter validator supports the repository's schema subset, not
  every JSON Schema keyword. Custom adapters remain responsible for their
  additional schema and provider semantics.

## Cross-branch compatibility

Remote branch names and SHAs are frozen in [branches.json](reviews/2026-10-22/branches.json).
`git merge-tree --write-tree` inspected combinations without modifying a checkout
or branch. **No unrelated branch was merged**. Results against implementation
`4a3f35a` (the later source commit changes tests/runner only):

| Work inspected | SHA prefix | Source conflict files | Combined SQL migrations applied |
| --- | --- | ---: | ---: |
| `fix/render-chatgpt-mcp-auth-design` | `66188db` | 5 | 13 |
| `feat/scoped-knowledge-cycle-20261021` | `cacc3a0` | 30 | 17 |
| `feat/perception-action-layer-20261021` | `af4be2e` | 27 | 16 |
| `feat/autonomous-research-learning-20261021` | `a3c5977` | 31 | 18 |
| `feat/cloud-mcp-autonomy-acceptance-20261021` | `583f71d` | 32 | 20 |

All five sorted SQL combinations applied successfully in separate disposable
schemas, with byte-identical shared migration files. Reservation of 00011 works:
the OAuth migration coexists with 00012/00013. Later branches additionally use
00099–00105. [Executed fixture](reviews/2026-10-22/combined-migration-fixture.cjs)
and [results](reviews/2026-10-22/combinations.log).

No combination had a clean source merge. Runtime composition, MCP authentication,
planner, executor, shared capability validation, verifier, lockfile and test/CI
conflicts require explicit integration decisions; a runnable combined worktree
would require resolving unrelated code, so no combined-code acceptance is claimed.
Existing multi-specialist orchestration was tested on this PR; the named cloud
autonomy branch is a relevant integration candidate, not proof of a fully
autonomous multi-agent system.

Specific integration requirements:

- The guarded managed-schema preparation intentionally accepts exactly the 12
  reviewed migrations. It must be separately reviewed/updated for any combined
  migration set; do not weaken that guard to make an integration pass.
- New OAuth/knowledge/research/perception/notification tables are not granted or
  fixed-principal-bound by this PR's provisioner. Some use mutable GUC policies or
  server-only revocations. Merely granting access when combining branches could
  reintroduce cross-company access. Extend/retest the relevant identity boundaries
  first; current absent grants keep those features unavailable to this runtime.
- Optional `ModelTask.signal`, result-bearing verification input and plan-step
  dependency fields are additive types. Required production goal acceptance,
  fixed-principal admission, changed plan hashes and goal-based operation keys
  are intentional behavioral changes requiring client/worker rollout review.
- Perception's `action:` operation keys and preflight must reconcile with this
  PR's `tool:` ledger identity; never introduce a second send path. Research's
  wildcard verification contracts must retain current-plan/hash/evidence checks.
- Notification code observes outbox rows independently, rather than taking over
  delivery receipts. Preserve that behavior and tenant labels when resolving the
  production event-loop conflict; no notification delivery was executed here.

## Acceptance, stability and performance evidence

[Logs and fixtures](reviews/2026-10-22) have SHA256 digests in
[PHASE2_REVIEW_EVIDENCE.json](PHASE2_REVIEW_EVIDENCE.json). Trailing whitespace is
normalized; failed original-head checks are retained as failed checks. Empty or
skipped test execution is not counted as a pass.

| Check | Executed result |
| --- | --- |
| `npm run typecheck` | PASS, exit 0 |
| `npm run test:core-regression` | PASS, 38/38 phase 1–21 entrypoints |
| `npm run test:core-reliability` | PASS, 8/8 suites: original 15 assertion groups plus seven targeted review suites |
| Same eight suites inside the fresh Node 22 image | PASS, 8/8 after PostgreSQL container restart; only tests/scripts mounted, image source/dependencies retained |
| Fresh no-cache Docker build | PASS; `npm ci --omit=dev` installs 23 packages; image `sha256:40889aea03b70679ad04ee8184689a6a42bd1274a488b77db7af01165297eeb1` |
| Focused provider auth, PostgreSQL TLS, release contracts, synthetic pilot and managed-schema source | PASS, 5/5 |
| Phase 0 static/SQLite/source, real PostgreSQL, tenant isolation and fail-closed security commands | PASS, all four commands |
| Clean migrations and 00001–00010 → 00012/00013 upgrade | PASS; 12 receipts, repeat apply skips all; pre-upgrade sentinel persists |
| PostgreSQL restart | PASS; pre-upgrade row and all 12 receipts retained |
| Transactional migration rollback | PASS; rolling back the new SQL batch restores baseline columns/data |
| Application rollback compatibility | **UNSAFE without draining dependency plans**, demonstrated using the exact main worker claim query; no production downgrade/restore performed |
| YAML parse, contents-only CI permission, three 10-minute jobs; `git diff --check` | PASS locally; hosted workflow evaluation unverified |

The bounded workload thresholds were encoded in tests before successful runs:

| Workload | Threshold | Host result | Clean-image result |
| --- | --- | ---: | ---: |
| 16 simultaneous planners, 12 healthy/4 failing model fixtures, pool max 2 | zero escaped failures, one attempt/goal, all healthy progress; <3,000 ms | 159 ms | 142 ms |
| Four fixed company principals, 20 writes each | 80 unique IDs; zero foreign reads; <3,000 ms | 919 ms | 33 ms |
| 350 pending events | batches ≤100 relay/consume, drained in four ticks without duplicates; <5,000 ms | 2,270 ms | 1,417 ms |
| Two simultaneous identical writes in one goal | one operation, one approval consumption, one synthetic send | PASS | PASS |

Core fixtures additionally exercise process exit 72 after synthetic provider
commit, restart/reconciliation without resend, expired leases/attempt exhaustion,
dependency-aware execution/typed propagation, wrong-content rejection and goal
acceptance. Startup tests reject the owner login before runtime/MCP/Command
Center serve requests. This is a small local contention test, not a throughput,
availability or long-duration soak benchmark. Real connection exhaustion, host
loss, network partitions and production stability results remain unverified.

## Actual commands and reproduction boundaries

Working directory was `/workspace/sam-greenfield`. A new fixture container was
used; no prior stability container was touched:

```sh
git fetch origin refs/pull/46/head:refs/remotes/origin/pr-46-head \
  refs/pull/46/merge:refs/remotes/origin/pr-46-merge \
  refs/heads/main:refs/remotes/origin/main
git show --no-patch --format='%H %P%n%s' origin/pr-46-merge
git diff --stat origin/main...8b235bd887c2d86414a11bed5ffa625cba5b5d58
docker run --detach --name sam-phase2-pg --label sam.scope=phase2-review \
  --publish 127.0.0.1:55433:5432 --env POSTGRES_PASSWORD=phase2-fixture \
  --env POSTGRES_DB=sam_core_test postgres:15-alpine
export SAM_CORE_TEST_DATABASE_URL=postgres://postgres:phase2-fixture@127.0.0.1:55433/sam_core_test
npm run typecheck
npm run test:core-reliability
npm run test:core-regression
node scripts/development/build-image.cjs sam-phase2:review
node /tmp/sam-phase2-combinations.cjs
node /tmp/sam-phase2-upgrade.cjs
docker restart sam-phase2-pg
```

The two executed `/tmp` fixture scripts are archived in the evidence directory.
They have hardcoded disposable loopback targets and assume a fresh fixture
container. Separate pg/assert queries confirmed the organization sentinel and 12
ledger entries after restart; the image then ran the full suites:

```sh
docker run --rm --network container:sam-phase2-pg \
  --mount type=bind,src=/workspace/sam-greenfield/tests,dst=/app/tests,readonly \
  --mount type=bind,src=/workspace/sam-greenfield/scripts,dst=/app/scripts,readonly \
  --env NODE_ENV=test \
  --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:phase2-fixture@127.0.0.1:5432/sam_core_test \
  sam-phase2:review node scripts/testing/core-reliability.cjs
```

Each focused command used the same guarded isolated runner with `--suite` and
`tests/release/{provider_auth,postgres_tls,contracts,synthetic_pilot}.ts` or
`tests/release/managed_schema_source.cjs`. The four Python entrypoints were
`tests/phase0/phase0_acceptance.py`, `tests/phase0_postgres/real_postgres_test.py`,
`tests/phase0_postgres/test_rls_tenant_isolation.py`, and
`tests/phase0_postgres/test_rls_fail_closed_security.py`, with `env -i`, PATH,
`PYTHONPATH=/tmp/sam-python-fixtures`, and only local fixture DATABASE_URL /
DATABASE_URL_APP. They used a separate `sam_core_test_security` database with
all 12 raw SQL files applied; the ledger's repeat-apply behavior was tested in
`sam_core_test_upgrade` separately.
Legacy Phase 0 log labels still mention historical migration counts/hashes; the
actual current runner records 12 migrations and the schema hash in the upgrade
log. Local PostgreSQL 15 does not exercise pgvector-specific operations from the
hosted job's image.

Negative reproductions used `git archive 8b235bd...` into
`/tmp/sam-phase2-baseline`, the unchanged lockfile-installed dependency directory,
and copies of the targeted new tests. Running the original runner with `--suite`
against planningConcurrency, reservationRace, learningScheduling and
planningDeadline failed on the archived source and passed on the corrected
source. The rollback fixture additionally extracts the exact worker SELECT from
`git show b55da27:apps/kernel/src/workerRuntime.ts`; it does not execute an old
worker or send an action.

## CI, PR documentation and merge conditions

These read-only API operations still return Forbidden:

```sh
gh api repos/borvat/sam-greenfield/pulls/46
gh api repos/borvat/sam-greenfield/commits/8b235bd887c2d86414a11bed5ffa625cba5b5d58/check-runs
gh api repos/borvat/sam-greenfield/branches/main/protection
```

Consequently, **no hosted CI success, required-check configuration, approved
review or current mergeability status is asserted**. The earlier transport
diagnosis identified proxy CONNECT 403; no alternative route or token extraction
was attempted. Existing authorized integration may inspect/update PR #46.

The existing workflow now has explicit `contents: read`, bounded concurrency and
job timeouts, all eight review suites through the default core command, focused
security/protocol fixtures and a clean-image job. The commands pass locally; YAML
parsing is not a substitute for a hosted run. Nothing disables a security check.
The updated full [PR description](CORE_RELIABILITY_PR.md) is prepared in the
branch; API editing may remain blocked and must be reported separately from the
native Git push updating the PR diff.

The **CONDITIONAL** verdict requires, before a future merge decision:

1. An authorized reviewer/integration verifies green hosted checks on the final
   head, required protections, approvals and the PR's actual draft state.
2. Reviewers accept the deliberate production admission/client-contract changes
   and the documented operator provisioning, unlabeled-event backfill and
   old-worker drain requirements. No mixed old/new dependency worker rollout.
3. Merge this change independently; do not treat the five conflicting feature
   combinations as integration-ready. Reconcile their identity/schema/event
   contracts in separate reviewed work.

## Production assessment and recommended next phase

**Production readiness: NOT ESTABLISHED.** No production role/grant/data audit,
live-provider authorization/readback validation, staging rollout/backup restore,
paid model hard-cap verification or sustained-load/stability result is available.
Original audit concerns about planning isolation, verification quality, uncertain
writes, tenant memory and owner credentials are mapped to the Phase 1 design and
the concrete checks above. A separate immutable original audit report was not
present in the repository, so a complete authenticated line-by-line comparison
to that earlier report cannot be claimed.

Next phase: controlled staging integration and operations hardening, preserving
the current architecture. Start with fixed-principal provisioning/negative tests,
explicit migration/backfill and rollback rehearsal, hosted checks, tenant-scoped
observability and budget limits. Integrate OAuth/knowledge/research/perception one
reviewed branch at a time with synthetic fixtures before considering authorized
read-only live canaries. Broader autonomous actions or multi-agent expansion
should wait for those gates.

No real companies' data or credentials, commercial transactions, paid models,
Render services or protected stability branches were modified. Only the labeled
fixture container/volume created for this review is removed at completion.

Publication result: the tested source was pushed and confirmed by native Git;
main and the protected stability branch retained their observed SHAs. Updating
PR #46’s body with `gh pr edit 46 --body-file docs/CORE_RELIABILITY_PR.md` was
blocked by GraphQL Forbidden. The branch contains the complete replacement body,
but the remote PR body was not changed by this session. Only the labeled
`sam-phase2-pg` fixture and its anonymous data volume were removed; the clean
image remains local.

A subsequent native Git check confirmed PR #46's head advanced to tested source
`bdab0758c130d6f499a40437f43a12798beb857c`. GitHub's refreshed test-merge object
`ddec2fc99e507f789d7cdaf50ec0822b9254c928` has parents main `b55da27` and that
tested source; its tree `667b73866d7830ba500d918483ea6da278e0f960` exactly
matches the tested source tree. This verifies the observed standalone source
combination, not hosted CI, approval or branch protection.
