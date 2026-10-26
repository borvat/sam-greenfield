# SAM × Hermes: real-project expansion gate — 2026-10-26

Status: BLOCKED BEFORE REAL-PROJECT MODIFICATION AND BILLABLE EXECUTION.
This checkpoint includes isolated broker hardening, independent audit tests and
an UNREGISTERED real-task/publisher preflight. No deployed configuration,
accepted records, production files, or selected UI source were changed. This is
engineer-authored safety preparation, not a Hermes-authored repair or rollout.
Baseline audit checkpoint: `80f61a62b19e322064e6b0b0ac302541a5a787de`.

## Verified read-only handoff

- PR #66 remains open/draft/unmerged, head `91da88a224eabb2e0a9701dd1ed462c7a0e69f2d`.
- PR #65 remains open/draft/unmerged, head `7d41234efa7ded30612cfc2e911df82cdf5e39e0`.
- The final coding acceptance report and PRIVATE fixture PR #1 were read. Fixture
  head is `34299bb683dee2f5e16bf0bec571f9158db0b599`. Their accepted historical
  clamp/46-assertion/one-attempt/container-replacement results were not rerun.
- Render workspace confirmed by listing: Sam's workspace, matching owner email.
- Latest SAM deploy record: `dep-dbfcs1ss728c73euoid0`, live, source
  `93f37e535ceafe7b9053afe96b083a2a12d607ba`. Auto-deploy is off.
- Latest Hermes deploy record: `dep-dbfcm40473hc73cllb6g`, live, pinned image
  `docker.io/nousresearch/hermes-agent@sha256:fd822bae0a61bf023450737edbeaeea5fc6460f17cb4ee240a7e67b306ed63fb`.
- Recent SAM logs confirm restricted storage checks, five PostgreSQL build groups
  and authenticated smoke checks from that source. This is historical startup
  evidence, not a fresh database query or a new restart experiment.
- `sam-trial-postgres` is available. Hosted read-only query was refused because
  external connections are blocked. No networking/roles/data/window were changed.
- The final acceptance checkpoint reports campaign disabled and no pending
  execution/deploy/model task/sandbox. Current root-only broker policy, actual
  role expiry, pending-work counts, model runs and Modal inventory were NOT
  independently read live in this session. They must be read through an approved
  private/internal path before future admission. No authority renewal is inferred.
- No AGENTS.md was present in the inspected repository tree.

## Independent no-cloud audit

Commands, from the repository root:

```text
python3 tests/isolated/hermes_coding_worker.py -v
python3 tests/isolated/hermes_broker_expansion_audit.py -v
node --test tests/isolated/hermes_real_ui_repro.cjs
python3 tests/isolated/hermes_real_project_policy.py -v
```

Baseline controller tests: 5 passed. At checkpoint `80f61a6`, the independent
broker/worker audit had 15 tests: 11 passed and 4 FAILED. Those failures were
the evidence for G01–G04 below, and remain reproducible at that checkpoint.
After isolated hardening: 5 controller tests + 21 independent broker/worker
tests + 6 offline real-task/publisher policy tests passed (32 total). The old
broker test's invalid payload was replaced with a valid constrained artifact;
closed admission remains separately tested with a valid request. No failure
was skipped, masked with expectedFailure, or relabeled as cloud acceptance.
UI task reproduction: 1 test, FAILED as expected on the untouched original UI.

The new audit mocks the Modal API and worker subprocess. Candidate code never
runs on the host; synthetic file names contain no actual secret. It exercises
real local SQLite persistence and module reconstruction, not Render restart.
Passing fake-SDK checks establish forwarded options and control flow only;
they do NOT establish cloud isolation or provider enforcement.

Passing checks include: closed admission; conflicting-replay refusal; durable
replay after broker module reconstruction; no second dispatch after a simulated
worker timeout; claimed-job reconciliation refusal; minimal worker environment;
worker denial of unapproved paths/imports/host effects/empty or oversized source;
three fresh fake guests with explicit network/secrets/mount/resource controls;
and guest termination after a harness failure.

