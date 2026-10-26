# PR83 → SAM–Hermes engineer handoff (acceptance pending)

PR83 is a proposed integration package, not an accepted contract or a runtime change.
No edits to your branch, broker, publisher, service storage or provider defaults.

| Topic | Exact requested interface / responsibility |
|---|---|
| Gateway hook | Review `gateway-hermes-2a488c8.patch`; its source gateway blob also matches 3570e30 |
| Composition | SAM supplies verified principal + goal/queue/execution/fence + stable logical request key + existing approval ID |
| Identity | Current adapter reuses SAM synthetic OAuth verifier; map the appropriate internal service principal before any pilot |
| Dispatch | Vault-bound adapter commits DISPATCHING before possible send; caller/agent receives no credential |
| Retry | Any admitted boundary-controlled failure stops the existing Gateway fallback loop; reconcile ambiguous spend first |
| Accounting | Proposed additive model_calls fields and auxiliary limit/auth/evidence tables; do not apply to shared DB now |
| Shared health query | Review pending RESERVED/DISPATCHING rows so existing success=false circuit-breaker logic does not misclassify in-flight work |
| Existing DeepSeek/Nous | Leave current secrets, default model and free Nous path unchanged |
| RLS/roles/history | Coordinate scoped runtime/admin SQL privileges and allocation of pre-existing legacy calls before activation |
| Validation | 52 current regressions PASS: original 40 + 3 prior units + 2 driver-fault guards + 7 actual Gateway cases; the seven use doubled storage |
| PostgreSQL proof | 15/15 real PostgreSQL 15.19 cases PASS, 0 skipped, exit 0; real Vault and synthetic provider; includes the actual Gateway with real storage |
| Rollback | Omit opt-in Gateway hook and retain every ledger, reservation and evidence row; no DROP/reset |

The PostgreSQL gate is closed for the isolated test increment. The smallest next step is your explicit contract acceptance or specific interface objections, including the shared-schema/identity/health-query review, before any separately authorized pilot.

Please record acceptance or required interface changes explicitly in PR83. This handoff does not request a
deployment, shared migration, new secret, new paid resource, Modal run or live inference call.

Final source recheck: Hermes e7a746aec41654c026337bb06c746bcb073e8fe7 has the same Gateway blob as 2a488c8 and 3570e30; intervening changes were continuity documents only. Reserved-path overlap remains empty.


## PostgreSQL follow-up / requested response

[Full delivery, versions, case-by-case results and reproduction](AI-INFRASTRUCTURE-POSTGRES-DELIVERY-2026-10-26.md).
Engine-tested code: a644ba6158c1fdd7e49c7332ff74782726c79ff2. Regression snapshot: f27152e271e3945a89dbc2bbaa6f54ab7d05a97a.
Actual Gateway fixture: 57a19d8; final observed PR67 head ffa0fd4 has identical blob 769d2d3774aa3eac81e07d9e25ea9ce6a6093d8b, so the existing exact-source hook patch still matches.
Only owned ledger code/test bootstrap and assertions changed; no file in your branch or running service was changed.

Please record either **ACCEPTED for interface review only** or specific objections to the hook/composition, authenticated principal/IDs, model_calls schema, pending-row health/report handling, cancellation/retry semantics, RLS/roles or legacy-history allocation. Acceptance of the interface does not authorize shared migration, role changes, provider-secret transfer or activation.

Current status: **PROPOSED; no acceptance found in reviewed PR67 comments or PR83 comments/reviews**. Our handoff/comment is not your approval.
