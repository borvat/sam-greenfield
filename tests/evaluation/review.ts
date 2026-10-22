/** Independent hostile-capture tests: valid signatures never substitute for
 * structural validation. These are manufactured fixtures, not model runs. */
import assert from 'node:assert/strict';
import {generateKeyPairSync,createHash,sign,randomUUID} from 'node:crypto';
import {stableStringify,sha256Hex} from '../../packages/shared/src/stableJson';
import {verifyEvaluationTrace} from '../../apps/agents/src/evaluation/trace';
import {contentHash} from '../../apps/agents/src/evaluation/harness';
import {publicCases} from '../../apps/agents/src/evaluation/cases';
import {zero} from '../../apps/agents/src/evaluation/trialSpec';
import {prepareCommercialEvaluation,currentCommercialSource} from '../../apps/agents/src/evaluation/scenarios';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
const keys=generateKeyPairSync('ed25519'),at=new Date().toISOString();
function fixture(){
 const limits={...ceiling},reserved={...zero(),models:1,tokens:100,costUsd:0.001};
 const trial={id:randomUUID(),root_goal_id:randomUUID(),legal_entity_id:randomUUID(),sealed:false,cancelled:false,
  created_at:at,deadline:new Date(Date.parse(at)+120000).toISOString(),used:{...reserved},agent_used:{'executive-bootstrap':{...reserved}},agent_deadlines:{'executive-bootstrap':new Date(Date.parse(at)+60000).toISOString()},spec:{} as any};
 trial.spec={version:1,mode:'fixture',syntheticOnly:true,commit:'a'.repeat(40),caseId:'industrial-refrigeration',corpusHash:contentHash(publicCases()),companyId:trial.legal_entity_id,rootCapabilityId:'specialist.executive',limits,agents:{'executive-bootstrap':limits},prices:[{providerId:'fixture',model:'fixture',inputPer1k:0.01,outputPer1k:0.01}],capabilityHash:'f'.repeat(64)};
 const id=randomUUID();
 return {captureStatus:'INCOMPLETE_SNAPSHOT',exportedAt:at,trial,events:[{kind:'RESERVED',reservation_id:id,payload:{kind:'model',goalId:trial.root_goal_id,agentId:'executive-bootstrap',providerId:'fixture',model:'fixture',maxInputTokens:60,maxOutputTokens:40,reserved},created_at:at}] as any[]};
}
function envelope(payload:any){
 let previous='0'.repeat(64);payload.events=payload.events.map((e:any,i:number)=>{
  const canonical=stableStringify({trialId:payload.trial.id,sequence:i+1,kind:e.kind,reservationId:e.reservation_id,payload:e.payload,at:e.created_at});
  const hash=createHash('sha256').update(previous+canonical).digest('hex');const event={...e,trial_id:payload.trial.id,sequence:i+1,canonical,previous_hash:previous,hash};previous=hash;return event;
 });
 return {format:'sam-evaluation-v1',keyId:createHash('sha256').update(keys.publicKey.export({type:'spki',format:'der'})).digest('hex'),payload,signature:sign(null,Buffer.from(stableStringify(payload)),keys.privateKey).toString('base64')};
}
assert.equal(verifyEvaluationTrace(envelope(fixture()),keys.publicKey).pending.length,1);
// A later operator export does not extend execution admission or invalidate a
// previously completed time window. Explicit zero-priced fixture models remain valid.
const free=fixture();free.trial.spec.prices[0].inputPer1k=0;free.trial.spec.prices[0].outputPer1k=0;
free.events[0].payload.reserved.costUsd=0;free.trial.used.costUsd=0;free.trial.agent_used['executive-bootstrap'].costUsd=0;
free.exportedAt=new Date(Date.parse(at)+86400_000).toISOString();
assert.equal(verifyEvaluationTrace(envelope(free),keys.publicKey).pending.length,1);

