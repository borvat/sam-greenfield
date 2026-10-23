# Controlled synthetic staging specification

This is a configuration/runbook for a future explicitly authorized rehearsal.
No Compose deployment, remote SQL, credential change, provider authorization or
paid resource was performed. Use an approved existing isolated resource; if none
exists, staging stays blocked. Preserve every production stability test unchanged.

The [Compose specification](../deploy/staging/docker-compose.integration.yml)
uses pinned PostgreSQL/pgvector and a nominated already-built immutable SAM image.
It creates no ingress, publishes no ports, uses an internal Docker network and
sets `pull_policy: never` for application services. Review the actual image ID in
the independent report. Do not substitute `latest`, a production image service,
production database/backup or customer data.

Worker, Command Center and MCP retain distinct filesystems, LOGINs and bearers,
but CC/MCP join the worker network namespace. This preserves the existing release
surface's loopback-only health reads without adding a proxy or exposing ports.
The MCP test-results tool reports NOT_RUN for in-image attestation; current
acceptance is the separate hashed independent report, never an old repository PASS.

## Operator configuration and identities

Provide values securely on the staging host; do not commit populated env files,
private keys, tokens or database URLs. Required names appear as `${...:?}` in the
spec. Keep the populated Compose environment owner-readable, and use `config
--quiet` when reviewing it to avoid printing resolved secrets.

| Configuration | Required value / constraint |
| --- | --- |
| `SAM_STAGING_IMAGE` | Exact accepted image ID/digest; already available on approved host |
| `SAM_STAGING_DB_NAME`, owner role/password file | New synthetic database and owner, never production identifiers |
| Worker, CC and MCP database URLs | Three distinct LOGINs, no memberships/owner/BYPASSRLS/DDL; trusted fixed org/entity policies; direct TLS `sslmode=verify-full&sslrootcert=/run/staging-ca.pem` with encoded tenant/search_path options |
| Entity, host/origin settings | One synthetic company, exact approved private/HTTPS names, no wildcard origins |
| Status, CC and MCP bearers | Separate newly authorized staging-only secrets, never reused OAuth passwords or production keys |
| Server cert/key/CA/HBA files | Approved staging DNS identity, server-key permissions/UID compatible with postgres, hostssl-only SCRAM rules; require actual TLS connection proof |

All three application commands pass through `scripts/release/staging-service.ts`:
it refuses a plaintext/missing-CA URL, a hostname mismatch, privileged or misbound
LOGIN, unexpected org/entity and live connector flags before importing the existing
service entrypoint. `SAM_STAGING_DB_HOST`, `SAM_STAGING_ORG_ID` and
`SAM_STAGING_ENTITY_ID` must match the reviewed target. Its denial path is tested;
positive remote TLS startup remains part of the authorized staging rehearsal.

The default container bootstrap superuser belongs only to the isolated staging
cluster and must never be the worker. Provision a separate schema owner/migrator
and distinct runtime roles through an approved administrator. Do not put owner
credentials in application containers. Cluster-wide role creation and restore
need their own operator procedure; a database dump alone does not create roles.

## Migration and bootstrap sequence

1. Freeze image ID, exact source SHA, package lockfile, twelve core migration
   hashes and eight feature hashes. Record nominated database hostname/name/schema
   and independently verified server identity before connecting.
2. Operator applies the existing twelve-file core migrator to an empty approved
   staging schema, then verifies receipts. No application startup migrates SQL.
3. The separate feature operator command is:

   ```sh
   node --import tsx scripts/release/integration-migrate.ts --apply
   ```

   It refuses unless `SAM_DATABASE_TARGET=staging`,
   `SAM_STAGING_MIGRATION_APPROVED=1`, host/name/schema match explicit
   `SAM_STAGING_DB_HOST`, `SAM_STAGING_DB_NAME`, `SAM_STAGING_DB_SCHEMA`, TLS mode
   is verify-full, core receipts exactly match source, and
   `SAM_STAGING_MIGRATION_MANIFEST_SHA256` equals SHA256 of compact JSON
   `integrationManifest().map(({filename,sha256})=>({filename,sha256}))`.
   Its refusal path is tested; execution against remote staging is unrun.
4. Operator seeds only synthetic org/entity and metadata, including the local
   arithmetic verification contracts from the existing release profile. Use the
   existing contract-validation rules; workers validate, never write registries.
