# SAM × Hermes: implementation checkpoint, NOT live integration acceptance

Status: **IMPLEMENTED (limited candidate transport); hosted integration BLOCKED**.
No claim that SAM can currently execute a user goal through Hermes. No production change,
deployment, credential grant, hosted restart, paid call or additional resource was performed.

## Observed running systems

Read-only Render discovery and authenticated service-local HTTP probes on 2026-10-25 UTC
(2026-10-26 Damascus) established:

- SAM repository: `borvat/sam-greenfield`. Isolated application deployed at
  `3e0efe72a2e54ba015c81d4d145b0771d4169fc6`; this branch builds on its documentation
  checkpoint `53c5519`. Existing queue, authority, execution and independent-verification
  paths are retained. Runtime composition remains maintenance-only; no default registration.
- The isolated SAM service reports storage profile `disposable`, no restricted binding path,
  and no Hermes URL/key. Existing nine-check API smoke reports PASS and explicitly reports
  `liveReasoningValidated:false`. This is evidence of the existing deployment, not this adapter.
- Authenticated Hermes `/health/detailed` reports version `0.22.5`, readiness `ok`.
  Live image digest: `sha256:fd822bae0a61bf023450737edbeaeea5fc6460f17cb4ee240a7e67b306ed63fb`.
  Render reports a 1 GiB persistent disk at `/opt/data` and 0.5 CPU / 512 MiB compute.
- `/v1/capabilities` advertises runs, status, stop, and durable run idempotency with 86,400
  seconds retention. `/v1/toolsets` reports terminal, file writes, code execution, delegation,
  scheduling and other tools enabled. Installed source constructs tools from server policy,
  not the SAM task's `allowed_tools` field. Model-supplied text cannot narrow that authority.
- Safe configuration-field inspection shows the configured default model
  `poolside/laguna-s-2.1:free`, provider `nous`, and `max_concurrent_runs:10`.
  No model invocation was performed in this work. No new claim of model availability,
  free quota, fallback absence or billed cost follows from a configuration value.
- Render samples for the current Hermes instance were approximately 218–262 MiB memory,
  with a 512 MiB limit. These are observations during discovery, not a load test or a safe
  concurrency measurement. Keep SAM concurrency at one.
- GitHub branch-protection read was refused with 403 (`Resource not accessible by integration`).
  Protection is UNKNOWN; this work does not modify main or assert that it is protected.

## Minimal integration, no new orchestrator

`packages/hermes/src/client.ts` implements the discovered native Runs API. It pins the free
Nous model, uses HTTPS (HTTP only on loopback for tests), refuses redirects, bounds responses,
sanitizes transport errors, binds exact task hashes, and resends only the same idempotency key.
It persists the claim before submission and saves the remote run ID through the caller's store.
Retries never rotate a key to escape an uncertain result. New submission is refused after a
conservative 23-hour replay window. Completed stored receipts can be read later without submission.
Timeout requests stop but records uncertainty; a stop acknowledgement does not prove cancellation.
Remote failed/interrupted/unknown outcomes cannot become success.

`apps/production/src/hermesBundle.ts` is an explicit opt-in extension of the existing
ProductionBundle/ToolAdapter/VerificationAdapter. It uses the existing work queue ID as task ID,
resolves goal identity from the leased database row, stores receipts at `work_queue.handoff.hermes`,
and fences writes against current lease/goal/plan. A database advisory lock serializes dispatch.
No schema, planner, memory, UI, release gate, or automatic production wiring was replaced.
Native PostgreSQL execution of these new adapter queries remains **NOT_RUN**.

The initial capability supports **tool-free candidate generation only**. Repository access,
external tools and nonzero budgets are refused. It does not implement a repository broker,
coding sandbox, private GitHub access, a generic verifier, or a separate agent platform.
The composition requires a trusted independent semantic verifier and a trusted server-policy
check. Those are explicit dependencies, not pretend implementations. `/v1/toolsets` alone cannot
prove the absence of hidden/default MCP tools, paid fallbacks or model routes. No no-op policy
check is supplied for a live environment. The running broad Hermes profile is not admitted.

## Contract

