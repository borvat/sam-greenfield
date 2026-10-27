import {z} from 'zod';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {validateGoalAcceptance} from '../../kernel/src/goalAcceptance';
import {ANALYST,SOURCE,ANALYSIS_MARKER} from './dataAnalysisContract';

export const ANALYSIS_FOLLOWUP_TOOL='sam_submit_analysis_followup';
export const ANALYSIS_FOLLOWUP_MAX_WINDOW_MS=30*60*1000;
const hash=z.string().regex(/^[a-f0-9]{64}$/),date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sourceBindingSchema=z.object({
 sourceExecutionId:z.uuid(),sourceGoalId:z.uuid(),sourcePlanId:z.uuid(),sourceVerificationId:z.uuid(),
 sourceHash:hash,sourceExecutionHash:hash,sourcePlanHash:hash,legalEntityId:z.uuid(),
 startDate:date,endDate:date,timeZone:z.literal('Europe/Amsterdam')
}).strict();
export type AnalysisSourceBinding=z.infer<typeof sourceBindingSchema>;
export const ANALYSIS_SOURCE_BINDING_SCHEMA=z.toJSONSchema(sourceBindingSchema,{target:'draft-7'});
const followupInputSchema=z.object({objective:z.string().trim().min(1).max(4000),legal_entity_id:z.uuid(),source_binding:sourceBindingSchema}).strict();
export function validateFollowupInput(value:unknown){
 const input=followupInputSchema.parse(value);
 return {objective:input.objective,legalEntityId:input.legal_entity_id.toLowerCase(),sourceBinding:validateSourceBinding(input.source_binding)};
}
export function validateSourceBinding(value:unknown):AnalysisSourceBinding{
 const binding=sourceBindingSchema.parse(value);
 for(const key of ['sourceExecutionId','sourceGoalId','sourcePlanId','sourceVerificationId','legalEntityId'] as const)binding[key]=binding[key].toLowerCase();
 for(const value of [binding.startDate,binding.endDate])if(new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('ANALYSIS_SOURCE_PERIOD_DENIED');
 if(binding.startDate>binding.endDate)throw Error('ANALYSIS_SOURCE_PERIOD_DENIED');
 return binding;
}
export function sourceFollowupAcceptance(binding:AnalysisSourceBinding){
 return validateGoalAcceptance({version:1,constraints:Object.entries({legalEntityId:binding.legalEntityId,
  sourceExecutionId:binding.sourceExecutionId,sourceHash:binding.sourceHash,sourceVerificationId:binding.sourceVerificationId,
  sourceBindingHash:sha256Hex(binding),sourceStartDate:binding.startDate,sourceEndDate:binding.endDate,
  sourceTimeZone:binding.timeZone,sourceLinked:true,analysisValid:true}).map(([field,equals])=>({
   capabilityId:ANALYST,params:{agent_role:'data_analyst',instructions:ANALYSIS_MARKER},result:{field,equals}}))});
}

/** Exact immutable provenance; never import or fabricate a source execution. */
export async function loadVerifiedFollowupSource(db:any,raw:unknown,entity:string){
 const binding=validateSourceBinding(raw);
 if(binding.legalEntityId!==entity)throw Error('ANALYSIS_SOURCE_SCOPE_DENIED');
 // Runtime can only SELECT contract metadata; lock mutable proof rows, not vc.
 const source=(await db.query(`SELECT e.id,e.goal_id,e.plan_id,e.plan_hash,e.execution_hash,e.result,e.evidence,
   e.queue_id,e.capability_id,e.params,e.fencing_token,e.operation_key_ref,
   sp.version AS source_plan_version,sp.goal_assumptions AS source_plan_assumptions,sp.constraints AS source_plan_constraints,
   sp.dependencies AS source_plan_dependencies,sp.steps AS source_plan_steps,
   v.id AS verification_id,v.independent_evidence,sg.company_scope
   FROM executions e JOIN work_queue sw ON sw.id=e.queue_id AND sw.goal_id=e.goal_id AND sw.plan_id=e.plan_id
   JOIN goals sg ON sg.id=e.goal_id JOIN plans sp ON sp.id=e.plan_id AND sp.goal_id=sg.id AND sp.plan_hash=e.plan_hash
   JOIN verifications v ON v.execution_id=e.id AND v.execution_hash=e.execution_hash AND v.plan_hash=e.plan_hash
   JOIN verification_contracts vc ON vc.id=v.contract_id AND vc.capability_id=e.capability_id
   WHERE e.id=$1 AND e.goal_id=$2 AND e.plan_id=$3 AND v.id=$4
   AND e.capability_id=$5 AND e.status='EXECUTED' AND sw.capability_id=e.capability_id AND sw.step_key='source' AND sw.status='EXECUTED'
   AND sg.domain='hermes_data_analysis' AND sg.state='FAILED' AND sg.current_plan_id=e.plan_id
   AND v.result='VERIFIED' AND v.verifier<>e.actor AND vc.must_not_trust_execution_result=true
   FOR SHARE OF e,sw,sg,sp,v`,[binding.sourceExecutionId,binding.sourceGoalId,binding.sourcePlanId,binding.sourceVerificationId,SOURCE])).rows[0];
 if(!source||source.company_scope!==entity||source.plan_hash!==binding.sourcePlanHash||source.execution_hash!==binding.sourceExecutionHash||
   source.evidence?.reportHash!==binding.sourceHash||sha256Hex(source.result?.report)!==binding.sourceHash||
   source.independent_evidence?.reportHash!==binding.sourceHash||source.independent_evidence?.matches!==true||
   source.result?.coverageComplete!==true||source.result?.startDate!==binding.startDate||source.result?.endDate!==binding.endDate||
   source.result?.timeZone!==binding.timeZone||source.result?.report?.period?.startDate!==binding.startDate||
   source.result?.report?.period?.endDate!==binding.endDate||source.result?.report?.period?.timeZone!==binding.timeZone||
   source.result?.report?.coverage?.pagination!=='every requested collection reached an empty terminal page')
  throw Error('ANALYSIS_VERIFIED_SOURCE_BINDING_DENIED');
 const executionHash=sha256Hex({queue_id:source.queue_id,goal_id:source.goal_id,plan_id:source.plan_id,plan_hash:source.plan_hash,
  capability_id:source.capability_id,params:source.params??{},result:source.result,evidence:source.evidence,
  fencing_token:Number(source.fencing_token),operation_key_ref:source.operation_key_ref??null});
 const planHash=sha256Hex({goal_id:source.goal_id,version:Number(source.source_plan_version),assumptions:source.source_plan_assumptions??{},
  constraints:source.source_plan_constraints??{},dependencies:source.source_plan_dependencies??{},steps:source.source_plan_steps});
 if(executionHash!==binding.sourceExecutionHash||planHash!==binding.sourcePlanHash)throw Error('ANALYSIS_SOURCE_CANONICAL_HASH_DENIED');
 return {source,binding};
}

/** Called only after independent verification and acceptance, in their transaction. */
export async function saveAcceptedFollowupReport(db:any,input:{goalId:string;planId:string;executionId:string;verificationId:string;expectedResultHash:string;expectedEvidenceHash:string;expectedObjective:string;expectedPlanAssumptionsHash:string}){
 const row=(await db.query(`SELECT e.result,e.evidence,g.company_scope,g.domain,g.objective,p.goal_assumptions,
   v.independent_evidence AS accepted_evidence,w.handoff
   FROM executions e JOIN goals g ON g.id=e.goal_id JOIN plans p ON p.id=e.plan_id AND p.goal_id=g.id
   JOIN work_queue w ON w.id=e.queue_id AND w.goal_id=g.id AND w.plan_id=p.id AND w.status='EXECUTED'
   JOIN verifications v ON v.execution_id=e.id AND v.execution_hash=e.execution_hash AND v.plan_hash=e.plan_hash
   WHERE e.id=$1 AND e.goal_id=$2 AND e.plan_id=$3 AND v.id=$4 AND v.result='VERIFIED'
   AND g.current_plan_id=e.plan_id AND g.state='VERIFYING' FOR SHARE OF p,w`,
  [input.executionId,input.goalId,input.planId,input.verificationId])).rows[0];
 if(!row||row.domain!=='hermes_data_analysis'||!row.goal_assumptions?.sourceReuse)throw Error('ANALYSIS_FOLLOWUP_REPORT_SCOPE_DENIED');
 if(sha256Hex(row.result)!==input.expectedResultHash||sha256Hex(row.evidence)!==input.expectedEvidenceHash)throw Error('ANALYSIS_FOLLOWUP_VERIFICATION_PAYLOAD_CHANGED');
 if(row.objective!==input.expectedObjective||sha256Hex(row.goal_assumptions)!==input.expectedPlanAssumptionsHash)throw Error('ANALYSIS_FOLLOWUP_VERIFICATION_CONTEXT_CHANGED');
 const {source,binding}=await loadVerifiedFollowupSource(db,row.goal_assumptions.sourceReuse,row.company_scope),r=row.result;
 if(sha256Hex(r.sourceReuse)!==sha256Hex(binding)||r.sourceBindingHash!==sha256Hex(binding)||
   sha256Hex(r.report?.sourceReuse)!==sha256Hex(binding)||r.report?.sourceExecutionId!==source.id||r.report?.sourceHash!==binding.sourceHash||
   sha256Hex(r.report?.source)!==binding.sourceHash||sha256Hex(r.report)!==row.evidence?.reportHash||
   row.accepted_evidence?.reportHash!==sha256Hex(r.report)||row.accepted_evidence?.candidateHash!==sha256Hex(r.candidate)||
   row.accepted_evidence?.sourceBindingHash!==sha256Hex(binding)||row.accepted_evidence?.receiptHash!==sha256Hex(row.handoff?.hermes))
  throw Error('ANALYSIS_FOLLOWUP_REPORT_BINDING_DENIED');
 const decision={status:'complete',summary:r.report.interpretation.summary,classification:'MODEL_INFERENCE',
  sourceReuse:binding,executionId:input.executionId,verificationId:input.verificationId,report:r.report};
 const reportHash=sha256Hex(decision);
 const saved=(await db.query(`INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash)
   VALUES($1,$2,1,$3::jsonb,$4) ON CONFLICT(goal_id,plan_id) DO NOTHING RETURNING id,report_hash`,
  [input.goalId,input.planId,JSON.stringify(decision),reportHash])).rows[0];
 if(saved)return saved.id as string;
 const previous=(await db.query('SELECT id,report_hash FROM goal_read_reviews WHERE goal_id=$1 AND plan_id=$2',[input.goalId,input.planId])).rows[0];
 if(previous?.report_hash!==reportHash)throw Error('ANALYSIS_FOLLOWUP_REPORT_CONFLICT');
 return previous.id as string;
}
