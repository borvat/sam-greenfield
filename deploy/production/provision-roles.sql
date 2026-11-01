-- SAM self-hosted database role provisioning. Idempotent. Run as the database
-- administrator (the POSTGRES_USER account), AFTER migrations, BEFORE the services.
--
--   psql -v ON_ERROR_STOP=1 -f provision-roles.sql
--
-- Passwords are read from the psql process environment with \getenv (PostgreSQL
-- 15+ psql), never from the command line, so they do not appear in `ps`.
-- Generate them with `openssl rand -hex 32` (hex only: they are placed in a URL).
-- Note: CREATE/ALTER ROLE ... PASSWORD is a SQL statement; keep log_statement
-- at its default ('none') on the database server.
--
-- Identities created:
--   sam_worker          member of sam_runtime_worker + sam_credential_vault   runtime service
--   sam_mcp             member of both group roles     MCP bridge (reads + kernel-backed execution)
--   sam_command_center  member of sam_tenant_app       Command Center
-- Group roles are NOLOGIN. All login roles are non-superuser, non-owner,
-- NOBYPASSRLS, NOCREATEDB, NOCREATEROLE, NOREPLICATION.
-- Row visibility is enforced by the policies in migration 00011.

\set ON_ERROR_STOP on
\getenv worker_pw SAM_WORKER_DB_PASSWORD
\getenv mcp_pw SAM_MCP_DB_PASSWORD
\getenv cc_pw SAM_COMMAND_CENTER_DB_PASSWORD

SELECT (:'worker_pw' = '' OR :'mcp_pw' = '' OR :'cc_pw' = ''
        OR :'worker_pw' = :'mcp_pw' OR :'worker_pw' = :'cc_pw' OR :'mcp_pw' = :'cc_pw') AS bad_passwords \gset
\if :bad_passwords
  DO $$ BEGIN RAISE EXCEPTION 'SAM_WORKER_DB_PASSWORD, SAM_MCP_DB_PASSWORD and SAM_COMMAND_CENTER_DB_PASSWORD must all be set and distinct'; END $$;
\endif

-- Group roles (no login, no privileges of their own beyond the grants below).
SELECT 'CREATE ROLE sam_runtime_worker NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION'
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_runtime_worker') \gexec
SELECT 'CREATE ROLE sam_credential_vault NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION'
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_credential_vault') \gexec
SELECT 'CREATE ROLE sam_tenant_app NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION'
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_tenant_app') \gexec

-- Login roles: created if missing, attributes and password re-applied every run
-- so this script also rotates credentials.
SELECT format('CREATE ROLE sam_worker LOGIN PASSWORD %L', :'worker_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_worker') \gexec
SELECT format('CREATE ROLE sam_mcp LOGIN PASSWORD %L', :'mcp_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_mcp') \gexec
SELECT format('CREATE ROLE sam_command_center LOGIN PASSWORD %L', :'cc_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sam_command_center') \gexec

SELECT format('ALTER ROLE sam_worker WITH LOGIN PASSWORD %L NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT', :'worker_pw') \gexec
SELECT format('ALTER ROLE sam_mcp WITH LOGIN PASSWORD %L NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT', :'mcp_pw') \gexec
SELECT format('ALTER ROLE sam_command_center WITH LOGIN PASSWORD %L NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT', :'cc_pw') \gexec

-- Exact memberships: revoke first so a changed script also removes stale grants.
SELECT format('REVOKE %I FROM %I', g.rolname, m.rolname)
  FROM pg_auth_members am
  JOIN pg_roles g ON g.oid = am.roleid AND g.rolname IN ('sam_runtime_worker', 'sam_tenant_app', 'sam_credential_vault')
  JOIN pg_roles m ON m.oid = am.member AND m.rolname IN ('sam_worker', 'sam_mcp', 'sam_command_center') \gexec
GRANT sam_runtime_worker, sam_credential_vault TO sam_worker;
GRANT sam_runtime_worker, sam_tenant_app TO sam_mcp;
GRANT sam_tenant_app TO sam_command_center;

-- Start from nothing, then grant exactly what the code paths need.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM sam_runtime_worker, sam_tenant_app, sam_credential_vault;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM sam_runtime_worker, sam_tenant_app, sam_credential_vault;
REVOKE ALL ON SCHEMA public FROM sam_runtime_worker, sam_tenant_app, sam_credential_vault;
GRANT USAGE ON SCHEMA public TO sam_runtime_worker, sam_tenant_app, sam_credential_vault;

-- System role: no DELETE, TRUNCATE, TRIGGER or REFERENCES anywhere, and no access
-- to users, organizations or financial_documents.
GRANT SELECT, INSERT, UPDATE ON
  goals, work_queue, outbox_events, side_effect_operations, inbox_events,
  world_facts, memory_records, model_calls, model_providers,
  verification_contracts, approvals, business_id_sequences
  TO sam_runtime_worker;
GRANT SELECT, INSERT ON audit_log, plans, executions, verifications, event_fabric_events
  TO sam_runtime_worker;
-- The kernel takes row locks (SELECT ... FOR UPDATE) on executions and
-- event_fabric_events but never modifies them. PostgreSQL requires UPDATE on at
-- least one column for a row lock, so grant it on the key column only: the rows
-- stay effectively append-only for this role (no UPDATE of any payload/status column).
GRANT UPDATE (id) ON executions, event_fabric_events TO sam_runtime_worker;
GRANT SELECT ON legal_entities, policy_envelopes TO sam_runtime_worker;
GRANT USAGE, SELECT ON SEQUENCE global_event_seq_seq TO sam_runtime_worker;

-- Credential vault: ONLY the runtime worker (via sam_credential_vault). The MCP bridge
-- and the Command Center never receive it. Secret columns are insert-only; the sole
-- UPDATE allowed is revocation.
GRANT SELECT, INSERT ON credential_vault TO sam_credential_vault;
GRANT UPDATE (status, revoked_by, revoked_at) ON credential_vault TO sam_credential_vault;
GRANT SELECT ON legal_entities TO sam_credential_vault;

-- Tenant role: reads what the owner surfaces display; writes only goals, the
-- append-only audit log and the shared id counters.
GRANT SELECT ON
  organizations, legal_entities, users, financial_documents, plans, work_queue,
  executions, verifications, side_effect_operations, approvals
  TO sam_tenant_app;
GRANT SELECT, INSERT, UPDATE ON goals, business_id_sequences TO sam_tenant_app;
GRANT SELECT, INSERT ON audit_log TO sam_tenant_app;
