
export async function nextBusinessId(client: any, entityType: string, orgScopeId: string | null): Promise<string> {
  // Transactional via SELECT FOR UPDATE - never MAX()+1
  await client.query(
    `INSERT INTO business_id_sequences(entity_type, org_scope_id, last_number)
     VALUES ($1, $2, 0) ON CONFLICT (entity_type, org_scope_id) DO NOTHING`,
    [entityType, orgScopeId]
  );
  const res = await client.query(
    `SELECT last_number FROM business_id_sequences WHERE entity_type=$1 AND (org_scope_id=$2 OR (org_scope_id IS NULL AND $2 IS NULL)) FOR UPDATE`,
    [entityType, orgScopeId]
  );
  const next = res.rows[0].last_number + 1;
  await client.query(
    `UPDATE business_id_sequences SET last_number=$1, updated_at=now() WHERE entity_type=$2 AND (org_scope_id=$3 OR (org_scope_id IS NULL AND $3 IS NULL))`,
    [next, entityType, orgScopeId]
  );
  const prefixMap: Record<string,string> = { product:'P', goal:'G', procurement_case:'S', purchase_order:'PO', shipment:'SHP' };
  const prefix = prefixMap[entityType] || entityType.substring(0,2).toUpperCase();
  return `${prefix}${String(next).padStart(6,'0')}`;
}
