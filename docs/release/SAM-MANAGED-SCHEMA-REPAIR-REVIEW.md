# Managed SAM schema repair review — production NO-GO

## Direct evidence (2026-10-11)

Base main/GitHub: `366d601a043981bb31ae6cef583cbaa1b7145e59`.
Reviewed diagnostic branch: `82ae97f56d6ad8fcef3037bc37be434c2dab96ed`;
not merged. PR number supplied by owner: 3; its merge state was not checked
through the GitHub API.

Same read-only catalog checks through Replit SQL API:

| Target | Recovery/replica | sam | Tables | RLS | Policies | public tables | sam_runtime |
|---|---|---|---:|---:|---:|---:|---|
| heliumdb (development) | false | present | 22 | 22 | 3 | 0 | absent |
| neondb (production replica) | true | absent | 0 | 0 | 0 | 0 | absent |

The owner independently reports production SQL Editor namespace absence.
Our production tool reads a replica; it alone does not prove primary parity.
Native `explainSchemaDiff()` again returned success, `hasDiff=false`, no SQL,
no warnings. This does not constitute a usable migration plan.

Public deployment is a successful VM build, not a working executive:
- protected-resource metadata `/mcp` discovery: HTTP 200, audience
  `https://sam-greenfield.replit.app/mcp`, authorization server
  `https://dev-izt2dymhavtig3p5.eu.auth0.com/`;
- `/mcp`: HTTP 401, `SETUP_MCP_DISABLED`, correct resource_metadata challenge;
- `/readyz`: HTTP 503.

No production writes, republish, secret changes, execution activation,
model calls, backup restore or paid provisioning were performed.

## Supported mechanism and verified comparison-scope failure

Replit engineering describes a forked Drizzle introspection/diff service,
deploy-time comparison, validation on a temporary production branch and preview.
This service is not implemented by this repository's `db:migrate`.
Its internal introspection filters/source mapping are not available here.
The controlled follow-up below establishes an observable scope failure:
the service detects public objects but omits a custom-schema control, including
when both have RLS. The exact internal filter/configuration is still unavailable.

The generated documentation search answer asserted "public only"; the actual
linked engineering article does not establish that restriction. Do not treat
the search summary as confirmed support policy. Current upstream Drizzle docs
explicitly say schemaFilter defaults to "*"; they are not proof of this
platform fork's version or configuration.

Sources:
- https://frontier.replit.com/production-databases-automated-migrations/
- https://docs.replit.com/features/data-and-storage/development-and-production
- https://docs.replit.com/features/data-and-storage/data-recovery
- https://orm.drizzle.team/docs/drizzle-kit-pull

Managed production DDL belongs to the native Publish flow. Do not run the
diagnostic branch's production SQL generator, add startup/build DDL, copy the
development database, or move SAM into public to bypass an unexplained diff.
The branch's SQL draft is not adopted or approved by this review.

## Original migration review

All ten original files remain unchanged; retain their hashes/history.
- 00001–00007 create tables, functions, triggers, indexes, sequences and a view
  with unqualified object names. Target selection depends on search_path.
- 00001 installs pgcrypto if absent. Extension installation is a separate
  owner/platform prerequisite; a sam-only transfer must not install/relocate
  extensions or modify public implicitly.
- 00006 inserts three static verification contracts. These are catalog seeds,
  not development business data; this source sam was deliberately made empty.
  Schema-only publication does not supply the runtime seed.
- 00008 installs the three original NULL-context-denying policies.
- 00009's policy-existence checks omit schemaname. Do not run it individually
  against a partially initialized namespace: another schema's policy could
  satisfy its check. In the full ordered bundle, 00008 creates the same-schema
  policies first; postconditions must independently check sam policy bodies.
- 00010 updates/deletes duplicate sequence rows. It is not DDL-only; on a new,
  empty sam these statements affect no rows. Never run it against public or
  existing SAM data without a separate data-migration review.
- Actual sam functions are SECURITY INVOKER, with no function-local search_path.
  All 22 tables have RLS, none have FORCE RLS. Owners bypass ordinary RLS;
  a separate non-owner/NOBYPASSRLS runtime LOGIN is mandatory.
- Only 3 policies exist. Enabling RLS is fail-closed but does not make a worker
  usable: most tables have no access policies at all.

The legacy runner now defaults to offline inspection and suppresses raw errors.
Explicit --apply still uses the existing development/test contract. It remains
unsuitable for managed production: unqualified ledger, ambient search_path,
no target/backup admission, and per-file rather than bundle transactions.

## Exact bounded transfer specification — not executable SQL

1. Freeze/review source hashes and target identity. Native platform must correct
   its demonstrated comparison scope and expose a nonempty proposed diff
   including `sam` before the owner authorizes publishing. Its reviewed scope
   must include sam ONLY: not all development service namespaces or public.
   Adding a project drizzle config is not a proven fix: this repo has no
   installed Drizzle and native service configuration is outside the repo.
