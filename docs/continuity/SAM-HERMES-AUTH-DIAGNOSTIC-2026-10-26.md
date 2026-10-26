# SAM × Hermes — authentication diagnostic result — 2026-10-26

The owner explicitly approved the isolated SAM test branch and Docker Command
change. The diagnostic deployment completed from a baseline with the same source
tree as the previously deployed version. All 20 local authentication/launcher
tests and the bootstrap syntax check passed.

Live result: FAIL, SAM_AUTH_MODAL_CREDENTIAL_FORMAT_DENIED.
At least one saved Modal credential value failed the expected format before any
Modal API request. The diagnostic stopped; GitHub authentication was not attempted
because checks run sequentially. Do not claim either new credential has passed.
No credential contents were viewed or logged. The diagnostic health endpoint
returned 200 with applicationReady:false; SAM readiness remained 503.

Modal inventory showed zero functions and zero sandboxes. No new Modal compute,
image build, guest, model call, UI candidate, repository publication, or database
permission change occurred. The approved USD1 round remains unused; actual
existing-host invoice delta is not established. Real Hermes repair, independent
live verification, repair Draft PR, and restart durability proof remain pending.

Cleanup: the vault was unlinked and the configured Docker Command restored to
its original empty value. Safe baseline retained; automatic deployment remains
off. The restoration deployment FAILED with the pre-existing
SAM_TEST_STORAGE_START_FAILED startup guard. Render retained/restarted the
last healthy diagnostic deployment; a second sanitized format-denial receipt
was observed. No real task or guest was duplicated. Therefore settings are
restored, but a healthy original SAM runtime is NOT restored, and the running
diagnostic deployment is not yet stopped.

Automatic approval review rejected clicking Suspend Web Service, stating that
stopping this external test service lacked explicit approval and was considered
unnecessary after settings cleanup. No suspension was executed. Do not bypass
that rejection via an API or shell. Request explicit owner confirmation to
suspend the test service. This is separate from owner credential entry.

Owner must correct
the existing Modal token ID and token secret values in the vault privately,
without posting either value in chat or creating duplicate variable names.

Public checkpoint publication was reduced to this status-only file after
automatic review rejected operational details and the bootstrap payload.
