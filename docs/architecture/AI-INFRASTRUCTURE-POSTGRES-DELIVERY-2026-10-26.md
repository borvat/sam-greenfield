# PR83 — real PostgreSQL acceptance delivery (2026-10-26)

**LOCAL_VERIFIED: all 15 original PostgreSQL acceptance cases passed on a real isolated engine.**
The previous root-only blocker is closed for this test increment. No shared migration, deployment, production-readiness claim or Hermes acceptance is implied.

## Versions and evidence boundaries

| Run | Source | Environment | Result |
| --- | --- | --- | --- |
| PostgreSQL acceptance | a644ba6158c1fdd7e49c7332ff74782726c79ff2 | One authorized Modal Sandbox; UID/GID 65534, empty supplementary groups; Linux 4.19.0-gvisor x86_64; Node 22.23.4; PostgreSQL 15.19 (Debian 15.19-0+deb12u1); pgvector 0.8.1; Vault 1.21.0 | **15 pass, 0 fail, 0 skipped, 0 cancelled; exit 0** |
| Related regression | f27152e271e3945a89dbc2bbaa6f54ab7d05a97a | Work Linux 6.18.55 x86_64; Node 24.22.1; real Vault 1.21.0; synthetic HTTP; explicitly doubled storage in the seven Gateway cases | **52 pass, 0 fail, 0 skipped, 0 cancelled; exit 0** |
| Root / isolated Hermes typechecks | f27152e; actual Hermes snapshot 57a19d8 | Work; each snapshot's own locked npm dependencies | Both exit 0 |

The regression commit adds only driver-fault tests/documentation after the PostgreSQL-tested runtime code.
LOCAL_VERIFIED denotes isolated acceptance, even when the disposable host is remote. PostgreSQL and Vault are real; providers remain synthetic.
No live SAM/Hermes execution or model inference is LIVE_VERIFIED by this increment.
PostgreSQL 17 was not run; the actual tested version is 15.19.

The actual Gateway source was Hermes 57a19d8fd42167d76b97298a4f0031c7b8153d0d in a disposable patched fixture.
The final observed Hermes head ffa0fd480dd59ec64ae10ec7c060b558cbbe6e69 has the identical Gateway blob
769d2d3774aa3eac81e07d9e25ea9ce6a6093d8b. Its branch and shared files were not modified.

## All 15 acceptance cases

| # | Proven in the real PostgreSQL run | Result |
| --- | --- | --- |
| 1 | Two concurrent workers cannot both reserve a budget sufficient for only one | PASS |
| 2 | Duplicate request recovers saved identity; changed content is rejected | PASS |
| 3 | SIGKILL after reservation preserves held budget and rejects resending | PASS |
| 4 | SIGKILL after actual synthetic HTTP send preserves unresolved exposure and one provider call | PASS |
| 5 | Immediate database crash/restart preserves request, hold and consumed approval | PASS |
| 6 | Service revocation still denies after actual database restart and fresh identity/ledger | PASS |
| 7 | Forged identity, mismatched goal, expired service grant and revoked approval are denied | PASS |
| 8 | Disabled project still denies after database restart with a valid service grant | PASS |
| 9 | Missing, NaN, negative or wrongly typed usage stays unknown/NULL; full reserve remains | PASS |
| 10 | Estimate, reserve, reported usage, computed cost and verified invoice stay distinct and survive restart | PASS |
| 11 | Proven pre-send failure releases exposure while retaining estimate/reservation history | PASS |
| 12 | Budget limit CAS and expired periods preserve historical holds | PASS |
| 13 | Database unavailable closes admission before credential/provider execution | PASS |
| 14 | Unallocated legacy model_calls history is not silently counted as free | PASS |
| 15 | Actual SAM Gateway + PostgreSQL + real Vault creates one canonical task-linked row; duplicate does not resend | PASS |

The harness queried and confirmed **fsync=on, synchronous_commit=on, full_page_writes=on**.
Crash tests still use immediate server stop/restart and SIGKILL; no assertion, safety setting or fault was weakened.

## Defects found and repaired

1. **Actual-schema bootstrap required pgvector.** The original suite failed all 15 cases in its before hook with SQLSTATE 42704, type vector missing.
   Installed genuine upstream pgvector 0.8.1 (commit 778dacf20c07caf904557a88705142631818d8cb) only in the temporary host.
   The owned harness now creates the real extension before loading SAM's unchanged schema, and closes its pool if bootstrap fails.
   No substitute type, rewritten SAM schema or shared extension installation was used.
2. **Stale pooled sockets after a real database crash.** The next run passed 12 and failed 3, including a cascading hook failure and unhandled checked-out client error events.
   The ledger now observes checked-out connection errors and discards broken clients. It drains at most the initial idle-slot count plus one checkout, solely before BEGIN completes and before the transaction body runs.
   An intermediate fixed two-checkout assumption still failed when two old sockets existed (14 pass / 1 fail); the final bound follows the existing idle inventory.
   The transaction body, COMMIT, a potentially committed reservation and provider dispatch are never automatically replayed.

