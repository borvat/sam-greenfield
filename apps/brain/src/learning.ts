import { withTransaction } from "../../../packages/db/src/client";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import type { MemoryType } from "./memory";

function verifiedScope(execution:any,scope?:Record<string,unknown>){
  if(!execution.company_scope)throw new Error('LEARNING_SCOPE_REQUIRED');
  if(['legalEntityId','legal_entity_id','company_scope'].some(key=>scope?.[key]!==undefined&&scope[key]!==execution.company_scope))throw new Error('LEARNING_SCOPE_MISMATCH');
  return {...scope,legal_entity_id:execution.company_scope};
}

async function requireVerifiedExecution(client:any,executionId:string){
  const res=await client.query(
    `SELECT e.id,e.goal_id,e.capability_id,e.result,e.evidence,g.company_scope,g.state AS goal_state,
            e.plan_hash,e.execution_hash,
            v.id AS verification_id,v.result AS verification_result
       FROM executions e JOIN goals g ON g.id=e.goal_id AND g.current_plan_id=e.plan_id
       JOIN LATERAL (
         SELECT id,result,plan_hash,execution_hash
           FROM verifications
          WHERE execution_id=e.id AND verifier<>e.actor AND plan_hash=e.plan_hash AND execution_hash=e.execution_hash
          ORDER BY checked_at DESC,id DESC
          LIMIT 1
       ) v ON true
      WHERE e.id=$1 FOR UPDATE OF e`,
    [executionId]
  );
  if(res.rowCount!==1) throw new Error("Execution or verification not found");
  if(res.rows[0].verification_result!=="VERIFIED"||res.rows[0].goal_state!=="COMPLETED"){
    throw new Error("Learning requires independently VERIFIED execution");
  }
  return res.rows[0];
}

