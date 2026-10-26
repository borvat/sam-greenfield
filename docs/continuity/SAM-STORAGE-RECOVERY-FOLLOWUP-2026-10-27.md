# Storage recovery follow-up — 2026-10-27

The owner explicitly approved disabling both Hermes probe flags on the isolated
SAM test service and a normal deployment/restart verification. This approval
is retained; it does not authorize a renewed storage window or paid execution.

At resumption the previously bounded storage window had already expired.
No extension, database mutation, runtime deployment, model call or Modal guest
was initiated. The last successful storage admission and historical-record
reconciliation remain valid historical evidence, not current readiness or
restart durability proof.

Fresh Render reads confirm the unchanged baseline commit is still the latest
live deployment, auto-deploy is off, and the Docker Command setting is empty.
The existing live container is the previously documented maintenance runtime.
Neither probe flag has been changed. No suspension has been performed in this
follow-up. The browser session requires Render sign-in; the available connector
cannot save settings without deployment or suspend the service.

Next: restore authorized dashboard access; save both approved probe flags as
zero without deployment and suspend the maintenance test service. Do not deploy
against the expired storage window. Prepare all remaining offline execution
gates before requesting one bounded storage verification window. Real-task live
isolation, controller cleanup, bounded publisher writes, independent verification
and post-restart durability remain unproven. Financial approval for a new paid
Modal run is still absent. No new resource or paid run was created here; existing
Render service/database charges have not been reconciled to a billing total.