2. Require a COMPLETE backup restore point (ID, time, correct database,
   retention) AND successful restore evidence from an isolated copy. Record
   verification of schemas, object ownership/ACL, RLS and audit preservation;
   worker/queue/outbox must stay quarantined. No backup ID means BLOCKED.
3. Scope the proposed change to **new sam only**: original 22 table names,
   original functions/triggers/view/indexes/sequences, reviewed owners and
   explicit restrictive grants. No other development service schemas, public
   objects, production data, extension relocation, unrelated drops or resets.
   Reject a whole-development schema diff if it includes service schemas.
4. Native-generated statements must be schema-qualified. A SQL session used in
   an isolated rehearsal must pin `search_path=sam,pg_catalog` for unqualified
   original creation, with sam writable ONLY by migration identity. Pin
   runtime function resolution to reviewed trusted schemas, place pg_temp last,
   and revoke PUBLIC function EXECUTE before granting required functions only.
   Do not silently rewrite historical migrations.
5. Before any real migration: rehearse the exact reviewed native SQL on an
   explicitly authorized isolated target; verify public/other namespaces'
   inventories remain unchanged. Have a reviewed partial-failure rollback and
   a restore plan that do not discard production data. Platform transaction
   guarantees must be established, not assumed.
6. After owner-authorized native publication: independently query primary
   identity, namespace/table/column/constraint/function/policy inventories and
   source hashes. Matching names/counts alone is not schema parity.
7. Independently provision/verify actual restricted runtime LOGIN, separate
   from schema owner/migrator: no admin membership/BYPASSRLS/CREATE/ownership,
   limited per-table/per-column grants, verified direct TLS, real session
   identity. Tenant/entity/run restrictive policies and related-row checks,
   missing-context/foreign-identity denial are required before runtime use.
8. Auth0 needs the actual registered Client ID, owner subject, exact connector
   callback, PKCE/resource compatibility, signed tenant/entity/run binding and
   granted sam:synthetic:read/submit scopes. Discovery 200 is not OAuth proof.
9. Keep approvals=0 and Setup mode until all of the above. Only separately
   approved synthetic seed/model budget and authenticated goal->plan->worker->
   independent verification evidence can establish working executive MCP.

## Current blocking evidence

Scheduled backups and 7-day retention were reported by owner. Last reported UI
was "No backups yet". This session has no API exposing backup list/completion
or isolated restore execution; no backup or restore is claimed verified.
Official docs say daily scheduled backups are created near local midnight,
so enabling a schedule does not imply an immediate completed backup.
Do not click Restore on the live database to test recoverability: that switches
its active data. An isolated restore requires a separately reviewed supported
route, potential resource costs and owner approval before creation.

NEXT OWNER EVIDENCE: Database -> Production -> Settings -> Advanced ->
Scheduled backups -> View all backups; supply only completed backup ID/time/
status (no credentials). If empty, the backup gate remains blocked. This is
read-only, not permission to restore, republish or migrate.

Platform schema mapping remains independently blocked even after backup proof.
No claim that this local review repaired Replit's internal migration service.

## Local verification in this repair

- `node --test tests/release/migration_offline_safety.cjs`: 6/6 PASS;
  synthetic PG interception prevents connections and tests explicit-apply,
  offline defaults, absent credentials and raw-error redaction.
- `node tests/release/managed_schema_source.cjs`: PASS; unchanged original
  ten-migration development source and its guards, no database connection.
- `node tests/release/auth0_post_login.cjs`: PASS; offline owner/client binding
  and refusal checks, no live Auth0 login.
- `node tests/release/preparation.cjs`: PASS; eight unsafe configuration cases
  refused, closed setup remains non-executing.
- `npm run typecheck`: PASS; `git diff --check`: PASS.

These tests are UNIT/OFFLINE, not production migration, restore, restricted-role
RLS/TLS acceptance, OAuth login or executive MCP execution evidence. The only
LIVE evidence in this repair is read-only catalog/native diff/deployment metadata
and public HTTP checks listed above. Existing developer service configuration
and data were not modified.

## Controlled development scope experiment (2026-10-11, completed by 13:54 UTC)

This follow-up is a REAL platform/Development PostgreSQL diagnostic, not a
mock. It does NOT constitute a production migration or a SAM goal acceptance.

Before probes:
- Native schema diff: hasDiff=false, zero statements.
- Development primary: heliumdb, role postgres, search_path `"$user", public`,
  sam USAGE=true, sam has 22 tables. Chosen probe names did not exist.

Experiment A:
- Created one empty, uniquely marked Development public table:
  `public.sam_diff_probe_20261011_81b8950`.
- Native diff immediately returned hasDiff=true and exactly its CREATE TABLE.
- Removed only this test-created empty table after verifying its marker.

Experiment B (rules out RLS as the differentiating cause):
- Created that public table and a same-shaped custom control:
  `sam_diff_scope_probe_81b8950.sam_diff_custom_probe_81b8950`.