| Baseline finding | Reproduction and consequence | Isolated remediation, not deployed |
| --- | --- | --- |
| G01: validation after durable claim | Broker dispatched a malformed `../.env` artifact to the worker and consumed its only slot. Worker separately rejected it; no path traversal or secret read is claimed. | Full artifact/source/size validation now precedes database creation and worker dispatch. Invalid syntax is also rejected. Regression passed. |
| G02: incomplete receipt accepted by broker | `{ok:true,receipt:{complete:false}}` was returned unchanged. Existing SAM checks were additional protection; no end-to-end false verification is claimed. | New worker receipts bind job/source/requested-test/immutable-test hashes, stage identity/source/test/output hashes, expected exit statuses, 46 assertions and cleanup. Altered hashes/stages, duplicate IDs and booleans masquerading as numeric counts are denied. A future real-task contract must additionally bind base and policy identity. |
| G03: child exit status ignored | Nonzero subprocess exit with success-shaped stdout was accepted. | Successful process exit plus a valid bounded receipt are required; failures remain durable and are not automatically replayed. Regression passed. |
| G04: stored result hidden by closed policy | Identical completed-result replay returned POLICY_CLOSED, without reexecution. | Existing-result lookup now precedes admission policy, retaining closed admission. Legacy complete receipts remain byte-equivalent JSON history without being accepted for a NEW job. Regression passed. |

The trusted broker imports validation from its fixed operator-owned worker sibling;
it never imports a payload path. Loading that module performs no Modal import or
candidate execution. No new library is installed. The original installer still
needs paired-file artifact/hash verification before any future rollout; current
deployed files were not replaced. Root-only ownership remains required.

Additional source-review concerns, not independently exploited:

- Controller timeout/kill can bypass its finally block. Local timeout test proves
  no retry but not cleanup after controller death. Provider lifetime bounds guest
  duration; current code has no durable external reaper/reconciliation proof for
  this failure path. Preserve sandbox IDs before work, mark uncertain cleanup,
  reconcile externally, and prove no orphan before admitting another job.
- The isolated worker now caps the requested lifetime by the integer remaining
  campaign seconds (and 90 seconds), and rejects an expired campaign before guest
  creation. Fake-SDK tests pass. This does not prove wall-clock expiry through
  provider provisioning delays, prompt revocation or controller death; live
  lifecycle/reconciliation proof is still required. No old window is renewed.
- Current image builder uses a Python version selector rather than a recorded
  immutable image identity. The installer pins Modal 1.6.2 but performs runtime
  pip resolution without a dependency hash lock. No dependency provenance or
  frozen Node execution profile has yet been accepted.
- Network blocking, empty guest secrets/mounts/OIDC, credential separation and
  non-root/resource limits are explicit in source and historically tested for
  clamp. None of these findings establishes an escape from that accepted run.
- The controller is deliberately hardcoded to one `clamp.py` and a 4,000-character
  source/test limit. It is unsuitable for the selected real UI without a new,
  independently tested language/file profile. Do not broaden it implicitly.

## Publisher gate

GitHub installation inspection returned `repository_selection: all` for the
existing connected identity. It is NOT a repository-limited publisher.
Available tools can publish files/branches/PRs but cannot mint a new narrowly
scoped installation token or inspect/reconfigure that token's grants.
No credential was requested, read, copied to a guest, or changed.

Repository rulesets endpoint returned an empty list; classic main protection
inspection returned HTTP 403 (integration lacks administration access). The
403 does not prove protection absent. Main-write prevention is unproven.
Do not test it by attempting to push to main, and do not alter protection.

Required separate identity: selected repository `borvat/sam-greenfield` ONLY,
minimum contents/PR write plus required metadata read, no administration,
workflow, deployment or secret permissions. Its trusted publisher must enforce
an immutable repository/base/file allowlist, a new prefixed branch, Draft PR only,
no merge or main write, credential removal before any candidate execution, and
durable idempotent publication receipts. Existing main protection must be
verified through an authorized read path. Reject a target outside that one repo.
Do not narrow the user's global connector or break other connected projects.
No repository-limited credential has been provisioned or accepted.

The broad user-authorized connector is used only to save this review checkpoint;
that administrative documentation write is NOT the future accepted-code publisher.
Commits use `[skip ci]`; no workflow dispatch, billing repair or Actions testing
is requested. Do not use Actions as validation for this work.

## Selected real task, prepared but NOT executed

Repository: `borvat/sam-greenfield`. Baseline:
`91da88a224eabb2e0a9701dd1ed462c7a0e69f2d`.
Only candidate-modifiable path: `apps/command-center/src/ui.ts`, Git blob
`21d6d90babdbc6921075c0a2f2a050c9f9e8cf49`.

Bug: `timeline(id)` changes the selected goal and shows loading in goalProgress,
but leaves finalReport and timeline populated with the previously selected
goal's report/evidence while the new request is pending. A slow or stalled
request therefore displays mismatched evidence. This is a presentation defect;
no execution, accounting, payments, inventory, auth or database change is needed.

