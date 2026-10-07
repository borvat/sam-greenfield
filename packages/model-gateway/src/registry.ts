import type { DataClassification, ProviderConfig } from "./types";

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export async function loadProviderRegistry(client: any): Promise<ProviderConfig[]> {
  const res = await client.query(
    `SELECT provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed,health
       FROM model_providers
      ORDER BY provider_id`
  );

  return res.rows.map((row: any) => ({
    providerId: row.provider_id,
    models: toArray<string>(row.models),
    capabilities: toArray<string>(row.capabilities),
    privacyClasses: toArray<DataClassification>(row.privacy_class_allowed),
    health: row.health,
    costPer1kInput: Number(row.cost_per_1k_input ?? 0),
    costPer1kOutput: Number(row.cost_per_1k_output ?? 0)
  }));
}
