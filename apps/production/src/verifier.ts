import { withTransaction } from "../../../packages/db/src/client";
import { recordIndependentVerificationAtomic } from "../../kernel/src/verification";
import type { ValidatedProductionBundle } from "./bundle";

export async function verifyNextExecution(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;executionId?:string;verificationId?:string}>{
  const candidate=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT e.id,e.capability_id,e.params,e.evidence,e.operation_key_ref,
              vc.id AS contract_id,vc.verification_method,
              vc.required_evidence_fields,vc.independent_query_template
         FROM executions e
         JOIN goals g ON g.id=e.goal_id
         JOIN verification_contracts vc ON vc.capability_id=e.capability_id
        WHERE g.state='VERIFYING'
          AND e.status='EXECUTED'
          AND NOT EXISTS (
            SELECT 1 FROM verifications v WHERE v.execution_id=e.id
          )
        ORDER BY e.finished_at NULLS LAST,e.started_at,e.id
        LIMIT 1`
    );
    return res.rows[0]??null;
  });

  if(!candidate) return {processed:false};
  const verifier=bundle.verifiers.get(candidate.capability_id);
  if(!verifier) return {processed:false};

  const outcome=await verifier.verify({
    execution:{
      id:candidate.id,
      capabilityId:candidate.capability_id,
      params:candidate.params??{},
      evidence:candidate.evidence??{},
      operationKeyRef:candidate.operation_key_ref??null
    },
    contract:{
      id:candidate.contract_id,
      method:candidate.verification_method,
      requiredEvidenceFields:candidate.required_evidence_fields??{},
      independentQueryTemplate:candidate.independent_query_template??{}
    }
  });

  const verificationId=await recordIndependentVerificationAtomic({
    executionId:candidate.id,
    verifier:outcome.verifier,
    contractId:candidate.contract_id,
    independentEvidence:outcome.evidence,
    result:outcome.result
  });

  return {processed:true,executionId:candidate.id,verificationId};
}
