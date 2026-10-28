# SAM phase five: read-only source inspection

Inspected 2026-10-27; authenticated GitHub main was rechecked at 22:43 UTC and remained **b55da2761e8fd1de3833be55f03d4fdd268cd0a3**. Complete recursive tree: **159de07f40d1da723e4e452990607c6722b98060**, truncated=false. Every fetched file's returned blob SHA matches that tree. Source snapshot and tree are adjacent to this report. No SAM source, DB, service, runtime policy, approvals or remote state changed; no test, paid call or model inference ran.

## Current authorities and approval flow

- Runtime durable knowledge is PostgreSQL `world_facts` plus `memory_records`, defined in migration 00005. `apps/brain/src/contextAssembler.ts` normally loads active VERIFIED world facts and only REINFORCED / APPROVED_RULE memory, then `executiveBrain.ts` supplies that context to planning.
- `apps/brain/src/learning.ts` checks the latest verification is VERIFIED. `learnVerifiedWorldFact` binds evidence to its verification, deduplicates repeated source/value, appends a fact and timestamps prior matching entity/attribute/scope facts as superseded. `observeVerifiedMemory` starts OBSERVED, deduplicates the same execution and defaults to reinforcement after two different verified executions. Its TypeScript input excludes OWNER_DECISION/FORMAL_RULE.
- Independent receipts originate in `apps/kernel/src/verification.ts`: verifier differs from actor; contract requires independent evidence; evidence must be nonempty; execution plan/execution hashes are retained; conflicting repeated receipts are rejected.
- Automatic learning is opt-in by bundle `verifiedLearning`. `apps/production/src/learning.ts` selects only configured capabilities with independent hash-matching VERIFIED receipts, applies a capability-owned projection, learns facts transactionally and writes audit evidence. `composition.ts` invokes it after verification. The configured local calculation/statistics bundle projects only `local_<operation>` numeric facts. Authenticated current code search finds `verifiedLearning` in types, learner, localCapabilities and native-bundle test; do not claim every deployed bundle learns.
- `recordOwnerRule` explicitly inserts APPROVED_RULE and can mark a prior approved rule SUPERSEDED. **Implementation limit:** it checks only nonblank `approvedBy`, not an authenticated owner credential/approval row. Exact current GitHub code search returns its definition and two synthetic phase5 tests only. A separately secured owner promotion endpoint is not established by this source. Schema PROPOSED_RULE/REJECTED states alone do not implement a review workflow.
- **Scope limit:** normal `loadApprovedMemory` filters status but has no entity/scope predicate. Table RLS is enabled; this is not evidence of enforced tenant filtering. Do not use this loader as a model for engineering storage or claim additional tenant/approval guarantees.
- Development planning is deliberately different: ordinary safe mode permits owner-allowlisted fact IDs/values and returns `memory:[]`; bounded autonomy reads only local facts with entity/domain/capability and execution/verification provenance checks and still returns `memory:[]`. Synthetic release pilot returns empty facts and memory. These paths must remain unchanged.
- Non-GREEN action approvals are separate: `authorityGuard.ts` checks exact capability/parameter hash/entity/authority, status, expiry and use bound; `packages/db/src/approvals.ts` consumes under lock. Engineering lessons cannot grant those approvals.

## Existing engineering memory; collision check

The complete tree contains **no AGENTS.md, _bmad directory, tools/agent_learning.py, or docs/agent-learning directory**. It already contains a canonical engineering directory, **`.agents/memory/`**, whose `MEMORY.md` indexes 13 guidance notes. All 14 files were fetched from current GitHub, not inferred from history.

Examples: `autonomy-evidence.md` separates fixture/frozen-build/live/recovery proof; `release-readiness.md` separates arithmetic, goal acceptance, learning and live/build provenance; `github-write-proof.md` separates auth claims from actual push evidence; `data-release-consent.md` limits model disclosure. Notes also preserve dated owner architecture/budget/database preferences. Their existence is valuable source provenance, not fresh approval, current service evidence, or authorization to execute those activities.

**Recommendation:** augment this existing directory/index; do not add a competing `docs/agent-learning` memory authority or import operational DB records.

