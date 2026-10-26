import type { Pool } from 'pg';
import { sha256Hex } from '../../shared/src/stableJson';
import { amount } from './exactMoney';
import { deny, InfrastructureError } from './security';

/** Separate trusted SAM administrative credential. Never a model/agent tool.
 * Uses existing approvals + append-only audit_log, not a new authority issuer.
 */
export class PostgresModelAdministration {
  constructor(private readonly pool: Pool) {}
  async #tx<T>(fn:(c:any)=>Promise<T>):Promise<T> {
    const c=await this.pool.connect().catch(()=>deny('AI_LEDGER_UNAVAILABLE'));
    try {await c.query('BEGIN');const value=await fn(c);await c.query('COMMIT');return value;}
    catch(e){try{await c.query('ROLLBACK');}catch{}if(e instanceof InfrastructureError)throw e;deny('AI_LEDGER_UNAVAILABLE');}
    finally{c.release();}
  }
  async #approval(c:any,id:string,payload:object) {
    const a=(await c.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(!a||a.capability_id!=='ai.infrastructure.admin'||a.status!=='APPROVED'||a.expiry_at.getTime()<=Date.now()||
      a.params_hash!==sha256Hex(payload)||a.used_count>=a.max_uses)deny('AI_ADMIN_APPROVAL_DENIED');
    await c.query("UPDATE approvals SET used_count=used_count+1,used_at=now(),status='USED' WHERE id=$1",[id]);
    return a;
  }
  async #audit(c:any,id:string,approvalId:string,action:string,data:object) {
    await c.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,approval_id,result)
      VALUES('sam:approved-administrator',$1,'ai_infrastructure',$2,$3::jsonb,'sam_ai_infrastructure','YELLOW',$4,'RECORDED')`,
      [action,id,JSON.stringify(data),approvalId]);
  }
  #scope(approval:any,entityId:string|null):void {
    if(entityId!==null&&approval.legal_entity_id===entityId)return;
    if(approval.legal_entity_id===null&&approval.authority_class==='RED')return;
    deny('AI_ADMIN_PROJECT_SCOPE_DENIED');
  }
  async revokeService(grantId:string,approvalId:string):Promise<void> {
    await this.#tx(async c=>{
      const approval=await this.#approval(c,approvalId,{action:'revokeService',grantId});
      const target=(await c.query(`SELECT p.legal_entity_id FROM sam_ai_service_grants g
        JOIN sam_ai_project_state p USING(project_id,environment) WHERE g.id=$1`,[grantId])).rows[0];
      if(!target)deny('AI_GRANT_NOT_FOUND');this.#scope(approval,target.legal_entity_id);
      const r=await c.query('UPDATE sam_ai_service_grants SET enabled=false,revoked_at=clock_timestamp() WHERE id=$1 RETURNING id',[grantId]);
      if(r.rowCount!==1)deny('AI_GRANT_NOT_FOUND');await this.#audit(c,grantId,approvalId,'AI_SERVICE_REVOKED',{});
    });
  }
  async setProjectEnabled(projectId:string,environment:'test'|'production',enabled:boolean,approvalId:string):Promise<void> {
    await this.#tx(async c=>{
      const approval=await this.#approval(c,approvalId,{action:'setProjectEnabled',projectId,environment,enabled});
      const r=await c.query('UPDATE sam_ai_project_state SET enabled=$3 WHERE project_id=$1 AND environment=$2 RETURNING legal_entity_id',
        [projectId,environment,enabled]);
      if(r.rowCount!==1)deny('AI_PROJECT_NOT_FOUND');this.#scope(approval,r.rows[0].legal_entity_id);
      await this.#audit(c,r.rows[0].legal_entity_id,approvalId,'AI_PROJECT_ENABLED_CHANGED',{environment,enabled});
    });
  }
  async changeLimit(id:string,limitMicrousd:string,expectedRevision:number,approvalId:string):Promise<void> {
    amount(limitMicrousd);
    await this.#tx(async c=>{
      const approval=await this.#approval(c,approvalId,{action:'changeLimit',id,limitMicrousd,expectedRevision});
      const b=(await c.query('SELECT * FROM sam_ai_budget_periods WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(!b||b.revision!==expectedRevision)deny('AI_LIMIT_REVISION_CONFLICT');
      const target=b.kind==='PROJECT'?(await c.query('SELECT legal_entity_id FROM sam_ai_project_state WHERE project_id=$1 AND environment=$2',[b.scope_key,b.environment])).rows[0]:
        b.kind==='GOAL'?(await c.query('SELECT company_scope AS legal_entity_id FROM goals WHERE id=$1',[b.scope_key])).rows[0]:
        b.kind==='TASK'?(await c.query('SELECT g.company_scope AS legal_entity_id FROM work_queue q JOIN goals g ON g.id=q.goal_id WHERE q.id=$1',[b.scope_key])).rows[0]:null;
      if(b.kind!=='GLOBAL'&&!target)deny('AI_ADMIN_PROJECT_SCOPE_DENIED');
      this.#scope(approval,target?.legal_entity_id??null);
      await c.query('UPDATE sam_ai_budget_periods SET limit_microusd=$2,revision=revision+1 WHERE id=$1',[id,limitMicrousd]);
      await this.#audit(c,id,approvalId,'AI_BUDGET_LIMIT_CHANGED',{beforeMicrousd:b.limit_microusd,afterMicrousd:limitMicrousd,revision:expectedRevision+1});
    });
  }
  async reconcile(id:string,evidence:{kind:'PROVIDER_RECEIPT'|'VERIFIED_INVOICE'|'CONFIRMED_NOT_SENT';amountMicrousd:string;sourceSha256:string},approvalId:string):Promise<void> {
    amount(evidence.amountMicrousd);
    if(!/^[a-f0-9]{64}$/.test(evidence.sourceSha256))deny('AI_EVIDENCE_INVALID');
    await this.#tx(async c=>{
      const approval=await this.#approval(c,approvalId,{action:'reconcile',id,evidence});
      // Lock the same budget rows as admission before changing monetary exposure.
      await c.query(`SELECT b.id FROM sam_ai_budget_periods b JOIN sam_ai_call_budgets l ON l.budget_period_id=b.id
        WHERE l.model_call_id=$1 ORDER BY b.kind,b.scope_key,b.id FOR UPDATE OF b`,[id]);
      const row=(await c.query('SELECT * FROM model_calls WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(!row||!row.ai_state||row.ai_state==='NOT_SENT')deny('AI_RECONCILIATION_DENIED');
      const goal=(await c.query('SELECT company_scope FROM goals WHERE id=$1',[row.ai_goal_id])).rows[0];
      if(!goal)deny('AI_ADMIN_PROJECT_SCOPE_DENIED');this.#scope(approval,goal.company_scope);
      if(row.ai_invoiced_microusd!==null&&evidence.kind!=='VERIFIED_INVOICE')deny('AI_INVOICE_EVIDENCE_REQUIRED');
      if(evidence.kind==='CONFIRMED_NOT_SENT'&&(row.ai_state!=='RESERVED'||evidence.amountMicrousd!=='0'))deny('AI_NOT_SENT_PROOF_DENIED');
      await c.query(`INSERT INTO sam_ai_billing_evidence(model_call_id,kind,amount_microusd,source_sha256,actor)
        VALUES($1,$2,$3,$4,'sam:approved-administrator')`,[id,evidence.kind,evidence.amountMicrousd,evidence.sourceSha256]);
      await c.query(`UPDATE model_calls SET ai_state=$2,ai_exposure_microusd=$3,
        ai_invoiced_microusd=CASE WHEN $4='VERIFIED_INVOICE' THEN $3 ELSE ai_invoiced_microusd END,
        ai_finished_at=clock_timestamp(),verification_result=$4 WHERE id=$1`,
        [id,evidence.kind==='CONFIRMED_NOT_SENT'?'NOT_SENT':'RECONCILED',evidence.amountMicrousd,evidence.kind]);
      await this.#audit(c,id,approvalId,'AI_MODEL_RECONCILED',evidence);
    });
  }
}
