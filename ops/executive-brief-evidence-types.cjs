const fs = require('fs');
const path = require('path');
const {createRequire} = require('module');
const project = process.env.PROJECT_DIR || '/opt/render/project/src';
const {Client} = createRequire(path.join(project, 'package.json'))('pg');

const TABLE = 'verification_contracts';
const CAP = 'executive_brief';
const P_UP = 'eb_evidence_update';
const q = (id) => `"${String(id).replace(/"/g, '""')}"`;

const BEFORE = `SELECT capability_id, required_evidence_fields FROM ${TABLE} WHERE capability_id='${CAP}'`;
const APPLY = `UPDATE ${TABLE}
   SET required_evidence_fields = '{"callId":"string","factsHash":"string","provider":"string","model":"string"}'::jsonb
 WHERE capability_id = '${CAP}'`;
const AFTER = `SELECT capability_id, required_evidence_fields, verification_method, must_not_trust_execution_result
  FROM ${TABLE} WHERE capability_id='${CAP}'`;
const LEFT = `SELECT count(*)::int AS temp_policies_left FROM pg_policy
  WHERE polrelid='${TABLE}'::regclass AND polname='${P_UP}'`;

(async () => {
  const url = fs.readFileSync(0, 'utf8').trim();
  if (!url) throw new Error('no connection string');
  const client = new Client({connectionString: url, connectionTimeoutMillis: 15000});
  await client.connect();
  const out = {};
  try {
    out.before = (await client.query(BEFORE)).rows;
    await client.query('BEGIN');
    const who = (await client.query('SELECT current_user AS u')).rows[0].u;
    await client.query(`CREATE POLICY ${P_UP} ON ${TABLE} AS PERMISSIVE FOR UPDATE TO ${q(who)} USING (capability_id='${CAP}') WITH CHECK (capability_id='${CAP}')`);
    const applied = await client.query(APPLY);
    out.changed = applied.rowCount;
    out.after = (await client.query(AFTER)).rows;
    await client.query(`DROP POLICY ${P_UP} ON ${TABLE}`);
    out.temp_removed = (await client.query(LEFT)).rows[0].temp_policies_left === 0;
    out.flags = (await client.query(`SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='${TABLE}'::regclass`)).rows[0];
    const fields = out.after[0] && out.after[0].required_evidence_fields;
    if (!out.temp_removed || out.changed !== 1 || !fields || fields.callId !== 'string') throw new Error('POST_CHECK_FAILED');
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
