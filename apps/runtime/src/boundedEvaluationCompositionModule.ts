import {LIVE_EVALUATION_ENABLED} from '../../../packages/model-gateway/src/evaluationPermit';
/** Optional existing-runtime entrypoint. Not selected by Render configuration.
 * Refuse before DB imports, file reads, environment or credential access.
 */
export default (async()=>{
 if(!LIVE_EVALUATION_ENABLED)throw Error('LIVE_EVALUATION_RELEASE_DISABLED');
 const env=process.env;
 const trialId=env.SAM_EVALUATION_TRIAL_ID,commit=env.SAM_EVALUATION_COMMIT;
 if(!trialId||!commit||!/^[0-9a-f]{40}$/.test(commit)||commit!==env.RENDER_GIT_COMMIT||!env.SAM_WORKER_ID)throw Error('EVALUATION_RUNTIME_CONFIG_REQUIRED');
 const {open}=await import('node:fs/promises');
 async function boundedFile(path:string|undefined){
  if(!path)throw Error('EVALUATION_APPROVAL_FILE_REQUIRED');const file=await open(path,'r');
  try{if(!(await file.stat()).isFile())throw Error('EVALUATION_APPROVAL_FILE_REQUIRED');
   const bytes=Buffer.alloc(32769);let size=0;
   while(size<bytes.length){const read=await file.read(bytes,size,bytes.length-size,size);if(!read.bytesRead)break;size+=read.bytesRead;}
   if(size>32768)throw Error('EVALUATION_APPROVAL_FILE_TOO_LARGE');return bytes.subarray(0,size).toString('utf8');
  }finally{await file.close();}
 }
 const approval=JSON.parse(await boundedFile(env.SAM_EVALUATION_APPROVAL_PATH));
 const trustedOwnerPublicKey=await boundedFile(env.SAM_EVALUATION_OWNER_PUBLIC_KEY_PATH);
 const {openEvaluationTrial}=await import('../../agents/src/evaluation/trial');
 const trial=await openEvaluationTrial(trialId,{payload:approval.payload,signature:approval.signature,trustedOwnerPublicKey});
 if(trial.spec.mode!=='live')throw Error('EVALUATION_LIVE_TRIAL_REQUIRED');
 const {prepareBoundedEvaluationComposition,frozenGoalEvaluationBundle}=await import('../../production/src/boundedEvaluationBootstrap');
 return prepareBoundedEvaluationComposition({trial,sourceBundle:frozenGoalEvaluationBundle(trial.spec.caseId),expectedCommit:commit,workerId:env.SAM_WORKER_ID,env});
})();
