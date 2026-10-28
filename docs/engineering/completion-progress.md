# SAM continuation — single coordinator record

Coordinator: root, current session. Application implementer: `implementation`; independent verifier: `verification`; read-only intake workers: `intake_memory`, `recovery_assessment`, `surface_assessment`. These are new session workers, not resumed historical agents.

## Current checkpoint

Phase: implementation in progress; no new application deployment or live mutation yet. Plan: `_bmad-output/plan-sam-executive-completion.md`. Starting application/evidence: `a55fe807827d0f6869c8bc313ae00ffb5672d207`, deployed application `f859fda054f0d367c983e131feee6e6ddd7ae861`. Existing BMAD engineering continuity branch `feature/bmad-unified-memory-20261028` at `f6b580d` was merged locally as `023b577ead39a8255fa94046ed1ea2f1b2f48938`; its application source is unchanged. Original setup regenerated ignored scripts, and original `bmad-build` rendered once. Activation resume/audit/brief read; zero verified engineering lessons, prior tests historical.

PR86 remains Draft/open/unmerged at a55fe807. All three existing services remain LIVE at f859fda, auto-deploy off, no later deploy. Blueprint branch/path remain separate. `sam-isolated-test` remains suspended; expired lease not reused. No main integration.

## Current live baseline

Observed via authenticated Render Runtime shell, role `sam_runtime_app`, org `566baa67-5d93-4195-a1d0-18c1649154bf`, entity `73aa81c6-3a23-4369-9408-8bea0956d399`. Database time `2026-10-28T01:35:23.624Z`.

- Model ledger: 29 rows; sum of cost field 0.75 (not invoice or balance).
- `READ_REVIEW_BUDGET` audit entries: 9. Initial probe used the nonexistent action `READ_REVIEW_BUDGET_RESERVED` and returned 0; corrected query established 9, with no write in either probe.
- Active work 0; scheduled WAITING_EXTERNAL wakes 0. States: COMPLETED369, FAILED30, WAITING_EXTERNAL16, WAITING_OWNER1.
- Operational memory0; notifications0; `notification_settings.id='owner'` absent. Integration/knowledge/notification feature env keys absent. Do not enable broad integration to solve this.
- Original mail execution snapshot md5 over ordered JSONB rows: `80c6660d9bb257c34efa38993b3a60a4`; verification joined-row snapshot: `2ce4274f779216983a6285f1a0fe71af`. Same query/order must be used for comparison; these are snapshot comparisons, not replacement for canonical stored SHA256 evidence.
- Existing ChatGPT system_status succeeded; original analysis timeline returned original report/hash. Mail timeline unchanged and exact sanitized binding in `completion-mail-baseline.json`; no message IDs/content committed.

## Decisions grounded in intake

1. Existing source-only `knowledge_records` RLS/trigger must remain. Approved-owner decisions use the existing `memory_records` OWNER_DECISION/APPROVED_RULE route with trusted provenance and strict relevant-task/company recall.
2. Mail recovery derives a sanitized diagnostic from the exact saved verified reads only, validates hashes/latest receipts/current plan, and uses legal VERIFYING transitions and atomic acceptance. No historic preflight, model, mailbox collection or budget reset.
3. Notifications use existing owner_notifications with explicit company activation and append-only audit receipts. Do not expand read_at/confirmed_at grants or claim UNROUTED is sent. Narrow periodic projector must not activate broad integration/perception/history scans.
4. Existing timeline/status will carry compatibility metadata for cached tools. Actual session lacks sam_get_report, sam_memory_status, sam_recall_memory and sam_list_notifications, although server handlers exist. Plugin-permission lookup found low-risk default access; no refresh operation is exposed by that tool.
5. Browser inspection reached actual CC login screen at f859fda. No authenticated CC browser session is available; preserve authentication and token. Render shell is authenticated. Do not infer browser acceptance from native data/API checks.
6. Activepieces current scheduler `iOKQTpGgH2u33CFln6XoC` is still an hourly heartbeat code step only, not a ChatGPT wake or SAM-result delivery. It was read, not modified/test-triggered. Existing ChatGPT automations were inspected privately; no new or changed task yet. Official docs describe scheduled chat polling and supported app events, but no existing SAM event delivery path has been proved.

## Next step

Finish sequential candidate implementation, independently review and test affected paths, then publish and stage existing-service promotion with exact revision/rollback. Root will explicitly activate only the narrow authorized internal result center, run operator dry-run before any bounded mail apply, and record local versus native/connected/browser evidence separately. No general readiness claim before that work.

## Review checkpoint

Original configured BMAD build rendered a Quick review workflow; root additionally ran an independent security inspection and independent testing. Original Quick found the native UUID join mismatch and stale notices; security independently confirmed the stale-notice defect and no further concrete reachable issues in its inspection. These are recorded individually in the plan triage, grouped into two minimal patches. No application deployment or live recovery preceded the review.

Independent verifier reproduced the UUID defect with actual UUID fixture type: focused run2/fail2/exit1, SQL42883. The first combined verifier run was interrupted at exit130 after its pool mock failed to implement the pool.query callback path; it is incomplete, never PASS, and was corrected in verifier-owned fixture code. Root/worker tests are overlapping and not additive. Final green evidence is pending at this checkpoint.

## Existing-service deployment and rollback contract

Publication uses the GitHub connector: direct Git push had no credential in this environment. Remote checkpoint `43bd5f011aa4c5aa26a2d1e9f0920d23a9f65c6a` has the exact same tree `36ef1c4a525b7e3fc79e8bb8c8edb7cc5143d82d` as local checkpoint e08e390; parents preserve PR86 baseline plus existing BMAD branch. No main ref was changed. Final published application must have a matching reviewed tree, be pinned on the existing application delivery branch, and remain separate from Blueprint branch/path.

Deploy MCP, verify connected read/backward compatibility, then CC, verify health/auth gates/browser-visible build, then Runtime after a fresh no-active-work preflight. Add only the non-secret Runtime key `SAM_OWNER_CONTINUITY_ENABLED=true` with merge semantics; preserve every other env variable. This key is omitted from the separate existing Blueprint, whose omission preserves variables; AutoSync remains No. Do not enable integration/knowledge/perception/Hermes/model features. Native synthetic operator is rollback-only and must prove zero persisted business-test rows. Explicit scoped notification activation is a real authorized config audit, followed by operator diagnostic dry-run, bounded apply, idempotent replay and unchanged source/model/budget snapshots.

Rollback target is the existing retained f859fda deployment/artifact on each service, with narrow flag false if necessary; no schema changes are introduced. Before using old code, require zero newly approved owner-decision rows: old f859 recall predates task-context filtering, so retained decisions would require the scoped-read fix or fix-forward rather than blind rollback. Native synthetic acceptance leaves no such rows. Rollback never deletes or rewrites reports/audit, or undoes a valid deterministic completion. The completed diagnostic remains a saved immutable current-plan result and must not be reopened by rollback. Existing original report, source reads and parent goal stay preserved.

CC native shell is unavailable on the existing free plan: Render showed an upgrade-required modal. No upgrade/new job/secret extraction was performed. Actual authenticated CC browser/API traversal remains distinct from same-principal native store acceptance; public browser and 401 checks alone never establish an authenticated session.
