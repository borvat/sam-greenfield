
import { Pool, type PoolClient } from 'pg';

if(!process.env.DATABASE_URL?.trim()){
  throw new Error(process.env.NODE_ENV==="production" ?
    "DATABASE_URL_REQUIRED_IN_PRODUCTION" : "DATABASE_URL_REQUIRED");
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Transactional helper for outbox pattern
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
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
  client: PoolClient,
  context: { orgId?: string | null; legalEntityId?: string | null }
): Promise<void> {
  await client.query(
    "SELECT set_config('app.current_org_id', $1, true), set_config('app.current_legal_entity_id', $2, true)",
    [context.orgId ?? "", context.legalEntityId ?? ""]
  );
}

export async function withTenantTransaction<T>(
  context: { orgId?: string | null; legalEntityId?: string | null },
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  return withTransaction(async (client) => {
    await setTenantContext(client, context);
    return fn(client);
  });
}
