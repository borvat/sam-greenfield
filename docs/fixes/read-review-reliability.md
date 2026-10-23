# Read-report review reliability

Base: deployed `26c50497fd9cbe37b3abfe44753d281b00a07605`.

The observed read goal planned and verified its sources, then timed out in review.
The prior review Promise.race did not cancel the gateway/provider request. JSON
prefix slicing also removed structured totals/coverage/limitations after large
arrays. Evidence loss is established; it does not prove the timeout's cause.

## Cancellation and budgets

The review AbortSignal reaches ModelGateway and the OpenAI-compatible HTTP
transport. Each call retains its 40-second ceiling. A review attempt has at most
80 seconds for proposal plus independent critique, and a plan has at most two
attempts / four calls. Per-call spend ceilings are unchanged. These are active
model-work limits, not end-to-end guarantees for database/scheduler availability.
No model is changed and no provider or research feature is activated.

Review attempt/call reservations are stored before invocation in the existing
unique goal/plan review row. Runtime metadata cannot come from the model. Safe
outbox phase events contain goal linkage, phase, attempt/call numbers, elapsed
milliseconds and runtime error codes, never provider bodies or source text.
An unfinished reservation is visibly blocked/in-progress, never a completed
report. Reports and follow-up work still commit atomically; budget reservations
survive a failed transaction or process restart.

A failed first attempt schedules the remaining attempt after 30 seconds. Wakeup
returns to VERIFYING, reloads verified executions and does not create source
work. Generic external-event wakes cannot route an existing waiting review back
to MODELING. Failed validation feedback is carried as a safe code. No third
attempt is allowed. Cancellation suppresses retry.

## Evidence and completion

The deterministic projection keeps object metadata and essential totals, period,
coverage, includedOrders, orderItems, candidates and limitations before fitting
whole detail-array items into the existing source budget. Omitted items have
explicit counts and an original-content hash. No business aggregate is computed
from samples. All structured limitations are retained, including nested ones.
Oversized essential metadata or unstructured content blocks review honestly
instead of silently dropping content. The second source-envelope truncation no
longer cuts the projected review lines. Quotations still copy exact selected
lines, and independent critique remains required for completion.

For requested sales EUR/VAT/revenue reporting, runtime completion additionally
requires explicit verified structured sales amount, EUR currency, recognized VAT
basis, complete coverage and the requested ISO date period together. Invoice
capabilities never establish daily sales revenue. Missing or unrecognized facts
remain limitations/unfulfilled requirements; no amount, VAT treatment or period
is guessed. Other report types retain their existing validation and critique.
This conservative check may block valid evidence in an unsupported structure;
that requires a reviewed projection/contract extension, not a fabricated value.

## Supported continuation and authorization boundary

`sam_continue_review` is an owner action using the existing authenticated action
surface. It requires goal ID and matching legal entity, the existing
`sam.read_report.v1` contract, WAITING_EXTERNAL, verified current-plan executions,
completed source work and a recorded retryable budget remainder. It neither
changes permissions nor resets attempts nor creates a new goal or execution.
Database tenant isolation remains in force. Other contracts fail with
GOAL_CONTRACT_REQUIRED; prior direct-read denial is not bypassed.

Legacy blocked reviews have already used the old in-call attempts and have no
recorded remaining budget. They fail with
`REVIEW_BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION`. This includes the reported
live legacy goal: this PR does not authorize or implement an unbounded budget
reset. Resuming it requires a separately authorized, reviewed bounded review
allowance. The coding work does not access or mutate that goal.

## Validation

`tests/core/reviewReliability.ts` covers HTTP abort/connection closure, durable
bounded continuation, no duplicate source work, owner/entity/contract gates,
exhaustion, cancellation, large structured evidence, period-mismatched invoices,
missing monetary facts and honest blocked reports. Existing Google review tests
retain atomic follow-up/report assertions and additionally check the durable
in-progress reservation. Full acceptance uses the previously documented isolated
TCP-query PostgreSQL readiness harness; no application tests are skipped.
