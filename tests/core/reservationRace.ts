import assert from 'node:assert/strict';
import {Client} from 'pg';
import {pool} from '../../packages/db/src/client';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {claimNextWorkAtomic} from '../../apps/kernel/src/workerRuntime';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {reconcilePendingSideEffects} from '../../apps/tools/src/reconciler';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture(true),params={ok:true};
 const id=await f.goal('reservation race','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId:'review_echo',params}]});
 await pool.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,max_uses,authority_class,requested_by,status)
 VALUES($1,'review_echo',$2,$3,now()+interval '1 hour',1,'YELLOW','review-owner','APPROVED')`,[id,sha256Hex(params),f.entity]);
 const work=(await claimNextWorkAtomic('review-race',30))!;
 const executors=createToolExecutors({catalog:f.bundle.catalog,tools:f.bundle.tools});
 const original=Client.prototype.query,inserted=new WeakSet();let observed=0;
 // Schedule the real reconciler immediately after the reservation commits,
 // before the worker resumes. This makes the old unbound-PENDING gap repeatable.
 (Client.prototype as any).query=async function(...args:any[]){
  const result=await (original as any).apply(this,args),sql=String(args[0]);
  if(sql.includes('INSERT INTO side_effect_operations'))inserted.add(this);
  if(sql==='COMMIT'&&inserted.delete(this)){observed++;await reconcilePendingSideEffects({tools:f.bundle.tools});}
  return result;
 };
 try{await executors.review_echo(work);}finally{Client.prototype.query=original;}
 assert.equal(observed,1,'race hook must execute');
 assert.equal(f.counters().reconciles,0,'live work reservation must be visible atomically');
 assert.equal(f.counters().sends,1);
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state,'EXECUTING');
 const noApproval=await f.goal('missing approval','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:noApproval,steps:[{capabilityId:'review_echo',params}]});
 const denied=(await claimNextWorkAtomic('review-denied',30))!;
 await assert.rejects(executors.review_echo(denied));
 assert.equal((await pool.query('SELECT count(*)::int n FROM side_effect_operations WHERE goal_id=$1',[noApproval])).rows[0].n,0,'approval failure must roll back reservation');
 assert.equal(f.counters().sends,1);
 const concurrent=await f.goal('concurrent identical writes','PLANNING');
 await persistPlanAndDelegateAtomic({goalId:concurrent,steps:[{capabilityId:'review_echo',params},{capabilityId:'review_echo',params}]});
 await pool.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,max_uses,authority_class,status)
 VALUES($1,'review_echo',$2,$3,now()+interval '1 hour',1,'YELLOW','APPROVED')`,[concurrent,sha256Hex(params),f.entity]);
 const parallel=await Promise.all([claimNextWorkAtomic('parallel-a',30),claimNextWorkAtomic('parallel-b',30)]);
 const outcomes=await Promise.allSettled(parallel.map(w=>executors.review_echo(w!)));
 assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);
 assert.equal(f.counters().sends,2,'two distinct goals send once each; concurrent identical work never resends');
 assert.equal((await pool.query('SELECT count(*)::int n FROM side_effect_operations WHERE goal_id=$1',[concurrent])).rows[0].n,1);
 assert.equal((await pool.query('SELECT used_count FROM approvals WHERE goal_id=$1',[concurrent])).rows[0].used_count,1);
 console.log('PASS atomic reservation/approval/lease binding under reconciler interleaving; denied approval leaves no operation; concurrent identical writes consume one approval and send once per goal');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
