import {LIVE_EVALUATION_ENABLED} from '../../packages/model-gateway/src/evaluationPermit';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {openLaunchJournal} from '../../apps/agents/src/evaluation/launchJournal';
import {runOperatorTrialLaunch,rehearseFixtureTrialLaunch,recoverTrialLaunch} from '../../apps/agents/src/evaluation/operatorLaunch';
/** No implicit credentials, signer, cloud API or administrative connection.
 * The named module is trusted operator code, not model-supplied input. */
async function main(){
 const [mode,requestPath,modulePath,directory,...extra]=process.argv.slice(2);
 if(extra.length||!['live','rehearsal','recover'].includes(mode)||!directory)throw Error('Usage: launch.ts live|rehearsal|recover REQUEST_JSON OPERATOR_MODULE NEW_JOURNAL_DIRECTORY');
 if(mode==='live'&&!LIVE_EVALUATION_ENABLED)throw Error('LIVE_EVALUATION_RELEASE_DISABLED');
 const request=JSON.parse(await readFile(resolve(requestPath),'utf8'));
 const operator=await import(pathToFileURL(resolve(modulePath)).href);
 const bindings=await (operator.createLaunchBindings??operator.default?.createLaunchBindings)?.(request);
 if(!bindings?.admin)throw Error('LAUNCH_OPERATOR_EXECUTOR_REQUIRED');
 const opened=await openLaunchJournal(directory,mode==='recover'),controller=new AbortController();
 const abort=()=>controller.abort();process.once('SIGINT',abort);process.once('SIGTERM',abort);
 try{const all={...bindings,journal:opened.journal,signal:controller.signal};
  const result=await (mode==='live'?runOperatorTrialLaunch:mode==='rehearsal'?rehearseFixtureTrialLaunch:recoverTrialLaunch)(request,all);
  await writeFile(join(resolve(directory),'result.json'),JSON.stringify(result,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify(result));if(!result.restored||'outcome' in result&&result.outcome==='failed')process.exitCode=1;
 }finally{process.removeListener('SIGINT',abort);process.removeListener('SIGTERM',abort);await opened.close();await bindings.close?.();}
}
main().catch(()=>{console.error('LAUNCH_REFUSED_OR_UNCERTAIN: preserve journal; use scoped recovery, never retry creation');process.exitCode=1;});
