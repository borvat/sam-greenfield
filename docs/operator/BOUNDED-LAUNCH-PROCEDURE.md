# Supported bounded-trial launcher

This adds orchestration to the reviewed disabled candidate. It does not activate a live release, provision production, supply administrative credentials, establish owner trust or make a paid call. The prior consolidated setup proposal still defines the separate security/financial decision. The launcher removes the need to manually coordinate individual create/sign/deliver/restart steps once authorized operator bindings exist.

## Commands

An authorized operator supplies a trusted local module exporting `createLaunchBindings(request)`, returning `{admin, signer, close?}` as defined in `apps/agents/src/evaluation/operatorLaunch.ts`. This module is administrative code selected by the operator, never a model-generated path or an agent capability. There is no default connection, signer, cloud transport, role creation or ambient owner authority.

```sh
node --import tsx scripts/evaluation/launch.ts live REQUEST.json OPERATOR_MODULE.ts NEW_JOURNAL_DIRECTORY
node --import tsx scripts/evaluation/launch.ts recover REQUEST.json OPERATOR_MODULE.ts EXISTING_JOURNAL_DIRECTORY
```

`live` currently refuses before importing the administrative module because LIVE_EVALUATION_ENABLED remains false. A separately reviewed activation release and scoped owner authorization are still required. `recover` never creates a trial, signs, delivers or restarts evaluation; it reconciles the original root, cancels/captures any original trial and restores the original service snapshot. Recovery remains available after release interlock rollback.

A request is `{version:1,rootGoalId,spec}` with the existing fully validated TrialSpec and exactly 300000 elapsedMs. Use the approved fixed commit, corpus, company, three enrolled child IDs, capabilities, prices and budgets. The request is copied/frozen and bound by SHA256 in every journal event. Changed requests or repeated launches on a used journal are refused; use recovery, never a second creation to compensate for an uncertain outcome. The database's unique root_goal_id is an additional duplicate-trial constraint.

## Operator interfaces and responsibilities

The administrative executor must be explicitly authorized for the exact existing service, database/schema, root and synthetic principal. Its `mode` must match fixture/live. It must implement:

- `preflight`: verify that authority, profiles, fixed version, approved budget, signer/file delivery prerequisites and exact existing-service target are available. No fallback to runtime credentials or a different tenant.
- `snapshot`: return a durable opaque restoration reference (not credentials/config contents). Snapshot the existing service's release, connection, flags, price overrides and approval-file access outside the public journal.
- `pause`: drain and pause that service, rejecting unresolved live leases/overlap. Record snapshot before requesting pause.
- `create`: call the existing createEvaluationTrial once; return the actual database ID, root/company/spec hash, createdAt/deadline/observedAt and cancelled/sealed flags. `lookup` must return authoritative database time/current flags for that same root, including after a lost create response. No local guessed trial ID/deadline and no deadline update.
- `deliver`: atomically deliver only the verified signed payload and public key to the approved paths and set the exact trial/release configuration. No private signing key enters runtime. Do not silently grant permissions or broaden model/tool selection.
- `restart`: request the existing-service restart, wait for readiness pinned to the trial and commit, and propagate AbortSignal. This is not a deploy-to-another-service interface.
- `observe`: report complete/blocked only from the existing verified report/capture route with matching trial ID and commit; do not infer goal success from health alone. Runtime budgets and acceptance gates still decide task completion.
- `quiesce`: cancel/reconcile in-flight delivery/restart operations and confirm evaluation cannot still dispatch. This is mandatory after timeout/crash; a rejected promise is not evidence that a remote action did not happen. If authoritative quiescence cannot be established, fail and leave restoration pending rather than racing restoration with a late restart.
- `cancelAndCapture`: retain charged/uncertain reservations and export complete/incomplete evidence for the original trial. Runtime cannot acquire this operator authority. No budget refund/reset or audit deletion.
- `restore` and `verifyRestored`: restore and independently verify the exact prior release/config/connection, remove trial approval access/overrides, reconcile ordinary service health and leases. Do not replay old blocked goals or modify unrelated services. Preserve the trial ledger according to the approved retention policy.

Every external method receives AbortSignal. The executor must honor it and provide reliable quiescence across process restarts; unknown outcomes are pending, not silently retried. Cleanup has separate bounded operation windows so it can stop/restore after trial expiry; these windows do not authorize further trial/model work. If cleanup fails, the journal/result explicitly says RESTORATION_PENDING and recovery can be retried after that exact issue is corrected.

