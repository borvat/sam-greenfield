# Scoped evaluation runtime and artifact provenance corrections

Application commit: f9c74cc7d76c5b0888259a09343ca064ddc4a68f.
Application code pushed to PR55. This evidence branch remains LOCAL ONLY pending
specific metadata/evidence publication approval; no alternative publication.

Full acceptance command from the clean application worktree:

```
node /tmp/sam-generic-harness/verify-full.cjs --output /tmp/sam-evaluation-release-full
```

External readiness.patch is limited to source/pin path relocation and authenticated
TCP SELECT 1 instead of socket pg_isready. No application tests/assertions skipped,
no image pin or application deadline/budget expanded. The evaluation test child
process timeout increased from 25 to 45 seconds to accommodate the added actual
runtime loops and deliberate expiry barriers; this is test harness time only.

## Corrections and evidence scope

- Upstream samArtifacts is stripped. Both supported Google export tools populate
  it only from runtime downloads; extraction binds hash/bytes/MIME to execution
  evidence. Negative cases include no download URL, forged old result, and receipt
  mismatch. The initial unsafe outcome was independently reproduced by the reviewer
  in memory, not in production. New tests reproduce the supplied input and reject it.
- Actual trial + ordinary planner + frozen source execution + verification + report
  completion run together for three children. The NEW coordinator's planning attempts
  stay zero. Only registered frozen sources/local deterministic derivations are allowed.
- Cancellation and agent expiry barriers after model response/SQL insertion roll
  back child plan/report commits. Immediate dispatch denial invokes no source callback.
  Existing SQL permissions/triggers are unchanged. These guarded tests address the
  reviewer's static concerns; they are not old-head unsafe outcome reproductions.
- Startup now validates derived capability configuration and checks the existing
  operator-provisioned verification contract when present. Default bundle unchanged.

Targeted logs are supplementary; exact-head full acceptance below is authoritative.
local/sam-release-orchestration-test.log preserves a failed intermediate wrapper:
locking around the entire executor conflicted with nested admission transactions.
The final code locks only around the identity-registered source adapter, after the
ordinary executor's authority transaction, avoiding that lock nesting. The later
orchestration and commit-guard logs pass. No failure is relabeled as success.

No production access, real owner signing key/approval, live permit, paid model call,
capability activation, RLS/grant/migration change, merge or deployment. Existing test
suites generate synthetic fixture signing material/permits only. Live admission
remains release-disabled. Existing evaluation/specialist profile access cannot be
assumed for the ordinary production role. See docs/fixes/evaluation-release-boundary.md
for exact operator actions, privilege requirements and signed payload fields.

Prior f2aec742 and 52df8d31 acceptances are superseded for this corrected candidate.

## Final exact-head acceptance

PASS **59/59 stages**, including **49/49 regressions and 13/13 core tests**.
Started 2026-10-23T09:05:30.132Z; completed 2026-10-23T09:18:17.212Z.
Tree `805c37d2f666c9bcfa70556f39b21f95530f0015`. Independently recomputed and matched all
81 report artifact hashes. Source-integrity and cleanup passed.
No application changes followed this tested commit. Evidence remains local.
