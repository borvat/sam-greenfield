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
    // SQL NULL means unconfigured pricing, never a free model. The router
    // excludes nonfinite estimates before admission; explicit zero is retained.
    costPer1kInput: row.cost_per_1k_input==null?NaN:Number(row.cost_per_1k_input),
    costPer1kOutput: row.cost_per_1k_output==null?NaN:Number(row.cost_per_1k_output)
  }));
}