const edits:Record<string,(p:any)=>void>={
 'underreserved tokens':p=>{p.events[0].payload.reserved.tokens=1;p.trial.used.tokens=1;p.trial.agent_used['executive-bootstrap'].tokens=1;},
 'underreserved cost':p=>{p.events[0].payload.reserved.costUsd=0;p.trial.used.costUsd=0;p.trial.agent_used['executive-bootstrap'].costUsd=0;},
 'unpinned model':p=>p.events[0].payload.model='unapproved',
 'oversized input bound':p=>p.events[0].payload.maxInputTokens=ceiling.maxInputTokens+1,
 'missing input bound':p=>delete p.events[0].payload.maxInputTokens,
 'trial duration mismatch':p=>p.trial.spec.limits.elapsedMs=1,
 'agent duration mismatch':p=>p.trial.spec.agents['executive-bootstrap']={...p.trial.spec.agents['executive-bootstrap'],elapsedMs:1},
 'invocation token mismatch':p=>p.events.push({kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'model',tokens:1},created_at:at}),
 'invocation cost mismatch':p=>p.events.push({kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'model',costUsd:0},created_at:at}),
 'usage beyond reservation':p=>p.events.push({kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'model'},created_at:at},{kind:'FINISHED',reservation_id:p.events[0].reservation_id,payload:{status:'success',result:{model:'fixture',usage:{inputTokens:61,outputTokens:40}}},created_at:at}),
 'missing global counter':p=>delete p.trial.used.models,
 'non-numeric global counter':p=>p.trial.used.models='1',
 'extra reservation counter':p=>p.events[0].payload.reserved.unmetered=99,
 'zero-charge model':p=>{p.events[0].payload.reserved.models=0;p.trial.used.models=0;p.trial.agent_used['executive-bootstrap'].models=0;},
 'unknown reservation kind':p=>p.events[0].payload.kind='unmetered',
 'success without invocation':p=>p.events.push({kind:'FINISHED',reservation_id:p.events[0].reservation_id,payload:{status:'success'},created_at:at}),
 'invocation after completion':p=>p.events.push({kind:'FINISHED',reservation_id:p.events[0].reservation_id,payload:{status:'failure'},created_at:at},{kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'model',agentId:'executive-bootstrap'},created_at:at}),
 'invocation kind mismatch':p=>p.events.push({kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'tool',agentId:'executive-bootstrap'},created_at:at}),
 'expired agent invocation':p=>p.events.push({kind:'INVOKING',reservation_id:p.events[0].reservation_id,payload:{kind:'model',agentId:'executive-bootstrap'},created_at:p.trial.deadline}),
 'non-boolean seal':p=>p.trial.sealed='false'
};
// Regression: inserting an own JSON __proto__ key AFTER signing used to leave
// the signature valid because canonicalization silently discarded the key.
const unsigned=envelope(fixture());Object.defineProperty(unsigned.payload.trial,'__proto__',{value:{unsigned:'inserted after signing'},enumerable:true});
assert.throws(()=>verifyEvaluationTrace(unsigned,keys.publicKey),/AUTHENTICATION_FAILED/);
const ownProto=JSON.parse('{"__proto__":{"authorization":"untrusted"},"a":1}');
assert.equal(stableStringify(ownProto),'{"__proto__":{"authorization":"untrusted"},"a":1}');
assert.notEqual(sha256Hex(ownProto),sha256Hex({a:1}));
assert.equal(stableStringify({b:2,a:1}),'{"a":1,"b":2}','ordinary-object hash compatibility');
let accepted=0;
for(const [name,edit]of Object.entries(edits)){
 const p=structuredClone(fixture());edit(p);
 if(process.argv.includes('--reproduce')){try{verifyEvaluationTrace(envelope(p),keys.publicKey);console.log('INCORRECTLY ACCEPTED',name);accepted++;}catch{console.log('REJECTED',name);}}
 else assert.throws(()=>verifyEvaluationTrace(envelope(p),keys.publicKey),name);
}
const protocol=prepareCommercialEvaluation('a'.repeat(40));assert.equal(protocol.scenarios.length,3);assert(!JSON.stringify(protocol.scenarios).includes('expected'));assert.equal(protocol.liveCallsAuthorized,false);
const scenario=protocol.scenarios[0];assert(currentCommercialSource(scenario,scenario.sources[0]));for(const publishedAt of ['', 'invalid', '2030-01-01', '2020-01-01'])assert.equal(currentCommercialSource(scenario,{...scenario.sources[0],publishedAt}),false);
assert(Object.isFrozen(scenario.sources[0].data));
const directory=mkdtempSync(join(tmpdir(),'sam-commercial-cli-'));try{const output=join(directory,'prepared');const cli=spawnSync(process.execPath,['--import','tsx','apps/agents/src/evaluation/cli.ts','prepare-commercial','--commit','a'.repeat(40),'--output',output],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:10000});assert.equal(cli.status,0,cli.stderr);assert.equal(JSON.parse(readFileSync(join(output,'report.json'),'utf8')).result.corpusHash,protocol.corpusHash);}finally{rmSync(directory,{recursive:true,force:true});}
if(process.argv.includes('--reproduce')){process.exitCode=accepted?1:0;}else console.log(JSON.stringify({suite:'independent-trace-review',status:'PASS',negativeChecks:Object.keys(edits).length+1,classification:'MANUFACTURED_SIGNED_FIXTURES',liveCalls:0}));
