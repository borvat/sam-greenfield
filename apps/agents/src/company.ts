import {performanceRank,staffPerformanceEvidence,currentStaffAssessments} from './companyPerformance';
export {performanceRank} from './companyPerformance';
import type {PoolClient} from 'pg';
import type {CapabilityCatalog} from './capabilityCatalog';
import {authorizedCompany,type OwnerContext} from '../../../packages/shared/src/ownerScope';
import {COMPANY_ROLE_CONTRACTS,COMPANY_HANDOFF} from './companyManual';

/** Staff are accountable views of existing capability owners, never new executors. */
export const COMPANY_ROSTER=Object.freeze([
 ['operations','مدير العمليات',['orchestration','supervision']],
 ['projects','مدير المشاريع',['project','planning']],
 ['accountant','المحاسب',['accounting','eboekhouden','e_boekhouden']],
 ['finance','المحلل المالي',['finance','reconciliation']],
 ['sales','مسؤول المبيعات',['sales','crm']],
 ['marketplace','مسؤول الأسواق الإلكترونية',['bol','marketplace']],
 ['suppliers','باحث الموردين',['supplier']],
 ['negotiation','مسؤول التفاوض والمتابعة',['communications','gmail','email']],
 ['warehouse','مسؤول المستودعات',['wms','inventory','warehouse']],
 ['shipping','مسؤول الشحن',['shipping','shipment','tracking']],
 ['research','باحث السوق والترندات',['research','search','source']],
 ['content','صانع المحتوى',['documents','document','content','google_docs','drive']],
 ['developer','المبرمج',['coding','hermes']],
 ['systems','مهندس الأنظمة',['system','monitoring','health']],
 ['auditor','المدقق المستقل',['verification','audit']]
].map(([id,title,prefixes])=>Object.freeze({id:id as string,title:title as string,prefixes:Object.freeze(prefixes as string[]),
 ...COMPANY_ROLE_CONTRACTS[id as string],responsibilities:Object.freeze([...COMPANY_ROLE_CONTRACTS[id as string].responsibilities]),acceptance:Object.freeze([...COMPANY_ROLE_CONTRACTS[id as string].acceptance]),handoff:COMPANY_HANDOFF,maxConcurrency:1,budget:'EXISTING_GOAL_BUDGET_ONLY',
 authority:'EXISTING_CAPABILITY_AUTHORITY_ONLY',handback:'Existing queue handback; owner escalation on blocked authority or missing capability'})));
