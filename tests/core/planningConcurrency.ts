import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {planNextNewGoal} from '../../apps/production/src/planner';
import {reviewFixture} from './reviewFixture';
async function main(){
 pool.options.max=2;
 const f=await reviewFixture();
 const healthy=await Promise.all(Array.from({length:12},(_,i)=>f.goal('healthy '+i)));
 const failed=await Promise.all(Array.from({length:4},(_,i)=>f.goal('fail '+i)));
 const start=performance.now();
 const results=await Promise.allSettled(Array.from({length:16},()=>planNextNewGoal(f.bundle,{backoffMs:60000})));
 const ms=Math.round(performance.now()-start);
 assert.equal(results.filter(x=>x.status==='rejected').length,0,'pool pressure must not escape the per-goal guard');
 const complete=await pool.query("SELECT count(*)::int n FROM goals WHERE id=ANY($1::uuid[]) AND state='EXECUTING'",[healthy]);
 assert.equal(complete.rows[0].n,12,'all healthy goals progress despite model failures');
 assert.equal((await pool.query('SELECT count(*)::int n FROM plans WHERE goal_id=ANY($1::uuid[])',[healthy])).rows[0].n,12);
 assert.equal((await pool.query('SELECT count(*)::int n FROM goals WHERE id=ANY($1::uuid[]) AND planning_attempts=1 AND planning_failure IS NOT NULL',[failed])).rows[0].n,4);
 assert(ms<3000,`bounded synthetic load exceeded 3000 ms: ${ms}`);
 assert.equal(f.counters().invokes,16,'one model attempt per goal');
 assert.equal(pool.waitingCount,0);
 console.log(JSON.stringify({check:'concurrent planning with failures and two DB connections',healthy:12,failed:4,invokes:16,ms,thresholdMs:3000,poolMax:2}));
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
