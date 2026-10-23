# Bounded production planning repair

Base: deployed `67f528d4da989740fc542b817c4f38402db635fe` on `deploy/sam-free-trial-ready`.

The observed goal failed without a persisted plan. Temporally adjacent accepted
provider calls do not establish goal attribution or the specific validation error.
This change does not claim that provider connectivity or a particular invalid
field caused the live failure.

Production now generates one candidate per durable planning reservation. A
validation rejection is saved as an allowlisted code in `goals.planning_failure`
and supplied as feedback on the next reservation. That repair receives a fresh
AbortSignal with the same deadline. Existing attempt exhaustion, backoff and
WAITING_OWNER restrictions still apply. A PLANNING goal with a persisted replan
episode resumes the replan path: failed-read exclusions, safe recovery capabilities
and prior-plan context are reloaded without incrementing the replan budget again. No rejected model text is persisted or
replayed. Non-production direct callers retain their existing in-call repair.

The default budget remains three 30-second reservations: at most three candidate
calls and 90 seconds of active deadline time per planning episode, with existing
scheduler/backoff waits and database transactions outside that active-time bound.
This is not a 90-second end-to-end wall-clock guarantee. Previously up to six
candidate calls shared those three deadlines. The per-candidate cost ceiling
remains half of `planningMaxCostUsd` (default $0.125). This fix does not expand
provider, cost, authorization, tenant, integration or execution permissions.

`PLANNING_PHASE` outbox events use the goal as aggregate ID and retain only phase,
reservation/candidate attempt numbers, elapsed milliseconds, deadline, attempt
limit and an optional allowlisted validation code. Failed-attempt metadata also
records the last phase and safe validation code. Events survive success clearing
the goal's current failure summary. No model text, objective, context, parameter
values, provider error bodies or secrets are added to these diagnostics. Unknown
validation errors become `PLAN_CONTRACT_INVALID`; diagnosis may still require a
subsequent reviewed code change. No schema migration is required.

The candidate prompt defines the expected object, available-capability/parameter
contract, dependency format and duplicate restrictions. All existing validation
and authority checks still run before atomic plan/delegation persistence. Late
responses and cancellation cannot create a plan through this path.

`tests/core/planningRepair.ts` exercises slow responses, durable repair, bounded
exhaustion, diagnostic sanitization, cancellation, late responses and concurrent
reservation exclusion on disposable local PostgreSQL. It is included in the
core reliability and full acceptance runners. Synthetic evidence is not live
task success; deployment and the live sales retest remain separate release gates.
