const fs = require('fs');
const path = require('path');
const {createRequire} = require('module');
const project = process.env.PROJECT_DIR;
const {Client} = createRequire(path.join(project, 'package.json'))('pg');

const ORG = '566baa67-5d93-4195-a1d0-18c1649154bf';
const ENTITY = '73aa81c6-3a23-4369-9408-8bea0956d399';

const POLICIES = `SELECT (SELECT relrowsecurity FROM pg_class WHERE oid='verification_contracts'::regclass) AS rls_enabled,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='verification_contracts'::regclass) AS rls_forced,
       current_user AS connected_user,
       has_table_privilege('verification_contracts','INSERT') AS can_insert,
       (SELECT count(*) FROM pg_policy WHERE polrelid='verification_contracts'::regclass AND polcmd IN ('a','w')) AS write_policies,
       (SELECT string_agg(polname, ',') FROM pg_policy WHERE polrelid='verification_contracts'::regclass) AS policy_names`;

const CONTEXT = `SELECT set_config('app.current_org_id', $1, true) AS org_set,
       set_config('app.current_legal_entity_id', $2, true) AS entity_set,
       current_org_id()::text AS org_now,
       current_legal_entity_id()::text AS entity_now`;

const BEFORE = `SELECT capability_id, verification_method, must_not_trust_execution_result,
       required_evidence_fields, independent_query_template
  FROM verification_contracts WHERE capability_id = 'executive_brief'`;

const APPLY = `INSERT INTO verification_contracts
  (capability_id, description, verification_method, required_evidence_fields, independent_query_template, must_not_trust_execution_result)
VALUES ('executive_brief',
  'An executive brief is verified only when its trace id names a stored model_calls row for this company, that call succeeded with billed tokens, and the stored brief keeps the same facts hash.',
  'db_query',
  '{"callId":"uuid","factsHash":"string","provider":"string","model":"string","tokens":"integer"}'::jsonb,
  '{"query":"select id,provider,model,tokens,cost,success,legal_entity_id from model_calls where task like (''executive_briefing:''||$1||'':%'') order by created_at desc limit 1"}'::jsonb,
  true)
ON CONFLICT (capability_id) DO UPDATE SET
  description = EXCLUDED.description,
  verification_method = EXCLUDED.verification_method,
  required_evidence_fields = EXCLUDED.required_evidence_fields,
  independent_query_template = EXCLUDED.independent_query_template,
  must_not_trust_execution_result = true`;

const AFTER = `SELECT capability_id, verification_method, must_not_trust_execution_result,
       required_evidence_fields->>'callId' AS call_id_type,
       required_evidence_fields->>'factsHash' AS facts_hash_type,
       independent_query_template->>'query' AS independent_query,
       created_at
  FROM verification_contracts WHERE capability_id = 'executive_brief'`;

(async () => {
  const url = fs.readFileSync(0, 'utf8').trim();
  if (!url) throw new Error('no connection string');
  const client = new Client({connectionString: url, connectionTimeoutMillis: 15000});
  await client.connect();
  const out = {};
  try {
    out.policies = (await client.query(POLICIES)).rows;
    await client.query('BEGIN');
    out.context = (await client.query(CONTEXT, [ORG, ENTITY])).rows[0];
    out.before = (await client.query(BEFORE)).rows;
    const applied = await client.query(APPLY);
    out.changed = applied.rowCount;
    out.after = (await client.query(AFTER)).rows;
    await client.query('COMMIT');
    out.committed = true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    out.committed = false;
    out.error = {sqlstate: error.code || null, message: String(error.message).slice(0, 160)};
    out.policies = (await client.query(POLICIES).catch(() => ({rows: out.policies || []}))).rows;
  } finally {
    await client.end().catch(() => {});
  }
  console.log(JSON.stringify(out, null, 1));
  process.exit(out.committed ? 0 : 1);
})();
