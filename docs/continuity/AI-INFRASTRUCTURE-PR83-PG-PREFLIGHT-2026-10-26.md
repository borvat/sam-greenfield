# PR83 PostgreSQL execution preflight — continuation checkpoint

Date: 2026-10-26T21:51Z. Status: **BLOCKED**. This is a prerequisite inspection, not a PostgreSQL test run.

## Source and scope

PR #83 was read at head `5cbc06d2eb1d8adf0e8c0f89480369487aa05f37`, branch `infra/surooh-vault-ai-20261026`.
The branch was checked again immediately before this checkpoint; no later work was replaced.
Read the durable delivery, durable continuity checkpoint, `durable-postgres.test.ts` and `postgresHarness.ts` at that revision.
No source, migration, test assertion, dependency or gateway implementation was changed in this increment.
The earlier implementation and evidence remain intact. The sole canonical cost store remains SAM's `model_calls`.

## Prerequisites actually observed

- Work execution host: Linux 6.18.55 x86_64; Node v24.22.1; Bash 5.2.21.
- Effective identity: UID/GID 0. Both kernel maps contain only `0 0 1`; this host still lacks the supported unprivileged identity required by PostgreSQL.
- No Docker/Podman executable or Docker socket; no Modal or Railway CLI available.
- Local checkout and downloaded binaries from the previous execution were absent. No dependencies or PostgreSQL binaries were downloaded again.
- No repeat attempts to change users, patch PostgreSQL's root check, change UID mappings, or circumvent the platform were made.
- Read-only connected inventory: Render exposed existing SAM/Hermes/application services; Railway exposed only SAM Greenfield / staging, including existing SAM runtime and PostgreSQL services. No independently authorized disposable test runner was found through these connected paths.
- No claim is made that an unconnected environment cannot exist. No existing application service, shared database, `sam-trial-postgres`, deployment, database role or network was used or changed.

PostgreSQL/Vault engine versions: **N/A in this session** (no engines started).
The earlier binary-version record is historical evidence only, not a new execution result.

## Acceptance result

Current session totals: **0 executed; 0 passed; 0 failed; 0 runner-reported skipped; 15 blocked before launch**.
Test-process exit code: **N/A — suite not launched**. Preflight command success is not test success.

| Existing acceptance case | This session |
| --- | --- |
| Concurrent workers cannot reserve budget sufficient for only one | BLOCKED |
| Duplicate identity after process restart; reject changed content | BLOCKED |
| SIGKILL after reservation preserves hold and prevents resend | BLOCKED |
| SIGKILL after synthetic HTTP send preserves unresolved exposure | BLOCKED |
| Database crash/restart preserves request, hold and approval usage | BLOCKED |
| Persisted service revocation/project disable | BLOCKED |
| Forged identity, wrong goal, expired grant, revoked approval | BLOCKED |
| Project revocation survives database restart | BLOCKED |
| Missing/malformed usage remains NULL and hold remains | BLOCKED |
| Reported usage, calculated cost and verified invoice stay distinct | BLOCKED |
| Proven pre-send failure releases exposure and preserves history | BLOCKED |
| Limit revision CAS and expired-period reservation history | BLOCKED |
| Database outage fails closed before secret/provider operation | BLOCKED |
| Legacy unallocated model_calls is not treated as free | BLOCKED |
| Actual SAM Gateway + PostgreSQL + real Vault canonical record | BLOCKED |

No engine defect was discovered or fixed because execution did not begin. No regression suite was rerun without a code change or a viable engine environment.
The original 40 tests are unchanged. Prior 40-test evidence, 3 pure checks and 7 Gateway cases on each source snapshot retain their original scope.
Gateway tests with explicitly mocked SQL remain synthetic storage evidence; they are not PostgreSQL evidence.

## Coordination

The existing handoff request is PR67 comment 6427057618:
https://github.com/borvat/sam-greenfield/pull/67#issuecomment-6427057618
Review of available PR67 comments and PR83 comments/reviews found no explicit Hermes contract acceptance.
Status remains **PROPOSED / acceptance pending**, regardless of our authored memo or comment.
Refresh that same coordination comment with this checkpoint and request explicit acceptance or specific interface objections.
No PR67 branch, source, service, secret or runtime was modified.

## One proposed environment authorization — NOT granted or created

Request a new, PR83-only Modal Sandbox: Linux x86_64, a real non-root OS user, at most 1 physical CPU core (2 vCPU equivalent), 4096 MiB RAM, hard lifetime 3600 seconds, one sandbox, no GPU, persistent volume, snapshot, public tunnel or model inference.
Run the existing disposable local PostgreSQL harness and real Vault with synthetic credentials only.
Use explicit resource upper limits, not merely resource requests. Keep database/Vault loopback-only and do not inject SAM/Hermes/provider credentials.
Maximum new authorized cost requested: **USD 1 total**, including preparation and transfer; no prior Hermes budget or trial-credit assumption.

Official documentation checked on 2026-10-26:
- https://modal.com/pricing — Sandbox rates: USD 0.00003942 / physical-core-second and USD 0.00000667 / GiB-second. One core + 4 GiB for one hour computes to USD 0.23796 before preparation/network.
- https://modal.com/docs/guide/sandbox-resources — explicit CPU/memory upper limits are supported; without them actual usage can burst and cost more.
- https://modal.com/docs/guide/sandboxes — `timeout` limits lifetime independently of idle activity; terminate explicitly on completion/error.

This is a concrete permission request, not proof that Modal access is currently available. No Modal authentication was probed and no resource was created.
Before any billable launch, verify authorized account access, non-root support and that preparation plus bounded execution/transfer fit the USD 1 ceiling. If any cannot be established, do not launch.
After exporting logs/results, terminate the sandbox and verify termination; hard timeout is the backstop. Destroy its temporary cluster and synthetic Vault data. Retain no persistent disk or snapshot.

## Resume after authorization and environment preflight

1. Read latest PR83 head again; preserve later commits. Confirm non-root execution before dependency downloads.
2. Reuse the existing test source/harness. Install the locked dependencies and actual PostgreSQL/Vault binaries only in the temporary environment.
3. Run the original 15 cases with `fsync=on`, `synchronous_commit=on`, `full_page_writes=on`. Do not substitute SQL mocks or point at a shared URI.
4. Capture exact source commit, OS/Node/PostgreSQL/Vault versions, command, unabridged logs, passed/failed/skipped totals and exit code. A skipped case does not satisfy acceptance.
5. If an engine defect appears, preserve its failing test evidence, fix only PR83 scope, rerun affected acceptance and related regressions, retaining the original 40 tests.
6. Save a checkpoint after each meaningful result and before sandbox deletion.

Shared operation still requires actual Hermes acceptance and separately coordinated/authorized schema, RLS/roles, identity mapping and activation. PostgreSQL success alone does not authorize shared migrations or prove production readiness.

No test process, database operation or provider request is pending. No new cloud resource, paid inference, deployment or subscription was started; no new billable workload was initiated.
