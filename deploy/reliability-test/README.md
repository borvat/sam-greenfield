# Existing SAM test service — bounded native acceptance completed

The owner explicitly approved resuming only the existing `sam-isolated-test` service and renewing only its existing restricted login once for at most 60 minutes. The owner entered the existing database password in a hidden prompt in their own Render browser. No password, grant, RLS policy, tenant, compute plan or analysis admission was changed. The login expires at **2026-10-28T01:00:25.521Z**; no automatic renewal is allowed. This service is a bounded synthetic read-only test, not a production deployment or general executive intake.

## Published application

- URL: https://sam-isolated-test.onrender.com
- Application commit: `f859fda054f0d367c983e131feee6e6ddd7ae861`.
- Deployment: `dep-dbgjpu88v5cc73fsg410`, LIVE at 00:09:05 UTC.
- Existing service/plan, branch, Dockerfile and health endpoint are recorded in `rollout.json`. Auto-deploy remains off. Later documentation-only branch commits are not deployed automatically.
- All three native `/livez` endpoints reported this same exact application revision. Public `/readyz` returned three 200 statuses. Browser inspection confirmed the read-only banner and absence of the creation form. Authentication remains required for business/test records.

Use the existing `SAM_TEST_BEARER_TOKEN` from this service's secure configuration for the protected UI/API. Never put the value in a URL, report, Git commit or chat. No new token was created. Browser inspection covered the unauthenticated layout; authenticated data/API acceptance used a native SDK client inside the test service, consuming the token without printing it.

## Native results

See `../../docs/engineering/hosted-reliability-evidence.json` and the independent verification report. Missing bearer returns 401, foreign Origin 403, and creation 405. MCP exposes exactly seven read-only tools; submit/continuation are denied. Existing synthetic report `b901c6c3-473f-4ab0-a25c-900205d9144d` was fetched twice with identical content/hash and zero execution; this was repeated after replacement. The production report is intentionally invisible to this isolated company and was not copied or reanalyzed.

The first container `srv-dbe27ics728c738tuoc0-55b5ff5fb7-g4jp4` wrote one explicitly labelled synthetic observation. Replacement container `srv-dbe27ics728c738tuoc0-6bc877c9fc-q97ck` returned the same memory ID `91f50960-3004-4833-86a0-1c9b00dcaf25`, hash, company, source, created timestamp and `OBSERVED` status through the operator read and scoped MCP recall. This is one real Render replacement, not a process-local test; it does not prove backup recovery or indefinite availability. The unchanged server field `containerReplacementValidated:false` is not the evidence source.

## Preserved boundaries

No planner, executor, model or external connector is registered. Provider/Hermes/coding flags never enter the application environment. The startup never runs DDL, grants, enrollment, migrations or login renewal. Maintenance continues only in the existing synthetic schema; no `WORK_TICK_FAILED` was observed in the recorded post-start window.

The original monotonic database lease includes import time and stops the process before expiry. Startup and the explicit sentinel CLI require more than five minutes remaining. A new deployment never renews the login. After expiry, protected live test access is unavailable until a separately authorized bounded login is provided; the saved database row and evidence are not deleted.

Execution knowledge and notifications are intentionally feature-disabled in this isolated release. Operational memory is available and scoped; observations never become approved rules. Existing RLS can hide earlier-plan reports. No permission or policy was relaxed. Notifications remain polling only, with no demonstrated ChatGPT push transport.

Production promotion and recovery of the original email goal remain separate decisions. The current ChatGPT production connection was not redirected to this bearer-protected test MCP endpoint. No model or SAM-Hermes policy credit was used.
