import { withTransaction } from "../../../packages/db/src/client";
import { recordIndependentVerificationAtomic } from "../../kernel/src/verification";
import type { ValidatedProductionBundle } from "./bundle";

function obj(value:unknown):Record<string,any>|undefined{
  return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,any>:undefined;
}

function payload(value:unknown):Record<string,any>{
  const outer=obj(value)??{};
  return obj(outer.data)??outer;
}

export function detectBolDataGaps(rows:Array<{capability_id:string;params?:Record<string,unknown>;result?:unknown}>):string[]{
  const gaps:string[]=[];
  for(const row of rows){
    const p=obj(payload(row.result));
    const pagination=obj(p?.pagination);
    if(pagination?.allPagesComplete===false)gaps.push("pagination_incomplete");
  }
  const order=rows.find(row=>row.capability_id==="bol_list_orders");
  const orderData=order?payload(order.result):undefined;
  const orders=Array.isArray(orderData?.orders)?orderData!.orders:[];
  if(order&&!orders.length){
    const from=typeof order.params?.latestChangeDate==="string"?Date.parse(`${String(order.params.latestChangeDate).slice(0,10)}T00:00:00Z`):undefined;
    const recentReturn=rows.some(row=>{
      if(row.capability_id!=="bol_list_returns")return false;
      const returns=payload(row.result).returns;
      return Array.isArray(returns)&&returns.some((raw)=>{
        const date=Date.parse(String(obj(raw)?.registrationDateTime??""));
        return Number.isFinite(date)&&(from===undefined||Number.isNaN(from)||date>=from);
      });
    });
    if(recentReturn)gaps.push("orders_empty_while_recent_returns_exist");
  }
  return [...new Set(gaps)];
}

export async function verifyNextExecution(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;executionId?:string;verificationId?:string}>{
  const candidate=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT e.id,e.goal_id,e.plan_id,e.capability_id,e.params,e.evidence,e.operation_key_ref,
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

  let outcome=await verifier.verify({
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

  const gapCheck=await withTransaction(async(client)=>{
    const coverage=await client.query(
      `SELECT
         COUNT(*) FILTER (WHERE w.status<>'EXECUTED')::int AS unfinished,
         COUNT(*) FILTER (WHERE e.status='EXECUTED' AND v.id IS NULL)::int AS unverified
       FROM work_queue w
       LEFT JOIN executions e ON e.queue_id=w.id
       LEFT JOIN verifications v ON v.execution_id=e.id
       WHERE w.goal_id=$1 AND w.plan_id=$2`,
      [candidate.goal_id,candidate.plan_id]
    );
    if(Number(coverage.rows[0]?.unfinished??0)>0||Number(coverage.rows[0]?.unverified??0)!==1)return {ready:false,gaps:[] as string[]};
    const rows=await client.query(
      `SELECT capability_id,params,result FROM executions
        WHERE goal_id=$1 AND plan_id=$2 AND status='EXECUTED'
        ORDER BY started_at,id`,
      [candidate.goal_id,candidate.plan_id]
    );
    return {ready:true,gaps:detectBolDataGaps(rows.rows)};
  });
  if(gapCheck.ready&&gapCheck.gaps.length){
    outcome={
      ...outcome,
      result:"FAILED",
      evidence:{...outcome.evidence,goal_data_gaps:gapCheck.gaps,action:"replan_read_only_goal"}
    };
  }

  const verificationId=await recordIndependentVerificationAtomic({
    executionId:candidate.id,
    verifier:outcome.verifier,
    contractId:candidate.contract_id,
    independentEvidence:outcome.evidence,
    result:outcome.result
  });

  return {processed:true,executionId:candidate.id,verificationId};
}
