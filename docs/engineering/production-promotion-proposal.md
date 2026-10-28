# Reviewable next decision: promote the verified SAM application

Status: **prepared, not authorized or executed**. The owner authorized bounded isolated testing, explicitly excluded production changes/main merge, and approved one existing test login window only. That window ends 2026-10-28T01:00:25.521Z. Bounded test evidence is retained independently of availability.

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