## Minimum future project-only BMAD integration

1. Add minimal `_bmad/config.toml` for SAM and `_bmad/custom/bmad-build.toml` for original BMAD only. Keep installed upstream skill files untouched. Setup generates the ordinary original runtime; project overrides remain tracked.
2. Reuse the accepted accounting stdlib helper at `tools/agent_learning.py`, changing its single ledger constant to **`.agents/memory/engineering-lessons.jsonl`**. Add **`.agents/memory/engineering-learning.md`** as policy and a short entry in existing `MEMORY.md`. Existing notes stay canonical references; the ledger holds reviewed engineering lessons and inactive candidates within the same directory.
3. Adapt accounting customization paths and tags to `engineering` / `sam`; remove invoice/PR47/deployment-specific targets. Persistent facts point to the engineering policy; activation runs audit then filtered brief before edits, with honest LEARNING_UNAVAILABLE handling. On completion, capture at most one actually evidenced new CANDIDATE, audit it and preserve only scoped evidence under the task's existing development-branch/publication authority. Candidate capture cannot alter delivery status or grant push/merge/deployment authority.
4. Add isolated Python tests under **`tests/agent_learning/`** for fresh-process candidate exclusion with a nonempty candidate fixture, invalid append preserving bytes, contained evidence paths/symlink rejection, Unicode/newline framing, retirement filtering and zero-approved startup. Test the original customization resolver/rendered build fields and actual pre-edit CLI output. No Python import, DB connection, runtime bundle/context import or scheduled loop belongs in this mechanism.
5. Keep `apps/brain`, `apps/production`, `apps/development`, migrations, operational memory, approval tables, SAM services and runtime environment flags untouched. A tracked local ledger is engineering guidance; it must never be projected into SAM's planning/world-fact/approved-rule context.

## Seed and evidence provenance

**Prefer an honest empty ledger: zero verified/approved records, no invented improvement claim.** Existing SAM notes remain readable through their current index, but do not silently reclassify all of them as verified ledger records. No candidate was approved by this inspection.

Accounting's already verified `invoice-delivery-vs-code-20261027` is a possible later explicit import of a generic source-vs-delivery invariant, not SAM delivery evidence. Its current record retains TEST-B/invoicing scope, and SAM already has overlapping evidence-boundary notes. Importing it adds little to this minimum change. If expressly selected later, preserve the existing approved wording/status/ID and source commit, copy the complete supporting evidence to a contained project path and record an import manifest tying record and evidence blob hashes to the accounting origin; clearly label historical cross-project provenance. Do not rewrite it into a newly approved SAM claim or import the accounting candidates. Merely linking an external URL will not satisfy this helper's existing local-evidence validation.

Accepted accounting origin **934ca31698eb6a46a0b6eb8ab64b01ba19237036** was fetched directly through GitHub. Local `accounting-final` bytes were hash-matched to these exact returned blobs:

| Accounting path | Blob SHA |
|---|---|
| tools/agent_learning.py | a16204a51da6619f7634e32dbbdf151152ce11e1 |
| _bmad/custom/bmad-build.toml | e6dd7c164ba4468e6e9768f13879b8e2d567525a |
| docs/agent-learning/lessons.jsonl | 9564a128a067c485abcf58673b2bf704f93461f6 |
| docs/agent-learning/README.md | 82ef782983f5184142094bd70be2d0038b8921d2 |
| docs/completion/INVOICE-TESTB-DELIVERY-20261027.md | a06f215c157cabead55b98c2d6583d729845c0c2 |

## Exact tests and future commands

Current `tests/phase5/verified_learning.ts` asserts fact supersession, duplicate-support exclusion, two-execution reinforcement, owner-rule context inclusion and FAILED-memory refusal. `final_acceptance.ts` additionally checks newer INFERRED facts lose to VERIFIED, approved-rule supersession/context exclusion, failed fact/memory refusal and no poisoned fact row. They use real SQL and synthetic owner identities; they do not prove an authenticated owner approval API.

Current package scripts have `typecheck` and `test:development`, not a phase5 npm script. The development runner validates target identity and creates/migrates/drops a disposable schema for each selected suite. The commands below are **proposed, not run here**; DB commands are only for a separately authorized isolated development database:

