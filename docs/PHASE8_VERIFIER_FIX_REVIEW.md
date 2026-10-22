# Phase8 verifier and learning reliability fixes

Baseline: `9d31791cb82d9edc47fdd435541eae4b0f91df82`. Separate continuation branch:
`codex/sam-phase8-verifier-fixes`. This is an AI-reviewed isolated engineering
change, not human approval, deployment approval or live-model acceptance.

## Reproduced findings and changes

1. Signed accounting could claim 14 model attempts reserved only 14 tokens and
   USD0 while retaining positive prices and larger declared envelopes. It scored
   PASS. The verifier now binds model/provider to pinned prices, checks integer
   input/output ceilings against trial/agent bounds, reconciles token and money
   reservations, binds invocation metadata, and validates successful usage.
   Specialist reservation metadata uses the same trial-clamped envelope as the
   gateway; commercial acceptance exercises a tighter trial input limit.
2. A 20,971 ms signed fixture with trial/agent elapsed limits changed to 1 ms still
   scored PASS. The verifier now bounds trial deadlines by creation plus duration,
   bounds agent deadlines by first reservation plus duration and trial deadline,
   and requires monotonic event timestamps. A one-millisecond allowance covers
   PostgreSQL-to-JavaScript timestamp truncation only. Operator export time is
   not an execution deadline. Zero-priced fixtures remain valid.
3. In real disposable PostgreSQL, an expired oldest report returned learned:0
   ahead of fresh eligible reports. The scheduler now selects only reports with
   a current, fresh, cited primitive quotation before taking its one-report lock.
   Existing evidence rechecks and learning SQL guards still decide promotion.
   A regression includes expired and revoked older reports, two fresh reports,
   idempotence and restored evidence becoming eligible again. No permanent skip
   state, new migration, policy weakening or background scheduler is introduced.

Signed-negative cases assume a defective/malicious trusted signer, as the existing
review tests do; this is not a forged signature or demonstrated runtime overspend.

## Validation and evidence

New accounting/duration regressions were run against the unfixed verifier and
incorrectly accepted ten malformed variants. After correction, all 21 hostile
trace checks pass. The retained original commercial capture still passes; its
underreservation/duration mutations are now rejected. Learning fairness failed
with 0 != 1 before the eligibility correction and passed afterward on isolated PG.
Before/after logs are retained outside the repository under the task's evidence
directory. The baseline evidence bundle remains unchanged.

`npm run verify:full` now requires **54 stages**, adding learning fairness to the
previous 53. A successful final report must identify the exact committed SHA;
this document does not predeclare that run's result. The full runner uses only
synthetic fixtures, disposable local databases and existing pinned images.
No paid/provider invocation or hosted workflow is part of local acceptance.

## Gates and review identity

The owner selected AI technical review for this task. An additional human reviewer
is not asserted as an externally proven merge requirement. Existing protocol
records that explicitly describe human-only live quality assessment are unchanged;
this AI review does not impersonate or satisfy those records. The executable live
interlock remains disabled, and signature/tenant/authority checks are preserved.

Exact-head hosted CI cause/disposition and effective repository rules remain
unresolved through available permitted evidence. The elapsed Render window used
`af4be2e50215d5646a221fb82068bf939df0f311`, not this candidate, and lacked a final
endurance PASS with complete MCP continuity. No merge/deployment or live activation
is authorized by these fixes or by a local pass. PR46/47 are unchanged.
