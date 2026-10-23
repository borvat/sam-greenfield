const fs=require('node:fs'),path=require('node:path');
const [source,metadata]=process.argv.slice(2);
if(!source||!metadata)throw Error('Usage: verify-family-traces.cjs SOURCE_CHECKOUT METADATA_DIRECTORY');
const {verifyEvaluationTrace,scoreAuthenticatedEvaluation}=require(path.join(source,'apps/agents/src/evaluation/trace.ts'));
for(const name of ['goal-family','source-persistence-crash']){
 const trace=JSON.parse(fs.readFileSync(path.join(metadata,name+'-trace.json'),'utf8'));
 const key=fs.readFileSync(path.join(metadata,name+'-public.pem'),'utf8');
 const checked=verifyEvaluationTrace(trace,key),score=scoreAuthenticatedEvaluation(trace,key,'5bfe7b8342756623f77f4c3d158a12b7435d32d1');
 console.log(JSON.stringify({name,signature:'VERIFIED',events:checked.events.length,status:score.status,classification:score.classification,declaredCompletedGoals:score.declaredCompletedGoals,liveReasoningValidated:score.liveReasoningValidated}));
}
