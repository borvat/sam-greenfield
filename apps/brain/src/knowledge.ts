import {DERIVE_CAPABILITY} from './evidence/artifacts';
import { sha256Hex } from "../../../packages/shared/src/stableJson";

type Finding = { executionId: string; quote: string };
export const knowledgeEnabled = () => process.env.SAM_INTEGRATION_ENABLED === "1" && process.env.SAM_KNOWLEDGE_ENABLED === "true";

// Store attributed source observations, never the model's paraphrase as a fact.
// Caller supplies the report transaction: completion and learning commit together.
export async function captureVerifiedKnowledge(client:any, goalId:string, findings:Finding[], sourceText:(result:any)=>string) {
  if (!knowledgeEnabled()) return;
  const goal = (await client.query("SELECT company_scope FROM goals WHERE id=$1",[goalId])).rows[0];
  if (!goal?.company_scope) throw new Error("KNOWLEDGE_ENTITY_REQUIRED");
  for (const finding of findings) {
    const evidence = (await client.query(`SELECT e.*,v.id AS verification_id
      FROM executions e JOIN LATERAL (SELECT id,result FROM verifications
       WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1) v ON true
      WHERE e.id=$1 AND e.goal_id=$2 AND v.result='VERIFIED'`,[finding.executionId,goalId])).rows[0];
    // The provisioned knowledge profile permits literal external SOURCE_FACT only.
    // Derived provenance remains in its execution/report ledger; do not broaden ACLs.
    if(evidence?.capability_id===DERIVE_CAPABILITY)continue;
    if (!evidence || typeof finding.quote !== "string" || finding.quote.length < 3 || finding.quote.length > 1500 ||
        !sourceText(evidence.result).includes(finding.quote)) {
      throw new Error("KNOWLEDGE_UNSUPPORTED_SOURCE");
    }
    // observed_at is the read time, NOT the date of the underlying business claim.
    // Thirty days is a maximum recall window; live-state tasks still require fresh reads.
    const key=sha256Hex({capability:evidence.capability_id,params:evidence.params,quote:finding.quote});
    await client.query(`INSERT INTO knowledge_records
      (legal_entity_id,kind,statement,execution_id,verification_id,goal_id,source_key,source_timestamp,expires_at)
      VALUES($1,'SOURCE_FACT',$2,$3,$4,$5,$6,$7,$7::timestamptz + interval '30 days')
      ON CONFLICT (legal_entity_id,kind,goal_id,source_key) DO NOTHING`,
      [goal.company_scope,finding.quote,evidence.id,evidence.verification_id,goalId,key,evidence.started_at]);
  }
}

export async function recallKnowledge(client:any, legalEntityId:string, objective:string, now=new Date()) {
  if (!knowledgeEnabled() || !legalEntityId || !objective.trim()) return [];
  const rows=await client.query(`SELECT id,kind,statement,execution_id,verification_id,goal_id,approval_id,source_timestamp,expires_at,
      CASE WHEN kind='SOURCE_FACT' THEN 'Attributed source quotation; verified read, not independently established business truth'
           WHEN kind='INFERENCE' THEN 'Unconfirmed inference; do not use as established fact'
           ELSE 'Explicit owner decision; never expands execution authority' END AS interpretation
    FROM knowledge_records k WHERE legal_entity_id=$1 AND superseded_at IS NULL
      AND source_timestamp <= $3 AND expires_at > $3
      AND NOT EXISTS(SELECT 1 FROM executions derived WHERE derived.id=k.execution_id AND derived.capability_id='derive_verified_evidence')
      AND (kind<>'SOURCE_FACT' OR verification_id=(SELECT v.id FROM verifications v WHERE v.execution_id=k.execution_id ORDER BY v.checked_at DESC,v.id DESC LIMIT 1) AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=k.verification_id AND v.result='VERIFIED'))
      AND EXISTS (SELECT 1 FROM unnest(regexp_split_to_array(lower($2),'[^[:alnum:]_]+')) AS words(term)
        WHERE length(term)>2 AND to_tsvector('simple',statement) @@ plainto_tsquery('simple',term))
    ORDER BY source_timestamp DESC,id DESC LIMIT 20`,[legalEntityId,objective.slice(0,4000),now]);
  return rows.rows;
}

