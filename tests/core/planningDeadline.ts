import assert from 'node:assert/strict';
import {Client} from 'pg';
import {pool} from '../../packages/db/src/client';
import {planNextNewGoal} from '../../apps/production/src/planner';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture(),id=await f.goal('abort after model response');
 const original=Client.prototype.query;let delayed=0;
 (Client.prototype as any).query=async function(...args:any[]){
  const result=await (original as any).apply(this,args);
  if(String(args[0])==='SELECT authority_ceiling FROM goals WHERE id=$1'){
   delayed++;await new Promise(r=>setTimeout(r,150));
  }
  return result;
 };
 let result;
 try{result=await planNextNewGoal(f.bundle,{deadlineMs:100});}finally{Client.prototype.query=original;}
 assert.equal(delayed,1,'deadline must expire after model success, during authority evaluation');
 assert.equal(result.reason,'PLANNING_DEADLINE_EXCEEDED');
 assert.equal((await pool.query('SELECT count(*)::int n FROM plans WHERE goal_id=$1',[id])).rows[0].n,0);
 console.log('PASS deadline expiring after proposal but before persistence creates no plan');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
