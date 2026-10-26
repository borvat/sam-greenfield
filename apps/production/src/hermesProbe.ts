/** Bounded SUM acceptance probe, not a general planner or coding sandbox. */
import {pool,withTransaction} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {HermesClient} from '../../../packages/hermes/src/client';
import {withHermesCandidate,HERMES_CAPABILITY} from './hermesBundle';
import {validateProductionBundle} from './bundle';
import {transitionGoal} from '../../kernel/src/stateMachine';
import {persistPlanAndDelegate} from '../../kernel/src/planning';
import {evaluatePlanAuthority} from '../../brain/src/authorityGuard';
import {reviewNextReadGoal} from './readGoalReview';
import {sumProbe} from '../../../packages/hermes/src/probeObjective';
export {sumProbe} from '../../../packages/hermes/src/probeObjective';
export function hermesProbeBundle(client:HermesClient){
  return validateProductionBundle(withHermesCandidate({capabilities:[],toolDefinitions:[],toolAdapters:[],workerLeaseTtlSeconds:180},{client,
    verifier:{capabilityId:HERMES_CAPABILITY,async verify(input){
      const row=(await pool.query(`SELECT g.objective,e.result,e.evidence FROM executions e JOIN goals g ON g.id=e.goal_id
        WHERE e.id=$1 AND e.capability_id=$2 AND g.domain='hermes_probe' AND g.current_plan_id=e.plan_id`,[input.execution.id,HERMES_CAPABILITY])).rows[0];
      if(!row)return {result:'FAILED',verifier:'sam-hermes-postgres-independent',evidence:{reason:'PROBE_EXECUTION_SCOPE_DENIED'}};
      const {a,b}=sumProbe(row.objective);
      const expected=(await pool.query('SELECT ($1::bigint+$2::bigint)::text AS answer',[a,b])).rows[0].answer;
      const valid=typeof row.result?.candidate==='string'&&row.result.candidate.trim()===expected&&
        sha256Hex(row.result.candidate)===row.evidence.candidateHash&&sha256Hex(input.execution.result)===sha256Hex(row.result);
      return {result:valid?'VERIFIED':'FAILED',verifier:'sam-hermes-postgres-independent',evidence:{candidateHash:sha256Hex(row.result?.candidate??null),
        independentCheck:'native PostgreSQL bigint addition over original goal operands',expected,matched:valid}};
    }}}));
}
export async function prepareHermesProbe(bundle:ReturnType<typeof hermesProbeBundle>,goalId:string,entity:string,activatedAt:string){
  return withTransaction(async c=>{
    const g=(await c.query(`SELECT * FROM goals WHERE id=$1 AND company_scope=$2 AND domain='hermes_probe'
      AND authority_ceiling='GREEN' AND completion_definition='sam.read_report.v1' AND created_at>=$3 AND state='NEW' FOR UPDATE`,[goalId,entity,activatedAt])).rows[0];
    if(!g)return false;
    const used=Number((await c.query('SELECT count(*)::int n FROM work_queue WHERE capability_id=$1',[HERMES_CAPABILITY])).rows[0].n);
    if(used>=4)throw Error('HERMES_PROBE_TASK_CEILING');
    const p=sumProbe(g.objective),params={agent_role:'tester',instructions:p.instructions};
    const authority=await evaluatePlanAuthority(c,{goalId,legalEntityId:entity,steps:[{capabilityId:HERMES_CAPABILITY,params}],capabilityPolicies:bundle.catalog.authorityPolicies()});
    if(!authority.authorized)throw Error('HERMES_PROBE_AUTHORITY_DENIED');
    await transitionGoal(c,goalId,'NEW','MODELING','bounded_hermes_probe');
    await transitionGoal(c,goalId,'MODELING','PLANNING','deterministic_single_step_integration_probe');
    await persistPlanAndDelegate(c,{goalId,assumptions:{integrationProbe:true,planner:'deterministic SUM grammar, no model planning'},steps:[{capabilityId:HERMES_CAPABILITY,params}]});
    return true;
  });
}
export async function reviewHermesProbe(bundle:ReturnType<typeof hermesProbeBundle>,goalId:string){
  return reviewNextReadGoal(bundle,pool,async(input:any)=>{
    const row=(await pool.query(`SELECT e.id,e.result,g.objective,v.independent_evidence FROM executions e JOIN goals g ON g.id=e.goal_id
      JOIN verifications v ON v.execution_id=e.id AND v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
      WHERE g.id=$1 AND g.domain='hermes_probe' AND g.current_plan_id=e.plan_id AND e.capability_id=$2
      AND v.verifier='sam-hermes-postgres-independent'`,[goalId,HERMES_CAPABILITY])).rows[0];
    if(!row)throw Error('HERMES_PROBE_VERIFIED_EVIDENCE_REQUIRED');
    const {a,b}=sumProbe(row.objective),answer=(await pool.query('SELECT ($1::bigint+$2::bigint)::text answer',[a,b])).rows[0].answer;
    if(row.result.candidate.trim()!==answer||row.independent_evidence.expected!==answer)throw Error('HERMES_PROBE_RESULT_CHANGED');
    if(input.proposedReport)return {accepted:input.proposedReport.summary===`النتيجة: ${answer}`&&input.proposedReport.findings?.[0]?.executionId===row.id,missing:[]};
    const source=input.verifiedObservations.find((s:any)=>s.id===row.id);
    const line=source?.lines.findIndex((s:string)=>s.includes('"candidate"'));
    if(!source||line<0||!source.citableLines.includes(line))throw Error('HERMES_PROBE_CITATION_REQUIRED');
    return {status:'complete',summary:`النتيجة: ${answer}`,requirements:[{requirement:row.objective,fulfilled:true,evidenceIds:[row.id]}],
      findings:[{text:`${a} + ${b} = ${answer}`,executionId:row.id,quoteLine:line,confidence:'HIGH',confidenceBasis:'Independent native PostgreSQL computation over the original goal'}],
      limitations:['اختبار تكامل محدود بلا أدوات؛ لا يثبت البرمجة أو الوصول إلى GitHub أو التخطيط العام.'],steps:[]};
  },{goalId});
}
