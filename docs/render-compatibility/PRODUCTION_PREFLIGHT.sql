-- REVIEW ONLY: not executed against production. Use each nominated existing
-- application login, read-only transaction, correct approved schema/search_path.
-- No credentials, tokens, customer records, goal contents or business data.
BEGIN TRANSACTION READ ONLY;
SELECT current_schema(), current_user = session_user AS direct_login;
SELECT rolsuper, rolbypassrls, rolcreatedb, rolcreaterole, rolreplication
FROM pg_roles WHERE rolname = current_user;
SELECT count(*) AS memberships FROM pg_roles
WHERE rolname <> current_user AND pg_has_role(current_user, oid, 'MEMBER');
SELECT has_schema_privilege(current_schema(),'CREATE') AS schema_create,
       has_database_privilege(current_database(),'CREATE') AS database_create;
SELECT filename, sha256 FROM sam_schema_migrations ORDER BY filename;
SELECT to_regclass('sam_integration_migrations') IS NOT NULL AS integration_ledger_present;
-- Execute separately only if the preceding presence result is true:
-- SELECT filename,sha256 FROM sam_integration_migrations ORDER BY filename;
SELECT current_org_id() IS NOT NULL AS org_bound,
       current_legal_entity_id() IS NOT NULL AS entity_bound;
SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,
 pg_has_role(current_user,c.relowner,'MEMBER') AS owns_relation,
 has_table_privilege(c.oid,'SELECT') AS can_select,
 has_table_privilege(c.oid,'INSERT') AS can_insert,
 has_table_privilege(c.oid,'UPDATE') AS can_update,
 has_table_privilege(c.oid,'DELETE') AS can_delete,
 has_table_privilege(c.oid,'TRUNCATE') AS can_truncate,
 has_table_privilege(c.oid,'TRIGGER') AS can_trigger
FROM pg_class c WHERE c.relnamespace=to_regnamespace(current_schema())
 AND c.relkind IN ('r','p') ORDER BY c.relname;
-- Policy expressions contain configured tenant IDs, not business rows.
-- An authorized operator can evaluate exact matching locally with
-- assertRuntimeTenantBinding and return pass/error code without exposing IDs.
SELECT c.relname,p.polname,p.polpermissive,p.polcmd,
 (SELECT oid FROM pg_roles WHERE rolname=current_user)=ANY(p.polroles) AS direct_policy
FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
WHERE c.relnamespace=to_regnamespace(current_schema()) ORDER BY c.relname,p.polname;
-- Metadata-only registry parity; no model invocation or credentials.
SELECT provider_id,models,capabilities,privacy_class_allowed,
 cost_per_1k_input,cost_per_1k_output FROM model_providers ORDER BY provider_id;
SELECT capability_id,verification_method,required_evidence_fields,independent_query_template
FROM verification_contracts ORDER BY capability_id;
ROLLBACK;
