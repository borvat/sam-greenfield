# Isolated provisioning and recovery candidate

Base: PR50, `7df84a3913125896256c5b3039cf7f8cae28b8e1`. This work prepares operator APIs and synthetic rehearsals. It does not authorize or perform production provisioning, deployment, credentials, live providers or merging. PR50's denied merge has not been retried. PR49 public lookup activation is excluded.

## Known production facts and unresolved inputs

Parent's authorized read-only preflight found the 14 historical migration hashes matching deployed `af4be2e50215d5646a221fb82068bf939df0f311`, no integration ledger, and a runtime login owning all 30 inspected tables with CREATEDB, CREATEROLE, CREATE and membership privileges. No inspected table had FORCE RLS; some Google/OAuth tables had no RLS. That login cannot pass candidate admission and must not be reused. These facts were supplied by the parent, not newly queried here.

Actual MCP login and configuration remain unverified. An empty diagnostic session's tenant settings do not establish an application defect: `withTenantTransaction` sets local context. Runtime environment absence also does not establish absence in MCP. Required nonsecret operator inputs are the actual schema, organization/entity IDs, two dedicated runtime/MCP role names, Google owner/client binding, OAuth resource and exact retained OAuth client IDs. Never infer tenant ownership from possession of a token. Unknown clients stay unmapped and inaccessible.

## Grant and policy matrix

All application roles must be pristine, ordinary LOGINs: no object ownership, privileged flags, memberships, database/schema CREATE or pre-existing data grants. The operator creates these separately only after approval. The helper neither creates roles nor handles passwords. Verify other schemas and PUBLIC grants too; the helper checks existing object grants in the nominated schema, not every database on the cluster.

| Relations | Runtime | MCP | Boundary |
| --- | --- | --- | --- |
| Core operational tables listed in `runtimeTables` | SELECT/INSERT/UPDATE | Same | Existing core policies plus immutable organization/entity fence, FORCE RLS; no DELETE/TRUNCATE/TRIGGER |
| Approvals | Request PENDING; consume approved unexpired uses | Same | Cannot self-approve, alter approval authority or reset consumption; per-role trigger requires exactly one use |
| Organizations, legal entities, provider/verification registries | SELECT | SELECT | Fixed tenant; no registry writes |
| `global_event_seq_seq` | USAGE/SELECT | Same | No grant on every sequence |
| Integration knowledge/reviews/polls/observations/notification receipts | SELECT and existing explicit INSERT grants | Same | Existing provenance and fixed tenant policies; column-limited updates only |
| Capability bindings, perception sources, notification settings | Existing explicit reads/limited polling updates | Same | No capability granting or notification delivery permission |
| Google tokens | SELECT; update sealed refresh/access cache and expiry/time | Same plus INSERT and discovered-tools update | Exact owner/client and fixed tenant; no DELETE or owner/client reassignment |
| Google OAuth states | None | SELECT/INSERT/DELETE | Exact owner/client and fixed tenant; one-use state |
| Internal OAuth clients | None | SELECT/INSERT | Explicit organization/entity mapping; historical NULL mappings quarantined |
| Internal OAuth requests/codes/refresh tokens | None | SELECT/INSERT/DELETE | Exact resource and visible mapped client; one-use code/refresh behavior retained |
| Migration ledgers and service bindings | None | None | Operator only |

Source of exact grants: `packages/db/src/serviceAccess.ts`, `integrationProfile.ts`, `runtimeAccess.ts`. This is a service-scoped extension of existing core admission, not general token-store access. No runtime startup calls the provisioner. Google store encryption and authentication behavior are unchanged.

## Proposed production actions — require later approval