5. Within an operator transaction invoke `provisionIntegrationAccess` for the
   nominated worker LOGIN and tenant; use core provisioning for read-only CC/MCP
   admission. Review service-specific ACLs before reducing any core approval/
   receipt permissions required by existing code. The feature helper grants no
   token, delivery or capability-configuration authority. It does not create roles
   or credentials and is not blindly idempotent: compare existing policies first.
6. Enable no perception source, model, notification setting, provider credential
   or OAuth flag in the first rehearsal. The supplied composition has only local
   arithmetic and no planner. NEW prose goals are expected to remain unplanned.

## OAuth and MCP

Initial MCP uses the existing read-only release surface with its distinct bearer.
No synthetic-planner or mutation endpoint is enabled. Ingress/HTTPS exposure is
not part of this specification; any later approved ingress must retain exact host,
origin and authentication checks and expose neither owner SQL nor worker internals.

Google PKCE/state/encryption and seven-tool MCP filtering are mechanically tested
with mocked transport and real disposable token persistence. No provider consent,
live token exchange, file retrieval or source Render service was accessed.
Internal MCP OAuth is a separate unregistered library; no bearer-as-password
fallback is accepted. A future integration must choose one explicit authentication
contract, test issuer/resource/client/redirect/scope/expiry/replay failures, and
bind the actual provider account and token-service role to the synthetic company.
Database RLS alone cannot prove upstream account ownership. Until then OAuth/live
connector staging remains blocked; these flags must stay disabled.

## Health, observability and acceptance

Observe `/livez`, `/readyz`, authenticated worker `/statusz`, CC readiness/API
authentication and MCP initialization/read-only tools. Liveness alone is not
execution success. Require unauthenticated protected requests to return 401.
Record `RUNTIME_STAGE_FAILED`, `INTEGRATION_FEATURE_FAILED`, planning reason codes,
retry/lease state, oldest backlog age and uncertain operations. Select scoped IDs,
counts and ages; never collect source bodies, credentials or URL secrets.

The internal network and distinct namespace prevent this rehearsal from sharing
traffic, ports, queues, schedules or databases with production stability tests.
The current pg pool can use ten connections per process; budget at least the
approved worker/CC/MCP pools plus migration/observer headroom. Record the actual
resource ceiling and owner-approved observation duration before startup. No new
monitoring subscription or paid service is required.

Required exit evidence:

- Frozen-candidate `verify:full` success and independently reviewed hashes.
- Verified staging target/TLS and actual non-owner/non-member LOGIN admission.
- Zero foreign rows/writes under sibling-org, other-org, missing/spoofed context;
  owner and missing-policy startup refused; no token/delivery/config mutation.
- Exact migration receipts, clean/upgrade parity and sentinel persistence after
  PostgreSQL restart; no automatic tenant backfill of legacy unlabeled rows.
- Three healthy services, authenticated representative reads, bounded maintenance
  ticks, graceful stop/restart and zero unexpected external egress or effects.
- A separately approved structured synthetic execution through existing kernel
  APIs can test local arithmetic. It is not natural-language planning acceptance.
- Actual backup restore into quarantine, receipt/policy/tenant revalidation and
  measured recovery meeting operator-approved RPO/RTO. A SQL rollback test is not
  backup/restore acceptance.

## Backup and rollback

Before authorized changes, take an encrypted synthetic-staging database backup
and separate reviewed role/grant definitions. Record retention, restore owner and
backup checksum. Restore only into a new quarantined staging target with workers,
monitors and delivery stopped. Validate server identity, schema/receipt hashes,
fixed policies, synthetic sentinel and ledger records before resuming one worker.

For rollback, stop intake and wait for bounded graceful shutdown. Preserve the
additive schema, operation ledger, verification history and event cursors. An old
worker must not claim dependency-bearing plans; earlier acceptance proved that
unsafe downgrade. Drain/cancel through approved scoped procedures or roll forward
to the compatible image. Never clear approvals/receipts, resend uncertain work or
replay notifications to make a run green. No destructive down migration is supplied.

This spec is ready for configuration review, not a claim that remote staging was
deployed or validated. Required secrets/resource/identity/restore approvals remain
missing. Production deployment and live business actions require separate work
and authorization regardless of local acceptance.
