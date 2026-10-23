import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindProposedObligations,goalObligationProposalSchema} from '../../apps/kernel/src/goalObligations';
import {validateParameters} from '../../packages/tool-gateway/src/validation';
import {proposePlan} from '../../apps/brain/src/planner';
import {validateReadReview,type Source} from '../../apps/production/src/readGoalReview';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const objective='Compare supplied records and state missing meanings.';
const proposal={version:1,deliverables:[{id:'comparison',description:'Compare supplied records',fields:['value'],scope:{kind:'subset',description:'Supplied records only'},units:'UNKNOWN',vat:'UNKNOWN',period:'UNKNOWN',timeZone:'UNKNOWN'}],unresolved:['Unknown unit']};
test('shared planner requires visible validated obligations and runtime objective binding',async()=>{
 validateParameters(goalObligationProposalSchema,proposal);
 assert.equal(bindProposedObligations(proposal,objective).objectiveHash,sha256Hex(objective));
 assert.throws(()=>bindProposedObligations({...proposal,objectiveHash:sha256Hex('other')},objective),/PROPOSAL_INVALID/);
 let observed:any;
 const run=(assumptions:any)=>proposePlan({goalId:'fixture',objective,context:{},dataClassification:'INTERNAL',maxCostUsd:0.1,candidatePolicy:{singleCandidate:true,requireGoalObligations:true},availableCapabilities:[{capabilityId:'read',sideEffect:false,parameters:{type:'object'}}],gateway:{invoke:async(task:any)=>{observed=task;return {result:{output:{assumptions,steps:[{capabilityId:'read',params:{}}]}}};}} as any});
 await assert.rejects(run({}),/PROPOSAL_INVALID/);
 const plan=await run({goalObligations:proposal});
 assert.equal((plan.assumptions!.goalObligations as any).objectiveHash,sha256Hex(objective));
 assert.deepEqual(observed.input.contract.goalObligations.schema,goalObligationProposalSchema);
 await assert.rejects(run({goalObligations:proposal,verifiedDelegationPlans:['f'.repeat(64)]}),/RESERVED_ASSUMPTION/);
});
test('verified specialist interpretation alone cannot satisfy source obligations',()=>{
 const source:Source={id:'one',capabilityId:'reason',params:{},text:'A supplied record has value 2',truncated:false,actor:'specialist',retrievedAt:new Date().toISOString(),classification:'MODEL_INFERENCE'};
 const decision={status:'complete',summary:'Value 2',requirements:[{requirement:'Read records',fulfilled:true,evidenceIds:['one']}],findings:[{text:'Value 2',executionId:'one',quote:source.text}],limitations:[],steps:[]};
 assert.throws(()=>validateReadReview(structuredClone(decision),[source],objective,[]),/INTERPRETATION_NOT_SOURCE_EVIDENCE/);
 assert.equal(validateReadReview(structuredClone(decision),[{...source,classification:'RAW'}],objective,[]).status,'complete');
});

