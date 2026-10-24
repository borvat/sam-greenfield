// Read-only evidence for one explicitly selected synthetic goal. No seed or activation.
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
function digest(rows){return createHash('sha256').update(JSON.stringify(rows.map(canonical).map(value=>JSON.stringify(value)).sort())).digest('hex');}
async function collectCheckpoint(c,goalId,entity){
 assert(uuid.test(goalId)&&uuid.test(entity),'Explicit synthetic goal and entity required');
 const read=async(sql,params)=> (await c.query(sql,params)).rows;
 const goals=await read('SELECT to_jsonb(g) AS row FROM goals g WHERE id=$1 AND company_scope=$2',[goalId,entity]);
 assert.equal(goals.length,1,'Selected scoped goal missing');
 const goal=goals[0].row;assert(uuid.test(goal.current_plan_id||''),'Nonempty current plan required');
 const plans=await read('SELECT to_jsonb(p) AS row FROM plans p WHERE goal_id=$1',[goalId]);
 assert(plans.some(p=>p.row.id===goal.current_plan_id&&Array.isArray(p.row.steps)&&p.row.steps.length>0),'Nonempty current plan not retained');
 const audit=await read('SELECT to_jsonb(a) AS row FROM audit_log a WHERE goal_id=$1',[goalId]);
 assert(audit.length>0,'Goal-linked audit required');
 const trials=await read('SELECT to_jsonb(t) AS row FROM evaluation_trials t WHERE root_goal_id=$1 AND legal_entity_id=$2',[goalId,entity]);
 assert.equal(trials.length,1,'One goal-linked synthetic trial required');
 const events=await read('SELECT to_jsonb(e) AS row FROM evaluation_events e WHERE trial_id=$1',[trials[0].row.id]);
 const reservations=events.filter(e=>e.row.kind==='RESERVED'&&uuid.test(e.row.reservation_id||'')&&Number.isFinite(e.row.payload?.reserved?.costUsd)&&e.row.payload.reserved.costUsd>0);
 assert(reservations.length>0,'Nonzero synthetic reservation required');
 const trialBudget=trials[0].row.used?.costUsd;
 assert(Number.isFinite(trialBudget)&&trialBudget>0,'Nonzero durable budget accounting required');
 return {format:1,goalId,entity,planId:goal.current_plan_id,trialId:trials[0].row.id,
  tables:Object.fromEntries(Object.entries({goals,plans,audit,trials,events}).map(([k,rows])=>[k,{count:rows.length,sha256:digest(rows)}])),
  evidence:'SELECTED_SYNTHETIC_GOAL_CHECKPOINT',realBilledCostProven:false,liveReasoningProven:false};
}
function compareCheckpoint(before,after){
 assert.equal(before?.format,1,'Checkpoint format required');
 assert.equal(after?.format,1,'Checkpoint format required');
 assert.deepEqual(after,before,'Selected goal/plan/audit/budget evidence changed');
 return {status:'PASS',scope:'SELECTED_GOAL_ROWS_MATCH',containerReplacementProven:false,backupRestoreProven:false,liveReasoningProven:false};
}
module.exports={collectCheckpoint,compareCheckpoint};
