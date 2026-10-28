---
title: Diagnose Command Center authentication without credential disclosure
type: bugfix
ticket: ''
created: '2026-10-28'
status: built
baseline_revision: 7dfe995159bfcb8038c981530f3e34b9a3e5b7c9
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick, independent-security]
review_loop_iteration: 0
context: ['{project-root}/AGENTS.md', '{project-root}/docs/engineering-memory/POLICY.md', '{project-root}/docs/engineering/ui-connection-acceptance-20261028.md']
---

<frozen-after-approval reason="Owner explicitly authorizes demonstrated-defect fixes, independent review, affected verification and existing-service deployment; no repeated routine approval">

## Intent

Diagnose the rejected secure CC login before asking the owner to enter a credential again. Historical generic401 cannot identify missing/altered header versus rejected credential. Correct the proven Replit-specific guidance and the misleading assumption that every401 is a wrong token; add only nonsecret rejection diagnostics needed to distinguish these cases. The historical root cause must remain UNKNOWN without evidence.

## Boundaries & Constraints

Always preserve exact bearer comparison,401/error:unauthorized compatibility, host/origin guards, read-only controls, tenant binding/RLS, existing secrets and all reports/work. Root coordinates and owns remote access/deployment; implementer has no remote/native access. Reuse engineering memory already restored at parent; candidate1/verified0, no operational authority inferred. This is a scoped continuation, not a broad review or authentication redesign.

Never read/print/change a real credential, browser secret store, authorization header value, token-derived fingerprint or length. Do not log raw header, cookie, query, arbitrary route/body or attacker-controlled request ID. No resources/cost/grants, main merge, mail/model/Hermes call, goal recovery or business fixture writes. No new login scheme or endpoint. Historical UI tests remain blocked; local tests and synthetic HTTP probes are not authenticated browser evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Missing authorization | Protected request without header |401, error unauthorized, stable missing_authorization classification, random server request ID | Deny before business/DB handler |
| Wrong scheme | Protected request with non-Bearer scheme |401 plus invalid_bearer_scheme | No raw value in response/log |
| Rejected bearer | Synthetic wrong exact Bearer |401 plus bearer_rejected | Does not attribute failure to owner; configured token may differ |
| Accepted bearer | Exact synthetic configured bearer | Existing handler succeeds, isolation intact | No approval/scope expansion |
| Bad host/origin | Otherwise valid synthetic credential | Existing403 and original error | No new authentication bypass |
| Browser submission | Embedded UI connect script, synthetic credential | Same-origin expected API paths; exact Bearer header constructed before concurrent responses; visible input cleared | Never expose token in UI errors |
| Generic/non-JSON proxy401 | No trusted classification | Neutral authentication rejection, safe request ID only when well formed | No wrong-token assertion, no parse failure masking401 |
| Diagnostics redaction | Synthetic sensitive header/query/request-ID values | Structured metadata contains only controlled event, method/known route classification/reason/generated ID | No token/hash/length/query values serialized |

</frozen-after-approval>

## Code Map

- `apps/command-center/src/ui.ts`: input incorrectly says Replit Secrets; connect() trims and creates same-origin Authorization in api(). Any401 currently tells user correct token, before parsing response. Preserve public controls, session-only semantics and no-token URL policy. Add bounded neutral/classified error handling and service-specific existing-token guidance.
- `apps/command-center/src/http.ts`: safeEqual exact timingSafeEqual; host/origin403 precede token401, DB afterward. Add stable rejection reason/random ID and structured nonsecret stderr event; keep error and statuses. No secret-derived metadata, no new diagnostic endpoint. Use strict known-route category or omit route entirely; omit arbitrary path/query. Route missing configured token checks through same conservative diagnostics when applicable without changing enforcement.
- `apps/command-center/src/main.ts`, `deploy/render/start.sh`: production requires configured token, allowed host and bound company. Start sets same-domain allowed host/origin; no changes required.
- `tests/isolated/sam_reliability_independent.ts`: existing VM pattern executes embedded JS; reuse pattern with synthetic values, not whole wider suite.
- `tests/isolated/command_center_auth.ts` (new): focused isolated Node test suite. Import existing HTTP server with dummy DATABASE_URL; mock only necessary store/DB boundary or choose accepted route that requires no database. Never connect to native DB.

