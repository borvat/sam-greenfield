# One later SAM–Hermes timing measurement — REVIEW ONLY

No deployment, activation, goal, bol collection or model invocation is performed
by this package. It accompanies ONE later independently authorized business
request; monitoring must not create a second request. Base: `910abe8`.

## Exact native reference

Read-only Render Shell established the actual installed request path. The
existing `install-stamp.json` reports Hermes **0.22.5**, source `ci`, commit
`bf0203a794a07aac3ff764972ab9087baa4e4f4e`. `pyproject.toml` says `0.0.0`;
that placeholder is not the release identity. Image:

`docker.io/nousresearch/hermes-agent@sha256:fd822bae0a61bf023450737edbeaeea5fc6460f17cb4ee240a7e67b306ed63fb`

Installed OpenAI SDK: 2.24.0; httpx: 0.28.1. The TWO affected upstream files at
that commit match the installed files byte for byte (SHA-256 in
`measurement-pin.json`). The separately customized native API module does NOT
match upstream; it is deliberately neither copied nor patched. Its observed
installed hash remains
`2bcbb030cba03530e7e8f9e3bf34600691ba64a175d0fddc656bb80432537d66`.

Actual native sites, ORIGINAL line numbers in `agent/chat_completion_helpers.py`:

| Site | Observation |
| --- | --- |
| `_open_chat_stream`, 2947–2959 | Immediately around existing `request_client.chat.completions.create(**stream_kwargs)` |
| `_chat_stream_created`, 2961–2969 | Existing callback receives `raw_stream.response`, before subsequent captures |
| `_count_chunk`, 2858–2867 | Existing consumed decoded chunk; no extra read, next, peek or wrapper |
| `_mark_finish_seen`, 2893–2896 | Existing first finish-reason flag |
| `_close_managed_stream`, 2769–2775 | Existing owner close, or close failure |
| `_abort_for_interrupt`, 3854–3878 | Monitor observes interrupt; not the time the HTTP /stop arrived |
| `_new_diag`, 2853–2856 | Clear measurement owner context for the next call, including unmeasured calls |

The unchanged native API passes the selected session into agent creation.
SAM uses the existing `sam_<task_id>` session lock and logs the acknowledged
`run_id`; join provider rows by exact session/task and SAM ack/resume rows.
Native provider rows do not independently know `goal_id` or `run_id`; the join
must be established from those SAM records, never inferred by wall time alone.
If a session were retargeted, require the native run's actual session mapping;
do not silently join a different session. No new correlation field is sent to
the model, HTTP body or idempotency fingerprint.

## Meaning and limits

Off by default. The sole optional flag, `SAM_HERMES_MEASUREMENT_ENABLED=1`,
enables metadata logging on the existing runtime client and native SAM session
path; it does NOT open acceptance. Use it only with the existing single-task
window and no other active SAM–Hermes task. `sam-mcp` needs no measurement flag.

SAM events: send/accepted/poll/resumed/terminal and stop requested/acknowledged/
uncertain. Include task, goal, session, task hash, run when known, original
created-at/deadline, UTC, process/operation identity and monotonic elapsed ms.
Native events: request started, headers, first nonempty decoded text delta,
finish, open failure, cancel observed, stream closed/close failed. Native IDs
are session/task plus process/operation. Only HTTP status and allowlisted
finish/close/error categories are recorded. No prompts, output, body sizes,
customer data, URL, arbitrary headers, provider exception text or credentials.
Existing legacy diagnostics are unchanged; this does not claim to redact them.

Request start is the SDK operation boundary immediately before `create`, not
packet transmission or an independently observed provider admission. SDK
internal retries, if any, remain inside it; no retry policy is changed.
Headers is when the existing callback observes the returned response, not a
packet-level timestamp. Empty role/usage/heartbeat frames do not count as a
first delta. Finish/close/cancel are observations at the named native sites;
stop acknowledgement alone does not prove remote termination or zero billing.
Missing records remain unknown (including logger failure/process loss).
Cross-host UTC differences are not causal proof: use local elapsed intervals.

The original task deadline is still **created_at + 120000 ms**, including
queue/source/admission time, and is unchanged on resume. Observation failures
are swallowed; no added transport, model call, stream consumer, fallback,
request-body field, acceptance criterion or tool is introduced. Thread-local
metadata keeps late old responses attached to their original operation; the
interrupt monitor reads only the current attempt pointer.

## Local reproduction

The deliverable includes exact `native-baseline/agent/{chat_completion_helpers,
stream_diag}.py` plus the upstream MIT license. From this repository:

```sh
python scripts/hermes-measurement/prepare.py --source /ABS/native-baseline --output /ABS/native-patched
HERMES_MEASUREMENT_SOURCE=/ABS/native-baseline python tests/isolated/hermes_measurement.py
node --import tsx --test tests/isolated/hermes_measurement.ts tests/isolated/hermes_deadline.ts
npm run typecheck
```

`prepare.py` only reads its source and emits a separate copy after BOTH exact
preimage hashes pass. It never imports Hermes, installs dependencies, calls a
model, writes the native input tree or launches a service. The emitted diff
must equal the committed `hermes-provider-measurement.patch`. These are source/
method and synthetic transport tests, not an installed-SDK or live acceptance.

## Future deployment — steps for separate review/authorization

1. Recheck current code/owners, both SAM deployments, native image/stamp/two
   preimage hashes and custom model-lock/launcher; abort on any mismatch. Keep
   automatic deployment off, admission closed and other branches untouched.
   Record the ACTUAL prechange deployment IDs/settings, not an old rollback SHA.
2. Build the exact reviewed SAM commit through the existing documented route
   for `sam-runtime` (and `sam-mcp` only if the operational route requires both
   on the same commit). Preserve dispatch-only/execute modes, stored Hermes
   config/contract and all model locks. No DDL/key/grant/image build/new service.
3. Prepare the two native files OFFLINE using the pinned snapshot. After
   authorization, back up only their current bytes and the current launcher.
   On `hermes-isolated-test` (`srv-dbf5q8u7bikc73c9pffg`), have the EXISTING
   `/opt/data/sam-hermes-start.sh` startup route install ONLY these two checked
   files before starting Hermes, preserving its model-lock step. Do not execute
   an old launcher over a running agent or replace an upstream/custom tree.
   Verify both emitted postimage hashes and that module imports compile; the
   complete launcher edit/start command must be reviewed against its then-current
   contents. This batch does not pre-authorize that service write/restart.
4. Enable the diagnostic flag only on runtime and Hermes for the ONE separately
   approved request, within the original window/deadline/tools/free-model/
   single-task gates. Verify no prior active execution. Use existing logs and
   run status/events, capture matching IDs and terminal evidence while retained.
   No observation model call and no replay of the cancelled historical run.
5. On success/failure close admission and remove the diagnostic flag. Preserve
   source, acceptance, goal/run/receipt evidence and metadata; no auto-resubmit.
   If the task remains active, use the existing fence + exact-run stop procedure
   from continuity, and retain uncertainty until terminal status is established.

Rollback: close admission first; fence any later trial goal before restoring
code. Remove the diagnostic flag from runtime/Hermes, restore the TWO backed-up
native files and original launcher through the same controlled restart route,
then restore the exact recorded prior SAM deployments/settings if needed.
Verify original hashes, original model lock and closed admission; auto-deploy
stays off. Never delete records, roll back the preserved source/contract, touch
PR83/frozen coding/PR85 files, or change the provider, timeout or retry policy.

Historical provider cause stays UNKNOWN. Invoice proof and inaccessible old
operator/provider redaction limitations remain unresolved and unchanged.
