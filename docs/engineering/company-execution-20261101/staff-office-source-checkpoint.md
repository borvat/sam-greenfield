# Staff and office source checkpoint — 2026-11-01

Status: isolated source checks PASS; independent review and native/live acceptance pending. Latest explicit owner steering permits parallel staff15/office source work despite the backup/release blocker. No production operation is part of this checkpoint.

## Implemented

- Fifteen stable, immutable staff profiles have Arabic purposes, responsibilities, acceptance checklists, escalation and shared input/output/handback protocol. SAM remains supervisor. Capability ownership, authority, budgets, leases, fencing and bounded recovery stay in their existing modules. Documents and communications map through their existing owners when a capability name alone is insufficient; unknown owners/capabilities remain unassigned.
- Existing specialist claim records staff attribution only with `SAM_COMPANY_ENABLED=1`. Existing queue assignment validates trusted company scope and role match; it does not enqueue or execute work or grant approval.
- The existing Command Center renders the office only when that flag is explicitly enabled. Its authenticated company-bound API returns the latest 500 persisted queue items, execution/result/evidence/verification IDs, current plan, lease/version/fencing data, failures, waits and incident references. The UI shows at most 20 tasks per profile and links each to the existing timeline/report view. Company selection shows the authenticated fixed company; caller-supplied company selectors are rejected.
- Existing 15-second polling refreshes the office. A separate timer only invalidates old snapshots; it never lights a working state. Expired leases become STALE. Snapshot age over 45 seconds, or a fetch failure, makes displayed current states unknown. Arabic RTL, native details/buttons, keyboard focus, text-safe rendering and responsive cards reuse existing styling.
- Staff performance counts only the latest execution for a queue with a current-plan, matching-hash VERIFIED receipt from a different actor, plus persisted specialist attribution. Failed/unverified results do not add verified performance. Recall additionally excludes candidates, expired/foreign lessons, changed receipts/hashes, wrong role and old plans. Existing learning/evaluation composition restrictions are preserved.
- New optional ledger links connect a trusted runtime queue ID to actual `model_calls` rows in the same company. The existing specialist reasoning gateway records this link only when the company feature is enabled. Failed calls with unknown cost remain unknown. Displayed amounts are explicitly attributed model-ledger subtotals with call IDs, currency and measurement time; unattributed historical costs and total task/company costs are UNKNOWN. Ledger cost is usage times configured prices, not provider invoice evidence.
- Existing draft five-rank criteria remain explainable and grant no permissions. Live snapshots remain “not assessed”: there is no complete cost coverage or independently assessed authority-compliance source. Missing data cannot become zero breaches or a promotion.
- Skill proposals remain quarantine-only until all source/license/dependency/secret/isolation/evaluation checks have review evidence from a different proposer identity and explicit adoption. Pin changes invalidate review/adoption in both application and DB guard, including commit-only changes. Adoption does not install or run code. The fixed Command Center owner identity cannot approve its own proposal as an independent reviewer.

## Isolated verification

Initial checkpoint commands (historical; see post-review patch checks below):

```sh
DATABASE_URL=postgresql://synthetic:synthetic@127.0.0.1:1/synthetic node --import tsx --test tests/isolated/company_staff.ts tests/isolated/company_office_ui.ts tests/isolated/command_center_company_gate.ts tests/isolated/command_center_auth.ts
npm run typecheck
git diff --check
```

Initial result: 9 tests PASS, typecheck PASS, diff whitespace check PASS. The new PGlite case applies the real additive 00014/00015/00016 SQL to a minimal fixture, exercises stored office data through the real authenticated HTTP/store path, real model-gateway ledger writes using synthetic local adapters, denied cross-company attribution, restricted-role RLS and pinned skill transitions. UI tests execute the embedded script with a synthetic DOM/API, including exact bearer transport, evidence drill-down, text-safe hostile values and stale invalidation. Existing authentication and checkpoint-disabled/read-only tests remain passing. No provider requests or outside sends occur.

`staff-office-source-manifest.json` records the exact source hashes. The scoped Gitleaks directory scan covers full final versions of those changed files plus this checkpoint, with no scanner exclusions copied. Its result is recorded separately. This is not a whole-repository or history scan.

## Activation and reserved gates

- Flags default off; nothing enabled or migrated. Core 00014 is a preserved earlier draft; new core migrations 00015/00016 are additive and must be reviewed/pinned before any operator application. Application roles gain no DDL/grants. Schema ledger/native compatibility and restricted-role production permissions remain operator verification gates.
- No scheduler/routine expansion in this checkpoint; prior executive-report drafts remain unactivated and incomplete. No production DB/network/secrets/privilege change, deploy, main/push, new service/resource, new paid/model cost, or external send.
- The existing intelligence composition remains synthetic/evaluation-only. This source checkpoint does not make 15 autonomous business employees live, prove every role has an integration, or establish a real multispecialist commercial goal.
- Original PR86 native recovery, unchanged historical evidence, authenticated owner-browser usability/visual QA, real intake/delegation/execution/verification/report/closure/restart and approved report delivery receipts remain pending. Synthetic DOM/PGlite checks are not those live proofs.
- Parent owns release/backup work and separate reviewer/verifier execution. No changes made in `sam-rollback`.

## Review fixes — affected checks only

- Skill SQL now rejects absent, JSON null, non-object or nonmatching mandatory checks using explicit `IS DISTINCT FROM` checks. Direct SQL REVIEWED/ADOPTED writes with evidence only, null/array checks or an incomplete checklist are rejected by the real PGlite-applied trigger.
- Task-summary state labels now share profile-state invalidation, preserving capability/task IDs while removing active wording after failed refresh or snapshot age over 45 seconds.
- Both added regressions failed against the previous source and passed after the patches. Only `tests/isolated/company_staff.ts` and `tests/isolated/company_office_ui.ts` were run: 3 tests PASS. Diff check PASS. Typecheck and wider verification were deliberately left to the parent. Source manifest and scoped full-file secret-scan evidence were refreshed after the patches. Default-off flags and production boundaries are unchanged.
