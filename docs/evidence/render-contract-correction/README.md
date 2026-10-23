# Official Render contract correction — exact-head evidence

Application: **32cab556ea842866e01f33e64794dd2ed968e8b7**, branch `feat/render-operator-transport`.

**PASS: typecheck and 22/22 tests**, zero failures/skips, exit 0. Node **22.23.4** in pinned image `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`. External network disabled with **--network none**; only the test's loopback HTTP server was reachable. No actual Render requests, production access, credential use/generation, signing as owner or provider calls.

## Defect and correction

The old application aaf0e53 independently failed RENDER_GROUP_SHAPE_INVALID when its simulator was corrected to return the official bare envGroupMeta array. The failure occurs in preflight. `old-official-shape-reproduction.log` preserves this failed regression, not a passing acceptance result. The previously authenticated aaf0e53/54b54e2 package remains unchanged but does not clear this contract defect.

The corrected parser validates bare endpoint metadata and the generic resource/cursor envelope. It checks required metadata/link fields, workspace scope and unique IDs. A full bare page fails completeness because the endpoint supplies no documented cursor; it never invents one from an ID. Malformed/mixed/cursorless envelopes, duplicate IDs and repeated cursors fail closed. Cursor-bearing pages follow the actual opaque token.

A systematic audit covered all 16 HTTP operations used. The official Render generated client independently confirms the bare array. Fixtures now validate request/response wire contracts separately from transport implementation, include required service/group metadata, use env PUT status 200 and exercise deploy 202 queued/no-body responses. See [the source and endpoint audit](../../operator/RENDER-API-CONTRACT-AUDIT.md).

## Coverage and artifacts

All prior transport failure/restoration/crash tests pass against the corrected fixtures. Added cases cover official bare objects, missing required fields, bare full-page refusal, opaque-cursor continuation, malformed/mixed/duplicate envelopes, repeated cursor refusal and queued deployment. The public fixture signer remains a known RFC 8032 test vector, not owner authority.

`traces/`: **24 sanitized mutation traces and 9 launcher journals**. Read-only negative cases have zero mutation entries. These are simulated records, not hosted audit logs. Credential/configuration values and private snapshots are excluded. `source-files.json` binds **783 source paths** to the tested commit/tree; `SHA256SUMS` binds the evidence package.

The first development version of the independent validator used the wrong installed Zod record signature. Its incomplete failed log is retained as `development-validator-failure.log`; that test process was terminated after diagnosis, corrected, and is explicitly superseded by the exact-head passing run. No failed/not-run stage is counted as passing.

## Exact execution

Read-only candidate mounted at /app, existing dependencies read-only at /app/node_modules, writable /tmp, user 1000:1000, and SAM_RENDER_TRANSPORT_EVIDENCE_DIR=/tmp/traces:

```sh
node --version && ./node_modules/.bin/tsc --noEmit && node --import tsx --test tests/isolated/render_transport.ts
```

The unrelated full acceptance suite was not rerun. The test remains registered in its isolated stage; prior full-suite evidence is not claimed for this commit.

## Limits unchanged

Hosted suspended build/rollback/resume behavior, effective actual configuration/credential restoration, approval-file removal and latency remain acceptance gates. API documentation does not prove those lifecycle properties. Full bare group pages with unproven continuation remain an explicit admission limitation. No live interlock, permission, deadline, model or budget changed.
