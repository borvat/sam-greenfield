import { withTransaction } from "../../../packages/db/src/client";

export interface VerificationContractSpec{
  capabilityId:string;
  description:string;
  verificationMethod:"api_readback"|"db_query"|"external_event"|"list_search";
  requiredEvidenceFields:Record<string,unknown>;
  independentQueryTemplate:Record<string,unknown>;
}

export async function syncVerificationContracts(
  specs:VerificationContractSpec[]
):Promise<void>{
  if(specs.length===0) return;
  await withTransaction(async(client)=>{
    for(const spec of specs){
      if(process.env.NODE_ENV==='production'){
        const row=(await client.query('SELECT required_evidence_fields,verification_method,must_not_trust_execution_result FROM verification_contracts WHERE capability_id=$1',[spec.capabilityId])).rows[0];
        const {sha256Hex}=await import('../../../packages/shared/src/stableJson');
        if(!row||!row.must_not_trust_execution_result||row.verification_method!==spec.verificationMethod||sha256Hex(row.required_evidence_fields)!==sha256Hex(spec.requiredEvidenceFields))
          throw new Error('VERIFICATION_CONTRACT_PROVISIONING_REQUIRED');
        continue;
      }
      await client.query(
        `INSERT INTO verification_contracts
          (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
         VALUES($1,$2,$3,$4::jsonb,$5::jsonb,true)
         ON CONFLICT(capability_id) DO UPDATE SET
           description=EXCLUDED.description,
           verification_method=EXCLUDED.verification_method,
           required_evidence_fields=EXCLUDED.required_evidence_fields,
           independent_query_template=EXCLUDED.independent_query_template,
           must_not_trust_execution_result=true`,
        [
          spec.capabilityId,
          spec.description,
          spec.verificationMethod,
          JSON.stringify(spec.requiredEvidenceFields),
          JSON.stringify(spec.independentQueryTemplate)
        ]
      );
    }
  });
}
