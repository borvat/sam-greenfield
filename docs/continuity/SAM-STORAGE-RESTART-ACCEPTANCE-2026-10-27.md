# SAM storage recovery and restart acceptance — 2026-10-27

## Result

Storage startup and preservation after one explicit container replacement passed
on the existing isolated test service. This is a storage-only acceptance, not a
Hermes coding or live Modal isolation acceptance.

The prior startup failure came from the expired bounded database-role validity.
The owner authenticated privately. Only the newly approved bounded validity
window was renewed, with the existing password, privileges and data retained.
The read-back expiry was 2026-10-26T23:09:02.511Z and was not extended again.
Both Hermes probe flags were saved as zero before normal startup.

## Actual evidence

- Independent restricted-role baseline: 9 goals, 5 plans, 3 executions,
  3 verifications, 5 work-queue records, no pending execution work, model_calls=0.
- Normal deploy dep-dbfsvlu7bikc73b3qirg, source
  d731a6ed47986c4a8d7ff03557c0985190068d98, first instance ending 8p2t5.
  Original role/profile admission and all six persistent API checks passed.
- Public readiness returned 200 with component statuses [200,200,200].
  Unauthenticated goals API returned 401.
- Explicit Restart service produced replacement instance ending g2cwr.
  Original role/profile admission and all six persistent API checks passed again.
  Public readiness and unauthenticated-denial checks passed again.
- Full-record hashes of goals/plans/executions/verifications matched the
  pre-start baseline after both boots. No duplicate execution or model record.
- First boot relayed 23 existing outbox messages. Event/inbox row counts moved
  from 22 to 45; outbox remained 45. Replacement boot relayed zero messages.
  All 37 restricted-readable table counts matched first boot after replacement.
  Queue remained 3 EXECUTED + 2 FAILED, with zero pending work. Expiry unchanged.
- Seven synthetic operator tests passed. Five baked build-suite receipts were
  validated from cached image evidence; they were not freshly rerun this round.

## End state and limits

SAM test service was suspended after verification; a fresh Render read confirmed
suspended=user, auto-deploy off and Docker Command empty. Hermes existing service
was unchanged and remains running. PostgreSQL was retained, not reinitialized.
No new resource, Modal guest, image build or model call was initiated. No new
Modal/model execution cost; existing Render charges are not yet invoice-reconciled.
The last observed Modal inventory was empty before this round; no claim is made
that a fresh Modal inventory was read during this storage-only acceptance.

PR 67 infrastructure changes were not deployed: the test used the frozen existing
source with the same tree as the earlier deployed version. Production, main,
GitHub Actions, GitHub connection scope and database grants were unchanged.

The real UI source and independent verifier remain unchanged. Real Node image
acceptance, controller-death reconciliation and a registered bounded trusted
publisher still need completion. No Hermes repair or real-repair Draft PR exists.
Next: complete offline execution-gate preparation; request a new explicit bounded
financial approval only when its comprehensive cap and live plan are reviewable.
Do not reuse this storage window as an execution campaign or renew it silently.
