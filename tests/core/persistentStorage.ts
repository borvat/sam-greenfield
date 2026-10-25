import assert from 'node:assert/strict';
import {Client} from 'pg';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {provision} from '../../scripts/evaluation/provision-isolated';
import {openPersistentBinding} from '../../deploy/render-test/persistentBinding';
import {seedStorageContinuityFixture,readStorageContinuityFixture,assertStorageContinuity} from '../../scripts/evaluation/storage-continuity-probe';
async function main(){
 const u=new URL(process.env.DATABASE_URL??'');if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_core_test')throw Error('LOCAL_DISPOSABLE_ONLY');
 const root=await mkdtemp(join(tmpdir(),'sam-native-persistence-')),dir=join(root,'private');
 const suffix=process.pid+'_'+Date.now(),schema='sam_eval_p_'+suffix,role='sam_eval_runtime_'+suffix;
 const admin=new Client({connectionString:u.href});await admin.connect();let child:ReturnType<typeof spawn>|undefined,created=false,publicControl=false;
 async function start(){return new Promise<{port:number}>((resolve,reject)=>{
  child=spawn(process.execPath,['--import','tsx','tests/core/persistentBindingChild.ts',join(dir,'restricted-connection.json')],{env:{PATH:process.env.PATH},stdio:['ignore','pipe','pipe']});
  let text='';const timer=setTimeout(()=>{child?.kill('SIGKILL');reject(Error('CHILD_READY_TIMEOUT'));},15000);
  child.stdout!.on('data',b=>{text+=b;for(const line of text.split('\n'))try{const x=JSON.parse(line);if(x.ready){clearTimeout(timer);resolve({port:x.port});}}catch{}});
  child.on('exit',()=>{clearTimeout(timer);reject(Error('CHILD_EXIT_BEFORE_READY'));});
 });}
 async function stop(){if(!child)return;const c=child;child=undefined;const exit=new Promise<void>(r=>c.once('exit',()=>r()));c.kill('SIGKILL');await exit;}
 try{
  // Only this disposable local test moves the extension; startup never does.
  await admin.query('ALTER EXTENSION pgcrypto SET SCHEMA public');
  if(!(await admin.query("SELECT to_regclass('public.goals') p")).rows[0].p){await admin.query('CREATE TABLE public.goals(id uuid)');publicControl=true;}
  const setup=await provision(u.href,schema,role,dir);created=true;assert.equal(setup.status,'ISOLATED_SETUP_VERIFIED');
  const config=JSON.parse(await readFile(join(dir,'restricted-connection.json'),'utf8'));
  const hermes=spawnSync(process.execPath,['--import','tsx','tests/core/hermesNativeChild.ts',join(dir,'restricted-connection.json')],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:30000});
  assert.equal(hermes.status,0,'native Hermes SQL child must pass');
  const hermesReceipt=JSON.parse(hermes.stdout.trim().split('\n').at(-1)!);
  assert.equal(hermesReceipt.status,'PASS');console.log(JSON.stringify(hermesReceipt));
  const verified=await openPersistentBinding(join(dir,'restricted-connection.json'));assert.equal(verified.report.status,'PROVISIONED_STORAGE_VERIFIED');
  const headers={Authorization:'Bearer local-fixture-unused-externally','Content-Type':'application/json'};
  const first=await start();const response=await fetch('http://127.0.0.1:'+first.port+'/api/goals',{method:'POST',headers,body:JSON.stringify({objective:'Synthetic persistence probe only. Do not plan or execute.'})});
  assert.equal(response.status,201);const id=((await response.json()) as any).data.id;
  const commit=process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const fixture=await seedStorageContinuityFixture(admin,config,commit);
  const reserved=spawnSync(process.execPath,['--import','tsx','tests/core/persistentBindingChild.ts',join(dir,'restricted-connection.json'),'reserve-storage-fixture',fixture.trialId],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:15000});
  assert.equal(reserved.status,0);assert.equal(JSON.parse(reserved.stdout.trim()).reserved,true);
  const capture=async()=>{const c=new Client({connectionString:config.connectionString});await c.connect();try{return await readStorageContinuityFixture(c,config,fixture);}finally{await c.end();}};
  const before=await capture();
  await stop();const second=await start();
  const timeline=await fetch('http://127.0.0.1:'+second.port+'/api/goals/'+id+'/timeline',{headers});assert.equal(timeline.status,200);
  const data=((await timeline.json()) as any).data;assert.equal(data.goal.id,id);assert.equal(data.goal.state,'NEW');assert.equal(data.progress.reportVerified,false);assert.equal(data.executions.length,0);
  const after=await capture();assertStorageContinuity(before,after);
  const planned=((await(await fetch('http://127.0.0.1:'+second.port+'/api/goals/'+fixture.goalId+'/timeline',{headers})).json()) as any).data;
  assert.equal(planned.goal.current_plan_id,fixture.planId);assert.equal(planned.budget.mode,'fixture');assert.equal(planned.budget.costBasis,'SYNTHETIC_RESERVATION_NOT_INVOICE');assert.equal(planned.budget.reservedUsd,0.03);assert.equal(planned.budget.actualBilledUsd,null);assert.equal(planned.budget.reservedModelAttempts,0);
  const r=new Client({connectionString:config.connectionString});await r.connect();try{
   assert.equal((await r.query('SELECT count(*)::int n FROM goals WHERE id=$1',[id])).rows[0].n,1);
   await assert.rejects(r.query('SELECT * FROM public.goals LIMIT 0'));
   await assert.rejects(r.query('CREATE TABLE forbidden_probe(id int)'));
  }finally{await r.end();}
  console.log(JSON.stringify({status:'PASS',nativePostgres:true,processReplacement:true,hostedContainerReplacement:false,sameGoal:true,samePlan:true,sameAudit:true,sameReservation:true,syntheticReservationUsd:0.03,actualBilledUsd:null,duplicateGoals:0,executions:0,liveReasoning:false,modelCalls:0}));
 }finally{
  await stop();if(created){await admin.query('DROP SCHEMA "'+schema+'" CASCADE');await admin.query('DROP ROLE "'+role+'"');}
  if(publicControl)await admin.query('DROP TABLE public.goals');
  await admin.end();await rm(root,{recursive:true,force:true});
 }
}
void main().catch(()=>{console.error('PERSISTENT_STORAGE_NATIVE_TEST_FAILED');process.exitCode=1;});
