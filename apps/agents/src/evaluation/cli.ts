import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {prepareEvaluation,scoreEvaluation} from './harness';
import {scoreAuthenticatedEvaluation} from './trace';
const help='npm run evaluate:specialists -- prepare --commit SHA --output NEW_DIRECTORY\n'+
 'npm run evaluate:specialists -- score --commit SHA --input TRACE_JSON --output NEW_DIRECTORY\n'+
 'npm run evaluate:specialists -- score-authenticated --commit SHA --input SIGNED_TRACE --trusted-key PUBLIC_KEY_PEM --output NEW_DIRECTORY\n'+
 'Offline preparation/scoring only. Live invocation remains disabled; fixture scores never validate model quality.';
function main(){
 const [command,...args]=process.argv.slice(2);
 // Deny before reading inputs, credentials or loading any provider transport.
 if(command==='live'||args.includes('--live'))throw Error('LIVE_EVALUATION_NOT_AUTHORIZED: reviewed live gateway adapter and separate scope/spend approval required');
 if(command==='--help'){console.log(help);return;}
 if(!['prepare','score','score-authenticated'].includes(command))throw Error(help);
 const options:Record<string,string>={};for(let i=0;i<args.length;i+=2){
  const key=args[i];if(!['--commit','--input','--output','--trusted-key'].includes(key)||!args[i+1]||options[key])throw Error('INVALID_EVALUATION_ARGUMENT');options[key]=args[i+1];
 }
 if(!options['--output']||!options['--commit']||command!=='prepare'&&!options['--input']||command==='prepare'&&options['--input']||command==='score-authenticated'&&!options['--trusted-key'])throw Error(help);
 const plan=prepareEvaluation(options['--commit']);
 const startedAt=new Date().toISOString();let inputHash:string|null=null;
 const result=command==='prepare'?plan:(()=>{
  const bytes=readFileSync(options['--input']);if(bytes.length>(command==='score-authenticated'?8:2)*1024*1024)throw Error('TRACE_TOO_LARGE');
  inputHash=createHash('sha256').update(bytes).digest('hex');return command==='score-authenticated'?
   scoreAuthenticatedEvaluation(JSON.parse(bytes.toString('utf8')),readFileSync(options['--trusted-key'],'utf8'),options['--commit']):scoreEvaluation(JSON.parse(bytes.toString('utf8')),options['--commit']);
 })();
 const report={command,startedAt,completedAt:new Date().toISOString(),runtime:process.version,inputHash,result};
 const output=resolve(options['--output']);mkdirSync(output,{mode:0o700});
 const json=JSON.stringify(report,null,2)+'\n';writeFileSync(join(output,'report.json'),json,{mode:0o600});
 const markdown=['# SAM specialist evaluation', '',`Command: ${command}; commit: ${plan.commit}`, '',
  `Classification: ${result.classification}`, '',
  'This offline command invoked no models. Live reasoning: NOT VALIDATED. Independent human review: PENDING.', '',
  'status' in result?`Offline trace score: ${result.status}`:'Preparation complete; no model was invoked.', '',
  ...('checks' in result?result.checks.map(c=>`- ${c.name}: ${c.status} — ${c.detail}`):plan.requiredGates.map(g=>'- '+g)), '',
  command==='score-authenticated'?'Trace authenticated against the separately supplied trusted public key; model quality still requires independent review.':'Machine report contains run times, runtime, corpus/trace hashes, counters and per-check results. Captured trace provenance is unverified.',''].join('\n');
 writeFileSync(join(output,'report.md'),markdown,{mode:0o600});
 writeFileSync(join(output,'SHA256SUMS'),[['report.json',json],['report.md',markdown]].map(([name,data])=>createHash('sha256').update(data).digest('hex')+'  '+name).join('\n')+'\n',{mode:0o600});
 console.log(output);if('status' in result&&result.status==='FAIL')process.exitCode=1;
}
try{main();}catch(error){console.error(error instanceof Error?error.message:'EVALUATION_FAILED');process.exitCode=1;}
