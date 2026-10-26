/** UNREGISTERED adapter for the existing SAM side_effect_operations table.
 * No DDL, grants, owner connection, migrations, deletes or provisioning.
 * Caller supplies SAM's already-admitted restricted pool, never model input.
 * Local SQL-engine tests are preparation; native multi-session/live proof is
 * required before registering this adapter for real publication.
 */
'use strict';
const {REPO}=require('./bounded_publisher.cjs');
const CAPABILITY='sam.hermes.real_ui.publish.v1';
const STAGES=['SCOPE_VERIFIED','WRITE_INTENT','COMMIT_CREATED','BRANCH_CREATED','DRAFT_CREATED'];
const BINDING=Object.freeze({schema:'sam_eval_20261024',role:'sam_eval_runtime_20261024',org:'e61d535d-1b9a-4e1d-b5d1-9578bb54db0e',entity:'2796e0d9-1701-4e53-a7ac-d198c0e44c01'});
const uuid=s=>typeof s==='string'&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(s);
function deny(code){throw Error(code)}
function record(row,id,digest){
 if(row.capability_id!==CAPABILITY||row.request_hash!==digest)deny('PUBLISH_JOURNAL_CONFLICT');
 let r;try{r=JSON.parse(row.provider_reference)}catch{deny('PUBLISH_JOURNAL_RECONCILE_REQUIRED')}
 if(r.id!==id||r.digest!==digest||!Array.isArray(r.stages))deny('PUBLISH_JOURNAL_CONFLICT');return r;
}
class PublisherPgJournal{
 constructor({pool,roundId,goalId}){
  if(!pool||typeof pool.connect!=='function'||!uuid(roundId)||!uuid(goalId))deny('PUBLISH_JOURNAL_CONTEXT_DENIED');
  this.pool=pool;this.goalId=goalId;this.key='sam-real-ui-publish:v1:'+roundId;
 }
 async transaction(action){
  const c=await this.pool.connect();let begun=false,committing=false;
  try{
   await c.query('BEGIN');begun=true;
   const s=(await c.query("SELECT current_schema() AS schema,current_user AS role,current_setting('app.current_org_id',true) AS org,current_setting('app.current_legal_entity_id',true) AS entity")).rows[0];
   if(!s||Object.entries(BINDING).some(([k,v])=>s[k]!==v))deny('PUBLISH_JOURNAL_SCOPE_DENIED');
   const result=await action(c);committing=true;await c.query('COMMIT');begun=false;return result;
  }catch(e){if(begun)try{await c.query('ROLLBACK')}catch{}if(committing)deny('PUBLISH_JOURNAL_COMMIT_UNCERTAIN_RECONCILE');deny(/^PUBLISH_JOURNAL_[A-Z_]+$/.test(e?.message||'')?e.message:'PUBLISH_JOURNAL_FAILED_RECONCILE')}
  finally{c.release()}
 }
 async begin(id,digest){
  if(!uuid(id)||typeof digest!=='string'||!/^[a-f0-9]{64}$/.test(digest))deny('PUBLISH_JOURNAL_JOB_DENIED');
  return this.transaction(async c=>{
   const r={id,digest,state:'CLAIMED',stages:[]};
   const inserted=await c.query(`INSERT INTO side_effect_operations(operation_key,capability_id,goal_id,legal_entity_id,request_hash,provider_reference,state,idempotency_key)
    VALUES($1,$2,$3,$4,$5,$6,'PENDING',$1) ON CONFLICT(operation_key) DO NOTHING RETURNING operation_key`,[this.key,CAPABILITY,this.goalId,BINDING.entity,digest,JSON.stringify(r)]);
   if(inserted.rows.length===1)return null;
   const row=(await c.query('SELECT capability_id,goal_id,legal_entity_id,request_hash,provider_reference,state FROM side_effect_operations WHERE operation_key=$1 FOR UPDATE',[this.key])).rows[0];
   if(!row||row.goal_id!==this.goalId||row.legal_entity_id!==BINDING.entity)deny('PUBLISH_JOURNAL_CONFLICT');
   const previous=record(row,id,digest);
   if(row.state!=='CONFIRMED'||previous.state!=='COMPLETE'||previous.receipt?.repository!==REPO||previous.receipt?.jobId!==id||previous.receipt?.tokenRevoked!==true)deny('PUBLISH_JOURNAL_RECONCILE_REQUIRED');
   return previous.receipt;
  });
 }
 async save(id,stage,value){
  if(!uuid(id)||!['SCOPE_VERIFIED','WRITE_INTENT','COMMIT_CREATED','BRANCH_CREATED','DRAFT_CREATED','COMPLETE'].includes(stage)||!value||typeof value!=='object'||Array.isArray(value)||Buffer.byteLength(JSON.stringify(value))>4096)deny('PUBLISH_JOURNAL_STAGE_DENIED');
  return this.transaction(async c=>{
   const row=(await c.query('SELECT capability_id,goal_id,legal_entity_id,request_hash,provider_reference,state FROM side_effect_operations WHERE operation_key=$1 FOR UPDATE',[this.key])).rows[0];
   if(!row||row.goal_id!==this.goalId||row.legal_entity_id!==BINDING.entity||!['PENDING','SENT'].includes(row.state))deny('PUBLISH_JOURNAL_RECONCILE_REQUIRED');
   const r=record(row,id,row.request_hash);if(r.state!=='CLAIMED')deny('PUBLISH_JOURNAL_RECONCILE_REQUIRED');
   if(stage==='COMPLETE'){
    if(value.kind!=='BOUNDED_DRAFT_PR_PUBLISHED'||value.jobId!==id||value.repository!==REPO||value.tokenRevoked!==true||value.draft!==true||JSON.stringify(r.stages.map(x=>x.stage))!==JSON.stringify(STAGES))deny('PUBLISH_JOURNAL_RECEIPT_DENIED');
    r.state='COMPLETE';r.receipt=value;
   }else{if(r.stages.length>=5||r.stages.some(x=>x.stage===stage))deny('PUBLISH_JOURNAL_STAGE_REPLAY_DENIED');if(STAGES[r.stages.length]!==stage)deny('PUBLISH_JOURNAL_STAGE_ORDER_DENIED');r.stages.push({stage,...value})}
   const serialized=JSON.stringify(r);if(Buffer.byteLength(serialized)>16384)deny('PUBLISH_JOURNAL_SIZE_DENIED');
   const result=await c.query('UPDATE side_effect_operations SET provider_reference=$2,state=$3,updated_at=now() WHERE operation_key=$1 RETURNING operation_key',[this.key,serialized,stage==='COMPLETE'?'CONFIRMED':'SENT']);
   if(result.rows.length!==1)deny('PUBLISH_JOURNAL_RECONCILE_REQUIRED');
  });
 }
}
module.exports={PublisherPgJournal,BINDING,CAPABILITY};