```bash
# Future engineering-only implementation and original BMAD setup:
python3 tools/agent_learning.py audit
python3 tools/agent_learning.py brief --tag engineering --tag sam
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/agent_learning -v
python3 _bmad/scripts/resolve_customization.py --project-root "$PWD" --skill "$skills/bmad-build" --key workflow.persistent_facts --key workflow.activation_steps_append --key workflow.on_complete
uv run --no-cache _bmad/scripts/render_skill.py --project-root "$PWD" --skill "$skills/bmad-build"
npm run typecheck

# Existing real-PostgreSQL phase5 regression (writes disposable schemas):
npm run test:development -- tests/phase5/verified_learning.ts
npm run test:development -- tests/phase5/final_acceptance.ts
# Related scoped knowledge-reuse regression:
npm run test:development -- tests/development/autonomy.ts
```

`$skills` must refer to the host's installed original BMAD skills directory. Resolver output proves fields, not execution of instructions; retain actual command output and exact tested SHAs. Historical PASS claims in README/DoD were read as history, not rerun or independently certified in this inspection.

## SAM source identities

All rows below belong to the pinned main commit. Full fetched content and SHAs are in `source-snapshot.json`; every fetched source matches `tree.json`.

| Path | Blob SHA |
|---|---|
| README.md | 8db0d168811d62658f45de23403774df5d94f77b |
| package.json | fee957c1236bcc1ac0fc43f4840ede22289c48bd |
| docs/PHASE5_SCOPE.md | c99ac99e3731a72a623a37548541540a807a073e |
| PHASE5_DOD_CHECKLIST.md | 9046d34acd305d34e2ea58c782919c22debff326 |
| apps/brain/src/learning.ts | ebccbb9bcb966c717d9e4d5f684f753ba68ebe7d |
| apps/brain/src/memory.ts | a86f9cd417ac0374b91464e74f27e7eb27a827e0 |
| apps/brain/src/worldModel.ts | e92a912b2e1e074e5fd33244fad08b081db9e8af |
| apps/brain/src/contextAssembler.ts | 2c8b8c13bb97ae5f465305b7c6236324ff2d0944 |
| apps/kernel/src/verification.ts | 101c360a1d295fb047bf62782ee2c16f5beef417 |
| apps/production/src/learning.ts | fdd1ce44bc444be0bc32b376d3b82715acc14288 |
| apps/production/src/composition.ts | a6cdfae168bd4cb3f216ed93b7a2cac8f42bc846 |
| apps/development/src/planningPolicy.ts | 1e79070dec73480c4aa281c214d5675350c56125 |
| apps/development/src/autonomyBoundary.ts | f6dc1e9fbda9c02ab94ec922890d3b44b1525b7d |
| apps/development/src/localCapabilities.ts | 8773f90ea741ec554207e04b04b94a07ef40a2a9 |
| apps/production/src/syntheticPilotScope.ts | b4eb1d6e7d5d2b01d44684fd7d673a5501783e7a |
| packages/db/migrations/00005_world_facts_memory.sql | 34cc5bd68be2af2fab0be24ffeec87d7743f34a0 |
| packages/db/src/approvals.ts | bd4641b6b1ace29b5422c9b5937ee68783963628 |
| tests/phase5/verified_learning.ts | 11c0aa9cf04383a45b8c0355b9914f7d62dc8ba0 |
| tests/phase5/final_acceptance.ts | e151759c2f3faf3c28e9a497a96021695b2f2f68 |
| tests/development/autonomy.ts | ff8b4c9c3326c8f7d0ad761cb4c2b45563cb698f |
| scripts/development/test.cjs | 8cc440e565575a6542b66bf5d45615b6593cfbea |
| .agents/memory/MEMORY.md | 8f76edfe6ad601a02353d764df489055e42b90f5 |
| .agents/memory/autonomy-evidence.md | 0f989d323d205aea2edbc23aff714adc770fd197 |
| .agents/memory/release-readiness.md | ff699118e1ffe8a57fc1b3cf9dcc1ae738a5b4fe |

