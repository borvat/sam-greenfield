-- Run with the existing restricted runtime connection, never administrator authority.
-- Every expected_ok must be true; independently compare provider_before metadata.
BEGIN READ ONLY;
SET LOCAL statement_timeout='15s';
SELECT current_user AS role,current_database() AS database,current_schema() AS schema,
 current_org_id() AS org,current_legal_entity_id() AS entity;
SELECT filename,sha256 FROM sam_specialist_migrations ORDER BY filename;
WITH expected(id,field,method) AS (VALUES
 ('derive_verified_evidence','replayed','verified-evidence-replay-v1'),
 ('reason.research','grounded','ordinary-specialist-pointer-replay-v1'),
 ('reason.records','grounded','ordinary-specialist-pointer-replay-v1'))
SELECT e.id,coalesce(v.verification_method='db_query'
 AND v.required_evidence_fields=jsonb_build_object(e.field,'boolean')
 AND v.independent_query_template=jsonb_build_object('method',e.method)
 AND v.must_not_trust_execution_result,false) AS expected_ok
FROM expected e LEFT JOIN verification_contracts v ON v.capability_id=e.id ORDER BY e.id;
SELECT provider_id,models,capabilities,privacy_class_allowed,health,
 cost_per_1k_input,cost_per_1k_output,
 coalesce(cost_per_1k_input=0.0003 AND cost_per_1k_output=0.0012
 AND capabilities @> '["specialist_reasoning"]'::jsonb
 AND models @> '["deepseek-flash"]'::jsonb,false) AS expected_ok
FROM model_providers WHERE provider_id='deepseek';
WITH expected(name) AS (VALUES ('sam_specialist_migrations'),('specialist_budgets'),
 ('specialist_sessions'),('specialist_delegations'),('specialist_learning'))
SELECT name,has_table_privilege(current_user,format('%I.%I',current_schema(),name),'SELECT')
 AND has_table_privilege(current_user,format('%I.%I',current_schema(),name),'INSERT')=(name<>'sam_specialist_migrations')
 AND NOT has_table_privilege(current_user,format('%I.%I',current_schema(),name),'UPDATE')
 AND NOT has_table_privilege(current_user,format('%I.%I',current_schema(),name),'DELETE')
 AND NOT has_table_privilege(current_user,format('%I.%I',current_schema(),name),'TRUNCATE')
 AND NOT has_table_privilege(current_user,format('%I.%I',current_schema(),name),'TRIGGER')
 AND NOT has_table_privilege(current_user,format('%I.%I',current_schema(),name),'REFERENCES') AS expected_ok
FROM expected ORDER BY name;
-- Check each actual column, including that no unintended UPDATE column is granted.
SELECT c.relname,a.attname,has_column_privilege(current_user,c.oid,a.attnum,'UPDATE')=
 ((c.relname='specialist_budgets' AND a.attname IN ('used','cancelled')) OR
  (c.relname='specialist_sessions' AND a.attname IN ('state','used','updated_at'))) AS expected_ok
FROM pg_class c JOIN pg_attribute a ON a.attrelid=c.oid
WHERE c.relnamespace=to_regnamespace(current_schema()) AND a.attnum>0 AND NOT a.attisdropped
 AND c.relname IN ('sam_specialist_migrations','specialist_budgets','specialist_sessions','specialist_delegations','specialist_learning')
ORDER BY c.relname,a.attnum;
COMMIT;
