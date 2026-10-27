import { withTransaction,pool } from "../../../packages/db/src/client";
import { recordIndependentVerificationAtomic } from "../../kernel/src/verification";
import type { ValidatedProductionBundle } from "./bundle";
import {ANALYST} from './dataAnalysisContract';
import {saveAcceptedFollowupReport} from './hermesSourceFollowup';
import {sha256Hex} from '../../../packages/shared/src/stableJson';

export async function verifyNextExecution(
  bundle:ValidatedProductionBundle
):Promise<{processed:boolean;executionId?:string;verificationId?:string}>{
  const candidate=await withTransaction(async(client)=>{
    const res=await client.query(
      `SELECT e.id,e.capability_id,e.params,e.result,e.evidence,e.operation_key_ref,
              g.domain AS goal_domain,g.objective AS goal_objective,p.goal_assumptions AS plan_assumptions,
              p.goal_assumptions->'sourceReuse' AS source_reuse,
              vc.id AS contract_id,vc.verification_method,
              vc.required_evidence_fields,vc.independent_query_template
         FROM executions e
         JOIN goals g ON g.id=e.goal_id
         JOIN plans p ON p.id=e.plan_id AND p.goal_id=g.id
         JOIN verification_contracts vc ON vc.capability_id=e.capability_id
        WHERE g.state IN ('EXECUTING','VERIFYING') AND g.current_plan_id=e.plan_id
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

  const lease=await pool.connect();
  let locked=false;
  try{
  locked=(await lease.query("SELECT pg_try_advisory_lock(hashtext($1)) AS locked",["verify:"+candidate.id])).rows[0].locked;
  if(!locked)return {processed:false};
  // Recheck after acquiring the cross-worker lock; another verifier may have
  // completed the candidate since the initial selection.
  const eligible=await lease.query(`SELECT e.id FROM executions e JOIN goals g ON g.id=e.goal_id WHERE e.id=$1 AND g.state IN ('EXECUTING','VERIFYING') AND e.status='EXECUTED' AND e.plan_id=g.current_plan_id AND NOT EXISTS(SELECT 1 FROM verifications v WHERE v.execution_id=e.id)`,[candidate.id]);
  if(!eligible.rowCount)return {processed:false};
  const outcome=await verifier.verify({
    execution:{
      id:candidate.id,
      capabilityId:candidate.capability_id,
      params:candidate.params??{},
      result:candidate.result??{},
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
    result:outcome.result,
    ...(candidate.capability_id===ANALYST&&candidate.goal_domain==='hermes_data_analysis'&&candidate.source_reuse?{terminalFailure:true,onAccepted:(client,context)=>saveAcceptedFollowupReport(client,{
      ...context,expectedResultHash:sha256Hex(candidate.result),expectedEvidenceHash:sha256Hex(candidate.evidence),
      expectedObjective:candidate.goal_objective,expectedPlanAssumptionsHash:sha256Hex(candidate.plan_assumptions)})}:{})
  });

  return {processed:true,executionId:candidate.id,verificationId};
  }finally{try{if(locked)await lease.query("SELECT pg_advisory_unlock(hashtext($1))",["verify:"+candidate.id])}finally{lease.release()}}
}
