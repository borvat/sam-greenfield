# SAM Production Runbook

## Startup
1. Load secrets from the deployment secret store; never commit them.
2. Set NODE_ENV=production, DATABASE_URL, SAM_WORKER_ID, and SAM_PRODUCTION_BUNDLE_MODULE.
   Use the repository's canonical composition module at /app/apps/runtime/src/productionCompositionModule.ts.
   The production bundle must contain only reviewed real capability/tool/model/verifier adapters; test fakes are forbidden.
3. Apply migrations before starting the runtime.
4. Start the runtime process.
5. Do not route traffic/work until /readyz returns 200.
6. Startup recovery must finish before readiness becomes true.

## Health
- /livez: process is alive.
- /readyz: database reachable, startup recovery completed, not shutting down.
- Operational health and incidents remain available through Phase 6 supervisor data.

## Deployment
- Deploy immutable build artifact.
- Apply database migrations once.
- Start new runtime.
- Wait for /readyz=200.
- Shift work/traffic only after readiness succeeds.
- Keep previous artifact available for rollback.

## Rollback
- Stop assigning new work to the new runtime.
- Gracefully shut it down.
- Roll back application artifact only.
- Do not reverse an already-applied migration unless a separately reviewed reverse migration exists.
- Start previous artifact and wait for /readyz=200.

## Backup
- Use provider-managed PostgreSQL backups plus scheduled logical backups.
- Test restore into an isolated database before relying on a backup.
- Never run restore against production as a validation test.

Example logical backup:
pg_dump --format=custom --no-owner --file=sam.backup "$DATABASE_URL"

Example isolated restore:
createdb sam_restore_test
pg_restore --no-owner --dbname=sam_restore_test sam.backup

## Shutdown
- Flip readiness false first.
- Stop taking new work.
- Allow in-flight work to finish within the grace window.
- Close HTTP listener.
- Close database pool.
- Rely on lease expiry + Phase 1 restart recovery if the process is terminated before clean completion.


## ChatGPT MCP bridge
SAM exposes its ChatGPT tool surface from a separate MCP process on port 8081.

Required production values:
- SAM_MCP_BEARER_TOKEN
- SAM_MCP_ALLOWED_HOSTS

Optional:
- SAM_MCP_ALLOWED_ORIGINS
- SAM_MCP_ACTOR

Operational checks:
1. Confirm GET /livez returns 200.
2. Connect ChatGPT to the /mcp endpoint using the approved secure path.
3. Verify read tools are listed.
4. sam_execute is advertised only when a validated production dispatcher is present.
5. Never place the bearer token in source control, logs, or tool output.

The MCP process and executive worker are deliberately separate. Restarting the MCP bridge must not interrupt the executive worker.


## Real model providers
The production bundle may call `withStandardModelProvidersFromEnv(...)` to register the five supported real provider adapters.

A provider is enabled only when its API key and model name are set. Qwen also requires an explicit compatible-mode base URL.

Provider registry metadata is synchronized into `model_providers` at production composition startup. Default privacy is PUBLIC + INTERNAL only. CONFIDENTIAL or RESTRICTED must be opted in explicitly per provider after policy review.

Never place provider keys in source control, the production bundle file, logs, audit payloads, or tool responses.


## Gmail production adapter
The canonical production bundle can register `gmail_send` when Google OAuth values are configured.

Required:
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN

The Gmail send capability is YELLOW and therefore remains blocked until SAM authority approval exists. The adapter creates a deterministic RFC 2822 Message-ID from the SAM idempotency key and uses Gmail readback for reconciliation and independent verification.

External email content is rejected when it contains explicit AI-assistant wording such as ChatGPT / artificial intelligence / language model. This enforces the company external-message rule that SAM must communicate as the company, not announce itself as an AI assistant.

OAuth refresh tokens must be stored only in the deployment secret store.


## Google Drive production adapters
The canonical production bundle registers Drive capabilities whenever Google OAuth credentials are configured:
- drive_get_metadata: GREEN, read-only
- drive_search: GREEN, read-only
- drive_create_folder: YELLOW, side-effecting and approval-gated

Drive read tools are independently re-read during verification. Folder creation stores a deterministic hashed SAM operation marker in Drive appProperties so reconciliation can still confirm a provider-success/process-crash window even when the provider file ID was not persisted locally.

The runtime synchronizes the three Drive verification contracts before work begins.


## e-Boekhouden read-only accounting adapter
The canonical production bundle registers four GREEN read-only accounting capabilities when EBOEKHOUDEN_API_TOKEN is configured:
- eboekhouden_list_mutations
- eboekhouden_outstanding_invoices
- eboekhouden_list_ledgers
- eboekhouden_list_relations

SAM exchanges the long-lived API token for a short-lived REST session token and retries once after a 401 by refreshing the session. The production bundle contains no e-Boekhouden accounting write endpoint in this phase.

This keeps e-Boekhouden as an accounting truth/read source while write automation remains explicitly out of scope until separately approved and verified.


## bol Retailer API read-only adapter
The canonical production bundle registers four GREEN read-only marketplace capabilities when BOL_CLIENT_ID and BOL_CLIENT_SECRET are configured:
- bol_list_orders
- bol_list_returns
- bol_list_invoices
- bol_get_retailer

Authentication uses bol's OAuth2 client-credentials flow. Access tokens are cached and reused; one 401 triggers one token refresh + retry.

This phase intentionally exposes no bol write action. Shipping confirmations, stock/price changes, cancellations, return handling, invoice uploads, and other marketplace mutations remain out of scope until separately approved and implemented behind the authority/verification layer.


## Gmail operational inbox reads
When Google OAuth credentials are configured, the canonical bundle now exposes:
- gmail_search_threads: GREEN
- gmail_get_thread: GREEN
- gmail_get_message: GREEN

These read-only capabilities support supplier replies, logistics/carrier updates, procurement follow-up and topic-based mailbox review. Gmail search is bounded to 500 results and a 500-character query. Read verifiers perform a fresh Gmail API readback.

gmail_send remains YELLOW and approval-gated.
