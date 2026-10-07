# SAM free deployment trial

Prepared from main `2ab95b7283f264429a211e0d9d48eef937281cb7`.
All three Node web services and PostgreSQL 15 explicitly use `plan: free`.
No private service, paid worker, cron job, or paid pre-deploy hook is required.
This is a supervised trial, not evidence of live SAM operation.

## Current blocker

On 2026-10-07, creation of a free PostgreSQL database in the confirmed
Sam's workspace (`tea-db35rbflot8c739g8rhg`) returned HTTP 402:
`Payment information is required to complete this request.`
No database or service was created. The owner must complete Render's secure
billing/account verification at https://dashboard.render.com/billing before
resource creation can be retried. Do not change any resource to a paid plan.

## Trial limits and billing

Render free web services sleep after 15 minutes without inbound traffic;
internal SAM ticks do not keep them awake. The free PostgreSQL database expires
once 30 days elapse and has no backups. Export useful trial evidence before expiry.
The services share the workspace's 750 free instance hours per month.
See https://render.com/docs/free for current limits.
Do not use artificial keep-alive requests to evade the free service limits.
The owner should review billing spend limits before adding a payment method:
free compute does not imply unlimited bandwidth, build usage, or model calls.
No paid model requests are authorized by this deployment configuration.

## Startup and access

The existing kernel is unchanged. Each launcher first runs the existing
advisory-lock migration runner, then idempotently initializes the trial company.
Failure aborts startup. Free instances do not support pre-deploy commands.
The generated trial organization/entity UUIDs are shared by all services;
company names are Surooh Holding Group B.V. and QNAN B.V. These are new records,
not IDs imported from old SAM.

The runtime is a public web service that exposes health endpoints only.
Command Center and MCP require separate generated bearer tokens and exact
Render hostname allowlists. PostgreSQL external access is disabled; services
use the internal connection string. All resources are in Frankfurt.
Auto-deploy and preview environments are off.

## Integration status

Lovable Gmail/Drive workspace connections are not portable OAuth credentials.
Never copy or extract their tokens to Render. Direct Google access needs an
owner-authorized Google OAuth application and secure credentials.
The current native SAM adapter supports Drive search/metadata and Gmail send;
Gmail task reading, multiple-account routing, and web search still need
implementation and verification. Do not register send/write capabilities for
a read-only trial. No Gmail or Drive connection on Render has been established.

Optional model and bol credential fields must be entered in Render securely
only when those integrations are being tested; do not put credentials in Git
or chat. Missing credentials are not replaced by mocks to pass acceptance.

## Deployment and acceptance

1. Complete the account verification requested by Render without upgrading.
2. Push these deployment files and package-lock.json to the trial branch.
3. Create the Blueprint in the confirmed workspace and verify every plan is Free.
4. Supply only the secure credentials required for the selected trial.
5. Check startup migrations and company initialization, runtime and Command
   Center readiness, and the MCP health endpoint.
6. Verify unauthenticated business requests are rejected.
7. Once an actual model and a read-only provider are connected, run the existing
   live acceptance runner against the public trial URLs while services are awake.
8. Require retained goal, plan, work, execution, and independent VERIFIED
   evidence before reporting a real Golden Chain PASS.

YAML schema and launcher syntax validation do not prove database bootstrap,
Google authentication, a real model call, or goal execution. Those checks remain
pending until deployment and credentials are available.
