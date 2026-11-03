/**
 * The last accepted brief is kept in the existing audit trail so the owner still sees a real
 * analysis after a restart or when the remaining budget cannot pay for a new call.
 * No schema change: audit_log already carries action, entity and a jsonb snapshot.
 */
export interface StoredBrief {
  analysis: unknown;
  receipt: unknown;
  facts: unknown;
  savedAt: string;
}

const ACTION = 'EXECUTIVE_BRIEF_V1';

async function withClient<T>(legalEntityId: string, fn: (client: any) => Promise<T>): Promise<T> {
  const {pool} = await import('../../../packages/db/src/client');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("select set_config('app.current_legal_entity_id',$1,true)", [legalEntityId]);
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function saveBrief(legalEntityId: string, lang: string, brief: {analysis: unknown; receipt: unknown; facts: unknown}): Promise<void> {
  await withClient(legalEntityId, async (client) => {
    await client.query(
      `insert into audit_log(actor, action, entity_type, entity_id, after_ref, source, result, timestamp)
       values('command-center',$1,'legal_entity',$2,$3::jsonb,'command-center','MODEL',now())`,
      [ACTION, legalEntityId, JSON.stringify({lang, analysis: brief.analysis, receipt: brief.receipt, facts: brief.facts})],
    );
  });
}

export async function loadBrief(legalEntityId: string, lang: string): Promise<StoredBrief | null> {
  return withClient(legalEntityId, async (client) => {
    const res = await client.query(
      `select after_ref, to_char(timestamp, 'YYYY-MM-DD"T"HH24:MI:SSOF') as saved_at
         from audit_log
        where action=$1 and entity_type='legal_entity' and entity_id=$2 and after_ref->>'lang'=$3
        order by timestamp desc limit 1`,
      [ACTION, legalEntityId, lang],
    );
    const row = res.rows[0];
    if (!row) return null;
    const snap = row.after_ref || {};
    return {analysis: snap.analysis ?? null, receipt: snap.receipt ?? null, facts: snap.facts ?? null, savedAt: row.saved_at};
  });
}
