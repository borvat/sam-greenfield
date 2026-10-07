export interface WorldFact {
  id: string;
  entity_type: string;
  entity_id: string;
  domain: string;
  attribute: string;
  value: unknown;
  scope: unknown;
  source_timestamp: Date;
  confidence: number;
  event_seq_ref: number | null;
}

export async function loadVerifiedWorldModel(
  client: any,
  entityType: string,
  entityId: string
): Promise<WorldFact[]> {
  const res = await client.query(
    `SELECT DISTINCT ON (entity_type, entity_id, attribute, scope)
            id, entity_type, entity_id, domain, attribute, value, scope,
            source_timestamp, confidence, event_seq_ref
       FROM world_facts
      WHERE entity_type=$1
        AND entity_id=$2
        AND status='VERIFIED'
        AND superseded_at IS NULL
      ORDER BY entity_type,
               entity_id,
               attribute,
               scope,
               source_timestamp DESC,
               confidence DESC,
               event_seq_ref DESC NULLS LAST,
               id DESC`,
    [entityType, entityId]
  );
  return res.rows;
}
