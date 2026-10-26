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
| Validation | 40 original tests, 3 new unit cases, 7 actual Gateway cases per base/current source; storage mocked in Gateway cases |
| PostgreSQL proof | 15 engine-level acceptance cases BLOCKED by root-only UID mapping; none passed |
| Rollback | Omit opt-in Gateway hook and retain every ledger, reservation and evidence row; no DROP/reset |

The smallest next step is to execute the PostgreSQL acceptance file under an unprivileged OS user with a
disposable cluster, then review any engine failures and refresh the patch against your accepted source.
Only after that should the shared-schema/identity/health-query review and a separately authorized pilot proceed.

Please record acceptance or required interface changes explicitly in PR83. This handoff does not request a
deployment, shared migration, new secret, new paid resource, Modal run or live inference call.

Final source recheck: Hermes e7a746aec41654c026337bb06c746bcb073e8fe7 has the same Gateway blob as 2a488c8 and 3570e30; intervening changes were continuity documents only. Reserved-path overlap remains empty.
