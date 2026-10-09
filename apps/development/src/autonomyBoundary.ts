import { assertSafeScalar,denyDevelopment } from "./planningPolicy";

export function autonomyEnabled(){
  return process.env.SAM_AUTONOMY_SANDBOX==="1"&&process.env.NODE_ENV==="development"&&process.env.SAM_DEVELOPMENT_SAFE_MODE==="1";
}
export const LOCAL_OPERATIONS=["sum","mean","min","max","count"] as const;
export const LOCAL_CAPABILITIES=["local.calculate","local.statistics"];
export function safeTree(value:any,depth=0):void{
  if(depth>8)denyDevelopment("AUTONOMY_DEPTH");
  if(Array.isArray(value)){if(value.length>32)denyDevelopment("AUTONOMY_ARRAY");for(const v of value)safeTree(v,depth+1);}
  else if(value&&typeof value==="object"){if(Object.keys(value).length>32)denyDevelopment("AUTONOMY_FIELDS");for(const [k,v] of Object.entries(value)){
    if(/secret|password|token|api.?key|authorization|email|financial|bank|private.?key|company_data|user_id|document/i.test(k))denyDevelopment("AUTONOMY_SENSITIVE_FIELD");
    assertSafeScalar(k);safeTree(v,depth+1);}}
  else assertSafeScalar(value);
}
export function localParameters(capability:string,p:any){
  if(!LOCAL_CAPABILITIES.includes(capability)||!p||Array.isArray(p))denyDevelopment("AUTONOMY_CAPABILITY");
  const allowed=capability==="local.calculate"?["operation","values"]:["values"];
  if(Object.keys(p).some(k=>!allowed.includes(k))||!Array.isArray(p.values)||p.values.length<1||p.values.length>16)denyDevelopment("AUTONOMY_PARAMETERS");
  if(capability==="local.calculate"&&!LOCAL_OPERATIONS.includes(p.operation))denyDevelopment("AUTONOMY_OPERATION");
  for(const v of p.values)if(!(typeof v==="number"&&Number.isFinite(v)&&Math.abs(v)<=1000000)&&
    !(typeof v==="string"&&/^knowledge:local_(sum|mean|min|max|count)$/.test(v)))denyDevelopment("AUTONOMY_VALUE");
}
export function validateAutonomyCandidate(raw:any){
  safeTree(raw);
  if(!raw||typeof raw!=="object"||Array.isArray(raw)||Object.keys(raw).some(k=>!["assumptions","constraints","dependencies","steps"].includes(k))||
    !Array.isArray(raw.steps)||raw.steps.length<1||raw.steps.length>2)denyDevelopment("AUTONOMY_PLAN");
  for(const k of ["assumptions","constraints","dependencies"])if(raw[k]!==undefined&&(!raw[k]||typeof raw[k]!=="object"||Array.isArray(raw[k])))denyDevelopment("AUTONOMY_PLAN_OBJECTS");
  for(const s of raw.steps){
    if(!s||Object.keys(s).some(k=>!["capabilityId","params","priority"].includes(k)))denyDevelopment("AUTONOMY_STEP_FIELDS");
    if(s.priority!==undefined&&(typeof s.priority!=="number"||!Number.isFinite(s.priority)||s.priority<0||s.priority>100))denyDevelopment("AUTONOMY_PRIORITY");
    localParameters(s.capabilityId,s.params);
  }
}
export async function assertSandbox(client:any){
  const r=await client.query("SELECT current_schema() s,current_user u,(SELECT rolbypassrls OR rolsuper FROM pg_roles WHERE rolname=current_user) bypass");
  const test=process.env.SAM_AUTONOMY_TEST_SESSION==="1";
  if(!autonomyEnabled()||r.rows[0].s!==(test?"sam_replit_test_autonomy":"sam_replit_autonomy")||
    r.rows[0].u!==(test?"sam_autonomy_test_app":"sam_autonomy_app")||r.rows[0].bypass)denyDevelopment("AUTONOMY_IDENTITY");
}
export async function authorizeSandboxGoal(client:any,id:string){
  await assertSandbox(client);
  const r=await client.query(`SELECT g.objective FROM goals g JOIN autonomy_session s ON s.session_id=g.autonomy_session_id
    WHERE g.id=$1 AND g.company_scope=$2 AND g.domain='development_probe' AND g.authority_ceiling='GREEN'
      AND s.legal_entity_id=g.company_scope AND s.expires_at>now()`,[id,process.env.SAM_DEV_LEGAL_ENTITY_ID]);
  if(r.rowCount!==1)denyDevelopment("AUTONOMY_GOAL_SCOPE");
  assertSafeScalar(r.rows[0].objective);
}
export async function sandboxContext(client:any,entityType:string,entityId:string){
  await assertSandbox(client);
  if(entityType!=="legal_entity"||entityId!==process.env.SAM_DEV_LEGAL_ENTITY_ID)denyDevelopment("AUTONOMY_ENTITY");
  const r=await client.query(`SELECT f.id,f.entity_type,f.entity_id,f.domain,f.attribute,f.value,f.source,f.evidence_id
    FROM world_facts f JOIN executions e ON f.source='verified_execution:'||e.id::text
    JOIN verifications v ON v.id=f.evidence_id AND v.execution_id=e.id
    WHERE f.entity_id=$1 AND f.entity_type='legal_entity' AND f.domain='development_probe'
      AND f.status='VERIFIED' AND f.superseded_at IS NULL AND v.result='VERIFIED'
      AND f.value=e.result->'value' AND f.attribute='local_'||(e.result->>'operation')
      AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
      AND e.capability_id=ANY($2::text[]) ORDER BY f.attribute,f.id`,[entityId,LOCAL_CAPABILITIES]);
  for(const f of r.rows)if(!/^local_(sum|mean|min|max|count)$/.test(f.attribute)||typeof f.value!=="number")denyDevelopment("AUTONOMY_FACT");
  return {entity:{type:entityType,id:entityId},facts:r.rows,memory:[]};
}
export function sandboxPlanningInput(input:{objective:string;context:any}){
  assertSafeScalar(input.objective);
  const c=input.context;
  if(Object.keys(c).some(k=>!["entity","entityType","entityId","facts","memory","assembled_at","replan_reason"].includes(k)))denyDevelopment("AUTONOMY_CONTEXT_FIELDS");
  if((c.entity?.id??c.entityId)!==process.env.SAM_DEV_LEGAL_ENTITY_ID||!Array.isArray(c.facts)||!Array.isArray(c.memory)||c.memory.length)denyDevelopment("AUTONOMY_CONTEXT");
  const facts=c.facts.map((f:any)=>{
    if(f.entity_id!==process.env.SAM_DEV_LEGAL_ENTITY_ID||f.domain!=="development_probe"||
      !/^local_(sum|mean|min|max|count)$/.test(f.attribute)||typeof f.value!=="number"||
      !String(f.source).startsWith("verified_execution:")||!f.evidence_id)denyDevelopment("AUTONOMY_FACT_PROVENANCE");
    return {key:f.attribute,value:f.value,provenance:"independently_verified_local_execution"};
  });
  return {objective:input.objective,context:{entity:"synthetic_development",facts,memory:[],
    ...(c.replan_reason?{replan_reason:"Independent verification failed; propose a safe corrective plan."}:{})}};
}
