const fs = require('fs');
const path = require('path');
const {createRequire} = require('module');
const project = process.env.PROJECT_DIR || '/opt/render/project/src';
const {Client} = createRequire(path.join(project, 'package.json'))('pg');

const ORG = '566baa67-5d93-4195-a1d0-18c1649154bf';
const ENTITY = '73aa81c6-3a23-4369-9408-8bea0956d399';
const TABLE = 'verification_contracts';
const CAP = 'executive_brief';
const P_UP = 'eb_evidence_update';
const q = (id) => `"${String(id).replace(/"/g, '""')}"`;

const WANTED = {callId: 'string', factsHash: 'string', provider: 'string', model: 'string', tokens: 'number', success: 'boolean'};

const CTX = `SELECT set_config('app.current_org_id',$1,true) AS org_set,
  set_config('app.current_legal_entity_id',$2,true) AS entity_set,
  current_org_id()::text AS org_now, current_legal_entity_id()::text AS entity_now`;

const SNAP = `SELECT (SELECT relrowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass) AS rls_enabled,
  (SELECT relforcerowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass) AS rls_forced,
  (SELECT string_agg(polname||':'||polcmd::text||':'||polpermissive::text,',' ORDER BY polname)
     FROM pg_policy WHERE polrelid='${TABLE}'::regclass) AS policies`;

const ROW = `SELECT capability_id, verification_method, must_not_trust_execution_result,
  required_evidence_fields, independent_query_template
  FROM ${TABLE} WHERE capability_id='${CAP}'`;

const APPLY = `UPDATE ${TABLE}
   SET required_evidence_fields='{"callId":"string","factsHash":"string","provider":"string","model":"string","tokens":"number","success":"boolean"}'::jsonb
 WHERE capability_id='${CAP}'`;

const sameFields = (got, want) => {
  if (!got || typeof got !== 'object') return false;
  const keys = Object.keys(got).sort();
  if (keys.join(',') !== Object.keys(want).sort().join(',')) return false;
  return keys.every((k) => got[k] === want[k]);
};

(async () => {
  const url = fs.readFileSync(0, 'utf8').trim();
  if (!url) throw new Error('no connection string');
  const client = new Client({connectionString: url, connectionTimeoutMillis: 15000});
  await client.connect();
  const out = {};
  try {
    await client.query('BEGIN');
    out.context = (await client.query(CTX, [ORG, ENTITY])).rows[0];
    out.snapshot_before = (await client.query(SNAP)).rows[0];
    out.before = (await client.query(ROW)).rows[0] ?? null;
    const who = (await client.query('SELECT current_user AS u')).rows[0].u;
    await client.query(`CREATE POLICY ${P_UP} ON ${TABLE} AS PERMISSIVE FOR UPDATE TO ${q(who)} USING (capability_id='${CAP}') WITH CHECK (capability_id='${CAP}')`);
    const applied = await client.query(APPLY);
    out.changed = applied.rowCount;
    const row = (await client.query(ROW)).rows[0] ?? null;
    out.after = row;
    const fieldsOk = sameFields(row && row.required_evidence_fields, WANTED);
    const queryOk = Boolean(row && row.independent_query_template && String(row.independent_query_template.query || '').includes('executive_briefing:'));
    const metaOk = Boolean(row && row.verification_method === 'db_query' && row.must_not_trust_execution_result === true && row.capability_id === CAP);
    await client.query(`DROP POLICY ${P_UP} ON ${TABLE}`);
    const left = (await client.query(`SELECT count(*)::int n FROM pg_policy WHERE polrelid='${TABLE}'::regclass AND polname='${P_UP}'`)).rows[0].n;
    const afterSnap = (await client.query(SNAP)).rows[0];
    out.snapshot_after = afterSnap;
    out.checks = {
      changed_one_row: out.changed === 1,
      evidence_fields_exact: fieldsOk,
      independent_query_present: queryOk,
      row_meta_intact: metaOk,
      temp_policy_removed: left === 0,
      policies_unchanged: afterSnap.policies === out.snapshot_before.policies,
      rls_flags_unchanged: afterSnap.rls_enabled === out.snapshot_before.rls_enabled && afterSnap.rls_forced === out.snapshot_before.rls_forced,
    };
    if (!Object.values(out.checks).every(Boolean)) throw new Error('POST_CHECK_FAILED');
    await client.query('COMMIT');
    out.committed = true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    out.committed = false;
    out.error = {sqlstate: error.code || null, message: String(error.message).slice(0, 160)};
  } finally {
    await client.end().catch(() => {});
  }
  console.log(JSON.stringify(out, null, 1));
  process.exit(out.committed ? 0 : 1);
})();
