import {Pool} from 'pg';
import {applyIntegrationProfile,provisionIntegrationAccess,assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {validateParameters,validateToolParameters} from '../../packages/tool-gateway/src/validation';
import {DERIVE_PARAMETERS} from '../../apps/brain/src/evidence/planSchema';
import {derivedCellQuote,derivedReviewText} from '../../apps/production/src/derivedReviewEvidence';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pool} from '../../packages/db/src/client';
import {reviewFixture} from './reviewFixture';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {withVerifiedEvidence,DERIVED_VERIFICATION_CONTRACT} from '../../apps/production/src/verifiedEvidenceBundle';
import {DERIVE_CAPABILITY,deriveArtifact,replayArtifact,replayStoredArtifact,type DeriveRequest} from '../../apps/brain/src/evidence/artifacts';
import {type OutputContract} from '../../apps/brain/src/evidence/contracts';
import {reviewNextReadGoal,validateReadReview} from '../../apps/production/src/readGoalReview';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {recallKnowledge} from '../../apps/brain/src/knowledge';
import type {Column,Operation} from '../../apps/brain/src/evidence/transforms';
let profileRole:string|undefined,profilePool:Pool|undefined;
async function cleanupProfile(){if(profilePool){await profilePool.end();profilePool=undefined;}if(profileRole){await pool.query('DROP OWNED BY '+profileRole);await pool.query('DROP ROLE '+profileRole);profileRole=undefined;}}
async function main(){
 const setup=await pool.connect();try{await applyIntegrationProfile(setup);}finally{setup.release();}
 const f=await reviewFixture();
 profileRole='evi_'+crypto.randomUUID().replaceAll('-','').slice(0,16);
 const provision=await pool.connect();try{
  const schema=(await provision.query('SELECT current_schema() name')).rows[0].name;
  await provision.query(`CREATE ROLE ${profileRole} LOGIN PASSWORD 'synthetic-evidence-profile-only' NOSUPERUSER NOBYPASSRLS`);
  await provisionIntegrationAccess(provision,{schema,role:profileRole,orgId:f.org,legalEntityId:f.entity});
 }finally{provision.release();}
 const target=new URL(process.env.DATABASE_URL!);target.username=profileRole;target.password='synthetic-evidence-profile-only';
 target.searchParams.set('options',(target.searchParams.get('options')??'')+` -c app.current_org_id=${f.org} -c app.current_legal_entity_id=${f.entity}`);
 profilePool=new Pool({connectionString:target.href,max:2});
 const profileDb={async connect(){const c=await profilePool!.connect();try{await assertIntegrationAccess(c);return c;}catch(e){c.release();throw e;}}};
 process.env.SAM_INTEGRATION_ENABLED='1';process.env.SAM_KNOWLEDGE_ENABLED='true';
 const rawContract=(await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES('review_echo','Synthetic read','db_query','{"readback":"boolean"}','{}') RETURNING id`)).rows[0].id;
 await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,$2,'db_query',$3,$4)`,[DERIVE_CAPABILITY,DERIVED_VERIFICATION_CONTRACT.description,DERIVED_VERIFICATION_CONTRACT.requiredEvidenceFields,DERIVED_VERIFICATION_CONTRACT.independentQueryTemplate]);
 assert(!f.bundle.catalog.planningDescriptors().some(d=>d.capabilityId===DERIVE_CAPABILITY),'default composition stays disabled');
 
 async function scenario(input:{objective:string;columns:Record<string,Column>;records:any[];operations:Operation[];field:string;value:string;expected:'complete'|'blocked';coverage?:string;revoke?:boolean;race?:'insert'|'update';oversized?:boolean;rawFinding?:boolean}){
  const contract:OutputContract={id:'fixture.records.v1',capabilityId:'review_echo',description:'Reviewed synthetic record fields only',extraction:{version:'1',...(input.oversized?{sourceLimitations:['x'.repeat(9000)]}:{}),columns:input.columns,rowsPath:['records'],coveragePath:['coverage'],timeZonePath:['timeZone'],limitationsPath:['limitations']}};
  const bundle=validateProductionBundle(withVerifiedEvidence(f.bundle.raw,[contract]));
  assert.equal(bundle.catalog.get('review_echo').output?.extractionContracts?.[0].id,contract.id);
  const id=await f.goal(input.objective,'PLANNING');
  await pool.query("UPDATE goals SET completion_definition='sam.read_report.v1' WHERE id=$1",[id]);
  const first=await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId:'review_echo',params:{fixture:true}}]});
  const lease=await leaseWorkAtomic(first.queueIds[0],'fixture',60);
  const raw=await recordExecutionAndRequestVerificationAtomic({queueId:first.queueIds[0],fencingToken:lease.token,actor:'fixture',result:{records:input.records,coverage:input.coverage??'complete',timeZone:'Europe/Amsterdam',limitations:input.coverage==='partial'?['Next page unavailable']:[]},evidence:{readback:true}});
  await recordIndependentVerificationAtomic({executionId:raw.executionId,verifier:'independent-fixture',contractId:rawContract,independentEvidence:{readback:true},result:'VERIFIED'});
  const request:DeriveRequest={sources:{records:{executionId:raw.executionId,contractId:contract.id}},plan:{version:1,source:'records',operations:input.operations}};
  for(const op of [{op:'join',right:'records',kind:'inner'},{op:'group',keys:['batch'],aggregates:[{as:'sum',fn:'sum'}]},{op:'derive',as:'x',left:'a',right:'b',operator:'eval'}]){
   assert.throws(()=>validateParameters(DERIVE_PARAMETERS,{...request,plan:{...request.plan,operations:[op]}}),'incomplete/unsupported operations must fail review admission');
   assert.throws(()=>validateToolParameters(DERIVE_CAPABILITY,{...request,plan:{...request.plan,operations:[op]}},DERIVE_PARAMETERS),'executor enforces the same model-visible schema');
  }
 let reviewCalls=0;
  const continued=await reviewNextReadGoal(bundle,pool,async prompt=>{
   reviewCalls++;assert.equal(prompt.objective,input.objective);
   const visible=prompt.capabilities.find((c:any)=>c.capabilityId===DERIVE_CAPABILITY);assert(visible);
   const operations=visible.parameters.properties.plan.properties.operations.items.anyOf;
   assert(operations.find((op:any)=>op.properties.op.enum[0]==='join').required.includes('leftKey'));
   assert(operations.find((op:any)=>op.properties.op.enum[0]==='group').properties.aggregates.items.anyOf.find((a:any)=>a.properties.fn.enum[0]==='sum').required.includes('field'));
   validateParameters(visible.parameters,request);
   return {status:'continue',summary:'Verified records need deterministic comparison',requirements:[{requirement:input.objective,fulfilled:false,evidenceIds:[raw.executionId]}],findings:[],limitations:[],steps:[{capabilityId:DERIVE_CAPABILITY,params:request}]};
  });assert.equal(continued.status,'continue');
  const queue=(await pool.query(`SELECT * FROM work_queue WHERE goal_id=$1 AND capability_id=$2`,[id,DERIVE_CAPABILITY])).rows[0];
  const claimed=await leaseWorkAtomic(queue.id,'transform',60);
  const work={queueId:queue.id,fencingToken:claimed.token,goalId:id,planId:queue.plan_id,capabilityId:DERIVE_CAPABILITY,params:request as any};
  const executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
  await assert.rejects(bundle.tools.adapter(DERIVE_CAPABILITY).execute({capabilityId:DERIVE_CAPABILITY,params:request as any,idempotencyKey:'untrusted'}),/WORK_CONTEXT_REQUIRED/);
  const outcome=await executors[DERIVE_CAPABILITY](work);
  const retry=await executors[DERIVE_CAPABILITY](work);assert.deepEqual(retry,outcome,'deterministic retry uses the same artifact identity without source work');
  const recorded=await recordExecutionAndRequestVerificationAtomic({queueId:queue.id,fencingToken:claimed.token,actor:'transform',...outcome});
  await assert.rejects(recordExecutionAndRequestVerificationAtomic({queueId:queue.id,fencingToken:claimed.token,actor:'transform',...outcome}),/LEASED\/EXECUTING/);
  assert.equal((await verifyNextExecution(bundle)).executionId,recorded.executionId);
  const artifact=(outcome.result as any).derivedEvidence;
  assert.equal(artifact.output.dataset.rows[0].values[input.field],input.value);
  const scope={goalId:id,legalEntityId:f.entity};
  await pool.query('UPDATE executions SET result=$2 WHERE id=$1',[recorded.executionId,{derivedEvidence:{...artifact,artifactId:'tampered'}}]);
  await assert.rejects(replayStoredArtifact(pool,scope,recorded.executionId,bundle.raw.verifiedEvidenceContracts!),/HASH_MISMATCH/);
  await pool.query('UPDATE executions SET result=$2 WHERE id=$1',[recorded.executionId,outcome.result]);
  assert.deepEqual(await replayArtifact(pool,scope,artifact,bundle.raw.verifiedEvidenceContracts!),artifact,'cold replay after persisted execution');
  await assert.rejects(replayArtifact(pool,{...scope,legalEntityId:crypto.randomUUID()},artifact,[contract]),/SCOPE_MISMATCH/);
  const stale=structuredClone(contract);stale.extraction.version='2';await assert.rejects(replayArtifact(pool,scope,artifact,[stale]),/REPLAY_MISMATCH/);
  const tampered=structuredClone(artifact);tampered.output.dataset.rows[0].values[input.field]='999';await assert.rejects(replayArtifact(pool,scope,tampered,[contract]),/REPLAY_MISMATCH/);
  await assert.rejects(deriveArtifact(pool,scope,{...request,sources:{records:{executionId:raw.executionId,contractId:'invented'}}},[contract]),/SCHEMA_UNKNOWN/);
  if(input.revoke)await pool.query(`INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at) SELECT execution_id,'revoked','db_query',contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications WHERE execution_id=$1`,[raw.executionId]);
  let raceOutcome='not-run';
  const reviewDb=input.race?{async connect(){
   const c=await pool.connect();let final=false,fired=false;
   return {release:()=>c.release(),async query(sql:string,params?:any[]){
    const result=await c.query(sql,params);
    if(sql.includes('SELECT state,current_plan_id FROM goals')&&sql.includes('FOR UPDATE'))final=true;
    if(final&&!fired&&sql.includes('WHERE e.id=ANY')){
     fired=true;const writer=await pool.connect();
     try{await writer.query('BEGIN');await writer.query("SET LOCAL lock_timeout='100ms'");
      if(input.race==='update')await writer.query("UPDATE verifications SET result='FAILED' WHERE execution_id=$1",[raw.executionId]);
      else await writer.query(`INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at) SELECT execution_id,'racing-revocation','db_query',contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications WHERE execution_id=$1`,[raw.executionId]);
      await writer.query('COMMIT');raceOutcome='revocation-committed-before-report';
     }catch(error:any){await writer.query('ROLLBACK');if(error.code!=='55P03')throw error;raceOutcome='revocation-blocked-by-execution-lock';}
     finally{writer.release();}
    }
    return result;
   }};
  }}:profileDb;
  const reviewed=await reviewNextReadGoal(bundle,reviewDb,async prompt=>{
   reviewCalls++;
   if(prompt.proposedReport){assert(prompt.proposedReport.findings[0].derivedCitation.inputs.length);return {accepted:true,missing:[]};}
   const source=prompt.verifiedObservations.find((s:any)=>s.id===recorded.executionId);
   assert(source.derivedEvidence);assert(!source.derivedArtifact,'internal artifact is not duplicated into model prompt');
   const quoteLine=source.lines.findIndex((line:string)=>line===derivedCellQuote(artifact,0,input.field));
   assert(source.citableLines.includes(quoteLine));
   const rawObservation=prompt.verifiedObservations.find((s:any)=>s.id===raw.executionId);
   const extra=input.rawFinding?[{text:'Raw fixture content hash label',executionId:raw.executionId,quoteLine:rawObservation.lines.findIndex((l:string)=>l.includes('"hash": "same"'))}]:[];
   return {status:'complete',summary:'Cited deterministic result with explicit coverage',requirements:[{requirement:input.objective,fulfilled:true,evidenceIds:[recorded.executionId]}],findings:[{text:'Derived '+input.field+' = '+input.value,executionId:recorded.executionId,quoteLine,derivedClaim:{row:0,field:input.field,value:input.value}},...extra],limitations:[],steps:[]};
  });
  assert.equal(reviewed.status,input.revoke?'blocked':input.expected);
  if(input.oversized)assert.equal(reviewCalls,1,'projection failure must not invoke another model call');
  if(input.race){
   const state=(await pool.query('SELECT state FROM goals WHERE id=$1',[id])).rows[0].state;
   const latest=(await pool.query('SELECT result FROM verifications WHERE execution_id=$1 ORDER BY checked_at DESC,id DESC LIMIT 1',[raw.executionId])).rows[0].result;
   console.log(JSON.stringify({raceOutcome,state,latestRawVerification:latest}));
   assert.equal(raceOutcome,'revocation-blocked-by-execution-lock');assert.equal(state,'COMPLETED');assert.equal(latest,'VERIFIED');
  }
  const reports=(await pool.query('SELECT decision,round FROM goal_read_reviews WHERE goal_id=$1 ORDER BY created_at,id',[id])).rows;
  if(!input.race)assert.equal(reports.at(-1).round,2,'restricted profile must retain continuation round accounting');
  if(!input.revoke){const report=reports.at(-1).decision;assert.equal(report.status,input.expected);if(input.oversized)assert(report.limitations.includes('REVIEW_EVIDENCE_PROJECTION_BLOCKED'));if(input.expected==='complete')assert.equal(report.findings[0].derivedCitation.artifactId,artifact.artifactId);else assert(report.requirements.every((r:any)=>!r.fulfilled));}
  else {assert.equal(reviewCalls,1,'revoked lineage stops before another model call');assert.equal(reports.at(-1).decision.status,'blocked');assert(reports.at(-1).decision.limitations.includes('REVIEW_DERIVED_EVIDENCE_INVALID'));}
  assert.equal((await pool.query('SELECT count(*)::int n FROM executions WHERE goal_id=$1',[id])).rows[0].n,2,'one raw execution and one artifact execution');
  assert.equal(f.counters().sends,0,'no source adapter replay');

  return {id,recorded,artifact,scope,request,contract};
 }
 // Natural-language objectives contain no tool names/plans. The model decisions
 // are explicit test doubles; these tests do not establish autonomous quality.
 await scenario({objective:'Compare revenue in the two supplied periods in EUR, state VAT and missing evidence.',columns:{period:{kind:'text'},amount:{kind:'decimal',unit:'EUR',vat:'unknown'}},records:[{period:'earlier-A93',amount:'0.10'},{period:'earlier-A93',amount:'0.20'},{period:'later-Z42',amount:'1.05'}],operations:[{op:'group',keys:['period'],aggregates:[{as:'total',field:'amount',fn:'sum'}]}],field:'total',value:'0.3',expected:'blocked'});
 await scenario({objective:'Compare supplier promises with delivery documents and identify late deliveries and missing pages.',columns:{reference:{kind:'text'},promised:{kind:'date'},delivered:{kind:'date'}},records:[{reference:'SUP-X31',promised:'2026-10-21',delivered:'2026-10-23'}],operations:[{op:'derive',as:'delay',left:'delivered',right:'promised',operator:'subtract'}],field:'delay',value:'2',coverage:'partial',expected:'blocked'});
 await scenario({objective:'Total the supplied invoices and explain any missing tax basis.',columns:{batch:{kind:'text'},amount:{kind:'decimal',unit:'EUR'}},records:[{batch:'invoice-B31',amount:'1'},{batch:'invoice-B31',amount:'1'}],operations:[{op:'group',keys:['batch'],aggregates:[{as:'total',field:'amount',fn:'sum'}]}],field:'total',value:'2',expected:'blocked'});
 const duplicates={objective:'Inventory document duplicate counts by content, cite each group, and do not delete anything.',columns:{hash:{kind:'text' as const},document:{kind:'text' as const}},records:[{hash:'same',document:crypto.randomUUID()},{hash:'same',document:crypto.randomUUID()}],operations:[{op:'group' as const,keys:['hash'],aggregates:[{as:'copies',fn:'count' as const}]}],field:'copies',value:'2',expected:'complete' as const};
 const done=await scenario({...duplicates,rawFinding:true});
 const knowledge=(await pool.query('SELECT * FROM knowledge_records WHERE goal_id=$1',[done.id])).rows;
 assert.equal(knowledge.length,1);assert.equal(knowledge[0].kind,'SOURCE_FACT');assert(knowledge[0].statement.includes('same'));assert.notEqual(knowledge[0].execution_id,done.recorded.executionId,'derived findings remain only in report/execution ledger');
 assert.equal((await recallKnowledge(pool,f.entity,'copies')).length,0,'default memory recall cannot silently bypass derived replay');
 // A real non-owner, non-bypass role exercises the existing RLS policies.
 const restricted=await pool.connect();const role='evidence_test_'+crypto.randomUUID().replaceAll('-','');
 try{
  await restricted.query('BEGIN');
  const schema=(await restricted.query('SELECT current_schema() name')).rows[0].name;
  assert(/^[a-zA-Z0-9_]+$/.test(schema));
  await restricted.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS`);
  await restricted.query(`GRANT USAGE ON SCHEMA ${schema} TO ${role}`);
  await restricted.query(`GRANT SELECT ON executions,verifications,goals,legal_entities TO ${role}`);
  await restricted.query(`SET LOCAL ROLE ${role}`);
  const identity=(await restricted.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];assert.equal(identity.rolsuper,false);assert.equal(identity.rolbypassrls,false);
  await assert.rejects(deriveArtifact(restricted,done.scope,done.request,[done.contract]),/SCOPE_MISMATCH/,'missing trusted tenant context denies');
  await restricted.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[f.org,f.entity]);
  assert.equal((await replayStoredArtifact(restricted,done.scope,done.recorded.executionId,[done.contract])).artifactId,done.artifact.artifactId);
  await restricted.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[crypto.randomUUID()]);
  await assert.rejects(replayStoredArtifact(restricted,done.scope,done.recorded.executionId,[done.contract]),/VERIFICATION_REQUIRED/,'foreign context cannot see the artifact');
 }finally{await restricted.query('ROLLBACK');restricted.release();}
 const text=JSON.stringify({copies:'2'},null,2),source={id:done.recorded.executionId,capabilityId:DERIVE_CAPABILITY,params:{},text,truncated:false,actor:'fixture',retrievedAt:new Date().toISOString(),derivedArtifact:done.artifact};
 const claim={status:'complete',summary:'Derived count',requirements:[{requirement:'Count',fulfilled:true,evidenceIds:[source.id]}],findings:[{text:'Count is two',executionId:source.id,quoteLine:1,derivedClaim:{row:0,field:'copies',value:'999'}}],limitations:[],steps:[]};
 assert.throws(()=>validateReadReview(claim,[source],'Count documents',[]),/DERIVED_CLAIM_UNSUPPORTED/);
 // Equal values in different fields/rows are not interchangeable citations.
 const equal=structuredClone(done.artifact);equal.output.dataset.columns.money={kind:'decimal',unit:'EUR'};
 equal.output.dataset.rows[0].values.money='2';equal.output.dataset.rows.push(structuredClone(equal.output.dataset.rows[0]));
 const equalSource={...source,text:derivedReviewText(equal).text,derivedArtifact:equal};
 const wrong={...claim,findings:[{text:'Money is two',executionId:source.id,quote:derivedCellQuote(equal,0,'copies'),derivedClaim:{row:0,field:'money',value:'2'}}]};
 assert.throws(()=>validateReadReview(wrong,[equalSource],'Total invoices',[]),/DERIVED_CLAIM_UNSUPPORTED/);
 wrong.findings[0].quote=derivedCellQuote(equal,1,'money');
 assert.throws(()=>validateReadReview(wrong,[equalSource],'Total invoices',[]),/DERIVED_CLAIM_UNSUPPORTED/);
 wrong.findings[0].quote=derivedCellQuote(equal,0,'money');
 assert.equal(validateReadReview(wrong,[equalSource],'Total invoices',[]).findings.length,1);
 await scenario({...duplicates,oversized:true,expected:'blocked'});
 await scenario({...duplicates,race:'insert'});
 await scenario({...duplicates,race:'update'});
 await scenario({...duplicates,revoke:true});
 assert.equal((await pool.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,0);
 console.log(JSON.stringify({status:'PASS',liveModelCalls:0,productionRegistration:false,classification:'SYNTHETIC_SCRIPTED_DECISIONS_NOT_AUTONOMOUS_MODEL_QUALITY',checks:['ordinary review continuation','fenced artifact persistence','duplicate commit refused','independent replay verification','contract version/tamper/refusal','raw row citations','partial/unknown semantics blocked','provisioned restricted-role completion; raw-only knowledge capture','revocation before review']}));
 await cleanupProfile();await pool.end();
}
main().catch(async e=>{console.error(e);await cleanupProfile();await pool.end();process.exitCode=1;});
