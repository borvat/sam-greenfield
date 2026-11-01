// Business ids come from next_business_id() (SECURITY DEFINER, migration 00014): the
// counter table is not writable by SAM application roles, and the function row-locks
// the counter inside the caller's transaction - never MAX()+1.
export async function nextBusinessId(client: any, entityType: string, orgScopeId: string | null): Promise<string> {
  const res = await client.query("SELECT next_business_id($1, $2::uuid) AS business_id", [entityType, orgScopeId]);
  return res.rows[0].business_id;
}
