// Ported intake boundary from the feature dispatcher. Caller owns the transaction;
// the existing planner, leases, executor and verifier remain the execution engine.
export async function createObservationGoal(input:{legalEntityId:string;actor:string;authorityCeiling:string;domain:string;completionDefinition:string;objective:string},c:any){
 if(process.env.SAM_INTEGRATION_ENABLED!=='1'||input.authorityCeiling!=='GREEN'||input.domain!=='sam_perception')throw Error('INTEGRATION_OBSERVATION_ONLY');
 const entity=await c.query('SELECT id FROM legal_entities WHERE id=$1',[input.legalEntityId]);
 if(entity.rowCount!==1)throw Error('INTEGRATION_ENTITY_DENIED');
 const r=await c.query(`INSERT INTO goals(business_id,company_scope,objective,state,domain,authority_ceiling,completion_definition)
  VALUES(next_business_id('goal',NULL),$1,$2,'NEW',$3,'GREEN',$4) RETURNING id`,[input.legalEntityId,input.objective,input.domain,input.completionDefinition]);
 return r.rows[0];
}
