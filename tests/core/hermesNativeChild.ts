import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {openPersistentBinding} from '../../deploy/render-test/persistentBinding';

async function main(){
  const binding=await openPersistentBinding(process.argv[2]);
  const u=new URL(binding.binding.connectionString);if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_core_test')throw Error('NATIVE_LOCAL_ONLY');
  process.env.DATABASE_URL=binding.binding.connectionString;
  const {pool}=await import('../../packages/db/src/client');
  const {HermesClient}=await import('../../packages/hermes/src/client');
  const {withHermesCandidate,HERMES_CAPABILITY}=await import('../../apps/production/src/hermesBundle');
  const {sha256Hex}=await import('../../packages/shared/src/stableJson');
  let submissions=0,stops=0,hold=false,accepted:()=>void=()=>{};
  const ledger=new Map<string,{body:string;run_id:string}>();
  const server=createServer(async(req,res)=>{
    let body='';for await(const b of req)body+=b;
    const send=(x:any,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(x));};
    if(req.url==='/v1/capabilities')return send({auth:{type:'bearer',required:true},features:{run_submission:true,run_status:true,run_stop:true,runs_idempotency:{durable:true,retention_seconds:86400}}});
    if(req.url==='/v1/toolsets')return send({data:[]});
    if(req.url==='/api/sessions')return send({id:JSON.parse(body).id},201);
    if(req.url?.endsWith('/model'))return send({session_id:req.url.split('/')[3],runtime:{provider:'nous',model:'poolside/laguna-s-2.1:free',model_lock:'accepted'}});
    if(req.url==='/v1/runs'){
      const key=String(req.headers['idempotency-key']);let prior=ledger.get(key);
      if(prior&&prior.body!==body)return send({},409);
      if(!prior){submissions++;prior={body,run_id:'run_'+submissions};ledger.set(key,prior);}
      accepted();return send({run_id:prior.run_id,status:'started'},202);
    }
    if(req.url?.endsWith('/stop')){stops++;return send({status:'cancelled'});}
    return send({run_id:req.url!.split('/').at(-1),status:hold?'running':'completed',output:'42',runtime:{provider:'nous',model:'poolside/laguna-s-2.1:free'}});
  });
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const baseUrl=`http://127.0.0.1:${(server.address() as any).port}`;
  const adapter=()=>withHermesCandidate({capabilities:[],toolDefinitions:[],toolAdapters:[]},{
    client:new HermesClient({baseUrl,apiKey:'native-fixture-key-not-a-live-secret',assertServerPolicy:async()=>{},pollMs:5}),
    verifier:{capabilityId:HERMES_CAPABILITY,async verify(){return {result:'INCONCLUSIVE',verifier:'fixture',evidence:{fixture:true}};}}
  }).toolAdapters[0];
  const params={agent_role:'tester',instructions:'Return 42'};
  const taskIds:string[]=[];
  async function work(){
    const goal=randomUUID(),plan=randomUUID(),id=randomUUID();taskIds.push(id);
    await pool.query(`INSERT INTO goals(id,business_id,company_scope,domain,objective,state,authority_ceiling) VALUES($1,$2,$3,'hermes_native_test','native fixture','EXECUTING','GREEN')`,[goal,'native-'+goal,binding.binding.entity]);
    await pool.query(`INSERT INTO plans(id,goal_id,version,plan_hash,steps) VALUES($1,$2,1,$3,'[]')`,[plan,goal,'native-fixture-plan']);
    await pool.query('UPDATE goals SET current_plan_id=$2 WHERE id=$1',[goal,plan]);
    await pool.query(`INSERT INTO work_queue(id,goal_id,plan_id,capability_id,params,status,lease_expiry,lease_owner,fencing_token)
      VALUES($1,$2,$3,$4,$5,'EXECUTING',now()+interval '3 minutes','native-worker',1)`,[id,goal,plan,HERMES_CAPABILITY,params]);
    return {goal,id,request:{capabilityId:HERMES_CAPABILITY,params,idempotencyKey:'native-'+id,executionContext:{queueId:id,fencingToken:1}}};
  }
  try{
    const first=await work();const result=await adapter().execute(first.request);assert.equal(result.result.candidate,'42');
    const saved=(await pool.query('SELECT handoff FROM work_queue WHERE id=$1',[first.id])).rows[0].handoff.hermes;
    assert.equal(saved.status,'completed');assert.equal(saved.runId,'run_1');
    assert.equal((await adapter().execute(first.request)).result.candidate,'42');assert.equal(submissions,1);
    await assert.rejects(adapter().execute({...first.request,executionContext:{queueId:first.id,fencingToken:2}}),/HERMES_WORK_NO_LONGER_AUTHORIZED/);
    await pool.query("UPDATE work_queue SET status='HANDBACK',lease_owner=NULL,lease_expiry=NULL WHERE id=$1",[first.id]);
    const {claimNextWorkForSpecialistAtomic}=await import('../../apps/agents/src/runtime');
    const claimed=await claimNextWorkForSpecialistAtomic({agentId:'hermes',version:'native',capabilities:[HERMES_CAPABILITY]},'reconstructed-worker',180,first.goal);
    assert(claimed);assert.notEqual(claimed.fencingToken,1);
    assert.equal((await pool.query('SELECT handoff FROM work_queue WHERE id=$1',[first.id])).rows[0].handoff.hermes.runId,'run_1');
    assert.equal((await adapter().execute({...first.request,executionContext:{queueId:first.id,fencingToken:claimed.fencingToken}})).result.candidate,'42');assert.equal(submissions,1);
    hold=true;const second=await work();let readyResolve:()=>void=()=>{};const ready=new Promise<void>(r=>readyResolve=r);accepted=readyResolve;
    const inFlight=adapter().execute(second.request);await ready;
    await assert.rejects(adapter().execute(second.request),/HERMES_BUSY/);
    await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[second.goal]);
    await assert.rejects(inFlight,/HERMES_WORK_NO_LONGER_AUTHORIZED/);assert.equal(stops,1);
    assert.equal((await pool.query('SELECT count(*)::int n FROM executions WHERE goal_id=$1',[second.goal])).rows[0].n,0);
    hold=false;
    const {hermesProbeBundle,prepareHermesProbe,reviewHermesProbe}=await import('../../apps/production/src/hermesProbe');
    const {createProductionComposition}=await import('../../apps/production/src/composition');
    const bundle=hermesProbeBundle(new HermesClient({baseUrl,apiKey:'native-fixture-key-not-a-live-secret',assertServerPolicy:async()=>{},pollMs:5,requireNativeModelLock:true}));
    const probeId=randomUUID();
    await pool.query(`INSERT INTO goals(id,business_id,company_scope,domain,objective,state,authority_ceiling,completion_definition)
      VALUES($1,$2,$3,'hermes_probe','SUM 17 25','NEW','GREEN','sam.read_report.v1')`,[probeId,'probe-'+probeId,binding.binding.entity]);
    await prepareHermesProbe(bundle,probeId,binding.binding.entity,new Date(Date.now()-10000).toISOString());
    const runtime=createProductionComposition({bundle,workerId:'native-hermes-probe',maintenanceGoalIds:[probeId],verificationGoalId:probeId,specialistScopeGoalId:probeId,specialistConcurrency:1});
    await runtime.runWorkTick();await reviewHermesProbe(bundle,probeId);
    assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[probeId])).rows[0].state,'COMPLETED');
    assert.equal((await pool.query('SELECT decision FROM goal_read_reviews WHERE goal_id=$1',[probeId])).rows[0].decision.summary,'النتيجة: 42');
    const digest=sha256Hex((await pool.query('SELECT id,handoff FROM work_queue WHERE id=ANY($1::uuid[]) ORDER BY id',[taskIds])).rows);
    console.log(JSON.stringify({status:'PASS',nativePostgres:true,restrictedRole:true,httpTransport:'STUB',submissions,stops,taskIds,receiptDigest:digest,
      checks:['durable_receipt','duplicate_replay','stale_fence_denial','receipt_survives_real_reclaim','single_flight_advisory_lock','cancel_and_stop','no_execution_after_cancel','kernel_plan_execute_sql_verify_report'],liveHermes:false}));
  }finally{await pool.end();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
}
void main().catch(()=>{console.error('HERMES_NATIVE_SQL_FAILED');process.exitCode=1;});
