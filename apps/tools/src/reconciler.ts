import { withTransaction } from "../../../packages/db/src/client";
import type { ToolRegistry } from "../../../packages/tool-gateway/src/registry";

export async function reconcileOneSideEffectAtomic(input:{
  tools:ToolRegistry;
  operationKey:string;
}):Promise<"CONFIRMED"|"FAILED_PERMANENT"|"NOT_FOUND">{
  const op=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT *
         FROM side_effect_operations
        WHERE operation_key=$1
        FOR UPDATE`,
      [input.operationKey]
    );
    if(res.rowCount!==1) return null;
    return res.rows[0];
  });

  if(!op) return "NOT_FOUND";
  const active=await withTransaction(client=>client.query(`SELECT 1 FROM work_queue WHERE operation_key_ref=$1
    AND status IN ('LEASED','EXECUTING') AND lease_expiry>now() LIMIT 1`,[input.operationKey]));
  if(active.rowCount)return 'NOT_FOUND';
  if(op.state==="CONFIRMED" && op.reconciliation_state==="RECONCILED") return "CONFIRMED";
  if(op.reconciliation_state!=="NEEDS_RECONCILIATION"){
    throw new Error(`Side effect ${input.operationKey} is not ready for reconciliation`);
  }

  const adapter=input.tools.adapter(op.capability_id) as any;
  if(typeof adapter.reconcile!=="function"){
    throw new Error(`Tool adapter ${op.capability_id} does not support reconciliation`);
  }

  const result=await adapter.reconcile({
    capabilityId:op.capability_id,
    providerReference:op.provider_reference ?? null,
    idempotencyKey:op.idempotency_key ?? op.operation_key
  });

  if(result.result==="CONFIRMED"){
    await withTransaction(async(client)=>{
      const updated=await client.query(
        `UPDATE side_effect_operations
            SET state='CONFIRMED',
                reconciliation_state='RECONCILED',
                reconciliation_evidence=$2::jsonb,
                last_reconciled_at=now(),
                updated_at=now()
          WHERE operation_key=$1
            AND reconciliation_state='NEEDS_RECONCILIATION'
          RETURNING id`,
        [input.operationKey,JSON.stringify(result.evidence)]
      );
      if(updated.rowCount!==1){
        const current=await client.query("SELECT state FROM side_effect_operations WHERE operation_key=$1",[input.operationKey]);
        if(current.rows[0]?.state!=='CONFIRMED')throw new Error('SIDE_EFFECT_RECONCILIATION_CONFLICT');
      }
    });
    return "CONFIRMED";
  }

  if(result.result==="FAILED"){
    await withTransaction(async(client)=>{
      const updated=await client.query(
        `UPDATE side_effect_operations
            SET state='FAILED',
                reconciliation_state='FAILED_PERMANENT',
                reconciliation_evidence=$2::jsonb,
                last_reconciled_at=now(),
                updated_at=now()
          WHERE operation_key=$1
            AND reconciliation_state='NEEDS_RECONCILIATION'
          RETURNING id`,
        [input.operationKey,JSON.stringify(result.evidence)]
      );
      if(updated.rowCount!==1){
        const current=await client.query("SELECT state FROM side_effect_operations WHERE operation_key=$1",[input.operationKey]);
        if(current.rows[0]?.state!=='FAILED')throw new Error('SIDE_EFFECT_RECONCILIATION_CONFLICT');
      }
    });
    return "FAILED_PERMANENT";
  }

  await withTransaction(async client=>{
    await client.query(`UPDATE side_effect_operations SET reconciliation_evidence=$2::jsonb,last_reconciled_at=now() WHERE operation_key=$1`,
      [input.operationKey,JSON.stringify({...result.evidence,reviewRequired:true,reason:'OUTCOME_UNCERTAIN_REQUIRES_OWNER'})]);
    await client.query(`UPDATE goals SET state='WAITING_OWNER',next_wake_at=NULL,updated_at=now() WHERE id=$1
      AND state IN ('EXECUTING','WAITING_EXTERNAL','VERIFYING')`,[op.goal_id]);
    const {insertOutboxEvent}=await import('../../../packages/db/src/outbox');
    await insertOutboxEvent(client,{aggregateType:'side_effect',aggregateId:op.id,eventType:'SIDE_EFFECT_REVIEW_REQUIRED',
      payload:{goal_id:op.goal_id,reason:'OUTCOME_UNCERTAIN_REQUIRES_OWNER'}});
  });
  return "NOT_FOUND";
}

export async function reconcilePendingSideEffects(input:{
  tools:ToolRegistry;
  limit?:number;
}):Promise<{confirmed:number;failed:number;unresolved:number}>{
  const keys=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT operation_key
         FROM side_effect_operations op
        WHERE reconciliation_state='NEEDS_RECONCILIATION'
          AND NOT EXISTS(SELECT 1 FROM goals g WHERE g.id=op.goal_id AND g.state='WAITING_OWNER')
          AND NOT EXISTS(SELECT 1 FROM work_queue w WHERE w.operation_key_ref=op.operation_key
            AND w.status IN ('LEASED','EXECUTING') AND w.lease_expiry>now())
        ORDER BY updated_at,id
        LIMIT $1`,
      [input.limit ?? 100]
    );
    return res.rows.map((r:any)=>r.operation_key as string);
  });

  let confirmed=0,failed=0,unresolved=0;
  for(const operationKey of keys){
    const result=await reconcileOneSideEffectAtomic({tools:input.tools,operationKey});
    if(result==="CONFIRMED") confirmed+=1;
    else if(result==="FAILED_PERMANENT") failed+=1;
    else unresolved+=1;
  }
  return {confirmed,failed,unresolved};
}
