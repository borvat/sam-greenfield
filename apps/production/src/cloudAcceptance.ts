import {execFileSync} from 'node:child_process';
export function fixedCloudRevision(expected:string,cwd=process.cwd()){
 const run=(...args:string[])=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
 if(!/^[0-9a-f]{40}$/.test(expected)||run('rev-parse','HEAD')!==expected||run('status','--porcelain','--untracked-files=all').split('\n').filter(line=>line&&line!=='?? node_modules').length)throw new Error('CLOUD_REVISION_NOT_FIXED');
 return expected;
}
export function cloudPrerequisites(env:NodeJS.ProcessEnv){
 const required=['SAM_MCP_SECRET_GITHUB','SAM_MCP_SECRET_RENDER','SAM_CLOUD_DB_URL','SAM_CLOUD_MANIFEST','SAM_CLOUD_SCOPE','SAM_CLOUD_REVISION'];
 const missing=required.filter(k=>!env[k]?.trim());
 if(!['OPENAI','DEEPSEEK','ANTHROPIC','GOOGLE','QWEN'].some(p=>env[p+'_API_KEY']&&env[p+'_MODEL']))missing.push('LIVE_MODEL_CREDENTIAL_AND_MODEL');
 return missing;
}
export type CloudTrial={goalId:string;state:string;liveChoices:number;modelSelectedAllExecuted:boolean;githubMemory:number;renderMemory:number;githubVerified:number;renderVerified:number;unverified:number;memory:number;report:boolean};
/** Fail closed; partial runs, selected tools, fixtures and transport health are never acceptance. */
export function assessCloudTrials(trials:CloudTrial[],required=10){
 return trials.length===required&&new Set(trials.map(t=>t.goalId)).size===required&&trials.every(t=>t.state==='COMPLETED'&&t.liveChoices>0&&t.modelSelectedAllExecuted&&t.githubMemory>0&&t.renderMemory>0&&t.githubVerified>0&&t.renderVerified>0&&t.unverified===0&&t.memory>0&&t.report);
}
