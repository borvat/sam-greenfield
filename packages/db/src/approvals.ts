import { sha256Hex } from "../../shared/src/stableJson";
import type { AuthorityClass } from "../../shared/src/types";

export async function consumeApproval(
  client:any,
  input:{
    capabilityId:string;
    params:Record<string,unknown>;
    legalEntityId:string|null;
    authorityClass:Exclude<AuthorityClass,"GREEN">;
  }
):Promise<{approvalId:string;paramsHash:string}>{
  const paramsHash=sha256Hex(input.params);

  const selected=await client.query(
    `SELECT id,used_count,max_uses
       FROM approvals
      WHERE capability_id=$1
        AND params_hash=$2
        AND legal_entity_id IS NOT DISTINCT FROM $3
        AND authority_class=$4
        AND status='APPROVED'
        AND expiry_at > now()
        AND used_count < max_uses
      ORDER BY created_at DESC
      FOR UPDATE SKIP LOCKED
      LIMIT 1`,
    [input.capabilityId,paramsHash,input.legalEntityId,input.authorityClass]
  );
  if(selected.rowCount!==1){
    throw new Error("No matching live approval");
  }

  const row=selected.rows[0];
  const nextCount=Number(row.used_count)+1;
  const nextStatus=nextCount>=Number(row.max_uses) ? "USED" : "APPROVED";

  const updated=await client.query(
    `UPDATE approvals
        SET used_count=$2,
            used_at=now(),
            status=$3
      WHERE id=$1
      RETURNING id`,
    [row.id,nextCount,nextStatus]
  );
  if(updated.rowCount!==1) throw new Error("Approval consumption failed");

  return {approvalId:row.id,paramsHash};
}