## Tasks & Acceptance

**Execution:**
- [x] Implement only CC auth diagnostics/guidance and new focused tests; capture RED before patch for demonstrated diagnostic/guidance behavior, then GREEN.
- [x] Independent scoped Quick reviewer and verifier inspect/run only this delta plus needed TypeScript/auth/CC regressions. Root triages each finding and checks matrix coverage.
- [x] Root scans final code for secrets; publish reviewed non-main tree, retain rollback62 and deploy existing CC (other services only if required by release consistency). No environment/secret changes.
- [x] Root verifies live build, readiness and synthetic missing/scheme/bearer probes. These prove current probe transport only. Preserve historical uncertainty and observe redacted logs if available. Only then prepare secure login if a credential is still necessary; no automatic old-secret replay.
- [ ] After successful secure login, execute the already prepared two-report and isolated-memory/synthetic-receipt UI checks; otherwise preserve precise blocker and one existing-token login action.

**Acceptance Criteria:**
- Given a current classification, when the UI displays a failed authentication, then it distinguishes absent header/scheme/rejected Bearer without exposing data or accusing owner error; unknown/proxy failures remain neutral.
- Given current live service metadata and public probes, when recording diagnosis, then code/configuration/transport evidence and remaining credential/config uncertainty are explicit.
- Given final scoped code, when reviewed/tested/published, then only affected checks run and evidence records exact source versus live/browser results separately.

## Implementation Notes

Independent diagnosis completed before edits: no demonstrated transmission/comparison bug, real guidance/diagnostic defect. Expected production revision62 and ready/live200 confirmed; Render app/request logs02:28–02:34Z empty, not proof of absent requests. Missing header, synthetic Basic and wrong Bearer currently all give same401 JSON. No user re-entry requested during diagnosis.

## Plan Change Log

## Review Triage Log

Scoped Quick and independent security reviewers returned no findings. Independent verifier: focused5/5, selected CC regressions4/4, typecheck/diffcheck0. Accepted bearer is local DB-free OPTIONS and existing authenticated read-only denials, not live credential or tenant-DB proof. Every matrix row is covered by these executed tests; unchanged native isolation evidence remains historical. Original Gitleaks8.30.1 scanned the four changed deliverable files, zero findings; unchanged base/history/dependencies excluded. No source changes followed verification.

## Verification

Parent captures source snapshot before meaningful final tests. Implementer uses `DATABASE_URL=postgres://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/command_center_auth.ts`; no native DB. Independent verifier runs focused auth/adjacent CC tests and `npm run typecheck`; do not run all unrelated36 tests. `git diff --check` and original secret scanner final directory scope required. Deployment is root only, pinned exact reviewed commit with62 rollback. User explicitly authorizes these routine fixes/deployments, so no new routine plan-approval request.

## Live/browser continuation result

Published application1e4e21a773c88e2366915edd3bb2e307fddaa157 LIVE on CC and MCP. Runtime stays LIVE62 because automatic approval review rejected the unnecessary unaffected-service deploy; no bypass/retry. CC synthetic HTTP classifications and browser no-credential header-presence probe correlated with redacted logs. Secure login then succeeded, followed by actual rendered-card reads of both original reports/limits, empty approved-memory recall and unread internal-only UNROUTED notification. Historical Unauthorized cause remains UNKNOWN. Isolated write/dedup/isolation and synthetic acknowledgement remain BLOCKED: current session is business-bound; existing test service is suspended and prior lease expired. No business fixture or real receipt was written. See cc-auth-diagnosis and cc-authenticated-ui-acceptance evidence.