- Both tables had RLS enabled, no policies, no data and the same test owner.
- Granted USAGE on the NEW test schema to PUBLIC to avoid a schema-USAGE
  exclusion; no table data grants, SAM grants or runtime privileges changed.
- Native diff returned exactly TWO statements: CREATE public probe and
  ENABLE RLS on public probe. No custom schema/table creation was included.
- Cleanup checked markers and emptiness, then dropped only both test tables
  and their new test schema, without CASCADE.

Independent final query:
`public_probe_removed=true`, `scope_probe_removed=true`, sam tables=22,
sam RLS tables=22, public tables=0.
Native diff after cleanup: hasDiff=false, zero statements.

Conclusion: this service sees the current development source's public changes
immediately but does not include the tested custom namespace. RLS itself and
a completely wrong/stale development source do not explain this experiment.
Do not claim knowledge of the internal schemaFilter value or a global Replit
custom-schema support policy. Production received NONE of the proposed SQL.

## Backup/release status after owner's fresh screenshot

Owner now reports Scheduled backups On, retention 7 days, No backups yet;
PITR On, last 7 days. Neither a scheduled setting nor PITR availability proves
an exercised restore. Both gates remain independent of the scope finding.

The exposed agent tools have no backup-list/create-snapshot/restore-to-isolated-
copy operation. Official recovery docs describe live restore switching the
active database; performing that to "test" recovery is prohibited.
The documented deployment preview uses a temporary production copy but is not
a verified free standalone backup rehearsal and may create billable resources;
do not create it or initiate publishing under the current authorization.
No supported zero-new-cost isolated production restore was established here.
SQL catalog snapshots are NOT data backups and cannot satisfy this gate.

Next bounded release sequence:
1. Obtain completed backup ID/time/status and owner-approved supported isolated
   restore route/cost; execute and retain restore evidence only after approval.
2. Platform corrects native comparison scope; review its exact sam-only SQL and
   reject other namespaces/public objects/destructive or data-copy statements.
3. Rehearse that exact native plan on an authorized isolated target with worker
   off, verify public/data invariants and rollback before publication approval.
4. Only then request owner Publish approval; afterwards prove schema, actual
   restricted LOGIN/RLS/TLS and owner-bound OAuth separately before activation.

Local checks rerun at 13:54 UTC: 6/6 migration safety tests, source/Action/
closed-setup checks and typecheck PASS. Historical migration files untouched.

## Executive code review follow-up — trusted relation lookup

Reviewed the existing release DB admission, connection contract and secured MCP;
no replacement bridge or runtime was introduced. Review branch already on
GitHub at `34e855279ca294c819d5c085e741f4b396a05a5c`, main still at the
original base; owner reports draft PR 4. Diagnostic PR 3 remains unmerged.

Found and corrected a concrete release connection defect: omitting `pg_temp`
from search_path implicitly gives temporary relations precedence. The canonical
runtime/admission path is now `sam,pg_catalog,pg_temp` (configured SAM schema
first), applied identically to all existing release children; incoming URI
options cannot override it. No schema/data/grant/function changes are required.

Actual heliumdb transaction, entirely rolled back:
- temporary empty work_queue shadows sam.work_queue under old path: true;
- corrected path resolves sam.work_queue: true;
- current_schema remains sam, so original admission scope is preserved: true.

This is real PostgreSQL name-resolution evidence, not non-owner RLS or
production-runtime acceptance. Original migration SQL/hashes remain untouched.

Verification of this correction:
- Release contract/process tests PASS, including hostile URI search_path
  replacement and identical canonical options for all three release children.
- Existing MCP test PASS: 124 checks; actual loopback Streamable HTTP protocol
  and signed synthetic credentials, deliberately mocked SQL. No external calls.
- Actual local pg TLS negotiation PASS; mismatched/untrusted certificates
  rejected. Server startup fixture is not production DB authentication.
- Database admission tests PASS: 14 local cases; no provider/DB compatibility
  claim. Typecheck and diff checks PASS.
- Fresh LIVE protected-resource discovery and Auth0 OIDC metadata both 200;
  /mcp remains 401 SETUP_MCP_DISABLED, /readyz remains 503. No authorization-
  code login, production goal execution or readiness 200 is claimed.
- Production read replica still reports sam absent and proposed restricted
  sam_runtime LOGIN absent. No backup/restore API was available in this session;
  the owner's last screenshot is not promoted to completed-backup evidence.
- Existing development dashboard still renders its authentication gate; the
  signed-in UI was not verified. No new UI was created or exposed.

No affected release workflow exists locally to restart; current development
services are unchanged. This correction is not active in the published build
and does not authorize republishing. The earliest unavoidable external action
is platform correction of native custom-schema migration scope, with an
approved isolated restore method before any production change. Existing
backlog already tracks schema parity and registered Auth0 authorization;
no duplicate implementation tasks are introduced.
