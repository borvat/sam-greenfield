# Existing SAM test service rollout — prepared, not activated

This candidate is **not deployed**. The owner prohibited automatic reactivation of suspended services. The existing test service is suspended, and its existing database login was observed expired through a read-only query from the application host. No credential, role, service or production setting was changed.

The nominated existing service, Docker path, health endpoint and opt-in are recorded in `rollout.json`. It keeps its existing compute plan, token and private fixed-tenant database binding. No new resource, provider credential, analysis window or budget is introduced. Provider/Hermes/coding flags never enter the application environment.

## Activation prerequisites

1. Obtain the owner's specific decision to resume this suspended test service and renew **only the existing restricted test login**, for one maximum 60-minute window, preserving every privilege, tenant fence and password. The old expired window is not reused automatically.
2. Use the existing secure operator connection to confirm the binding's schema, role and synthetic company. Do not print the private connection file. Startup requires the original fixed-tenant integration/evaluation policies, the exact previously reviewed shared-coordinator function, enrollment as `SYNTHETIC_EVALUATION_ONLY`, no public-table privileges, and a non-owner/no-bypass/no-membership principal.
3. Keep auto-deploy off. Select this reviewed candidate branch and `./deploy/reliability-test/Dockerfile`, set `SAM_RELIABILITY_TEST_ENABLED=1`, and `/readyz` as health check. Preserve the current token and private binding file. Never link a provider environment group or renew analysis admission.
4. Resume and deploy the exact reviewed commit, record its deployment ID and require `live`. Then check `/readyz`, authentication denial, the protected UI, MCP read-only tool manifest, and exact common revision. A successful deploy trigger is not acceptance.

## Test boundaries

The three application surfaces share one source revision. Externally exposed APIs/tools are read-only; kernel recovery, event relay and supervisor maintenance continue inside the existing isolated synthetic schema. No planner, executor, model or external connector is registered. The startup never runs DDL, grants, enrollment, migrations or login renewal. It stops before the original monotonic database lease expires, including time spent importing application modules.

The immutable original report can be retrieved by ID only when current RLS makes that row visible. Existing integration policies hide reports from prior plans; the candidate reports that limitation and does not broaden policies. Operational recall similarly reports only visible records and retains approval distinctions. Notifications are polled internal records; there is no implemented ChatGPT wake or push transport.

## Persistence acceptance after activation

This procedure is **NOT RUN**. A local PGlite process restart does not prove Render container persistence.

- In the existing test service's secure Shell, choose one non-sensitive stable nonce matching `reliability_` followed by sixteen lowercase alphanumeric characters. Set `SAM_RELIABILITY_SENTINEL_NONCE` locally in that operator session. Do not use a business record or personal data as the sentinel.
- Run `node --import tsx deploy/reliability-test/memorySentinel.ts --write-sentinel` exactly once. It admits the existing restricted binding, checks synthetic enrollment and writes one `OBSERVED` record; repeated use of that nonce returns the original record rather than duplicating it. Record the returned ID/hash. It creates no approved rule.
- Read the same statement through the authenticated `sam_recall_memory` test tool. Verify scope, source, dates and `OBSERVED` status; it must not enter approved planner memory.
- Replace the actual Render container at the same commit without renewing its lease. Record the distinct Render instance/deploy identity. Re-export the same non-secret nonce in the new secure operator session and run `--read-sentinel`; require the same ID/hash and repeat scoped MCP recall.
- Retain the synthetic record as labelled evidence. Do not delete data, reset reservations, replay business goals or reopen models. Stop when the fixed login lease ends.

## Verification already performed

See `docs/engineering/independent-verification.md` for exact commands and proof boundaries. Local tests use PGlite, injected provider transports and loopback HTTP; staging admission has response-stub tests. Native hosted role enforcement, browser QA, deployment, actual container replacement and live objective acceptance remain pending. Rollback is an explicitly approved deployment of the retained old candidate or suspension; it never rolls back database history.
