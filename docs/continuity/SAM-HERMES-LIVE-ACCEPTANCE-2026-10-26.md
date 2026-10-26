# SAM × Hermes live acceptance checkpoint

## Approved non-secret window implementation (prepared, not yet deployed)

The operator approved separating window timestamps from the protected credential file.
SAM_HERMES_PROBE_ACTIVATED_AT and SAM_HERMES_PROBE_EXPIRES_AT now supply an explicit
paired operator window in the isolated composition. Credentials and every non-timing
policy remain read by the application from the existing secret file; that file is unchanged
and was not opened in the editor. An absent pair retains legacy validation; a partial,
invalid, future, reversed, expired or over-hour window is rejected. The fixed deadline
does not advance on restart. Each dispatch policy check also refuses a window beyond
the current restricted PostgreSQL role deadline. Only these two environment names are
passed through the existing isolated launcher to the runtime.

Local validation: TypeScript PASS; 139 isolated tests PASS, zero failures/skips,
including six new window guard regressions and the existing HTTP-stub transport tests.
These tests are not fresh hosted live inference evidence. No runtime/secret/role mutation
or new model call has occurred at this preparation checkpoint. Current deployed source
is still 47ec9df. No competing execution is authorized; recheck live work before renewal.

Next: publish this change on the existing PR #66 branch; verify native tool-free policy
and idle queues; set the fixed non-secret timestamps; renew the existing role ONCE with
unchanged password/grants/networking; explicitly deploy this reviewed source on SAM test;
run one arithmetic goal, inspect native served identity and independent verification,
snapshot identifiers/content, restart only after idle, and compare the saved result/receipt.
The authorized new 60-minute window has not started. Do not automatically renew it.

Status: BLOCKED before the new authorized window. The single authorized 60-minute window has NOT started or been renewed. No new inference task, application deployment, restart or database write occurred during this follow-up. Deployed application source remains 47ec9df; previous evidence commit is 1867c71. Continue in PR #66 without a new branch or PR.

Earlier direct read-only evidence substantiates a successful real arithmetic task: the native durable receipt confirms the approved free served model and its model lock, and the stored SAM verification records independent PostgreSQL arithmetic verification. The original result and receipt remain stored after subsequent deployments. A report-review record was not found for that goal. This preserved evidence does not replace the newly requested live trial or controlled restart comparison.

Earlier preflight found no pending deployment or active work in the inspected queues, and confirmed the restricted database role expired. These observations must be refreshed immediately before any future renewal. The effective tool/model policy was checked, but coding isolation remains unproven and programming tools must remain prohibited. The deployed model-lock fix was not changed.

## Latest authorization and blocker

The user explicitly approved editing ONLY activatedAt and expiresAt in the existing protected probe configuration, preserving every secret and other field. Approval is conditional on the editor mechanism not exposing file contents to the model or tool outputs. No additional authorization for plaintext disclosure was given or requested.

A proposed editor interaction would open View secret file and return only editor-element metadata, with no field values or file contents in the requested output. Automatic approval review rejected the action because opening that view accesses plaintext contents even if subsequent output is filtered. The action was not bypassed or retried through another secret-reading path. The editor was cancelled without saving.

Capability discovery confirms the available Render connector can merge environment variables but does not offer a structured field-level update for secret-file JSON. No supported current path was found that can update only those two fields while satisfying the user's no-content-exposure condition. Repeating the same approval request is not an unblocker; the user's conditional approval is already recorded.

## Next step and no-repeat rules

Establish a supported secure field-only editing mechanism, or obtain separately scoped authorization for a reviewed design that keeps non-secret window timing outside the credential-bearing file. Do not invent an unsupported secret-file API, bypass the review rejection, or broaden the user's authorization to plaintext disclosure. No runtime code/configuration redesign was performed in this follow-up.

After a safe mechanism exists, finish all preparation, recheck live work and the restricted role, renew the deadline ONCE for at most 60 minutes with unchanged grants/password/network/tenant scope, and apply only the authorized timing change. Then run one new bounded arithmetic task through SAM with native served-model evidence and independent verification. Save goal/execution/verification/receipt identifiers and content before a controlled SAM-only restart; with zero active work, restart and compare the after snapshot plus readiness. Any necessary configuration rollout must explicitly select reviewed source rather than the configured branch's latest source.

Do not repeat the model-lock patch or historical failed tasks. No automatic renewal, coding tools, new paid resources, production changes, main push, merge, other connector changes or schedule changes. On resumption, inspect this checkpoint and actual state before any renewal or submission.

Additional paid resources, paid inference requests and deployments introduced by this follow-up: zero. Existing charges continue and invoices were not audited. Current healthy SAM and the new final live/restart acceptance are not claimed.
