import type { DataClassification, ModelUsage } from "../../model-gateway/src/types";

export async function recordModelCall(client: any, input: {
  task: string;
  provider: string;
  model: string;
  modelVersion?: string;
  reasonSelected: string;
  usage?: ModelUsage;
  costUsd?: number;
  latencyMs: number;
  retryCount: number;
  success: boolean;
  verificationResult?: string;
  dataClassification: DataClassification;
}): Promise<string> {
  const tokens = (input.usage?.inputTokens ?? 0) + (input.usage?.outputTokens ?? 0);
  const res = await client.query(
    `INSERT INTO model_calls
      (task,provider,model,model_version,reason_selected,tokens,cost,latency_ms,retry_count,success,verification_result,data_classification)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      input.task,
      input.provider,
      input.model,
      input.modelVersion ?? null,
      input.reasonSelected,
      tokens,
      input.costUsd ?? null,
      input.latencyMs,
      input.retryCount,
      input.success,
      input.verificationResult ?? null,
      input.dataClassification
    ]
  );
  return res.rows[0].id;
}
