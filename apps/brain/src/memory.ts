export type MemoryType = "OPERATIONAL" | "COMMERCIAL" | "OWNER_DECISION" | "FORMAL_RULE";

export async function appendMemoryObservation(
  client: any,
  input: {
    type: MemoryType;
    statement: string;
    scope?: Record<string, unknown>;
    source: string;
    confidence?: number;
  }
): Promise<string> {
  const res = await client.query(
    `INSERT INTO memory_records(type, statement, scope, source, confidence, status)
     VALUES ($1,$2,$3::jsonb,$4,$5,'OBSERVED')
     RETURNING id`,
    [
      input.type,
      input.statement,
      JSON.stringify(input.scope ?? {}),
      input.source,
      input.confidence ?? 0.5
    ]
  );
  return res.rows[0].id;
}

export async function loadApprovedMemory(client: any, limit = 200, entityId?:string, objective = '') {
  const res = await client.query(
    `SELECT *
       FROM memory_records
      WHERE type<>'OWNER_DECISION' AND status IN ('REINFORCED','APPROVED_RULE')
        AND ($2::uuid IS NULL OR scope->>'legal_entity_id'=$2::text)
      ORDER BY last_confirmed_at DESC, confidence DESC, id DESC
      LIMIT $1`,
    [limit,entityId??null]
  );
  return [...res.rows,...(entityId?await recallApprovedOwnerDecisions(client,entityId,objective):[])];
}

/** Owner decisions have an explicit task context, approval and attribution. */
export async function recallApprovedOwnerDecisions(client:any,entityId:string,objective:string,limit=20){
 const {authorizedCompany}=await import('../../../packages/shared/src/ownerScope');
 try{await authorizedCompany(client,{actor:'brain-approved-owner-recall',systemOwner:true,legalEntityId:entityId});}
 catch(error){if(error instanceof Error&&error.message==='AUTHORIZED_COMPANY_CONTEXT_REQUIRED')return [];throw error;}
 const words=(value:string)=>value.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[];
 const task=new Set(words(typeof objective==='string'?objective:''));
 if(!task.size)return [];
 // Filter relevance before bounding results so unrelated recent decisions cannot hide a relevant one.
 const rows=(await client.query(`SELECT * FROM memory_records WHERE type='OWNER_DECISION' AND status='APPROVED_RULE'
  AND scope->>'legal_entity_id'=$1 AND scope->>'schema'='sam.approved_owner_decision.v1'
  AND COALESCE(scope->>'approved_by','')<>'' AND COALESCE(scope->>'source_timestamp','')<>''
  AND NOT EXISTS(SELECT 1 FROM regexp_split_to_table(lower(scope->>'context_key'),'[^[:alnum:]]+') AS term
   WHERE term<>'' AND NOT term=ANY($2::text[]))
  ORDER BY last_confirmed_at DESC,id DESC LIMIT $3`,[entityId,[...task],Math.max(1,Math.min(100,limit))])).rows;
 return rows.filter((row:any)=>{const context=words(row.scope.context_key);return context.length>0&&context.every(w=>task.has(w))});
}
