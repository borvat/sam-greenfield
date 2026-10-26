import type { Pool, PoolClient } from 'pg';
import { randomBytes, createHash } from 'node:crypto';
import { sha256Hex } from '../../shared/src/stableJson';
import { taskPrompt } from '../../model-providers/src/common';
import type { ModelTask, ProviderResult } from '../../model-gateway/src/types';
import { samIdentityClaims, type SamModelIdentity } from './samIdentity';
import { amount, assertTariff, exactCost, usdToMicrousd, type ExactTariff } from './exactMoney';
import { deny, InfrastructureError } from './security';

export interface SamCallContext {
  goalId: string; queueId: string; executionId?: string; attemptId: string; requestKey: string; approvalId: string;
}
export interface DurableBinding { identity: SamModelIdentity; context: SamCallContext; }
export interface DurableTicket { readonly id: string; }
interface OwnedTicket { id: string; nonce: string; binding: DurableBinding; fingerprint: string; }
const uuid = (v: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
const digest = (v: string) => createHash('sha256').update(v).digest('hex');
function canonicalInput(value: unknown, stack=new Set<object>(), depth=0): string {
  if(depth>64)deny('AI_CONTEXT_INVALID');
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'){if(!Number.isFinite(value))deny('AI_CONTEXT_INVALID');return JSON.stringify(value);}
  if(typeof value!=='object'||stack.has(value))deny('AI_CONTEXT_INVALID');
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype&&Object.getPrototypeOf(value)!==null)deny('AI_CONTEXT_INVALID');
  stack.add(value);
  const result=Array.isArray(value)?'['+Array.from(value,v=>canonicalInput(v,stack,depth+1)).join(',')+']':
    '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalInput((value as any)[k],stack,depth+1)).join(',')+'}';
  stack.delete(value);if(result.length>2000000)deny('AI_CONTEXT_INVALID');return result;
}

export function modelRequestFingerprint(task: ModelTask, context: SamCallContext, scope: {
  actor: string; projectId: string; environment: string;
}): string {
  try {
    if (![context.goalId,context.queueId,context.approvalId].every(uuid) ||
        (context.executionId !== undefined && !uuid(context.executionId)) ||
        !/^[a-zA-Z0-9:_-]{1,128}$/.test(context.attemptId) || !/^[a-zA-Z0-9:_-]{1,128}$/.test(context.requestKey)) deny('AI_CONTEXT_INVALID');
    return sha256Hex({ scope, context, request: { task: task.task, capability: task.capability,
      dataClassification: task.dataClassification, inputCanonical: canonicalInput(task.input), maxCostUsd: task.maxCostUsd,
      requiredModels: task.requiredModels, preferredProviders: task.preferredProviders,
      requiredContextTokens:(task as any).requiredContextTokens,requiresToolCalling:(task as any).requiresToolCalling } });
  } catch { deny('AI_CONTEXT_INVALID'); }
}

/** Authoritative extension of SAM model_calls; auxiliary tables contain limits/permissions,
 * never a duplicate spending ledger. All amounts are exact integer micro-USD strings/BigInt.
 */