The signer implements `{authority:'owner-attested',publicKey,sign(payload,signal)}` for live use. The authority label alone does not establish trust: the operator must separately attest custody and public-key provenance. The launcher checks Ed25519 and the signature over the exact payload before delivery; runtime independently checks the live owner payload/permit again. It does not accept a substituted payload, fixture signature, OAuth token or Render-login assertion as an owner signature. No new private key or credential is generated by launcher/library/CLI code.

## Clock and durable recovery

Trial creation now selects one database timestamp for both created_at and deadline; the deadline is exactly insertion timestamp plus the existing elapsedMs. No migration or deadline update is introduced. The launcher requires five minutes and uses database time plus a conservative monotonic local bound anchored before the create call. Network delay cannot reset the clock. Signing, delivery, restart and observation each recheck the original trial/deadline; a final receipt check prevents late success reporting. Cancellation/sealing stops the sequence.

Events are fsynced before consequential operations. Files are private; the journal records only phase, request hash, timestamps, opaque snapshot reference, trial identifiers/timings and sanitized error codes—not keys, signed payloads or secret config. A Linux kernel flock on one persistent lock inode prevents concurrent operators. The parent and a short-lived Node keeper retain the same locked file description; keeper loss cannot release it before the parent observes lease loss. Parent death closes its stdin so the keeper exits and releases the last descriptor. Normal close drains pending journal operations before releasing ownership. Neither acquisition nor close unlinks/replaces the lock file, and PID metadata is diagnostic only. Unexpected keeper loss aborts the journal lease and active callbacks; the former owner cannot continue journaling or restore over a new owner. A newly exclusive recovery reconciles the old operation. /usr/bin/flock (util-linux) and a local filesystem with flock semantics are required; missing support fails closed. Network filesystems are not supported by this procedure. Use the same durable journal directory and unchanged request. Never unlink the persistent lock inode to force execution or discard a partial journal after a crash.

A single failure stops forward progress. Creation response loss is reconciled by root lookup. No launch retry creates another trial. Recovering a SIGKILL after service restart must stop the already-running evaluation process before restoring ordinary service. If a storage/remote failure prevents trustworthy reconciliation, preserve evidence and use the separately authorized operator to resolve it; this is an explicit uncertain state, not an automatic success.

## Local rehearsal and its limits

```sh
SAM_CORE_TEST_DATABASE_URL=postgresql://LOCAL_DISPOSABLE_TARGET \
  node scripts/testing/core-reliability.cjs --suite tests/evaluation/operatorLaunch.ts
```

The harness accepts only localhost sam_core_test databases and uses isolated schemas. `tests/evaluation/launchFixture.ts` is a **fixture-only** operator binding, never a production module. Ephemeral fixture keys/passwords are created and deleted only inside that rehearsal. Signed payload kind is SAM_FIXTURE_LAUNCH_REHEARSAL, distinct from SAM_LIVE_EVALUATION_APPROVAL; tests prove it is rejected by live authorization. Fixture material must never be registered as an owner trust root.

Rehearsal uses actual PostgreSQL trial creation, actual restricted LOGIN admission, atomically delivered local files, real runtime-service child processes and verified local restoration. Tests cover nominal orchestration, signer/signature/delivery/restart/observation failures, unknown create outcome, expired database observation, cancellation, database cancellation, restoration/quiescence failure, concurrent journal refusal, changed-request refusal, repeated-launch refusal, and real SIGKILL both after insertion and after restart. Recovery reconciles the orphaned local process by its persisted identity and never creates another trial.

Fixture restoration uses a constant synthetic snapshot reference and starts a new ordinary heartbeat process. Delivered approval files remain in the private fixture directory until teardown. Thus these tests do not prove restoration of actual release/configuration/credentials, production approval-file revocation, or Render timing. Actual operator-binding acceptance must separately verify all of those properties before activation.

The fixture service is a readiness/heartbeat composition with **no model or business-tool work**; nominal outcome is deliberately blocked, not a fabricated completed goal. Full shared-goal semantics were tested in the prior accepted candidate. The new evidence proves launch/recovery plumbing, not live model quality or actual Render restart latency. Expiry is an explicitly injected authoritative-receipt boundary; no real five-minute wait or shortened deadline is disguised as a live expiry test. Private fixture files are removed; only public journal/results/key evidence is exported.

## Remaining genuine operator decisions

Supply and approve the actual privileged executor binding for the existing service/database, actual scoped synthetic principal/profile setup, attested signer and secure delivery mechanism, fixed activation release, pause/restore window and the single previously bounded $0.30 trial. These are not supplied by a fixture or browser login. The orchestration is executable and locally rehearsed; production transport/custody binding and real-service timing must be verified by the authorized operator before spending. No host, new external service, permission expansion or paid execution is authorized by this procedure.
