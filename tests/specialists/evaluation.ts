// These fixtures test the evaluation contract and scorer, NOT SAM model quality.
// Real orchestration/kernel behavior is exercised by specialists/acceptance.ts.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {evaluationCases} from '../../apps/agents/src/evaluation/cases';
import {prepareEvaluation,scoreEvaluation,contentHash,type EvaluationTrace} from '../../apps/agents/src/evaluation/harness';
const commit='a'.repeat(40),at=(second:number)=>new Date(Date.UTC(2026,9,22,0,0,second)).toISOString();
const zero=()=>({models:0,tools:0,tokens:0,costUsd:0,delegations:0});
export function fixture(caseId:string):EvaluationTrace{
 const scenario=evaluationCases.find(c=>c.id===caseId)!,companyId=randomUUID();
 const counters={models:4,tools:6,tokens:1000,costUsd:0.1,delegations:4};
 const source=scenario.sources.find(s=>s.id===scenario.expected.sourceId)!;
 const events:EvaluationTrace['events']=[
  {id:'delegate',agentId:'executive',companyId,at:at(1),kind:'delegation',capabilityId:'specialist.market',reserved:{...zero(),delegations:1},outcome:'success',sideEffect:false},
  ...['market','risk'].map((agentId,i)=>({id:'model-'+agentId,agentId,companyId,at:at(2+i),kind:'model' as const,providerId:'fixture',model:'fixture-model',reserved:{...zero(),models:1,tokens:100,costUsd:0.01},usage:{inputTokens:20,outputTokens:10},outcome:'success' as const,sideEffect:false})),
  {id:'correction',agentId:'market',companyId,at:at(5),kind:'tool',capabilityId:'source.read',sourceId:source.id,reserved:{...zero(),tools:1},outcome:'success',sideEffect:false},
  {id:'independent-readback',agentId:'market',companyId,at:at(6),kind:'readback',capabilityId:'source.read',sourceId:source.id,reserved:{...zero(),tools:1},outcome:'success',sideEffect:false}
 ];
 const ids=Array.from({length:4},()=>randomUUID());
 return {schemaVersion:1,classification:'FIXTURE',commit,caseId,companyId,rootQueueId:randomUUID(),startedAt:at(0),completedAt:at(10),deadline:at(30),
  sharedLimits:counters,agentLimits:{executive:counters,market:counters,risk:counters},events,
  verifiedSources:[{id:source.id,companyId,executionId:randomUUID(),verificationId:randomUUID(),verifiedAt:at(7),status:'VERIFIED',contentHash:contentHash(source.data)}],
  conflicts:scenario.conflict?[{topic:scenario.expected.topic,detectedAt:at(4),correctiveReadEventId:'correction'}]:[],
  report:{summary:'Invented benchmark quotation; no claim about actual markets',claims:[{topic:scenario.expected.topic,value:scenario.expected.value,sourceId:source.id}],uncertainties:['Live reasoning and real market truth not evaluated'],classification:'MODEL_INFERENCE'},
  learning:(['OBSERVATION','HYPOTHESIS','EVALUATION','VERIFIED_LESSON'] as const).map((kind,i)=>({id:ids[i],parentId:i?ids[i-1]:null,kind,sourceId:source.id,statement:scenario.expected.value,trusted:i===3})),humanReview:'PENDING'};
}
function main(){
 const plan=prepareEvaluation(commit);assert.equal(plan.liveCallsAuthorized,false);assert.equal(plan.cases.length,3);
 assert(plan.cases.every(c=>!('expected' in c)&&!('conflict' in c)),'answer key excluded from model inputs');
 for(const c of evaluationCases){const scored=scoreEvaluation(fixture(c.id),commit);assert.equal(scored.status,'PASS');assert.equal(scored.liveReasoningValidated,false);}
 const rejects=(name:string,edit:(t:EvaluationTrace)=>void)=>{const t=fixture(evaluationCases[0].id);edit(t);const result=scoreEvaluation(t,commit);assert.equal(result.status,'FAIL',name);return result;};
 rejects('wrong candidate',t=>t.commit='b'.repeat(40));
 rejects('uncharged readback',t=>t.events.at(-1)!.reserved.tools=0);
 rejects('success without usage',t=>delete t.events[1].usage);
 rejects('shared budget includes retries',t=>{t.sharedLimits.models=2;const retry=structuredClone(t.events[1]);retry.id='retry';retry.outcome='timeout';t.events.push(retry);});
 rejects('agent cost ceiling',t=>t.agentLimits.market={...t.agentLimits.market,costUsd:0});
 rejects('agent token ceiling',t=>t.agentLimits.market={...t.agentLimits.market,tokens:10});
 rejects('foreign company',t=>t.events[1].companyId=randomUUID());
 rejects('foreign unused source',t=>t.verifiedSources.push({...t.verifiedSources[0],id:'foreign',companyId:randomUUID()}));
 rejects('duplicate receipt',t=>t.verifiedSources.push({...t.verifiedSources[0]}));
 rejects('external write',t=>t.events[3].sideEffect=true);
 rejects('unauthorized capability',t=>t.events[3].capabilityId='email.send');
 rejects('forged source hash',t=>t.verifiedSources[0].contentHash='forged');
 rejects('expired benchmark source',t=>{
  const shift=(s:string)=>new Date(Date.parse(s)+90*86400000).toISOString();
  t.startedAt=shift(t.startedAt);t.completedAt=shift(t.completedAt);t.deadline=shift(t.deadline);
  t.events.forEach(e=>e.at=shift(e.at));t.verifiedSources.forEach(s=>s.verifiedAt=shift(s.verifiedAt));t.conflicts.forEach(c=>c.detectedAt=shift(c.detectedAt));
 });
 rejects('unsupported claim',t=>t.report.claims[0].value='guaranteed profit');
 rejects('stale correction',t=>t.conflicts[0].detectedAt=at(8));
 rejects('inference is not trusted memory',t=>t.learning[3].kind='MODEL_INFERENCE');
 rejects('detached learning chain',t=>t.learning[3].parentId=t.learning[0].id);
 rejects('deadline',t=>t.completedAt=at(40));
 const captured=fixture(evaluationCases[0].id);captured.classification='CAPTURED_MODEL_RUN';assert.equal(scoreEvaluation(captured,commit).liveReasoningValidated,false,'captured provenance never self-certifies live intelligence');
 const dir=mkdtempSync(join(tmpdir(),'sam-evaluation-'));
 try{
  const cli=(args:string[])=>spawnSync(process.execPath,['--import','tsx','apps/agents/src/evaluation/cli.ts',...args],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:10000});
  const forbidden=cli(['live']);assert.equal(forbidden.status,1);assert.match(forbidden.stderr,/LIVE_EVALUATION_NOT_AUTHORIZED/);
  const out=join(dir,'prepared');assert.equal(cli(['prepare','--commit',commit,'--output',out]).status,0);assert.equal(JSON.parse(readFileSync(join(out,'report.json'),'utf8')).result.liveCallsAuthorized,false);
  const trace=join(dir,'trace.json');writeFileSync(trace,JSON.stringify(fixture(evaluationCases[0].id)));
  assert.equal(cli(['score','--commit',commit,'--input',trace,'--output',join(dir,'scored')]).status,0);
  const bad=fixture(evaluationCases[0].id);bad.events[3].sideEffect=true;writeFileSync(trace,JSON.stringify(bad));
  assert.equal(cli(['score','--commit',commit,'--input',trace,'--output',join(dir,'rejected')]).status,1);
 }finally{rmSync(dir,{recursive:true,force:true});}
 console.log(JSON.stringify({suite:'provider-independent-evaluation-contract',status:'PASS',cases:3,negativeChecks:18,liveCalls:'NOT_RUN',liveReasoningValidated:false,classification:'FIXTURE_CONTRACT_ONLY'}));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