export class PostgresModelLedger {
  #owned = new WeakMap<object, OwnedTicket>();
  constructor(private readonly pool: Pool) {}
  async #tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    let c: PoolClient | undefined;
    let broken: Error | undefined;
    const onClientError = (error: Error) => { broken = error; };
    // A server restart can leave a stale socket in the pool until its error is
    // delivered. Drain at most the existing idle slots plus one fresh checkout,
    // only before fn runs. Never replay a transaction, a possibly committed
    // reservation, or a provider dispatch.
    const checkoutLimit = this.pool.idleCount + 1;
    for (let attempt = 0; attempt < checkoutLimit; attempt++) {
      const candidate = await this.pool.connect().catch(() => deny('AI_LEDGER_UNAVAILABLE'));
      candidate.on('error', onClientError);
      try { await candidate.query('BEGIN'); c = candidate; break; }
      catch {
        candidate.release(new Error('AI_LEDGER_CONNECTION_BROKEN'));
        candidate.removeListener('error', onClientError);
        broken = undefined;
      }
    }
    if (!c) deny('AI_LEDGER_UNAVAILABLE');
    try { await c.query("SET LOCAL lock_timeout='5s'");
      const value = await fn(c); await c.query('COMMIT'); return value;
    } catch (e) { try { await c.query('ROLLBACK'); } catch { broken = new Error('AI_LEDGER_CONNECTION_BROKEN'); }
      if (!(e instanceof InfrastructureError)) broken ??= new Error('AI_LEDGER_CONNECTION_BROKEN');
      if (e instanceof InfrastructureError) throw e; deny('AI_LEDGER_UNAVAILABLE');
    } finally { c.release(broken); c.removeListener('error', onClientError); }
  }
  async #grant(c: PoolClient, binding: DurableBinding) {
    const identity = samIdentityClaims(binding.identity);
    const r = await c.query(`SELECT g.*,p.org_id,p.legal_entity_id,p.enabled AS project_enabled
      FROM sam_ai_service_grants g JOIN sam_ai_project_state p USING(project_id,environment)
      WHERE g.actor=$1 AND p.org_id=$2 AND p.legal_entity_id=$3
      AND g.enabled AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp() AND p.enabled
      FOR SHARE OF g,p`, [identity.actor,identity.orgId,identity.entityId]);
    if (r.rowCount !== 1 || r.rows[0].environment !== 'test') deny('AI_SERVICE_DENIED');
    return r.rows[0];
  }
  async authorize(binding: DurableBinding): Promise<void> { await this.#tx(async c => { await this.#grant(c,binding); }); }
  async #audit(c: PoolClient, grant: any, binding: DurableBinding, action: string, id: string, data: object) {
    await c.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,approval_id,result)
      VALUES($1,$2,$3,'model_call',$4,$5::jsonb,'sam_ai_infrastructure','GREEN',$6,'RECORDED')`,
    [grant.actor,binding.context.goalId,action,id,JSON.stringify(data),binding.context.approvalId]);
  }
  async reserve(binding: DurableBinding, task: ModelTask, candidate: { providerId: string; model: string }): Promise<DurableTicket> {
    // Copies contain only JSON task data; callbacks/AbortSignal are stripped by composition.
    const copied: DurableBinding = { identity: binding.identity, context: { ...binding.context } };
    const nonce = randomBytes(32).toString('hex');
    const result = await this.#tx(async c => {
      const grant = await this.#grant(c,copied);
      if (!/^[a-z][a-z0-9_:-]{0,79}$/.test(task.task)) deny('AI_TASK_TYPE_INVALID');
      const fingerprint = modelRequestFingerprint(task,copied.context,{ actor: grant.actor,projectId: grant.project_id,environment: grant.environment });
      // Per-key lock serializes same-ID requests before content comparison/approval consumption.
      await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [`sam-ai:${grant.environment}:${grant.project_id}:${copied.context.requestKey}`]);
      const previous = await c.query(`SELECT id,ai_content_sha256,ai_state FROM model_calls
        WHERE ai_project_id=$1 AND ai_environment=$2 AND ai_request_key=$3 FOR UPDATE`,
        [grant.project_id,grant.environment,copied.context.requestKey]);
      if (previous.rowCount) {
        if (previous.rows[0].ai_content_sha256 !== fingerprint) deny('AI_REQUEST_CONTENT_CONFLICT');
        deny('AI_REQUEST_ALREADY_RECORDED');
      }
      if (!grant.providers.includes(candidate.providerId) || !grant.capabilities.includes(task.capability) ||
          !grant.classifications.includes(task.dataClassification)) deny('AI_MODEL_SCOPE_DENIED');
      const linked = await c.query(`SELECT q.goal_id,g.company_scope FROM work_queue q JOIN goals g ON g.id=q.goal_id
        WHERE q.id=$1 AND g.id=$2 AND g.company_scope=$3 AND q.fencing_token::text=$4
        AND q.status<>'FAILED' AND g.state NOT IN ('COMPLETED','CANCELLED','FAILED') FOR SHARE OF q,g`,
        [copied.context.queueId,copied.context.goalId,grant.legal_entity_id,copied.context.attemptId]);
      if (linked.rowCount !== 1) deny('AI_SAM_TASK_SCOPE_DENIED');
      if (copied.context.executionId) {
        const execution = await c.query('SELECT id FROM executions WHERE id=$1 AND queue_id=$2 AND goal_id=$3',
          [copied.context.executionId,copied.context.queueId,copied.context.goalId]);
        if (execution.rowCount !== 1) deny('AI_SAM_EXECUTION_SCOPE_DENIED');
      }
      const a = await c.query(`SELECT * FROM approvals WHERE id=$1 FOR UPDATE`,[copied.context.approvalId]);
      const approval = a.rows[0];
      if (!approval || approval.capability_id !== 'ai.model.invoke' || approval.status !== 'APPROVED' ||
          approval.params_hash !== fingerprint || approval.goal_id !== copied.context.goalId ||
          approval.legal_entity_id !== grant.legal_entity_id || approval.expiry_at.getTime() <= Date.now() ||
          approval.used_count >= approval.max_uses) deny('AI_APPROVAL_DENIED');
      const tariff: ExactTariff = approval.limits?.models?.find((p: ExactTariff) => p.providerId === candidate.providerId && p.model === candidate.model);
      assertTariff(tariff);
      if((task as any).requiresToolCalling===true||((task as any).requiredContextTokens!==undefined&&
        (!Number.isSafeInteger((task as any).requiredContextTokens)||(task as any).requiredContextTokens>tariff.maxInputTokens+tariff.maxOutputTokens)))deny('AI_CAPABILITY_UNSUPPORTED');
      // This adapter only uses ordinary text JSON. No tools, cache writes, images or ancillary charges.
      const inputBound = Buffer.byteLength(taskPrompt(task),'utf8') + tariff.framingTokens;
      if (inputBound > tariff.maxInputTokens) deny('AI_INPUT_BOUND_EXCEEDED');
      const estimated = exactCost(tariff,inputBound,Math.min(256,tariff.maxOutputTokens));
      const reserved = exactCost(tariff,inputBound,tariff.maxOutputTokens);
      if (task.maxCostUsd !== undefined && (!Number.isFinite(task.maxCostUsd) ||
          reserved > usdToMicrousd(String(task.maxCostUsd)))) deny('AI_TASK_CEILING_DENIED');
      // Fail closed on unattributed legacy history; do not silently interpret it as zero.
      const legacy = await c.query('SELECT EXISTS(SELECT 1 FROM model_calls WHERE ai_state IS NULL) AS present');
      if (legacy.rows[0].present) deny('AI_LEGACY_ALLOCATION_REQUIRED');
      const periods = await c.query(`SELECT b.*,a.status AS approval_status,a.expiry_at AS approval_expiry,a.capability_id AS approval_capability
        FROM sam_ai_budget_periods b JOIN approvals a ON a.id=b.approval_id
        WHERE b.environment=$1 AND b.starts_at<=clock_timestamp() AND b.ends_at>clock_timestamp()
        AND ((b.kind='GLOBAL' AND b.scope_key='all') OR (b.kind='PROJECT' AND b.scope_key=$2)
          OR (b.kind='GOAL' AND b.scope_key=$3) OR (b.kind='TASK' AND b.scope_key=$4))
        ORDER BY b.kind,b.scope_key,b.id FOR UPDATE OF b FOR SHARE OF a`,
        [grant.environment,grant.project_id,copied.context.goalId,copied.context.queueId]);
      if (periods.rowCount !== 4 || new Set(periods.rows.map(b => b.kind)).size !== 4 ||
          periods.rows.some(b => b.approval_capability!=='ai.budget.limit'||b.approval_status !== 'APPROVED' || b.approval_expiry.getTime() <= Date.now())) deny('AI_BUDGET_AUTHORITY_DENIED');
      for (const b of periods.rows) {
        const used = await c.query(`SELECT COALESCE(SUM(m.ai_exposure_microusd),0)::text AS used
          FROM model_calls m JOIN sam_ai_call_budgets l ON l.model_call_id=m.id WHERE l.budget_period_id=$1`,[b.id]);
        if (BigInt(used.rows[0].used) + reserved > BigInt(b.limit_microusd)) deny('AI_BUDGET_EXHAUSTED');
      }
      const inserted = await c.query(`INSERT INTO model_calls(task,provider,model,reason_selected,tokens,cost,success,data_classification,
        ai_project_id,ai_environment,ai_grant_id,ai_approval_id,ai_goal_id,ai_queue_id,ai_execution_id,ai_attempt_id,
        ai_request_key,ai_content_sha256,ai_owner_sha256,ai_state,ai_estimated_microusd,ai_reserved_microusd,
        ai_exposure_microusd,ai_requested_model,ai_tariff,verification_result)
        VALUES($1,$2,$3,'SAM_DURABLE_RESERVATION',NULL,NULL,false,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        'RESERVED',$16,$17,$17,$3,$18::jsonb,'RESERVED_USAGE_UNKNOWN') RETURNING id`,
        [task.task,candidate.providerId,candidate.model,task.dataClassification,grant.project_id,grant.environment,grant.id,
          copied.context.approvalId,copied.context.goalId,copied.context.queueId,copied.context.executionId??null,
          copied.context.attemptId,copied.context.requestKey,fingerprint,digest(nonce),estimated.toString(),reserved.toString(),
          JSON.stringify({ ...tariff,inputBound })]);
      const id = inserted.rows[0].id;
      for (const b of periods.rows) await c.query('INSERT INTO sam_ai_call_budgets VALUES($1,$2)',[id,b.id]);
      await c.query(`UPDATE approvals SET used_count=used_count+1,used_at=now(),
        status=CASE WHEN used_count+1>=max_uses THEN 'USED' ELSE status END WHERE id=$1`,[copied.context.approvalId]);
      await this.#audit(c,grant,copied,'AI_MODEL_RESERVED',id,{ estimatedMicrousd: estimated.toString(),reservedMicrousd: reserved.toString(),contentSha256:fingerprint });
      return { id, fingerprint };
    });
    const ticket = Object.freeze({ id: result.id });
    this.#owned.set(ticket,{ id: result.id,nonce,binding: copied,fingerprint: result.fingerprint }); return ticket;
  }
  #ticket(ticket: DurableTicket): OwnedTicket { const owned = this.#owned.get(ticket); if (!owned) deny('AI_TICKET_DENIED'); return owned; }
  async dispatch(ticket: DurableTicket): Promise<void> {
    const o = this.#ticket(ticket);
    await this.#tx(async c => {
      const grant = await this.#grant(c,o.binding);
      const scope=await c.query(`SELECT q.id FROM work_queue q JOIN goals g ON g.id=q.goal_id WHERE q.id=$1 AND g.id=$2
        AND q.fencing_token::text=$3 AND g.company_scope=$4 AND q.status<>'FAILED'
        AND g.state NOT IN ('COMPLETED','CANCELLED','FAILED') FOR SHARE OF q,g`,
        [o.binding.context.queueId,o.binding.context.goalId,o.binding.context.attemptId,grant.legal_entity_id]);
      if(scope.rowCount!==1)deny('AI_SAM_TASK_SCOPE_DENIED');
      const row = (await c.query(`SELECT m.*,a.status AS approval_status,a.expiry_at FROM model_calls m
        JOIN approvals a ON a.id=m.ai_approval_id WHERE m.id=$1 FOR UPDATE OF m FOR SHARE OF a`,[o.id])).rows[0];
      if (!row || row.ai_owner_sha256 !== digest(o.nonce) || row.ai_state !== 'RESERVED' ||
          !['APPROVED','USED'].includes(row.approval_status) || row.expiry_at.getTime() <= Date.now()) deny('AI_DISPATCH_DENIED');
      assertTariff(row.ai_tariff);
      // Every reservation period must still be active; expiry does not erase it or permit a new attempt.
      const periods = await c.query(`SELECT b.*,a.status AS approval_status,a.expiry_at AS approval_expiry,a.capability_id AS approval_capability
        FROM sam_ai_call_budgets l JOIN sam_ai_budget_periods b ON b.id=l.budget_period_id
        JOIN approvals a ON a.id=b.approval_id WHERE l.model_call_id=$1
        ORDER BY b.kind,b.scope_key,b.id FOR UPDATE OF b FOR SHARE OF a`,[o.id]);
      if(periods.rowCount!==4)deny('AI_BUDGET_AUTHORITY_DENIED');
      for(const b of periods.rows){
        if(b.starts_at.getTime()>Date.now()||b.ends_at.getTime()<=Date.now()||b.approval_capability!=='ai.budget.limit'||b.approval_status!=='APPROVED'||
          b.approval_expiry.getTime()<=Date.now())deny('AI_BUDGET_PERIOD_EXPIRED');
        const used=await c.query(`SELECT COALESCE(SUM(m.ai_exposure_microusd),0)::text AS used FROM model_calls m
          JOIN sam_ai_call_budgets l ON l.model_call_id=m.id WHERE l.budget_period_id=$1`,[b.id]);
        if(BigInt(used.rows[0].used)>BigInt(b.limit_microusd))deny('AI_BUDGET_EXHAUSTED');
      }
      await c.query(`UPDATE model_calls SET ai_state='DISPATCHING',ai_dispatched_at=clock_timestamp(),verification_result='POSSIBLE_SEND_USAGE_UNKNOWN' WHERE id=$1`,[o.id]);
      await this.#audit(c,grant,o.binding,'AI_MODEL_DISPATCHING',o.id,{});
    });
  }
  async tariff(ticket: DurableTicket): Promise<ExactTariff & { inputBound: number }> {
    const o = this.#ticket(ticket);
    return this.#tx(async c => (await c.query('SELECT ai_tariff FROM model_calls WHERE id=$1',[o.id])).rows[0].ai_tariff);
  }
  async fail(ticket: DurableTicket): Promise<void> {
    const o = this.#ticket(ticket);
    await this.#tx(async c => {
      const row = (await c.query('SELECT * FROM model_calls WHERE id=$1 FOR UPDATE',[o.id])).rows[0];
      if (!row || row.ai_owner_sha256 !== digest(o.nonce)) deny('AI_TICKET_DENIED');
      if (['SUCCEEDED','RECONCILED','NOT_SENT'].includes(row.ai_state)) return;
      const notSent = row.ai_state === 'RESERVED';
      await c.query(`UPDATE model_calls SET ai_state=$2,ai_exposure_microusd=CASE WHEN $3 THEN 0 ELSE ai_reserved_microusd END,
        ai_finished_at=clock_timestamp(),verification_result=$4 WHERE id=$1`,
        [o.id,notSent?'NOT_SENT':'UNRESOLVED',notSent,notSent?'PROVEN_NOT_SENT':'POSSIBLE_SEND_USAGE_UNKNOWN']);
      // Audit does not depend on still-active grant; even revoked requests retain cost evidence.
      await this.#audit(c,{ actor:'sam:durable-accounting' },o.binding,notSent?'AI_MODEL_NOT_SENT':'AI_MODEL_UNRESOLVED',o.id,{});
    });
  }
  async finish(ticket: DurableTicket, result: ProviderResult, cached = 0): Promise<void> {
    const o = this.#ticket(ticket);
    await this.#tx(async c => {
      const row = (await c.query('SELECT * FROM model_calls WHERE id=$1 FOR UPDATE',[o.id])).rows[0];
      if (!row || row.ai_owner_sha256 !== digest(o.nonce) || !['DISPATCHING','UNRESOLVED'].includes(row.ai_state)) deny('AI_SETTLEMENT_DENIED');
      const tariff = row.ai_tariff as ExactTariff & {inputBound:number};
      const u = result?.usage;
      if (!u || ![u.inputTokens,u.outputTokens,cached].every(n => Number.isSafeInteger(n)&&n>=0) ||
          u.inputTokens>tariff.inputBound || u.outputTokens>tariff.maxOutputTokens || cached>u.inputTokens ||
          !tariff.reportedModels.includes(result.model)) deny('AI_USAGE_UNKNOWN');
      const computed = exactCost(tariff,u.inputTokens,u.outputTokens,cached);
      if (computed>BigInt(row.ai_reserved_microusd)) deny('AI_USAGE_EXCEEDS_RESERVATION');
      await c.query(`UPDATE model_calls SET ai_state='SUCCEEDED',ai_exposure_microusd=$2,ai_computed_microusd=$2,
        ai_input_tokens=$3,ai_output_tokens=$4,ai_cached_tokens=$5,ai_reported_model=$6,ai_provider_request_sha256=$7,
        ai_result_sha256=$8,ai_finished_at=clock_timestamp(),success=true,tokens=$9,cost=NULL,
        verification_result='USAGE_REPORTED_INVOICE_UNVERIFIED' WHERE id=$1`,
        [o.id,computed.toString(),u.inputTokens,u.outputTokens,cached,result.model,
          (result as any).providerRequestId?digest((result as any).providerRequestId):null,digest(JSON.stringify(result.output)),u.inputTokens+u.outputTokens]);
      await this.#audit(c,{actor:'sam:durable-accounting'},o.binding,'AI_MODEL_USAGE_RECORDED',o.id,{ computedMicrousd:computed.toString(),invoiceVerified:false });
    });
  }
  async inspect(identity: SamModelIdentity, id: string): Promise<any> {
    return this.#tx(async c => {
      const grant = await this.#grant(c,{ identity,context:{} as SamCallContext });
      const row = (await c.query(`SELECT id,ai_state,ai_estimated_microusd,ai_reserved_microusd,ai_exposure_microusd,
        ai_computed_microusd,ai_invoiced_microusd,ai_input_tokens,ai_output_tokens,ai_goal_id,ai_queue_id,
        ai_attempt_id,ai_content_sha256,ai_requested_model,ai_reported_model FROM model_calls
        WHERE id=$1 AND ai_grant_id=$2`,[id,grant.id])).rows[0];
      if (!row) deny('AI_CALL_NOT_FOUND'); return row;
    });
  }
  async recoverPending(identity: SamModelIdentity, id: string): Promise<void> {
    await this.#tx(async c=>{
      const grant=await this.#grant(c,{identity,context:{} as SamCallContext});
      const row=(await c.query('SELECT * FROM model_calls WHERE id=$1 AND ai_grant_id=$2 FOR UPDATE',[id,grant.id])).rows[0];
      if(!row)deny('AI_CALL_NOT_FOUND');
      if(row.ai_state!=='DISPATCHING')return;
      await c.query("UPDATE model_calls SET ai_state='UNRESOLVED',verification_result='RECOVERED_POSSIBLE_SEND_USAGE_UNKNOWN' WHERE id=$1",[id]);
      await this.#audit(c,grant,{identity,context:{goalId:row.ai_goal_id,queueId:row.ai_queue_id,attemptId:row.ai_attempt_id,
        requestKey:row.ai_request_key,approvalId:row.ai_approval_id}},'AI_MODEL_RECOVERED_UNRESOLVED',id,{});
    });
  }
}
