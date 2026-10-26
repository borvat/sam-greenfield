# SAM storage startup verified — 2026-10-27

Root cause of the prior startup failure was the expired bounded PostgreSQL role
validity. The owner completed private authentication and opened the one newly
authorized 60-minute window. The receipt was independently read back. The
restricted role then provided a read-only baseline matching the earlier counts,
with historical records present and no pending execution work.

The original unchanged deployed source was restored with both Hermes probe
flags disabled. Normal application startup passed its original restricted-role,
fixed-tenant and storage-profile checks. All six persistent API smoke checks
passed. Public readiness returned 200 with all three component services at 200;
unauthenticated goals access returned 401. Baked five-suite build evidence was
validated from cache, not represented as five freshly executed suites here.

Independent readback after boot showed identical full-record hashes for goals,
plans, executions and verifications. No extra execution, model-call or work-queue
record appeared. The existing outbox relayed 23 previously unrelayed events;
event and inbox rows increased accordingly while core records stayed unchanged.
This expected relay is distinguished from duplicate task execution.

One explicit service restart/container replacement has been requested. The new
instance passed storage admission and six API smoke checks, with zero further
relayed events. Final independent post-restart reconciliation and safe suspension
remain pending; do not yet claim the full follow-up durability check complete.

No password rotation, privilege expansion, data deletion, database reinitialization,
Hermes task, paid model call or Modal guest was performed. Live real-task isolation
and bounded publisher-write gates remain outstanding. Production and main were
not modified. The normal test source is the existing frozen baseline commit,
not a deployment of all PR 67 infrastructure changes.
