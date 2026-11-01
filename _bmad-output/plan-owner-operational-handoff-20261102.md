---
title: Complete existing SAM owner handoff
type: bugfix
created: 2026-11-02
status: built
baseline_revision: 8a08e6163516f30f37c65313134170744330c4f4
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
context:
  - /workspace/scratch/ca1213daa2e0/sam-owner/AGENTS.md
  - /workspace/scratch/ca1213daa2e0/sam-owner/docs/engineering-memory/POLICY.md
---
<frozen-after-approval reason="owner-authorized bounded continuation; production changes require separate concrete approval">
## Intent
Complete the existing owner handoff without repeating the accepted release/restoration. Preserve8a and build only missing auth reliability and owner-email delivery on this isolated worktree. The owner chose executive email ceo@suroohholdings.com through the current structured question. New production code/configuration/Google send consent still require approval before activation. Existing live two-specialist read-only goal is coordinated separately by root.
## Boundaries & Constraints
Always preserve current authentication, exact company isolation, immutable reports, audit, finite retries and original budgets. All sender configuration defaults OFF. Only the verified configured owner recipient can receive report notifications; no cc/bcc or model-chosen recipient. Reuse existing notification tables, Gmail adapter and current Runtime. Caller-controlled arguments must not turn on delivery or broaden audience. Provider acceptance is not recipient inbox delivery.
Never create resources, deploy, merge main, publish PR97, read secrets, change credentials/roles/network, send live email, mutate business records, or claim mocked/native-isolated checks prove live receipt. No dependency additions or existing passing-suite reruns. Root completed project startup: memory resume stale, learning audit VALID4/verified0, brief no verified lessons; preserve all unrelated worktrees.
## I/O & Edge-Case Matrix
|Scenario|Input/state|Expected behavior|Error|
|Stale auth response|old request401 arrives after new connect|new token/current UI not erased|outdated result ignored|
|Current invalid token|current request401|clear current session and show redacted request ID|normal denial|
|Disabled/unbound mail|no approved server binding/transport|no claim or send|explicit disabled/unavailable|
|Owner mismatch|foreign company, wrong recipient, pre-activation record|no send|fail closed|
|One completed report|approved binding and eligible dedup notification|stable idempotency key, owner-only report, persisted attempt/receipt|no arbitrary recipient|
|Concurrent/repeated tick|same notification|at most one active sender with DBlease/fence|no duplicate send|
|Definite pre-send failure|retryable admission failure|finite retry/backoff|attempt cap|
|Ambiguous send or crash|expiredSENDING/provider timeout|reconcile stable message ID; never blindly resend|UNKNOWN when inconclusive|
|Provider accepted|sent-mail confirmation only|ACCEPTED/confirmed-sent distinct from inbox receipt|no invented delivery/read proof|
</frozen-after-approval>
## Code Map
- apps/command-center/src/ui.ts: connect/api/refresh; correct static Bearer validation in http.ts must stay unchanged. Stale401 can erase newer token; incident root cause remains unproven. MCP OAuth tokens are MCP-audience-bound, never reuse as CC bearer.
- apps/notifications/src/center.ts and packages/db/integration-migrations/00105_owner_notifications.sql: existing scoped projection, statuses, leases, attempts, dedup and read receipts. Reuse schema; do not widen ACL/RLS. Attempts table security must not assume app privileges.
- apps/production/src/composition.ts: existing tick projects notifications; minimal off-by-default bounded sender hook.
- apps/tools/src/gmailSendAdapter.ts, apps/production/src/gmailBundle.ts, packages/gmail/src/{client,mime}.ts: current Gmail send/reconcile/RFC822 id. Preserve YELLOW policy and data classification. Never activate generic sends or bypass tool authority. Existing Google MCP connection is read-only and cannot supply send consent.
- tests/isolated/command_center_auth.ts: add deferred-response race checks. Add targeted delivery regression file using actual SQL in existing disposable PGlite where suitable; injected providers are isolated evidence only.
## Tasks & Acceptance
- [ ] Fix only UI auth generation/snapshots and stale response side effects; retain current-auth denial and secret handling.
- [ ] Add minimal owner delivery worker and bounded existing-tick integration, with explicit server binding/activation timestamp and existing authority controls, off by default. If safe provider integration requires missing production consent, prepare code fail-closed and record exact requirement; do not fabricate transport availability.
- [ ] Reuse existing adapter stable-message reconciliation and notification state/attempt schema. Keep scoped transactions, leases/fencing, finite retries, no historical replay or ambiguous automatic resend. Restrict bounded report payload to approved company/owner.
- [ ] Test only changed auth race and delivery states, including negative tenant/recipient and concurrent/ambiguous cases. Typecheck affected dependencies. Do not run unrelated suites.
- [ ] Produce exact changed paths, new focused evidence and safe deployment/rollback package. Source readiness is separate from OWNER LOGIN/AUTOMATIC DELIVERY/MULTI-AGENT/OWNER ACCEPTANCE live gates.
Given stale response ordering, when a newer credential is entered, then old results cannot alter its session/UI. Given off/default or unauthorized owner route, when Runtime ticks, then zero sends occur. Given a single approved notification, when duplicate/concurrent ticks or ambiguous send occur, then a durable receipt or explicit UNKNOWN remains without duplicate message. Root must obtain production approval and prove actual inbox delivery before AUTOMATIC DELIVERY PASS; human owner must accept before OWNER ACCEPTANCE PASS.
## Implementation Notes
Current release/restoration and earlier single-specialist acceptance are already approved and must not rerun. Root owns actual current multi-specialist goal and secure owner login; implementer does not execute providers. Optional local node_modules symlink may reuse sam-company installed locked dependencies after checking package-lock identity; no new dependency install needed.
The root-authorized implementation amendment separates narrow owner-report standing consent from business-tool execution authority. A trusted YELLOW `OWNER_REPORT_EMAIL_ENABLED` audit binds company, fixed CEO recipient, activation cutoff and matching classification; each admitted message records its exact immutable params/hash and activation link. This authority cannot enable arbitrary gmail_send calls. Existing GREEN goal ceilings, generic gmail_send YELLOW policy, authorityGuard and consumeApproval remain unchanged. Default server bundle construction creates the dedicated binding/transport only under validated explicit server configuration, OFF by default.

