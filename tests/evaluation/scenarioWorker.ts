/** Scripted synthetic provider ONLY. It tests actual executive planning,
 * specialist loops, failure handling and synthesis; it is not an intelligence
 * demonstration and supplies no production planner or runtime routing. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {ModelGateway} from '../../packages/model-gateway/src/gateway';
import {fixtureEvaluationAdapter} from '../../packages/model-gateway/src/evaluationAdapter';
import {createIntelligentComposition} from '../../apps/agents/src/intelligence/composition';
import {commercialEvaluationBundle} from '../../apps/agents/src/evaluation/scenarioRuntime';
import {commercialScenario} from '../../apps/agents/src/evaluation/scenarios';
import {openEvaluationTrial} from '../../apps/agents/src/evaluation/trial';
const scenario=commercialScenario(process.argv[2])!;
let active=0,maxActive=0,release!:()=>void;const seen=new Set(),barrier=new Promise<void>(r=>release=r);
const plan=['Study the objective and source limitations','Collect independent commercial and risk evidence','Reconcile disagreements; report bounded inferences'];
const dispatch=(tasks:any[])=>({action:'dispatch',understanding:scenario.objective,plan,reason:'Need independently read and verified evidence',tasks});
const read=(id:string)=>dispatch([{capabilityId:'source.read',objective:'Examine independently sourced evidence '+id,params:{channel:id}}]);
const report=(e:any,extra?:any)=>({action:'report',understanding:scenario.objective,plan,summary:'Synthetic fixture recommendation: conduct a limited further study; observations are quotations and do not establish commercial viability.',claims:[{topic:e.result.sourceData.topic,value:e.result.sourceData.value,evidenceIds:[e.id]},...(extra?[extra]:[])],uncertainties:['Fixtures simulate model decisions; independent live reasoning and actual commercial truth are not evaluated.'],completionCriteria:['Current independent source quotations','Disagreement addressed with additional evidence','No commercial actions']});
async function main(){
 const adapter=fixtureEvaluationAdapter('commercial-fixture',async request=>{
  const p=JSON.parse(request.messages[1].content);active++;maxActive=Math.max(maxActive,active);
  try{
   if(!p.agent)return {model:'fixture',usage:{inputTokens:100,outputTokens:50},output:{steps:[{capabilityId:'specialist.executive',params:{objective:p.objective}}]}};
   const ctx=p.verifiedContext,agent=p.agent.id;
   let output:any;
   if(agent==='executive-specialist'){
    if(!ctx.tasks.length)output=dispatch([{capabilityId:'specialist.market',objective:'Independently investigate opportunity and unit assumptions',params:{objective:'Independently investigate opportunity and unit assumptions'}},{capabilityId:'specialist.risk',objective:'Independently challenge assumptions and quantify commercial risk',params:{objective:'Independently challenge assumptions and quantify commercial risk'}}]);
    else {
     const corrective=ctx.evidence.find((e:any)=>e.result.sourceId===scenario.sources[2].id);
     const prior=ctx.evidence.find((e:any)=>e.result.sourceId===scenario.sources[0].id);
     if(corrective){
      const risk=ctx.evidence.find((e:any)=>e.result.sourceId===scenario.sources[1].id);
      const field=Object.keys(risk.result.sourceData).find(k=>!['topic','value','unit','scope','facet'].includes(k))!;
      output=report(corrective,{topic:field,value:String(risk.result.sourceData[field]),evidenceIds:[risk.id]});
      if(!p.prior.some((h:any)=>h.error==='SPECIALIST_CONTRADICTORY_REPORT'))output.claims.push({topic:risk.result.sourceData.topic,value:risk.result.sourceData.value,evidenceIds:[risk.id]});
     }else if(!p.prior.some((h:any)=>h.error==='SPECIALIST_CONFLICT_UNRESOLVED'))output=report(prior);
     else if(!p.prior.some((h:any)=>h.decision?.claims?.[0]?.topic==='guaranteed-profit')){output=report(prior);output.claims[0].topic='guaranteed-profit';}
     else if(!p.prior.some((h:any)=>h.decision?.claims?.[0]?.evidenceIds?.includes('00000000-0000-4000-8000-000000000001'))){output=report(prior);output.claims[0].evidenceIds=['00000000-0000-4000-8000-000000000001'];}
     else output=read(scenario.sources[2].id);
    }
   }else{
    if(!seen.has(agent)){seen.add(agent);if(seen.size===2)release();await Promise.race([barrier,new Promise((_,reject)=>setTimeout(()=>reject(Error('SPECIALISTS_NOT_CONCURRENT')),3000))]);}
    const source=ctx.evidence.find((e:any)=>e.capabilityId==='source.read');
    if(source)output=report(source);
    else {const facet=agent==='market-specialist'?(ctx.tasks.length?'commercial':'archive'):(ctx.tasks.length?'risk':'untrusted');output=read(scenario.sources[{commercial:0,risk:1,archive:3,untrusted:4}[facet as 'commercial'|'risk'|'archive'|'untrusted']].id);}
   }
   return {model:'fixture',usage:{inputTokens:200,outputTokens:100},output};
  }finally{active--;}
 });
 const {bundle,configs}=commercialEvaluationBundle(process.env.FIXTURE_ENTITY!,scenario.id,adapter),trial=await openEvaluationTrial(process.env.FIXTURE_TRIAL!);
 const {composition}=await createIntelligentComposition({bundle,workerId:'phase8-commercial-fixture',intelligence:{configs,catalog:bundle.catalog,tools:bundle.tools,gateway:new ModelGateway({[adapter.providerId]:adapter}),trial,diagnostic:e=>console.error(e)}});
 const started=Date.now();let state='';
 while(Date.now()-started<55000){await composition.runWorkTick();state=(await pool.query('SELECT state FROM goals WHERE id=$1',[trial.rootGoalId])).rows[0].state;if(state==='COMPLETED')break;await new Promise(r=>setTimeout(r,50));}
 if(state!=='COMPLETED')console.log(JSON.stringify((await pool.query('SELECT agent_id,state FROM specialist_sessions')).rows));
 assert.equal(state,'COMPLETED');assert(maxActive>=2);
 const final=(await pool.query('SELECT result,evidence FROM executions WHERE goal_id=$1',[trial.rootGoalId])).rows[0];
 assert.equal((await pool.query("SELECT v.result FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1 ORDER BY v.checked_at DESC,v.id DESC LIMIT 1",[trial.rootGoalId])).rows[0].result,'VERIFIED');
 const root=(await pool.query("SELECT state FROM specialist_sessions WHERE agent_id='executive-specialist'")).rows[0].state;
 assert(root.history.some((h:any)=>h.error==='SPECIALIST_CONFLICT_UNRESOLVED'));
 assert(root.history.some((h:any)=>h.error==='SPECIALIST_CONTRADICTORY_REPORT'),'two supported but mutually contradictory final claims must not verify');
 assert(root.history.filter((h:any)=>h.error==='SPECIALIST_UNGROUNDED_CLAIM').length>=2,'metadata/topic laundering and missing citations must not verify');
 assert.equal((await pool.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,0);
 assert((await pool.query("SELECT count(*)::int n FROM verifications WHERE result='FAILED'")).rows[0].n>=2,'stale and hostile source reads must fail verification');
 await composition.runWorkTick();
 console.log(JSON.stringify({suite:scenario.id,status:'PASS',maxConcurrent:maxActive,classification:'SCRIPTED_PROVIDER_REAL_ORCHESTRATION',liveCalls:0,modelQuality:'NOT_EVALUATED'}));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
