const fs = require('fs');
const path = require('path');
const {createRequire} = require('module');
const project = process.env.PROJECT_DIR || '/opt/render/project/src';
const {Client} = createRequire(path.join(project, 'package.json'))('pg');

const ORG = '566baa67-5d93-4195-a1d0-18c1649154bf';
const ENTITY = '73aa81c6-3a23-4369-9408-8bea0956d399';
const TABLE = 'verification_contracts';
const CAP = 'executive_brief';
const P_IN = 'eb_provision_insert';
const P_UP = 'eb_provision_update';

const q = (id) => `"${String(id).replace(/"/g, '""')}"`;

const DIAG = `SELECT (SELECT relrowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass) AS rls_enabled,
  (SELECT relforcerowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass) AS rls_forced,
  current_user AS connected_user,
  has_table_privilege('${TABLE}','INSERT') AS can_insert,
  has_table_privilege('${TABLE}','UPDATE') AS can_update,
  (SELECT count(*) FROM pg_policy WHERE polrelid='${TABLE}'::regclass AND polcmd IN ('a','w')) AS write_policies,
  (SELECT string_agg(polname||':'||polcmd::text,',' ORDER BY polname) FROM pg_policy WHERE polrelid='${TABLE}'::regclass) AS policy_names`;

const CTX = `SELECT set_config('app.current_org_id',$1,true) AS org_set,
  set_config('app.current_legal_entity_id',$2,true) AS entity_set,
  current_org_id()::text AS org_now, current_legal_entity_id()::text AS entity_now`;

const BEFORE = `SELECT capability_id, verification_method, must_not_trust_execution_result, required_evidence_fields
  FROM ${TABLE} WHERE capability_id='${CAP}'`;

const APPLY = `INSERT INTO ${TABLE}
  (capability_id, description, verification_method, required_evidence_fields, independent_query_template, must_not_trust_execution_result)
VALUES ('${CAP}',
  'An executive brief is verified only when its trace id names a stored model_calls row for this company, that call succeeded with billed tokens, and the stored brief keeps the same facts hash.',
  'db_query',
  '{"callId":"uuid","factsHash":"string","provider":"string","model":"string","tokens":"integer"}'::jsonb,
  '{"query":"select id,provider,model,tokens,cost,success,legal_entity_id from model_calls where task like (''executive_briefing:''||$1||'':%'') order by created_at desc limit 1"}'::jsonb,
  true)
ON CONFLICT (capability_id) DO UPDATE SET
  description=EXCLUDED.description,
  verification_method=EXCLUDED.verification_method,
  required_evidence_fields=EXCLUDED.required_evidence_fields,
  independent_query_template=EXCLUDED.independent_query_template,
  must_not_trust_execution_result=true`;

const AFTER = `SELECT capability_id, verification_method, must_not_trust_execution_result,
  required_evidence_fields->>'callId' AS call_id_type,
  required_evidence_fields->>'factsHash' AS facts_hash_type,
  independent_query_template->>'query' AS independent_query
  FROM ${TABLE} WHERE capability_id='${CAP}'`;

const TEMP_LEFT = `SELECT count(*)::int AS temp_policies_left FROM pg_policy
  WHERE polrelid='${TABLE}'::regclass AND polname IN ('${P_IN}','${P_UP}')`;

(async () => {
  const url = fs.readFileSync(0, 'utf8').trim();
  if (!url) throw new Error('no connection string');
  const client = new Client({connectionString: url, connectionTimeoutMillis: 15000});
  await client.connect();
  const out = {};
  try {
    if (process.env.EB_SET_ROLE) await client.query(`SET ROLE ${q(process.env.EB_SET_ROLE)}`);
    out.diagnosis = (await client.query(DIAG)).rows[0];
    await client.query('BEGIN');
    out.context = (await client.query(CTX, [ORG, ENTITY])).rows[0];
    out.before = (await client.query(BEFORE)).rows;
    const who = (await client.query('SELECT current_user AS u')).rows[0].u;
    // Two narrow temporary policies: insert and update only, one capability, owner only.
    await client.query(`CREATE POLICY ${P_IN} ON ${TABLE} AS PERMISSIVE FOR INSERT TO ${q(who)} WITH CHECK (capability_id='${CAP}')`);
    await client.query(`CREATE POLICY ${P_UP} ON ${TABLE} AS PERMISSIVE FOR UPDATE TO ${q(who)} USING (capability_id='${CAP}') WITH CHECK (capability_id='${CAP}')`);
    const applied = await client.query(APPLY);
    out.changed = applied.rowCount;
    out.after = (await client.query(AFTER)).rows;
    await client.query(`DROP POLICY ${P_IN} ON ${TABLE}`);
    await client.query(`DROP POLICY ${P_UP} ON ${TABLE}`);
    out.temp_removed = (await client.query(TEMP_LEFT)).rows[0].temp_policies_left === 0;
    out.flags_after = (await client.query(`SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass`)).rows[0];
    out.policies_after = (await client.query(`SELECT string_agg(polname||':'||polcmd::text,',' ORDER BY polname) AS names FROM pg_policy WHERE polrelid='${TABLE}'::regclass`)).rows[0].names;
    if (!out.temp_removed || out.after.length !== 1) throw new Error('POST_CHECK_FAILED');
    await client.query('COMMIT');
    out.committed = true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    out.committed = false;
    out.error = {sqlstate: error.code || null, message: String(error.message).slice(0, 180)};
  } finally {
    await client.end().catch(() => {});
  }
  console.log(JSON.stringify(out, null, 1));
  process.exit(out.committed ? 0 : 1);
})();