export async function learnVerifiedWorldFact(input:{
  executionId:string;
  entityType:string;
  entityId:string;
  domain:string;
  attribute:string;
  value:unknown;
  scope?:Record<string,unknown>;
  confidence?:number;
  sourceTimestamp?:Date;
  eventSeqRef?:number|null;
},transactionClient?:any):Promise<string>{
  const work=async(client:any)=>{
    const execution=await requireVerifiedExecution(client,input.executionId);
    if(input.entityType!=='legal_entity'||input.entityId!==execution.company_scope)throw new Error('LEARNING_ENTITY_MISMATCH');
    verifiedScope(execution,input.scope);
    // World-fact identity already includes entity_id; preserve historical scope
    // so duplicate detection and supersession still match existing records.
    const scope=input.scope??{};
    const now=input.sourceTimestamp ?? new Date();
    const duplicate=await client.query(`SELECT id FROM world_facts WHERE source=$1
      AND entity_type=$2 AND entity_id=$3 AND attribute=$4 AND scope=$5::jsonb AND value=$6::jsonb`,
      [`verified_execution:${input.executionId}`,input.entityType,input.entityId,input.attribute,JSON.stringify(scope),JSON.stringify(input.value)]);
    if(duplicate.rowCount)return duplicate.rows[0].id as string;

    const active=await client.query(
      `SELECT id,value
         FROM world_facts
        WHERE entity_type=$1
          AND entity_id=$2
          AND attribute=$3
          AND scope IS NOT DISTINCT FROM $4::jsonb
          AND status='VERIFIED'
          AND superseded_at IS NULL
        ORDER BY source_timestamp DESC,confidence DESC,event_seq_ref DESC NULLS LAST,id DESC
        FOR UPDATE`,
      [input.entityType,input.entityId,input.attribute,JSON.stringify(scope)]
    );

    const inserted=await client.query(
      `INSERT INTO world_facts
        (entity_type,entity_id,domain,attribute,value,scope,status,source,source_timestamp,confidence,evidence_id,event_seq_ref)
       VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,'VERIFIED',$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        input.entityType,
        input.entityId,
        input.domain,
        input.attribute,
        JSON.stringify(input.value),
        JSON.stringify(scope),
        `verified_execution:${input.executionId}`,
        now,
        input.confidence ?? 1,
        execution.verification_id,
        input.eventSeqRef ?? null
      ]
    );
    const factId=inserted.rows[0].id as string;

    if(active.rowCount>0){
      await client.query(
        `UPDATE world_facts
            SET superseded_at=now()
          WHERE id = ANY($1::uuid[])`,
        [active.rows.map((r:any)=>r.id)]
      );
    }

    return factId;
  };
  return transactionClient?work(transactionClient):withTransaction(work);
}

export async function observeVerifiedMemory(input:{
  executionId:string;
  type:Exclude<MemoryType,"OWNER_DECISION"|"FORMAL_RULE">;
  statement:string;
  scope?:Record<string,unknown>;
  confidence?:number;
  reinforcementThreshold?:number;
}):Promise<{memoryId:string;status:"OBSERVED"|"REINFORCED";supportCount:number}>{
  return withTransaction(async(client)=>{
    const execution=await requireVerifiedExecution(client,input.executionId);
    const scope=verifiedScope(execution,input.scope);
    const source=`verified_execution:${input.executionId}`;
    const statementKey=sha256Hex({type:input.type,statement:input.statement,scope});

    const existing=await client.query(
      `SELECT *
         FROM memory_records
        WHERE type=$1
          AND statement=$2
          AND scope IS NOT DISTINCT FROM $3::jsonb
          AND status IN ('OBSERVED','REINFORCED')
        ORDER BY created_at ASC,id ASC
        FOR UPDATE`,
      [input.type,input.statement,JSON.stringify(scope)]
    );

    const threshold=input.reinforcementThreshold ?? 2;

    if(existing.rowCount===0){
      const inserted=await client.query(
        `INSERT INTO memory_records
          (type,statement,scope,source,confidence,support_count,status)
         VALUES($1,$2,$3::jsonb,$4,$5,1,'OBSERVED')
         RETURNING id,status,support_count`,
        [
          input.type,
          input.statement,
          JSON.stringify(scope),
          `${source};key:${statementKey}`,
          input.confidence ?? 0.7
        ]
      );
      return {
        memoryId:inserted.rows[0].id,
        status:inserted.rows[0].status,
        supportCount:Number(inserted.rows[0].support_count)
      };
    }

    const row=existing.rows[0];
    if(String(row.source).includes(`verified_execution:${input.executionId}`)){
      return {
        memoryId:row.id,
        status:row.status,
        supportCount:Number(row.support_count)
      };
    }

    const nextCount=Number(row.support_count)+1;
    const nextStatus=nextCount>=threshold ? "REINFORCED" : "OBSERVED";
    const updated=await client.query(
      `UPDATE memory_records
          SET support_count=$2,
              last_confirmed_at=now(),
              confidence=GREATEST(confidence,$3),
              status=$4,
              source=source || ';' || $5
        WHERE id=$1
        RETURNING id,status,support_count`,
      [
        row.id,
        nextCount,
        input.confidence ?? row.confidence,
        nextStatus,
        source
      ]
    );
    return {
      memoryId:updated.rows[0].id,
      status:updated.rows[0].status,
      supportCount:Number(updated.rows[0].support_count)
    };
  });
}

export async function recordOwnerRule(input:{
  type:"OWNER_DECISION"|"FORMAL_RULE";
  statement:string;
  scope?:Record<string,unknown>;
  source:string;
  approvedBy:string;
  supersedesMemoryId?:string;
}):Promise<string>{
  return withTransaction(async(client)=>{
    if(!input.approvedBy.trim()) throw new Error("approvedBy is required");

    let supersedes:string|null=null;
    if(input.supersedesMemoryId){
      const prior=await client.query(
        `SELECT id,status,type
           FROM memory_records
          WHERE id=$1
          FOR UPDATE`,
        [input.supersedesMemoryId]
      );
      if(prior.rowCount!==1) throw new Error("Memory to supersede not found");
      if(prior.rows[0].status!=="APPROVED_RULE"){
        throw new Error("Only APPROVED_RULE memory can be explicitly superseded");
      }
      if(prior.rows[0].type!==input.type){
        throw new Error("Superseded memory type mismatch");
      }
      supersedes=prior.rows[0].id;
    }

    const inserted=await client.query(
      `INSERT INTO memory_records
        (type,statement,scope,source,confidence,support_count,status,supersedes)
       VALUES($1,$2,$3::jsonb,$4,1,1,'APPROVED_RULE',$5)
       RETURNING id`,
      [
        input.type,
        input.statement,
        JSON.stringify(input.scope ?? {}),
        `${input.source};approved_by:${input.approvedBy}`,
        supersedes
      ]
    );
    const id=inserted.rows[0].id as string;

    if(supersedes){
      const updated=await client.query(
        `UPDATE memory_records
            SET status='SUPERSEDED',
                superseded_by=$2,
                last_confirmed_at=now()
          WHERE id=$1
            AND status='APPROVED_RULE'
          RETURNING id`,
        [supersedes,id]
      );
      if(updated.rowCount!==1) throw new Error("Approved-rule supersession failed");
    }

    return id;
  });
}

/** Explicit owner input only. Model/source observations never call this wrapper. */
export async function saveApprovedOwnerDecision(client:any,context:import('../../../packages/shared/src/ownerScope').OwnerContext,input:{
 statement:string;contextKey:string;source:string;sourceTimestamp:string;idempotencyKey:string;approved:boolean;
}){
 const {authorizedCompany}=await import('../../../packages/shared/src/ownerScope');
 const company=await authorizedCompany(client,context);
 if(input.approved!==true)throw Error('OWNER_APPROVAL_REQUIRED');
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 if(!text(input.statement,4000)||!text(input.source,500)||!text(input.idempotencyKey,200)||
  typeof input.contextKey!=='string'||!/^\p{L}[\p{L}\p{N}_-]{2,79}$/u.test(input.contextKey)||
  typeof input.sourceTimestamp!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(input.sourceTimestamp)||!Number.isFinite(Date.parse(input.sourceTimestamp))||new Date(input.sourceTimestamp).toISOString()!==input.sourceTimestamp)throw Error('OWNER_DECISION_INVALID');
 const key=sha256Hex({company,actor:context.actor,key:input.idempotencyKey});
 const scope={schema:'sam.approved_owner_decision.v1',legal_entity_id:company,context_key:input.contextKey.toLowerCase(),approved_by:context.actor,source_timestamp:input.sourceTimestamp,idempotency_key:key};
 await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['owner-decision:'+key]);
 const rows=(await client.query("SELECT * FROM memory_records WHERE scope->>'legal_entity_id'=$1 AND scope->>'idempotency_key'=$2 ORDER BY created_at,id FOR UPDATE",[company,key])).rows;
 if(rows.length){
  const row=rows[0];
  if(rows.length!==1||row.type!=='OWNER_DECISION'||row.status!=='APPROVED_RULE'||row.statement!==input.statement.trim()||row.source!==input.source||sha256Hex(row.scope)!==sha256Hex(scope))throw Error('OWNER_DECISION_IDEMPOTENCY_CONFLICT');
  return row;
 }
 const row=(await client.query(`INSERT INTO memory_records(type,statement,scope,source,confidence,support_count,status)
  VALUES('OWNER_DECISION',$1,$2::jsonb,$3,1,1,'APPROVED_RULE') RETURNING *`,[input.statement.trim(),JSON.stringify(scope),input.source])).rows[0];
 await client.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES($1,'OWNER_DECISION_SAVED','legal_entity',$2,$3::jsonb,'owner_input','GREEN','APPROVED')`,[context.actor,company,JSON.stringify({memoryId:row.id,contextKey:scope.context_key,sourceTimestamp:input.sourceTimestamp})]);
 return row;
}
