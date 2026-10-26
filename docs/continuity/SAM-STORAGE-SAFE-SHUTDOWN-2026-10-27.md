# Storage recovery safe shutdown — 2026-10-27

After the owner's explicit approval and dashboard sign-in, both Hermes probe
flags were saved as zero using Save only on the isolated SAM test service.
An independent UI readback confirmed both zero values. The first native field
edit did not persist; this was detected before any deployment and corrected
through the form's input handler, followed by successful readback.

The test service was then suspended. A fresh Render connector read confirmed
suspended=user, auto-deploy off, the original empty Docker Command setting,
and no new deployment. The latest deployment remains the previously recorded
unchanged baseline; its historical Live label does not mean the suspended
application is ready.

The storage window had already expired and was not renewed. No PostgreSQL
password, data or privileges changed in this follow-up. No model call, Modal
guest, image build, real UI patch or publisher write was started. Existing
Hermes and database resources were not modified. Billing totals for existing
resources have not been reconciled; no new paid execution was initiated.

Normal runtime readiness and restart continuity are still unproven in this
follow-up. Finish remaining offline gate preparation first; then request one
bounded storage verification window, distinct from any future paid Modal
approval. Keep the real UI source and independent acceptance test unchanged.
