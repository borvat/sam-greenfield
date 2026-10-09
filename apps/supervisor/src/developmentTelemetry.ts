import type {PoolClient} from "pg";
import {estimateScopedUsage,localAlerts,projectHeartbeat,type WorkerHeartbeat} from "./telemetry";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Trusted service config supplies the scope, never HTTP/model/tool arguments.
export async function captureDevelopmentTelemetry(client:PoolClient,entity:string,heartbeat:WorkerHeartbeat){
  if(process.env.SAM_DEVELOPMENT_SAFE_MODE!=="1"||!uuid.test(entity))throw new Error("TELEMETRY_DEVELOPMENT_SCOPE_REQUIRED");
  const meta=(await client.query(`SELECT current_schema() schema,
    current_setting('app.current_org_id',true) org,current_setting('app.current_legal_entity_id',true) entity,
    (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user) bypass,
    EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname=current_schema() AND c.relname IN ('goals','work_queue') AND pg_get_userbyid(c.relowner)=current_user) owns`)).rows[0];
  if(meta.bypass||meta.owns||!/^sam_replit_(autonomy|test_[0-9]+)$/.test(meta.schema)||
    meta.entity!==entity||!uuid.test(meta.org??""))throw new Error("TELEMETRY_ROLE_OR_TENANT_DENIED");
  const queue=(await client.query(`SELECT
    count(*) FILTER(WHERE w.status IN ('QUEUED','HANDBACK') AND (w.due_at IS NULL OR w.due_at<=now()))::int ready,
    coalesce(max(extract(epoch FROM now()-w.created_at)) FILTER(WHERE w.status IN ('QUEUED','HANDBACK')
      AND (w.due_at IS NULL OR w.due_at<=now())),0) oldest,
    count(*) FILTER(WHERE w.status='FAILED')::int failed,
    count(*) FILTER(WHERE w.status IN ('LEASED','EXECUTING') AND w.lease_expiry<now())::int expired
    FROM work_queue w JOIN goals g ON g.id=w.goal_id JOIN legal_entities le ON le.id=g.company_scope
    WHERE g.company_scope=$1 AND le.org_id=$2 AND g.domain='development_probe'`,[entity,meta.org])).rows[0];
  const hasReceipts=(await client.query(`SELECT to_regclass('autonomy_provider_receipts') IS NOT NULL
    AND to_regclass('autonomy_model_claims') IS NOT NULL AND to_regclass('autonomy_session') IS NOT NULL available`)).rows[0].available;
  let provider:ReturnType<typeof estimateScopedUsage>|null=null,truncated=false;
  if(hasReceipts){
    const rows=(await client.query(`SELECT r.model,r.http_status,r.input_tokens,r.output_tokens,r.reasoning_tokens
      FROM autonomy_provider_receipts r JOIN autonomy_model_claims c ON c.id=r.claim_id
      JOIN goals g ON g.id=c.goal_id JOIN autonomy_session s
        ON s.session_id=c.session_id AND s.session_id=g.autonomy_session_id
      WHERE g.company_scope=$1 AND s.legal_entity_id=$1 AND s.org_id=$2 AND g.domain='development_probe'
        AND r.started_at>=now()-interval '24 hours'
      ORDER BY r.started_at DESC,c.id LIMIT 1001`,[entity,meta.org])).rows;
    truncated=rows.length>1000;provider=estimateScopedUsage(rows.slice(0,1000));
    if(truncated)provider.estimatedUpperUsd=null;
  }
  const projected=projectHeartbeat(heartbeat);
  const metrics={heartbeat:projected,ready:Number(queue.ready),oldestReadySeconds:Number(queue.oldest),
    failed:Number(queue.failed),expiredLeases:Number(queue.expired),provider,receiptsTruncated:truncated};
  return {capturedAt:new Date().toISOString(),classification:"LOCAL_READ_ONLY_SCOPED_TELEMETRY",
    ...metrics,alerts:localAlerts(metrics),alertDelivery:"LOCAL_ONLY_NO_OUTBOX_OR_EXTERNAL_NOTIFICATION",
    costCoverage:"SCOPED_AUTONOMY_RECEIPTS_ONLY_LEGACY_MODEL_CALLS_UNATTRIBUTED",
    modelAuthorization:"NOT_CREATED_OR_EXTENDED"};
}
