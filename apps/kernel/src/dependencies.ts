import {transitionGoal} from './stateMachine';
import type {PlanStepInput} from './planning';
import {withTransaction} from '../../../packages/db/src/client';
import {insertOutboxEvent} from '../../../packages/db/src/outbox';

export interface ResultReference {step:string;path:string[];type:'string'|'number'|'boolean'|'object'|'array'}
export function normalizeDependencies(steps:PlanStepInput[],dependencies:Record<string,unknown>={}):PlanStepInput[]{
  const keys=steps.map((s,i)=>s.stepKey??String(i));
  for(const [key,value] of Object.entries(dependencies))if(!keys.includes(key)||!Array.isArray(value)||value.some(d=>typeof d!=='string'))throw new Error('PLAN_DEPENDENCY_INVALID');
  return steps.map((s,i)=>({...s,dependsOn:[...new Set([...(s.dependsOn??[]),...((dependencies[keys[i]]??[]) as string[])])]}));
}
export function validateStepGraph(steps:PlanStepInput[]):void {
  if(!steps.length||steps.length>64)throw new Error('PLAN_STEP_LIMIT');
  const keys=steps.map((s,i)=>s.stepKey??String(i));
  if(new Set(keys).size!==keys.length||keys.some(k=>!/^[\w.-]{1,80}$/.test(k)))throw new Error('PLAN_STEP_KEY_INVALID');
  const active=new Set<string>(),done=new Set<string>();
  function visit(key:string){
    if(active.has(key))throw new Error('PLAN_DEPENDENCY_CYCLE');
    if(done.has(key))return;
    const step=steps[keys.indexOf(key)];if(!step)throw new Error('PLAN_DEPENDENCY_MISSING');
    if(step.params!==undefined&&(!step.params||typeof step.params!=='object'||Array.isArray(step.params)))throw new Error('PLAN_PARAMETERS_INVALID');
    if(step.resultRefs!==undefined&&(!step.resultRefs||typeof step.resultRefs!=='object'||Array.isArray(step.resultRefs)))throw new Error('PLAN_RESULT_REFERENCE_INVALID');
    active.add(key);
    if(step.dependsOn!==undefined&&(!Array.isArray(step.dependsOn)||step.dependsOn.some(d=>typeof d!=='string')))
      throw new Error('PLAN_DEPENDENCY_INVALID');
    for(const dep of step.dependsOn??[])visit(dep);
    for(const [param,ref] of Object.entries(step.resultRefs??{})){
      if(['__proto__','constructor','prototype'].includes(param)||!ref||typeof ref!=='object'||
        !(step.dependsOn??[]).includes(ref.step)||!Array.isArray(ref.path)||ref.path.length>8||
        ref.path.some(p=>typeof p!=='string'||!p.length||['__proto__','constructor','prototype'].includes(p))||
        !['string','number','boolean','object','array'].includes(ref.type))throw new Error('PLAN_RESULT_REFERENCE_INVALID');
    }
    active.delete(key);done.add(key);
  }
  keys.forEach(visit);
}

export async function resolveWorkParameters(client:any,queueId:string,params:Record<string,unknown>){
  const w=(await client.query('SELECT plan_id,goal_id,result_refs FROM work_queue WHERE id=$1',[queueId])).rows[0];
  const resolved={...params};
  for(const [name,ref] of Object.entries(w.result_refs??{}) as [string,ResultReference][]){
    const r=await client.query(`SELECT e.result FROM work_queue w JOIN executions e ON e.queue_id=w.id
      JOIN verifications v ON v.execution_id=e.id WHERE w.plan_id=$1 AND w.step_key=$2
      AND w.status='EXECUTED' AND v.result='VERIFIED' AND v.execution_hash=e.execution_hash
      AND v.plan_hash=e.plan_hash ORDER BY e.finished_at DESC LIMIT 1`,[w.plan_id,ref.step]);
    if(!r.rowCount)throw new Error('DEPENDENCY_RESULT_UNVERIFIED');
    let value=r.rows[0].result;
    for(const part of ref.path){if(!value||!Object.hasOwn(value,part))throw new Error('DEPENDENCY_RESULT_PATH');value=value[part];}
    const type=Array.isArray(value)?'array':typeof value;
    if(value===null||type!==ref.type||(type==='number'&&!Number.isFinite(value)))throw new Error('DEPENDENCY_RESULT_TYPE');
    resolved[name]=value;
  }
  if(Object.keys(w.result_refs??{}).length)await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,source,authority_class,result)
    VALUES('dependency-resolver',$1,'DEPENDENCY_RESULTS_RESOLVED','goal',$1,'kernel','GREEN','VERIFIED_INPUTS')`,[w.goal_id]);
  await client.query('UPDATE work_queue SET params=$2::jsonb WHERE id=$1',[queueId,JSON.stringify(resolved)]);
  return resolved;
}

export async function reconcileBlockedDependencies(){
  return withTransaction(async client=>{
    const rows=await client.query(`UPDATE work_queue w SET status='FAILED',wake_reason='DEPENDENCY_OR_GOAL_STOPPED'
      FROM goals g WHERE g.id=w.goal_id AND w.status IN ('QUEUED','HANDBACK') AND
      (g.state IN ('FAILED','CANCELLED','REPLANNING') OR g.current_plan_id<>w.plan_id OR EXISTS
       (SELECT 1 FROM work_queue p WHERE p.id=ANY(w.depends_on) AND p.status='FAILED')) RETURNING w.id,w.goal_id`);
    for(const row of rows.rows)await insertOutboxEvent(client,{aggregateType:'work_queue',aggregateId:row.id,
      eventType:'DEPENDENCY_BLOCKED',payload:{goal_id:row.goal_id,reason:'DEPENDENCY_OR_GOAL_STOPPED'}});
    return rows.rowCount;
  });
}

export async function prepareWorkParameters(client:any,queueId:string,params:Record<string,unknown>){
  try{return await resolveWorkParameters(client,queueId,params);}catch{
    const row=(await client.query("UPDATE work_queue SET status='FAILED',wake_reason='DEPENDENCY_RESULT_INVALID' WHERE id=$1 RETURNING goal_id",[queueId])).rows[0];
    const g=(await client.query('SELECT state FROM goals WHERE id=$1 FOR UPDATE',[row.goal_id])).rows[0];
    if(g?.state==='EXECUTING')await transitionGoal(client,row.goal_id,'EXECUTING','FAILED','dependency_result_invalid');
    await insertOutboxEvent(client,{aggregateType:'work_queue',aggregateId:queueId,eventType:'DEPENDENCY_RESULT_INVALID',payload:{goal_id:row.goal_id}});
    return null;
  }
}