The existing 15 cases provided failing evidence before repair. They were strengthened with a service-revocation restart, consumption/invoice restart and malformed-usage variants.
Two separate driver-fault regression cases prove stale admission can proceed once and a lost COMMIT acknowledgement does not replay the transaction.
Those two use explicit driver doubles and are not counted as PostgreSQL engine proof.

## Regression and retained work

52 = 40 original tests + 3 exact-money/identity/hash tests + 2 transaction fault guards + 7 actual Gateway control-flow cases.
Real Vault ACL, cross-project/environment denial, synthetic rotation/revocation and secret non-disclosure checks passed.
The Gateway checks cover rejection, timeout/ambiguous failure, missing usage/model identity, in-flight cancellation, no unauthorized fallback and the extension-disabled legacy path.
They use explicitly doubled SQL; acceptance case 15 separately uses the real database.

An attempted combined remote regression run did not start: the 180-second idle timeout had ended the sandbox while acceptance evidence was being committed.
No second sandbox was created. The 52 related regressions were then executed successfully in Work, where Vault supports root.
Their Node/host version differs from the PostgreSQL run and is recorded above. No local PostgreSQL result was substituted for the real remote evidence.

## Durable state and memory

The isolated PostgreSQL path proved persisted grants/revocation/project state, budget period history/limits,
request scope/hash, reservations/exposure/lifecycle, approval consumption, validated usage/calculated cost and separately approved invoice values.
Authoritative spending stays in SAM's existing **model_calls**; auxiliary tables contain limits, rights, links and evidence.
An actual process kill cannot recreate a dispatch ticket or justify resending an already recorded request.

AbortSignal, branded authenticated identity objects, WeakMap dispatch tickets/nonces and adapter closures remain in process memory.
A restarted process must authenticate again and inspect/reconcile durable records. None of those objects owns authoritative spending totals.
Existing prototype memory-only classes remain confined to the retained prototype tests. No running SAM service was migrated or made durable by this test increment.

## Cleanup, cost and operational limits

Exactly one sandbox was created: sb-01M5X3T4F5VD1Z6XXQ2776D440, with a hard 1 physical core / 4096 MiB limit, 3600-second lifetime and 180-second idle timeout.
No GPU, persistent volume, snapshot, public tunnel, injected SAM/Hermes/provider secret or OIDC credential was attached.
The account already had a provider-set USD 1 usage limit and no payment method; neither was changed.

The sandbox is finished: SDK poll returned exit 0 and the dashboard showed **0 active containers / 0 active sandboxes**.
Its ephemeral PostgreSQL/Vault data is no longer running. The local temporary Modal credential file was deleted; the issued token retains its original one-hour expiry (not claimed revoked). Non-running application metadata may remain as an audit record.
Displayed credits moved from USD 1.00 to USD 0.94: approximately **USD 0.06 metered usage**, within the separately approved USD 1 ceiling.
This is displayed usage, not a verified final invoice. No model/provider inference charge was initiated.

DeepSeek's actual key/storage and the free Nous route were untouched. No PR67 branch, production/shared database, role, service, network or schedule changed.
No GitHub Actions, merge, main push, paid fallback, new provider or external tool evaluation was run.

## Review / smallest remaining step

Hermes contract status is **PROPOSED — acceptance pending**. Reviewed PR67 comments and PR83 comments/reviews contain no explicit acceptance.
The existing coordination comment is updated with this evidence and requests acceptance or specific objections; publishing it is not approval.

The next step is the Hermes engineer's explicit review of the minimal existing hook, identity mapping, pending-row health/report semantics, RLS/runtime/admin grants and legacy-history allocation.
Any shared migration, role change, pilot activation or deployment remains a separate coordinated authorization.
Disable by omitting the opt-in hook after draining/fencing admission; retain all history, exposure and unresolved reservations. Do not drop/reset ledger data.

[Reproduction](evidence/pr83-postgres/reproduce.md) ·
[Checkpoint](../continuity/AI-INFRASTRUCTURE-PR83-MODAL-2026-10-26.md) ·
[Contract](SAM-HERMES-VAULT-INTEGRATION-CONTRACT.md) ·
[Handoff](PR83-HERMES-HANDOFF.md)

Evidence in evidence/pr83-postgres/: original-schema-failure.log, restart-connection-failure.log,
intermediate-idle-client-failure.log, postgres-acceptance.log, environment-setup.log, pgvector-setup.log,
regression-work.log, typecheck-root.log, typecheck-hermes.log, cleanup.json. The dashboard screenshot was deliberately excluded from the repository after automatic approval review rejected public upload of private account/billing metadata; the text cleanup record suffices.
