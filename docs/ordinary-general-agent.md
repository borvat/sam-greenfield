# Ordinary general-agent integration

Implementation based on `32cab556ea842866e01f33e64794dd2ed968e8b7`.
The evaluation launcher and its authorization gates remain unchanged. This is
not an activation instruction or evidence of live model autonomy. Exact frozen
source and acceptance results belong in the accompanying verification report.

## Runtime contract

The authenticated `sam_submit_goal` record is the executing root. Admission
requires its existing tenant binding, GREEN ceiling, `sam.read_report.v1`
completion definition and submission receipt. Descendants are authorized only
through persisted specialist assignments and the pinned capability policy.
No evaluation trial, synthetic coordinator, new signer or new principal is part
of this path. Unknown connector schemas remain unknown.

One root allowance must cover every provider attempt (including fallback),
decision, source dispatch, independent readback and delegation. An append-only
ledger in the existing audit table, serialized by the root goal row, fixes the
limits, positive prices, objective and capability digest at first admission.
Reservations are durable before dispatch and are never refunded. An unfinished
reservation is uncertain, not free. Restart may reopen the same allowance but
cannot renew its deadline or change its policy. Local specialist and review
limits remain additional restrictions, never independent spending allowances.

Admission, dispatch and commit are separate checks. Goal cancellation, deadline
expiry and receipt revocation must prevent late completion. Final reports retain
bound obligations and raw/derived/interpretation distinctions. The existing
specialist ancestor guard must continue to see the submitted root EXECUTING;
the evaluation coordinator exception must not be installed.

## Completion gates

| Gate | Required evidence |
| --- | --- |
| Ordinary entry | Actual startup, authenticated submission, worker and independently verified report with transports substituted only |
| Composition | Three unfamiliar objectives: two-period comparison, promises versus deliveries, duplicate-document inventory; dynamic delegation, derive, further reads and repair |
| Allowance | Concurrent zero/last-slot reservation, fallback, cancellation, restart, timeout and crash after dispatch; no reset or uncharged callback |
| Authority | Restricted existing-role profile, foreign tenant, forged child, missing verification registration and unavailable source all fail closed |
| Evidence | Revocation race, unknown units/VAT/period, partial pagination and contradictory claims; nominal sufficient evidence succeeds |
| Operation | Disabled by default; no evaluation tables/signatures; missing specialist migration or positive prices blocks startup |

Fixtures establish wiring and invariants, not model autonomy. The prior audited
evaluation acceptance does not cover this branch. Full exact-head acceptance is
required after the ordinary path is implemented.

## Minimum deployment boundary (not executed)

Use the existing services and runtime identity. An authorized administrator must
apply specialist migrations 00106/00107 and the fixed-tenant specialist profile,
register the exact verification contracts, and verify existing integration/report
rights. Do not apply the evaluation or shared-goal coordinator profiles. Configure
reviewed positive provider prices and the explicit ordinary opt-in only after
reviewed release/setup approval. No new model account, signer or host is required
by this design. The required rights and startup contract are listed below. Actual existing-role
setup and hosted behavior remain unverified; isolated fixtures do not authorize
or establish them.

The concrete configuration surface implemented on this branch is:

- Existing runtime and MCP/command-center services use the same reviewed release and
  `SAM_ORDINARY_GENERAL_AGENT=1`. This marks only newly submitted ordinary goals.
  Existing waiting or executing goals are not enrolled retroactively.
- `SAM_ORDINARY_AGENT_CONFIG` is nonsecret JSON containing `limits` and
  `specialists`. Limits use the existing `Limits` schema; each specialist names
  its purpose and allowed capability IDs, not an objective-specific plan.
  `SAM_SPECIALIST_INTELLIGENCE=ordinary` is required by runtime admission. These
  settings and specialist rights belong to the runtime service only; MCP keeps
  its existing authenticated goal/audit/registry access. The goal-wide per-call
  ceiling may retain the existing 40-second review deadline; the planner's
  30-second signal and specialist's 20-second limit remain tighter restrictions.
  No deadlines or spending limits are automatically enlarged.
- Keep the existing provider identity, key and endpoint. Review positive
  `DEEPSEEK_COST_PER_1K_INPUT` and `DEEPSEEK_COST_PER_1K_OUTPUT` (or the existing
  reviewed provider's equivalent), and match the registry exactly. The existing
  provider must declare both `planning` and `specialist_reasoning`. Zero price
  metadata is rejected, not interpreted as free inference. This document does
  not authorize any spending or prescribe unverified current prices.
- Administrator-only migrations are exactly
  `packages/db/specialist-migrations/00106_specialist_intelligence.sql` and
  `00107_learning_provenance.sql`, with their manifest receipts. Existing runtime
  rights remain; `provisionSpecialistAccess` adds SELECT on the migration
  receipts; SELECT/INSERT on specialist budgets, sessions, delegations and
  learning; UPDATE only `(used,cancelled)` on budgets and
  `(state,used,updated_at)` on sessions. Its fixed-tenant policies remain required.
  Runtime startup does not execute this provisioner or any GRANT.
- Register `derive_verified_evidence` with `verified-evidence-replay-v1` and each
  configured reasoning capability with `ordinary-specialist-pointer-replay-v1`,
  `grounded:boolean`, `db_query`, and `must_not_trust_execution_result=true`.
  Existing source contracts and integration/report access are checked, not
  automatically installed by this startup branch.

No evaluation migration, evaluation principal, owner signing key, synthetic
coordinator exception or Render transport is required. The existing specialist
execution guard remains unchanged. To roll back, stop ordinary admission on both
services and restore the prior reviewed release/configuration; preserve append-only
allowance records and unresolved work. Never clear budgets to resume a goal.
Disabling the flag must not be used to pass opted-in goals to an unbounded worker.
This release refuses legacy startup while admitted work remains unresolved.
An older release lacks that guard: pause both services and reconcile admitted
work before restoring it. During opt-in, direct literal `sam_execute` plans are
refused explicitly instead of silently queued; `GOAL_CONTRACT_REQUIRED` remains
binding. Use authenticated `sam_submit_goal` for the executing root.

Perform one reviewed setup window: pause intake/work, confirm the existing
tenant/profile and no incompatible pending work, apply only approved specialist
migrations/grants and verification registrations, provision matching positive
price metadata, pin the reviewed source on the same two services, set the
ordinary runtime configuration and shared intake flag, and verify readiness
before resuming intake. Keep Node 22 patched. No task or provider call is part of
this document's authorization. A later live acceptance requires its own explicit
goal/count/spend ceiling, using the existing authenticated submission path.

Source limitations remain substantive: opaque Google MCP output is not native
Drive data; existing Bol detail monetary columns still have unknown currency;
metadata and hashes do not establish supplier promises or semantic equivalence.
These gaps must produce incomplete reports, not invented aggregates. Verified
derived provenance stays in reports/executions; separate knowledge capture remains
limited to permitted raw source facts.