import {replayTransform,type Dataset} from '../../apps/brain/src/evidence/transforms';
import {collectionReceipt} from '../../apps/brain/src/evidence/collectionReceipts';
import {assessBoundObligation} from '../../apps/brain/src/evidence/fulfillment';
const page=(executionId:string,cursor:string|null,next:string|null,id:string,amount:string):Dataset=>{
 const receipt=collectionReceipt({id:executionId,execution_hash:sha256Hex(executionId),capability_id:'records.read',params:{query:'requested',cursor},result:{next}},[{id}],{cursorParameter:'cursor',nextCursorPath:['next'],identityPath:['id']});
 return {columns:{id:{kind:'text'},period:{kind:'text'},amount:{kind:'decimal',unit:'EUR',vat:'net'}},rows:[{values:{id,period:'2026-01',amount},citations:[{executionId,verificationId:'verified-'+executionId,row:0,sourceHash:sha256Hex(id)}]}],coverage:'unknown',timeZone:'UTC',limitations:[],sourceContexts:[{sourceHash:sha256Hex(id),collection:receipt}]};
};
test('union preserves exact decimal provenance and requested-query coverage without global completeness',()=>{
 const a=page('a',null,'page-2','alpha','2.10'),b=page('b','page-2',null,'beta','3.20');
 const plan={version:1 as const,source:'a',operations:[{op:'union' as const,right:'b'},{op:'group' as const,keys:['period'],aggregates:[{fn:'sum' as const,as:'total',field:'amount'}]}]};
 const result=replayTransform(plan,{a,b});assert.equal(result.dataset.rows[0].values.total,'5.3');assert.equal(result.dataset.rows[0].citations.length,2);assert.equal(result.dataset.coverage,'unknown');
 const obligation={...proposal.deliverables[0],units:'EUR',vat:'net',timeZone:'UTC',scope:{kind:'population' as const,filter:'Requested collection',query:{capabilityId:'records.read',params:{query:'requested'}}}};
 assert.equal(assessBoundObligation(result.dataset,obligation,['total']).structurallyReady,true);
 assert.equal(assessBoundObligation(replayTransform({...plan,operations:plan.operations.slice(1)},{a}).dataset,obligation,['total']).structurallyReady,false);
 assert.equal(assessBoundObligation(result.dataset,{...obligation,scope:{...obligation.scope,query:{...obligation.scope.query,params:{query:'other'}}}},['total']).structurallyReady,false);
 const filtered=replayTransform({...plan,operations:[{op:'union',right:'b'},{op:'filter',field:'id',compare:'eq',value:'alpha'},...plan.operations.slice(1)]},{a,b});
 assert.equal(assessBoundObligation(filtered.dataset,obligation,['total']).structurallyReady,false);
 assert.equal(assessBoundObligation(filtered.dataset,{...obligation,scope:{kind:'enumerated',identities:['alpha']}},['total']).structurallyReady,true);
 const unknown=structuredClone(result.dataset);delete unknown.columns.total.vat;
 assert.equal(assessBoundObligation(unknown,obligation,['total']).structurallyReady,false);
 assert.throws(()=>replayTransform(plan,{a,b:{...b,columns:{...b.columns,amount:{kind:'decimal',unit:'USD',vat:'net'}}}}),/UNION_SCHEMA_MISMATCH/);
});

import {derivedReviewText} from '../../apps/production/src/derivedReviewEvidence';
import {evaluationInputBytes} from '../../packages/model-gateway/src/evaluationAdapter';
test('bounded derived projection prioritizes every requested cell without inventing quotations',()=>{
 const columns:any=Object.fromEntries(Array.from({length:10},(_,i)=>['detail'+i,{kind:'text'}]));columns.wanted={kind:'decimal',unit:'count'};
 const rows=Array.from({length:3},(_,row)=>({values:{...Object.fromEntries(Array.from({length:10},(_,i)=>['detail'+i,'x'.repeat(30)])),wanted:String(row+1)},citations:[]}));
 const artifact:any={artifactId:'a'.repeat(64),output:{outputHash:'b'.repeat(64),dataset:{columns,rows,coverage:'unknown',timeZone:null,limitations:[]}}};
 const projection=derivedReviewText(artifact,2000,['wanted']);
 const cells=projection.quotes.map(q=>JSON.parse(q));assert.deepEqual(cells.filter(c=>c.field==='wanted').map(c=>c.value),['1','2','3']);assert(projection.omitted>0);
 for(const cell of cells)assert.equal(cell.value,(rows[cell.row].values as Record<string,string>)[cell.field]);
 assert(evaluationInputBytes({text:'\\'.repeat(500)})>Buffer.byteLength(JSON.stringify({text:'\\'.repeat(500)})),'evaluation framing and escaping must be budgeted before dispatch');
});
