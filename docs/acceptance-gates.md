# Production acceptance gates

A COMPLETED goal is not sufficient evidence of satisfying an objective. Evaluate
the plan, actual executions, independent verifications, source coverage and
handoff agent identities. Keep failures in the denominator; do not restart the
count to hide a failed reliability attempt.

1. Run ten sequential, diverse, bounded read-only goals. Submit the next only
   after the preceding goal stops. Record every goal/plan/execution/verification
   identifier, objective, selected tools, failure reason, and side-effect flag.
   A pass requires required tools to execute within the requested scope and all
   executions to have independent VERIFIED evidence. A timeout is unresolved,
   never success. Ten attempts are distinct from ten successful attempts.
2. Require at least two specialist identities in real handoffs, source results
   for each, independent verification, and executable synthesis of their
   outputs. Routing two reads and putting them under one goal proves delegation,
   not a combined decision or report. Prose dependencies are not executable.
3. In isolation, disconnect an HTTP source, throw a tool error, and return an
   empty model plan. Verify failure evidence, stopped sibling work, no false
   completion, and successful subsequent healthy goals. These are controlled
   fixtures, not a production outage drill or proof of native PostgreSQL
   concurrency behavior.

Tests: `tests/phase22/planner_scope.ts` covers single-read and multi-tool scope;
`tests/phase22/acceptance_recovery.ts` exercises real runtime composition, a
deterministic model fixture, local HTTP source/readback and an isolated database.
Existing runtime recovery tests cover fencing, expired leases and stale plans.

The scope fix removes an arbitrary two-read commerce template: explicit
read-only capability requests remain available together, and a single bounded
read need not include unrelated inventory/orders. No authority class, approval,
provider-write adapter, schema, or production setting is changed. Existing
YELLOW/RED capabilities continue to require explicit approvals; passing these
tests does not automatically grant approvals.

Live evidence belongs in the private acceptance report/SAM audit, not this
public repository. Synthetic tests are labeled accordingly. If any gate remains
unproven, overall production readiness remains unproven.
