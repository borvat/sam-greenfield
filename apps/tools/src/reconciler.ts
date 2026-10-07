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
                last_reconciled_at=now(),
                updated_at=now()
          WHERE operation_key=$1
            AND reconciliation_state='NEEDS_RECONCILIATION'
          RETURNING id`,
        [input.operationKey]
      );
      if(updated.rowCount!==1) throw new Error("Side effect changed during reconciliation");
    });
    return "CONFIRMED";
  }

  if(result.result==="FAILED"){
    await withTransaction(async(client)=>{
      const updated=await client.query(
        `UPDATE side_effect_operations
            SET state='FAILED',
                reconciliation_state='FAILED_PERMANENT',
                last_reconciled_at=now(),
                updated_at=now()
          WHERE operation_key=$1
            AND reconciliation_state='NEEDS_RECONCILIATION'
          RETURNING id`,
        [input.operationKey]
      );
      if(updated.rowCount!==1) throw new Error("Side effect changed during reconciliation");
    });
    return "FAILED_PERMANENT";
  }

  return "NOT_FOUND";
}

export async function reconcilePendingSideEffects(input:{
  tools:ToolRegistry;
  limit?:number;
}):Promise<{confirmed:number;failed:number;unresolved:number}>{
  const keys=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT operation_key
         FROM side_effect_operations
        WHERE reconciliation_state='NEEDS_RECONCILIATION'
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
