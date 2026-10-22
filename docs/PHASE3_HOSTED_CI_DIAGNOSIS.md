# Phase 3 — hosted CI diagnosis and staging readiness

2026-10-22, Asia/Damascus. Repository `borvat/sam-greenfield`, Draft
[PR #46](https://github.com/borvat/sam-greenfield/pull/46), starting head
`15e77cc8ca310af2607a2c2580a18007e8fa6c64`.
Scoped test/workflow correction: `1d7acf9213eb6e8a3bd9bb50b98bf914ae02bfc4`.

## Confirmed hosted failure: account admission, not application execution

The public [run 39678917418 summary](https://github.com/borvat/sam-greenfield/actions/runs/39678917418)
and each of its three job pages display this exact annotation:

> The job was not started because your account is locked due to a billing issue.

| Job | Job ID | Reported status/conclusion | Execution evidence |
| --- | --- | --- | --- |
| clean-image | 119495946017 | completed / failure | No recorded steps; explicit not-started account-lock annotation |
| core-reliability | 119495946164 | completed / failure | No recorded steps; same annotation |
| test | 119495946386 | completed / failure | No recorded steps; same annotation |

**Classification: hosted pre-execution account/admission failure.** This is not
evidence that Docker, npm, TypeScript, PostgreSQL or application tests failed on
GitHub. The exact runner-assignment transition is not exposed: no claim of
`runner_id=0`, null runner fields, runner shortage or zero assigned hardware is
made. What is established is that GitHub explicitly refused to start the jobs.

For subsequent runs, classify evidence in order: explicit not-started/platform
annotations → admission issue; started runner with failed setup/container pull →
job setup issue; an executed test command with failure output → test/tooling or
application issue. Empty steps or a missing log without annotations leave the
cause unknown. Concurrency cancellation is distinct from all three.

The requester supplied separate authorized-integration evidence: run completed /
failure, each job's `steps=[]`, separate empty job-steps responses, and log requests
returning HTTP 404 `BlobNotFound`. Runner IDs/names, start/end timestamps, check
annotations and platform setup details were **unavailable, not confirmed null**.
That export alone was inconclusive about cause; the public annotations supply the
missing account-level diagnosis. [Attributed external evidence](phase3/2026-10-22/external-api-findings.json),
[direct public observations](phase3/2026-10-22/hosted-run-observations.json).

Comparison with earlier runs on the same branch:

| Run | Public title identifies head | Matching account-lock errors |
| --- | --- | ---: |
| 39678917418 | 15e77cc | 3 |
| 39678911157 | 15e77cc | 3 |
| 39678759556 | bdab075 | 3 |

This is a repeated account gate across more than one code head, not evidence of
a new code-specific regression or a general GitHub service outage. All three
runs also show a separate notice that `ubuntu-latest` begins migrating to Ubuntu
26 on October 19, 2026. That image-rollout notice is **not the failure reason**.

No billing screen, payment information, spending limit or account setting was
read or changed. No rerun, alternative account, self-hosted runner provisioning,
permission bypass or required-check suppression was attempted.

## Access, runner and governance observations

- Native Git works. Main remained `b55da2761e8fd1de3833be55f03d4fdd268cd0a3`;
  PR #46 and its branch were observed at 15e77cc before this work. The public PR
  payload independently reports DRAFT, base main and that head, and contains the
  updated Phase 2 description. The remote PR body was not overwritten here.
- `api.github.com` remains denied by the configured proxy: curl exit 56,
  CONNECT 403, upstream HTTP 000. Run/jobs, runner inventory, Actions permissions,
  main protection and ruleset requests fail through this session's API path.
- Public GitHub HTML pages return HTTP 200 through the same normal proxy route.
  Their visible annotations and embedded public branch/PR metadata were read
  without authentication changes or log-access workarounds. Job logs still require
  sign-in; no attempt was made to circumvent that boundary.
- The public branches page reports main `protectedByBranchProtections=false`,
  `mergeQueueEnabled=false` and `rulesetsPath=null`. This is a public snapshot of
  classic protection metadata; it does **not** enumerate inherited rulesets or
  prove which required checks/review rules exist. Those remain unverified.
- All jobs request GitHub-hosted `ubuntu-latest`; none requests self-hosted
  labels or a job environment approval. There is no `needs` dependency cycle.
  Timeouts are ten minutes; token permission is `contents: read`; concurrency
  cancellation is scoped by ref. None explains the explicit account-lock refusal.
  Repository `/actions/runners`, even if accessible, would enumerate self-hosted
  runners rather than establish GitHub-hosted pool capacity.

The precise remaining diagnostic gaps are the assignment/timestamp details,
private account-lock resolution state and effective protection/review policy.
They do not reopen the already observed not-started failure reason.

Required authorized follow-up:

1. An account owner/support checks the existing account restriction and confirms
   eligibility has been restored. This task authorizes **no billing change** and
   does not request payment details or a new service.
2. The existing authorized integration retrieves effective main protections,
   repository/organization rulesets, required status contexts and review rules.
   Relevant read operations include `branches/main/protection`, `rulesets`,
   `rules/branches/main`, and the required-status/review subresources when allowed.
3. After the account gate is resolved and a run is authorized, execute one frozen
   candidate and capture `run_attempt`, event/head/workflow SHA, queue/start/end
   times, runner ID/name/group/labels, actual step list, annotations and logs.
   Preserve omitted fields as unavailable. Confirm that setup/checkout and actual
   commands ran before classifying any subsequent failure as a job/test failure.
4. Require green hosted execution and accepted governance before merge. Never
   disable checks, weaken permissions or change runner accounts to evade this gate.

## Scoped latent fixture defect found locally

The account-lock failure did not execute any test. Independently, replaying the
commands in isolated Node 22 containers exposed two local harness issues:

1. The minimal Alpine image lacks the OpenSSL CLI: `spawnSync('openssl')` returned
   `status=null`, `ENOENT`. This is a fixture prerequisite, not a production image
   requirement. A diagnostic attempt to install the CLI via Alpine repositories
   received HTTP 403; it was stopped without changing trust or network policy.
2. In the official Node 22 Debian image, which includes OpenSSL, the original TLS
   fixture bound `localhost` to `::1` while pg's connection was refused. The
   diagnostic listener address and `ECONNREFUSED` are archived. Binding the local
   fixture to `127.0.0.1` makes the existing real TLS tests pass; the connection URL
   remains `localhost`, preserving DNS certificate-identity validation and both
   untrusted/mismatched certificate refusal cases.

The correction changes only
[`tests/release/postgres_tls.ts`](../tests/release/postgres_tls.ts) and adds a named
`openssl version` prerequisite step before focused security fixtures in the
[existing workflow](../.github/workflows/phase0-postgres-verification.yml).
No application, migration, dependency or deployment configuration was changed.
The workflow change makes a missing CLI diagnosable; neither change fixes or
bypasses the account lock. `ubuntu-latest` is retained: pinning a replacement
runner without executing it would not prove hosted compatibility.

Both original and updated workflow pass actionlint 1.7.7. The official release
binary's SHA256 was verified against its published checksum manifest. No YAML or
Actions-expression defect was found. The original TLS test fails and the corrected
test passes in the same Node 22 Debian/loopback setup. Failures remain in the
evidence; no assertion, TLS validation or certificate mismatch case was disabled.

## Isolated command results

Frozen original source was extracted with `git archive 15e77cc...` outside the
checkout. Dev dependencies were freshly installed through the existing proxy/CA
using Node 22.23.4/npm 10.9.9, then only the TLS test was updated for its targeted
rerun. No provider credentials were passed into the test containers.

| Check | Result and limit |
| --- | --- |
| Workflow actionlint, original and fixed | PASS, exit 0; not a hosted runner test |
| Fresh `npm ci --include=dev` under Node 22 | PASS; no host dependency directory reused |
| `npm run typecheck` | PASS on Node 22, including corrected TLS fixture |
| Core reliability | 8/8 suites PASS, including original 15 groups and bounded review workloads |
| Regression | 38/38 phase 1–21 entrypoints PASS |
| Focused provider auth, TLS, contracts, synthetic pilot, schema-source fixtures | 5/5 PASS on Node 22/Debian with OpenSSL 3.0.22 |
| Phase 0 workflow commands | All four PASS on Python 3.11.17 with psycopg2 2.9.13 and the actual `pgvector/pgvector:pg15` image; all 12 migrations and `CREATE EXTENSION vector` executed on a dedicated fixture |
| PostgreSQL extensions | PostgreSQL 15.19; pgcrypto 1.3, vector 0.8.7; not a vector workload benchmark |
| Clean image build | PASS, fresh production dependency install; local image `sha256:01809a0a2fa044eb52f6a0d48174be3905cbb38443ce8de99f885851b923172f` |
| Cross-branch source analysis | Reconfirmed 5/30/27/31/32 conflict files against 15e77cc; no branches merged or combined code executed |

The first Alpine command sequence stopped at the missing TLS-fixture dependency;
its preceding core/regression passes and its failed focused check are retained.
The original Debian TLS failure is also retained. Only the affected focused
fixtures/typecheck were rerun after the test correction. This is local command
acceptance across specified Linux containers, **not Ubuntu-hosted job execution**.

Exact command transcripts, image IDs, original/fixed failures, immutable source
digests, annotations and external-evidence provenance are in
[PHASE3_EVIDENCE.json](PHASE3_EVIDENCE.json) and [its artifact directory](phase3/2026-10-22).
No real model request, business API action, remote database mutation or production
service was used. Only this task's labeled fixture containers/volumes are removed.

## Readiness matrix and next action

| Area | Current verdict | Gate still required |
| --- | --- | --- |
| Local acceptance | **PASS within recorded synthetic/container scope** | Hosted OS/runner behavior remains separate |
| Hosted CI | **BLOCKED — account admission** | Account eligibility restored by authorized owner; actual run/steps/logs pass |
| Merge readiness | **BLOCKED now** | Green final-head hosted checks, effective governance/reviews verified, draft handling by authorized reviewer |
| Staging readiness | **PLAN PREPARED; EXECUTION NOT READY** | Approved isolated resource/identity, explicit staging execution authorization, migration/role/rollback/observability gates satisfied |
| Production readiness | **NOT ESTABLISHED; NOT READY FOR DEPLOYMENT** | No production or live-provider validation, operational restore/capacity or sustained stability proof |

The [controlled staging plan](CONTROLLED_STAGING_PLAN.md) specifies roles, OAuth,
MCP, migration order, safe integration sequence, rollback and measurable exit
criteria. Complete the account/governance gates before a controlled staging
rehearsal. The prior Phase 2 conditional verdict is superseded by this explicit
hosted account blocker; local application tests are not reclassified as failures.

Cleanup completed: both `sam.scope=phase3-ci-diagnosis` containers and their
anonymous volumes were removed. The local image is retained. Git commits/pushes
can trigger this repository's existing push/PR workflows normally; no manual
Actions rerun or dispatch was requested, and no check was skipped or disabled.
