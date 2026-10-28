# Reviewable next decision: promote the verified SAM application

Status: **approved by the owner and completed**. Current acceptance is recorded in `production-promotion-evidence.json`; the proposal below is preserved as the pre-approval decision record, so its future-tense restrictions are historical. The owner authorized bounded isolated testing, explicitly excluded production changes/main merge, and approved one existing test login window only. That window ends 2026-10-28T01:00:25.521Z. Bounded test evidence is retained independently of availability.

## Exact proposed release

Application commit `f859fda054f0d367c983e131feee6e6ddd7ae861`, PR https://github.com/borvat/sam-greenfield/pull/86. Later evidence-only commits do not alter the deployed application. Review and choose the repository integration route before any protected-branch merge; never push directly to main or bypass protection.

| Existing production service | Current baseline observed | Proposed scope |
|---|---|---|
| sam-runtime / srv-db37vbvlk1mc739o0b70 | e0eb20a6637b3ba4221172b341c8a27e156b9528 | Same reviewed application revision with existing production entrypoint/env |
| sam-mcp / srv-db37vbvlk1mc739o0b7g | e0eb20a6637b3ba4221172b341c8a27e156b9528 | Same reviewed revision; refresh ChatGPT tool discovery after health/read acceptance |
| sam-command-center / srv-db37vbvlk1mc739o0b6g | 62ad8bd79095e4c10bfa0708f26e06bb21232d21 | Same reviewed revision, preserving authentication and production configuration |

Do not copy the isolated Dockerfile, restricted test database binding, synthetic company or test opt-in into production. Retain existing resources/plans and budgets; no subscriptions, grants, RLS edits, DDL, model calls, analysis admission or external effects are proposed. No change has been applied to these services.

## Review and acceptance before/after any approved promotion

Confirm production entrypoint/environment compatibility and the exact app tree; preserve source/report hashes, consumed reservations and side-effect keys. Deploy matching services without introducing a mixed-version interval that can execute new work; select the deployment sequence from actual production operational controls. Do not invent a pause control or silently change scheduler permissions. Record each deploy and safe rollback target.

Read the preexisting successful goal/report and budget/audit evidence only. Require exact report hash, no new execution, safe null/partial coverage semantics on existing saved-source local tests, scoped memory/status reads, common service revisions, and no side-effect/model activity. Existing read success is not send authority or legal merchant identity proof.

The original email goal `53424b11-c854-40e4-a264-14af2b7d33b0` remains WAITING_EXTERNAL and unmodified. Do not fabricate a historical preflight audit to pass the new continuation gate, reset its budget, reread its messages or invoke a review model automatically. A separate narrowly reviewed recovery action must establish valid historical evidence or record an honest legacy-evidence blocker. Any new model/analysis attempt still requires the owner's explicit request under SAM-Hermes policy. Production promotion alone does not authorize it.

## Risk and rollback

The V2 interpretation contract intentionally restricts the model to source references; source-derived Arabic rendering replaces free prose for future reports. Original historical reports remain immutable and are labelled as not validated under V2. Existing RLS may hide earlier-plan reports; preserve it. Execution knowledge/notification feature flags retain their actual production state, never inferred from isolated testing.

Rollback application services to their recorded prior revisions if health/scoped reads regress; do not reverse database history, reset money reservations or broaden access. No production rollback operation is currently requested. Continued test availability beyond the one approved lease is a separate access-duration decision; no automatic renewal is prepared.


## Executed resolution

All three existing application services run the approved application commit f859fda054f0d367c983e131feee6e6ddd7ae861. No PR/main merge was used. Their source is the isolated pinned delivery/sam-reliability-reviewed-20261028 branch, and auto-deploy stays off. The existing Blueprint uses a separate configuration branch delivery/sam-production-binding-20261028, commit9b212547fec4b27796f3aed25d97a39dab7a770d, path deploy/render/production-binding.yaml, AutoSync No. The configuration branch is not the application source branch.

CC initially rejected its old sam_trial_postgres_user owner login. A reviewed temporary start diagnostic used one connection and BEGIN READ ONLY with exact-revision admission. The final repair changed only its DATABASE_URL reference to the existing Runtime variable and restored its normal launcher. Render resolved that reference internally; no credential value was exposed, generated or rotated. The current fixed production principal is sam_runtime_app, org566baa67-5d93-4195-a1d0-18c1649154bf, entity73aa81c6-3a23-4369-9408-8bea0956d399.

Changing the Blueprint source branch triggered validation of the old root render.yaml before the custom path was updated, even though AutoSync was No. Render rejected its proposed database downgrade before applying it. Service configurations were confirmed unchanged, then the correct custom file produced a preview with exactly two CC changes. Only that reviewed preview was approved. The database remains0.1c-256mb/1GB/PostgreSQL15; no downgrade occurred.

Recorded production deploys: MCP dep-dbgk81m7bikc73ae2ok0; Runtime dep-dbgk8ul9el5s73d1duf0; CC dep-dbgkfjs9v7es738fp7rg. All healths returned200 with the same exact revision. Existing report/hash, email state/records, model ledger29/cost-field sum0.75 and nine review-budget events were unchanged. New read-handler execution used the actual production principal; existing ChatGPT timeline/status reads were independently verified. This chat's cached tool metadata still omits the new read-tool names. No authenticated CC browser session is claimed.

The original email goal remains WAITING_EXTERNAL/nullwake by explicit instruction. No new model/analysis, source recollection, send or other business effect occurred. Execution knowledge and notification features remain disabled; operational memory is scoped and available but currently has zero visible production records. The earlier synthetic persistence proof remains isolated from business data. The test service was re-suspended after its sole lease expired.

## Proposed engineering lessons — not approved rules

Scope: SAM engineering; source: this dated production rollout and its evidence JSON. Approval status: PROPOSED, not an owner decision or a planner rule. Keep these as review candidates; do not overwrite the separate concurrent BMAD learning work.

- Check every component's own database principal. A healthy Runtime does not establish that an older UI avoids an owner connection.
- Use a live secret-free export and explicit current-plan comparisons for Blueprint repairs. Source/path saves can initiate validation independently of AutoSync; an old root file can contain obsolete plans and privileged default connections.
- Keep app revisions pinned separately from infrastructure configuration, and require the effective Render preview before approving a sync. Use supported service references instead of exposing credential values.

References checked: https://render.com/docs/blueprint-spec ; https://render.com/docs/configure-environment-variables ; https://render.com/docs/compute-plans ; https://render.com/docs/infrastructure-as-code . Markdown responses were unsupported by the retrieval tool; the corresponding current HTML references were read, and the current public JSON Schema was fetched and validated with AJV.
