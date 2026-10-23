const fs=require('node:fs'),path=require('node:path');
const [source,metadata,commit]=process.argv.slice(2);
if(!source||!metadata||!commit)throw Error('Usage: verify-traces.cjs SOURCE METADATA COMMIT');
const {verifyEvaluationTrace,scoreAuthenticatedEvaluation}=require(path.join(source,'apps/agents/src/evaluation/trace.ts'));
for(const file of fs.readdirSync(metadata).filter(n=>n.endsWith('-trace.json')).sort()){
 const name=file.slice(0,-11),publicPath=path.join(metadata,(name==='evaluation-signed'?'evaluation-fixture':name)+'-public.pem');
 if(!fs.existsSync(publicPath))throw Error('Missing public key: '+name);
 const trace=JSON.parse(fs.readFileSync(path.join(metadata,file),'utf8')),key=fs.readFileSync(publicPath,'utf8');
 const checked=verifyEvaluationTrace(trace,key),score=scoreAuthenticatedEvaluation(trace,key,commit);
 console.log(JSON.stringify({name,signature:'VERIFIED',events:checked.events.length,status:score.status,classification:score.classification,declaredCompletedGoals:score.declaredCompletedGoals,liveReasoningValidated:score.liveReasoningValidated}));
}