export function companyProfile(id:string){const profile=COMPANY_ROSTER.find(p=>p.id===id);if(!profile)throw Error('COMPANY_PROFILE_UNKNOWN');return profile;}
export function profileForCapability(capability:string,ownerId?:string):string|null{
 const normalized=capability.toLowerCase().replace(/^google_mcp_/, '');
 const matched=COMPANY_ROSTER.find(p=>p.prefixes.some(prefix=>normalized===prefix||normalized.startsWith(prefix+'_')||normalized.startsWith(prefix+'.')))?.id;
 return matched??({documents:'content',communications:'negotiation',marketplace:'marketplace',accounting:'accountant',finance:'finance',hermes:'developer'} as Record<string,string>)[ownerId??'']??null;
}
export function companyCapabilities(catalog:CapabilityCatalog,profileId:string){
 companyProfile(profileId);
 return catalog.planningDescriptors().filter(c=>profileForCapability(c.capabilityId,catalog.specialists.ownerOf(c.capabilityId).agentId)===profileId).map(c=>({
  capabilityId:c.capabilityId,owner:catalog.specialists.ownerOf(c.capabilityId).agentId,authority:c.authorityClass}));
}
/** Only annotate an already-authorized durable queue item. Normal lease/executor guards remain mandatory. */
export async function assignCompanyWork(c:PoolClient,context:OwnerContext,input:{queueId:string;profileId:string}){
 const company=await authorizedCompany(c,context);companyProfile(input.profileId);
 const row=(await c.query(`SELECT w.id,w.capability_id,w.company_profile_id,w.handoff FROM work_queue w JOIN goals g ON g.id=w.goal_id
  WHERE w.id=$1 AND g.company_scope=$2 FOR UPDATE OF w`,[input.queueId,company])).rows[0];
 if(!row||profileForCapability(row.capability_id,row.handoff?.agent_id)!==input.profileId)throw Error('COMPANY_ASSIGNMENT_DENIED');
 if(row.company_profile_id&&row.company_profile_id!==input.profileId)throw Error('COMPANY_ASSIGNMENT_IMMUTABLE');
 await c.query('UPDATE work_queue SET company_profile_id=$2 WHERE id=$1',[row.id,input.profileId]);
 return {queueId:row.id,profileId:input.profileId,capabilityId:row.capability_id,execution:'EXISTING_AUTHORIZED_QUEUE_ONLY'};
}
export function officeWorkState(row:any,now:Date){
 if(['LEASED','EXECUTING'].includes(row.status))return !row.lease_expiry||new Date(row.lease_expiry).getTime()<=now.getTime()?'STALE':'WORKING';
 if(row.status==='FAILED'||row.verification_result==='FAILED')return 'FAILED';
 if(row.goal_state==='WAITING_OWNER')return 'WAITING_OWNER';
 if(row.goal_state==='WAITING_EXTERNAL')return 'WAITING_EXTERNAL';
 if(row.verified_independently)return 'AVAILABLE';
 return 'BLOCKED';
}
export function attributedModelCost(calls:any[]){
 const known=calls.filter(call=>call.cost!==null&&call.cost!==undefined&&Number.isFinite(Number(call.cost))&&Number(call.cost)>=0);
 return {status:!calls.length?'UNKNOWN':known.length===calls.length?'ATTRIBUTED_SUBTOTAL':'PARTIAL_ATTRIBUTED_SUBTOTAL',
  amount:known.length?known.reduce((sum,c)=>sum+Number(c.cost),0):null,currency:'USD',
  measuredAt:calls.length?calls.map(c=>new Date(c.created_at).toISOString()).sort().at(-1):null,
  ledgerCallIds:calls.map(c=>c.id),unknownCalls:calls.length-known.length,
  coverage:'Explicitly linked model calls only; not a complete task, staff or company total. Ledger price-times-usage cost, not a provider invoice.'};
}
export async function companyStaffSnapshot(c:PoolClient,context:OwnerContext,now=new Date()){
 const company=await authorizedCompany(c,context);
 const ready=(await c.query("SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='work_queue' AND column_name='company_profile_id') ready")).rows[0].ready;
 const base={companyId:company,generatedAt:now.toISOString(),staleAfterMs:45000,supervisor:{id:'sam',title:'SAM',authority:'UNCHANGED_EXECUTIVE_GUARDS'}};
 if(!ready)return {...base,availability:'MIGRATION_REQUIRED',profiles:COMPANY_ROSTER.map(p=>({...p,state:'UNCONFIGURED',work:[],skills:[],cost:attributedModelCost([]),performance:{...staffPerformanceEvidence(company,p.id,[],[]),verified:null,failed:null,assessment:null,...performanceRank({verified:0,failed:0,knownCost:false,authorityBreaches:null,distinctDays:0})}})),incidents:[]};
 const work=(await c.query(`SELECT w.id queue_id,w.goal_id,w.plan_id,w.capability_id,w.company_profile_id,w.status,w.lease_owner,w.lease_expiry,w.lease_timestamp,w.fencing_token,w.worker_version,w.queued_at,w.wake_reason,w.attempt,w.handoff,w.handoff->>'claimed_at' claimed_at,
 g.state goal_state,g.current_plan_id,e.id execution_id,e.actor,e.result,e.evidence,e.finished_at,v.id verification_id,v.result verification_result,v.verifier,v.checked_at,
 coalesce(v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash AND v.verifier<>e.actor AND e.plan_id=g.current_plan_id,false) verified_independently
 FROM work_queue w JOIN goals g ON g.id=w.goal_id
 LEFT JOIN LATERAL(SELECT * FROM executions e WHERE e.queue_id=w.id ORDER BY started_at DESC,id DESC LIMIT 1)e ON true
 LEFT JOIN LATERAL(SELECT * FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
 WHERE g.company_scope=$1 ORDER BY w.queued_at DESC,w.id DESC LIMIT 500`,[company])).rows;
 const attributionReady=(await c.query("SELECT to_regclass('company_model_call_attributions') IS NOT NULL ready")).rows[0].ready;
 const calls=attributionReady?(await c.query(`SELECT m.id,m.cost,m.created_at,a.queue_id FROM company_model_call_attributions a JOIN model_calls m ON m.id=a.model_call_id
  JOIN work_queue w ON w.id=a.queue_id JOIN goals g ON g.id=w.goal_id
  WHERE a.legal_entity_id=$1 AND m.legal_entity_id=$1 AND g.company_scope=$1 AND a.queue_id=ANY($2::uuid[])`,[company,work.map(w=>w.queue_id)])).rows:[];
 const assessments=await currentStaffAssessments(c,company);
 const {companySkillStatus}=await import('./companySkills');const skills=await companySkillStatus(c,company);
 return {...base,availability:'PERSISTED_WORK',coverage:'Latest 500 durable queue items; independent matching verification only counts toward performance. Missing attribution is never zero.',
  profiles:COMPANY_ROSTER.map(profile=>{
   const rows=work.filter(w=>w.company_profile_id===profile.id);
   const profileCalls=calls.filter(call=>rows.some(w=>w.queue_id===call.queue_id));
   const performance=staffPerformanceEvidence(company,profile.id,rows,profileCalls);
   const assessment=assessments.find(a=>a.after_ref.profileId===profile.id&&a.after_ref.sourceHash===performance.sourceHash&&a.after_ref.schema==='sam.staff_assessment.v1'&&a.after_ref.completeCostCoverage===true&&Number.isSafeInteger(a.after_ref.authorityBreaches)&&a.after_ref.authorityBreaches>=0&&Array.isArray(a.after_ref.evidenceRefs)&&a.after_ref.evidenceRefs.length>0&&!performance.actors.includes(a.actor));
   const assessed=!!assessment&&performance.ledgerCoverageEligible;
   const states:string[]=rows.map(w=>officeWorkState(w,now));
   const state=['WORKING','WAITING_OWNER','WAITING_EXTERNAL','FAILED','STALE','BLOCKED','AVAILABLE'].find(s=>states.includes(s))??'UNCONFIGURED';
   const dates=rows.flatMap(w=>[w.finished_at,w.checked_at,w.lease_timestamp,w.queued_at]).filter(Boolean).map(d=>new Date(d).toISOString()).sort();
   return {...profile,state,skills:skills.filter(skill=>skill.profile_id===profile.id),lastUpdated:dates.at(-1)??null,
    availability:rows.length?'PERSISTED_WORK_OBSERVED; current tool readiness is not proved':'NO_ATTRIBUTED_WORK_OR_PROVEN_INTEGRATION',
    work:rows.map(w=>({...w,state:officeWorkState(w,now),cost:attributedModelCost(calls.filter(call=>call.queue_id===w.queue_id)),progress:w.verified_independently?{verified:1,total:1}:{verified:0,total:1}})),
    cost:attributedModelCost(profileCalls),
    performance:{...performance,authorityCompliance:assessed?'INDEPENDENT_REVIEW_OF_LISTED_EVIDENCE':'UNKNOWN',assessment:assessed?{id:assessment.id,actor:assessment.actor,at:assessment.timestamp,evidenceRefs:assessment.after_ref.evidenceRefs}:null,
     ...performanceRank({verified:performance.verified,failed:performance.failed,knownCost:assessed,authorityBreaches:assessed?assessment.after_ref.authorityBreaches:null,distinctDays:performance.distinctDays})}};
  }),incidents:work.filter(w=>w.status==='FAILED'||officeWorkState(w,now)==='STALE').map(w=>({queueId:w.queue_id,goalId:w.goal_id,status:w.status,reason:w.wake_reason,attempt:w.attempt,leaseExpiry:w.lease_expiry,fencingToken:w.fencing_token,recovery:'EXISTING_BOUNDED_KERNEL_RECOVERY_ONLY'}))};
}
export async function companyProfileMemory(c:PoolClient,context:OwnerContext,profileId:string,query:string){
 const company=await authorizedCompany(c,context);companyProfile(profileId);
 const exists=(await c.query("SELECT to_regclass('specialist_learning') IS NOT NULL AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='work_queue' AND column_name='company_profile_id') ready")).rows[0].ready;
 if(!exists)return {availability:'UNCONFIGURED',records:[]};
 if(typeof query!=='string'||!query.trim()||query.length>200)throw Error('LEARNING_QUERY_INVALID');
 const {recallVerifiedLessons}=await import('./intelligence/learning');
 const lessons=await recallVerifiedLessons(c,company,query);
 const records=[];
 for(const lesson of lessons){
  const row=(await c.query(`SELECT w.id FROM executions e JOIN work_queue w ON w.id=e.queue_id JOIN goals g ON g.id=e.goal_id
   JOIN LATERAL(SELECT * FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
   WHERE e.id=$1 AND w.company_profile_id=$2 AND g.company_scope=$3 AND e.plan_id=g.current_plan_id
    AND v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash AND v.verifier<>e.actor`,[lesson.execution_id,profileId,company])).rows[0];
  if(row)records.push(lesson);
 }
 return {availability:'VERIFIED_SCOPED_LESSONS',records,authority:'Memory never changes policy or execution authority'};
}