Restricted production app-role delivery privileges require a source-only migration and opt-in provisioner profile; no production DDL/grants are authorized by this plan amendment. Exact migration and activation steps are included in the readiness package after review.
## Plan Change Log
- 2026-11-02 — Root authorized correction of independent review P1: the earlier source had no default-module binding and demanded unknown future exact Gmail payload approvals/goal YELLOW ceilings, preventing automatic GREEN read-report delivery. Added dedicated company/CEO standing notification consent, immutable per-send audit, and actual default-bundle server configuration. Production activation remains separately approval-gated; frozen owner intent is unchanged.
- 2026-11-02 — Root authorized source-only restricted app-role support after review found existing notification UPDATE grants exclude sender columns and attempts access. Prepare narrowly scoped RLS/grants via existing provisioner opt-in; no production privilege changes are executed.
- 2026-11-02 — Root authorized bounded P0 Command Center diagnostic/backpressure hardening after live secure-browser submission produced non-JSON upstream `stream timeout` with no new bearer_rejected log. Added a 15-second fetch/body deadline, sanitized unavailable/non-JSON errors, and one refresh batch per auth generation. This is source reliability work, not a claim that live auth or upstream timeout root cause is fixed.
## Review Triage Log
## Verification
- node --import tsx --test tests/isolated/command_center_auth.ts plus new targeted notification delivery tests.
- npm run typecheck after code changes; scoped final-file secret scan before publication.


## Final engineering checkpoint
Source reviewed; live handoff remains BLOCKED pending new production approval, Google send consent, successful UI login and human receipt/acceptance. Original Quick review: no findings. Independent source-security review: PASS for final worker/factory/auth and00107 operator/provisioner. Actual two-specialist goal metadata/hash checker PASS; no provider replay. Earlier readiness defects (missing binding, per-business-goal email approval, insufficient attempt privileges), operator search-path and raw-OR preflight were corrected on the isolated source only. No production deployment or privilege change occurred.
