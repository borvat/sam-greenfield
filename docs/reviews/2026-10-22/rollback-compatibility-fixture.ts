import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pool,withTransaction} from '/workspace/sam-greenfield/packages/db/src/client';
import {persistPlanAndDelegateAtomic} from '/workspace/sam-greenfield/apps/kernel/src/planning';
import {claimNextWorkAtomic} from '/workspace/sam-greenfield/apps/kernel/src/workerRuntime';
import {reviewFixture} from '/workspace/sam-greenfield/tests/core/reviewFixture';
async function main(){
 const f=await reviewFixture(),goal=await f.goal('rollback fixture','PLANNING');
 const plan=await persistPlanAndDelegateAtomic({goalId:goal,steps:[{stepKey:'source',capabilityId:'review_echo',params:{}},{stepKey:'dependent',capabilityId:'review_echo',params:{},dependsOn:['source'],priority:100}]});
 await pool.query("UPDATE work_queue SET due_at=now()+interval '1 day' WHERE id=$1",[plan.queueIds[0]]);
 assert.equal(await claimNextWorkAtomic('current',30),null);
 const source=execFileSync('git',['show','b55da2761e8fd1de3833be55f03d4fdd268cd0a3:apps/kernel/src/workerRuntime.ts'],{cwd:'/workspace/sam-greenfield',encoding:'utf8'});
 const sql=source.match(/`(SELECT id[\s\S]*?LIMIT 1)`/)![1];
 const old=await withTransaction(c=>c.query(sql));assert.equal(old.rows[0].id,plan.queueIds[1]);
 console.log('PASS compatibility check detects unsafe rollback: exact main worker SELECT would claim an unverified dependent; current worker refuses. Drain/cancel dependency plans before old workers; no production restore tested.');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
