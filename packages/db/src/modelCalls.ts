import type { DataClassification, ModelUsage } from "../../model-gateway/src/types";

export async function recordModelCall(client: any, input: {
  task: string;
  /** Trusted runtime queue binding; never derived from model output. */
  queueId?: string;
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
  if(input.queueId){
    const scoped=await client.query(`SELECT w.id FROM work_queue w JOIN goals g ON g.id=w.goal_id
      WHERE w.id=$1 AND g.company_scope=current_legal_entity_id()`,[input.queueId]);
    if(scoped.rowCount!==1)throw Error('MODEL_LEDGER_ATTRIBUTION_DENIED');
  }
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
  const id=res.rows[0].id;
  if(input.queueId){
    const attributed=await client.query(`INSERT INTO company_model_call_attributions(model_call_id,queue_id,legal_entity_id)
      SELECT m.id,w.id,g.company_scope FROM model_calls m JOIN work_queue w ON w.id=$2 JOIN goals g ON g.id=w.goal_id
      WHERE m.id=$1 AND m.legal_entity_id=g.company_scope AND g.company_scope=current_legal_entity_id() RETURNING model_call_id`,[id,input.queueId]);
    if(attributed.rowCount!==1)throw Error('MODEL_LEDGER_ATTRIBUTION_DENIED');
  }
  return id;
}
