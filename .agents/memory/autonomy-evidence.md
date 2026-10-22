---
name: Autonomy evidence
description: Acceptance boundaries for SAM autonomy and synthetic live-model authorization.
---

Fault scenarios should use independent authorized sandboxes rather than raising
intake limits solely to fit a larger test batch.

**Why:** Batching local scenarios exhausted the sandbox intake guard before
the fault being tested; increasing that guard would weaken the evidence.

**How to apply:** Preserve the ordinary guard and separate scenario fixtures.
Distinguish frozen-build LIVE acceptance from local fault-injection coverage.

Use ordinary authenticated goal intake and the same frozen implementation across novel goals. Do not replace acceptance with a case-specific workflow, preset plan, canned model answer, or health check.

**Why:** The owner requires Executive Agent evidence; prior successful native goal and Drive experiments proved useful components but used fixed objectives or owner-declared plans.

**How to apply:** Report Observe, Model, Plan, Delegate, Act, Verify, Replan, Learn and recovery separately. A later goal must actually consume independently verified knowledge with provenance. A rebuilt object is a unit recovery test, not proof of a real process restart. Restrict LIVE_PROVEN to the demonstrated scope.

Persist model-authorization consumption before network transmission and never reset it on worker restart or setup reruns.

**Why:** The owner authorizes bounded synthetic testing, not continuing access to company data or ordinary external model execution.

**How to apply:** Keep ordinary external inference fail-closed, isolate synthetic scope, distinguish unit model fixtures from charged provider calls, and close the approved session after acceptance.

Closed authorizations remain closed even if some calls were unused; a subsequent
test needs a separate owner decision and must retain the prior consumption.

**Why:** The owner explicitly requires a new authorization for a closed session,
not extending or resetting the previous allowance.

**How to apply:** Prepare any necessary session lifecycle repair before freezing
the acceptance build. Record deliberate fault injection and process stop/restart
as programmer interventions; prove recovery only for the state actually interrupted,
not all possible crashes or autonomous process restarting.