1. Confirm actual runtime and MCP configurations and principals using metadata only. Confirm tenant/client mapping, complete intended provider and verification manifests, and operator authority to migrate under FORCE RLS. Do not print secrets. Establish a recoverable backup and authorized maintenance window. Quiesce both old services before applying FORCE RLS: it can immediately block their current owner login.
2. Under the separately authorized migration operator, verify all 14 historical hashes and run the existing core migrator. Expected core ledger: 16. Apply `applyIntegrationProfile`: adopt the four hash-matching historical migration receipts without replaying DDL, then apply the four required integration migrations. Expected integration ledger: 8. Any mismatch is a stop, not a ledger-edit instruction.
3. Call `applyServiceProfile` using the nominated schema/search path. It applies the single operator-only `00109_service_principals.sql` with its own hashed service ledger. Restart is idempotent; a changed hash fails. Existing OAuth clients remain NULL-mapped.
4. In an explicit operator transaction, call `adoptOAuthClients` with reviewed exact client IDs and tenant; rollback on any error. Before enabling FORCE RLS, finish all approved adoption mappings. Do not bulk-map unknown clients.
5. Using separately approved fresh LOGINs, wrap each `provisionServiceAccess` call in BEGIN/COMMIT with ROLLBACK on error. Supply all validated `ServicePrincipal` fields. Do not call it as an autocommit sequence. It refuses already-bound roles rather than accumulating grants; migration restart does not mean reprovisioning a role.
6. Establish fixed tenant settings on **every connection**, including startup admission and OAuth/Google store pools, using approved connection options or approved per-role settings. Transaction-local context in core operations remains valid but alone does not configure independent store/startup queries. Run `assertIntegrationAccess` independently through both actual service logins. Confirm no cross-tenant reads/writes, privileged flags, memberships or ownership. Do not fall back to the old owner.
7. Compare the complete nominated registry using `assertExactRegistryParity`. This read-only check includes pinned model prices and every contract field, including `must_not_trust_execution_result = true`. It does not overwrite registries or reset health. Any required registry writes need a separately reviewed operator change; no fixture registry belongs in production.
8. Only after separate deployment approval: use the existing manual two-service Render path and `deploy/render/start.sh runtime` / `mcp`. Bring runtime up with its restricted login, inspect readiness and authenticated status, then MCP with its distinct restricted login and existing OAuth/Google configuration. Read back exact deployed SHA, auth rejection, authorized tool catalog/route contract and tenant admission. Synthetic route evidence is not evidence of live Google/bol use. No new evaluation adapter or provider activation is included.

The helpers are operator APIs, deliberately not unattended startup migrations. The new profile does not change the core/integration manifest counts. No production commands in this document have been executed.

## Recovery and rollback limits

The old deployed `af4be2e` launcher is incompatible with the upgraded core ledger. Do not roll back to it or delete migration receipts. A bounded application rollback source is pinned in `tests/fixtures/rollback/pr50-source.tar.gz`, manifest source `7df84a3`, archive SHA256 `8ab8d602b6a6f76dd61d9709247d062d60dbfa047127d5e44688b8de6dd685b7`. It contains tracked PR50 application/launcher source and lockfile, no dependencies, credentials or production data. Build it using the pinned lockfile; it is not an already deployed image.

The rehearsal starts that unchanged source in production mode twice, for both services, against the upgraded schema and new restricted principals. It checks readiness, authenticated runtime status, unauthenticated MCP rejection and graceful shutdown. Synthetic composition deliberately throws if a provider is invoked. This proves bounded startup compatibility, not compatibility with uninspected production MCP configuration. Keep the upgraded schema, policies and restricted principals on application rollback; do not restore owner credentials or weaken RLS.

For database recovery, `provisioning-backup.cjs` uses `pg_dump`/`pg_restore` of synthetic historical data into a **separate quarantine database**. It verifies the original 14 hashes/timestamps and sentinel, while leaving the upgraded 16-entry database intact. No application starts against the recovery database. A production restore must likewise be separately approved, validated and reconciled for writes since backup; it is not automatic downmigration, zero-loss recovery or authorization to overwrite production.

## Evidence and remaining gates

See ACCEPTANCE.md for final exact tested/published sources and external results. Existing PR50 acceptance remains preserved. New tests use disposable PostgreSQL, synthetic encrypted tokens and static adapters; no production principal, live model reasoning, Google authorization or real business transaction is certified. Hosted Actions billing is an external limitation, not a reason to rerun unchanged test bodies or claim hosted success. Actual MCP configuration/principal, reviewed tenant mappings, complete registry parity and approved production backup/cutover actions remain prerequisites. No arbitrary additional soak or invented human-only review is required by this work.
