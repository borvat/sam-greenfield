import type { ProviderConfig } from "./types";

export async function applyRecentFailureCircuitBreaker(
  client: any,
  providers: ProviderConfig[],
  options: { failureThreshold?: number; lookbackMinutes?: number } = {}
): Promise<ProviderConfig[]> {
  const threshold = options.failureThreshold ?? 3;
  const lookbackMinutes = options.lookbackMinutes ?? 15;

  const res = await client.query(
    `WITH ranked AS (
       SELECT provider, success, created_at,
              ROW_NUMBER() OVER (PARTITION BY provider ORDER BY created_at DESC, id DESC) AS rn
         FROM model_calls
        WHERE created_at >= now() - ($1 || ' minutes')::interval
     )
     SELECT provider,
            COUNT(*) FILTER (WHERE rn <= $2 AND success=false)::int AS recent_failures,
            COUNT(*) FILTER (WHERE rn <= $2 AND success=true)::int AS recent_successes
       FROM ranked
      WHERE rn <= $2
      GROUP BY provider`,
    [lookbackMinutes, threshold]
  );

  const stats = new Map(
    res.rows.map((row: any) => [
      row.provider,
      {
        recentFailures: Number(row.recent_failures),
        recentSuccesses: Number(row.recent_successes)
      }
    ])
  );

  return providers.map((provider) => {
    if (provider.health === "DOWN") return provider;
    const stat = stats.get(provider.providerId);
    if (!stat) return provider;

    if (stat.recentFailures >= threshold && stat.recentSuccesses === 0) {
      return { ...provider, health: "DOWN" as const };
    }

    return provider;
  });
}
