-- 00015_tenant_role_binding
--
-- Server-side tenant binding. Until now a tenant-scoped login chose its own scope
-- through the app.current_org_id / app.current_legal_entity_id session settings, which
-- any session can change with SET. A binding row pins a login to one organisation (and
-- optionally one legal entity); for a bound login the settings are ignored.
--   * sam_role_scope is readable only through the SECURITY DEFINER functions below
--     (RLS enabled, no policies, no grants).
--   * current_org_id() / current_legal_entity_id() keep their signatures, so every
--     existing policy (00008/00009/00011/00013) picks the binding up unchanged.
--   * A login without a binding keeps the settings behaviour (owner, release and
--     development roles). Production tenant logins must be bound: the startup guard
--     (assertSamRoleIsolation) refuses to run an unbound sam_tenant_app member.
--   * Rows are created by deploy/production/provision-roles.sql (needs SAM_ORG_ID and
--     SAM_COMMAND_CENTER_LEGAL_ENTITY_ID in the psql environment).

CREATE TABLE IF NOT EXISTS sam_role_scope (
  role_name       NAME PRIMARY KEY,
  org_id          UUID NOT NULL,
  legal_entity_id UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sam_role_scope ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON sam_role_scope FROM PUBLIC;

DO $mig$ BEGIN EXECUTE format($f$
CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, %1$I, pg_temp AS $body$
  SELECT CASE WHEN EXISTS (SELECT 1 FROM sam_role_scope s WHERE s.role_name = session_user)
    THEN (SELECT s.org_id FROM sam_role_scope s WHERE s.role_name = session_user)
    ELSE NULLIF(pg_catalog.current_setting('app.current_org_id', true), '')::UUID END;
$body$;
$f$, current_schema()); END $mig$;

DO $mig$ BEGIN EXECUTE format($f$
CREATE OR REPLACE FUNCTION current_legal_entity_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, %1$I, pg_temp AS $body$
  SELECT CASE WHEN EXISTS (SELECT 1 FROM sam_role_scope s WHERE s.role_name = session_user)
    THEN (SELECT s.legal_entity_id FROM sam_role_scope s WHERE s.role_name = session_user)
    ELSE NULLIF(pg_catalog.current_setting('app.current_legal_entity_id', true), '')::UUID END;
$body$;
$f$, current_schema()); END $mig$;

DO $mig$ BEGIN EXECUTE format($f$
CREATE OR REPLACE FUNCTION sam_session_is_bound() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, %1$I, pg_temp AS $body$
  SELECT EXISTS (SELECT 1 FROM sam_role_scope s WHERE s.role_name = session_user);
$body$;
$f$, current_schema()); END $mig$;

REVOKE ALL ON FUNCTION sam_session_is_bound() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sam_session_is_bound() TO PUBLIC;
