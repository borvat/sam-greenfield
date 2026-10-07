
export async function acquireLease(client: any, queueId: string, owner: string, ttlSeconds: number): Promise<number> {
  const res = await client.query(`SELECT acquire_lease($1,$2,$3) as token`, [queueId, owner, ttlSeconds]);
  return res.rows[0].token;
}

export async function commitWithFencing(client: any, queueId: string, token: number): Promise<boolean> {
  const res = await client.query(`SELECT commit_with_fencing($1,$2) as ok`, [queueId, token]);
  return res.rows[0].ok;
}
