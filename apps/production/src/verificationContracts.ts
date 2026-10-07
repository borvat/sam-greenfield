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