// Explicit correction only. A newer task alone does not prove an old fact false.
// No automatic contradiction merging or cross-company supersession.
export async function supersedeKnowledge(client:any, priorId:string, replacementId:string, legalEntityId:string) {
  if(priorId===replacementId) throw new Error("KNOWLEDGE_SELF_SUPERSESSION");
  const rows=await client.query(`SELECT * FROM knowledge_records WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE`,[[priorId,replacementId]]);
  const old=rows.rows.find((r:any)=>r.id===priorId), next=rows.rows.find((r:any)=>r.id===replacementId);
  if(!old||!next||old.legal_entity_id!==legalEntityId||next.legal_entity_id!==legalEntityId||
     old.kind!==next.kind||old.superseded_at||next.superseded_at||
     new Date(next.source_timestamp)<=new Date(old.source_timestamp)||new Date(next.expires_at)<=new Date()) {
    throw new Error("KNOWLEDGE_INVALID_SUPERSESSION");
  }
  await client.query("UPDATE knowledge_records SET superseded_at=now() WHERE id=$1",[priorId]);
  await client.query("UPDATE knowledge_records SET supersedes=$2 WHERE id=$1",[replacementId,priorId]);
}

// Internal trusted entry point, not a model-callable tool. Owner decisions require
// an existing scoped approval bound to the exact statement; model text is insufficient.
export async function recordKnowledgeAnnotation(client:any,input:{
  goalId:string;kind:'INFERENCE'|'OWNER_DECISION';statement:string;approvalId?:string;
}) {
  if(!knowledgeEnabled()) throw new Error('KNOWLEDGE_DISABLED');
  if(!input.statement.trim()||input.statement.length<3||input.statement.length>1500)throw new Error('KNOWLEDGE_INVALID_STATEMENT');
  const goal=(await client.query('SELECT company_scope FROM goals WHERE id=$1',[input.goalId])).rows[0];
  if(!goal?.company_scope)throw new Error('KNOWLEDGE_ENTITY_REQUIRED');
  let approvedBy:null|string=null;
  if(input.kind==='OWNER_DECISION'){
    const approval=(await client.query(`SELECT approved_by FROM approvals WHERE id=$1 AND goal_id=$2
      AND legal_entity_id=$3 AND capability_id='knowledge_owner_decision'
      AND params_hash=$4 AND status='APPROVED' AND expiry_at>now()`,
      [input.approvalId??null,input.goalId,goal.company_scope,sha256Hex({statement:input.statement})])).rows[0];
    if(!approval?.approved_by?.trim())throw new Error('KNOWLEDGE_OWNER_APPROVAL_REQUIRED');
    approvedBy=approval.approved_by;
  }else if(input.kind!=='INFERENCE')throw new Error('KNOWLEDGE_INVALID_KIND');
  const inserted=await client.query(`INSERT INTO knowledge_records
    (legal_entity_id,kind,statement,goal_id,source_key,source_timestamp,expires_at,approved_by,approval_id)
    VALUES($1,$2,$3,$4,$5,now(),now()+interval '30 days',$6,$7)
    ON CONFLICT(legal_entity_id,kind,goal_id,source_key) DO UPDATE SET source_key=EXCLUDED.source_key RETURNING id`,
    [goal.company_scope,input.kind,input.statement,input.goalId,sha256Hex({kind:input.kind,statement:input.statement}),approvedBy,input.kind==='OWNER_DECISION'?input.approvalId:null]);
  return inserted.rows[0].id;
}
