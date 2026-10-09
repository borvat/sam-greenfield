
import { Pool } from 'pg';

if(process.env.NODE_ENV==="production"&&!process.env.DATABASE_URL){
  throw new Error("DATABASE_URL_REQUIRED_IN_PRODUCTION");
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sam_greenfield'
});

// Transactional helper for outbox pattern
export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function setTenantContext(
  client: any,
  context: { orgId?: string | null; legalEntityId?: string | null }
): Promise<void> {
  await client.query(
    "SELECT set_config('app.current_org_id', $1, true), set_config('app.current_legal_entity_id', $2, true)",
    [context.orgId ?? "", context.legalEntityId ?? ""]
  );
}

export async function withTenantTransaction<T>(
  context: { orgId?: string | null; legalEntityId?: string | null },
  fn: (client: any) => Promise<T>
): Promise<T> {
  return withTransaction(async (client) => {
    await setTenantContext(client, context);
    return fn(client);
  });
}