| Field | Source / meaning |
|---|---|
| `task_id` | Existing trusted SAM work queue UUID; stable across retries |
| `goal_id` | Database-resolved parent goal UUID |
| `agent_role` | Enumerated role label; confers no authority |
| `instructions` | Bounded untrusted content |
| `allowed_tools` | Empty in this first supported profile; server policy must enforce it |
| `repository_scope` | Empty; repository work is rejected |
| `execution_budget` | `max_cost_usd:0`, `max_concurrency:1`; no billing proof |
| `timeout` | 1–120 seconds from task creation, stable across retries |
| `created_at` | Trusted queue creation timestamp; never reset by retry |
| `status` | Native run state in durable receipt; SAM candidate is `IMPLEMENTED`, never self-verified |
| `result` | Untrusted candidate returned through the existing execution ledger |
| `evidence` | Task/goal/run linkage and candidate hash; independent semantic evidence still required |
| `error` | Sanitized failure code; transport uncertainty is not an authorization to execute fresh work |

The wire payload translates task identity/content into native `input` and `instructions`.
Runtime/authority fields are not accepted from the model. Native remote completion is distinct
from TRUTH verification and the kernel's goal state. The kernel still forbids the execution actor
from approving its own verification. A matching hash/readback alone proves identity, not correctness.

## Validation and acceptance

TypeScript passed. The isolated suite passed **130 tests**, zero failures/skips, including
11 new real-loopback-HTTP **stub** tests. They cover lost acceptance response/deduplication,
client reconstruction after simulated crash, scope rejection, server-policy refusal, changed-payload
replay, timeout/stop uncertainty, cancellation, mismatched remote identity, sanitized HTTP denial,
expired replay rejection, and reading completed receipts after expiry. Client reconstruction uses
a retained injected store; it is not a PostgreSQL, process or hosted-container restart test.

The first broad test invocation lacked the repository-required dummy `DATABASE_URL`: 109 passed,
eight test files failed during import with `DATABASE_URL_REQUIRED`. After supplying a nonconnecting
synthetic URL, 129 passed; the added completed-receipt regression raised the final total to 130.
No assertion was removed. No native PostgreSQL binary or Docker daemon was available locally.
Initial read-only shell diagnostics also encountered missing PyYAML and a denied process-executable
read; the successful API/config-field observations above are separate from those failed diagnostics.

| Required acceptance | Status | Evidence / missing prerequisite |
|---|---|---|
| A: live SAM → Hermes task | BLOCKED | Existing SAM has no configured Hermes transport; broad remote tool profile is not admitted |
| B: code execution + independent tests | BLOCKED | No constrained execution sandbox or independent code verifier has been wired |
| C: live failure/recovery series | IMPLEMENTED / partial verification | Eleven stub transport checks pass; hosted recovery, durable DB SQL and real authorization tests pending |
| D: hosted persistence/restart | BLOCKED | SAM is confirmed disposable; do not restart it to manufacture a persistence claim |
| E: branch + Draft PR by Hermes | BLOCKED | No scoped private repository credential/broker or isolated write execution available |
| F: existing SAM UI end-to-end | BLOCKED | Current test composition intentionally does not execute live external tasks |

## Next bounded work / rollback

1. Bind existing approved persistent SAM storage using the existing provisioning and admission
   path; preserve historical goals. Do not reset roles/budgets or bypass release gates.
2. Establish a native constrained Hermes profile and measured single concurrency. Validate effective
   tools, provider/model, fallback/routing and sandbox policy from the installed version before dispatch.
   Do not grant its current unsandboxed terminal private GitHub credentials.
3. Register the explicit adapter, trusted independent checker, and reviewed zero-cost test execution
   in the isolated composition; provision its verification contract with existing tooling.
4. Run native DB/fencing tests, live A–D, a specifically scoped GitHub test repository for E, then F.
   Record exact deployed commits and independent receipts. Do not mark the goal complete before F.

No additional spending was incurred by model calls in this work (none made). Actual provider and
Render billing are UNKNOWN because billing statements were not retrieved; the approved reported
base cost is not an invoice. Existing resource plans were unchanged. No merge or deploy occurred.

Rollback: discard this draft/branch. Since it is not registered or deployed and no schema was
changed, there is no service or data rollback to perform. If later activated, removal must preserve
receipts and reconcile outstanding runs before dropping the adapter; code rollback cannot undo effects.
