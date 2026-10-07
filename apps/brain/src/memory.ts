export type MemoryType = "OPERATIONAL" | "COMMERCIAL" | "OWNER_DECISION" | "FORMAL_RULE";

export async function appendMemoryObservation(
  client: any,
  input: {
    type: MemoryType;
    statement: string;
    scope?: Record<string, unknown>;
    source: string;
    confidence?: number;
  }
): Promise<string> {
  const res = await client.query(
    `INSERT INTO memory_records(type, statement, scope, source, confidence, status)
     VALUES ($1,$2,$3::jsonb,$4,$5,'OBSERVED')
     RETURNING id`,
    [
      input.type,
      input.statement,
      JSON.stringify(input.scope ?? {}),
      input.source,
      input.confidence ?? 0.5
    ]
  );
  return res.rows[0].id;
}

export async function loadApprovedMemory(client: any, limit = 200) {
  const res = await client.query(
    `SELECT *
       FROM memory_records
      WHERE status IN ('REINFORCED','APPROVED_RULE')
      ORDER BY last_confirmed_at DESC, confidence DESC, id DESC
      LIMIT $1`,
    [limit]
  );
  return res.rows;
}
