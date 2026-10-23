import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {reviewFixture} from './reviewFixture';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {deriveArtifact,replayStoredArtifact,DERIVE_CAPABILITY,DERIVED_SOURCE_CONTRACT,type DeriveRequest} from '../../apps/brain/src/evidence/artifacts';
import type {OutputContract} from '../../apps/brain/src/evidence/contracts';
async function main(){
 const f=await reviewFixture(),goalId=await f.goal('Synthetic chained arithmetic','PLANNING'),scope={goalId,legalEntityId:f.entity};
 const contracts:OutputContract[]=[{id:'raw-v1',capabilityId:'review_echo',description:'Synthetic exact units',extraction:{version:'1',rowsPath:['records'],columns:{amount:{kind:'decimal',unit:'count'}},coveragePath:['coverage'],timeZonePath:['timeZone'],limitationsPath:['limitations']}}];
 const ids:Record<string,string>={};for(const capability of ['review_echo',DERIVE_CAPABILITY])ids[capability]=(await pool.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,'Fixture verification','db_query','{}','{}') RETURNING id",[capability])).rows[0].id;
 const store=async(capabilityId:string,result:any)=>{
  // Isolated operator fixture construction; each execution still passes ordinary
  // persisted-plan, lease/fence and verification machinery. No live goal reopening.
  await pool.query("UPDATE goals SET state='PLANNING' WHERE id=$1",[goalId]);
  const plan=await persistPlanAndDelegateAtomic({goalId,steps:[{capabilityId,params:{}}]});
  const lease=await leaseWorkAtomic(plan.queueIds[0],'chain-fixture',60);
  const e=await recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[0],fencingToken:lease.token,actor:'fixture',result,evidence:{fixture:true}});
  await recordIndependentVerificationAtomic({executionId:e.executionId,contractId:ids[capabilityId],verifier:'fixture-replay',independentEvidence:{fixture:true},result:'VERIFIED'});return e.executionId;
 };
 const raw=await store('review_echo',{records:[{amount:'0.1'}],coverage:'complete',timeZone:'UTC',limitations:[]});
 let previous=raw,field='amount';const expected=['0.2','0.4','0.8'];
 for(let depth=0;depth<3;depth++){
  const next='value'+depth,request:DeriveRequest={sources:{prior:{executionId:previous,contractId:depth?DERIVED_SOURCE_CONTRACT:'raw-v1'}},plan:{version:1,source:'prior',operations:[{op:'derive',as:next,left:field,right:field,operator:'add'}]}};
  const artifact=await deriveArtifact(pool,scope,request,contracts);assert.equal(artifact.output.dataset.rows[0].values[next],expected[depth]);assert.equal(artifact.output.dataset.rows[0].citations[0].executionId,raw);
  previous=await store(DERIVE_CAPABILITY,{derivedEvidence:artifact});field=next;
  assert.deepEqual(await replayStoredArtifact(pool,scope,previous,contracts),artifact);
 }
 const request:DeriveRequest={sources:{prior:{executionId:previous,contractId:DERIVED_SOURCE_CONTRACT}},plan:{version:1,source:'prior',operations:[]}};
 await assert.rejects(()=>deriveArtifact(pool,scope,request,contracts),/DEPTH_OR_CYCLE/);
 await assert.rejects(()=>deriveArtifact(pool,{...scope,goalId:crypto.randomUUID()},request,contracts),/VERIFICATION_REQUIRED/);
 await pool.query("UPDATE verifications SET result='FAILED' WHERE execution_id=$1",[raw]);
 await assert.rejects(()=>replayStoredArtifact(pool,scope,previous,contracts),/VERIFIED_SCOPE_REQUIRED/);
 console.log('PASS three-level exact chained replay, raw citations, depth bound, foreign-goal refusal and leaf revocation; no external calls');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
