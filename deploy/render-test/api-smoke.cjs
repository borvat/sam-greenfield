const assert=require('node:assert/strict');
const {Client}=require('pg');
async function runApiSmoke({port,token,databaseUrl}){
 const u=new URL(databaseUrl);
 if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_synthetic')throw Error('LOCAL_SANDBOX_REQUIRED');
 const root='http://127.0.0.1:'+port,headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 let ready=false;
 for(let n=0;n<40;n++){
  try{if((await fetch(root+'/readyz',{signal:AbortSignal.timeout(1000)})).status===200){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 assert(ready);
 const request=(path,options={})=>fetch(root+path,{signal:AbortSignal.timeout(5000),...options});
 assert.equal((await request('/api/goals')).status,401);
 const html=await(await request('/')).text();assert(html.includes('data-read-only-stage="true" data-development-safe="true"'));
 assert(!html.includes('<option>YELLOW</option>'));
 const denied=await request('/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Synthetic read-only API check',authority_ceiling:'YELLOW'})});assert.equal(denied.status,400);
 const created=await request('/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Read-only synthetic startup check. Execution remains disabled.'})});
 assert.equal(created.status,201);const id=(await created.json()).data.id;
 const timeline=await request('/api/goals/'+id+'/timeline',{headers});assert.equal(timeline.status,200);
 const data=(await timeline.json()).data;assert.equal(data.progress.displayState,'NEW');assert.equal(data.progress.reportVerified,false);assert.equal(data.budget,null);
 assert.equal((await request('/api/goals/00000000-0000-4000-8000-000000000000/timeline',{headers})).status,404);
 const c=new Client({connectionString:u.href});
 try{await c.connect();assert.equal((await c.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0]?.state,'NEW');}finally{await c.end();}
 return {status:'PASS',checks:['unauthenticated_denied','read_only_ui','elevated_authority_denied','natural_intake_persisted','timeline_matches_database','no_invented_verification','unknown_budget_not_zero','missing_goal_404','independent_connection_readback'],liveReasoningValidated:false,modelPaidCalls:0};
}
module.exports={runApiSmoke};
