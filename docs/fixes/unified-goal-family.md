# Unified goal-family lifecycle implementation checkpoint

This branch follows corrected wire/accounting checkpoint 1370842 and the consolidated
architecture contract on audit/general-agent-completion (5f0e5f4). It is disabled
internal code, not general-agent delivery or production activation.

Implemented together:

- Positive runtime service assembly uses the actual bootstrap, readiness gate,
  ordinary planner/executor/verifier/reviewer and stop/drain lifecycle with fixture
  transports. Startup and recovery refresh use the same enrolled goal family.
- Due-goal waking, lease recovery, finished-plan recovery, dependency reconciliation,
  outbox relay and event consumption accept explicit goal scopes. Evaluation passes
  enrolled goal IDs; absent scope preserves ordinary runtime behavior. Tests retain
  another same-company cancelled trial's due goal and its outbox/inbox events.
- The synthetic service's supervisor checks trial admission only and explicitly
  reports TRIAL_ONLY coverage; it does not reconcile tenant-wide incidents. Ordinary
  operational supervision is unchanged.
- Bootstrap validates existing integration RLS fences and SELECT/INSERT report access
  before work. It grants nothing. A provisioned-role negative test removes INSERT
  only in an isolated fixture and confirms admission fails before callbacks.
- Raw-only and derived report paths lock executions/receipts then goals through
  final receipt/replay checks and COMMIT. Knowledge being disabled does not weaken
  this gate. Tests cover inserted and updated revocations before/after locking.
- Source and readback reservations are stamped into runtime evidence, with queue/
  execution/fencing identities and result/evidence hashes. The model cannot supply
  these identities. Goal-family capture checks them against durable events and rows.
- A separate versioned goal-family capture seals actual child goal_read_reviews with
  coordinator NEW. Existing specialist capture stays intact. Export/authentication
  and scoring distinguish trace integrity from functionality and model quality.

Targeted tests pass: TypeScript checking, reviewReliability (raw race and prior
review guards), evidenceIntegration (derived/restricted-role paths), and the actual
service/budget/capture/permission suite. Final exact-head acceptance is still required.

Test infrastructure notes: the expanded budget lifecycle test's subprocess limit is
75 seconds (was 45); application model/tool/trial limits are unchanged. Expiry fixtures
use a 5-second agent window and wait until its recorded deadline instead of assuming
setup always fits in 1.5 seconds; this preserves expiry assertions and removes a load-
dependent pre-barrier failure. An attempted parallel local DB test collided on shared
pgcrypto extension installation/removal across temporary schemas; subsequent DB tests
run sequentially. Preserve these failures in evidence; do not count them as successes.

Remaining mandatory architecture work is explicit: durable objective obligations,
requested-scope receipts, normalized collection/union/chaining, typed safe recovery,
and one catalog exposing discovery/derive/delegation through the same builder.
Current default bounded bundle is still frozen reads; metadata is not monetary or
supplier-promise evidence. A valid blocked report is not nominal task completion.
No live autonomy claim, new grants, credentials, paid calls, merge or deployment.
