const assert=require('node:assert/strict');
const {Client}=require('pg');
async function runApiSmoke({port,token,databaseUrl,expectedScope,existingGoalId,clientFactory}){
 const u=new URL(databaseUrl);
 if(expectedScope){
  if(!/^sam_eval_[a-z0-9_]+$/.test(expectedScope.schema)||!/^sam_eval_runtime_[a-z0-9_]+$/.test(expectedScope.role)||decodeURIComponent(u.username)!==expectedScope.role)throw Error('PROVISIONED_SANDBOX_REQUIRED');
  if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(existingGoalId||''))throw Error('PERSISTENT_SMOKE_GOAL_REQUIRED');
 }else if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_synthetic')throw Error('LOCAL_SANDBOX_REQUIRED');
 const client=()=>clientFactory?clientFactory(u.href):new Client({connectionString:u.href});
 const root='http://127.0.0.1:'+port,headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 let phase='READINESS',lastHttpStatus=null;
 try{
 let ready=false;
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){
  try{lastHttpStatus=(await fetch(root+'/readyz',{signal:AbortSignal.timeout(1000)})).status;if(lastHttpStatus===200){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 assert(ready);
 const request=(path,options={})=>fetch(root+path,{signal:AbortSignal.timeout(5000),...options});
 phase='UNAUTHENTICATED';lastHttpStatus=(await request('/api/goals')).status;assert.equal(lastHttpStatus,401);
 phase='READ_ONLY_HTML';
 const html=await(await request('/')).text();assert(html.includes('data-read-only-stage="true" data-development-safe="true"'));
 assert(!html.includes('<option>YELLOW</option>'));
 let id,baseline;
 if(expectedScope){
  // Persistent startup is observation only. The operator pins a migrated goal;
  // repeated boots must never create a replacement goal or denial audit row.
  phase='EXISTING_GOAL_BASELINE';const c=client();
  try{await c.connect();baseline=(await c.query('SELECT id,state,current_plan_id FROM goals WHERE id=$1',[existingGoalId])).rows[0];assert(baseline);id=baseline.id;}finally{await c.end();}
 }else{
  phase='DENY_ELEVATED';const denied=await request('/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Synthetic read-only API check',authority_ceiling:'YELLOW'})});lastHttpStatus=denied.status;assert.equal(denied.status,400);
  phase='CREATE_GOAL';
  const created=await request('/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Read-only synthetic startup check. Execution remains disabled.'})});
  lastHttpStatus=created.status;assert.equal(created.status,201);id=(await created.json()).data.id;
 }
 phase='TIMELINE';
 const timeline=await request('/api/goals/'+id+'/timeline',{headers});lastHttpStatus=timeline.status;assert.equal(timeline.status,200);
 const data=(await timeline.json()).data;
 if(expectedScope){assert.equal(data.goal.id,existingGoalId);assert.equal(data.goal.state,baseline.state);assert.equal(data.goal.current_plan_id,baseline.current_plan_id);}
 else{assert.equal(data.progress.displayState,'NEW');assert.equal(data.progress.reportVerified,false);assert.equal(data.budget,null);}
 phase='MISSING_GOAL';assert.equal((await request('/api/goals/00000000-0000-4000-8000-000000000000/timeline',{headers})).status,404);
 phase='DATABASE_READBACK';
 const c=client();
 try{await c.connect();if(expectedScope){const actual=(await c.query('SELECT current_schema() schema,current_user role')).rows[0];assert.deepEqual(actual,expectedScope);}
  const after=(await c.query('SELECT id,state,current_plan_id FROM goals WHERE id=$1',[id])).rows[0];
  if(expectedScope)assert.deepEqual(after,baseline);
  else{assert.equal(after?.state,'NEW');assert((await c.query("SELECT 1 FROM audit_log WHERE action='OWNER_GOAL_DENIED' AND result='DENIED' AND after_ref->>'reason'='READ_ONLY_STAGE_AUTHORITY_REQUIRED'")).rowCount>0);}
 }finally{await c.end();}
 return {status:'PASS',checks:expectedScope?['unauthenticated_denied','read_only_ui','existing_goal_and_plan_match_database','no_startup_goal_creation','missing_goal_404','independent_connection_readback']:['unauthenticated_denied','read_only_ui','elevated_authority_denied','natural_intake_persisted','timeline_matches_database','no_invented_verification','unknown_budget_not_zero','missing_goal_404','independent_connection_readback'],liveReasoningValidated:false,modelPaidCalls:0};
 }catch(e){return {status:'FAIL',phase,lastHttpStatus,reason:e.code==='ERR_ASSERTION'?'ASSERTION_FAILED':'REQUEST_OR_DATABASE_FAILED',liveReasoningValidated:false,modelPaidCalls:0};}
}
module.exports={runApiSmoke};
