# Render transport — isolated exact-head evidence

Application: **aaf0e537246ba1af059e9e62df4c6817572fab53**, branch `feat/render-operator-transport`.

**PASS: typecheck and 16/16 focused transport tests**, zero failures/skips, exit 0. Node **22.23.4**, pinned image `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`. Docker ran with **--network none**; tests communicated only with their loopback simulated HTTP server. No actual Render calls, production database access, model calls, spending or generated credentials. Fixture signatures use a public RFC 8032 vector, never owner authority.

The real launcher exercised the concrete Render transport: snapshot, suspension/readback, individual approval-file delivery, configuration updates, prepared-build deployment, resume, report observation, cancellation/capture, exact release/configuration restoration, and approval-file deletion. The reported nominal objective is deliberately blocked; this test does not claim autonomous goal completion.

Adversarial cases: partial file rejection; response loss after file/deploy application; restoration rejection then recovery; suspended-deploy rejection with safe restoration; delayed unknown write that blocks restoration until readback; actual launcher SIGKILL after remote deploy application; HTTP cancellation; direct/inherited configuration preservation and drift; wrong service/origin before credential access; redirects; ambiguous deploy receipts; private-state lock and changed recovery scope; linked-group drift; exact original-deploy restoration even when commits match. No duplicate deployment POST follows response loss/crash. Unresolved requests remain pending, not silently classified as non-executed.

`traces/` contains 15 sanitized mutation traces and 8 public launcher journals. Request bodies appear only for prepared build/rollback identifiers. Tokens, secret/config values, private snapshots and private signing material are excluded. These artifacts describe a simulated API, not a Render audit log. `source-files.json` binds 781 tracked files to the exact application tree; `SHA256SUMS` binds this package. The prior d2170eb lock checkpoint remains unchanged.

## Exact command

The source was mounted readonly at /app, existing dependencies readonly at /app/node_modules, writable evidence directory at /tmp, user 1000:1000 and no external network. `SAM_RENDER_TRANSPORT_EVIDENCE_DIR=/tmp/traces`.

```sh
node --version && ./node_modules/.bin/tsc --noEmit && node --import tsx --test tests/isolated/render_transport.ts
```

The new test is registered in the existing isolated acceptance stage. The unrelated full acceptance suite was **not rerun**; earlier full-suite results are not represented as coverage of this commit.

## Remaining acceptance and authority boundaries

The actual service's suspended prepared-build/rollback/resume lifecycle is not established by these tests or guaranteed by the reviewed API references. The implementation refuses to resume the old worker first as a workaround. The simulator proves fail-closed behavior when suspended deployment is rejected. Hosted rehearsal must establish that lifecycle, effective configuration/credential restoration, file materialization/removal and timing before any paid run. If Render rejects the safe sequence, a separately reviewed fenced in-service activation route is required; there is no silent fallback.

Render exposes no documented atomic multi-setting/deploy transaction or mutation idempotency key. Exclusive operator maintenance is required; drift detection is not a cloud-wide compare-and-swap lock. Administrative SQL authorization, owner signer custody, API credential provisioning/revocation and activation approval remain outside this transport. The live interlock is unchanged and disabled. See [the executable transport procedure](../../operator/RENDER-TRANSPORT.md).
