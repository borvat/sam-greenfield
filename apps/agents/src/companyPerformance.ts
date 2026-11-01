import type {PoolClient} from 'pg';
import {authorizedCompany,uuidPattern,type OwnerContext} from '../../../packages/shared/src/ownerScope';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
export function performanceRank(input:{verified:number;failed:number;knownCost:boolean;authorityBreaches:number|null;distinctDays:number}){
 const labels=['متدرّب','مبتدئ','محترف','خبير','أسطورة'];
 if(!Number.isSafeInteger(input.verified)||input.verified<5||!Number.isSafeInteger(input.failed)||input.failed<0||!Number.isSafeInteger(input.distinctDays)||input.distinctDays<1||!input.knownCost||input.authorityBreaches===null||!Number.isSafeInteger(input.authorityBreaches)||input.authorityBreaches<0)return {rank:null,label:'لم يُقيّم',reason:'Requires 5 independently verified attributable results, complete reviewed cost coverage and assessed authority compliance',permissionsChanged:false};
 const quality=input.verified/(input.verified+input.failed);let level=0;
 if(input.authorityBreaches===0&&quality>=0.95)for(const [index,count,days] of [[1,10,3],[2,30,7],[3,100,30],[4,300,90]])if(input.verified>=count&&input.distinctDays>=days)level=index;
 return {rank:level,label:labels[level],reason:{...input,quality,thresholds:'10/3d,30/7d,100/30d,300/90d; quality>=95%; no authority breach'},permissionsChanged:false};
}
export function staffPerformanceEvidence(company:string,profileId:string,rows:any[],calls:any[]){
 const verified=rows.filter(w=>w.verified_independently&&w.execution_id&&w.evidence?.specialist_agent_id);
 const failed=rows.filter(w=>w.verification_result==='FAILED'||w.status==='FAILED');
 const known=(cost:unknown)=>cost!==null&&cost!==undefined&&Number.isFinite(Number(cost))&&Number(cost)>=0;
 const ledgerCoverageEligible=verified.length>=5&&rows.filter(w=>w.execution_id||['FAILED','LEASED','EXECUTING'].includes(w.status)).every(w=>{const linked=calls.filter(call=>call.queue_id===w.queue_id);return linked.length>0&&linked.every(call=>known(call.cost));});
 const source={companyId:company,profileId,scope:'LATEST_500_COMPANY_QUEUE_ITEMS',work:rows.map(w=>({queueId:w.queue_id,planId:w.plan_id,currentPlanId:w.current_plan_id,status:w.status,executionId:w.execution_id,actor:w.actor,specialist:w.evidence?.specialist_agent_id,verificationId:w.verification_id,verification:w.verification_result,independent:w.verified_independently,verifier:w.verifier,checkedAt:w.checked_at?new Date(w.checked_at).toISOString():null,resultHash:sha256Hex(w.result??null),evidenceHash:sha256Hex(w.evidence??null),finishedAt:w.finished_at?new Date(w.finished_at).toISOString():null})).sort((a,b)=>a.queueId.localeCompare(b.queueId)),ledger:calls.map(call=>({id:call.id,queueId:call.queue_id,cost:known(call.cost)?Number(call.cost):null})).sort((a,b)=>a.id.localeCompare(b.id))};
 return {sourceHash:sha256Hex(source),verified:verified.length,failed:failed.length,distinctDays:new Set(verified.map(w=>new Date(w.finished_at).toISOString().slice(0,10))).size,ledgerCoverageEligible,
  coverage:'Latest execution per queue within latest 500 company queue items; ledger links alone do not prove complete cost coverage',actors:[...new Set(rows.flatMap(w=>[w.actor,w.evidence?.specialist_agent_id]).filter(Boolean).map(String))],ledgerCallIds:calls.map(call=>call.id),verificationIds:verified.map(w=>w.verification_id)};
}
export async function currentStaffAssessments(c:PoolClient,company:string){
 if(!(await c.query("SELECT to_regclass('audit_log') IS NOT NULL ready")).rows[0].ready)return [];
 return (await c.query(`SELECT DISTINCT ON(after_ref->>'profileId') id,actor,timestamp,after_ref FROM audit_log
  WHERE entity_type='legal_entity' AND entity_id=$1 AND action='COMPANY_PERFORMANCE_ASSESSED'
  ORDER BY after_ref->>'profileId',timestamp DESC,id DESC`,[company])).rows;
}
/** Explicit independent human assessment, bound to the current stored evidence; never a permission grant. */
export async function assessCompanyPerformance(c:PoolClient,context:OwnerContext,input:{profileId:string;sourceHash:string;approved:boolean;completeCostCoverage:boolean;authorityBreaches:number;evidenceRefs:string[]}){
 const company=await authorizedCompany(c,context);
 if(input.approved!==true||input.completeCostCoverage!==true||!Number.isSafeInteger(input.authorityBreaches)||input.authorityBreaches<0||!/^[0-9a-f]{64}$/.test(input.sourceHash)||!Array.isArray(input.evidenceRefs)||input.evidenceRefs.length<1||input.evidenceRefs.length>20||input.evidenceRefs.some(ref=>!uuidPattern.test(ref)))throw Error('PERFORMANCE_REVIEW_REQUIRED');
 const {companyStaffSnapshot,companyProfile}=await import('./company');companyProfile(input.profileId);
 const snapshot=await companyStaffSnapshot(c,context);const profile=snapshot.profiles.find(p=>p.id===input.profileId)!;
 const evidence=profile.performance;
 if(!('sourceHash' in evidence)||evidence.sourceHash!==input.sourceHash||!evidence.ledgerCoverageEligible||evidence.actors.includes(context.actor))throw Error('PERFORMANCE_SOURCE_REVIEW_DENIED');
 const refs=(await c.query(`SELECT id FROM audit_log WHERE id=ANY($1::uuid[]) AND ((entity_type='legal_entity' AND entity_id=$2)
  OR EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope=$2))`,[input.evidenceRefs,company])).rows;
 if(new Set(refs.map(r=>r.id)).size!==new Set(input.evidenceRefs).size)throw Error('PERFORMANCE_REVIEW_EVIDENCE_REQUIRED');
 await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',['company-performance:'+company+':'+input.profileId]);
 const prior=(await currentStaffAssessments(c,company)).find(row=>row.after_ref.profileId===input.profileId&&row.after_ref.sourceHash===input.sourceHash);
 if(prior&&prior.after_ref.authorityBreaches===input.authorityBreaches&&sha256Hex([...prior.after_ref.evidenceRefs].sort())===sha256Hex([...input.evidenceRefs].sort()))return prior;
 const assessment={schema:'sam.staff_assessment.v1',profileId:input.profileId,sourceHash:input.sourceHash,authorityBreaches:input.authorityBreaches,completeCostCoverage:true,evidenceRefs:input.evidenceRefs,verificationIds:evidence.verificationIds,ledgerCallIds:evidence.ledgerCallIds,trust:'EXPLICIT_INDEPENDENT_REVIEW; not automatic truth',permissionsChanged:false};
 return (await c.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES($1,'COMPANY_PERFORMANCE_ASSESSED','legal_entity',$2,$3::jsonb,'explicit_company_performance_review','GREEN','ASSESSED') RETURNING id,actor,timestamp,after_ref`,[context.actor,company,JSON.stringify(assessment)])).rows[0];
}
