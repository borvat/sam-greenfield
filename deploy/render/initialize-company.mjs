import pg from 'pg';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const databaseUrl = required('DATABASE_URL');
  const orgId = required('SAM_ORG_ID');
  const entityId = required('SAM_COMMAND_CENTER_LEGAL_ENTITY_ID');
  const orgName = required('SAM_ORG_NAME');
  const entityName = required('SAM_LEGAL_ENTITY_NAME');
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(orgId) || !uuid.test(entityId)) throw new Error('Company IDs must be UUIDs');

  const client = new pg.Client({connectionString: databaseUrl});
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended('sam_render_company_onboarding',0))");
    await client.query("SELECT set_config('app.current_org_id',$1,true), set_config('app.current_legal_entity_id',$2,true)", [orgId, entityId]);
    await client.query('INSERT INTO organizations(id,name) VALUES($1,$2) ON CONFLICT(id) DO NOTHING', [orgId, orgName]);
    const org = await client.query('SELECT name FROM organizations WHERE id=$1', [orgId]);
    if (org.rowCount !== 1 || org.rows[0].name !== orgName) throw new Error('Organization identity conflict');
    await client.query("INSERT INTO legal_entities(id,org_id,name,jurisdiction,status) VALUES($1,$2,$3,'NL','ACTIVE') ON CONFLICT(id) DO NOTHING", [entityId, orgId, entityName]);
    const entity = await client.query('SELECT org_id,name,status FROM legal_entities WHERE id=$1', [entityId]);
    if (entity.rowCount !== 1 || entity.rows[0].org_id !== orgId || entity.rows[0].name !== entityName || entity.rows[0].status !== 'ACTIVE') {
      throw new Error('Legal entity identity conflict');
    }
    await client.query('COMMIT');
    console.log('SAM COMPANY INITIALIZATION PASS');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(() => {
  // Never print connection strings or raw provider errors.
  console.error('SAM company initialization failed; check required configuration and company identity.');
  process.exit(1);
});
