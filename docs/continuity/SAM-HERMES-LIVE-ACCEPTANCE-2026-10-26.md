# SAM × Hermes — bounded live acceptance passed

Status: PASS for the requested single tool-free arithmetic task, independent verification, external PostgreSQL persistence and controlled SAM restart. This is not coding/sandbox/general-agent acceptance.

## Deployed source and implementation

SAM isolated application source: ad64a6a. The existing pinned Hermes image and its already-deployed native Runs model-lock correction were not changed. This work remains in Draft PR #66, continuing #65; no merge or main push occurred.

Two explicitly supplied non-secret operator timestamps now define the isolated probe window. Both are required when either is set; malformed, future, reversed, expired, zero-length or over-hour windows are rejected. The fixed window cannot move on restart, and each dispatch policy check rejects an end beyond the current restricted PostgreSQL role deadline. The existing credential-bearing files, model pin, tool policy and verification requirements were preserved and never opened in the protected editor.

The ONE authorized 60-minute role window was opened once. It is already consumed and MUST NOT be renewed automatically. Exact fixed start/end are recorded in the isolated service's two window environment variables. Password, role flags/configuration and grants remained unchanged; no database/schema/service was created and no network policy was changed. When this window expires, the bounded test service is expected to stop; this acceptance is not authorization for permanent operation.

## Evidence matrix

| Check | Result and boundary |
|---|---|
| Local TypeScript | PASS |
| Local isolated tests | 139 PASS; zero failures/skips; includes six new timing guard tests and existing HTTP-stub transport tests |
| Native PostgreSQL build suites on deployed source | All five PASS; fixture arithmetic/replay/fence/reclaim/concurrency/cancellation checks are not live model tests |
| Runtime API smoke | PASS before and after restart, including authentication denial and existing-goal database readback |
| Real new task | One authenticated SAM intake for SUM 28 15; Hermes returned 43 |
| Actual served model | Direct native durable run readback confirms approved free Nous model and model_lock confirmed; not inferred from requested fields |
| SAM independent verification | VERIFIED by native PostgreSQL arithmetic over original goal operands; expected 43, matched true, candidate hash and plan/execution verification bindings match |
| Stored execution | COMPLETED goal, one queue row, one execution, verification and completed receipt present in external PostgreSQL |
| Pre-restart admission | Both SAM queue and native Hermes runs/turn leases idle; baseline saved |
| Controlled restart | Render restart event recorded; application source unchanged; a different SAM container served afterward and the old temporary checker was absent |
| Post-restart equality | Same goal/plan/queue/execution/verification/run identifiers, complete selected record digest and receipt digest; result still 43; one execution remains |
| Fresh readiness | All three SAM processes report ready after restart |
| Native duplicate check | Hermes run ledger increased from three to four only for the new task and remained four after restart; no replacement model request was made |

The repeatable checker, baseline, native before/after receipts and post-restart comparison are retained privately on the existing Hermes persistent disk in a goal-keyed sam-live-acceptance-*.json file. The evidence contains only synthetic acceptance records and checker source, no credentials. On resumption, locate the new SUM 28 15 goal within the recorded window, then the evidence file keyed by its goal UUID. Preserve both snapshots. Routine baked engineering reports still label their own fixture liveReasoningValidated/containerReplacement flags false; those fixture fields were not rewritten to manufacture live acceptance. The separate real evidence above is the acceptance source.

## Policy, remaining work and cost

Fresh native/configuration readback confirms no enabled tools, no MCP servers/fallback, the approved free model and concurrency one. Terminal, GitHub and programming tools remain prohibited. Actual coding isolation is still unproven; the previously recorded Docker/namespace limitations were not bypassed. A broader live cancellation/lost-connection/recovery campaign and any future sandboxed coding/repository/UI acceptance remain separate work. The arithmetic probe uses SAM's existing deterministic bounded grammar and independent SQL verifier; it does not prove general planning.

No production service, unrelated connector, schedule, resource plan, secret file or paid model/fallback was changed. One ordinary test rollout and one controlled restart were performed. The environment-update connector unexpectedly started a build from the old configured branch; that build was cancelled and the explicitly reviewed ad64a6a was then deployed. Do not use unpinned latest-branch deployment. No new paid resource or upgrade was activated; existing hosting continues, and actual invoices/build-quota charges were not audited.

## Handoff / do not repeat

The single acceptance task is completed and the comparison passed. Do not submit it again, reset earlier failures, overwrite the evidence, renew the consumed window, or reapply the native model-lock patch. No pending task remains in the checked queues. Recheck actual readiness and the fixed expiry on any later visit rather than assuming the service stays available past the authorized deadline. Keep this PR draft/unmerged until separately reviewed; coding tools must stay closed until real isolation is demonstrated.
