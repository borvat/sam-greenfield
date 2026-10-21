import { recordKnowledgeAnnotation, knowledgeEnabled } from '../../brain/src/knowledge';
import { businessDate } from '../../production/src/bolAnalysis';
import { sha256Hex } from '../../../packages/shared/src/stableJson';
import { calculateAnalysis, SOURCE_CAPABILITIES } from './analysis';
import { Access, AnalysisInput, Evidence, Ref, enabled, integer, invariant, period, requireEnabled, sum, text, unwrap } from './model';
export const COMMERCIAL_LESSON_PREFIX='[SAM_COMMERCIAL_LESSON_V1] ';

// Internal library only, not a model tool. Caller supplies a dedicated connection.
// Access.actor must come from authenticated application context, never source data.
async function transaction<T>(client:any,access:Access,permission:string,fn:()=>Promise<T>):Promise<T>{
 requireEnabled();text(access.actor,'ACTOR');
 invariant(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(access.legalEntityId),'ENTITY_ID');
 await client.query('BEGIN');
 try{
  await client.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[access.legalEntityId]);
  const grant=await client.query('SELECT 1 FROM commercial_grants WHERE legal_entity_id=$1 AND actor=$2 AND permission=$3',[access.legalEntityId,access.actor,permission]);
  invariant(grant.rows.length===1,'PERMISSION_DENIED');
  const value=await fn();await client.query('COMMIT');return value;
 }catch(error){await client.query('ROLLBACK');throw error;}
}
async function entityGoal(client:any,id:string,entity:string){
 const goal=(await client.query('SELECT id FROM goals WHERE id=$1 AND company_scope=$2',[id,entity])).rows[0];invariant(goal,'GOAL_SCOPE');
}
function allRefs(input:AnalysisInput):Ref[]{
 return [input.account,...input.orders,...(input.inventory?[input.inventory]:[]),...input.products.flatMap(p=>[p.identity,p.ledger])];
}
async function verifiedEvidence(client:any,ids:string[],entity:string,goalId:string):Promise<Map<string,Evidence>>{
 invariant(ids.length>0&&ids.length<=1000,'EVIDENCE_LIMIT');
 const clock=new Date((await client.query('SELECT now() AS now')).rows[0].now).getTime();
 const rows=(await client.query(`SELECT e.*,g.company_scope,v.result AS verification_result,v.independent_evidence,
   v.plan_hash AS verified_plan_hash,v.execution_hash AS verified_execution_hash
  FROM executions e JOIN goals g ON g.id=e.goal_id
  JOIN LATERAL(SELECT * FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1) v ON true
  WHERE e.id=ANY($1::uuid[]) AND g.company_scope=$2 AND e.goal_id=$3`,[ids,entity,goalId])).rows;
 invariant(rows.length===ids.length,'EVIDENCE_SCOPE');const output=new Map<string,Evidence>();
 for(const row of rows){
  invariant(SOURCE_CAPABILITIES.includes(row.capability_id)&&row.status==='EXECUTED'&&row.verification_result==='VERIFIED','UNVERIFIED_READ');
  invariant(row.verified_plan_hash===row.plan_hash&&row.verified_execution_hash===row.execution_hash,'VERIFICATION_LINK');
  invariant(row.result?.isError!==true&&row.result?.data?.isError!==true,'SOURCE_ERROR');
  const raw=row.capability_id.startsWith('bol_')?unwrap(row.result?.data??row.result):row.result;
  const hash=sha256Hex(raw),independent=row.independent_evidence;
  // Legacy bol stored the full fresh readback; compare it ourselves, not merely VERIFIED.
  // New hashed verifiers and Google content reads supply matching canonical hashes.
  invariant(independent?.responseHash===hash||(row.capability_id.startsWith('bol_')&&independent?.readback&&sha256Hex(independent.readback)===hash),'READBACK_CHANGED');
  invariant(Number.isFinite(new Date(row.started_at).getTime())&&new Date(row.started_at).getTime()<=clock,'READ_TIME');
  output.set(row.id,{id:row.id,capability:row.capability_id,params:row.params,result:row.result,hash,readAt:new Date(row.started_at).toISOString()});
 }
 return output;
}
async function revalidateAnalysis(client:any,row:any,entity:string){
 const evidence=await verifiedEvidence(client,row.payload.lineage.map((r:any)=>r.executionId),entity,row.goal_id);
 invariant(row.payload.lineage.every((r:any)=>evidence.get(r.executionId)?.hash===r.responseHash),'ANALYSIS_SOURCE_CHANGED');
 invariant(sha256Hex(calculateAnalysis(row.input,evidence,row.payload.retailerId))===row.report_hash,'ANALYSIS_NOT_REPRODUCIBLE');return evidence;
}
export async function analyzeCommercial(client:any,access:Access,input:AnalysisInput){
 return transaction(client,access,'ANALYZE',async()=>{
  await entityGoal(client,input.goalId,access.legalEntityId);
  const clock=new Date((await client.query('SELECT now() AS now')).rows[0].now);
  invariant(input.period.end<businessDate(clock),'ANALYSIS_WINDOW_OPEN');
  const account=(await client.query('SELECT retailer_id FROM commercial_accounts WHERE legal_entity_id=$1',[access.legalEntityId])).rows[0];invariant(account,'ACCOUNT_BINDING_REQUIRED');
  const evidence=await verifiedEvidence(client,[...new Set(allRefs(input).map(r=>r.executionId))],access.legalEntityId,input.goalId);
  const payload=calculateAnalysis(input,evidence,account.retailer_id);
  const ref=(r:Ref)=>({executionId:r.executionId,path:r.path});
  const normalized={goalId:input.goalId,account:ref(input.account),orders:input.orders.map(ref),...(input.inventory?{inventory:ref(input.inventory)}:{}),
   period:{start:input.period.start,end:input.period.end},products:input.products.map(p=>({sku:p.sku,ean:p.ean,identity:ref(p.identity),ledger:ref(p.ledger)}))};
  const inputHash=sha256Hex({input:normalized,lineage:payload.lineage});
  const inserted=await client.query(`INSERT INTO commercial_analyses(legal_entity_id,goal_id,input_hash,input,report_hash,payload,actor)
   VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(legal_entity_id,goal_id,input_hash)
   DO UPDATE SET input_hash=EXCLUDED.input_hash RETURNING id`,[access.legalEntityId,input.goalId,inputHash,normalized,sha256Hex(payload),payload,access.actor]);
  return {id:inserted.rows[0].id,...payload};
 });
}
async function analysis(client:any,id:string,entity:string){
 const row=(await client.query('SELECT * FROM commercial_analyses WHERE id=$1 AND legal_entity_id=$2',[id,entity])).rows[0];invariant(row,'ANALYSIS_SCOPE');invariant(sha256Hex(row.payload)===row.report_hash,'REPORT_HASH');return row;
}
export type ExperimentPlan={
 key:string;analysisId:string;hypothesisId:string;sku:string;start:string;end:string;
 metric:'CONTRIBUTION_CENTS';expectedLowCents:number;expectedHighCents:number;minNetUnits:number;
 mode:'OBSERVATION_ONLY';
};
export async function registerCommercialExperiment(client:any,access:Access,plan:ExperimentPlan){
 return transaction(client,access,'EXPERIMENT',async()=>{
  text(plan.key,'EXPERIMENT_KEY');const baseline=await analysis(client,plan.analysisId,access.legalEntityId);
  invariant(Object.keys(plan).every(k=>['key','analysisId','hypothesisId','sku','start','end','metric','expectedLowCents','expectedHighCents','minNetUnits','mode'].includes(k)),'EXPERIMENT_UNKNOWN_FIELD');
  await revalidateAnalysis(client,baseline,access.legalEntityId);
  const window=period({start:plan.start,end:plan.end});
  invariant(plan.mode==='OBSERVATION_ONLY'&&plan.metric==='CONTRIBUTION_CENTS','EXPERIMENT_ACTION_DENIED');
  integer(plan.expectedLowCents,'PREDICTION',true);integer(plan.expectedHighCents,'PREDICTION',true);integer(plan.minNetUnits,'SAMPLE');
  invariant(plan.expectedLowCents<=plan.expectedHighCents&&plan.minNetUnits>0,'PREDICTION_RANGE');
  invariant(baseline.payload.hypotheses.some((h:any)=>h.id===plan.hypothesisId&&h.sku===plan.sku),'HYPOTHESIS_SCOPE');
  const hash=sha256Hex(plan);
  const existing=(await client.query('SELECT * FROM commercial_experiments WHERE legal_entity_id=$1 AND experiment_key=$2 FOR UPDATE',[access.legalEntityId,plan.key])).rows[0];
  if(existing){invariant(existing.plan_hash===hash,'EXPERIMENT_IMMUTABLE');return {id:existing.id,replay:true};}
  const clock=(await client.query('SELECT now() AS now')).rows[0].now;
  invariant(window.start>businessDate(new Date(clock)),'PREREGISTRATION_REQUIRED');
  invariant(window.start>baseline.payload.period.end&&window.days===baseline.payload.period.days,'NONCOMPARABLE_WINDOW');
  const row=(await client.query(`INSERT INTO commercial_experiments(legal_entity_id,experiment_key,analysis_id,hypothesis_id,plan,plan_hash,actor)
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[access.legalEntityId,plan.key,plan.analysisId,plan.hypothesisId,plan,hash,access.actor])).rows[0];
  return {id:row.id,replay:false};
 });
}
export async function evaluateCommercialExperiment(client:any,access:Access,experimentId:string,outcomeAnalysisId:string){
 return transaction(client,access,'EXPERIMENT',async()=>{
  const exp=(await client.query('SELECT * FROM commercial_experiments WHERE id=$1 AND legal_entity_id=$2 FOR UPDATE',[experimentId,access.legalEntityId])).rows[0];invariant(exp,'EXPERIMENT_SCOPE');
  invariant(sha256Hex(exp.plan)===exp.plan_hash,'PLAN_HASH');
  if(exp.result){
   invariant(sha256Hex(exp.result)===exp.result_hash,'RESULT_HASH');invariant(exp.outcome_analysis_id===outcomeAnalysisId,'OUTCOME_IMMUTABLE');
   for(const id of [exp.analysis_id,exp.outcome_analysis_id])await revalidateAnalysis(client,await analysis(client,id,access.legalEntityId),access.legalEntityId);
   return exp.result;
  }
  const outcome=await analysis(client,outcomeAnalysisId,access.legalEntityId),baseline=await analysis(client,exp.analysis_id,access.legalEntityId),plan=exp.plan;
  invariant(outcome.payload.period.start===plan.start&&outcome.payload.period.end===plan.end&&outcome.payload.retailerId===baseline.payload.retailerId,'OUTCOME_SCOPE');
  const row=outcome.payload.products.find((r:any)=>r.sku===plan.sku),before=baseline.payload.products.find((r:any)=>r.sku===plan.sku);
  invariant(row&&before&&row.ean===before.ean&&row.currency===before.currency,'OUTCOME_PRODUCT');
  // Recheck evidence, including any later failed verification, before using an old analysis.
  await revalidateAnalysis(client,baseline,access.legalEntityId);
  const refreshed=await revalidateAnalysis(client,outcome,access.legalEntityId);
  const clock=new Date((await client.query('SELECT now() AS now')).rows[0].now).getTime();
  invariant(businessDate(new Date(clock))>plan.end,'OUTCOME_WINDOW_OPEN');
  invariant([...refreshed.values()].every(e=>businessDate(new Date(e.readAt))>plan.end),'PREMATURE_OUTCOME_READ');
  const sufficient=row.completeness==='FULLY_COSTED_WITHIN_DECLARED_SCOPE'&&before.completeness==='FULLY_COSTED_WITHIN_DECLARED_SCOPE'&&row.netUnits>=plan.minNetUnits&&before.netUnits>=plan.minNetUnits;
  const actual=row.contributionCents,mid=Math.round(sum([plan.expectedLowCents,plan.expectedHighCents])/2);
  const result={schema:'sam.commercial.experiment-result.v1',status:sufficient?(actual>=plan.expectedLowCents&&actual<=plan.expectedHighCents?'WITHIN_PREDICTION':'OUTSIDE_PREDICTION'):'INCONCLUSIVE',
   sku:plan.sku,currency:'EUR',metric:plan.metric,expectedLowCents:plan.expectedLowCents,expectedHighCents:plan.expectedHighCents,actualCents:actual,errorFromMidpointCents:sum([actual,-mid]),
   baselineCents:before.contributionCents,changeCents:sum([actual,-before.contributionCents]),sampleNetUnits:row.netUnits,
   limitations:['Observational comparison only; no causal attribution or authorization to act.','Uncertainty interval was supplied before the outcome; it is not a statistically calibrated confidence interval.',...(!sufficient?['Missing cost coverage or insufficient sample prevents a conclusive comparison.']:[])],
   evidence:{baselineAnalysisId:exp.analysis_id,outcomeAnalysisId,baseline:baseline.payload.lineage,outcome:outcome.payload.lineage},
   evaluatedAt:new Date(clock).toISOString()};
  await client.query('UPDATE commercial_experiments SET outcome_analysis_id=$2,result=$3,result_hash=$4 WHERE id=$1',[exp.id,outcomeAnalysisId,result,sha256Hex(result)]);return result;
 });
}

// Trusted planning-context read, analogous to PR37 recall. No actor or source can
// turn this contextual knowledge into a capability, permission or owner decision.
export async function enrichCommercialRecall(client:any,legalEntityId:string,knowledge:any[]){
 if(!enabled()||!legalEntityId)return knowledge.filter(k=>!k.statement?.startsWith(COMMERCIAL_LESSON_PREFIX));
 if(knowledge.length===0)return knowledge;
 const rows=(await client.query(`SELECT l.*,k.statement AS knowledge_statement FROM commercial_lessons l
   JOIN knowledge_records k ON k.id=l.knowledge_id AND k.legal_entity_id=l.legal_entity_id
   WHERE l.legal_entity_id=$1 AND l.knowledge_id=ANY($2::uuid[])`,[legalEntityId,knowledge.map(k=>k.id)])).rows;
 const linked=new Map(rows.map((r:any)=>[r.knowledge_id,r]));const output:any[]=[];
 for(const k of knowledge){
  const lesson:any=linked.get(k.id);if(!lesson){if(!k.statement?.startsWith(COMMERCIAL_LESSON_PREFIX))output.push(k);continue;}
  try{
   invariant(k.kind==='INFERENCE'&&k.statement===lesson.payload.statement,'LESSON_LINK');
   const exp=(await client.query('SELECT * FROM commercial_experiments WHERE id=$1 AND legal_entity_id=$2',[lesson.experiment_id,legalEntityId])).rows[0];
   invariant(exp&&sha256Hex(exp.plan)===exp.plan_hash&&sha256Hex(exp.result)===exp.result_hash&&sha256Hex(exp.result)===sha256Hex(lesson.payload.result),'LESSON_EXPERIMENT_LINK');
   const ids=[lesson.payload.result.evidence.baselineAnalysisId,lesson.payload.result.evidence.outcomeAnalysisId];
   for(const id of ids){const a=await analysis(client,id,legalEntityId);await revalidateAnalysis(client,a,legalEntityId);}
   output.push({...k,commercialEvidence:{experimentId:lesson.experiment_id,...lesson.payload.result.evidence,
    confidence:lesson.payload.confidence,authority:'NONE',limitations:lesson.payload.result.limitations}});
  }catch(error){if(!(error instanceof Error&&error.message.startsWith('COMMERCIAL_')))throw error;}
 }
 return output;
}
export async function learnCommercialLesson(client:any,access:Access,experimentId:string){
 return transaction(client,access,'LEARN',async()=>{
  invariant(knowledgeEnabled(),'KNOWLEDGE_DISABLED');
  const exp=(await client.query('SELECT * FROM commercial_experiments WHERE id=$1 AND legal_entity_id=$2 FOR UPDATE',[experimentId,access.legalEntityId])).rows[0];invariant(exp?.result,'EXPERIMENT_NOT_EVALUATED');
  invariant(sha256Hex(exp.plan)===exp.plan_hash&&sha256Hex(exp.result)===exp.result_hash,'EXPERIMENT_HASH');
  for(const id of [exp.analysis_id,exp.outcome_analysis_id]){
   const a=await analysis(client,id,access.legalEntityId);await revalidateAnalysis(client,a,access.legalEntityId);
  }
  const existing=(await client.query('SELECT * FROM commercial_lessons WHERE legal_entity_id=$1 AND experiment_id=$2',[access.legalEntityId,experimentId])).rows[0];
  if(existing){invariant(sha256Hex(existing.payload.result)===exp.result_hash,'LESSON_EXPERIMENT_LINK');return existing;}
  const outcome=await analysis(client,exp.outcome_analysis_id,access.legalEntityId),r=exp.result;
  const statement=COMMERCIAL_LESSON_PREFIX+`Commercial lesson ${experimentId} for SKU ${r.sku}: ${r.status}; observed EUR contribution cents ${r.actualCents}, preregistered range ${r.expectedLowCents} to ${r.expectedHighCents}, midpoint error ${r.errorFromMidpointCents}. Observational inference from attributed verified reads; not causal proof or permission to act.`;
  const knowledgeId=await recordKnowledgeAnnotation(client,{goalId:outcome.goal_id,kind:'INFERENCE',statement});
  const payload={statement,kind:'INFERENCE',result:r,evidence:outcome.payload.lineage,confidence:'LIMITED_OBSERVATIONAL',authority:'NONE'};
  return (await client.query(`INSERT INTO commercial_lessons(legal_entity_id,experiment_id,knowledge_id,payload) VALUES($1,$2,$3,$4) RETURNING *`,[access.legalEntityId,experimentId,knowledgeId,payload])).rows[0];
 });
}