Expected behavior: clear/replace both old report and raw evidence immediately on
selection; show loading until that selection resolves; retain the existing
request-generation check so late responses cannot overwrite a newer selection.
Keep success, error, report escaping, endpoints, permissions and goal execution
semantics unchanged. No CSS redesign or unrelated refactoring.

The independent local repro loads the actual template/script in a Node VM with
a fake DOM, empty fake session and a never-resolving synthetic API. Real fetch
throws if invoked. It confirms that the old report stays visible. This is not
a browser screenshot or Hermes execution. It makes no real HTTP/model call.

Prepared verification contract for a future immutable guest suite:
1. Reject the untouched baseline (wrong-control test).
2. Preload goal A report/evidence; selecting B immediately removes BOTH A panels.
3. B success displays B; B failure shows Unavailable and never A.
4. Resolve A after B and verify the existing stale-response guard still holds.
5. No API call/path/auth changes; no new file, import, network, install or external
   executable; existing escaping and report rendering remain intact.

The unregistered `deploy/hermes-coding/real_project_policy.py` now implements an
offline candidate/destination preflight. Six test groups check other repos,
main/merge/non-draft operations, extra authority, extra files, traversal, secret
and workflow paths, dependency/command/environment fields, altered baseline,
oversized or invalid encoding, unrelated source edits and executable insertion.
It only admits two static textContent loading assignments at the unique reviewed
location while preserving the exact original source. Its synthetic positive
control is never saved as a repaired source or attributed to Hermes. The
publisher preflight explicitly returns published=false and
credentialScopeVerified=false; it has no token, network or publishing code.
Baseline Git blob and SHA-256 were independently matched locally.

Remaining proposed transfer/runtime profile, NOT wired or live-approved:
exactly the pinned UI source
and immutable controller-owned tests; full source byte/hash checking; UTF-8 only;
32 KiB source, 16 KiB test and 64 KiB total caps. No repository checkout, git
metadata, environment files, lockfiles, package manifests, credentials, binary,
symlink or dependency sync. No runtime package download or install/lifecycle
script. A prebuilt immutable Node image with verified identity is required.
The offline patch guard preserves the entire baseline except explicitly bounded
loading-panel assignments at the reviewed selection point; do not admit general
JavaScript execution based only on filenames or VM confinement. Node VM is a
test harness, not an isolation boundary. Exercise adversarial changes before
opening the gate. Hermes must author the candidate after admission; no engineer
patch may be relabeled as Hermes output.

## Delivery status and restart point

| Acceptance item | This phase |
| --- | --- |
| Broker security audit passed for expansion | NO: G01–G04 fixed locally; lifecycle/provenance/integration live proof pending |
| Real-project file/dependency policy accepted | Offline bounded preflight and negative tests pass; no Node runtime/transfer/live admission accepted |
| Publisher credential restricted to one repo | NO: connected identity covers all; separate identity unavailable |
| Real defect selected/reproduced | YES: stale report/evidence while switching goals |
| Hermes performed the real repair | NO: not dispatched |
| SAM independently verified the real repair | NO |
| Real-repair Draft PR | NO; review checkpoint must not be reported as repair PR |
| New restart/persistence/no-repeat proof | NO; historical acceptance preserved, local SQLite reconstruction tested |
| Temporary resources closed | This phase created zero cloud/model resources; current Modal inventory not independently queried |
| Cost | No new billable operation initiated; existing Render hosting continues; current invoice not audited |

Do not reuse the prior USD 5 authorization. No paid model, DeepSeek, sandbox,
subscription, upgrade, window renewal, deployment, service change, database
change, Actions invocation, main push or merge was performed. No sub-agent or
parallel programmer was used.

Resume with the local G01–G04 hardening and offline profile already present; do
not redo them or represent them as deployed. Keep the real UI untouched.
The immediate external blocker is a separate one-repository publisher identity;
current tools cannot provision it or verify classic branch protection. Provision
it via a supported secure account
path and verify existing protection without changing it. Read current private
campaign/role/queue state via an authorized internal path. Only after those gates
and controller-death/image-provenance/real-profile integration gates pass,
request ONE new fixed financial approval with verified current account
caps and all-inclusive cost bounds; do not request payment merely to continue
this free preparation. Live gate -> SAM task -> free Nous candidate -> separate
immutable verification -> scoped publisher Draft PR -> persistence/readback ->
cleanup follows only after those prerequisites. Never replay the accepted clamp.
